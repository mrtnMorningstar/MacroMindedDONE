"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { InsightsFeed } from "@/components/admin/insights/insights-feed";
import { TrendsChart } from "@/components/admin/insights/trends-chart";
import { AIConsole } from "@/components/admin/insights/ai-console";
import { QuickActions } from "@/components/admin/insights/quick-actions";
import { AutomationPanel } from "@/components/admin/insights/automation-panel";
import { AIInsightsSummary } from "@/components/admin/insights/ai-insights-summary";

export default function InsightsPage() {
  // Ensure page scrolls to top on mount
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, []);

  return (
    <div className="relative">
      {/* Subtle ambient background animation */}
      <motion.div
        className="fixed inset-0 pointer-events-none z-0"
        animate={{
          background: [
            "radial-gradient(circle at 0% 0%, rgba(255,46,46,0.03) 0%, transparent 50%)",
            "radial-gradient(circle at 100% 100%, rgba(255,46,46,0.03) 0%, transparent 50%)",
            "radial-gradient(circle at 0% 0%, rgba(255,46,46,0.03) 0%, transparent 50%)",
          ],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="space-y-6 relative z-10"
      >
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">
          Insights & <span className="text-[#FF2E2E]">Automation</span>
        </h1>
        <p className="text-gray-400">
          AI-driven analytics and smart tools to manage MacroMinded efficiently.
        </p>
      </div>

      {/* AI Insights Summary - Full Width */}
      <AIInsightsSummary />

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - 2/3 width */}
        <div className="lg:col-span-2 space-y-6">
          <InsightsFeed />
          <TrendsChart />
        </div>

        {/* Right Column - 1/3 width */}
        <div className="lg:col-span-1 space-y-6">
          <AIConsole />
          <QuickActions />
          <AutomationPanel />
        </div>
      </div>
      </motion.div>
    </div>
  );
}
