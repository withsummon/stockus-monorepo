# Phase 5: Video & Storage - Research

**Researched:** 2026-01-27
**Domain:** Cloudflare R2 (S3-compatible object storage) with presigned URLs for secure video delivery
**Confidence:** HIGH

## Summary

This research covers implementing secure video storage using Cloudflare R2 (S3-compatible storage) with time-limited presigned URLs for member-only access. The standard approach uses AWS SDK v3 for Node.js (`@aws-sdk/client-s3` and `@aws-sdk/s3-request-presigner`) configured with R2 endpoints. Videos are uploaded either via multipart upload (for large files >100MB) or direct PUT operations, then served to authenticated members via presigned URLs that expire after a configurable duration (1 second to 7 days).

R2 is chosen over alternatives like VdoCipher (as noted in STATE.md) because it's simpler, more cost-effective (zero egress fees), and accepts the tradeoff of download capability over strict DRM. The architecture follows a "direct upload" pattern where the backend generates presigned PUT URLs for admin uploads and presigned GET URLs for member playback, minimizing server bandwidth usage.

Key technical considerations include CORS configuration (essential for browser-based uploads/playback), proper credential management (R2 Access Key ID and Secret), multipart upload for large videos, and database metadata storage linking videos to courses. Security relies on short-lived presigned URLs (recommended: 15 minutes or less), input validation to prevent path traversal, and Content-Type restrictions in presigned URLs.

**Primary recommendation:** Use AWS SDK v3 with R2 endpoints for all storage operations, implement presigned URL generation for both admin uploads and member playback, store only metadata in PostgreSQL, and configure CORS properly for browser access.

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @aws-sdk/client-s3 | 3.971.0+ | S3 operations (PutObject, GetObject, Multipart) | Official AWS SDK, R2-compatible, actively maintained (updated Jan 2026) |
| @aws-sdk/s3-request-presigner | 3.969.0+ | Generate presigned URLs | Official presigned URL library for AWS SDK v3 |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| file-type | Latest | Content-based file validation | Enhanced security: verify actual video content vs declared MIME type |
| mime-types | Latest | MIME type utilities | Validate and parse video file types |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| AWS SDK v3 | aws4fetch | Only for Cloudflare Workers environments; SDK v3 works fine in Node.js |
| Presigned URLs | Public R2 bucket | Loses access control; not suitable for member-gated content |
| R2 | VdoCipher | VdoCipher offers DRM but adds complexity and cost; R2 accepts download risk |
| R2 | Cloudflare Stream | Stream provides adaptive bitrate and HLS, but VID requirements only need simple video delivery |

**Installation:**
```bash
npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
npm install file-type mime-types  # Optional: for enhanced validation
```

## Architecture Patterns

### Recommended Project Structure
```
backend/src/
├── services/
│   └── r2.service.ts          # R2 client initialization, presigned URL generation
├── routes/
│   ├── admin/
│   │   └── videos.routes.ts   # Admin: upload, delete, manage videos
│   └── member/
│       └── videos.routes.ts   # Member: get presigned playback URLs
├── middleware/
│   └── video-validation.ts    # Validate video MIME types, size limits
└── config/
    └── r2.config.ts           # R2 credentials, bucket config

database/schema/
└── videos.ts                  # Drizzle schema: video metadata
```

### Pattern 1: R2 Client Initialization
**What:** Create a singleton S3Client configured for Cloudflare R2 endpoints
**When to use:** On service startup, reuse throughout application lifecycle
**Example:**
```typescript
// Source: https://developers.cloudflare.com/r2/examples/aws/aws-sdk-js-v3/
import { S3Client } from '@aws-sdk/client-s3';

export const r2Client = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});
```

