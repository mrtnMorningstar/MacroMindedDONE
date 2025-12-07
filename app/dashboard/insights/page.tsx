"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import { Brain, TrendingUp, Activity, Flame, RefreshCcw, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { collection, query, where, onSnapshot, orderBy, doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { useAuth } from "@/context/auth-context";
import { generateUserInsights } from "@/lib/ai/insights";

interface ProgressEntry {
  id?: string;
  userId?: string;
  date?: any;
  weight?: number;
  calories?: number;
  steps?: number;
  compliancePercent?: number;
  [key: string]: any;
}

export default function InsightsPage() {
  const { user } = useAuth();
  const [chartData, setChartData] = useState<any[]>([]);
  const [aiSummary, setAiSummary] = useState("Analyzing your progress...");
  const [compliance, setCompliance] = useState(0);
  const [avgSteps, setAvgSteps] = useState(0);
  const [avgCalories, setAvgCalories] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (!user?.uid) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const progressRef = collection(db, "progress");
    
    // Set up real-time listener
    let q;
    try {
      q = query(
        progressRef,
        where("userId", "==", user.uid),
        orderBy("date", "asc")
      );
    } catch (error: any) {
      // If index error, use fallback query
      if (error.code === "failed-precondition") {
        q = query(progressRef, where("userId", "==", user.uid));
      } else {
        console.error("Error setting up query:", error);
        setLoading(false);
        return;
      }
    }

    const unsubscribe = onSnapshot(
      q,
      async (snapshot) => {
        const progressEntries = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as ProgressEntry[];

        // Fetch user plan data for context (one-time fetch)
        let planData = null;
        try {
          const userDocRef = doc(db, "users", user.uid);
          const userDocSnap = await getDoc(userDocRef);
          if (userDocSnap.exists()) {
            planData = userDocSnap.data();
          }
        } catch (error) {
          console.warn("Could not fetch user plan data:", error);
        }

        if (progressEntries.length > 0) {
          // Sort by date if orderBy wasn't applied (check by comparing dates)
          if (progressEntries.length > 1) {
            const firstDate = progressEntries[0].date?.toDate ? progressEntries[0].date.toDate() : new Date(progressEntries[0].date || 0);
            const secondDate = progressEntries[1].date?.toDate ? progressEntries[1].date.toDate() : new Date(progressEntries[1].date || 0);
            
            // If not in ascending order, sort them
            if (firstDate.getTime() > secondDate.getTime()) {
              progressEntries.sort((a, b) => {
                const dateA = a.date?.toDate ? a.date.toDate() : new Date(a.date || 0);
                const dateB = b.date?.toDate ? b.date.toDate() : new Date(b.date || 0);
                return dateA.getTime() - dateB.getTime();
              });
            }
          }

          // Get last 7 entries for charts (or all if less than 7)
          const recentEntries = progressEntries.slice(-7);

          // Format chart data
          const formattedData = recentEntries.map((entry, index) => {
            const date = entry.date?.toDate ? entry.date.toDate() : new Date(entry.date || Date.now());
            const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
            return {
              day: index < 7 ? dayNames[date.getDay()] : `Day ${index + 1}`,
              weight: entry.weight || 0,
              calories: entry.calories || 0,
              steps: entry.steps || 0,
              date: date.toLocaleDateString(),
            };
          });

          setChartData(formattedData);

          // Calculate averages
          const validEntries = progressEntries.filter((e) => e.weight || e.calories || e.steps);
          if (validEntries.length > 0) {
            const totalSteps = validEntries.reduce((sum, e) => sum + (e.steps || 0), 0);
            const totalCalories = validEntries.reduce((sum, e) => sum + (e.calories || 0), 0);
            const totalCompliance = validEntries.reduce((sum, e) => sum + (e.compliancePercent || 0), 0);

            setAvgSteps(Math.round(totalSteps / validEntries.length));
            setAvgCalories(Math.round(totalCalories / validEntries.length));
            setCompliance(Math.round(totalCompliance / validEntries.length));
          }

          // Generate AI summary using insights utility
          const insights = generateUserInsights({
            progress: progressEntries,
            plan: planData,
          });

          // Enhance summary with additional metrics
          const enhancedSummary = generateEnhancedSummary(progressEntries, insights, avgSteps, avgCalories);
          setAiSummary(enhancedSummary);
        } else {
          // No data
          setChartData([]);
          setAiSummary("No progress data yet. Once you start logging, we'll provide insights here.");
        }

        setLoading(false);
        setRefreshing(false);
      },
      (error) => {
        console.error("Error fetching insights data:", error);
        setAiSummary("Unable to load insights. Please try again later.");
        setLoading(false);
        setRefreshing(false);
      }
    );

    return () => unsubscribe();
  }, [user?.uid]);

  const generateEnhancedSummary = (
    entries: ProgressEntry[],
    insights: ReturnType<typeof generateUserInsights>,
    avgSteps: number,
    avgCalories: number
  ): string => {
    if (entries.length === 0) {
      return insights.summary;
    }

    const latest = entries[entries.length - 1];
    const first = entries[0];
    const weightChange = (latest.weight || 0) - (first.weight || 0);

    let summary = insights.summary;

    // Add step insights
    if (avgSteps > 9000) {
      summary += ` You're averaging ${avgSteps.toLocaleString()} steps/day — excellent activity level!`;
    } else if (avgSteps > 0) {
      summary += ` Your average of ${avgSteps.toLocaleString()} steps/day is a solid foundation.`;
    }

    // Add calorie insights
    if (avgCalories > 0) {
      if (avgCalories < 2000) {
        summary += ` Average intake of ${avgCalories} kcal/day suggests a deficit — monitor energy levels.`;
      } else if (avgCalories > 2800) {
        summary += ` Average intake of ${avgCalories} kcal/day is above target — consider portion control.`;
      } else {
        summary += ` Your ${avgCalories} kcal/day average aligns well with your goals.`;
      }
    }

    // Add weight trend
    if (weightChange < -0.5) {
      summary += ` Weight has decreased by ${Math.abs(weightChange).toFixed(1)} kg — steady progress!`;
    } else if (weightChange > 0.5) {
      summary += ` Weight has increased by ${weightChange.toFixed(1)} kg.`;
    }

    return summary;
  };

  const handleRefresh = () => {
    setRefreshing(true);
    setAiSummary("Reanalyzing your latest progress...");
    fetchInsightsData();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[70vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF2E2E] mx-auto mb-4"></div>
          <p className="text-gray-400">Loading insights...</p>
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
          Personalized <span className="text-[#FF2E2E]">Insights</span>
        </h1>
        <p className="text-gray-400 mt-2">
          Analyze your weekly progress and see AI-powered feedback.
        </p>
      </motion.div>

      {/* AI Summary */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="rounded-2xl border border-white/10 p-6 bg-gradient-to-br from-[#1E1E1E]/40 to-[#0A0A0A]/60 backdrop-blur-xl shadow-2xl"
      >
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-3">
            <Sparkles className="text-[#FF2E2E] w-5 h-5" />
            <h2 className="font-semibold text-lg">AI-Generated Summary</h2>
          </div>
          <Button
            onClick={handleRefresh}
            disabled={refreshing}
            className="rounded-full bg-[#FF2E2E] hover:bg-[#FF2E2E]/80 text-white"
          >
            <RefreshCcw className={`w-4 h-4 mr-2 ${refreshing ? "animate-spin" : ""}`} /> Refresh
          </Button>
        </div>
        <motion.p
          key={aiSummary}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-gray-300 leading-relaxed"
        >
          {aiSummary}
        </motion.p>
      </motion.div>

      {/* Charts */}
      {chartData.length > 0 ? (
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Weight Trend */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="rounded-2xl border border-white/10 p-6 bg-white/[0.03] backdrop-blur-xl shadow-lg"
          >
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="text-[#FF2E2E] w-5 h-5" />
              <h3 className="font-semibold text-lg">Weight Trend (kg)</h3>
            </div>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={chartData}>
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
                  dataKey="weight"
                  stroke="#FF2E2E"
                  strokeWidth={2.5}
                  dot={{ fill: "#FF2E2E", r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Calorie Intake */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="rounded-2xl border border-white/10 p-6 bg-white/[0.03] backdrop-blur-xl shadow-lg"
          >
            <div className="flex items-center gap-2 mb-4">
              <Flame className="text-[#FF2E2E] w-5 h-5" />
              <h3 className="font-semibold text-lg">Calorie Intake (kcal)</h3>
            </div>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={chartData}>
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
          </motion.div>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="rounded-2xl border border-white/10 p-12 bg-white/[0.03] backdrop-blur-xl text-center"
        >
          <Brain className="w-12 h-12 mx-auto mb-4 text-gray-600" />
          <p className="text-gray-400">No data available yet</p>
          <p className="text-sm text-gray-500 mt-1">Start logging your progress to see insights here!</p>
        </motion.div>
      )}

      {/* Compliance Summary */}
      {chartData.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="rounded-2xl border border-white/10 p-6 bg-white/[0.03] backdrop-blur-xl shadow-lg"
        >
          <div className="flex items-center gap-3 mb-4">
            <Activity className="text-[#FF2E2E] w-5 h-5" />
            <h3 className="font-semibold text-lg">Weekly Compliance</h3>
          </div>
          <div className="grid sm:grid-cols-3 gap-6 text-center">
            <div>
              <p className="text-3xl font-bold text-[#FF2E2E]">{compliance}%</p>
              <p className="text-gray-400 text-sm mt-1">Consistency</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-[#FF2E2E]">
                {avgSteps > 0 ? avgSteps.toLocaleString() : "—"}
              </p>
              <p className="text-gray-400 text-sm mt-1">Avg Steps</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-[#FF2E2E]">
                {avgCalories > 0 ? avgCalories.toLocaleString() : "—"}
              </p>
              <p className="text-gray-400 text-sm mt-1">Avg Calories</p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
