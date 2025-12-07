"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { RevenueOverview } from "@/components/admin/analytics/revenue-overview";
import { PlanDistributionChart } from "@/components/admin/analytics/plan-distribution-chart";
import { TransactionsTable } from "@/components/admin/analytics/transactions-table";
import { FiltersBar } from "@/components/admin/analytics/filters-bar";
import { ExportMenu } from "@/components/admin/analytics/export-menu";

export default function PaymentsPage() {
  const [dateRange, setDateRange] = useState("30");
  const [planTypeFilter, setPlanTypeFilter] = useState("all");
  const [exportMenuOpen, setExportMenuOpen] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);

  // Real-time users listener (for enriching payment data)
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "users"), (snapshot) => {
      const usersList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setUsers(usersList);
    });
    return () => unsubscribe();
  }, []);

  // Real-time payments listener (for export)
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "payments"), (snapshot) => {
      const paymentsList = snapshot.docs.map((doc) => {
        const data = doc.data();
        const user = users.find((u) => u.id === data.userId);
        return {
          id: doc.id,
          userId: data.userId,
          planType: data.planType || "Basic",
          amount: typeof data.amount === "number" ? data.amount : parseFloat(data.amount || "0") || 0,
          status: data.status || "completed",
          createdAt: data.createdAt || data.timestamp || new Date(),
          stripeId: data.stripeId || data.stripeSessionId,
          userName: user?.name || user?.email || "Unknown User",
          userEmail: user?.email,
        };
      });
      setPayments(paymentsList);
    });
    return () => unsubscribe();
  }, [users]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">
          Payments <span className="text-[#FF2E2E]">Analytics</span>
        </h1>
        <p className="text-gray-400">
          Track real-time revenue and plan performance across MacroMinded.
        </p>
      </div>

      {/* Filters */}
      <FiltersBar
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
        planTypeFilter={planTypeFilter}
        onPlanTypeFilterChange={setPlanTypeFilter}
        onExportClick={() => setExportMenuOpen(true)}
      />

      {/* Revenue Overview */}
      <RevenueOverview dateRange={dateRange} />

      {/* Charts and Table Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Plan Distribution Chart */}
        <PlanDistributionChart dateRange={dateRange} />

        {/* Placeholder for future chart */}
        <div className="bg-[#151515] border border-[#222] rounded-2xl p-6 flex items-center justify-center">
          <p className="text-gray-400 text-sm">Additional analytics coming soon</p>
        </div>
      </div>

      {/* Transactions Table - Full Width */}
      <TransactionsTable
        dateRange={dateRange}
        planTypeFilter={planTypeFilter}
        users={users}
      />

      {/* Export Menu */}
      <ExportMenu
        payments={payments}
        open={exportMenuOpen}
        onClose={() => setExportMenuOpen(false)}
      />
    </motion.div>
  );
}
