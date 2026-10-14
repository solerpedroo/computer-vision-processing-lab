export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;
export const MAX_IMAGE_DIMENSION = 4096;

export function acceptedImage(file: File): boolean {
  return ["image/png", "image/jpeg"].includes(file.type) || /\.(png|jpe?g)$/i.test(file.name);
}

export function loadImageDimensions(source: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve({ width: image.naturalWidth, height: image.naturalHeight });
    image.onerror = () => reject(new Error("The selected file cannot be displayed as an image."));
    image.src = source;
  });
}