### Pattern 2: Generate Presigned Upload URL (Admin)
**What:** Backend generates time-limited PUT URL for admin to upload directly to R2
**When to use:** Admin upload flow to offload bandwidth from server
**Example:**
```typescript
// Source: https://developers.cloudflare.com/r2/examples/aws/aws-sdk-js-v3/
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

async function generateUploadUrl(videoKey: string, contentType: string) {
  const command = new PutObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME,
    Key: videoKey,
    ContentType: contentType, // Security: locks MIME type in signature
  });

  // Short expiration for security (15 minutes = 900 seconds)
  return await getSignedUrl(r2Client, command, { expiresIn: 900 });
}
```

### Pattern 3: Generate Presigned Download URL (Member)
**What:** Backend generates time-limited GET URL for authenticated members to watch videos
**When to use:** Member video playback - URL expires to prevent sharing
**Example:**
```typescript
// Source: https://developers.cloudflare.com/r2/examples/aws/aws-sdk-js-v3/
import { GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

async function generatePlaybackUrl(videoKey: string, expiresIn: number = 3600) {
  const command = new GetObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME,
    Key: videoKey,
  });

  // Default 1 hour, configurable up to 7 days (604800 seconds)
  return await getSignedUrl(r2Client, command, { expiresIn });
}
```

### Pattern 4: Multipart Upload for Large Videos
**What:** Split large videos (>100MB) into parts, upload concurrently, assemble in R2
**When to use:** Videos larger than 100MB (required for >5GB files)
**Example:**
```typescript
// Source: https://docs.aws.amazon.com/AmazonS3/latest/userguide/mpuoverview.html
import {
  CreateMultipartUploadCommand,
  UploadPartCommand,
  CompleteMultipartUploadCommand,
} from '@aws-sdk/client-s3';

async function uploadLargeVideo(videoKey: string, file: File) {
  // 1. Initiate multipart upload
  const { UploadId } = await r2Client.send(
    new CreateMultipartUploadCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: videoKey,
      ContentType: file.type,
    })
  );

  // 2. Upload parts (16-64MB chunks, 5-10 concurrent)
  const partSize = 16 * 1024 * 1024; // 16MB
  const parts = [];

  for (let i = 0; i < Math.ceil(file.size / partSize); i++) {
    const start = i * partSize;
    const end = Math.min(start + partSize, file.size);
    const chunk = file.slice(start, end);

    const { ETag } = await r2Client.send(
      new UploadPartCommand({
        Bucket: process.env.R2_BUCKET_NAME,
        Key: videoKey,
        UploadId,
        PartNumber: i + 1,
        Body: chunk,
      })
    );

    parts.push({ ETag, PartNumber: i + 1 });
  }

  // 3. Complete upload
  await r2Client.send(
    new CompleteMultipartUploadCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: videoKey,
      UploadId,
      MultipartUpload: { Parts: parts },
    })
  );
}
```

### Pattern 5: Video Metadata Database Schema
**What:** Store video metadata in PostgreSQL, not video files
**When to use:** All video records - R2 stores files, DB stores searchable metadata
**Example:**
```typescript
// Source: Drizzle ORM best practices 2026
import { pgTable, varchar, text, integer, timestamp, uuid } from 'drizzle-orm/pg-core';

export const videos = pgTable('videos', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  r2Key: varchar('r2_key', { length: 500 }).notNull().unique(), // R2 object key
  contentType: varchar('content_type', { length: 100 }).notNull(), // e.g., 'video/mp4'
  sizeBytes: integer('size_bytes').notNull(),
  durationSeconds: integer('duration_seconds'), // Optional: video length
  courseId: uuid('course_id').notNull().references(() => courses.id),
  uploadedBy: uuid('uploaded_by').notNull().references(() => users.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
```

### Pattern 6: File Upload in Hono
**What:** Parse multipart form data to get video file for server-side upload
**When to use:** When server proxies upload to R2 (alternative to direct presigned URL upload)
**Example:**
```typescript
// Source: https://hono.dev/examples/file-upload
import { Hono } from 'hono';

const app = new Hono();

app.post('/admin/videos/upload', async (c) => {
  const body = await c.req.parseBody();
  const file = body['video']; // File | string

  if (!(file instanceof File)) {
    return c.json({ error: 'No video file provided' }, 400);
  }

  // Validate, then upload to R2
  // ... (see validation pattern)
});
```

