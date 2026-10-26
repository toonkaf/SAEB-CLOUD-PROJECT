const express = require('express');
const crypto = require('crypto');
const { PutCommand, ScanCommand, GetCommand, DeleteCommand } = require('@aws-sdk/lib-dynamodb');
const {
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
} = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const { docClient } = require('../config/aws');
const { s3 } = require('../config/s3');
const requireAuth = require('../middleware/auth');

const router = express.Router();

// ตาราง saeb-documents: Partition Key = document_id (String) ไม่มี Sort Key
// เจ้าของเอกสารเก็บในฟิลด์ student_id ธรรมดา
const DOCUMENTS_TABLE = 'saeb-documents';
const BUCKET = process.env.S3_BUCKET_NAME;
const MAX_SIZE = 20 * 1024 * 1024; // 20 MB
const URL_TTL_SECONDS = 300;

router.use(requireAuth);

// แปลง item ใน DynamoDB เป็นรูปแบบที่ส่งให้ frontend (ไม่เปิดเผย s3_key)
function toDto(item) {
  return {
    id: item.document_id,
    title: item.title,
    subjectCode: item.subject_code,
    fileName: item.file_name,
    size: item.size,
    uploadedAt: item.uploaded_at,
  };
}

// DTO สำหรับหน้า Main ที่ทุกคนเห็นเอกสารของกันและกัน
function toPublicDto(item) {
  return { ...toDto(item), author: item.student_id };
}

// 1. ขอ presigned URL เพื่ออัพโหลด PDF ขึ้น S3 โดยตรง
router.post('/upload-url', async (req, res) => {
  const { fileName, size } = req.body;

  if (typeof fileName !== 'string' || !fileName.toLowerCase().endsWith('.pdf')) {
    return res.status(400).json({ message: 'อัพโหลดได้เฉพาะไฟล์ .pdf เท่านั้น' });
  }
  if (!Number.isInteger(size) || size <= 0 || size > MAX_SIZE) {
    return res.status(400).json({ message: 'ขนาดไฟล์ต้องไม่เกิน 20 MB' });
  }

  try {
    const s3Key = `documents/${req.user.student_id}/${crypto.randomUUID()}.pdf`;
    const uploadUrl = await getSignedUrl(
      s3,
      new PutObjectCommand({
        Bucket: BUCKET,
        Key: s3Key,
        ContentType: 'application/pdf',
        ContentLength: size, // ล็อกขนาดไว้ ส่งไฟล์ใหญ่กว่าที่แจ้งไม่ได้
      }),
      { expiresIn: URL_TTL_SECONDS }
    );

    return res.status(200).json({ uploadUrl, s3Key });
  } catch (error) {
    console.error('Upload URL Error:', error);
    return res.status(500).json({ message: 'ไม่สามารถสร้างลิงก์อัพโหลดได้' });
  }
});

// 2. บันทึก metadata หลังอัพโหลดขึ้น S3 เสร็จ
router.post('/', async (req, res) => {
  const { title, subjectCode = '', s3Key, fileName } = req.body;
  const { student_id } = req.user;

  if (typeof title !== 'string' || !title.trim()) {
    return res.status(400).json({ message: 'กรุณากรอกชื่อเอกสาร' });
  }
  if (typeof fileName !== 'string' || typeof s3Key !== 'string') {
    return res.status(400).json({ message: 'ข้อมูลไม่ครบถ้วน' });
  }
  // กันการแอบอ้างไฟล์ของคนอื่น: key ต้องอยู่ใต้โฟลเดอร์ของผู้ใช้เอง
  if (!s3Key.startsWith(`documents/${student_id}/`)) {
    return res.status(403).json({ message: 'ไม่มีสิทธิ์ใช้ไฟล์นี้' });
  }

  try {
    // ยืนยันว่าไฟล์ขึ้น S3 จริง และใช้ขนาดจาก S3 ไม่เชื่อค่าจาก client
    let head;
    try {
      head = await s3.send(new HeadObjectCommand({ Bucket: BUCKET, Key: s3Key }));
    } catch {
      return res.status(400).json({ message: 'ไม่พบไฟล์ที่อัพโหลด กรุณาลองใหม่' });
    }

    const item = {
      student_id,
      document_id: crypto.randomUUID(),
      title: title.trim().slice(0, 200),
      subject_code: String(subjectCode).trim().slice(0, 20),
      file_name: fileName.slice(0, 255),
      size: head.ContentLength,
      s3_key: s3Key,
      uploaded_at: new Date().toISOString(),
    };

    await docClient.send(new PutCommand({ TableName: DOCUMENTS_TABLE, Item: item }));
    return res.status(201).json({ message: 'อัพโหลดเอกสารสำเร็จ', document: toDto(item) });
  } catch (error) {
    console.error('Save Document Error:', error);
    return res.status(500).json({ message: 'ไม่สามารถบันทึกเอกสารได้' });
  }
});

