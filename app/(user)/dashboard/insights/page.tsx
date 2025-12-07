"use client";

import { useAuth } from "@/context/auth-context";
import { db } from "@/lib/firebase/config";
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { generateUserInsights } from "@/lib/ai/insights";
import { AnimatedCard } from "@/components/ui/animated-card";
import { motion } from "framer-motion";

export default function InsightsPage() {
  const { user } = useAuth();
  const [progress, setProgress] = useState<any[]>([]);
  const [plan, setPlan] = useState<any | null>(null);
  const [insight, setInsight] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.uid) return;

    (async () => {
      try {
        const progQ = query(collection(db, "progress"), where("userId", "==", user.uid));
        const progSnap = await getDocs(progQ);
        const progressData = progSnap.docs.map((d) => d.data());
        setProgress(progressData);

        const planSnap = await getDoc(doc(db, "users", user.uid));
        const planData = planSnap.exists() ? planSnap.data() : null;
        setPlan(planData);

        const result = generateUserInsights({
          progress: progressData,
          plan: planData,
        });
        setInsight(result);
      } catch (error) {
        console.error("Error fetching insights data:", error);
      } finally {
        setLoading(false);
      }
    })();
  }, [user?.uid]);

  if (loading)
    return <p className="text-gray-400 text-center py-10">Loading AI insights...</p>;

  if (!insight)
    return <p className="text-gray-400 text-center py-10">Unable to generate insights.</p>;

  return (
    <div className="space-y-6">
      <motion.h1
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-2xl font-black text-white"
      >
        Personalized <span className="text-[#FF2E2E]">Insights</span>
      </motion.h1>

      <AnimatedCard className="bg-gradient-to-br from-[#111]/90 to-[#0b0b0b] backdrop-blur-sm border border-[#FF2E2E]/20 relative overflow-hidden">
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-[#FF2E2E]/5 via-transparent to-transparent"
          animate={{ x: ["-100%", "100%"] }}
          transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
        />
        <div className="relative z-10">
          <motion.h2
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-lg font-semibold text-[#FF2E2E] mb-2 flex items-center gap-2"
          >
            <motion.span
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              Summary
            </motion.span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-gray-300 text-sm leading-relaxed"
          >
            {insight.summary}
          </motion.p>
        </div>
      </AnimatedCard>

      <AnimatedCard className="bg-gradient-to-br from-[#111]/90 to-[#0b0b0b] backdrop-blur-sm border border-[#FF2E2E]/10">
        <motion.h2
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-lg font-semibold text-[#FF2E2E] mb-2"
        >
          Recommendations
        </motion.h2>
        <ul className="list-disc ml-6 text-sm space-y-2 text-gray-300">
          {insight.recommendations.map((r: string, i: number) => (
            <motion.li
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + i * 0.1 }}
            >
              {r}
            </motion.li>
          ))}
        </ul>
      </AnimatedCard>

      <AnimatedCard className="bg-gradient-to-br from-[#111]/90 to-[#0b0b0b] backdrop-blur-sm">
        <motion.h2
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-lg font-semibold text-[#FF2E2E] mb-2"
        >
          Performance Summary
        </motion.h2>
        <div className="flex flex-wrap gap-6 text-sm text-gray-400">
          <div>
            <span className="text-white font-semibold">{insight.avgWeight}</span> kg average
          </div>
          <div>
            <span className="text-white font-semibold">{insight.compliance}%</span> average compliance
          </div>
          <div>
            <span className="text-white font-semibold">{progress.length}</span> total entries
          </div>
        </div>
      </AnimatedCard>

      {/* Talk to My Plan AI Widget */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="rounded-xl border border-[#1f1f1f] bg-gradient-to-br from-[#111]/80 to-[#0b0b0b] backdrop-blur-sm p-4"
      >
        <p className="text-sm text-gray-400 mb-2">Ask your plan anything:</p>
        <textarea
          placeholder="e.g. How can I improve my recovery?"
          className="w-full bg-[#0f0f0f] border border-[#1f1f1f] rounded-lg text-gray-300 text-sm px-3 py-2 focus:border-[#FF2E2E]/50 focus:outline-none transition-all duration-200 resize-none"
          rows={3}
        />
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="mt-3 bg-[#FF2E2E] hover:bg-[#e62a2a] text-white text-sm font-semibold rounded-lg px-4 py-2 transition-all duration-200 hover:shadow-[0_0_15px_rgba(255,46,46,0.4)]"
        >
          Generate Response
        </motion.button>
      </motion.div>
    </div>
  );
}
