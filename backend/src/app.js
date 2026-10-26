require('dotenv').config(); // ต้องอยู่บรรทัดแรก เพื่อให้ไฟล์อื่นที่ require ทีหลังเห็นค่าใน .env
const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { GetCommand, PutCommand } = require('@aws-sdk/lib-dynamodb');
const { docClient } = require('./config/aws');
const documentsRouter = require('./routes/documents');

const app = express();
app.use(cors());
app.use(express.json());
app.use('/documents', documentsRouter);

const USERS_TABLE = 'saeb-users';
const JWT_SECRET = process.env.JWT_SECRET || 'saeb_jwt_secret_key_2026';

// Helper: Hash Password ด้วย PBKDF2
function hashPassword(password, salt) {
  return crypto.pbkdf2Sync(password, salt, 210000, 64, 'sha512').toString('hex');
}

// 1. API สำหรับสมัคร/สร้าง User ทดสอบลง DynamoDB
app.post('/register', async (req, res) => {
  const { student_id, email, password } = req.body;

  if (!student_id || !password || !email) {
    return res.status(400).json({ message: 'กรุณากรอกข้อมูลให้ครบถ้วน' });
  }

  const salt = crypto.randomBytes(16).toString('hex');
  const password_hash = hashPassword(password, salt);

  try {
    const command = new PutCommand({
      TableName: USERS_TABLE,
      Item: {
        student_id,
        email,
        salt,
        password_hash,
        created_at: new Date().toISOString()
      }
    });

    await docClient.send(command);
    return res.status(201).json({ message: 'สร้างบัญชีผู้ใช้สำเร็จ' });
  } catch (error) {
    console.error('Register Error:', error);
    return res.status(500).json({ message: 'ไม่สามารถบันทึกข้อมูลลง DynamoDB ได้', error: error.message });
  }
});

// 2. API สำหรับ Login (ตรวจสอบกับ DynamoDB)
app.post('/login', async (req, res) => {
  const { student_id, password } = req.body;

  if (!student_id || !password) {
    return res.status(400).json({ message: 'กรุณากรอก รหัสนักศึกษา และ รหัสผ่าน' });
  }

  try {
    // ดึงข้อมูลจากตาราง saeb-users ตาม Partition Key (student_id)
    const command = new GetCommand({
      TableName: USERS_TABLE,
      Key: { student_id }
    });

    const response = await docClient.send(command);
    const user = response.Item;

    if (!user) {
      return res.status(401).json({ message: 'ไม่พบรหัสนักศึกษานี้ในระบบ' });
    }

    // ตรวจสอบ Password Hash
    const inputHash = hashPassword(password, user.salt);
    if (inputHash !== user.password_hash) {
      return res.status(401).json({ message: 'รหัสผ่านไม่ถูกต้อง' });
    }

    // เจน JWT Token
    const token = jwt.sign(
      { student_id: user.student_id, email: user.email },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    return res.status(200).json({
      message: 'เข้าสู่ระบบสำเร็จ',
      token,
      user: { student_id: user.student_id, email: user.email }
    });

  } catch (error) {
    console.error('Login Error:', error);
    return res.status(500).json({ message: 'เกิดข้อผิดพลาดในการเชื่อมต่อ DynamoDB', error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));