### Anti-Patterns to Avoid
- **Storing videos in PostgreSQL as bytea/BLOB:** Videos are large; use object storage (R2), store only metadata in DB
- **Using r2.dev URLs in production:** Unsupported for production; use custom domains or presigned URLs
- **Long presigned URL expiration (>1 hour for uploads, >4 hours for playback):** Increases security risk; use shortest practical duration
- **Trusting client-declared MIME type without validation:** Validate actual file content with file-type library to prevent malicious uploads
- **Not configuring CORS:** Browser uploads/playback will fail with cryptic errors without proper CORS setup
- **Hardcoding credentials:** Use environment variables for R2 Access Key ID, Secret, Account ID, Bucket Name

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Presigned URL generation | Custom signature algorithm | @aws-sdk/s3-request-presigner | AWS Signature Version 4 is complex; SDK handles signing, encoding, expiration correctly |
| Multipart upload logic | Custom chunking system | AWS SDK CreateMultipartUploadCommand | Edge cases: part retry, ETag tracking, concurrent limits, cleanup on failure |
| MIME type validation | Regex on file extension | file-type library (magic bytes) | Extensions are spoofable; content-based validation via magic bytes is secure |
| Video duration extraction | Custom ffprobe wrapper | Consider ffprobe via child_process if needed | Parsing video metadata requires understanding container formats (MP4, WebM, etc.) |
| CORS configuration | Manual header management | R2 bucket CORS policy | Complex preflight handling; R2 manages OPTIONS requests with policy |
| Credential rotation | Manual key updates | Environment variables + deployment | Hardcoded keys lead to credential leaks; env vars enable rotation without code changes |

**Key insight:** S3-compatible storage has mature tooling (AWS SDK v3) that handles edge cases like signature encoding, multipart failure recovery, and presigned URL security. Reinventing these is error-prone and creates security vulnerabilities.

## Common Pitfalls

### Pitfall 1: CORS Errors Despite "Correct" Configuration
**What goes wrong:** Browser uploads or video playback fail with CORS errors even after setting CORS policy
**Why it happens:** Missing `ExposeHeaders` (e.g., `ETag`), incomplete `AllowedHeaders` (missing `Authorization`, `Content-Type`), or `AllowedMethods` not including `PUT`/`POST`
**How to avoid:** Configure comprehensive CORS policy on R2 bucket with all required headers
**Warning signs:** Browser console shows "Access-Control-Allow-Origin" errors; preflight OPTIONS requests fail

**Solution:**
```json
{
  "AllowedOrigins": ["https://yourdomain.com"],
  "AllowedMethods": ["GET", "PUT", "POST", "HEAD"],
  "AllowedHeaders": ["*"],
  "ExposeHeaders": ["ETag", "Content-Length"],
  "MaxAgeSeconds": 3600
}
```

### Pitfall 2: SignatureDoesNotMatch Error (Error 10035)
**What goes wrong:** Presigned URLs fail with signature validation error
**Why it happens:** Client sends Content-Type header that doesn't match what was signed in presigned URL; incorrect URL encoding; expired credentials
**How to avoid:** When generating presigned PUT URLs with ContentType parameter, client MUST send matching Content-Type header; verify secret key is correct
**Warning signs:** Uploads work sometimes but fail unpredictably; error message "The request signature we calculated does not match the signature you provided"

### Pitfall 3: Bucket Overwhelmed with 5XX Errors
**What goes wrong:** R2 returns HTTP 5XX errors under load
**Why it happens:** Too many concurrent requests create bucket-wide locks affecting all operations
**How to avoid:** Implement request throttling; limit concurrent multipart upload parts (5-10 max); use exponential backoff on retry
**Warning signs:** Performance degrades for all users when one admin uploads large video; intermittent 5XX errors

