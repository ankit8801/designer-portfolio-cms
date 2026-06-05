import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from "firebase/auth";
import { auth } from "../config";

export const loginAdmin = async (email, password) => {
  if (!auth) throw new Error("Firebase Auth is not initialized. Check your .env.local credentials.");
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return { success: true, user: userCredential.user };
  } catch (error) {
    console.error("Login Error:", error);
    throw error;
  }
};

export const logoutAdmin = async () => {
  if (!auth) throw new Error("Firebase Auth is not initialized.");
  try {
    await signOut(auth);
    return { success: true };
  } catch (error) {
    console.error("Logout Error:", error);
    throw new Error("Failed to secure sign out");
  }
};

export const subscribeToAuthChanges = (callback) => {
  // If auth isn't available (missing credentials), immediately call back with null user
  if (!auth) {
    callback(null);
    return () => {}; // no-op unsubscribe
  }
  return onAuthStateChanged(auth, (user) => {
    callback(user);
  });
};
