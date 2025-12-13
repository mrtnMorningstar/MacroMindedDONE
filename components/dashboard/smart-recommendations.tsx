"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase/config";
import { collection, query, where, orderBy, onSnapshot, limit } from "firebase/firestore";
import { useAuth } from "@/context/auth-context";
import { motion } from "framer-motion";
import { Sparkles, Flame, Salad, Dumbbell, Moon, TrendingUp, Activity } from "lucide-react";
import { SmartRecommendationsSkeleton } from "@/components/dashboard/skeletons";

export function SmartRecommendations() {
  const { user } = useAuth();
  const [advice, setAdvice] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.uid) {
      setAdvice(["Please log in to receive personalized recommendations."]);
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
        setAdvice(["Unable to load recommendations. Please try again later."]);
        setLoading(false);
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
        
        setAdvice(generateAdvice(logs));
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching recommendations:", error);
        setAdvice(["Unable to load recommendations. Please try again later."]);
        setLoading(false);
      }
    );

    return () => unsub();
  }, [user?.uid]);

  const generateAdvice = (logs: any[]) => {
    if (!logs || logs.length === 0) {
      return ["📊 Start logging to receive personalized tips based on your progress!"];
    }

    const recent = logs.slice(0, 7).reverse(); // Get last 7, reverse for chronological order

    // Filter valid entries
    const validLogs = recent.filter((log) => log.weight || log.calories || log.steps);
    
    if (validLogs.length === 0) {
      return ["📊 Your entries are missing key metrics. Try logging weight, calories, or steps for better insights!"];
    }

    const tips: string[] = [];

    // Weight trend analysis
    const weights = validLogs.filter((l) => l.weight).map((l) => l.weight);
    if (weights.length >= 2) {
      const firstWeight = weights[0];
      const lastWeight = weights[weights.length - 1];
      const trend = lastWeight - firstWeight;

      if (trend < -0.5) {
        tips.push("🏆 Great progress — your weight trend shows steady improvement! Keep up the consistency.");
      } else if (trend > 0.5) {
        tips.push("⚠️ You've gained a bit recently — recheck your meal timing, hydration, and portion sizes.");
      } else {
        tips.push("📊 Weight is stable — maintain consistency and consider adjusting your calorie balance if needed.");
      }
    }

    // Steps analysis
    const steps = validLogs.filter((l) => l.steps).map((l) => l.steps);
    if (steps.length > 0) {
      const avgSteps = Math.round(steps.reduce((a, b) => a + b, 0) / steps.length);
      
      if (avgSteps < 7000) {
        tips.push("🚶 Try aiming for short 10-minute walks after meals to boost metabolism and hit your daily step goal.");
      } else if (avgSteps > 10000) {
        tips.push("🔥 Excellent step count! Keep this level to maintain cardiovascular health and energy levels.");
      } else if (avgSteps >= 7000 && avgSteps <= 10000) {
        tips.push("💪 Good activity level! Consider adding a few more steps to maximize your fitness gains.");
      }
    }

    // Calories analysis
    const calories = validLogs.filter((l) => l.calories).map((l) => l.calories);
    if (calories.length > 0) {
      const avgCalories = Math.round(calories.reduce((a, b) => a + b, 0) / calories.length);
      
      if (avgCalories > 2800) {
        tips.push("🍔 You might be over-consuming — focus on whole foods, lean proteins, and mindful portion control.");
      } else if (avgCalories < 1800) {
        tips.push("🥗 Consider increasing your intake slightly to maintain sustainable energy and support your metabolism.");
      } else if (avgCalories >= 1800 && avgCalories <= 2400) {
        tips.push("✅ Your calorie intake looks balanced — keep tracking to maintain this sweet spot.");
      }
    }

    // Compliance analysis
    const complianceEntries = validLogs.filter(
      (l) => l.compliancePercent !== null && l.compliancePercent !== undefined
    );
    if (complianceEntries.length > 0) {
      const avgCompliance =
        complianceEntries.reduce((a, b) => a + (b.compliancePercent || 0), 0) /
        complianceEntries.length;
      
      if (avgCompliance >= 80) {
        tips.push("🎯 Outstanding compliance! You're staying on track with your goals consistently.");
      } else if (avgCompliance < 60) {
        tips.push("📈 Focus on consistency — small daily improvements compound into significant results.");
      }
    }

    // Random motivation (only if we have less than 4 tips)
    if (tips.length < 4) {
      const motivators = [
        "💪 Consistency beats perfection — keep showing up every day!",
        "🌙 Sleep well — it's your body's reset button and crucial for recovery.",
        "🧠 Your data shows great commitment. Keep going strong!",
        "🔥 Progress isn't always linear — trust the process and stay patient.",
        "⚡ Small daily actions create massive long-term results.",
      ];
      tips.push(motivators[Math.floor(Math.random() * motivators.length)]);
    }

    // If no tips generated, provide default encouragement
    if (tips.length === 0) {
      tips.push("💪 Keep logging your progress to unlock personalized recommendations!");
    }

    return tips.slice(0, 5); // Limit to 5 tips max
  };

  if (loading) {
    return <SmartRecommendationsSkeleton />;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-white/10 p-6 bg-gradient-to-br from-[#1E1E1E]/50 to-[#0A0A0A]/70 backdrop-blur-xl shadow-lg"
    >
      <div className="flex items-center gap-3 mb-4">
        <Sparkles className="text-[#FF2E2E] w-5 h-5" />
        <h2 className="font-semibold text-lg">Smart Recommendations</h2>
      </div>
      <ul className="space-y-3 text-gray-300">
        {advice.map((tip, i) => (
          <motion.li
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className="flex items-start gap-3 p-2 rounded-lg hover:bg-white/[0.03] transition-colors"
          >
            <span className="text-[#FF2E2E] text-lg mt-0.5">•</span>
            <span className="flex-1 leading-relaxed">{tip}</span>
          </motion.li>
        ))}
      </ul>
    </motion.div>
  );
}