### Pitfall 4: Path Traversal in Video Keys
**What goes wrong:** Malicious admin manipulates upload path to overwrite unintended objects or access restricted files
**Why it happens:** Accepting user input directly as R2 object key without sanitization (e.g., `../../secret.txt`)
**How to avoid:** Generate R2 keys server-side using UUIDs (same pattern as existing file-upload.ts); validate input doesn't contain `..` or `/` in unexpected places
**Warning signs:** User can control full object key path; video URLs contain user-supplied filenames

**Solution:**
```typescript
// Good: server generates key
const videoKey = `videos/${randomUUID()}.${extension}`;

// Bad: user controls key
const videoKey = `videos/${req.body.filename}`; // VULNERABLE
```

### Pitfall 5: ExpiredRequest Error (Error 10018)
**What goes wrong:** Presigned URLs stop working after expiration time
**Why it happens:** URL was generated with `expiresIn` that has elapsed; not a bug, but expected behavior that catches developers off guard
**How to avoid:** Regenerate presigned URLs on-demand when member requests playback; don't cache URLs longer than expiration; communicate expiration to frontend
**Warning signs:** Videos play initially, then fail after time passes; error "Presigned URL or request signature has expired"

### Pitfall 6: EntityTooLarge Error for Large Videos (Error 100100)
**What goes wrong:** Upload fails for videos larger than 5GB
**Why it happens:** Using single PutObjectCommand instead of multipart upload; R2 limits single PUT to 5GB
**How to avoid:** Implement multipart upload for videos >100MB (best practice) or >5GB (required)
**Warning signs:** Small test videos work but full-length recordings fail; error mentions size limit exceeded

### Pitfall 7: Video Player MIME Type Detection Fails with Presigned URLs
**What goes wrong:** HTML5 `<video>` element or video player libraries fail to play video from presigned URL
**Why it happens:** Presigned URLs include query parameters (`?X-Amz-Algorithm=...&X-Amz-Signature=...`) after file extension, confusing MIME type detection
**How to avoid:** Explicitly set Content-Type when generating presigned URL; use `type` attribute on `<video><source>` element
**Warning signs:** Video downloads correctly but doesn't play; browser console shows MIME type errors

**Solution:**
```html
<!-- Frontend: explicitly declare MIME type -->
<video controls>
  <source src="{presignedUrl}" type="video/mp4">
</video>
```

```typescript
// Backend: ensure Content-Type is set on R2 object
const command = new PutObjectCommand({
  Bucket: process.env.R2_BUCKET_NAME,
  Key: videoKey,
  ContentType: 'video/mp4', // Critical for playback
});
```

### Pitfall 8: Not Validating File Content, Only Extension
**What goes wrong:** Malicious user uploads executable disguised as .mp4 by renaming
**Why it happens:** Validation only checks file extension or client-declared MIME type, both easily spoofed
**How to avoid:** Use file-type library to validate magic bytes (actual file content)
**Warning signs:** Security audit flags unrestricted file uploads; any file can be uploaded by changing extension

## Code Examples

Verified patterns from official sources:

### Admin Video Upload Flow (Direct to R2)
```typescript
// Route: POST /admin/videos/request-upload
// Source: https://developers.cloudflare.com/r2/api/s3/presigned-urls/
import { Hono } from 'hono';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { r2Client } from '../services/r2.service';
import { requireAdmin } from '../middleware/auth';
import { randomUUID } from 'crypto';

const adminVideos = new Hono();

adminVideos.post('/request-upload', requireAdmin, async (c) => {
  const { filename, contentType, courseId } = await c.req.json();

  // Validate video MIME type
  const allowedTypes = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo'];
  if (!allowedTypes.includes(contentType)) {
    return c.json({ error: 'Invalid video type' }, 400);
  }

  // Generate R2 key (server-controlled, prevents path traversal)
  const extension = filename.split('.').pop();
  const videoKey = `videos/${randomUUID()}.${extension}`;

  // Generate presigned upload URL
  const command = new PutObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME!,
    Key: videoKey,
    ContentType: contentType, // Locked in signature for security
  });

  const uploadUrl = await getSignedUrl(r2Client, command, {
    expiresIn: 900, // 15 minutes
  });

  // Return URL and key to admin (key saved to DB after successful upload)
  return c.json({ uploadUrl, videoKey });
});

export default adminVideos;
```

