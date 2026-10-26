const { S3Client } = require('@aws-sdk/client-s3');

// credential ใช้ชุดเดียวกับ DynamoDB (อ่านจาก env / AWS default credential chain)
const s3 = new S3Client({ region: process.env.AWS_REGION });

module.exports = { s3 };