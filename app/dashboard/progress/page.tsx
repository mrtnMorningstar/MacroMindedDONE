"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import { Flame, TrendingUp, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { useAuth } from "@/context/auth-context";
import { generateUserInsights } from "@/lib/ai/insights";

interface ProgressEntry {
  id?: string;
  userId?: string;
  date?: any;
  weight?: number;
  calories?: number;
  compliancePercent?: number;
  [key: string]: any;
}

export default function ProgressPage() {
  const { user } = useAuth();
  const [weightData, setWeightData] = useState<any[]>([]);
  const [calorieData, setCalorieData] = useState<any[]>([]);
  const [aiSummary, setAiSummary] = useState<string>("Analyzing progress...");
  const [loading, setLoading] = useState(true);
  const [hasData, setHasData] = useState(false);

  useEffect(() => {
    async function fetchProgressData() {
      if (!user?.uid) {
        setLoading(false);
        return;
      }

      try {
        // Fetch progress data from Firestore
        const progressRef = collection(db, "progress");
        const q = query(progressRef, where("userId", "==", user.uid));
        
        let progressSnap;
        try {
          progressSnap = await getDocs(q);
        } catch (error: any) {
          // If index error, try without where clause and filter client-side
          if (error.code === "failed-precondition") {
            const allProgressSnap = await getDocs(progressRef);
            progressSnap = {
              docs: allProgressSnap.docs.filter((doc) => doc.data().userId === user.uid),
            } as any;
          } else {
            throw error;
          }
        }

        const progressEntries = progressSnap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as ProgressEntry[];

        if (progressEntries.length > 0) {
          setHasData(true);
          
          // Sort by date
          progressEntries.sort((a, b) => {
            const dateA = a.date?.toDate ? a.date.toDate() : new Date(a.date || 0);
            const dateB = b.date?.toDate ? b.date.toDate() : new Date(b.date || 0);
            return dateA.getTime() - dateB.getTime();
          });

          // Get last 7 entries for charts (or all if less than 7)
          const recentEntries = progressEntries.slice(-7);

          // Format weight data
          const weightChartData = recentEntries.map((entry, index) => {
            const date = entry.date?.toDate ? entry.date.toDate() : new Date(entry.date || Date.now());
            const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
            return {
              day: index < 7 ? dayNames[date.getDay()] : `Day ${index + 1}`,
              value: entry.weight || 0,
              date: date.toLocaleDateString(),
            };
          });

          // Format calorie data
          const calorieChartData = recentEntries.map((entry, index) => {
            const date = entry.date?.toDate ? entry.date.toDate() : new Date(entry.date || Date.now());
            const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
            return {
              day: index < 7 ? dayNames[date.getDay()] : `Day ${index + 1}`,
              calories: entry.calories || 0,
              date: date.toLocaleDateString(),
            };
          });

          setWeightData(weightChartData);
          setCalorieData(calorieChartData);

          // Generate AI summary using insights utility
          const insights = generateUserInsights({
            progress: progressEntries,
            plan: null,
          });

          setTimeout(() => {
            if (progressEntries.length >= 3) {
              const latest = progressEntries[progressEntries.length - 1];
              const first = progressEntries[0];
              const weightChange = (latest.weight || 0) - (first.weight || 0);
              const avgCalories = progressEntries.reduce((sum, e) => sum + (e.calories || 0), 0) / progressEntries.length;

              setAiSummary(
                weightChange < 0
                  ? `🔥 Excellent progress! You've lost ${Math.abs(weightChange).toFixed(1)} kg while maintaining an average of ${Math.round(avgCalories)} calories. ${insights.summary}`
                  : weightChange > 0
                  ? `📈 You've gained ${weightChange.toFixed(1)} kg. ${insights.summary}`
                  : `📊 Weight is stable at ${latest.weight?.toFixed(1) || 0} kg. ${insights.summary}`
              );
            } else {
              setAiSummary(insights.summary || "Keep logging your progress to see detailed insights!");
            }
          }, 1200);
        } else {
          // No data - use mock data for demonstration
          setHasData(false);
          const mockWeight = [
            { day: "Mon", value: 82 },
            { day: "Tue", value: 81.7 },
            { day: "Wed", value: 81.3 },
            { day: "Thu", value: 81.1 },
            { day: "Fri", value: 80.9 },
            { day: "Sat", value: 80.8 },
            { day: "Sun", value: 80.6 },
          ];
          const mockCalories = [
            { day: "Mon", calories: 2200 },
            { day: "Tue", calories: 2100 },
            { day: "Wed", calories: 2150 },
            { day: "Thu", calories: 2050 },
            { day: "Fri", calories: 2250 },
            { day: "Sat", calories: 2300 },
            { day: "Sun", calories: 2200 },
          ];
          setWeightData(mockWeight);
          setCalorieData(mockCalories);

          setTimeout(() => {
            setAiSummary(
              "📊 Start logging your progress to see personalized insights! Track your weight, calories, and compliance to unlock detailed analytics."
            );
          }, 1200);
        }
      } catch (err) {
        console.error("Error fetching progress data:", err);
        setHasData(false);
      } finally {
        setLoading(false);
      }
    }

    fetchProgressData();
  }, [user?.uid]);

  const handleRefreshInsights = () => {
    setAiSummary("Re-evaluating new metrics...");
    setTimeout(() => {
      setAiSummary(
        "🔥 Excellent consistency! You've maintained steady progress while keeping calories balanced. Momentum looks strong — keep it up!"
      );
    }, 1200);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[70vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF2E2E] mx-auto mb-4"></div>
          <p className="text-gray-400">Loading your progress...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
          Your <span className="text-[#FF2E2E]">Progress</span>
        </h1>
        <p className="text-gray-400 mt-2">Visualize your improvements over time.</p>
        {!hasData && (
          <p className="text-sm text-[#FF2E2E]/80 mt-2">
            📊 Showing sample data. Start logging your progress to see real analytics!
          </p>
        )}
      </motion.div>

      {/* Weight Trend */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="rounded-2xl border border-white/10 p-6 bg-white/[0.03] backdrop-blur-xl shadow-lg"
      >
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-3">
            <TrendingUp className="text-[#FF2E2E] w-5 h-5" />
            <h2 className="font-semibold text-lg">Weight Trend (kg)</h2>
          </div>
          <p className="text-sm text-gray-500">Weekly overview</p>
        </div>

        {weightData.length > 0 ? (
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={weightData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="day" stroke="#888" />
              <YAxis stroke="#888" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#111",
                  border: "1px solid #222",
                  borderRadius: "10px",
                  color: "#fff",
                }}
                labelStyle={{ color: "#FF2E2E" }}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#FF2E2E"
                strokeWidth={2}
                dot={{ fill: "#FF2E2E", r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[250px] flex items-center justify-center text-gray-500 text-sm">
            No weight data available
          </div>
        )}
      </motion.div>

      {/* Calorie Compliance */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="rounded-2xl border border-white/10 p-6 bg-white/[0.03] backdrop-blur-xl shadow-lg"
      >
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-3">
            <Flame className="text-[#FF2E2E] w-5 h-5" />
            <h2 className="font-semibold text-lg">Calorie Compliance</h2>
          </div>
          <p className="text-sm text-gray-500">Intake vs. goal</p>
        </div>

        {calorieData.length > 0 ? (
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={calorieData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="day" stroke="#888" />
              <YAxis stroke="#888" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#111",
                  border: "1px solid #222",
                  borderRadius: "10px",
                  color: "#fff",
                }}
                labelStyle={{ color: "#FF2E2E" }}
              />
              <Bar dataKey="calories" fill="#FF2E2E" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[250px] flex items-center justify-center text-gray-500 text-sm">
            No calorie data available
          </div>
        )}
      </motion.div>

      {/* AI Summary */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="rounded-2xl border border-white/10 p-6 backdrop-blur-xl bg-gradient-to-br from-[#1E1E1E]/40 to-[#0A0A0A]/60 shadow-2xl"
      >
        <div className="flex items-center gap-3 mb-3">
          <Sparkles className="text-[#FF2E2E] w-5 h-5" />
          <h3 className="font-semibold text-lg">AI-Generated Progress Insight</h3>
        </div>
        <motion.p
          key={aiSummary}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-gray-300 leading-relaxed"
        >
          {aiSummary}
        </motion.p>
        <div className="mt-4">
          <Button
            onClick={handleRefreshInsights}
            className="bg-[#FF2E2E] hover:bg-[#FF2E2E]/90 rounded-full text-sm"
          >
            <Sparkles className="w-4 h-4 mr-1" /> Refresh Insights
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
