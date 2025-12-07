"use client";

import { useState, useEffect } from "react";
import { doc, onSnapshot, DocumentReference, DocumentSnapshot, FirestoreError } from "firebase/firestore";
import { db } from "@/lib/firebase/config";

interface UseRealtimeDocOptions {
  enabled?: boolean;
}

interface UseRealtimeDocResult<T = any> {
  data: T | null;
  loading: boolean;
  error: FirestoreError | null;
  exists: boolean;
}

/**
 * Hook to subscribe to a Firestore document in real-time
 * @param path - Document path (e.g., "users/123") or DocumentReference
 * @param options - Optional configuration
 * @returns { data, loading, error, exists }
 */
export function useRealtimeDoc<T = any>(
  path: string | DocumentReference | null | undefined,
  options: UseRealtimeDocOptions = {}
): UseRealtimeDocResult<T> {
  const { enabled = true } = options;
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<FirestoreError | null>(null);
  const [exists, setExists] = useState(false);

  useEffect(() => {
    if (!enabled || !path) {
      setLoading(false);
      return;
    }

    // Get document reference
    let docRef: DocumentReference;
    if (typeof path === "string") {
      docRef = doc(db, path);
    } else {
      docRef = path;
    }

    setLoading(true);
    setError(null);

    const unsubscribe = onSnapshot(
      docRef,
      (snapshot: DocumentSnapshot) => {
        setExists(snapshot.exists());
        if (snapshot.exists()) {
          setData({ id: snapshot.id, ...snapshot.data() } as T);
        } else {
          setData(null);
        }
        setLoading(false);
      },
      (err: FirestoreError) => {
        console.error("Error in useRealtimeDoc:", err);
        setError(err);
        setLoading(false);
        setData(null);
        setExists(false);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [path, enabled]);

  return { data, loading, error, exists };
}