### Member Video Playback URL Generation
```typescript
// Route: GET /member/videos/:id/playback-url
// Source: https://developers.cloudflare.com/r2/api/s3/presigned-urls/
import { Hono } from 'hono';
import { GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { r2Client } from '../services/r2.service';
import { requireTier } from '../middleware/auth';
import { db } from '../db';
import { videos } from '../db/schema';
import { eq } from 'drizzle-orm';

const memberVideos = new Hono();

memberVideos.get('/:id/playback-url', requireTier('member'), async (c) => {
  const videoId = c.req.param('id');

  // Verify video exists and get R2 key
  const video = await db.query.videos.findFirst({
    where: eq(videos.id, videoId),
  });

  if (!video) {
    return c.json({ error: 'Video not found' }, 404);
  }

  // TODO: Verify user has access to this video's course

  // Generate presigned playback URL
  const command = new GetObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME!,
    Key: video.r2Key,
  });

  const playbackUrl = await getSignedUrl(r2Client, command, {
    expiresIn: 3600, // 1 hour (configurable)
  });

  return c.json({
    playbackUrl,
    expiresIn: 3600,
    contentType: video.contentType,
  });
});

export default memberVideos;
```

### R2 Service Initialization
```typescript
// File: backend/src/services/r2.service.ts
// Source: https://developers.cloudflare.com/r2/examples/aws/aws-sdk-js-v3/
import { S3Client } from '@aws-sdk/client-s3';

if (!process.env.CLOUDFLARE_ACCOUNT_ID) {
  throw new Error('Missing CLOUDFLARE_ACCOUNT_ID environment variable');
}
if (!process.env.R2_ACCESS_KEY_ID) {
  throw new Error('Missing R2_ACCESS_KEY_ID environment variable');
}
if (!process.env.R2_SECRET_ACCESS_KEY) {
  throw new Error('Missing R2_SECRET_ACCESS_KEY environment variable');
}
if (!process.env.R2_BUCKET_NAME) {
  throw new Error('Missing R2_BUCKET_NAME environment variable');
}

export const r2Client = new S3Client({
  region: 'auto', // R2 uses 'auto' region
  endpoint: `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

export const R2_BUCKET = process.env.R2_BUCKET_NAME;
```

### Video Metadata Validation Middleware
```typescript
// File: backend/src/middleware/video-validation.ts
// Source: Best practices from research
import { MiddlewareHandler } from 'hono';

const ALLOWED_VIDEO_TYPES = [
  'video/mp4',
  'video/webm',
  'video/quicktime',
  'video/x-msvideo', // AVI
  'video/ogg',
];

const MAX_VIDEO_SIZE = 5 * 1024 * 1024 * 1024; // 5GB (R2 single PUT limit)

export const validateVideoUpload: MiddlewareHandler = async (c, next) => {
  const body = await c.req.parseBody();
  const file = body['video'];

  if (!(file instanceof File)) {
    return c.json({ error: 'No video file provided' }, 400);
  }

  // Validate MIME type
  if (!ALLOWED_VIDEO_TYPES.includes(file.type)) {
    return c.json({
      error: `Invalid video type: ${file.type}`,
      allowed: ALLOWED_VIDEO_TYPES,
    }, 400);
  }

  // Validate size
  if (file.size > MAX_VIDEO_SIZE) {
    return c.json({
      error: 'Video exceeds 5GB limit',
      hint: 'Use multipart upload for large videos',
    }, 400);
  }

  // Optional: validate magic bytes for enhanced security
  // const fileType = await import('file-type');
  // const buffer = Buffer.from(await file.arrayBuffer());
  // const detected = await fileType.fromBuffer(buffer);
  // if (!detected || !ALLOWED_VIDEO_TYPES.includes(detected.mime)) {
  //   return c.json({ error: 'File content does not match declared type' }, 400);
  // }

  c.set('validatedVideo', file);
  await next();
};
```

### Environment Configuration
```bash
# File: .env
# R2 Credentials (from Cloudflare dashboard > R2 > Manage R2 API Tokens)
CLOUDFLARE_ACCOUNT_ID=abc123def456
R2_ACCESS_KEY_ID=your_access_key_id
R2_SECRET_ACCESS_KEY=your_secret_access_key
R2_BUCKET_NAME=stockus-videos

