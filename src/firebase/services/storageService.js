import { uploadToIMGBB } from "./imgbbService";

/**
 * Uploads a file (Blob or File) to IMGBB and returns the direct display URL.
 * @param {Blob|File} file - The file to upload.
 * @param {string} path - Ignored (kept for compatibility with existing code).
 * @returns {Promise<string>} - The download URL.
 */
export const uploadFile = async (file, path) => {
  try {
    const downloadURL = await uploadToIMGBB(file);
    return downloadURL;
  } catch (error) {
    console.error("Storage upload error:", error);
    throw new Error(`Upload failed: ${error.message}`);
  }
};
