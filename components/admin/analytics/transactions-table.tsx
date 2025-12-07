"use client";

import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ExternalLink, ChevronUp, ChevronDown } from "lucide-react";
import { collection, onSnapshot, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { EmptyState } from "@/components/admin/shared/empty-state";
import { CreditCard } from "lucide-react";

interface Payment {
  id: string;
  userId?: string;
  planType?: string;
  amount: number;
  status?: string;
  createdAt?: Timestamp | Date | string;
  stripeId?: string;
  userName?: string;
  userEmail?: string;
}

interface TransactionsTableProps {
  dateRange: string;
  planTypeFilter: string;
  users: any[];
}

type SortField = "date" | "amount" | "planType" | null;
type SortDirection = "asc" | "desc";

export function TransactionsTable({ dateRange, planTypeFilter, users }: TransactionsTableProps) {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [sortField, setSortField] = useState<SortField>("date");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [loading, setLoading] = useState(true);

  // Real-time payments listener
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "payments"), (snapshot) => {
      const paymentsList = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          userId: data.userId,
          planType: data.planType || "Basic",
          amount: typeof data.amount === "number" ? data.amount : parseFloat(data.amount || "0") || 0,
          status: data.status || "completed",
          createdAt: data.createdAt || data.timestamp || new Date(),
          stripeId: data.stripeId || data.stripeSessionId,
        };
      });
      setPayments(paymentsList);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Enrich with user data
  const enrichedPayments = useMemo(() => {
    return payments.map((payment) => {
      const user = users.find((u) => u.id === payment.userId);
      return {
        ...payment,
        userName: user?.name || user?.email || "Unknown User",
        userEmail: user?.email,
      };
    });
  }, [payments, users]);

  // Filter payments
  const filteredPayments = useMemo(() => {
    let filtered = enrichedPayments;

    // Date range filter
    if (dateRange !== "all") {
      const now = new Date();
      const days = dateRange === "7" ? 7 : 30;
      const cutoff = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

      filtered = filtered.filter((payment) => {
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
    }

    // Plan type filter
    if (planTypeFilter !== "all") {
      filtered = filtered.filter((payment) => payment.planType === planTypeFilter);
    }

    return filtered;
  }, [enrichedPayments, dateRange, planTypeFilter]);

  // Sort payments
  const sortedPayments = useMemo(() => {
    if (!sortField) return filteredPayments;

    return [...filteredPayments].sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortField) {
        case "date":
          aValue = a.createdAt instanceof Timestamp 
            ? a.createdAt.toMillis() 
            : a.createdAt instanceof Date 
            ? a.createdAt.getTime() 
            : new Date(a.createdAt).getTime();
          bValue = b.createdAt instanceof Timestamp 
            ? b.createdAt.toMillis() 
            : b.createdAt instanceof Date 
            ? b.createdAt.getTime() 
            : new Date(b.createdAt).getTime();
          break;
        case "amount":
          aValue = a.amount;
          bValue = b.amount;
          break;
        case "planType":
          aValue = (a.planType || "").toLowerCase();
          bValue = (b.planType || "").toLowerCase();
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
      if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
  }, [filteredPayments, sortField, sortDirection]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return "Unknown";
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
      });
    } catch {
      return "Unknown";
    }
  };

  const SortButton = ({ field, children }: { field: SortField; children: React.ReactNode }) => {
    const isActive = sortField === field;
    const direction = isActive ? sortDirection : null;

    return (
      <button
        onClick={() => handleSort(field)}
        className="flex items-center gap-1 hover:text-[#FF2E2E] transition-colors"
      >
        {children}
        <div className="flex flex-col">
          <ChevronUp
            className={`h-3 w-3 ${isActive && direction === "asc" ? "text-[#FF2E2E]" : "text-gray-500"}`}
          />
          <ChevronDown
            className={`h-3 w-3 -mt-1 ${isActive && direction === "desc" ? "text-[#FF2E2E]" : "text-gray-500"}`}
          />
        </div>
      </button>
    );
  };

  if (loading) {
    return (
      <div className="bg-[#151515] border border-[#222] rounded-2xl p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF2E2E] mx-auto mb-4"></div>
        <p className="text-gray-400">Loading transactions...</p>
      </div>
    );
  }

  if (sortedPayments.length === 0) {
    return <EmptyState icon={CreditCard} title="No transactions found" description="Transactions will appear here once payments are processed." />;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[#151515] border border-[#222] rounded-2xl overflow-hidden shadow-lg"
    >
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-[#1a1a1a] border-b border-[#222]">
            <tr>
              <th className="text-left py-4 px-6 text-sm font-semibold text-gray-300 uppercase tracking-wider">
                <SortButton field="date">Date</SortButton>
              </th>
              <th className="text-left py-4 px-6 text-sm font-semibold text-gray-300 uppercase tracking-wider">
                User
              </th>
              <th className="text-left py-4 px-6 text-sm font-semibold text-gray-300 uppercase tracking-wider">
                <SortButton field="planType">Plan</SortButton>
              </th>
              <th className="text-left py-4 px-6 text-sm font-semibold text-gray-300 uppercase tracking-wider">
                <SortButton field="amount">Amount</SortButton>
              </th>
              <th className="text-left py-4 px-6 text-sm font-semibold text-gray-300 uppercase tracking-wider">
                Status
              </th>
              <th className="text-left py-4 px-6 text-sm font-semibold text-gray-300 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#222]">
            <AnimatePresence>
              {sortedPayments.map((payment, index) => (
                <motion.tr
                  key={payment.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ delay: index * 0.02 }}
                  className="bg-[#151515] hover:bg-[#1a1a1a] hover:border-l-4 hover:border-[#FF2E2E] transition-all duration-300"
                >
                  <td className="py-4 px-6 text-gray-300 text-sm">{formatDate(payment.createdAt)}</td>
                  <td className="py-4 px-6">
                    <div>
                      <p className="text-white font-medium">{payment.userName}</p>
                      {payment.userEmail && (
                        <p className="text-xs text-gray-400">{payment.userEmail}</p>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className="px-2 py-1 rounded text-xs font-medium bg-[#FF2E2E]/10 text-[#FF2E2E] border border-[#FF2E2E]/20">
                      {payment.planType || "Basic"}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-white font-semibold">
                    ${payment.amount.toLocaleString()}
                  </td>
                  <td className="py-4 px-6">
                    <span className="px-2 py-1 rounded text-xs font-medium bg-green-500/20 text-green-400 border border-green-500/30">
                      {payment.status || "completed"}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    {payment.stripeId && (
                      <a
                        href={`https://dashboard.stripe.com/payments/${payment.stripeId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-[#FF2E2E] hover:text-[#FF5555] transition-colors"
                      >
                        View <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}

