import json
import os
import time
import hmac
import hashlib
import base64
import urllib.request
import urllib.error
import boto3

TABLE_NAME = os.environ.get('TABLE_NAME', 'saeb-documents').strip()   # <<< ตรวจ
GEMINI_API_KEY = os.environ.get('GEMINI_API_KEY', '').strip()          # <<< ต้องมีอยู่แล้ว
JWT_SECRET = os.environ.get('JWT_SECRET', 'saeb-kmitl-secret-key-2026')                          # <<< ต้องตั้ง
GEMINI_MODEL = os.environ.get('GEMINI_MODEL', 'gemini-3.6-flash')      # <<< ตรวจชื่อโมเดล

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


def call_gemini_api(prompt_text):
    url = f"https://generativelanguage.googleapis.com/v1beta/models/{GEMINI_MODEL}:generateContent"
    payload = {"contents": [{"parts": [{"text": prompt_text}]}]}
    headers = {'Content-Type': 'application/json', 'x-goog-api-key': GEMINI_API_KEY}

    req = urllib.request.Request(url, data=json.dumps(payload).encode('utf-8'),
                                 headers=headers, method='POST')
    try:
        with urllib.request.urlopen(req, timeout=25) as response:
            result = json.loads(response.read().decode('utf-8'))
            return result['candidates'][0]['content']['parts'][0]['text']
    except urllib.error.HTTPError as e:
        error_body = e.read().decode('utf-8')
        print(f"Gemini API Error Detail ({e.code}): {error_body}")
        raise Exception(f"Gemini API Error ({e.code})")


def lambda_handler(event, context):
    if event.get('httpMethod') == 'OPTIONS':
        return resp(200, {'message': 'CORS preflight OK'})

    try:
        if not get_current_user(event):
            return resp(401, {'error': 'Unauthorized'})

        raw_body = event.get('body') or '{}'
        body = json.loads(raw_body) if isinstance(raw_body, str) else raw_body
        document_id = body.get('document_id')

        if not document_id:
            return resp(400, {'error': 'Missing document_id'})

        item = table.get_item(Key={'document_id': document_id}).get('Item')
        if not item:
            return resp(404, {'error': 'Document not found'})

        # ถ้ามี Cache ตอบกลับทันที (ประหยัดค่า API)
        if item.get('summary_text'):
            return resp(200, {'document_id': document_id,
                              'summary_text': item['summary_text'],
                              'is_cached': True})

        title = item.get('title', '')
        subject_code = item.get('subject_code', '')
        prompt = (f"ช่วยสรุปเนื้อหาและประเด็นสำคัญสำหรับชีทเรียนวิชา {subject_code} "
                  f"ในหัวข้อ '{title}' ให้กระชับ อ่านเข้าใจง่าย ออกมาเป็นข้อๆ ภาษาไทย")

        summary_result = call_gemini_api(prompt)

        table.update_item(
            Key={'document_id': document_id},
            UpdateExpression="SET summary_text = :s",
            ExpressionAttributeValues={':s': summary_result}
        )

        return resp(200, {'document_id': document_id,
                          'summary_text': summary_result,
                          'is_cached': False})

    except Exception as e:
        print(f"Error: {e}")
        return resp(500, {'error': 'Internal server error'})