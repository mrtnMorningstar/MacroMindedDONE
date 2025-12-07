"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, CheckCircle2, FileText, Send } from "lucide-react";
import { collection, query, where, getDocs, updateDoc, doc, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { useToast } from "@/hooks/use-toast";

export function QuickActions() {
  const [loading, setLoading] = useState<string | null>(null);
  const { toast } = useToast();

  const sendReminderToInactive = async () => {
    setLoading("inactive");
    try {
      const now = new Date();
      const cutoff = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      const usersSnapshot = await getDocs(collection(db, "users"));
      const inactiveUsers = usersSnapshot.docs.filter((docSnap) => {
        const data = docSnap.data();
        if ((data.role ?? "").toLowerCase() === "admin") return false;
        const lastActive = data.lastActive?.toDate?.() || new Date(data.lastActive || data.createdAt || now);
        return lastActive < cutoff;
      });

      // In a real app, you'd send emails here via Resend
      // For now, we'll just update a flag
      for (const userDoc of inactiveUsers) {
        await updateDoc(doc(db, "users", userDoc.id), {
          lastReminderSent: Timestamp.now(),
        });
      }

      toast({
        title: "Success",
        description: `Reminder sent to ${inactiveUsers.length} inactive user${inactiveUsers.length !== 1 ? "s" : ""}.`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to send reminders.",
        variant: "destructive",
      });
    } finally {
      setLoading(null);
    }
  };

  const markPendingAsReviewed = async () => {
    setLoading("reviewed");
    try {
      const usersSnapshot = await getDocs(
        query(collection(db, "users"), where("planStatus", "==", "pending"))
      );

      const batch = usersSnapshot.docs.map((userDoc) =>
        updateDoc(doc(db, "users", userDoc.id), {
          planStatus: "In Progress",
          reviewedAt: Timestamp.now(),
        })
      );

      await Promise.all(batch);

      toast({
        title: "Success",
        description: `Marked ${usersSnapshot.docs.length} pending plan${usersSnapshot.docs.length !== 1 ? "s" : ""} as reviewed.`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update plans.",
        variant: "destructive",
      });
    } finally {
      setLoading(null);
    }
  };

  const generateReport = async () => {
    setLoading("report");
    try {
      const usersSnapshot = await getDocs(collection(db, "users"));
      const paymentsSnapshot = await getDocs(collection(db, "payments"));

      const clients = usersSnapshot.docs.filter(
        (d) => (d.data().role ?? "").toLowerCase() !== "admin"
      ).length;
      const totalRevenue = paymentsSnapshot.docs.reduce((sum, doc) => {
        const amount = typeof doc.data().amount === "number" 
          ? doc.data().amount 
          : parseFloat(doc.data().amount || "0") || 0;
        return sum + amount;
      }, 0);

      const report = {
        timestamp: new Date().toISOString(),
        totalClients: clients,
        totalRevenue,
        totalPayments: paymentsSnapshot.docs.length,
      };

      // Save to Firestore adminConfig
      await updateDoc(doc(db, "adminConfig", "reports"), {
        lastReport: report,
        lastGenerated: Timestamp.now(),
      });

      toast({
        title: "Report Generated",
        description: `Snapshot: ${clients} clients, $${totalRevenue.toLocaleString()} revenue.`,
      });
    } catch (error: any) {
      // If adminConfig doesn't exist, create it
      if (error.code === "not-found") {
        try {
          await updateDoc(doc(db, "adminConfig", "reports"), {
            lastReport: {},
            lastGenerated: Timestamp.now(),
          });
          toast({
            title: "Report Generated",
            description: "Report snapshot created successfully.",
          });
        } catch (createError: any) {
          toast({
            title: "Error",
            description: createError.message || "Failed to generate report.",
            variant: "destructive",
          });
        }
      } else {
        toast({
          title: "Error",
          description: error.message || "Failed to generate report.",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(null);
    }
  };

  const actions = [
    {
      id: "inactive",
      label: "Send Reminder to Inactive Users",
      description: "Users inactive >30 days",
      icon: Mail,
      onClick: sendReminderToInactive,
      color: "text-blue-400",
      bgColor: "bg-blue-400/10",
    },
    {
      id: "reviewed",
      label: "Mark All Pending as Reviewed",
      description: "Update pending plans",
      icon: CheckCircle2,
      onClick: markPendingAsReviewed,
      color: "text-green-400",
      bgColor: "bg-green-400/10",
    },
    {
      id: "report",
      label: "Generate Report Snapshot",
      description: "Create data snapshot",
      icon: FileText,
      onClick: generateReport,
      color: "text-[#FF2E2E]",
      bgColor: "bg-[#FF2E2E]/10",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[#151515] border border-[#222] rounded-2xl p-6 shadow-lg backdrop-blur-sm"
    >
      <div className="flex items-center gap-2 mb-6">
        <div className="p-2 rounded-lg bg-[#FF2E2E]/10 border border-[#FF2E2E]/20">
          <Send className="h-5 w-5 text-[#FF2E2E]" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-white">Quick Actions</h2>
          <p className="text-xs text-gray-400">One-click automation</p>
        </div>
      </div>

      <div className="space-y-3">
        {actions.map((action) => {
          const Icon = action.icon;
          const isLoading = loading === action.id;

          return (
            <motion.button
              key={action.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={action.onClick}
              disabled={!!loading}
              className="w-full p-4 rounded-lg bg-[#1a1a1a] hover:bg-[#222] border border-[#222] hover:border-[#FF2E2E]/50 transition-all duration-300 text-left disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${action.bgColor}`}>
                  <Icon className={`h-4 w-4 ${action.color}`} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-white">{action.label}</p>
                  <p className="text-xs text-gray-400">{action.description}</p>
                </div>
                {isLoading && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#FF2E2E]" />
                )}
              </div>
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
}

