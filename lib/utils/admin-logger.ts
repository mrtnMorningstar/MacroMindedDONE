import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase/config";

interface LogEntry {
  action: string;
  user?: string;
  userId?: string;
  type: string;
  details?: string;
  timestamp?: any;
}

export async function logAdminAction(entry: LogEntry) {
  try {
    await addDoc(collection(db, "systemLogs"), {
      ...entry,
      timestamp: serverTimestamp(),
    });
  } catch (error) {
    // Silently fail logging - don't break the app
    if (process.env.NODE_ENV === "development") {
      console.error("[admin-logger] Failed to log action:", error);
    }
  }
}