# Presigned URL Configuration
VIDEO_UPLOAD_URL_EXPIRY=900      # 15 minutes
VIDEO_PLAYBACK_URL_EXPIRY=3600   # 1 hour
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| AWS SDK v2 (`aws-sdk`) | AWS SDK v3 (`@aws-sdk/client-s3`) | 2020-2021 (GA) | Modular imports reduce bundle size; native TypeScript support; better tree-shaking |
| Serial-based IDs in Postgres | UUID or identity columns | 2023-2024 | Drizzle ORM recommends `generatedAlwaysAsIdentity()` for modern Postgres; UUIDs prevent enumeration |
| Proxying uploads through backend | Direct-to-R2 with presigned URLs | Ongoing best practice | Reduces server bandwidth/load; improves upload performance; client uploads directly to storage |
| Public S3 buckets | Private buckets with presigned URLs | Security best practice | Prevents unauthorized access; time-limited access; auditable |
| Single-part upload for all files | Multipart upload for large files (>100MB) | S3 best practice since inception | Better reliability for large files; concurrent chunk uploads; resume capability |

**Deprecated/outdated:**
- **r2.dev URLs for production:** Cloudflare states these are unsupported for production use; use custom domains or presigned URLs
- **`aws-sdk` (v2):** Replaced by modular `@aws-sdk/*` packages in v3; v2 is in maintenance mode
- **`serial` type in Postgres:** Drizzle and modern Postgres recommend `identity` columns or UUIDs for new tables

## Open Questions

Things that couldn't be fully resolved:

1. **Video transcoding/optimization**
   - What we know: R2 stores videos as-is; no built-in transcoding unlike Cloudflare Stream
   - What's unclear: Whether to implement server-side transcoding (e.g., FFmpeg) or require admin to upload optimized videos
   - Recommendation: Start with "upload pre-encoded MP4" requirement (simplest); defer transcoding to Phase 6+ if needed

2. **Multipart upload progress tracking**
   - What we know: Multipart upload happens on backend; frontend needs progress updates for UX
   - What's unclear: Best pattern for real-time progress (WebSockets, polling, Server-Sent Events)
   - Recommendation: Phase 5 implements basic upload without progress; Phase 6+ could add WebSocket progress events if needed

3. **Video thumbnail generation**
   - What we know: Common UX pattern to show video preview thumbnails
   - What's unclear: Generate thumbnails server-side (FFmpeg) or require admin to upload separate thumbnail image
   - Recommendation: Start with separate thumbnail upload using existing image upload system (file-upload.ts pattern); auto-generation is Phase 6+ enhancement

4. **CORS configuration timing**
   - What we know: CORS must be configured on R2 bucket via API or Cloudflare dashboard
   - What's unclear: Whether to automate CORS setup in application initialization or treat as manual infrastructure setup
   - Recommendation: Document CORS as manual setup step in deployment guide; R2 API requires separate auth for bucket policy changes

5. **Cleanup of incomplete multipart uploads**
   - What we know: AWS best practice is lifecycle rules to auto-delete incomplete uploads after 7 days
   - What's unclear: Whether R2 supports S3 lifecycle policies for this
   - Recommendation: Research R2 lifecycle policy support; if unavailable, implement manual cleanup script or accept orphaned parts (low priority)

## Sources

