import "server-only";
import { randomUUID } from "node:crypto";
import { del, put } from "@vercel/blob";

/**
 * Image uploads to Vercel Blob, gated on real file content. The stored
 * pathname is always a random UUID — user-supplied filenames never touch
 * storage. Requires BLOB_READ_WRITE_TOKEN.
 */

const MAX_BYTES = 5 * 1024 * 1024;

const SIGNATURES: Array<{ ext: string; type: string; match: (b: Uint8Array) => boolean }> = [
  {
    ext: "jpg",
    type: "image/jpeg",
    match: (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff,
  },
  {
    ext: "png",
    type: "image/png",
    match: (b) => b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47,
  },
  {
    ext: "webp",
    type: "image/webp",
    match: (b) =>
      b[0] === 0x52 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x46 &&
      b[8] === 0x57 && b[9] === 0x45 && b[10] === 0x42 && b[11] === 0x50,
  },
];

export function blobConfigured(): boolean {
  return !!process.env.BLOB_READ_WRITE_TOKEN;
}

export class UploadError extends Error {}

/** Validate magic bytes + size and store; returns the public URL. */
export async function uploadImage(file: File, prefix: string): Promise<string> {
  if (!blobConfigured()) {
    throw new UploadError("Image uploads are not configured (BLOB_READ_WRITE_TOKEN missing).");
  }
  if (file.size === 0) throw new UploadError("The file is empty.");
  if (file.size > MAX_BYTES) throw new UploadError("Images must be 5 MB or smaller.");

  const bytes = new Uint8Array(await file.arrayBuffer());
  const sig = SIGNATURES.find((s) => s.match(bytes));
  if (!sig) throw new UploadError("Only JPEG, PNG or WebP images are allowed.");

  const safePrefix = prefix.replace(/[^a-z0-9-]/gi, "").slice(0, 30) || "media";
  const blob = await put(`${safePrefix}/${randomUUID()}.${sig.ext}`, Buffer.from(bytes), {
    access: "public",
    contentType: sig.type,
    addRandomSuffix: false,
  });
  return blob.url;
}

/** Best-effort removal of a previously uploaded blob. */
export async function deleteImage(url: string | null | undefined): Promise<void> {
  if (!url || !blobConfigured()) return;
  try {
    if (new URL(url).hostname.endsWith(".public.blob.vercel-storage.com")) {
      await del(url);
    }
  } catch {
    // orphaned blobs are harmless; never fail the main operation
  }
}