import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { env } from '../config/env.js'

/**
 * R2 client configured for Cloudflare R2 (S3-compatible)
 * Uses 'auto' region as R2 doesn't require region specification
 */
export const r2Client = new S3Client({
  region: 'auto',
  endpoint: `https://${env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: env.R2_ACCESS_KEY_ID,
    secretAccessKey: env.R2_SECRET_ACCESS_KEY,
  },
})

/**
 * R2 bucket name from environment
 */
export const R2_BUCKET = env.R2_BUCKET_NAME

/**
 * Generate a presigned URL for uploading a video to R2
 *
 * @param videoKey - The object key (path) in the bucket
 * @param contentType - MIME type of the video (e.g., 'video/mp4')
 * @returns Presigned URL valid for VIDEO_UPLOAD_URL_EXPIRY seconds (default 15 minutes)
 */
export async function generateUploadUrl(
  videoKey: string,
  contentType: string
): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: R2_BUCKET,
    Key: videoKey,
    ContentType: contentType,
  })

  return getSignedUrl(r2Client, command, {
    expiresIn: env.VIDEO_UPLOAD_URL_EXPIRY,
  })
}

/**
 * Generate a presigned URL for playing/downloading a video from R2
 *
 * @param videoKey - The object key (path) in the bucket
 * @param expiresIn - Optional custom expiry in seconds (default VIDEO_PLAYBACK_URL_EXPIRY)
 * @returns Presigned URL valid for specified duration (default 1 hour)
 */
export async function generatePlaybackUrl(
  videoKey: string,
  expiresIn?: number
): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: R2_BUCKET,
    Key: videoKey,
  })

  return getSignedUrl(r2Client, command, {
    expiresIn: expiresIn ?? env.VIDEO_PLAYBACK_URL_EXPIRY,
  })
}
