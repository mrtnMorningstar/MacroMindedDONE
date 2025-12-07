"use client";

import { motion } from "framer-motion";
import { Gauge, Activity, ClipboardList, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { useAuth } from "@/context/auth-context";
import { cn } from "@/lib/utils";

export default function OverviewPage() {
  const { user } = useAuth();
  const [progress, setProgress] = useState(0);
  const [consistency, setConsistency] = useState(0);
  const [planStatus, setPlanStatus] = useState("Pending");
  const [aiMessage, setAiMessage] = useState("Analyzing your recent performance...");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      if (!user?.uid) {
        setLoading(false);
        return;
      }

      try {
        // Fetch user document for plan status
        const userDocRef = doc(db, "users", user.uid);
        const userDocSnap = await getDoc(userDocRef);
        
        if (userDocSnap.exists()) {
          const userData = userDocSnap.data();
          setPlanStatus(userData.planStatus || "Pending");
        }

        // Fetch progress data
        const progressRef = collection(db, "progress");
        const progressSnap = await getDocs(progressRef);
        
        // Calculate progress and consistency from user's progress entries
        const userProgress = progressSnap.docs
          .filter((doc) => doc.data().userId === user.uid)
          .map((doc) => doc.data());

        if (userProgress.length > 0) {
          // Calculate average compliance as progress
          const avgCompliance = userProgress.reduce((sum, entry) => {
            return sum + (entry.compliancePercent || 0);
          }, 0) / userProgress.length;
          
          setProgress(Math.round(avgCompliance));

          // Calculate consistency (entries in last 7 days)
          const sevenDaysAgo = new Date();
          sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
          
          const recentEntries = userProgress.filter((entry) => {
            const entryDate = entry.date?.toDate ? entry.date.toDate() : new Date(entry.date);
            return entryDate >= sevenDaysAgo;
          });

          // Consistency = (recent entries / expected entries) * 100
          // Expected: 7 entries (one per day)
          const consistencyPercent = Math.min(100, Math.round((recentEntries.length / 7) * 100));
          setConsistency(consistencyPercent);
        } else {
          // Default values if no progress data
          setProgress(0);
          setConsistency(0);
        }
      } catch (err) {
        console.error("Error fetching overview data:", err);
        // Fallback to default values
        setProgress(0);
        setConsistency(0);
        setPlanStatus("Pending");
      } finally {
        setLoading(false);
        // Generate AI summary after data is loaded
        setTimeout(() => {
          if (consistency >= 80) {
            setAiMessage("Momentum is strong 🔥 You're " + consistency + "% consistent this week. Stay focused — great things compound.");
          } else if (consistency >= 50) {
            setAiMessage("You're making progress! Aim for daily logging to boost your consistency. Every entry counts.");
          } else {
            setAiMessage("Getting started is the hardest part. Log your first entry today to begin tracking your journey.");
          }
        }, 1200);
      }
    }

    fetchData();
  }, [user?.uid, consistency]);

  const cards = [
    {
      icon: Gauge,
      label: "Progress to Goal",
      value: `${progress}%`,
      sub: "Overall progress",
      color: "from-[#FF2E2E]/20 to-[#FF2E2E]/5 text-[#FF2E2E]",
    },
    {
      icon: Activity,
      label: "Consistency",
      value: `${consistency}%`,
      sub: "Week performance",
      color: "from-[#00FF94]/20 to-[#00FF94]/5 text-[#00FF94]",
    },
    {
      icon: ClipboardList,
      label: "Plan Status",
      value: planStatus,
      sub: "Current program",
      color: "from-[#FFD60A]/20 to-[#FFD60A]/5 text-[#FFD60A]",
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF2E2E] mx-auto mb-4"></div>
          <p className="text-gray-400">Loading your overview...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
      >
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Welcome back, <span className="text-[#FF2E2E]">{user?.displayName || user?.email?.split("@")[0] || "there"}</span> 👋
          </h1>
          <p className="text-gray-400 mt-2">Here's your focus for today.</p>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="grid sm:grid-cols-3 gap-6"
      >
        {cards.map((card, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + i * 0.1 }}
            whileHover={{ scale: 1.03 }}
            className={cn(
              "rounded-2xl border border-white/10 p-6 backdrop-blur-xl bg-gradient-to-br shadow-xl transition-all",
              card.color
            )}
          >
            <div className="flex items-center justify-between mb-4">
              <card.icon className="w-6 h-6" />
            </div>
            <h2 className="text-3xl font-bold">{card.value}</h2>
            <p className="text-gray-400 text-sm mt-1">{card.label}</p>
            <p className="text-xs text-gray-500 mt-2">{card.sub}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* AI Summary Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="rounded-2xl border border-white/10 p-6 backdrop-blur-xl bg-gradient-to-br from-[#1E1E1E]/40 to-[#0A0A0A]/60 shadow-2xl"
      >
        <div className="flex items-center gap-3 mb-3">
          <Sparkles className="text-[#FF2E2E] w-5 h-5" />
          <h3 className="font-semibold text-lg">AI-Generated Summary</h3>
        </div>
        <motion.p
          key={aiMessage}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-gray-300 leading-relaxed"
        >
          {aiMessage}
        </motion.p>
      </motion.div>
    </div>
  );
}
