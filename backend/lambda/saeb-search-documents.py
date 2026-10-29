import json
import os
import time
import hmac
import hashlib
import base64
import boto3
from decimal import Decimal
from boto3.dynamodb.conditions import Attr

TABLE_NAME = os.environ.get('TABLE_NAME', 'saeb-documents')   # <<< ตรวจ
JWT_SECRET = os.environ.get('JWT_SECRET', 'saeb-kmitl-secret-key-2026')                 # <<< ต้องตั้ง

dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table(TABLE_NAME)


class DecimalEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, Decimal):
            return int(obj) if obj % 1 == 0 else float(obj)
        return super(DecimalEncoder, self).default(obj)


CORS_HEADERS = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization,X-Amz-Date,X-Api-Key,X-Amz-Security-Token',
    'Access-Control-Allow-Methods': 'OPTIONS,GET'
}


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
        return {'statusCode': 200, 'headers': CORS_HEADERS,
                'body': json.dumps({'message': 'CORS preflight OK'})}

    try:
        if not get_current_user(event):
            return {'statusCode': 401, 'headers': CORS_HEADERS,
                    'body': json.dumps({'error': 'Unauthorized'})}

        query_params = event.get('queryStringParameters') or {}
        if not isinstance(query_params, dict):
            query_params = {}

        uploader_id = query_params.get('uploader_id')

        scan_kwargs = {}
        if uploader_id and str(uploader_id).strip().lower() not in ['undefined', 'null', '']:
            scan_kwargs['FilterExpression'] = (Attr('uploader_id').eq(uploader_id) |
                                               Attr('student_id').eq(uploader_id))

        response = table.scan(**scan_kwargs)
        items = response.get('Items', [])

        while 'LastEvaluatedKey' in response:
            scan_kwargs['ExclusiveStartKey'] = response['LastEvaluatedKey']
            response = table.scan(**scan_kwargs)
            items.extend(response.get('Items', []))

        return {
            'statusCode': 200,
            'headers': CORS_HEADERS,
            'body': json.dumps({'documents': items, 'count': len(items)}, cls=DecimalEncoder)
        }

    except Exception as e:
        print(f"Error fetching documents: {e}")
        return {'statusCode': 500, 'headers': CORS_HEADERS,
                'body': json.dumps({'error': 'Internal server error'})}