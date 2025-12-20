export async function fileToNormalizedDataUrl(file: File): Promise<string> {
  const blob = file;

  // createImageBitmap with imageOrientation ensures EXIF orientation is applied to pixels
  const bitmap = await createImageBitmap(blob, {
    imageOrientation: "from-image",
  } as ImageBitmapOptions);

  const canvas = document.createElement("canvas");
  canvas.width = bitmap.width;
  canvas.height = bitmap.height;

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not supported");

  ctx.drawImage(bitmap, 0, 0);

  const mime = (() => {
    const t = (file.type || "").toLowerCase();
    if (t === "image/png" || t === "image/jpeg" || t === "image/webp") return t;
    return "image/png";
  })();

  // Preserve PNG transparency (e.g. logos). JPEG is fine for photos.
  const quality = mime === "image/jpeg" ? 0.92 : undefined;
  return canvas.toDataURL(mime, quality as any);
}
