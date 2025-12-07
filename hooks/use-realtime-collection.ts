"use client";

import { useState, useEffect } from "react";
import {
  collection,
  query,
  onSnapshot,
  Query,
  CollectionReference,
  QuerySnapshot,
  FirestoreError,
} from "firebase/firestore";
import { db } from "@/lib/firebase/config";

interface UseRealtimeCollectionOptions {
  enabled?: boolean;
}

interface UseRealtimeCollectionResult<T = any> {
  data: T[];
  loading: boolean;
  error: FirestoreError | null;
}

/**
 * Hook to subscribe to a Firestore collection query in real-time
 * @param pathOrQuery - Collection path (e.g., "users"), CollectionReference, or Query
 * @param options - Optional configuration
 * @returns { data, loading, error }
 */
export function useRealtimeCollection<T = any>(
  pathOrQuery: string | CollectionReference | Query | null | undefined,
  options: UseRealtimeCollectionOptions = {}
): UseRealtimeCollectionResult<T> {
  const { enabled = true } = options;
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<FirestoreError | null>(null);

  useEffect(() => {
    if (!enabled || !pathOrQuery) {
      setLoading(false);
      return;
    }

    // Get query reference
    let queryRef: Query | CollectionReference;
    if (typeof pathOrQuery === "string") {
      queryRef = collection(db, pathOrQuery);
    } else {
      queryRef = pathOrQuery;
    }

    setLoading(true);
    setError(null);

    const unsubscribe = onSnapshot(
      queryRef,
      (snapshot: QuerySnapshot) => {
        const docs = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as T[];
        setData(docs);
        setLoading(false);
      },
      (err: FirestoreError) => {
        console.error("Error in useRealtimeCollection:", err);
        setError(err);
        setLoading(false);
        setData([]);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [pathOrQuery, enabled]);

  return { data, loading, error };
}

