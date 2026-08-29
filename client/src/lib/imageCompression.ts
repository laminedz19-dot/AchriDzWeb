export type CompressionResult = {
  blob: Blob;
  originalBytes: number;
  compressedBytes: number;
  width: number;
  height: number;
  mimeType: string;
};

export function calculateScaledDimensions(width: number, height: number, maxDimension = 1600) {
  if (width <= maxDimension && height <= maxDimension) return { width, height };
  const scale = Math.min(maxDimension / width, maxDimension / height);
  return { width: Math.max(1, Math.round(width * scale)), height: Math.max(1, Math.round(height * scale)) };
}

export async function compressImage(file: File, maxDimension = 1600, quality = 0.82): Promise<CompressionResult> {
  if (file.type === "image/gif") return { blob: file, originalBytes: file.size, compressedBytes: file.size, width: 0, height: 0, mimeType: file.type };
  const objectUrl = URL.createObjectURL(file);
  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => { const element = new Image(); element.onload = () => resolve(element); element.onerror = () => reject(new Error("تعذر قراءة الصورة")); element.src = objectUrl; });
    const dimensions = calculateScaledDimensions(image.naturalWidth, image.naturalHeight, maxDimension);
    const canvas = document.createElement("canvas"); canvas.width = dimensions.width; canvas.height = dimensions.height;
    const context = canvas.getContext("2d"); if (!context) throw new Error("المتصفح لا يدعم ضغط الصور");
    context.drawImage(image, 0, 0, dimensions.width, dimensions.height);
    const blob = await new Promise<Blob>((resolve, reject) => canvas.toBlob((result) => result ? resolve(result) : reject(new Error("تعذر ضغط الصورة")), "image/webp", quality));
    return { blob, originalBytes: file.size, compressedBytes: blob.size, width: dimensions.width, height: dimensions.height, mimeType: blob.type || "image/webp" };
  } finally { URL.revokeObjectURL(objectUrl); }
}
