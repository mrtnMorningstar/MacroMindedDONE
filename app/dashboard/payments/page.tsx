"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CreditCard, Wallet, Calendar, TrendingUp, Receipt, Zap, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { collection, getDocs, query, where, orderBy, doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { useAuth } from "@/context/auth-context";

interface Payment {
  id: string;
  userId?: string;
  planType?: string;
  amount?: number;
  status?: string;
  stripeSessionId?: string;
  timestamp?: any;
  createdAt?: any;
}

interface Subscription {
  plan: string;
  price: string;
  renewalDate: string;
  status: string;
  planType?: string;
}

export default function BillingPage() {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [transactions, setTransactions] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchBillingData() {
      if (!user?.uid) {
        setLoading(false);
        return;
      }

      try {
        // Fetch user document for current plan
        const userDocRef = doc(db, "users", user.uid);
        const userDocSnap = await getDoc(userDocRef);
        
        let userPlanType = "Basic";
        if (userDocSnap.exists()) {
          const userData = userDocSnap.data();
          userPlanType = userData.planType || "Basic";
        }

        // Fetch payments from Firestore
        const paymentsRef = collection(db, "payments");
        let paymentsSnap;
        
        try {
          // Try with timestamp orderBy first
          const paymentsQuery = query(
            paymentsRef,
            where("userId", "==", user.uid),
            orderBy("timestamp", "desc")
          );
          paymentsSnap = await getDocs(paymentsQuery);
        } catch (error: any) {
          // If index error, try without orderBy and sort client-side
          if (error.code === "failed-precondition") {
            console.warn("Payments index not found. Using fallback query without orderBy.");
            const fallbackQuery = query(paymentsRef, where("userId", "==", user.uid));
            paymentsSnap = await getDocs(fallbackQuery);
          } else {
            throw error;
          }
        }
        const payments = paymentsSnap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Payment[];

        // Format transactions and sort by timestamp
        const formattedTransactions = payments
          .map((payment) => {
            const date = payment.timestamp?.toDate 
              ? payment.timestamp.toDate() 
              : payment.createdAt?.toDate 
              ? payment.createdAt.toDate()
              : new Date();
            
            return {
              id: payment.id,
              date: date.toLocaleDateString("en-US", { 
                month: "short", 
                day: "numeric", 
                year: "numeric" 
              }),
              dateObj: date, // Keep original date object for sorting
              amount: `$${(payment.amount || 0).toFixed(2)}`,
              method: "Stripe",
              status: payment.status || "Paid",
              planType: payment.planType || "Unknown",
              stripeSessionId: payment.stripeSessionId,
            };
          })
          .sort((a, b) => {
            // Sort by date object (newest first)
            return b.dateObj.getTime() - a.dateObj.getTime();
          });

        setTransactions(formattedTransactions);

        // Determine plan pricing (one-time purchase prices)
        const planPrices: Record<string, string> = {
          Basic: "$49",
          Pro: "$99",
          Elite: "$149",
        };

        // Get most recent payment date
        const mostRecentPayment = formattedTransactions[0];
        const purchaseDate = mostRecentPayment
          ? mostRecentPayment.dateObj.toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })
          : null;

        // Set plan info (one-time purchase, not subscription)
        setSubscription({
          plan: `${userPlanType} Nutrition Coaching`,
          price: planPrices[userPlanType] || "$49",
          renewalDate: purchaseDate || "No purchase yet",
          status: formattedTransactions.length > 0 ? "Active" : "No Active Plan",
          planType: userPlanType,
        });
      } catch (err) {
        console.error("Error fetching billing data:", err);
        // Fallback to mock data
        setSubscription({
          plan: "Elite Nutrition Coaching",
          price: "$149",
          renewalDate: new Date().toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
          }),
          status: "Active",
          planType: "Elite",
        });
        setTransactions([
          {
            id: "TXN001",
            date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            }),
            amount: "$149.00",
            method: "Stripe",
            status: "Paid",
            planType: "Elite",
          },
        ]);
      } finally {
        setLoading(false);
      }
    }

    fetchBillingData();
  }, [user?.uid]);

  const handleUpgrade = () => {
    window.location.href = "/plans";
  };

  const handleViewReceipt = (stripeSessionId?: string) => {
    if (stripeSessionId) {
      // Open Stripe receipt in new tab
      window.open(`https://dashboard.stripe.com/payments/${stripeSessionId}`, "_blank");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[70vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF2E2E] mx-auto mb-4"></div>
          <p className="text-gray-400">Loading billing information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
          Your <span className="text-[#FF2E2E]">Billing</span>
        </h1>
        <p className="text-gray-400 mt-2">Manage your payments, invoices, and plan details.</p>
      </motion.div>

      {/* Current Plan */}
      {subscription && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-2xl border border-white/10 p-6 bg-white/[0.03] backdrop-blur-xl shadow-lg"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Wallet className="text-[#FF2E2E] w-5 h-5" />
              <h2 className="font-semibold text-lg">Current Plan</h2>
            </div>
            <span
              className={`px-3 py-1 text-xs rounded-full ${
                subscription.status === "Active"
                  ? "bg-green-500/10 text-green-400 border border-green-500/20"
                  : "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20"
              }`}
            >
              {subscription.status}
            </span>
          </div>

          <div className="grid sm:grid-cols-2 gap-4 text-gray-300">
            <p>
              <span className="font-semibold text-white">Plan:</span> {subscription.plan}
            </p>
            <p>
              <span className="font-semibold text-white">Purchase Price:</span> {subscription.price}
            </p>
            <p>
              <span className="font-semibold text-white">Purchase Date:</span>{" "}
              {subscription.renewalDate}
            </p>
            <p>
              <span className="font-semibold text-white">Payment Method:</span> Stripe
            </p>
          </div>

          <div className="mt-6 flex gap-3 flex-wrap">
            <Button
              onClick={handleUpgrade}
              className="bg-[#FF2E2E] hover:bg-[#FF2E2E]/90 rounded-full"
            >
              <Zap className="w-4 h-4 mr-2" /> {subscription.status === "Active" ? "Upgrade Plan" : "Purchase Plan"}
            </Button>
            <Button
              variant="outline"
              className="border-[#FF2E2E]/40 text-white hover:bg-[#FF2E2E]/10 rounded-full"
              onClick={() => window.location.href = "/dashboard/chat"}
            >
              Contact Admin
            </Button>
          </div>
        </motion.div>
      )}

      {/* Payment History */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="rounded-2xl border border-white/10 p-6 bg-white/[0.03] backdrop-blur-xl shadow-lg"
      >
        <div className="flex items-center gap-3 mb-4">
          <CreditCard className="text-[#FF2E2E] w-5 h-5" />
          <h2 className="font-semibold text-lg">Payment History</h2>
        </div>

        {transactions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-gray-300">
              <thead>
                <tr className="text-gray-500 border-b border-white/10">
                  <th className="text-left py-2">Date</th>
                  <th className="text-left py-2">Transaction ID</th>
                  <th className="text-left py-2">Amount</th>
                  <th className="text-left py-2">Plan</th>
                  <th className="text-left py-2">Status</th>
                  <th className="text-left py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((txn) => (
                  <motion.tr
                    key={txn.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    className="border-b border-white/5 hover:bg-white/[0.03] transition-colors"
                  >
                    <td className="py-3">{txn.date}</td>
                    <td className="font-mono text-xs">{txn.id.substring(0, 8)}...</td>
                    <td className="font-semibold">{txn.amount}</td>
                    <td>{txn.planType || "N/A"}</td>
                    <td>
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          txn.status === "Paid" || txn.status === "completed"
                            ? "bg-green-500/10 text-green-400 border border-green-500/20"
                            : "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20"
                        }`}
                      >
                        {txn.status}
                      </span>
                    </td>
                    <td>
                      {txn.stripeSessionId && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewReceipt(txn.stripeSessionId)}
                          className="text-[#FF2E2E] hover:text-[#FF2E2E]/80 hover:bg-[#FF2E2E]/10"
                        >
                          <Receipt className="w-3 h-3 mr-1" />
                          Receipt
                        </Button>
                      )}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <CreditCard className="w-12 h-12 mx-auto mb-4 text-gray-600" />
            <p>No payment history yet</p>
            <p className="text-sm mt-1 text-gray-600">Your transactions will appear here after your first payment.</p>
          </div>
        )}
      </motion.div>

      {/* Insights */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="rounded-2xl border border-white/10 p-6 bg-gradient-to-br from-[#1E1E1E]/50 to-[#0A0A0A]/70 backdrop-blur-xl shadow-2xl"
      >
        <div className="flex items-center gap-3 mb-3">
          <TrendingUp className="text-[#FF2E2E] w-5 h-5" />
          <h3 className="font-semibold text-lg">AI Billing Insight</h3>
        </div>
        <motion.p
          key={transactions.length}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-gray-300 leading-relaxed"
        >
          {transactions.length >= 2
            ? `💡 You've made ${transactions.length} purchases — great commitment to your goals! Consider upgrading to a higher tier plan for additional features and personalized support.`
            : transactions.length > 0
            ? `📊 You have ${transactions.length} ${transactions.length === 1 ? "purchase" : "purchases"} on record. Your plan is active and ready to use!`
            : "💡 Start your journey by selecting a plan that fits your goals. All plans are one-time purchases and include personalized meal plans and expert support."}
        </motion.p>
      </motion.div>
    </div>
  );
}
