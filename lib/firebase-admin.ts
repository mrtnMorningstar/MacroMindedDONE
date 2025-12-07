/**
 * Server-side Firebase initialization for API routes
 * This is separate from the client-side config to avoid SSR issues
 */

import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import { getFirestore, Firestore } from "firebase/firestore";

let app: FirebaseApp | null = null;
let db: Firestore | null = null;

function initializeFirebase() {
  // Return cached instances if already initialized
  if (app && db) {
    return { app, db };
  }

  // Check if we're in a server environment
  if (typeof window !== "undefined") {
    console.warn("firebase-admin should only be used on the server side");
    return { app: null, db: null };
  }

  const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  };

  try {
    // Validate required config
    if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
      console.warn("Firebase configuration is missing. Please set NEXT_PUBLIC_FIREBASE_* environment variables.");
      return { app: null, db: null };
    }

    // Initialize Firebase app if not already initialized
    if (!getApps().length) {
      app = initializeApp(firebaseConfig);
    } else {
      // Get existing app
      app = getApps()[0];
    }

    // Initialize Firestore
    if (app) {
      db = getFirestore(app);
    }

    return { app, db };
  } catch (error: any) {
    console.error("Firebase initialization error:", error);
    // Don't throw - return null values instead
    return { app: null, db: null };
  }
}

// Lazy initialization - only initialize when first accessed
export function getDb(): Firestore | null {
  if (!db) {
    const result = initializeFirebase();
    db = result.db;
    app = result.app;
  }
  return db;
}

export function getApp(): FirebaseApp | null {
  if (!app) {
    const result = initializeFirebase();
    app = result.app;
    db = result.db;
  }
  return app;
}

// Export for backward compatibility (but will be null until initialized)
export { db, app };
export default app;

