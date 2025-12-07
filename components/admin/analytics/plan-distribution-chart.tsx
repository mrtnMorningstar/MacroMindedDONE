"use client";

import { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { collection, onSnapshot, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase/config";

interface Payment {
  id: string;
  planType?: string;
  amount: number;
  createdAt?: Timestamp | Date | string;
}

const COLORS = {
  Basic: "#FF5555",
  Pro: "#FF2E2E",
  Elite: "#990000",
};

export function PlanDistributionChart({ dateRange }: { dateRange: string }) {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "payments"), (snapshot) => {
      const paymentsList = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          planType: data.planType || "Basic",
          amount: typeof data.amount === "number" ? data.amount : parseFloat(data.amount || "0") || 0,
          createdAt: data.createdAt || data.timestamp || new Date(),
        };
      });
      setPayments(paymentsList);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Filter by date range
  const filteredPayments = useMemo(() => {
    if (dateRange === "all") return payments;

    const now = new Date();
    const days = dateRange === "7" ? 7 : 30;
    const cutoff = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

    return payments.filter((payment) => {
      let date: Date;
      if (payment.createdAt instanceof Timestamp) {
        date = payment.createdAt.toDate();
      } else if (payment.createdAt instanceof Date) {
        date = payment.createdAt;
      } else {
        date = new Date(payment.createdAt);
      }
      return date >= cutoff;
    });
  }, [payments, dateRange]);

  // Aggregate by plan type
  const chartData = useMemo(() => {
    const distribution: { [key: string]: { count: number; revenue: number } } = {};

    filteredPayments.forEach((payment) => {
      const planType = payment.planType || "Basic";
      if (!distribution[planType]) {
        distribution[planType] = { count: 0, revenue: 0 };
      }
      distribution[planType].count++;
      distribution[planType].revenue += payment.amount;
    });

    const total = filteredPayments.length;
    return Object.entries(distribution).map(([name, data]) => ({
      name,
      value: data.count,
      revenue: data.revenue,
      percentage: total > 0 ? ((data.count / total) * 100).toFixed(1) : "0",
    }));
  }, [filteredPayments]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="bg-[#151515] border border-[#222] rounded-lg p-3 shadow-lg">
          <p className="text-white font-semibold">{data.name}</p>
          <p className="text-sm text-gray-400">
            Transactions: {data.value}
          </p>
          <p className="text-sm text-[#FF2E2E]">
            Revenue: ${data.payload.revenue.toLocaleString()}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {data.payload.percentage}% of total
          </p>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[#151515] border border-[#222] rounded-2xl p-6"
      >
        <div className="h-64 flex items-center justify-center">
          <div className="animate-pulse text-gray-400">Loading chart...</div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[#151515] border border-[#222] rounded-2xl p-6 shadow-lg"
    >
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-white mb-1">Plan Distribution</h2>
        <p className="text-sm text-gray-400">Revenue breakdown by plan type</p>
      </div>

      {chartData.length > 0 ? (
        <div className="h-64 w-full min-w-0">
          <ResponsiveContainer width="100%" height="100%" minHeight={256}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percentage }) => `${name} ${percentage}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                animationBegin={0}
                animationDuration={800}
              >
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[entry.name as keyof typeof COLORS] || "#FF2E2E"}
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{ color: "#fff" }}
                formatter={(value) => (
                  <span className="text-gray-300">{value}</span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="h-64 flex items-center justify-center">
          <div className="text-center space-y-2">
            <p className="text-gray-400">No payment data available</p>
            <p className="text-xs text-gray-500">Plan distribution will appear here once payments are processed</p>
          </div>
        </div>
      )}
    </motion.div>
  );
}

