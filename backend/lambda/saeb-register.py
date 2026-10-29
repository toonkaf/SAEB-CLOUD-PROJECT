import json
import os
import re
import hashlib
import secrets
from datetime import datetime, timezone
import boto3

dynamodb = boto3.resource('dynamodb')
TABLE_NAME = os.environ.get('USERS_TABLE', 'saeb-users')
table = dynamodb.Table(TABLE_NAME)

CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization',
    'Access-Control-Allow-Methods': 'OPTIONS,POST'
}

def hash_password(password: str) -> str:
    # เข้ารหัสรหัสผ่านด้วย PBKDF2 + Salt แบบความปลอดภัยสูง
    salt = secrets.token_hex(16)
    pwd_hash = hashlib.pbkdf2_hmac('sha256', password.encode('utf-8'), salt.encode('utf-8'), 100000)
    return f"{salt}${pwd_hash.hex()}"

def lambda_handler(event, context):
    try:
        body = json.loads(event.get('body', '{}'))
        student_id = body.get('student_id', '').strip().lower()
        email = body.get('email', '').strip().lower()
        password = body.get('password', '')

        # 1. ตรวจสอบข้อมูลนำเข้า
        if not student_id or not password or not email:
            return {
                'statusCode': 400,
                'headers': CORS_HEADERS,
                'body': json.dumps({'error': 'student_id, email, and password are required'})
            }

        # 2. ตรวจสอบรูปแบบอีเมล KMITL ด้วย Regex (แก้ไขมาตรวจสอบที่ email)
        email_regex = r'^[a-zA-Z0-9._%+-]+@kmitl\.ac\.th$'
        if not re.match(email_regex, email):
            return {
                'statusCode': 400,
                'headers': CORS_HEADERS,
                'body': json.dumps({'error': 'Invalid email format. Must be @kmitl.ac.th'})
            }

        if len(password) < 6:
            return {
                'statusCode': 400,
                'headers': CORS_HEADERS,
                'body': json.dumps({'error': 'Password must be at least 6 characters long'})
            }

        # 3. ตรวจสอบผู้ใช้ซ้ำใน DynamoDB
        existing_user = table.get_item(Key={'student_id': student_id})
        if 'Item' in existing_user:
            return {
                'statusCode': 400,
                'headers': CORS_HEADERS,
                'body': json.dumps({'error': 'User already registered'})
            }

        # 4. บันทึกข้อมูลพร้อม email ลง DynamoDB
        hashed_pwd = hash_password(password)
        created_at = datetime.now(timezone.utc).isoformat()

        table.put_item(
            Item={
                'student_id': student_id,
                'email': email,
                'password_hash': hashed_pwd,
                'created_at': created_at
            }
        )

        return {
            'statusCode': 201,
            'headers': CORS_HEADERS,
            'body': json.dumps({
                'message': 'Registration successful',
                'student_id': student_id
            })
        }

    except Exception as e:
        return {
            'statusCode': 500,
            'headers': CORS_HEADERS,
            'body': json.dumps({'error': str(e)})
        }