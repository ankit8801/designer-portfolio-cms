import { collection, getDocs, addDoc, serverTimestamp, query, orderBy, getDoc, doc, updateDoc, deleteDoc, limit, startAfter } from "firebase/firestore";
import { db } from "../config";

const PROJECTS_COLLECTION = "projects";

/**
 * Maps a legacy architect-schema document to the new designer portfolio schema.
 * Ensures old Firestore entries render gracefully without data migration.
 */
const normalizeProject = (data) => {
  // Already using the new blocks schema
  if (Array.isArray(data.blocks)) {
    return {
      ...data,
      thumbnail: data.thumbnail || data.mainImage || data.images?.[0]?.url || data.images?.[0] || '',
      category: data.category || 'Design',
    };
  }

  // Legacy schema detected — auto-generate blocks from old fields
  const blocks = [];
  const description = data.philosophy || data.description || '';
  if (description) {
    blocks.push({ type: 'text', content: description });
  }
  // Skip the first image (was the featured/main image, now becomes thumbnail)
  const extraImages = (data.images || []).slice(1);
  if (extraImages.length > 0) {
    const gridImages = extraImages.map((img) => ({
      url: typeof img === 'string' ? img : img.url,
      caption: typeof img === 'object' ? (img.title || img.desc || '') : '',
    }));
    if (gridImages.length === 1) {
      blocks.push({ type: 'image', url: gridImages[0].url, caption: gridImages[0].caption });
    } else {
      blocks.push({ type: 'photo_grid', images: gridImages });
    }
  }

  return {
    ...data,
    thumbnail: data.mainImage || data.images?.[0]?.url || data.images?.[0] || '',
    category: data.category || data.subtitle || 'Design',
    featured: data.featured || false,
    blocks,
  };
};

export const fetchProjects = async () => {
  try {
    const q = query(collection(db, PROJECTS_COLLECTION), orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...normalizeProject(doc.data()),
    }));
  } catch (error) {
    console.error("Error fetching projects:", error);
    throw new Error("Failed to load projects");
  }
};

export const createProject = async (projectData) => {
  try {
    // Validate required fields for new schema
    const missing = [];
    if (!projectData.title) missing.push("title");
    if (!projectData.thumbnail) missing.push("thumbnail");
    if (!projectData.category) missing.push("category");
    if (missing.length > 0) {
      throw new Error(`Missing required fields: ${missing.join(", ")}`);
    }

    console.log(`--- Firestore Write: Creating Project to [${PROJECTS_COLLECTION}] ---`);
    console.log("Payload:", JSON.stringify(projectData, null, 2));

    const docRef = await addDoc(collection(db, PROJECTS_COLLECTION), {
      ...projectData,
      blocks: projectData.blocks || [],
      featured: projectData.featured || false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    console.log("Firestore Success: Project ID", docRef.id);
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error("Firestore Write Error (Create):", error.code, error.message);
    throw new Error(error.message || "Failed to create project entry");
  }
};

export const getProjectById = async (id) => {
  try {
    const docRef = doc(db, PROJECTS_COLLECTION, id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...normalizeProject(docSnap.data()) };
    }
    return null;
  } catch (error) {
    console.error("Error fetching project:", error);
    throw new Error("Failed to load project details");
  }
};

export const getNextProject = async (currentProjectCreatedAt) => {
  try {
    if (!currentProjectCreatedAt) return null;
    
    // Attempt to get the next project (older than current)
    const nextQ = query(
      collection(db, PROJECTS_COLLECTION),
      orderBy("createdAt", "desc"),
      startAfter(currentProjectCreatedAt),
      limit(1)
    );
    let snapshot = await getDocs(nextQ);

    // If we are at the end of the list, loop back to the newest project
    if (snapshot.empty) {
      const firstQ = query(
        collection(db, PROJECTS_COLLECTION),
        orderBy("createdAt", "desc"),
        limit(1)
      );
      snapshot = await getDocs(firstQ);
    }

    if (!snapshot.empty) {
      const docSnap = snapshot.docs[0];
      return { id: docSnap.id, ...normalizeProject(docSnap.data()) };
    }
    return null;
  } catch (error) {
    console.error("Error fetching next project:", error);
    return null;
  }
};

export const updateProject = async (id, updatedData) => {
  try {
    console.log(`--- Firestore Write: Updating Project ${id} ---`);
    console.log("Payload:", JSON.stringify(updatedData, null, 2));

    const docRef = doc(db, PROJECTS_COLLECTION, id);
    await updateDoc(docRef, {
      ...updatedData,
      updatedAt: serverTimestamp(),
    });

    console.log("Firestore Success: Project updated");
    return { success: true };
  } catch (error) {
    console.error("Firestore Write Error (Update):", error);
    throw new Error(error.message || "Failed to update project entry");
  }
};

export const deleteProject = async (id) => {
  try {
    const docRef = doc(db, PROJECTS_COLLECTION, id);
    await deleteDoc(docRef);
    return { success: true };
  } catch (error) {
    console.error("Error deleting project:", error);
    throw new Error("Failed to delete project entry");
  }
};
