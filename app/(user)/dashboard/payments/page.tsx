"use client";

import { useAuth } from "@/context/auth-context";
import { db } from "@/lib/firebase/config";
import { collection, query, where, orderBy, getDocs } from "firebase/firestore";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { AnimatedCard } from "@/components/ui/animated-card";

export default function PaymentsPage() {
  const { user } = useAuth();
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.uid) return;

    (async () => {
      try {
        const q = query(
          collection(db, "payments"),
          where("userId", "==", user.uid),
          orderBy("createdAt", "desc")
        );
        const snap = await getDocs(q);
        setPayments(snap.docs.map((d) => d.data()));
      } catch (error: any) {
        // Fallback if index doesn't exist yet
        if (error?.code === "failed-precondition") {
          console.warn("Firestore index not created yet. Fetching payments without ordering.");
          const q = query(
            collection(db, "payments"),
            where("userId", "==", user.uid)
          );
          const snap = await getDocs(q);
          const paymentsData = snap.docs.map((d) => d.data());
          // Sort client-side as fallback
          paymentsData.sort((a, b) => {
            const dateA = a.createdAt?.toDate?.()?.getTime?.() || new Date(a.createdAt || 0).getTime();
            const dateB = b.createdAt?.toDate?.()?.getTime?.() || new Date(b.createdAt || 0).getTime();
            return dateB - dateA; // Descending order
          });
          setPayments(paymentsData);
        } else {
          console.error("Error fetching payments:", error);
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [user?.uid]);

  if (loading)
    return <p className="text-gray-400 text-center py-10">Loading payments...</p>;

  if (!payments.length)
    return <p className="text-gray-400 text-center py-10">No payments found.</p>;

  return (
    <div className="space-y-6">
      <motion.h1
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-2xl font-black text-white"
      >
        Payments & Billing
      </motion.h1>
      {payments.map((p, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: i * 0.1 }}
        >
          <AnimatedCard className="flex justify-between items-center p-4">
            <div>
              <div className="text-sm text-gray-400">{p.planTier || "Unknown Plan"}</div>
              <div className="text-lg font-semibold text-white">
                ${(p.amount / 100).toFixed(2)} {p.currency?.toUpperCase?.() || "USD"}
              </div>
              <div className="text-xs text-gray-500">
                {p.createdAt?.toDate?.()?.toLocaleDateString?.() || "Unknown date"}
              </div>
            </div>
            <div className="text-xs text-gray-400 capitalize">{p.status || "completed"}</div>
          </AnimatedCard>
        </motion.div>
      ))}
    </div>
  );
}
