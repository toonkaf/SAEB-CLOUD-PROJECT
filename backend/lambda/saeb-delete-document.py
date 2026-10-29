import json
import os
import time
import hmac
import hashlib
import base64
import boto3

TABLE_NAME = os.environ.get('TABLE_NAME', 'saeb-documents')               # <<< ตรวจ
BUCKET_NAME = os.environ.get('BUCKET_NAME', 'saeb-documents-group-2026')  # <<< ตรวจ
JWT_SECRET = os.environ.get('JWT_SECRET', 'saeb-kmitl-secret-key-2026')                             # <<< ต้องตั้ง

dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table(TABLE_NAME)
s3 = boto3.client('s3')

CORS_HEADERS = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization,X-Amz-Date,X-Api-Key,X-Amz-Security-Token',
    'Access-Control-Allow-Methods': 'OPTIONS,DELETE'
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


def owner_of(item):
    return str(item.get('uploader_id') or item.get('student_id') or '').lower()


def lambda_handler(event, context):
    if event.get('httpMethod') == 'OPTIONS':
        return resp(200, {'message': 'CORS preflight OK'})

    try:
        current_user = get_current_user(event)
        if not current_user:
            return resp(401, {'message': 'Unauthorized'})

        document_id = (event.get('pathParameters') or {}).get('id')
        if not document_id:
            return resp(400, {'message': 'Missing document_id parameter'})

        item = table.get_item(Key={'document_id': document_id}).get('Item')
        if not item:
            return resp(404, {'message': 'Document not found'})

        # เฉพาะเจ้าของเท่านั้นที่ลบได้
        if owner_of(item) != str(current_user).lower():
            return resp(403, {'message': 'Forbidden: you can only delete your own documents'})

        file_key = item.get('file_key') or item.get('s3Key') or item.get('s3_key')
        if file_key and BUCKET_NAME:
            try:
                s3.delete_object(Bucket=BUCKET_NAME, Key=file_key)
            except Exception as s3_err:
                print(f"Warning: could not delete S3 object: {s3_err}")

        table.delete_item(Key={'document_id': document_id})
        return resp(200, {'message': 'Document deleted successfully', 'id': document_id})

    except Exception as e:
        print(f"Error deleting document: {e}")
        return resp(500, {'message': 'Internal server error'})