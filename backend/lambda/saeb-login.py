import json
import os
import hashlib
import hmac
import base64
import time
import boto3

dynamodb = boto3.resource('dynamodb')
TABLE_NAME = os.environ.get('USERS_TABLE', 'saeb-users')   # <<< ตรวจชื่อตาราง
JWT_SECRET = os.environ.get('JWT_SECRET', 'saeb-kmitl-secret-key-2026')              # <<< ต้องตั้งใน Environment variables
table = dynamodb.Table(TABLE_NAME)

CORS_HEADERS = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization',
    'Access-Control-Allow-Methods': 'OPTIONS,POST'
}


def verify_password(stored_password_hash: str, provided_password: str) -> bool:
    try:
        salt, stored_hash = stored_password_hash.split('$')
        pwd_hash = hashlib.pbkdf2_hmac('sha256', provided_password.encode('utf-8'),
                                       salt.encode('utf-8'), 100000)
        return hmac.compare_digest(pwd_hash.hex(), stored_hash)
    except Exception:
        return False


def generate_jwt(student_id: str) -> str:
    header = {"alg": "HS256", "typ": "JWT"}
    payload = {
        "student_id": student_id,
        "iat": int(time.time()),
        "exp": int(time.time()) + (24 * 3600)  # หมดอายุใน 24 ชั่วโมง
    }

    def b64url(data: bytes) -> str:
        return base64.urlsafe_b64encode(data).rstrip(b'=').decode('utf-8')

    eh = b64url(json.dumps(header, separators=(',', ':')).encode('utf-8'))
    ep = b64url(json.dumps(payload, separators=(',', ':')).encode('utf-8'))
    sig = hmac.new(JWT_SECRET.encode('utf-8'), f"{eh}.{ep}".encode('utf-8'), hashlib.sha256).digest()
    return f"{eh}.{ep}.{b64url(sig)}"


def lambda_handler(event, context):
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS_HEADERS,
                'body': json.dumps({'message': 'CORS preflight OK'})}

    try:
        if not JWT_SECRET:
            print("ERROR: JWT_SECRET environment variable is not set")
            return {'statusCode': 500, 'headers': CORS_HEADERS,
                    'body': json.dumps({'error': 'Server configuration error'})}

        body = json.loads(event.get('body') or '{}')
        student_id = body.get('student_id', '').strip().lower()
        password = body.get('password', '')

        if not student_id or not password:
            return {'statusCode': 400, 'headers': CORS_HEADERS,
                    'body': json.dumps({'error': 'student_id and password are required'})}

        user = table.get_item(Key={'student_id': student_id}).get('Item')

        if not user or not verify_password(user['password_hash'], password):
            return {'statusCode': 401, 'headers': CORS_HEADERS,
                    'body': json.dumps({'error': 'Invalid student_id or password'})}

        token = generate_jwt(student_id)
        return {
            'statusCode': 200,
            'headers': CORS_HEADERS,
            'body': json.dumps({'message': 'Login successful', 'token': token, 'student_id': student_id})
        }

    except Exception as e:
        print(f"Login error: {e}")
        return {'statusCode': 500, 'headers': CORS_HEADERS,
                'body': json.dumps({'error': 'Internal server error'})}