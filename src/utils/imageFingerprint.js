import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase/config";

/**
 * Stores ownership metadata for an uploaded image to track authorship and usage.
 * @param {Object} params
 * @param {string} params.imageUrl - The public URL of the optimized image.
 * @param {string} params.originalFileName - The original file name before processing.
 * @param {string} [params.projectId] - The ID of the project the image is associated with (if any).
 * @param {string} [params.author="Devendra Surve"] - The author of the image.
 * @param {string} [params.copyrightOwner="Devendra Surve"] - The copyright owner of the image.
 * @returns {Promise<string>} - The document ID of the recorded fingerprint.
 */
export const recordImageFingerprint = async ({ 
  imageUrl, 
  originalFileName, 
  projectId = null, 
  author = "Devendra Surve", 
  copyrightOwner = "Devendra Surve" 
}) => {
  try {
    const fingerprintsRef = collection(db, "imageFingerprints");
    const docRef = await addDoc(fingerprintsRef, {
      imageUrl,
      originalFileName,
      projectId,
      author,
      copyrightOwner,
      uploadDate: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error("Error recording image fingerprint:", error);
    throw error;
  }
};
