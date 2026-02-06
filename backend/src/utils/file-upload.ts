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
 * Magic byte signatures for file type validation
 * These are the first few bytes of files that identify their true type
 */
const MAGIC_BYTES: Record<string, number[][]> = {
  // Images
  'image/png': [[0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]],
  'image/jpeg': [[0xFF, 0xD8, 0xFF]],
  'image/jpg': [[0xFF, 0xD8, 0xFF]],
  'image/webp': [[0x52, 0x49, 0x46, 0x46]], // RIFF header (need to also check WEBP at offset 8)
  'image/gif': [[0x47, 0x49, 0x46, 0x38]], // GIF8

  // Documents
  'application/pdf': [[0x25, 0x50, 0x44, 0x46]], // %PDF

  // Office documents (ZIP-based formats)
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': [[0x50, 0x4B, 0x03, 0x04]], // PK (ZIP)
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': [[0x50, 0x4B, 0x03, 0x04]], // PK (ZIP)

  // Legacy Office formats
  'application/vnd.ms-excel': [[0xD0, 0xCF, 0x11, 0xE0, 0xA1, 0xB1, 0x1A, 0xE1]], // OLE2
  'application/msword': [[0xD0, 0xCF, 0x11, 0xE0, 0xA1, 0xB1, 0x1A, 0xE1]], // OLE2

  // Videos
  'video/mp4': [
    [0x00, 0x00, 0x00, 0x18, 0x66, 0x74, 0x79, 0x70], // ftyp at offset 4
    [0x00, 0x00, 0x00, 0x1C, 0x66, 0x74, 0x79, 0x70], // ftyp variant
    [0x00, 0x00, 0x00, 0x20, 0x66, 0x74, 0x79, 0x70], // ftyp variant
  ],
  'video/webm': [[0x1A, 0x45, 0xDF, 0xA3]], // EBML header
  'video/quicktime': [
    [0x00, 0x00, 0x00, 0x14, 0x66, 0x74, 0x79, 0x70], // ftyp
  ],
  'video/x-msvideo': [[0x52, 0x49, 0x46, 0x46]], // RIFF header
};

/**
 * Check if file content matches expected magic bytes
 */
function checkMagicBytes(buffer: ArrayBuffer, mimeType: string): boolean {
  const signatures = MAGIC_BYTES[mimeType];
  if (!signatures) {
    // If no signature defined, skip magic byte check (allow through)
    return true;
  }

  const uint8Array = new Uint8Array(buffer);

  for (const signature of signatures) {
    let matches = true;
    for (let i = 0; i < signature.length; i++) {
      if (uint8Array[i] !== signature[i]) {
        matches = false;
        break;
      }
    }
    if (matches) {
      // Additional check for WEBP (must have WEBP at offset 8)
      if (mimeType === 'image/webp') {
        const webpSignature = [0x57, 0x45, 0x42, 0x50]; // WEBP
        for (let i = 0; i < webpSignature.length; i++) {
          if (uint8Array[8 + i] !== webpSignature[i]) {
            return false;
          }
        }
      }
      return true;
    }
  }

  return false;
}

/**
 * Validate file type and size with magic byte verification
 * @param file - The file to validate
 * @param allowedTypes - Array of allowed MIME types
 * @param maxSize - Maximum file size in bytes
 * @returns Validation result with error message if invalid
 */
export async function validateFile(
  file: File,
  allowedTypes: string[],
  maxSize: number = MAX_FILE_SIZE
): Promise<{ valid: boolean; error?: string }> {
  // Check file size
  if (file.size > maxSize) {
    return {
      valid: false,
      error: `File size exceeds maximum of ${maxSize / (1024 * 1024)}MB`,
    };
  }

  // Check file type (MIME type from browser)
  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `File type ${file.type} is not allowed`,
    };
  }

  // Verify magic bytes to prevent MIME type spoofing
  const headerBuffer = await file.slice(0, 32).arrayBuffer();
  if (!checkMagicBytes(headerBuffer, file.type)) {
    return {
      valid: false,
      error: 'File content does not match declared file type',
    };
  }

  return { valid: true };
}

/**
 * Synchronous version for cases where async is not possible
 * Only validates MIME type and size (no magic byte check)
 */
export function validateFileSync(
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
