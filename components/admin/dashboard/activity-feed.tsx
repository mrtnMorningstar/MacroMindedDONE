"use client";

import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, UserPlus, FileText, CreditCard } from "lucide-react";
import { collection, onSnapshot, query, orderBy, limit, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase/config";

interface Activity {
  id: string;
  type: "user" | "plan" | "payment";
  message: string;
  timestamp: Timestamp | Date | string;
  userName?: string;
}

export function ActivityFeed() {
  const [users, setUsers] = useState<any[]>([]);
  const [plans, setPlans] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Listen to users
  useEffect(() => {
    const usersUnsub = onSnapshot(
      query(collection(db, "users"), orderBy("createdAt", "desc"), limit(5)),
      (snapshot) => {
        const usersList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setUsers(usersList);
      }
    );
    return () => usersUnsub();
  }, []);

  // Listen to plans
  useEffect(() => {
    const plansUnsub = onSnapshot(
      query(collection(db, "plans"), orderBy("createdAt", "desc"), limit(5)),
      (snapshot) => {
        const plansList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setPlans(plansList);
      }
    );
    return () => plansUnsub();
  }, []);

  // Listen to payments
  useEffect(() => {
    const paymentsUnsub = onSnapshot(
      query(collection(db, "payments"), orderBy("createdAt", "desc"), limit(5)),
      (snapshot) => {
        const paymentsList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setPayments(paymentsList);
        setLoading(false);
      }
    );
    return () => paymentsUnsub();
  }, []);

  // Combine and sort activities
  const activities = useMemo(() => {
    const allActivities: Activity[] = [];

    // Add user registrations
    users.forEach((user) => {
      if (user.role?.toLowerCase() !== "admin") {
        allActivities.push({
          id: `user-${user.id}`,
          type: "user" as const,
          message: `${user.name || user.email || "New user"} registered`,
          timestamp: user.createdAt || new Date(),
          userName: user.name || user.email,
        });
      }
    });

    // Add plan deliveries
    plans.forEach((plan) => {
      allActivities.push({
        id: `plan-${plan.id}`,
        type: "plan" as const,
        message: `Plan delivered to user`,
        timestamp: plan.createdAt || new Date(),
      });
    });

    // Add payments
    payments.forEach((payment) => {
      const amount = typeof payment.amount === "number" 
        ? payment.amount 
        : parseFloat(payment.amount || "0");
      allActivities.push({
        id: `payment-${payment.id}`,
        type: "payment" as const,
        message: `Payment received: $${amount.toLocaleString()}`,
        timestamp: payment.createdAt || payment.timestamp || new Date(),
      });
    });

    // Sort by timestamp (newest first)
    return allActivities.sort((a, b) => {
      const timeA = a.timestamp instanceof Timestamp 
        ? a.timestamp.toMillis() 
        : a.timestamp instanceof Date 
        ? a.timestamp.getTime() 
        : new Date(a.timestamp).getTime();
      const timeB = b.timestamp instanceof Timestamp 
        ? b.timestamp.toMillis() 
        : b.timestamp instanceof Date 
        ? b.timestamp.getTime() 
        : new Date(b.timestamp).getTime();
      return timeB - timeA;
    }).slice(0, 10);
  }, [users, plans, payments]);

  const getIcon = (type: string) => {
    switch (type) {
      case "user":
        return <UserPlus className="h-4 w-4 text-blue-400" />;
      case "plan":
        return <FileText className="h-4 w-4 text-green-400" />;
      case "payment":
        return <CreditCard className="h-4 w-4 text-[#FF2E2E]" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const formatTime = (timestamp: Timestamp | Date | string) => {
    try {
      let date: Date;
      if (timestamp instanceof Timestamp) {
        date = timestamp.toDate();
      } else if (timestamp instanceof Date) {
        date = timestamp;
      } else {
        date = new Date(timestamp);
      }

      const now = new Date();
      const diff = now.getTime() - date.getTime();
      const minutes = Math.floor(diff / 60000);
      const hours = Math.floor(diff / 3600000);
      const days = Math.floor(diff / 86400000);

      if (minutes < 1) return "Just now";
      if (minutes < 60) return `${minutes}m ago`;
      if (hours < 24) return `${hours}h ago`;
      if (days < 7) return `${days}d ago`;
      return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    } catch {
      return "Recently";
    }
  };

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[#151515] border border-[#222] rounded-2xl p-6"
      >
        <div className="flex items-center gap-2 mb-6">
          <Clock className="h-5 w-5 text-[#FF2E2E]" />
          <h2 className="text-xl font-semibold text-white">Recent Activity</h2>
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-16 bg-[#222] rounded-lg"></div>
            </div>
          ))}
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
      <div className="flex items-center gap-2 mb-6">
        <Clock className="h-5 w-5 text-[#FF2E2E]" />
        <h2 className="text-xl font-semibold text-white">Recent Activity</h2>
      </div>

      <div className="space-y-3 max-h-[400px] overflow-y-auto">
        <AnimatePresence>
          {activities.length > 0 ? (
            activities.map((activity, index) => (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-start gap-3 p-3 rounded-lg hover:bg-[#1a1a1a] transition-colors border border-[#222]/50"
              >
                <div className="mt-0.5">{getIcon(activity.type)}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white truncate">{activity.message}</p>
                  <p className="text-xs text-gray-400 mt-1">{formatTime(activity.timestamp)}</p>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-400 text-sm">No recent activity</p>
              <p className="text-xs text-gray-500 mt-1">Activity will appear here as events occur</p>
            </div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
