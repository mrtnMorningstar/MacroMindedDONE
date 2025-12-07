"use client";

import { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import { TrendingUp, Calendar } from "lucide-react";
import { collection, onSnapshot, query, orderBy, where, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface Payment {
  id: string;
  amount: number;
  createdAt?: Timestamp | Date | string;
}

type TimeRange = "weekly" | "monthly";

export function RevenueChart() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [timeRange, setTimeRange] = useState<TimeRange>("monthly");
  const [loading, setLoading] = useState(true);

  // Real-time payments listener
  useEffect(() => {
    const q = query(collection(db, "payments"), orderBy("createdAt", "desc"));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const paymentsList = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          amount: typeof data.amount === "number" ? data.amount : parseFloat(data.amount || "0") || 0,
          createdAt: data.createdAt || data.timestamp || new Date(),
        };
      });
      setPayments(paymentsList);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Aggregate data by time range
  const chartData = useMemo(() => {
    if (payments.length === 0) return [];

    const now = new Date();
    const months: { [key: string]: number } = {};
    const weeks: { [key: string]: number } = {};

    payments.forEach((payment) => {
      let date: Date;
      if (payment.createdAt instanceof Timestamp) {
        date = payment.createdAt.toDate();
      } else if (payment.createdAt instanceof Date) {
        date = payment.createdAt;
      } else {
        date = new Date(payment.createdAt);
      }

      if (timeRange === "monthly") {
        const monthKey = date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
        months[monthKey] = (months[monthKey] || 0) + payment.amount;
      } else {
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        const weekKey = weekStart.toLocaleDateString("en-US", { month: "short", day: "numeric" });
        weeks[weekKey] = (weeks[weekKey] || 0) + payment.amount;
      }
    });

    const data = timeRange === "monthly" ? months : weeks;
    return Object.entries(data)
      .map(([name, value]) => ({ name, value: Math.round(value) }))
      .slice(-6)
      .reverse();
  }, [payments, timeRange]);

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[#151515] border border-[#222] rounded-2xl p-6"
      >
        <div className="h-64 flex items-center justify-center">
          <div className="animate-pulse text-gray-400">Loading chart data...</div>
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
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-white mb-1">Revenue Overview</h2>
          <p className="text-sm text-gray-400">
            Last {timeRange === "monthly" ? "6 months" : "6 weeks"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="p-3 rounded-lg bg-[#FF2E2E]/10 border border-[#FF2E2E]/20">
            <TrendingUp className="h-5 w-5 text-[#FF2E2E]" />
          </div>
          <div className="flex items-center gap-1 bg-[#0a0a0a] border border-[#222] rounded-lg p-1">
            <button
              onClick={() => setTimeRange("weekly")}
              className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                timeRange === "weekly"
                  ? "bg-[#FF2E2E] text-white"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Weekly
            </button>
            <button
              onClick={() => setTimeRange("monthly")}
              className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                timeRange === "monthly"
                  ? "bg-[#FF2E2E] text-white"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Monthly
            </button>
          </div>
        </div>
      </div>

      <div className="h-64 w-full min-w-0">
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%" minHeight={256}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#FF2E2E" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#FF2E2E" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#222" />
              <XAxis
                dataKey="name"
                stroke="#666"
                style={{ fontSize: "12px" }}
              />
              <YAxis
                stroke="#666"
                style={{ fontSize: "12px" }}
                tickFormatter={(value) => `$${value}`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#151515",
                  border: "1px solid #222",
                  borderRadius: "8px",
                  color: "#fff",
                }}
                formatter={(value: number) => [`$${value.toLocaleString()}`, "Revenue"]}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke="#FF2E2E"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorRevenue)"
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center">
            <div className="text-center space-y-2">
              <Calendar className="h-12 w-12 text-gray-600 mx-auto" />
              <p className="text-gray-400">No payment data available</p>
              <p className="text-xs text-gray-500">Revenue will appear here once payments are processed</p>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
