import json
import os
import re
import uuid
import time
import hmac
import hashlib
import base64
import boto3
from botocore.config import Config

TABLE_NAME = os.environ.get('TABLE_NAME', 'saeb-documents')              # <<< ตรวจ
BUCKET_NAME = os.environ.get('BUCKET_NAME', 'saeb-documents-group-2026') # <<< ตรวจ
JWT_SECRET = os.environ.get('JWT_SECRET', 'saeb-kmitl-secret-key-2026')                            # <<< ต้องตั้ง
DOWNLOAD_OWNER_ONLY = os.environ.get('DOWNLOAD_OWNER_ONLY', 'false').lower() == 'true'
URL_EXPIRES_SECONDS = 300

dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table(TABLE_NAME)
s3_client = boto3.client('s3', config=Config(signature_version='s3v4'))

CORS_HEADERS = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization,X-Amz-Date,X-Api-Key,X-Amz-Security-Token',
    'Access-Control-Allow-Methods': 'OPTIONS,GET,POST'
}


def resp(status, body):
    return {'statusCode': status, 'headers': CORS_HEADERS, 'body': json.dumps(body)}


def _b64d(s):
    return base64.urlsafe_b64decode((s + '=' * (-len(s) % 4)).encode('utf-8'))


def get_current_user(event):
    """คืน student_id ถ้า token ถูกต้องและไม่หมดอายุ ไม่งั้นคืน None"""
    try:
        if not JWT_SECRET:
            return None
        headers = event.get('headers') or {}
        auth = headers.get('Authorization') or headers.get('authorization') or ''
        if not auth.startswith('Bearer '):
            return None
        h, p, s = auth[7:].strip().split('.')
        expected = hmac.new(JWT_SECRET.encode(), f"{h}.{p}".encode(), hashlib.sha256).digest()
        if not hmac.compare_digest(expected, _b64d(s)):
            return None
        payload = json.loads(_b64d(p))
        if payload.get('exp', 0) < int(time.time()):
            return None
        return payload.get('student_id')
    except Exception:
        return None


def sanitize_filename(name):
    name = os.path.basename(str(name))
    name = re.sub(r'[^A-Za-z0-9._-]', '_', name)[:100] or 'document.pdf'
    if not name.lower().endswith('.pdf'):
        name += '.pdf'
    return name


def owner_of(item):
    # รองรับเอกสารที่สร้างจาก backend Express เวอร์ชันเก่า (student_id)
    return str(item.get('uploader_id') or item.get('student_id') or '').lower()


def key_of(item):
    return item.get('file_key') or item.get('s3Key') or item.get('s3_key')


def lambda_handler(event, context):
    http_method = event.get('httpMethod', '')
    if http_method == 'OPTIONS':
        return resp(200, {'message': 'CORS preflight OK'})

    try:
        current_user = get_current_user(event)
        if not current_user:
            return resp(401, {'message': 'Unauthorized'})

        path_params = event.get('pathParameters') or {}

        # ---------- UPLOAD (POST /upload-url) ----------
        if http_method == 'POST' or not path_params:
            body = {}
            if event.get('body'):
                try:
                    body = json.loads(event['body'])
                except Exception:
                    body = {}
            query_params = event.get('queryStringParameters') or {}
            raw_name = (body.get('fileName') or body.get('file_name')
                        or query_params.get('fileName') or 'document.pdf')
            file_key = f"uploads/{str(uuid.uuid4())[:8]}-{sanitize_filename(raw_name)}"

            upload_url = s3_client.generate_presigned_url(
                'put_object',
                Params={'Bucket': BUCKET_NAME, 'Key': file_key, 'ContentType': 'application/pdf'},
                ExpiresIn=URL_EXPIRES_SECONDS
            )
            return resp(200, {'uploadUrl': upload_url, 's3Key': file_key, 'file_key': file_key})

        # ---------- DOWNLOAD (GET /documents/{id}/download-url) ----------
        document_id = path_params.get('id')
        if not document_id:
            return resp(400, {'message': 'Missing document_id parameter'})

        item = table.get_item(Key={'document_id': document_id}).get('Item')
        if not item:
            return resp(404, {'message': 'Document not found'})

        if DOWNLOAD_OWNER_ONLY and \
                owner_of(item) != str(current_user).lower():
            return resp(403, {'message': 'Forbidden'})

        file_key = key_of(item)
        if not file_key:
            return resp(400, {'message': 'file_key not found in item'})

        download_url = s3_client.generate_presigned_url(
            'get_object',
            Params={'Bucket': BUCKET_NAME, 'Key': file_key,
                    'ResponseContentType': 'application/pdf',
                    'ResponseContentDisposition': 'inline'},
            ExpiresIn=URL_EXPIRES_SECONDS
        )
        return resp(200, {'url': download_url})

    except Exception as e:
        print(f"Error: {e}")
        return resp(500, {'message': 'Internal server error'})