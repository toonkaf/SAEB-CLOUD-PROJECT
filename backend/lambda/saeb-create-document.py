import json
import os
import uuid
import time
import hmac
import hashlib
import base64
from datetime import datetime
import boto3

TABLE_NAME = os.environ.get('TABLE_NAME', 'saeb-documents')   # <<< ตรวจ
JWT_SECRET = os.environ.get('JWT_SECRET', 'saeb-kmitl-secret-key-2026')                 # <<< ต้องตั้ง
MAX_FILE_SIZE_MB = 20                                         # <<< ต้องตรงกับ MAX_SIZE ใน frontend (documents.js = 20MB)

dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table(TABLE_NAME)

CORS_HEADERS = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization,X-Amz-Date,X-Api-Key,X-Amz-Security-Token',
    'Access-Control-Allow-Methods': 'OPTIONS,POST'
}


def resp(status, body):
    return {'statusCode': status, 'headers': CORS_HEADERS, 'body': json.dumps(body)}


def _b64d(s):
    return base64.urlsafe_b64decode((s + '=' * (-len(s) % 4)).encode('utf-8'))


def get_current_user(event):
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


def lambda_handler(event, context):
    if event.get('httpMethod') == 'OPTIONS':
        return resp(200, {'message': 'CORS preflight OK'})

    try:
        current_user = get_current_user(event)
        if not current_user:
            return resp(401, {'error': 'Unauthorized'})

        raw_body = event.get('body') or '{}'
        body = json.loads(raw_body) if isinstance(raw_body, str) else raw_body

        title = body.get('title')
        subject_code = body.get('subject_code')
        file_key = body.get('file_key')
        uploader_id = current_user  # ใช้จาก token เท่านั้น

        file_size_raw = body.get('file_size') or body.get('size') or body.get('fileSize') or 0
        try:
            file_size = int(file_size_raw)
        except (ValueError, TypeError):
            file_size = 0

        if not title or not subject_code or not file_key:
            return resp(400, {'error': 'Missing required fields: title, subject_code, or file_key'})

        if not str(file_key).startswith('uploads/'):
            return resp(400, {'error': 'Invalid file_key'})

        if file_size > MAX_FILE_SIZE_MB * 1024 * 1024:
            return resp(400, {'error': f'File too large (max {MAX_FILE_SIZE_MB}MB)'})

        document_id = f"doc_{str(uuid.uuid4())[:8]}"
        created_at = datetime.utcnow().isoformat() + "Z"

        item = {
            'document_id': document_id,
            'title': title,
            'subject_code': subject_code,
            'file_key': file_key,
            'file_size': file_size,
            'uploader_id': uploader_id,
            'created_at': created_at,
            'summary_text': ""
        }
        table.put_item(Item=item)

        return resp(201, {
            'message': 'Document registered successfully',
            'document_id': document_id,
            'data': item
        })

    except Exception as e:
        print(f"Error: {e}")
        return resp(500, {'error': 'Internal server error'})