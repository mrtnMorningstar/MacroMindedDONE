"use client";

import { useAuth } from "@/context/auth-context";
import { doc, getDoc, collection, query, where, orderBy, limit, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { AnimatedCard } from "@/components/ui/animated-card";

export default function OverviewPage() {
  const { user } = useAuth();
  const [userDoc, setUserDoc] = useState<any>(null);
  const [expert, setExpert] = useState<any>(null);
  const [latestPlan, setLatestPlan] = useState<any>(null);
  const [progress, setProgress] = useState<any[]>([]);

  useEffect(() => {
    if (!user?.uid) return;

    (async () => {
      const uSnap = await getDoc(doc(db, "users", user.uid));
      const u = uSnap.exists() ? uSnap.data() : null;
      setUserDoc(u);

      if (u?.assignedExpertId) {
        const eSnap = await getDoc(doc(db, "users", u.assignedExpertId));
        setExpert(eSnap.exists() ? eSnap.data() : null);
      }

      const plansCol = collection(db, "plans", user.uid, "versions");
      const plansQ = query(plansCol, orderBy("createdAt","desc"), limit(1));
      const pSnap = await getDocs(plansQ);
      setLatestPlan(pSnap.docs[0]?.data() || null);

      try {
        const progCol = collection(db, "progress");
        const prQ = query(progCol, where("userId","==", user.uid), orderBy("date","asc"));
        const prSnap = await getDocs(prQ);
        setProgress(prSnap.docs.map(d => d.data()));
      } catch (error: any) {
        // If index doesn't exist yet, fetch without orderBy as fallback
        if (error?.code === "failed-precondition") {
          console.warn("Firestore index not created yet. Fetching progress without ordering.");
          const progCol = collection(db, "progress");
          const prQ = query(progCol, where("userId","==", user.uid));
          const prSnap = await getDocs(prQ);
          const progressData = prSnap.docs.map(d => d.data());
          // Sort client-side as fallback
          progressData.sort((a: any, b: any) => {
            const dateA = a.date?.toDate?.() || new Date(a.date || 0);
            const dateB = b.date?.toDate?.() || new Date(b.date || 0);
            return dateA.getTime() - dateB.getTime();
          });
          setProgress(progressData);
        } else {
          console.error("Error fetching progress:", error);
        }
      }
    })();
  }, [user?.uid]);

  const name = userDoc?.firstName || userDoc?.displayName || "there";
  const planStatus = userDoc?.planStatus || "Pending";

  const latestWeight = progress[progress.length-1]?.weight ?? null;
  const startWeight = progress[0]?.weight ?? latestWeight;
  const goalWeight = userDoc?.goalWeight ?? latestWeight;
  const progressPct = (latestWeight && goalWeight && startWeight)
    ? Math.max(0, Math.min(100, ((startWeight - latestWeight) / (startWeight - goalWeight)) * 100))
    : 0;

  return (
    <div className="space-y-6">
      <motion.h1
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="text-2xl font-black"
      >
        Welcome back, <span className="text-[#FF2E2E]">{name}</span> 👋
      </motion.h1>

      <div className="grid gap-4 md:grid-cols-3">
        <AnimatedCard className={planStatus === "Pending" ? "relative" : ""}>
          {planStatus === "Pending" && (
            <motion.div
              className="absolute inset-0 rounded-xl bg-[#FF2E2E]/10"
              animate={{ opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          )}
          <div className="mb-2 text-sm text-gray-400">Active Plan</div>
          <div className="text-lg font-semibold text-white relative z-10">{planStatus}</div>
          <div className="mt-2 text-xs text-gray-500 relative z-10">
            {latestPlan
              ? <>Updated: {latestPlan?.createdAt?.toDate?.()?.toLocaleDateString?.()}</>
              : "No plan uploaded yet"}
          </div>
        </AnimatedCard>

        <AnimatedCard>
          <div className="mb-2 text-sm text-gray-400">Your Expert</div>
          {expert ? (
            <>
              <div className="font-semibold text-white">{expert.firstName || expert.displayName || "Expert"}</div>
              <div className="text-xs text-gray-500">Status: {expert.isOnline ? "Online" : "Offline"}</div>
            </>
          ) : <div className="text-gray-400">Not assigned yet</div>}
        </AnimatedCard>

        <AnimatedCard className={progressPct >= 80 ? "hover:shadow-[0_0_20px_rgba(255,46,46,0.4)]" : ""}>
          <div className="mb-2 text-sm text-gray-400">Progress to Goal</div>
          <motion.div
            className="text-2xl font-black text-[#FF2E2E]"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {Math.round(progressPct)}%
          </motion.div>
          <div className="text-xs text-gray-500">Based on your latest entries</div>
        </AnimatedCard>
      </div>

      <AnimatedCard className="bg-gradient-to-br from-[#0f0f0f] to-[#0b0b0b]">
        <div className="mb-2 text-sm text-gray-400">AI Suggestion</div>
        <div className="text-sm text-gray-300">
          {progressPct >= 80
            ? "You're close to your goal — keep consistency high and consider a small calorie taper."
            : "Stay consistent with your plan. Hit protein targets and keep steps up — momentum builds progress."}
        </div>
      </AnimatedCard>
    </div>
  );
}

