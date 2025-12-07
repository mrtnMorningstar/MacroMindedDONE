"use client";

import { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import { DollarSign, TrendingUp, Users, BarChart3 } from "lucide-react";
import { collection, onSnapshot, query, where, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase/config";

interface Payment {
  id: string;
  amount: number;
  planType?: string;
  createdAt?: Timestamp | Date | string;
}

function AnimatedNumber({ value, prefix = "", suffix = "", decimals = 0 }: { 
  value: number; 
  prefix?: string; 
  suffix?: string;
  decimals?: number;
}) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const duration = 1000;
    const steps = 30;
    const increment = value / steps;
    let current = 0;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      current = Math.min(increment * step, value);
      setDisplayValue(current);

      if (step >= steps) {
        clearInterval(timer);
        setDisplayValue(value);
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [value]);

  return (
    <motion.span
      key={value}
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="text-2xl font-bold text-white"
    >
      {prefix}
      {displayValue.toFixed(decimals).toLocaleString()}
      {suffix}
    </motion.span>
  );
}

export function RevenueOverview({ dateRange }: { dateRange: string }) {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [allPayments, setAllPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  // Real-time payments listener
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "payments"), (snapshot) => {
      const paymentsList = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          amount: typeof data.amount === "number" ? data.amount : parseFloat(data.amount || "0") || 0,
          planType: data.planType,
          createdAt: data.createdAt || data.timestamp || new Date(),
        };
      });
      setAllPayments(paymentsList);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Filter payments by date range
  const filteredPayments = useMemo(() => {
    if (dateRange === "all") return allPayments;

    const now = new Date();
    const days = dateRange === "7" ? 7 : 30;
    const cutoff = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

    return allPayments.filter((payment) => {
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
  }, [allPayments, dateRange]);

  // Calculate previous period for comparison
  const previousPayments = useMemo(() => {
    if (dateRange === "all") return [];

    const now = new Date();
    const days = dateRange === "7" ? 7 : 30;
    const currentStart = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    const previousStart = new Date(currentStart.getTime() - days * 24 * 60 * 60 * 1000);

    return allPayments.filter((payment) => {
      let date: Date;
      if (payment.createdAt instanceof Timestamp) {
        date = payment.createdAt.toDate();
      } else if (payment.createdAt instanceof Date) {
        date = payment.createdAt;
      } else {
        date = new Date(payment.createdAt);
      }
      return date >= previousStart && date < currentStart;
    });
  }, [allPayments, dateRange]);

  // Calculate metrics
  const metrics = useMemo(() => {
    const totalRevenue = filteredPayments.reduce((sum, p) => sum + p.amount, 0);
    const transactionCount = filteredPayments.length;
    const avgOrderValue = transactionCount > 0 ? totalRevenue / transactionCount : 0;

    const previousRevenue = previousPayments.reduce((sum, p) => sum + p.amount, 0);
    const revenueChange = previousRevenue > 0 
      ? ((totalRevenue - previousRevenue) / previousRevenue) * 100 
      : 0;

    return {
      totalRevenue,
      transactionCount,
      avgOrderValue,
      revenueChange,
    };
  }, [filteredPayments, previousPayments]);

  const cards = [
    {
      label: "Total Revenue",
      value: metrics.totalRevenue,
      change: metrics.revenueChange,
      icon: DollarSign,
      color: "text-[#FF2E2E]",
      bgColor: "bg-[#FF2E2E]/10",
      prefix: "$",
      suffix: "",
      decimals: 0,
    },
    {
      label: "Transactions",
      value: metrics.transactionCount,
      change: 0,
      icon: BarChart3,
      color: "text-blue-400",
      bgColor: "bg-blue-400/10",
      prefix: "",
      suffix: "",
      decimals: 0,
    },
    {
      label: "Avg Order Value",
      value: metrics.avgOrderValue,
      change: 0,
      icon: TrendingUp,
      color: "text-green-400",
      bgColor: "bg-green-400/10",
      prefix: "$",
      suffix: "",
      decimals: 2,
    },
    {
      label: "Active Clients",
      value: new Set(filteredPayments.map((p) => p.id)).size,
      change: 0,
      icon: Users,
      color: "text-yellow-400",
      bgColor: "bg-yellow-400/10",
      prefix: "",
      suffix: "",
      decimals: 0,
    },
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="bg-[#151515] border border-[#222] rounded-2xl p-6 animate-pulse"
          >
            <div className="h-20 bg-[#222] rounded-lg"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.02, y: -4 }}
            className="bg-[#151515] border border-[#222] rounded-2xl p-6 hover:border-[#FF2E2E]/50 transition-all duration-300 shadow-lg hover:shadow-[0_0_20px_rgba(255,46,46,0.25)]"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-lg ${card.bgColor}`}>
                <Icon className={`h-5 w-5 ${card.color}`} />
              </div>
              {card.change !== 0 && (
                <span
                  className={`text-xs font-medium ${
                    card.change > 0 ? "text-green-400" : "text-red-400"
                  }`}
                >
                  {card.change > 0 ? "+" : ""}
                  {card.change.toFixed(1)}%
                </span>
              )}
            </div>
            <div className="mb-1">
              <AnimatedNumber
                value={card.value}
                prefix={card.prefix}
                suffix={card.suffix}
                decimals={card.decimals}
              />
            </div>
            <p className="text-sm text-gray-400">{card.label}</p>
          </motion.div>
        );
      })}
    </div>
  );
}

