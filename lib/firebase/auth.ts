import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  signInWithPopup,
  GoogleAuthProvider,
  User,
  onAuthStateChanged,
} from "firebase/auth";
import { auth, db } from "@/lib/firebaseConfig";
import { doc, setDoc, getDoc } from "firebase/firestore";

const googleProvider = new GoogleAuthProvider();

export const signIn = async (email: string, password: string) => {
  return await signInWithEmailAndPassword(auth, email, password);
};

export const signUp = async (email: string, password: string, name: string) => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;
  
  // Create user document in Firestore
  await setDoc(doc(db, "users", user.uid), {
    email: user.email,
    name,
    role: "client",
    createdAt: new Date().toISOString(),
  });
  
  return userCredential;
};

export const logout = async () => {
  return await signOut(auth);
};

export const getCurrentUser = (): Promise<User | null> => {
  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe();
      resolve(user);
    });
  });
};

export const getUserData = async (uid: string) => {
  const userDoc = await getDoc(doc(db, "users", uid));
  return userDoc.exists() ? userDoc.data() : null;
};

export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;

    // Check if user document exists
    const userDoc = await getDoc(doc(db, "users", user.uid));
    
    if (!userDoc.exists()) {
      // Create user document if it doesn't exist
      await setDoc(doc(db, "users", user.uid), {
        email: user.email,
        name: user.displayName || "User",
        role: "client",
        createdAt: new Date().toISOString(),
        photoURL: user.photoURL || null,
      });
    } else {
      // Update photo URL if it exists
      const existingData = userDoc.data();
      if (user.photoURL && !existingData.photoURL) {
        await setDoc(
          doc(db, "users", user.uid),
          { photoURL: user.photoURL },
          { merge: true }
        );
      }
    }

    return result;
  } catch (error: any) {
    console.error("Google sign-in error:", error);
    throw error;
  }
};