// 3. รายการเอกสารของผู้ใช้ที่ล็อกอิน (ใหม่สุดก่อน)
// ตารางใช้ document_id เป็น key จึง Query ด้วย student_id ไม่ได้ ต้อง Scan แล้วกรอง
// TODO: ถ้าข้อมูลเยอะ ให้สร้าง GSI (student_id + uploaded_at) แล้วเปลี่ยนเป็น Query
async function scanDocuments(student_id) {
  const items = [];
  let lastKey;
  do {
    const result = await docClient.send(
      new ScanCommand({
        TableName: DOCUMENTS_TABLE,
        ...(student_id && {
          FilterExpression: 'student_id = :sid',
          ExpressionAttributeValues: { ':sid': student_id },
        }),
        ExclusiveStartKey: lastKey,
      })
    );
    items.push(...(result.Items || []));
    lastKey = result.LastEvaluatedKey;
  } while (lastKey);
  return items;
}

const newestFirst = (a, b) => b.uploaded_at.localeCompare(a.uploaded_at);

// เอกสารของทุกคน สำหรับหน้า Main (ต้องล็อกอิน)
router.get('/all', async (req, res) => {
  try {
    const items = await scanDocuments();
    return res.status(200).json({ documents: items.sort(newestFirst).map(toPublicDto) });
  } catch (error) {
    console.error('List All Documents Error:', error);
    return res.status(500).json({ message: 'ไม่สามารถโหลดรายการเอกสารได้' });
  }
});

router.get('/', async (req, res) => {
  try {
    const items = await scanDocuments(req.user.student_id);
    const documents = items.sort(newestFirst).map(toDto);

    return res.status(200).json({ documents });
  } catch (error) {
    console.error('List Documents Error:', error);
    return res.status(500).json({ message: 'ไม่สามารถโหลดรายการเอกสารได้' });
  }
});

// ดึง item ตาม document_id
async function findDocument(document_id) {
  const result = await docClient.send(
    new GetCommand({ TableName: DOCUMENTS_TABLE, Key: { document_id } })
  );
  return result.Item;
}

// ดึงเฉพาะของผู้ใช้คนนี้ (ใช้ตอนลบ)
async function findOwnDocument(student_id, document_id) {
  const item = await findDocument(document_id);
  return item && item.student_id === student_id ? item : undefined;
}

// 4. ลิงก์ชั่วคราวสำหรับเปิดดู PDF
router.get('/:docId/download-url', async (req, res) => {
  try {
    const item = await findDocument(req.params.docId);
    if (!item) return res.status(404).json({ message: 'ไม่พบเอกสาร' });

    const url = await getSignedUrl(
      s3,
      new GetObjectCommand({
        Bucket: BUCKET,
        Key: item.s3_key,
        ResponseContentType: 'application/pdf',
      }),
      { expiresIn: URL_TTL_SECONDS }
    );
    return res.status(200).json({ url });
  } catch (error) {
    console.error('Download URL Error:', error);
    return res.status(500).json({ message: 'ไม่สามารถเปิดเอกสารได้' });
  }
});

// 5. ลบเอกสาร (ทั้งไฟล์บน S3 และ record ใน DynamoDB)
router.delete('/:docId', async (req, res) => {
  const { student_id } = req.user;
  try {
    const item = await findOwnDocument(student_id, req.params.docId);
    if (!item) return res.status(404).json({ message: 'ไม่พบเอกสาร' });

    await s3.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: item.s3_key }));
    await docClient.send(
      new DeleteCommand({ TableName: DOCUMENTS_TABLE, Key: { document_id: item.document_id } })
    );
    return res.status(200).json({ message: 'ลบเอกสารสำเร็จ' });
  } catch (error) {
    console.error('Delete Document Error:', error);
    return res.status(500).json({ message: 'ไม่สามารถลบเอกสารได้' });
  }
});

module.exports = router;