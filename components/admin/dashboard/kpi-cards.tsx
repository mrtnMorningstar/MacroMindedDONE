"use client";

import { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Users, ClipboardCheck, FileCheck, DollarSign } from "lucide-react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase/config";

interface User {
  id: string;
  role?: string;
  planStatus?: string;
}

interface Payment {
  id: string;
  amount: number | string;
}

function AnimatedNumber({ value, prefix = "", suffix = "" }: { value: number; prefix?: string; suffix?: string }) {
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
      setDisplayValue(Math.round(current));

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
      {displayValue.toLocaleString()}
      {suffix}
    </motion.span>
  );
}

export function KpiCards() {
  const [users, setUsers] = useState<User[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  // Real-time users listener
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "users"), (snapshot) => {
      const usersList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as User),
      }));
      setUsers(usersList);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Real-time payments listener
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "payments"), (snapshot) => {
      const paymentsList = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          amount: typeof data.amount === "number" ? data.amount : parseFloat(data.amount || "0") || 0,
        };
      });
      setPayments(paymentsList);
    });

    return () => unsubscribe();
  }, []);

  // Calculate KPIs
  const kpis = useMemo(() => {
    // Filter out admins
    const clients = users.filter((u) => (u.role ?? "").toLowerCase() !== "admin");
    const totalClients = clients.length;
    const pendingPlans = clients.filter(
      (u) => (u.planStatus ?? "").toLowerCase() === "pending" || !u.planStatus
    ).length;
    const deliveredPlans = clients.filter(
      (u) => (u.planStatus ?? "").toLowerCase() === "delivered"
    ).length;
    const totalRevenue = payments.reduce((sum, p) => sum + (typeof p.amount === "number" ? p.amount : 0), 0);

    return {
      totalClients,
      pendingPlans,
      deliveredPlans,
      totalRevenue,
    };
  }, [users, payments]);

  const cards = [
    {
      label: "Total Clients",
      value: kpis.totalClients,
      icon: Users,
      color: "text-blue-400",
      bgColor: "bg-blue-400/10",
      prefix: "",
      suffix: "",
    },
    {
      label: "Pending Plans",
      value: kpis.pendingPlans,
      icon: ClipboardCheck,
      color: "text-yellow-400",
      bgColor: "bg-yellow-400/10",
      prefix: "",
      suffix: "",
    },
    {
      label: "Delivered Plans",
      value: kpis.deliveredPlans,
      icon: FileCheck,
      color: "text-green-400",
      bgColor: "bg-green-400/10",
      prefix: "",
      suffix: "",
    },
    {
      label: "Total Revenue",
      value: kpis.totalRevenue,
      icon: DollarSign,
      color: "text-[#FF2E2E]",
      bgColor: "bg-[#FF2E2E]/10",
      prefix: "$",
      suffix: "",
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
      {cards.map((kpi, index) => {
        const Icon = kpi.icon;
        return (
          <motion.div
            key={kpi.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.02, y: -4 }}
            className="bg-[#151515] border border-[#222] rounded-2xl p-6 hover:border-[#FF2E2E]/50 transition-all duration-300 shadow-lg hover:shadow-[0_0_20px_rgba(255,46,46,0.2)]"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-lg ${kpi.bgColor}`}>
                <Icon className={`h-5 w-5 ${kpi.color}`} />
              </div>
            </div>
            <div className="mb-1">
              <AnimatedNumber
                value={kpi.value}
                prefix={kpi.prefix}
                suffix={kpi.suffix}
              />
            </div>
            <p className="text-sm text-gray-400">{kpi.label}</p>
          </motion.div>
        );
      })}
    </div>
  );
}
