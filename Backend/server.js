// backend/server.js
import express from 'express';
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import 'dotenv/config';
import cors from 'cors';
import crypto from 'crypto';

const app = express();
const port = 3001;

// Allow ALL origins (any website can call your backend)
// For production, you should restrict this to your frontend's domain
// For example: app.use(cors({ origin: 'https://your-frontend-domain.com' }));
app.use(cors({ 
  origin: process.env.FRONTEND_ORIGIN || '*' // Use an environment variable for the frontend URL
}));

const s3Client = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

app.post('/api/generate-upload-url', async (req, res) => {
  console.log("Request received to generate upload URL");

  const randomFileName = crypto.randomBytes(16).toString('hex');

  const command = new PutObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME,
    Key: randomFileName,
  });

  try {
    const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 300 });
    res.json({ uploadUrl, key: randomFileName });
  } catch (err) {
    console.error("Error generating URL:", err);
    res.status(500).send("Could not generate upload URL.");
  }
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
