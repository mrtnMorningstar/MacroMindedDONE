"use client";

import { useEffect, useState } from "react";
import { onSnapshot, Query, CollectionReference } from "firebase/firestore";

export function useCol<T extends { id: string }>(
  ref: Query | CollectionReference | null
) {
  const [data, setData] = useState<T[]>([]);
  const [error, setError] = useState<any>(null);
  const [loading, setLoading] = useState(!!ref);

  useEffect(() => {
    if (!ref) {
      setData([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsub = onSnapshot(
      ref as any,
      (snap) => {
        setData(
          snap.docs.map((d: any) => ({
            id: d.id,
            ...(d.data() as Omit<T, "id">),
          }))
        );
        setError(null);
        setLoading(false);
      },
      (err) => {
        console.error("[useCol] Firestore error:", err);
        setError(err);
        setLoading(false);
      }
    );

    return () => unsub();
  }, [ref]);

  return { data, error, loading };
}

