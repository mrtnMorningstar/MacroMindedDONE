"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/auth-context";
import { 
  collection, 
  getDocs, 
  doc, 
  updateDoc, 
  getDoc,
  query, 
  where, 
  orderBy,
  onSnapshot
} from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { 
  Users, 
  FileText, 
  MessageSquare, 
  Search, 
  Upload,
  Shield,
  CreditCard,
  CheckCircle2,
  Clock,
  XCircle,
  Download
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { isAdminUser } from "@/lib/utils/admin";
import { AdminChat } from "@/components/admin/admin-chat";
import type { Payment } from "@/types";

export default function AdminPage() {
  const { user, userData, loading: authLoading } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [planText, setPlanText] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const loadData = useCallback(async () => {
    try {
      // Load users
      const usersSnapshot = await getDocs(collection(db, "users"));
      const usersData = usersSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setUsers(usersData);

      // Load payments
      const paymentsSnapshot = await getDocs(
        query(collection(db, "payments"), orderBy("createdAt", "desc"))
      );
      const paymentsData = paymentsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Payment[];
      setPayments(paymentsData);
    } catch (error) {
      console.error("Error loading data:", error);
      toast({
        title: "Error",
        description: "Failed to load data. Please try again.",
        variant: "destructive",
      });
    }
  }, [toast]);

  useEffect(() => {
    if (authLoading) return;

    const checkAdminAccess = async () => {
      if (!user) {
        router.push("/auth/login");
        return;
      }

      // Check admin access using utility function
      if (!isAdminUser(user, userData)) {
        toast({
          title: "Access Denied",
          description: "You don&apos;t have permission to access this page.",
          variant: "destructive",
        });
        router.push("/dashboard");
        return;
      }

      setIsAdmin(true);
      await loadData();
      setLoading(false);
    };

    checkAdminAccess();
  }, [user, userData, authLoading, router, toast, loadData]);

  // Load messages with real-time updates
  useEffect(() => {
    if (!isAdmin) return;

    const messagesQuery = query(
      collection(db, "messages"),
      orderBy("timestamp", "desc")
    );
    const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
      const messagesData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMessages(messagesData);
    });

    return () => unsubscribe();
  }, [isAdmin]);

  const updatePlanStatus = async (userId: string, status: string) => {
    try {
      await updateDoc(doc(db, "users", userId), {
        planStatus: status,
      });
      toast({
        title: "Success",
        description: `Plan status updated to ${status}`,
      });
      await loadData();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update status.",
        variant: "destructive",
      });
    }
  };

  const uploadPlan = async (userId: string, text: string) => {
    if (!text.trim()) {
      toast({
        title: "Error",
        description: "Please enter plan text.",
        variant: "destructive",
      });
      return;
    }

    try {
      await updateDoc(doc(db, "users", userId), {
        planText: text,
        planStatus: "delivered",
        planDeliveredAt: new Date().toISOString(),
      });

      // Get user data for email
      const userDoc = await getDoc(doc(db, "users", userId));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const userEmail = userData.email;
        const userName = userData.name || "User";

        // Send plan ready email
        if (userEmail) {
          try {
            await fetch("/api/emails/plan-ready", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ email: userEmail, name: userName }),
            });
          } catch (emailError) {
            console.error("Error sending plan ready email:", emailError);
            // Don't block plan upload if email fails
          }
        }
      }

      toast({
        title: "Success",
        description: "Meal plan uploaded successfully!",
      });
      setPlanText((prev) => ({ ...prev, [userId]: "" }));
      await loadData();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload plan.",
        variant: "destructive",
      });
    }
  };


  const getUserPayments = (userId: string) => {
    return payments.filter((p) => p.userId === userId);
  };

  const getUserMessages = (userId: string) => {
    return messages.filter((m) => m.userId === userId).sort((a, b) => {
      const aTime = a.timestamp?.toDate?.() || new Date(0);
      const bTime = b.timestamp?.toDate?.() || new Date(0);
      return aTime.getTime() - bTime.getTime();
    });
  };

  const getPlanType = (userId: string) => {
    const userPayments = getUserPayments(userId);
    if (userPayments.length === 0) return "No Plan";
    // You can enhance this to determine plan type from payment metadata
    return "Active Plan";
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#000] via-[#111] to-[#000]">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-4 border-[#FF2E2E] border-t-transparent rounded-full mx-auto mb-4"
          />
          <p className="text-gray-400">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  const filteredUsers = users.filter((u) =>
    u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen py-12 px-4 bg-gradient-to-b from-[#000] via-[#111] to-[#000]">
      <div className="container mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-lg bg-[#FF2E2E]/10">
                <Shield className="h-8 w-8 text-[#FF2E2E]" />
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-black text-white">
                  Admin <span className="text-[#FF2E2E]">Panel</span>
                </h1>
                <p className="text-gray-400 mt-1">Manage users, plans, and messages</p>
              </div>
            </div>
          </div>

          <Tabs defaultValue="users" className="space-y-6">
            <TabsList className="bg-[#111] border border-[#222]">
              <TabsTrigger value="users" className="data-[state=active]:bg-[#FF2E2E] data-[state=active]:text-white">
                <Users className="mr-2 h-4 w-4" />
                Users ({users.length})
              </TabsTrigger>
              <TabsTrigger value="messages" className="data-[state=active]:bg-[#FF2E2E] data-[state=active]:text-white">
                <MessageSquare className="mr-2 h-4 w-4" />
                Messages ({messages.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="users" className="space-y-4">
              {/* Search Bar */}
              <div className="flex gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                  <Input
                    placeholder="Search users by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-12 bg-[#111] border-[#333] text-white placeholder:text-gray-500 focus:border-[#FF2E2E] h-12"
                  />
                </div>
              </div>

              {/* Users List */}
              <div className="grid gap-4">
                <AnimatePresence>
                  {filteredUsers.map((u, index) => {
                    const userPayments = getUserPayments(u.id);
                    const userMessages = getUserMessages(u.id);
                    const planType = getPlanType(u.id);
                    const totalSpent = userPayments.reduce((sum, p) => sum + p.amount, 0);

                    return (
                      <motion.div
                        key={u.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <Card className="bg-[#111] border-[#222] hover:border-[#FF2E2E]/50 transition-colors">
                          <CardHeader>
                            <div className="flex items-start justify-between">
                              <div>
                                <CardTitle className="text-white text-xl mb-1">
                                  {u.name || "No name"}
                                </CardTitle>
                                <CardDescription className="text-gray-400">
                                  {u.email}
                                </CardDescription>
                              </div>
                              <div className="text-right">
                                <div className="text-sm text-gray-400 mb-1">Plan Type</div>
                                <div className="text-sm font-semibold text-white">{planType}</div>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            {/* Status and Payment Info */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div>
                                <p className="text-xs text-gray-400 mb-2">Plan Status</p>
                                <div className="flex gap-2 flex-wrap">
                                  <Button
                                    size="sm"
                                    variant={u.planStatus === "pending" ? "default" : "outline"}
                                    onClick={() => updatePlanStatus(u.id, "pending")}
                                    className={u.planStatus === "pending" ? "bg-yellow-500 hover:bg-yellow-600" : "border-[#333] text-gray-400"}
                                  >
                                    <Clock className="mr-1 h-3 w-3" />
                                    Pending
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant={u.planStatus === "in-progress" ? "default" : "outline"}
                                    onClick={() => updatePlanStatus(u.id, "in-progress")}
                                    className={u.planStatus === "in-progress" ? "bg-blue-500 hover:bg-blue-600" : "border-[#333] text-gray-400"}
                                  >
                                    In Progress
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant={u.planStatus === "delivered" ? "default" : "outline"}
                                    onClick={() => updatePlanStatus(u.id, "delivered")}
                                    className={u.planStatus === "delivered" ? "bg-green-500 hover:bg-green-600" : "border-[#333] text-gray-400"}
                                  >
                                    <CheckCircle2 className="mr-1 h-3 w-3" />
                                    Delivered
                                  </Button>
                                </div>
                              </div>
                              <div>
                                <p className="text-xs text-gray-400 mb-2">Payment Info</p>
                                <div className="text-sm text-white">
                                  <div className="flex items-center gap-2">
                                    <CreditCard className="h-4 w-4 text-[#FF2E2E]" />
                                    <span>${totalSpent.toFixed(2)}</span>
                                  </div>
                                  <div className="text-xs text-gray-500 mt-1">
                                    {userPayments.length} payment{userPayments.length !== 1 ? "s" : ""}
                                  </div>
                                </div>
                              </div>
                              <div>
                                <p className="text-xs text-gray-400 mb-2">Messages</p>
                                <div className="text-sm text-white">
                                  <div className="flex items-center gap-2">
                                    <MessageSquare className="h-4 w-4 text-[#FF2E2E]" />
                                    <span>{userMessages.length}</span>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Upload Plan Section */}
                            <div className="border-t border-[#222] pt-4">
                              <p className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                                <Upload className="h-4 w-4 text-[#FF2E2E]" />
                                Upload Meal Plan
                              </p>
                              <div className="space-y-2">
                                <textarea
                                  className="w-full min-h-[120px] rounded-lg border border-[#333] bg-[#000] px-4 py-3 text-sm text-white placeholder:text-gray-500 focus:border-[#FF2E2E] focus:outline-none resize-none"
                                  placeholder="Enter meal plan text here..."
                                  value={planText[u.id] || ""}
                                  onChange={(e) =>
                                    setPlanText((prev) => ({ ...prev, [u.id]: e.target.value }))
                                  }
                                />
                                <Button
                                  onClick={() => uploadPlan(u.id, planText[u.id] || "")}
                                  disabled={!planText[u.id]?.trim()}
                                  className="w-full bg-[#FF2E2E] hover:bg-[#FF2E2E]/90 text-white"
                                >
                                  <Upload className="mr-2 h-4 w-4" />
                                  Upload Plan
                                </Button>
                              </div>
                            </div>

                            {/* Chat Section */}
                            <div className="border-t border-[#222] pt-4">
                              <p className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                                <MessageSquare className="h-4 w-4 text-[#FF2E2E]" />
                                Chat ({userMessages.length})
                              </p>
                              <AdminChat 
                                userId={u.id} 
                                userName={u.name}
                                userEmail={u.email}
                              />
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>

              {filteredUsers.length === 0 && (
                <div className="text-center py-12">
                  <Users className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400">No users found</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="messages" className="space-y-4">
              <div className="grid gap-4">
                {messages.map((msg, index) => {
                  const messageUser = users.find((u) => u.id === msg.userId);
                  return (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Card className="bg-[#111] border-[#222]">
                        <CardContent className="pt-6">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <p className="font-semibold text-white">
                                {messageUser?.name || "Unknown User"}
                              </p>
                              <p className="text-sm text-gray-400">{messageUser?.email}</p>
                            </div>
                            <span className="text-xs text-gray-500">
                              {msg.timestamp?.toDate?.().toLocaleString() || "Just now"}
                            </span>
                          </div>
                          <p className="text-gray-300 mb-2">{msg.text}</p>
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-xs px-2 py-1 rounded ${
                                msg.senderId === msg.userId
                                  ? "bg-blue-500/20 text-blue-400"
                                  : "bg-[#FF2E2E]/20 text-[#FF2E2E]"
                              }`}
                            >
                              {msg.senderName}
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
              {messages.length === 0 && (
                <div className="text-center py-12">
                  <MessageSquare className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400">No messages yet</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
}
