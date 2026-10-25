const jwt = require('jsonwebtoken');

// ต้องเป็นค่าเดียวกับที่ app.js ใช้ sign token ตอน /login
const JWT_SECRET = process.env.JWT_SECRET || 'saeb_jwt_secret_key_2026';

function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ message: 'กรุณาเข้าสู่ระบบ' });
  }

  try {
    req.user = jwt.verify(token, JWT_SECRET); // { student_id, email, iat, exp }
    next();
  } catch {
    return res.status(401).json({ message: 'เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่' });
  }
}

module.exports = requireAuth;