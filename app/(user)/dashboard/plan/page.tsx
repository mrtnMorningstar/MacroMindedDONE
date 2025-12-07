"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/auth-context";
import { db } from "@/lib/firebase/config";
import { collection, query, orderBy, getDocs, addDoc, serverTimestamp } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { AnimatedCard } from "@/components/ui/animated-card";

export default function MyPlanPage() {
  const { user } = useAuth();
  const [plans, setPlans] = useState<any[]>([]);
  const [selected, setSelected] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.uid) return;

    (async () => {
      const plansCol = collection(db, "plans", user.uid, "versions");
      const plansQ = query(plansCol, orderBy("createdAt", "desc"));
      const snap = await getDocs(plansQ);
      const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setPlans(docs);
      setSelected(docs[0] || null);
      setLoading(false);
    })();
  }, [user?.uid]);

  const requestChange = async () => {
    if (!user?.uid) return;

    await addDoc(collection(db, "messages"), {
      userId: user.uid,
      sender: "user",
      senderId: user.uid,
      text: "Hi, I'd like to request an adjustment to my plan.",
      timestamp: serverTimestamp(),
      read: false,
    });
  };

  if (loading)
    return (
      <div className="text-gray-400 text-center py-10">Loading your plan...</div>
    );

  if (!selected)
    return (
      <div className="text-gray-400 text-center py-10">
        No plan available yet. Your expert will upload one soon.
      </div>
    );

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <h1 className="text-2xl font-black text-white">My Plan</h1>
        {plans.length > 1 && (
          <select
            onChange={(e) => setSelected(plans.find((p) => p.id === e.target.value))}
            className="bg-[#0f0f0f] border border-[#1f1f1f] text-gray-300 text-sm rounded-lg px-3 py-1 transition-all duration-200 hover:border-[#FF2E2E]/50 focus:outline-none focus:border-[#FF2E2E]"
          >
            {plans.map((p) => (
              <option key={p.id} value={p.id}>
                {p.createdAt?.toDate?.()?.toLocaleDateString?.() || "Version"}
              </option>
            ))}
          </select>
        )}
      </motion.div>

      <AnimatePresence mode="wait">
        <motion.div
          key={selected?.id}
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.3 }}
        >
          <AnimatedCard className="bg-gradient-to-br from-[#111]/90 to-[#0b0b0b] backdrop-blur-sm p-4 text-gray-300">
            {selected.fileUrl ? (
              <iframe
                src={selected.fileUrl}
                className="w-full h-[600px] rounded-lg border border-[#1f1f1f]"
                title="Meal Plan"
              />
            ) : selected.content ? (
              <pre className="whitespace-pre-wrap text-sm">{selected.content}</pre>
            ) : (
              <p>No plan file found.</p>
            )}
          </AnimatedCard>
        </motion.div>
      </AnimatePresence>

      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
        <Button
          onClick={requestChange}
          className="bg-[#FF2E2E] hover:bg-[#e62a2a] text-white transition-all duration-200 hover:shadow-[0_0_15px_rgba(255,46,46,0.4)]"
        >
          Request Change
        </Button>
      </motion.div>
    </div>
  );
}
