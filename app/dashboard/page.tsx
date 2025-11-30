"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/auth-context";
import { doc, onSnapshot, collection, query, where, orderBy, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { ChatBox } from "@/components/dashboard/chat-box";
import { 
  FileText, 
  TrendingUp, 
  MessageSquare, 
  CreditCard, 
  Download,
  ExternalLink,
  ArrowUpRight,
  Sparkles,
  CheckCircle2,
  Clock,
  Zap
} from "lucide-react";
import Link from "next/link";
import type { Payment } from "@/types";

export default function DashboardPage() {
  const { user, userData, loading: authLoading } = useAuth();
  const [planData, setPlanData] = useState<any>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPlanDetails, setShowPlanDetails] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      router.push("/auth/login");
      return;
    }

    // Listen for user data and plan updates
    const unsubscribeUser = onSnapshot(
      doc(db, "users", user.uid),
      (doc) => {
        if (doc.exists()) {
          const data = doc.data();
          if (data.planUrl || data.planText) {
            setPlanData({
              url: data.planUrl,
              text: data.planText,
              status: data.planStatus || "pending",
              deliveredAt: data.planDeliveredAt,
            });
          }
        }
      },
      (error: any) => {
        console.error("Error in user snapshot:", error);
        // Don't throw - just log the error
      }
    );

    // Fetch payment history
    const fetchPayments = async () => {
      try {
        const q = query(
          collection(db, "payments"),
          where("userId", "==", user.uid),
          orderBy("timestamp", "desc")
        );
        const snapshot = await getDocs(q);
        const paymentData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Payment[];
        setPayments(paymentData);
      } catch (error: any) {
        console.error("Error fetching payments:", error);
        // If index error, try without orderBy as fallback
        if (error.code === "failed-precondition") {
          try {
            const q = query(
              collection(db, "payments"),
              where("userId", "==", user.uid)
            );
            const snapshot = await getDocs(q);
            const paymentData = snapshot.docs
              .map((doc) => ({
                id: doc.id,
                ...doc.data(),
              }))
              .sort((a: any, b: any) => {
                const aTime = a.timestamp?.toMillis?.() || a.timestamp || (typeof a.timestamp === 'string' ? new Date(a.timestamp).getTime() : 0);
                const bTime = b.timestamp?.toMillis?.() || b.timestamp || (typeof b.timestamp === 'string' ? new Date(b.timestamp).getTime() : 0);
                return bTime - aTime;
              }) as Payment[];
            setPayments(paymentData);
          } catch (fallbackError) {
            console.error("Error fetching payments (fallback):", fallbackError);
            // Set empty array to prevent UI errors
            setPayments([]);
          }
        } else {
          // For other errors, set empty array
          setPayments([]);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();

    return () => {
      unsubscribeUser();
    };
  }, [user, authLoading, router]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#000] via-[#111] to-[#000]">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-4 border-[#FF2E2E] border-t-transparent rounded-full mx-auto mb-4"
          />
          <p className="text-gray-400">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  const goal = userData?.questionnaireData?.goal || "Not set";
  const goalIcon = goal === "Lose Weight" ? "🔥" : goal === "Gain Weight" ? "💪" : "⚖️";

  return (
    <div className="min-h-screen py-12 px-4 bg-gradient-to-b from-[#000] via-[#111] to-[#000]">
      <div className="container mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Welcome Section */}
          <div className="mb-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <h1 className="text-4xl md:text-5xl font-black mb-2 text-white">
                Welcome back,{" "}
                <span className="text-[#FF2E2E]">{userData?.name || "User"}</span>!
              </h1>
              <p className="text-gray-400 text-lg">Here&apos;s your nutrition dashboard</p>
            </motion.div>
          </div>

          {/* Goal Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8"
          >
            <Card className="bg-gradient-to-r from-[#FF2E2E]/20 via-[#FF2E2E]/10 to-transparent border-[#FF2E2E]/30">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400 mb-2 flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" />
                      Your Goal
                    </p>
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{goalIcon}</span>
                      <p className="text-3xl font-black text-white">{goal}</p>
                    </div>
                  </div>
                  <motion.div
                    animate={{
                      scale: [1, 1.1, 1],
                      rotate: [0, 5, -5, 0],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  >
                    <Sparkles className="h-12 w-12 text-[#FF2E2E]" />
                  </motion.div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Meal Plan Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Card className="bg-[#111] border-[#222]">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-[#FF2E2E]/10">
                          <FileText className="h-6 w-6 text-[#FF2E2E]" />
                        </div>
                        <div>
                          <CardTitle className="text-white text-2xl">Your Meal Plan</CardTitle>
                          <CardDescription className="text-gray-400">
                            {planData ? "Your personalized meal plan" : "Your plan is being created"}
                          </CardDescription>
                        </div>
                      </div>
                      {planData && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowPlanDetails(!showPlanDetails)}
                          className="text-[#FF2E2E] hover:text-[#FF2E2E] hover:bg-[#FF2E2E]/10"
                        >
                          {showPlanDetails ? "Hide" : "View Details"}
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    {planData ? (
                      <div className="space-y-4">
                        <div className="flex items-center gap-4 p-4 bg-[#222] rounded-lg">
                          <div className="flex-1">
                            <p className="text-sm text-gray-400 mb-1">Status</p>
                            <div className="flex items-center gap-2">
                              {planData.status === "delivered" ? (
                                <CheckCircle2 className="h-5 w-5 text-green-500" />
                              ) : (
                                <Clock className="h-5 w-5 text-yellow-500" />
                              )}
                              <p className="font-semibold text-white capitalize">
                                {planData.status === "delivered" ? "Ready" : planData.status}
                              </p>
                            </div>
                          </div>
                          {planData.deliveredAt && (
                            <div className="text-right">
                              <p className="text-sm text-gray-400 mb-1">Delivered</p>
                              <p className="text-sm text-white">
                                {new Date(planData.deliveredAt).toLocaleDateString()}
                              </p>
                            </div>
                          )}
                        </div>

                        <AnimatePresence>
                          {showPlanDetails && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.3 }}
                              className="overflow-hidden"
                            >
                              {planData.url && (
                                <a
                                  href={planData.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="block mb-4"
                                >
                                  <Button className="w-full bg-[#FF2E2E] hover:bg-[#FF2E2E]/90 text-white">
                                    <Download className="mr-2 h-4 w-4" />
                                    Download Plan PDF
                                    <ExternalLink className="ml-2 h-4 w-4" />
                                  </Button>
                                </a>
                              )}
                              {planData.text && (
                                <div className="p-6 bg-[#222] rounded-lg border border-[#333]">
                                  <p className="text-sm text-white whitespace-pre-wrap leading-relaxed">
                                    {planData.text}
                                  </p>
                                </div>
                              )}
                            </motion.div>
                          )}
                        </AnimatePresence>

                        {!showPlanDetails && planData.url && (
                          <Button
                            variant="outline"
                            className="w-full border-[#333] text-white hover:bg-[#222] hover:border-[#FF2E2E]"
                            onClick={() => setShowPlanDetails(true)}
                          >
                            View Full Plan
                          </Button>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <motion.div
                          animate={{
                            scale: [1, 1.1, 1],
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut",
                          }}
                          className="inline-block mb-4"
                        >
                          <Clock className="h-16 w-16 text-[#FF2E2E] mx-auto" />
                        </motion.div>
                        <p className="text-gray-400 mb-2 text-lg">
                          Your meal plan is being created by our nutrition expert.
                        </p>
                        <p className="text-sm text-gray-500">
                          You&apos;ll be notified when it&apos;s ready!
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>

              {/* Payment History */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Card className="bg-[#111] border-[#222]">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-[#FF2E2E]/10">
                        <CreditCard className="h-6 w-6 text-[#FF2E2E]" />
                      </div>
                      <div>
                        <CardTitle className="text-white text-2xl">Payment History</CardTitle>
                        <CardDescription className="text-gray-400">
                          Your transaction history
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {payments.length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b border-[#333]">
                              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-400">
                                Date
                              </th>
                              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-400">
                                Amount
                              </th>
                              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-400">
                                Status
                              </th>
                              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-400">
                                Plan
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {payments.map((payment, index) => (
                              <motion.tr
                                key={payment.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="border-b border-[#222] hover:bg-[#222] transition-colors"
                              >
                                <td className="py-4 px-4 text-white">
                                  {new Date(payment.createdAt).toLocaleDateString()}
                                </td>
                                <td className="py-4 px-4 text-white font-semibold">
                                  ${payment.amount.toFixed(2)} {payment.currency?.toUpperCase()}
                                </td>
                                <td className="py-4 px-4">
                                  <span
                                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                      payment.status === "completed"
                                        ? "bg-green-500/20 text-green-400"
                                        : "bg-yellow-500/20 text-yellow-400"
                                    }`}
                                  >
                                    {payment.status}
                                  </span>
                                </td>
                                <td className="py-4 px-4 text-gray-400">
                                  {payment.planId || "N/A"}
                                </td>
                              </motion.tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <CreditCard className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                        <p className="text-gray-400">No payment history yet</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Right Column - Sidebar */}
            <div className="space-y-6">
              {/* Chat Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <Card className="bg-[#111] border-[#222]">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-[#FF2E2E]/10">
                        <MessageSquare className="h-6 w-6 text-[#FF2E2E]" />
                      </div>
                      <div>
                        <CardTitle className="text-white">Support Chat</CardTitle>
                        <CardDescription className="text-gray-400">
                          Chat with our nutrition expert
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ChatBox userId={user?.uid || ""} />
                  </CardContent>
                </Card>
              </motion.div>

              {/* Upgrade Plan CTA */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <Card className="bg-gradient-to-br from-[#FF2E2E]/20 to-[#FF2E2E]/10 border-[#FF2E2E]/30">
                  <CardHeader>
                    <div className="flex items-center gap-3 mb-2">
                      <motion.div
                        animate={{
                          rotate: [0, 10, -10, 0],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                      >
                        <Zap className="h-6 w-6 text-[#FF2E2E]" />
                      </motion.div>
                      <CardTitle className="text-white">Upgrade Plan</CardTitle>
                    </div>
                    <CardDescription className="text-gray-300">
                      Get more features and premium support
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Link href="/plans">
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Button className="w-full bg-[#FF2E2E] hover:bg-[#FF2E2E]/90 text-white text-lg py-6 font-bold shadow-lg shadow-[#FF2E2E]/50">
                          View Plans
                          <ArrowUpRight className="ml-2 h-5 w-5" />
                        </Button>
                      </motion.div>
                    </Link>
                    <p className="text-xs text-gray-400 mt-3 text-center">
                      Unlock unlimited revisions and priority support
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
