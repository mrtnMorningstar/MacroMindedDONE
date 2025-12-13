"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase/config";
import { collection, query, where, orderBy, onSnapshot, limit } from "firebase/firestore";
import { useAuth } from "@/context/auth-context";
import { CheckCircle, TrendingUp, Flame, Activity, Scale, FileText } from "lucide-react";
import { ProgressTimelineSkeleton } from "@/components/dashboard/skeletons";

export function ProgressTimeline() {
  const { user } = useAuth();
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.uid) {
      setLoading(false);
      return;
    }

    let q;
    try {
      q = query(
        collection(db, "progress"),
        where("userId", "==", user.uid),
        orderBy("date", "desc"),
        limit(50)
      );
    } catch (error: any) {
      // If index error, use fallback query
      if (error.code === "failed-precondition") {
        q = query(
          collection(db, "progress"),
          where("userId", "==", user.uid)
        );
      } else {
        console.error("Error setting up query:", error);
        setLoading(false);
        return;
      }
    }

    const unsub = onSnapshot(
      q,
      (snap) => {
        const progressEntries = snap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }));

        // Sort by date if orderBy wasn't applied
        if (progressEntries.length > 1) {
          const firstDate = progressEntries[0].date?.toDate ? progressEntries[0].date.toDate() : new Date(progressEntries[0].date || progressEntries[0].createdAt?.toDate ? progressEntries[0].createdAt.toDate() : progressEntries[0].createdAt || 0);
          const secondDate = progressEntries[1].date?.toDate ? progressEntries[1].date.toDate() : new Date(progressEntries[1].date || progressEntries[1].createdAt?.toDate ? progressEntries[1].createdAt.toDate() : progressEntries[1].createdAt || 0);
          
          if (firstDate.getTime() < secondDate.getTime()) {
            progressEntries.sort((a, b) => {
              const dateA = a.date?.toDate ? a.date.toDate() : new Date(a.date || a.createdAt?.toDate ? a.createdAt.toDate() : a.createdAt || 0);
              const dateB = b.date?.toDate ? b.date.toDate() : new Date(b.date || b.createdAt?.toDate ? b.createdAt.toDate() : b.createdAt || 0);
              return dateB.getTime() - dateA.getTime(); // Most recent first
            });
          }
        }

        setLogs(progressEntries);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching progress timeline:", error);
        setLoading(false);
      }
    );

    return () => unsub();
  }, [user?.uid]);

  if (loading) {
    return <ProgressTimelineSkeleton />;
  }

  if (!logs.length) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-gray-400 italic text-sm text-center py-12 rounded-xl bg-white/[0.02] border border-white/5"
      >
        No progress logged yet — start tracking to see your journey unfold!
      </motion.div>
    );
  }

  return (
    <div className="relative border-l-2 border-[#FF2E2E]/30 ml-6 pl-8 space-y-6">
      {logs.map((log, i) => {
        const logDate = log.date?.toDate ? log.date.toDate() : new Date(log.date || log.createdAt?.toDate ? log.createdAt.toDate() : log.createdAt || Date.now());
        
        return (
          <motion.div
            key={log.id || i}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05, type: "spring", stiffness: 100 }}
            className="relative"
          >
            {/* Timeline dot */}
            <div className="absolute -left-[2.4rem] top-2">
              <div className="relative">
                <div className="absolute inset-0 bg-[#FF2E2E] rounded-full animate-pulse opacity-50"></div>
                <CheckCircle className="text-[#FF2E2E] relative z-10" size={20} />
              </div>
            </div>

            {/* Content card */}
            <div className="p-5 rounded-xl border border-white/10 bg-white/[0.03] backdrop-blur-sm hover:bg-white/[0.05] transition-all shadow-lg">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-white text-lg">
                  {logDate.toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </h3>
                <span className="text-xs text-gray-400">
                  {logDate.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>

              {/* Metrics */}
              <div className="flex flex-wrap gap-4 text-sm text-gray-300 mb-3">
                {log.weight && (
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#FF2E2E]/10 border border-[#FF2E2E]/20">
                    <Scale size={16} className="text-[#FF2E2E]" />
                    <span className="font-medium">{log.weight} kg</span>
                  </div>
                )}
                {log.calories && (
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#FF2E2E]/10 border border-[#FF2E2E]/20">
                    <Flame size={16} className="text-[#FF2E2E]" />
                    <span className="font-medium">{log.calories.toLocaleString()} kcal</span>
                  </div>
                )}
                {log.steps && (
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#FF2E2E]/10 border border-[#FF2E2E]/20">
                    <Activity size={16} className="text-[#FF2E2E]" />
                    <span className="font-medium">{log.steps.toLocaleString()} steps</span>
                  </div>
                )}
                {log.compliancePercent !== null && log.compliancePercent !== undefined && (
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#00FF94]/10 border border-[#00FF94]/20">
                    <TrendingUp size={16} className="text-[#00FF94]" />
                    <span className="font-medium">{Math.round(log.compliancePercent)}% compliance</span>
                  </div>
                )}
              </div>

              {/* Note */}
              {log.note && (
                <div className="mt-3 pt-3 border-t border-white/5">
                  <div className="flex items-start gap-2">
                    <FileText size={14} className="text-gray-500 mt-0.5 flex-shrink-0" />
                    <p className="text-gray-400 italic text-sm leading-relaxed">"{log.note}"</p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

