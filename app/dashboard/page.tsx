"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getCurrentUser, getUserData } from "@/lib/firebase/auth";
import { doc, getDoc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { ChatBox } from "@/components/dashboard/chat-box";
import { FileText, TrendingUp, MessageSquare, CreditCard } from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [userData, setUserData] = useState<any>(null);
  const [planData, setPlanData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const init = async () => {
      const currentUser = await getCurrentUser();
      if (!currentUser) {
        router.push("/auth/login");
        return;
      }

      setUser(currentUser);
      const data = await getUserData(currentUser.uid);
      setUserData(data);

      // Listen for plan updates
      const unsubscribe = onSnapshot(
        doc(db, "users", currentUser.uid),
        (doc) => {
          if (doc.exists()) {
            const data = doc.data();
            setUserData(data);
            if (data.planUrl || data.planText) {
              setPlanData({
                url: data.planUrl,
                text: data.planText,
                status: data.planStatus || "pending",
              });
            }
          }
        }
      );

      setLoading(false);
      return () => unsubscribe();
    };

    init();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  const goal = userData?.questionnaireData?.goal || "Not set";

  return (
    <div className="min-h-screen py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">Welcome back, {userData?.name || "User"}!</h1>
            <p className="text-muted-foreground">Here's your nutrition dashboard</p>
          </div>

          {/* Goal Badge */}
          <div className="mb-8">
            <Card className="bg-gradient-to-r from-primary/20 to-primary/10">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Your Goal</p>
                    <p className="text-2xl font-bold">{goal}</p>
                  </div>
                  <TrendingUp className="h-12 w-12 text-primary" />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Plan Display */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Your Meal Plan
                  </CardTitle>
                  <CardDescription>
                    {planData ? "Your personalized meal plan" : "Your plan is being created"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {planData ? (
                    <div className="space-y-4">
                      <div className="p-4 bg-secondary rounded-lg">
                        <p className="text-sm text-muted-foreground mb-2">Status</p>
                        <p className="font-semibold capitalize">{planData.status}</p>
                      </div>
                      {planData.url && (
                        <a
                          href={planData.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block"
                        >
                          <Button className="w-full">View Plan PDF</Button>
                        </a>
                      )}
                      {planData.text && (
                        <div className="p-4 bg-secondary rounded-lg">
                          <p className="text-sm whitespace-pre-wrap">{planData.text}</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground mb-4">
                        Your meal plan is being created by our nutrition expert.
                      </p>
                      <p className="text-sm text-muted-foreground">
                        You'll be notified when it's ready!
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Payment History */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Payment History
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Payment history will appear here
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Chat & Upgrade */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    Support Chat
                  </CardTitle>
                  <CardDescription>
                    Chat with our nutrition expert
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ChatBox userId={user?.uid} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Upgrade Plan</CardTitle>
                  <CardDescription>
                    Get more features and support
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Link href="/plans">
                    <Button className="w-full">View Plans</Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

