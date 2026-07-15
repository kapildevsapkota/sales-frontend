import imageCompression from "browser-image-compression";

export interface CompressionOptions {
  maxSizeMB?: number;
  maxWidthOrHeight?: number;
  useWebWorker?: boolean;
  onProgress?: (progress: number) => void;
}

export const compressImage = async (
  file: File,
  options: CompressionOptions = {},
): Promise<File> => {
  const {
    maxSizeMB = 0.4, // Default to 400KB (0.4MB)
    maxWidthOrHeight = 1920,
    useWebWorker = true,
    onProgress,
  } = options;

  const compressionOptions = {
    maxSizeMB,
    maxWidthOrHeight,
    useWebWorker,
    onProgress,
  };

  try {
    console.log(`[Image Compressor] Starting compression for: ${file.name}`);
    console.log(
      `[Image Compressor] Original size: ${(file.size / 1024).toFixed(2)} KB`,
    );
    const compressedFile = await imageCompression(file, compressionOptions);
    console.log(
      `[Image Compressor] Compressed size: ${(compressedFile.size / 1024).toFixed(2)} KB`,
    );
    return compressedFile;
  } catch (error) {
    console.error("[Image Compressor] Error during compression:", error);
    // Return original file if compression fails as a fallback
    return file;
  }
};

export const DEFAULT_MAX_IMAGE_SIZE = 400 * 1024; // 400kb
