// backend/server.js
import express from 'express';
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import 'dotenv/config'; // Loads .env file
import cors from 'cors';
import crypto from 'crypto';

const app = express();
const port = 3001;

// Allow requests from your future frontend
app.use(cors({ origin: 'http://localhost:3000' })); // Adjust if your frontend runs elsewhere

const s3Client = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

// Endpoint to get a presigned URL for uploading
app.post('/api/generate-upload-url', async (req, res) => {
  console.log("Request received to generate upload URL");

  const randomFileName = crypto.randomBytes(16).toString('hex');

  const command = new PutObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME,
    Key: randomFileName,
  });

  try {
    const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 300 }); // URL valid for 5 minutes
    res.json({ uploadUrl, key: randomFileName });
  } catch (err) {
    console.error("Error generating URL:", err);
    res.status(500).send("Could not generate upload URL.");
  }
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
