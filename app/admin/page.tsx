"use client";

import { Suspense } from "react";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { ErrorBoundary } from "@/components/admin/shared/error-boundary";
import { SkeletonCard, SkeletonChart } from "@/components/admin/shared/skeleton";
import { fadeUp, transition } from "@/components/admin/shared/motion";

// Dynamic imports for code splitting
const KpiCards = dynamic(
  () => import("@/components/admin/dashboard/kpi-cards").then((mod) => ({ default: mod.KpiCards })),
  { ssr: false, loading: () => <SkeletonCard /> }
);

const RevenueChart = dynamic(
  () => import("@/components/admin/dashboard/revenue-chart").then((mod) => ({ default: mod.RevenueChart })),
  { ssr: false, loading: () => <SkeletonChart /> }
);

const ActivityFeed = dynamic(
  () => import("@/components/admin/dashboard/activity-feed").then((mod) => ({ default: mod.ActivityFeed })),
  { ssr: false, loading: () => <SkeletonCard /> }
);

const AiSummaryCard = dynamic(
  () => import("@/components/admin/dashboard/ai-summary-card").then((mod) => ({ default: mod.AiSummaryCard })),
  { ssr: false, loading: () => <SkeletonCard /> }
);

export default function AdminDashboard() {
  return (
    <ErrorBoundary>
      <motion.div
        initial={fadeUp.hidden}
        animate={fadeUp.show}
        transition={transition}
        className="space-y-6"
      >
        {/* Header */}
        <motion.div
          initial={fadeUp.hidden}
          animate={fadeUp.show}
          transition={{ ...transition, delay: 0.1 }}
        >
          <h1 className="text-3xl font-bold text-white mb-2">
            Admin <span className="text-[#FF2E2E]">Dashboard</span>
          </h1>
          <p className="text-gray-400">
            Real-time overview of MacroMinded operations and performance.
          </p>
        </motion.div>

        {/* KPI Cards */}
        <Suspense fallback={<SkeletonCard />}>
          <KpiCards />
        </Suspense>

        {/* Revenue Chart */}
        <Suspense fallback={<SkeletonChart />}>
          <RevenueChart />
        </Suspense>

        {/* Activity Feed & AI Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Suspense fallback={<SkeletonCard />}>
            <ActivityFeed />
          </Suspense>
          <Suspense fallback={<SkeletonCard />}>
            <AiSummaryCard />
          </Suspense>
        </div>
      </motion.div>
    </ErrorBoundary>
  );
}
