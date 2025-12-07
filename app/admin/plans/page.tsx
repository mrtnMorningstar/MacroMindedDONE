"use client";

import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { FileText, Download, Trash2, Eye, Calendar, User } from "lucide-react";
import { collection, onSnapshot, query, orderBy, doc, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/admin/shared/empty-state";
import { useToast } from "@/hooks/use-toast";

interface Plan {
  id: string;
  userId: string;
  planTitle?: string;
  fileUrl?: string;
  notes?: string;
  status?: string;
  createdAt?: any;
  userName?: string;
  userEmail?: string;
}

export default function PlansPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Real-time plans listener
  useEffect(() => {
    const q = query(collection(db, "plans"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const plansList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Plan),
      }));
      setPlans(plansList);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Real-time users listener (to get names)
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

  // Enrich plans with user data
  const enrichedPlans = useMemo(() => {
    return plans.map((plan) => {
      const user = users.find((u) => u.id === plan.userId);
      return {
        ...plan,
        userName: user?.name || user?.email || "Unknown User",
        userEmail: user?.email,
      };
    });
  }, [plans, users]);

  // Filter plans
  const filteredPlans = useMemo(() => {
    if (statusFilter === "all") return enrichedPlans;
    return enrichedPlans.filter((plan) => (plan.status || "delivered").toLowerCase() === statusFilter.toLowerCase());
  }, [enrichedPlans, statusFilter]);

  const handleDelete = async (planId: string) => {
    if (!confirm("Are you sure you want to delete this plan?")) return;

    try {
      await deleteDoc(doc(db, "plans", planId));
      toast({
        title: "Success",
        description: "Plan deleted successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete plan.",
        variant: "destructive",
      });
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return "Unknown";
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    } catch {
      return "Unknown";
    }
  };

  const getStatusBadge = (status?: string) => {
    const normalized = (status || "delivered").toLowerCase();
    if (normalized === "delivered") {
      return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Delivered</Badge>;
    }
    if (normalized === "pending") {
      return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">Pending</Badge>;
    }
    return <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">Active</Badge>;
  };

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
          Plans <span className="text-[#FF2E2E]">Management</span>
        </h1>
        <p className="text-gray-400">View and manage all meal plans.</p>
      </div>

      {/* Filters */}
      <div className="bg-[#151515] border border-[#222] rounded-2xl p-4 mb-6">
        <div className="flex items-center gap-4">
          <label className="text-sm text-gray-400">Filter by Status:</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 bg-[#0a0a0a] border border-[#222] rounded-lg text-white focus:outline-none focus:border-[#FF2E2E] focus:ring-1 focus:ring-[#FF2E2E] transition-colors"
          >
            <option value="all">All Plans</option>
            <option value="delivered">Delivered</option>
            <option value="pending">Pending</option>
          </select>
        </div>
      </div>

      {/* Plans Grid */}
      {loading ? (
        <div className="bg-[#151515] border border-[#222] rounded-2xl p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF2E2E] mx-auto mb-4"></div>
          <p className="text-gray-400">Loading plans...</p>
        </div>
      ) : filteredPlans.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No plans found"
          description="Plans will appear here once they are uploaded."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPlans.map((plan, index) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-[#151515] border border-[#222] rounded-2xl p-6 hover:border-[#FF2E2E]/50 transition-all duration-300 shadow-lg hover:shadow-[0_0_20px_rgba(255,46,46,0.1)]"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white mb-1">
                    {plan.planTitle || "Untitled Plan"}
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
                    <User className="h-4 w-4" />
                    <span>{plan.userName}</span>
                  </div>
                </div>
                {getStatusBadge(plan.status)}
              </div>

              {plan.notes && (
                <p className="text-sm text-gray-400 mb-4 line-clamp-2">{plan.notes}</p>
              )}

              <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
                <Calendar className="h-4 w-4" />
                <span>{formatDate(plan.createdAt)}</span>
              </div>

              <div className="flex items-center gap-2 pt-4 border-t border-[#222]">
                {plan.fileUrl && (
                  <a
                    href={plan.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 px-4 py-2 rounded-lg bg-[#222] hover:bg-[#FF2E2E]/20 border border-[#222] hover:border-[#FF2E2E]/50 text-white transition-colors flex items-center justify-center gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Download
                  </a>
                )}
                <button
                  onClick={() => {
                    setSelectedPlan(plan);
                    setDetailsOpen(true);
                  }}
                  className="px-4 py-2 rounded-lg bg-[#222] hover:bg-[#FF2E2E]/20 border border-[#222] hover:border-[#FF2E2E]/50 text-gray-400 hover:text-white transition-colors"
                  title="View Details"
                >
                  <Eye className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete(plan.id)}
                  className="px-4 py-2 rounded-lg bg-[#222] hover:bg-red-500/20 border border-[#222] hover:border-red-500/50 text-gray-400 hover:text-red-400 transition-colors"
                  title="Delete"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Plan Details Drawer */}
      {selectedPlan && (
        <motion.div
          initial={{ x: "100%" }}
          animate={{ x: detailsOpen ? 0 : "100%" }}
          className="fixed right-0 top-0 h-full w-full max-w-md bg-[#151515] border-l border-[#222] z-50 shadow-2xl p-6 overflow-y-auto"
        >
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-white mb-2">{selectedPlan.planTitle || "Plan Details"}</h2>
            <div className="space-y-2 text-sm text-gray-400">
              <p><span className="text-white">Client:</span> {selectedPlan.userName}</p>
              <p><span className="text-white">Email:</span> {selectedPlan.userEmail}</p>
              <p><span className="text-white">Status:</span> {getStatusBadge(selectedPlan.status)}</p>
              <p><span className="text-white">Created:</span> {formatDate(selectedPlan.createdAt)}</p>
            </div>
          </div>

          {selectedPlan.notes && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-white mb-2">Notes</h3>
              <p className="text-gray-300">{selectedPlan.notes}</p>
            </div>
          )}

          {selectedPlan.fileUrl && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-white mb-2">File</h3>
              <a
                href={selectedPlan.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#FF2E2E] hover:bg-[#FF2E2E]/90 text-white transition-colors"
              >
                <Download className="h-4 w-4" />
                Download File
              </a>
            </div>
          )}

          <button
            onClick={() => {
              setDetailsOpen(false);
              setSelectedPlan(null);
            }}
            className="w-full px-4 py-2 rounded-lg bg-[#222] hover:bg-[#333] text-white transition-colors"
          >
            Close
          </button>
        </motion.div>
      )}
    </motion.div>
  );
}
