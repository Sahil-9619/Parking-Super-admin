import crypto from "crypto";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { AppError } from "../../utils/AppError.js";

export class UploadService {
  async generatePresignedUrl({ fileName, fileType }) {
    if (!fileName || !fileType) {
      throw new AppError("File name and file type are required", 400);
    }

    const accountId = process.env.R2_ACCOUNT_ID;
    const bucketName = process.env.R2_BUCKET_NAME || "parkpal-media";
    const accessKeyId = process.env.R2_ACCESS_KEY_ID;
    const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
    const publicDomain = process.env.R2_PUBLIC_DOMAIN || "https://pub-mockid.r2.dev";

    const uniqueId = crypto.randomUUID();
    const extension = fileName.split(".").pop();
    const r2Key = `parkings/${uniqueId}.${extension}`;

    // If real R2 credentials are provided in .env, generate actual AWS V4 signed cryptographic URL
    if (accountId && accessKeyId && secretAccessKey && !accountId.includes("your_cloudflare")) {
      const s3Client = new S3Client({
        region: "auto",
        endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
        credentials: {
          accessKeyId,
          secretAccessKey,
        },
      });

      const command = new PutObjectCommand({
        Bucket: bucketName,
        Key: r2Key,
        ContentType: fileType,
      });

      const presignedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
      const publicUrl = `${publicDomain}/${r2Key}`;

      console.log(`\n================== [CLOUDFLARE R2 LIVE UPLOAD] ==================`);
      console.log(`Target R2 Key: [ ${r2Key} ]`);
      console.log(`R2 Cryptographic Presigned PUT URL: ${presignedUrl}`);
      console.log(`R2 Public Access URL: ${publicUrl}`);
      console.log(`=================================================================\n`);

      return {
        presignedUrl,
        publicUrl,
        expiresIn: 3600,
      };
    }

    // Fallback simulation for local dev testing before putting real credentials in .env
    const r2Endpoint = `https://${accountId || "mock-account"}.r2.cloudflarestorage.com/${bucketName}/${r2Key}`;
    const presignedUrl = `${r2Endpoint}?AWSAccessKeyId=MOCK_R2_KEY&Expires=3600&Signature=MOCK_R2_SIG`;
    const publicUrl = `${publicDomain}/${r2Key}`;

    console.log(`\n================== [CLOUDFLARE R2 MOCK UPLOAD] ==================`);
    console.log(`(Real credentials not found in .env. Using mock simulation mode)`);
    console.log(`Target R2 Key: [ ${r2Key} ]`);
    console.log(`R2 Mock Presigned PUT URL: ${presignedUrl}`);
    console.log(`R2 Public Access URL: ${publicUrl}`);
    console.log(`=================================================================\n`);

    return {
      presignedUrl,
      publicUrl,
      expiresIn: 3600,
    };
  }
}

export const uploadService = new UploadService();
