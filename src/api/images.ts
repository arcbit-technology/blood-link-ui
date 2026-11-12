import { http } from "@/api/http";
import { camelize } from "@/api/camelize";

type Envelope<T> = { result?: T; error?: string };

export type ImageTarget = "user_avatar" | "bank_logo" | "bank_cover";

export type ImageSlot = { target: ImageTarget; bloodBankId?: number };

/** Signed parameters from POST /image/signature (snake_case, sent to Cloudinary as-is). */
export type SignedUpload = {
  upload_url: string;
  cloud_name: string;
  api_key: string;
  timestamp: number;
  signature: string;
  public_id: string;
  overwrite: string;
  invalidate: string;
  allowed_formats: string;
};

type CloudinaryResult = { public_id: string; version: number; format: string; secure_url: string };

export class UploadError extends Error {}

const slotBody = (slot: ImageSlot) => ({ target: slot.target, blood_bank_id: slot.bloodBankId ?? 0 });

export async function signImageUpload(slot: ImageSlot, token: string): Promise<SignedUpload> {
  const res = await http<Envelope<SignedUpload>>({
    method: "POST",
    path: "/image/signature",
    token,
    body: slotBody(slot),
  });
  if (!res.result) throw new UploadError(res.error || "signature failed");
  return res.result;
}

/** Uploads straight to Cloudinary, reporting progress from 0 to 1. */
export function uploadToCloudinary(
  file: Blob,
  signed: SignedUpload,
  onProgress?: (fraction: number) => void,
  signal?: AbortSignal,
): Promise<CloudinaryResult> {
  return new Promise((resolve, reject) => {
    const form = new FormData();
    form.append("file", file);
    for (const key of ["api_key", "timestamp", "signature", "public_id", "overwrite", "invalidate", "allowed_formats"] as const) {
      form.append(key, String(signed[key]));
    }

    const xhr = new XMLHttpRequest();
    xhr.open("POST", signed.upload_url);
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress?.(e.loaded / e.total);
    };
    xhr.onload = () => {
      let body: unknown = null;
      try {
        body = JSON.parse(xhr.responseText);
      } catch {
        // fall through
      }
      if (xhr.status >= 200 && xhr.status < 300 && body && typeof body === "object" && "version" in body) {
        resolve(body as CloudinaryResult);
      } else {
        const msg =
          body && typeof body === "object" && "error" in body
            ? String((body as { error?: { message?: string } }).error?.message ?? "")
            : "";
        reject(new UploadError(msg || `Upload failed (${xhr.status})`));
      }
    };
    xhr.onerror = () => reject(new UploadError("Network error during upload"));
    xhr.onabort = () => reject(new UploadError("Upload cancelled"));
    signal?.addEventListener("abort", () => xhr.abort());
    xhr.send(form);
  });
}

export async function saveImage(slot: ImageSlot, uploaded: CloudinaryResult, token: string) {
  const res = await http<Envelope<{ target: ImageTarget; url: string }>>({
    method: "PUT",
    path: "/image",
    token,
    body: { ...slotBody(slot), public_id: uploaded.public_id, version: uploaded.version, format: uploaded.format },
  });
  return camelize(res.result!);
}

export async function removeImage(slot: ImageSlot, token: string) {
  await http<Envelope<unknown>>({
    method: "DELETE",
    path: `/image?target=${slot.target}&blood_bank_id=${slot.bloodBankId ?? 0}`,
    token,
  });
}

/** Signature -> direct upload -> save. Resolves with the stored URL. */
export async function uploadImage(
  slot: ImageSlot,
  file: Blob,
  token: string,
  onProgress?: (fraction: number) => void,
  signal?: AbortSignal,
): Promise<string> {
  const signed = await signImageUpload(slot, token);
  const uploaded = await uploadToCloudinary(file, signed, onProgress, signal);
  const saved = await saveImage(slot, uploaded, token);
  return saved.url;
}
