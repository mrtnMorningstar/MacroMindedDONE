"use client";

import { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Brain, Sparkles, TrendingUp, Users } from "lucide-react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase/config";

export function AiSummaryCard() {
  const [users, setUsers] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);

  useEffect(() => {
    const usersUnsub = onSnapshot(collection(db, "users"), (snapshot) => {
      setUsers(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
    });

    const paymentsUnsub = onSnapshot(collection(db, "payments"), (snapshot) => {
      setPayments(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
    });

    return () => {
      usersUnsub();
      paymentsUnsub();
    };
  }, []);

  const insights = useMemo(() => {
    const clients = users.filter((u) => (u.role ?? "").toLowerCase() !== "admin");
    const totalClients = clients.length;
    const deliveredPlans = clients.filter(
      (u) => (u.planStatus ?? "").toLowerCase() === "delivered"
    ).length;
    const totalRevenue = payments.reduce(
      (sum, p) => sum + (typeof p.amount === "number" ? p.amount : parseFloat(p.amount || "0") || 0),
      0
    );

    const deliveryRate = totalClients > 0 ? Math.round((deliveredPlans / totalClients) * 100) : 0;
    const avgRevenue = payments.length > 0 ? Math.round(totalRevenue / payments.length) : 0;

    return [
      {
        label: "User Retention",
        value: deliveryRate,
        trend: "+12%",
        icon: Users,
        color: "text-blue-400",
      },
      {
        label: "Average Revenue",
        value: avgRevenue,
        trend: "+8%",
        icon: TrendingUp,
        color: "text-[#FF2E2E]",
      },
    ];
  }, [users, payments]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-[#151515] to-[#1a1a1a] border border-[#222] rounded-2xl p-6 relative overflow-hidden shadow-lg"
    >
      {/* Decorative gradient */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-[#FF2E2E]/5 rounded-full blur-3xl" />

      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-lg bg-[#FF2E2E]/10 border border-[#FF2E2E]/20">
            <Brain className="h-6 w-6 text-[#FF2E2E]" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-white">AI Performance Summary</h2>
            <p className="text-sm text-gray-400">Insights powered by analytics</p>
          </div>
          <Sparkles className="h-5 w-5 text-[#FF2E2E]" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {insights.map((insight, index) => {
            const Icon = insight.icon;
            return (
              <motion.div
                key={insight.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="p-4 bg-[#0a0a0a]/50 rounded-lg border border-[#222]"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Icon className={`h-4 w-4 ${insight.color}`} />
                    <span className="text-sm text-gray-400">{insight.label}</span>
                  </div>
                  <span className="text-xs text-green-400 font-medium">{insight.trend}</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-white">
                    {insight.label === "Average Revenue" ? "$" : ""}
                    {insight.value.toLocaleString()}
                    {insight.label === "User Retention" ? "%" : ""}
                  </span>
                </div>
                {/* Progress bar */}
                <div className="mt-3 h-1.5 bg-[#222] rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(insight.value, 100)}%` }}
                    transition={{ duration: 1, delay: index * 0.2 }}
                    className="h-full bg-gradient-to-r from-[#FF2E2E] to-[#FF5555] rounded-full"
                  />
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
