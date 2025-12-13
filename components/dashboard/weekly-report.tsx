"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase/config";
import { collection, query, where, orderBy, onSnapshot, limit } from "firebase/firestore";
import { useAuth } from "@/context/auth-context";
import { motion } from "framer-motion";
import { Brain, RefreshCcw, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WeeklyReportSkeleton } from "@/components/dashboard/skeletons";

export function WeeklyReport() {
  const { user } = useAuth();
  const [summary, setSummary] = useState("Generating weekly insights...");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (!user?.uid) {
      setSummary("Please log in to see your weekly report.");
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
        setSummary("Unable to load weekly data.");
        return;
      }
    }

    const unsub = onSnapshot(
      q,
      (snap) => {
        const logs = snap.docs.map((d) => d.data());
        
        // Sort by date if orderBy wasn't applied
        if (logs.length > 1) {
          const firstDate = logs[0].date?.toDate ? logs[0].date.toDate() : new Date(logs[0].date || logs[0].createdAt?.toDate ? logs[0].createdAt.toDate() : logs[0].createdAt || 0);
          const secondDate = logs[1].date?.toDate ? logs[1].date.toDate() : new Date(logs[1].date || logs[1].createdAt?.toDate ? logs[1].createdAt.toDate() : logs[1].createdAt || 0);
          
          if (firstDate.getTime() < secondDate.getTime()) {
            logs.sort((a, b) => {
              const dateA = a.date?.toDate ? a.date.toDate() : new Date(a.date || a.createdAt?.toDate ? a.createdAt.toDate() : a.createdAt || 0);
              const dateB = b.date?.toDate ? b.date.toDate() : new Date(b.date || b.createdAt?.toDate ? b.createdAt.toDate() : b.createdAt || 0);
              return dateB.getTime() - dateA.getTime(); // Most recent first
            });
          }
        }

        setSummary(generateWeeklySummary(logs));
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching weekly report:", error);
        setSummary("Unable to generate weekly report.");
        setLoading(false);
      }
    );

    return () => unsub();
  }, [user?.uid]);

  const generateWeeklySummary = (logs: any[]) => {
    if (!logs || logs.length === 0) {
      return "📊 No data available yet. Start logging your progress to see personalized weekly insights!";
    }

    // Get last 7 entries (most recent first, so we reverse to get chronological order)
    const recent = logs.slice(0, 7).reverse();

    // Filter entries with valid data
    const validLogs = recent.filter(
      (log) => log.weight || log.calories || log.steps
    );

    if (validLogs.length === 0) {
      return "📊 You have entries, but they're missing key metrics. Try logging weight, calories, or steps to see insights!";
    }

    // Calculate averages
    const weights = validLogs.filter((l) => l.weight).map((l) => l.weight);
    const calories = validLogs.filter((l) => l.calories).map((l) => l.calories);
    const steps = validLogs.filter((l) => l.steps).map((l) => l.steps);

    const avgWeight =
      weights.length > 0
        ? (weights.reduce((a, b) => a + b, 0) / weights.length).toFixed(1)
        : null;
    const avgCalories =
      calories.length > 0
        ? Math.round(calories.reduce((a, b) => a + b, 0) / calories.length)
        : null;
    const avgSteps =
      steps.length > 0
        ? Math.round(steps.reduce((a, b) => a + b, 0) / steps.length)
        : null;

    // Build message
    let message = "🧠 This week's summary: ";

    if (avgWeight) {
      message += `Your average weight was ${avgWeight} kg. `;
    }
    if (avgCalories) {
      message += `Average intake: ${avgCalories.toLocaleString()} kcal. `;
    }
    if (avgSteps) {
      message += `Average activity: ${avgSteps.toLocaleString()} steps. `;
    }

    // Add insights
    if (avgSteps && avgSteps > 9000) {
      message += "🔥 Your activity levels are excellent — you're hitting your movement goals consistently. ";
    } else if (avgSteps && avgSteps < 5000) {
      message += "💪 Consider increasing your daily steps to boost your activity levels. ";
    }

    if (avgCalories && avgCalories > 2700) {
      message += "⚠️ Calorie intake is a bit high; consider adjusting portion sizes or increasing activity. ";
    } else if (avgCalories && avgCalories < 1500) {
      message += "⚠️ Your calorie intake seems low; make sure you're fueling your body adequately. ";
    }

    // Weight trend
    if (weights.length >= 2) {
      const firstWeight = weights[0];
      const lastWeight = weights[weights.length - 1];
      const weightChange = lastWeight - firstWeight;

      if (weightChange < -0.5) {
        message += "✅ Noticeable progress! You're trending downwards nicely. ";
      } else if (weightChange > 0.5) {
        message += "📈 Weight has increased; review your calorie balance and activity levels. ";
      } else {
        message += "📊 Weight is stable — maintain consistency to see changes. ";
      }
    }

    // Compliance
    const complianceEntries = validLogs.filter(
      (l) => l.compliancePercent !== null && l.compliancePercent !== undefined
    );
    if (complianceEntries.length > 0) {
      const avgCompliance =
        complianceEntries.reduce((a, b) => a + (b.compliancePercent || 0), 0) /
        complianceEntries.length;
      if (avgCompliance >= 80) {
        message += "🎯 Excellent compliance — you're staying on track! ";
      } else if (avgCompliance >= 60) {
        message += "📊 Good compliance — keep working on consistency. ";
      }
    }

    return message.trim() || "Keep logging to see more detailed insights!";
  };

  const refreshSummary = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 800);
  };

  if (loading) {
    return <WeeklyReportSkeleton />;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-white/10 p-6 bg-gradient-to-br from-[#1E1E1E]/40 to-[#0A0A0A]/60 backdrop-blur-xl shadow-2xl"
    >
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-3">
          <Brain className="text-[#FF2E2E] w-5 h-5" />
          <h2 className="font-semibold text-lg">Weekly AI Report</h2>
        </div>
        <Button
          onClick={refreshSummary}
          disabled={refreshing}
          variant="ghost"
          size="sm"
          className="rounded-full text-[#FF2E2E] hover:bg-[#FF2E2E]/10"
        >
          <RefreshCcw
            className={`w-4 h-4 mr-2 ${refreshing ? "animate-spin" : ""}`}
          />
          Refresh
        </Button>
      </div>
      <motion.p
        key={summary}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="text-gray-300 leading-relaxed"
      >
        {summary}
      </motion.p>
    </motion.div>
  );
}

