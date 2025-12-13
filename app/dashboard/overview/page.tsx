"use client";

import { motion } from "framer-motion";
import { Trophy, Flame, Target, RefreshCcw, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { collection, query, where, orderBy, onSnapshot, doc, getDoc, limit } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { useAuth } from "@/context/auth-context";
import { calculateStreak, calculateGoalProgress } from "@/lib/insights";
import { Button } from "@/components/ui/button";
import { Achievements } from "@/components/dashboard/achievements";
import { cn } from "@/lib/utils";

export default function OverviewPage() {
  const { user } = useAuth();
  const [logs, setLogs] = useState<any[]>([]);
  const [goal, setGoal] = useState<any>(null);
  const [streak, setStreak] = useState(0);
  const [progress, setProgress] = useState(0);
  const [planStatus, setPlanStatus] = useState("Pending");
  const [aiMessage, setAiMessage] = useState("Analyzing your recent performance...");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.uid) {
      setLoading(false);
      return;
    }

    // Get progress logs with real-time listener
    let q;
    try {
      q = query(
        collection(db, "progress"),
        where("userId", "==", user.uid),
        orderBy("date", "asc"),
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

    const unsubLogs = onSnapshot(
      q,
      (snapshot) => {
        const userLogs = snapshot.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }));
        
        // Sort by date if orderBy wasn't applied
        if (userLogs.length > 1) {
          const firstDate = userLogs[0].date?.toDate ? userLogs[0].date.toDate() : new Date(userLogs[0].date || userLogs[0].createdAt?.toDate ? userLogs[0].createdAt.toDate() : userLogs[0].createdAt || 0);
          const secondDate = userLogs[1].date?.toDate ? userLogs[1].date.toDate() : new Date(userLogs[1].date || userLogs[1].createdAt?.toDate ? userLogs[1].createdAt.toDate() : userLogs[1].createdAt || 0);
          
          if (firstDate.getTime() > secondDate.getTime()) {
            userLogs.sort((a, b) => {
              const dateA = a.date?.toDate ? a.date.toDate() : new Date(a.date || a.createdAt?.toDate ? a.createdAt.toDate() : a.createdAt || 0);
              const dateB = b.date?.toDate ? b.date.toDate() : new Date(b.date || b.createdAt?.toDate ? b.createdAt.toDate() : b.createdAt || 0);
              return dateA.getTime() - dateB.getTime();
            });
          }
        }
        
        setLogs(userLogs);
        setStreak(calculateStreak(userLogs));
      },
      (error) => {
        console.error("Error fetching logs:", error);
        setLoading(false);
      }
    );

    // Get user document for plan status
    const userDocRef = doc(db, "users", user.uid);
    getDoc(userDocRef).then((userDocSnap) => {
      if (userDocSnap.exists()) {
        const userData = userDocSnap.data();
        setPlanStatus(userData.planStatus || "Pending");
      }
    });

    // Get goal from users/{userId}/goals/default
    const goalRef = doc(db, "users", user.uid, "goals", "default");
    getDoc(goalRef)
      .then((goalSnap) => {
        if (goalSnap.exists()) {
          setGoal(goalSnap.data());
        }
        setLoading(false);
      })
      .catch((error) => {
        console.warn("Could not fetch goal:", error);
        setLoading(false);
      });

    return () => {
      unsubLogs();
    };
  }, [user?.uid]);

  useEffect(() => {
    if (goal && logs.length > 0) {
      const p = calculateGoalProgress(goal, logs);
      setProgress(p);
    } else {
      setProgress(0);
    }

    // Generate AI summary based on streak and progress
    setTimeout(() => {
      if (streak >= 7) {
        setAiMessage(`🔥 Incredible consistency — ${streak} days in a row! You're ${progress}% towards your goal. Keep the momentum going!`);
      } else if (streak >= 3) {
        setAiMessage(`💪 You're building great habits with a ${streak}-day streak! ${progress > 0 ? `You're ${progress}% towards your goal.` : "Keep logging daily to track your progress."}`);
      } else if (streak > 0) {
        setAiMessage(`Great start! You've logged ${streak} day${streak > 1 ? 's' : ''} in a row. ${progress > 0 ? `You're ${progress}% towards your goal.` : "Log daily to build your streak and track your journey."}`);
      } else {
        setAiMessage("Getting started is the hardest part. Log your first entry today to begin tracking your journey and building your streak.");
      }
    }, 500);
  }, [goal, logs, streak, progress]);

  const refresh = () => {
    const newStreak = calculateStreak(logs);
    setStreak(newStreak);
    if (goal && logs.length > 0) {
      const p = calculateGoalProgress(goal, logs);
      setProgress(p);
    }
  };

  const cards = [
    {
      icon: Flame,
      label: "Active Streak",
      value: `${streak}`,
      sub: "consecutive days logged",
      color: "from-[#FF2E2E]/20 to-[#FF2E2E]/5 text-[#FF2E2E]",
    },
    {
      icon: Target,
      label: "Goal Progress",
      value: `${progress}%`,
      sub: goal ? "towards target weight" : "set a goal to track progress",
      color: "from-[#00FF94]/20 to-[#00FF94]/5 text-[#00FF94]",
    },
    {
      icon: Trophy,
      label: "Motivation",
      value: streak >= 7 ? "🔥" : streak >= 3 ? "💪" : "⭐",
      sub: streak >= 7
        ? "Incredible consistency — keep the momentum!"
        : streak >= 3
        ? "You're building great habits!"
        : "Start your streak today — one day at a time!",
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
            Welcome back, <span className="text-[#FF2E2E]">{user?.displayName || user?.email?.split("@")[0] || "Athlete"}</span> 🏆
          </h1>
          <p className="text-gray-400 mt-2">Here's your progress summary for today.</p>
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
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <Sparkles className="text-[#FF2E2E] w-5 h-5" />
            <h3 className="font-semibold text-lg">AI-Generated Summary</h3>
          </div>
          <Button
            onClick={refresh}
            variant="ghost"
            size="sm"
            className="rounded-full text-[#FF2E2E] hover:bg-[#FF2E2E]/10"
          >
            <RefreshCcw className="w-4 h-4 mr-2" />
            Recalculate
          </Button>
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

      {/* Achievements */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-10"
      >
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Trophy className="w-5 h-5 text-[#FF2E2E]" />
          Achievements
        </h2>
        <Achievements streak={streak} progress={progress} />
      </motion.div>
    </div>
  );
}
