"use client";

import { useAuth } from "@/context/auth-context";
import { db } from "@/lib/firebase/config";
import { collection, query, where, getDocs } from "firebase/firestore";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { AnimatedCard } from "@/components/ui/animated-card";

export default function InsightsPage() {
  const { user } = useAuth();
  const [progress, setProgress] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.uid) return;

    (async () => {
      try {
        const q = query(collection(db, "progress"), where("userId", "==", user.uid));
        const snap = await getDocs(q);
        setProgress(snap.docs.map((d) => d.data()));
      } catch (error) {
        console.error("Error fetching progress:", error);
      } finally {
        setLoading(false);
      }
    })();
  }, [user?.uid]);

  const avgCompliance =
    progress.length > 0
      ? progress.reduce((a, b) => a + (b.compliancePercent || 0), 0) /
        progress.length
      : 0;

  const summary =
    avgCompliance > 80
      ? "Excellent adherence! Keep up the consistency for optimal results."
      : avgCompliance > 50
      ? "You're making good progress — aim for more regular tracking."
      : "Your consistency could improve — try logging meals daily.";

  if (loading)
    return <p className="text-gray-400 text-center py-10">Loading insights...</p>;

  return (
    <AnimatedCard className="bg-[#111]/80 backdrop-blur-md border border-[#FF2E2E]/10 p-6 text-gray-300 space-y-3">
      <motion.h1
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-2xl font-black text-white"
      >
        AI Insights
      </motion.h1>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-gray-300"
      >
        {summary}
      </motion.p>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="text-sm text-gray-500"
      >
        Avg. Compliance: <span className="text-[#FF2E2E] font-semibold">{avgCompliance.toFixed(1)}%</span>
      </motion.p>
    </AnimatedCard>
  );
}
