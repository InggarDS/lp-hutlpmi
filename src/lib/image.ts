export const MAX_UPLOAD_SIZE = 3 * 1024 * 1024; // 3MB
const COMPRESS_THRESHOLD = 1 * 1024 * 1024; // 1MB
const MAX_DIMENSION = 1920;

export async function compressImage(file: File): Promise<File> {
  if (file.size < COMPRESS_THRESHOLD) return file;

  const bitmap = await createImageBitmap(file);
  let { width, height } = bitmap;
  if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
    const scale = MAX_DIMENSION / Math.max(width, height);
    width = Math.round(width * scale);
    height = Math.round(height * scale);
  }

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return file;
  ctx.drawImage(bitmap, 0, 0, width, height);

  const outputType = file.type === "image/png" ? "image/jpeg" : file.type;
  let quality = 0.85;
  let blob: Blob | null = null;
  for (let attempt = 0; attempt < 6; attempt++) {
    blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, outputType, quality));
    if (!blob || blob.size <= MAX_UPLOAD_SIZE) break;
    quality -= 0.15;
  }
  if (!blob || blob.size >= file.size) return file;

  const ext = outputType === "image/jpeg" ? "jpg" : outputType === "image/webp" ? "webp" : "png";
  const name = file.name.replace(/\.[^.]+$/, "") + "." + ext;
  return new File([blob], name, { type: outputType });
}
