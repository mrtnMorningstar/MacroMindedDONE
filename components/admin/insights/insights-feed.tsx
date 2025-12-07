"use client";

import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TrendingUp, Users, Clock, DollarSign, AlertCircle } from "lucide-react";
import { collection, onSnapshot, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase/config";

interface Insight {
  id: string;
  type: "revenue" | "users" | "plans" | "warning";
  message: string;
  value?: number;
  icon: typeof TrendingUp;
  color: string;
}

export function InsightsFeed() {
  const [users, setUsers] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [insights, setInsights] = useState<Insight[]>([]);

  // Real-time users listener
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "users"), (snapshot) => {
      setUsers(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return () => unsubscribe();
  }, []);

  // Real-time payments listener
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "payments"), (snapshot) => {
      setPayments(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return () => unsubscribe();
  }, []);

  // Generate insights every 60 seconds
  useEffect(() => {
    const generateInsights = () => {
      const newInsights: Insight[] = [];

      // Filter out admins
      const clients = users.filter((u) => (u.role ?? "").toLowerCase() !== "admin");

      // Revenue insights
      const now = new Date();
      const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const previous7Days = new Date(last7Days.getTime() - 7 * 24 * 60 * 60 * 1000);

      const recentPayments = payments.filter((p) => {
        const date = p.createdAt?.toDate?.() || new Date(p.createdAt || now);
        return date >= last7Days;
      });

      const previousPayments = payments.filter((p) => {
        const date = p.createdAt?.toDate?.() || new Date(p.createdAt || now);
        return date >= previous7Days && date < last7Days;
      });

      const recentRevenue = recentPayments.reduce(
        (sum, p) => sum + (typeof p.amount === "number" ? p.amount : parseFloat(p.amount || "0") || 0),
        0
      );
      const previousRevenue = previousPayments.reduce(
        (sum, p) => sum + (typeof p.amount === "number" ? p.amount : parseFloat(p.amount || "0") || 0),
        0
      );

      if (previousRevenue > 0) {
        const revenueChange = ((recentRevenue - previousRevenue) / previousRevenue) * 100;
        if (Math.abs(revenueChange) > 5) {
          newInsights.push({
            id: "revenue-1",
            type: "revenue",
            message: `Revenue ${revenueChange > 0 ? "increased" : "decreased"} ${Math.abs(revenueChange).toFixed(0)}% this week`,
            value: revenueChange,
            icon: TrendingUp,
            color: revenueChange > 0 ? "text-green-400" : "text-red-400",
          });
        }
      }

      // User upgrade insights
      const eliteUpgrades = clients.filter(
        (u) => u.planType === "Elite" && u.createdAt && new Date(u.createdAt) >= last7Days
      ).length;
      if (eliteUpgrades > 0) {
        newInsights.push({
          id: "users-1",
          type: "users",
          message: `${eliteUpgrades} user${eliteUpgrades > 1 ? "s" : ""} upgraded to Elite plan`,
          value: eliteUpgrades,
          icon: Users,
          color: "text-[#FF2E2E]",
        });
      }

      // Pending plans overdue
      const overduePlans = clients.filter((u) => {
        const status = (u.planStatus || "").toLowerCase();
        if (status !== "pending") return false;
        const created = u.createdAt ? new Date(u.createdAt) : null;
        if (!created) return false;
        const daysSince = (now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24);
        return daysSince > 7;
      }).length;

      if (overduePlans > 0) {
        newInsights.push({
          id: "plans-1",
          type: "warning",
          message: `${overduePlans} pending plan${overduePlans > 1 ? "s" : ""} overdue >7 days`,
          value: overduePlans,
          icon: AlertCircle,
          color: "text-yellow-400",
        });
      }

      // Total clients growth
      const newClients = clients.filter((u) => {
        const created = u.createdAt ? new Date(u.createdAt) : null;
        if (!created) return false;
        return created >= last7Days;
      }).length;

      if (newClients > 0) {
        newInsights.push({
          id: "users-2",
          type: "users",
          message: `${newClients} new client${newClients > 1 ? "s" : ""} registered this week`,
          value: newClients,
          icon: Users,
          color: "text-blue-400",
        });
      }

      setInsights(newInsights);
    };

    generateInsights();
    const interval = setInterval(generateInsights, 60000); // Refresh every 60 seconds

    return () => clearInterval(interval);
  }, [users, payments]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[#151515] border border-[#222] rounded-2xl p-6 shadow-lg backdrop-blur-sm"
    >
      <div className="flex items-center gap-2 mb-6">
        <div className="p-2 rounded-lg bg-[#FF2E2E]/10 border border-[#FF2E2E]/20">
          <TrendingUp className="h-5 w-5 text-[#FF2E2E]" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-white">Live Insights</h2>
          <p className="text-xs text-gray-400">Auto-updated every 60 seconds</p>
        </div>
      </div>

      <div className="space-y-3 max-h-[400px] overflow-y-auto">
        <AnimatePresence>
          {insights.length > 0 ? (
            insights.map((insight, index) => {
              const Icon = insight.icon;
              return (
                <motion.div
                  key={insight.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-4 rounded-lg bg-gradient-to-r from-[#1a1a1a] to-[#151515] border border-[#222] hover:border-[#FF2E2E]/50 transition-all duration-300 group cursor-pointer"
                  style={{
                    background: "linear-gradient(135deg, rgba(26,26,26,0.8) 0%, rgba(21,21,21,0.8) 100%)",
                  }}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg bg-[#FF2E2E]/10 border border-[#FF2E2E]/20 ${insight.color}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-white group-hover:text-[#FF2E2E] transition-colors">
                        {insight.message}
                      </p>
                      {insight.value !== undefined && (
                        <p className="text-xs text-gray-400 mt-1">
                          Value: {insight.value > 0 ? "+" : ""}
                          {insight.value.toFixed(1)}
                        </p>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-400 text-sm">No insights available yet</p>
              <p className="text-xs text-gray-500 mt-1">Insights will appear as data accumulates</p>
            </div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

