export type ImageMetadata = {
  fileName: string;
  fileSizeBytes: number;
  mediaType: string;
  width: number;
  height: number;
  channels: 3;
};

export function imageMetadata(
  file: Pick<File, "name" | "size" | "type">,
  dimensions: { width: number; height: number },
): ImageMetadata {
  return {
    fileName: file.name,
    fileSizeBytes: file.size,
    mediaType: file.type || "unknown",
    width: dimensions.width,
    height: dimensions.height,
    channels: 3,
  };
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MiB`;
}

export function pngBase64ToFile(base64: string, name: string): File {
  const binary = atob(base64);
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  return new File([bytes], name, { type: "image/png" });
}
