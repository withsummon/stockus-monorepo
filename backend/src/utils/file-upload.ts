import { randomUUID } from 'crypto';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

// File size limits
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

// Allowed MIME types for templates
export const ALLOWED_TEMPLATE_TYPES = [
  'application/pdf',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

// Allowed MIME types for images
export const ALLOWED_IMAGE_TYPES = [
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/webp',
];

// Allowed MIME types for videos
export const ALLOWED_VIDEO_TYPES = [
  'video/mp4',
  'video/webm',
  'video/quicktime', // .mov
  'video/x-msvideo', // .avi
];

// Video size limits (R2 single PUT limit is 5GB)
export const MAX_VIDEO_SIZE = 5 * 1024 * 1024 * 1024; // 5GB

/**
 * Validate file type and size
 * @param file - The file to validate
 * @param allowedTypes - Array of allowed MIME types
 * @param maxSize - Maximum file size in bytes
 * @returns Validation result with error message if invalid
 */
export function validateFile(
  file: File,
  allowedTypes: string[],
  maxSize: number = MAX_FILE_SIZE
): { valid: boolean; error?: string } {
  // Check file size
  if (file.size > maxSize) {
    return {
      valid: false,
      error: `File size exceeds maximum of ${maxSize / (1024 * 1024)}MB`,
    };
  }

  // Check file type
  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `File type ${file.type} is not allowed`,
    };
  }

  return { valid: true };
}

/**
 * Save file to disk with UUID filename
 * @param file - The file to save
 * @param uploadDir - Directory to save the file in
 * @returns Filename and full filepath
 */
export async function saveFile(
  file: File,
  uploadDir: string
): Promise<{ filename: string; filepath: string }> {
  // Extract file extension
  const ext = file.name.split('.').pop() || '';

  // Generate unique filename
  const filename = `${randomUUID()}.${ext}`;

  // Ensure directory exists
  await mkdir(uploadDir, { recursive: true });

  // Read file into buffer
  const buffer = Buffer.from(await file.arrayBuffer());

  // Write file to disk
  const filepath = join(uploadDir, filename);
  await writeFile(filepath, buffer);

  return { filename, filepath: `${uploadDir}/${filename}` };
}

/**
 * Get the upload directory for a specific file type
 * @param type - The type of file being uploaded
 * @returns Absolute path to upload directory
 */
export function getUploadDir(type: 'templates' | 'images' | 'thumbnails'): string {
  return join(process.cwd(), 'uploads', type);
}
