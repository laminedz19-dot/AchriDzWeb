const allowedTypes = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

export function parseImageDataUrl(dataUrl: string) {
  const match = /^data:([^;]+);base64,(.+)$/.exec(dataUrl);
  if (!match || !allowedTypes.has(match[1])) throw new Error("Only JPEG, PNG, WebP, or GIF images are allowed");
  const buffer = Buffer.from(match[2], "base64");
  if (buffer.length > MAX_IMAGE_BYTES) throw new Error("Image must be 5MB or smaller");
  return { contentType: match[1], buffer, extension: match[1].split("/")[1].replace("jpeg", "jpg") };
}