### Primary (HIGH confidence)
- [Cloudflare R2 Official Docs](https://developers.cloudflare.com/r2/) - R2 overview, features
- [Cloudflare R2 S3 API Compatibility](https://developers.cloudflare.com/r2/api/s3/api/) - Supported S3 operations
- [Cloudflare R2 Presigned URLs](https://developers.cloudflare.com/r2/api/s3/presigned-urls/) - Presigned URL generation, limits, security
- [Cloudflare R2 AWS SDK v3 Example](https://developers.cloudflare.com/r2/examples/aws/aws-sdk-js-v3/) - Official R2 integration code
- [Cloudflare R2 Troubleshooting](https://developers.cloudflare.com/r2/platform/troubleshooting/) - Common CORS, 5XX errors
- [Cloudflare R2 Error Codes](https://developers.cloudflare.com/r2/api/error-codes/) - Error reference for presigned URLs, auth
- [AWS SDK v3 GitHub](https://github.com/aws/aws-sdk-js-v3) - Official SDK repository, latest releases
- [@aws-sdk/client-s3 npm](https://www.npmjs.com/package/@aws-sdk/client-s3) - Version 3.971.0 (Jan 2026)
- [@aws-sdk/s3-request-presigner npm](https://www.npmjs.com/package/@aws-sdk/s3-request-presigner) - Version 3.969.0 (Jan 2026)
- [Hono File Upload Example](https://hono.dev/examples/file-upload) - Official Hono multipart handling
- [AWS S3 Multipart Upload Docs](https://docs.aws.amazon.com/AmazonS3/latest/userguide/mpuoverview.html) - Multipart upload best practices
- [Drizzle ORM PostgreSQL Guide](https://orm.drizzle.team/docs/get-started/postgresql-new) - Schema patterns

### Secondary (MEDIUM confidence)
- [Building Cloudflare R2 Pre-signed URL Uploads with Hono](https://lirantal.com/blog/cloudflare-r2-presigned-url-uploads-hono) - Real-world Hono + R2 implementation
- [S3 Uploads — Proxies vs Presigned URLs](https://zaccharles.medium.com/s3-uploads-proxies-vs-presigned-urls-vs-presigned-posts-9661e2b37932) - Architecture pattern comparison
- [Understanding Security Vulnerabilities in AWS S3 Pre-signed URLs](https://medium.com/@dienbase/understanding-and-preventing-security-vulnerabilities-in-aws-s3-pre-signed-urls-0378cbf3f99f) - Security pitfalls
- [Securing Amazon S3 Presigned URLs for Serverless Applications](https://aws.amazon.com/blogs/compute/securing-amazon-s3-presigned-urls-for-serverless-applications/) - Security best practices
- [Uploading Large Videos with Node.js](https://medium.com/@techsuneel99/uploading-large-videos-with-node-js-a-comprehensive-guide-a7a1ae4dfd1f) - Multipart upload patterns
- [7 Best HTML5 Video Players For Online Streaming in 2026](https://www.contus.com/blog/best-html5-video-players/) - Video playback options
- [Testing Cloudflare R2 for Video Storage](https://adocasts.com/blog/testing-cloudflare-r2-for-video-storage) - Real-world R2 video usage
- [Cloudflare R2 Storage Classes](https://developers.cloudflare.com/r2/buckets/storage-classes/) - Standard vs Infrequent Access

### Tertiary (LOW confidence)
- Various Stack Overflow and community forum discussions about R2 CORS issues, presigned URL troubleshooting
- Community blog posts about HTML5 video playback with presigned URLs (MIME type detection issues)

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - AWS SDK v3 is official, actively maintained (Jan 2026 releases), R2-compatible verified by Cloudflare docs
- Architecture: HIGH - Presigned URL pattern documented in official R2 and AWS docs; code examples from official sources
- Pitfalls: HIGH - CORS issues, signature errors, path traversal verified in official R2 troubleshooting docs and security research

**Research date:** 2026-01-27
**Valid until:** 2026-02-27 (30 days - stable domain with mature tooling)
