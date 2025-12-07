"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Users, DollarSign, Activity, Brain, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import TypewriterText from "@/components/ui/typewriter-text";

export function AIInsightsSummary() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchInsights = async () => {
    if (refreshing) return;
    setRefreshing(true);
    try {
      const res = await fetch("/api/insights");
      if (!res.ok) {
        throw new Error(`API error: ${res.status}`);
      }
      const d = await res.json();
      // Validate data structure
      if (d && d.stats && typeof d.stats === 'object') {
        setData(d);
      } else {
        console.error("Invalid data structure:", d);
        setData(null);
      }
    } catch (error) {
      console.error("Failed to fetch insights:", error);
      setData(null);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, []);

  if (loading) {
    return (
      <Card className="bg-[#151515] border border-[#222]">
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF2E2E] mx-auto mb-4"></div>
              <p className="text-gray-400">Loading AI insights...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data || !data.stats) {
    return (
      <Card className="bg-[#151515] border border-[#222]">
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <p className="text-gray-400 mb-2">No data available.</p>
              <Button
                onClick={fetchInsights}
                variant="ghost"
                size="sm"
                className="text-[#FF2E2E] hover:text-white hover:bg-[#222]"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const { stats, summary } = data;

  // Ensure stats has all required properties with defaults
  const safeStats = {
    totalUsers: stats.totalUsers ?? 0,
    totalPayments: stats.totalPayments ?? 0,
    totalRevenue: stats.totalRevenue ?? 0,
    deliveredPlans: stats.deliveredPlans ?? 0,
    pendingPlans: stats.pendingPlans ?? 0,
  };

  return (
    <div className="space-y-6">
      {/* Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-[#151515] border border-[#222] hover:border-[#FF2E2E]/50 transition-colors">
            <CardHeader className="pb-2 flex items-center gap-2">
              <Users className="text-[#FF2E2E]" size={20} />
              <CardTitle className="text-sm font-semibold text-gray-300">Total Users</CardTitle>
            </CardHeader>
            <CardContent className="text-3xl font-bold text-white">{safeStats.totalUsers}</CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-[#151515] border border-[#222] hover:border-[#FF2E2E]/50 transition-colors">
            <CardHeader className="pb-2 flex items-center gap-2">
              <Activity className="text-[#FF2E2E]" size={20} />
              <CardTitle className="text-sm font-semibold text-gray-300">Active Plans</CardTitle>
            </CardHeader>
            <CardContent className="text-3xl font-bold text-white">{safeStats.deliveredPlans}</CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="bg-[#151515] border border-[#222] hover:border-[#FF2E2E]/50 transition-colors">
            <CardHeader className="pb-2 flex items-center gap-2">
              <BarChart className="text-[#FF2E2E]" size={20} />
              <CardTitle className="text-sm font-semibold text-gray-300">Pending</CardTitle>
            </CardHeader>
            <CardContent className="text-3xl font-bold text-white">{safeStats.pendingPlans}</CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="bg-[#151515] border border-[#222] hover:border-[#FF2E2E]/50 transition-colors">
            <CardHeader className="pb-2 flex items-center gap-2">
              <DollarSign className="text-[#FF2E2E]" size={20} />
              <CardTitle className="text-sm font-semibold text-gray-300">Revenue</CardTitle>
            </CardHeader>
            <CardContent className="text-3xl font-bold text-white">
              ${safeStats.totalRevenue.toFixed(2)}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* AI Summary - Fancy Animated Card */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-gradient-to-b from-[#111] to-[#0a0a0a] border border-[#1e1e1e] rounded-xl shadow-lg shadow-black/40 overflow-hidden relative"
      >
        {/* Rotating AI Icon in Corner */}
        <div className="absolute top-0 right-0 p-3 text-[#FF2E2E] opacity-80">
          <motion.div
            animate={{ rotate: [0, 360] }}
            transition={{ repeat: Infinity, duration: 12, ease: "linear" }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-5 h-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 6v6h4.5M21 12A9 9 0 1 1 3 12a9 9 0 0 1 18 0z"
              />
            </svg>
          </motion.div>
        </div>

        <div className="p-6 space-y-5">
          {/* Header */}
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#FF2E2E]/10 rounded-lg border border-[#FF2E2E]/30">
              <Brain className="w-5 h-5 text-[#FF2E2E]" size={20} />
            </div>
            <h2 className="text-xl font-semibold text-white tracking-wide">
              AI-Generated <span className="text-[#FF2E2E]">Insights</span>
            </h2>
          </div>

          {/* Content */}
          <motion.div
            className="text-gray-300 leading-relaxed text-sm md:text-base font-medium whitespace-pre-line"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 1 }}
          >
            <p className="text-gray-400 mb-2">
              🧾 <span className="font-semibold text-white">Performance Summary:</span>
            </p>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-y-2 text-sm mb-4">
              <p>
                👥 Users: <span className="text-[#FF2E2E] font-semibold">{safeStats.totalUsers}</span>
              </p>
              <p>
                💳 Payments: <span className="text-[#FF2E2E] font-semibold">{safeStats.totalPayments}</span>
              </p>
              <p>
                💰 Revenue: <span className="text-[#FF2E2E] font-semibold">${safeStats.totalRevenue.toFixed(2)}</span>
              </p>
              <p>
                📦 Delivered: <span className="text-[#FF2E2E] font-semibold">{safeStats.deliveredPlans}</span>
              </p>
              <p>
                ⏳ Pending: <span className="text-[#FF2E2E] font-semibold">{safeStats.pendingPlans}</span>
              </p>
            </div>

            {/* AI Summary Box */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="mt-5 p-4 rounded-lg bg-[#FF2E2E]/10 border border-[#FF2E2E]/30 shadow-inner"
            >
              <p className="text-xs text-gray-500 mb-2 italic">
                Generated {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </p>
              {!summary ? (
                <p className="italic text-gray-500 animate-pulse">
                  🤖 AI is analyzing your data...
                </p>
              ) : (
                <TypewriterText text={summary} speed={25} />
              )}
            </motion.div>
          </motion.div>

          {/* Refresh Button */}
          <div className="flex justify-end mt-4">
            <button
              onClick={fetchInsights}
              disabled={refreshing}
              className="flex items-center gap-2 text-xs px-3 py-2 rounded-lg border border-[#FF2E2E] text-[#FF2E2E] hover:bg-[#FF2E2E]/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
              Refresh Insights
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

