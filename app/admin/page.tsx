"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getCurrentUser, getUserData } from "@/lib/firebase/auth";
import { collection, getDocs, doc, updateDoc, query, where, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { Users, FileText, MessageSquare, Search } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function AdminPage() {
  const [user, setUser] = useState<any>(null);
  const [userData, setUserData] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [questionnaires, setQuestionnaires] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const init = async () => {
      const currentUser = await getCurrentUser();
      if (!currentUser) {
        router.push("/auth/login");
        return;
      }

      const data = await getUserData(currentUser.uid);
      setUserData(data);
      setUser(currentUser);

      // Check if user is admin
      // Note: In production, you should verify admin status server-side
      if (data?.role !== "admin") {
        // Allow access if email matches admin email (for development)
        const adminEmails = ["admin@macrominded.com", "admin@example.com"];
        if (!adminEmails.includes(currentUser.email || "")) {
          router.push("/dashboard");
          return;
        }
      }

      await loadData();
      setLoading(false);
    };

    init();
  }, [router]);

  const loadData = async () => {
    // Load users
    const usersSnapshot = await getDocs(collection(db, "users"));
    const usersData = usersSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setUsers(usersData);

    // Load questionnaires
    const questionnairesSnapshot = await getDocs(collection(db, "questionnaires"));
    const questionnairesData = questionnairesSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setQuestionnaires(questionnairesData);

    // Load messages
    const messagesSnapshot = await getDocs(
      query(collection(db, "messages"), orderBy("timestamp", "desc"))
    );
    const messagesData = messagesSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setMessages(messagesData);
  };

  const updatePlanStatus = async (userId: string, status: string) => {
    await updateDoc(doc(db, "users", userId), {
      planStatus: status,
    });
    await loadData();
  };

  const uploadPlan = async (userId: string, planText: string) => {
    await updateDoc(doc(db, "users", userId), {
      planText,
      planStatus: "delivered",
      planDeliveredAt: new Date().toISOString(),
    });
    await loadData();
  };

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

  const filteredUsers = users.filter((u) =>
    u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">Admin Panel</h1>
            <p className="text-muted-foreground">Manage users, plans, and messages</p>
          </div>

          <Tabs defaultValue="users" className="space-y-6">
            <TabsList>
              <TabsTrigger value="users">
                <Users className="mr-2 h-4 w-4" />
                Users
              </TabsTrigger>
              <TabsTrigger value="questionnaires">
                <FileText className="mr-2 h-4 w-4" />
                Questionnaires
              </TabsTrigger>
              <TabsTrigger value="messages">
                <MessageSquare className="mr-2 h-4 w-4" />
                Messages
              </TabsTrigger>
            </TabsList>

            <TabsContent value="users" className="space-y-4">
              <div className="flex gap-4 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="grid gap-4">
                {filteredUsers.map((u) => (
                  <Card key={u.id}>
                    <CardHeader>
                      <CardTitle>{u.name || "No name"}</CardTitle>
                      <CardDescription>{u.email}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <p className="text-sm text-muted-foreground mb-2">Plan Status</p>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant={u.planStatus === "pending" ? "default" : "outline"}
                            onClick={() => updatePlanStatus(u.id, "pending")}
                          >
                            Pending
                          </Button>
                          <Button
                            size="sm"
                            variant={u.planStatus === "in-progress" ? "default" : "outline"}
                            onClick={() => updatePlanStatus(u.id, "in-progress")}
                          >
                            In Progress
                          </Button>
                          <Button
                            size="sm"
                            variant={u.planStatus === "delivered" ? "default" : "outline"}
                            onClick={() => updatePlanStatus(u.id, "delivered")}
                          >
                            Delivered
                          </Button>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground mb-2">Upload Plan</p>
                        <textarea
                          className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm"
                          placeholder="Enter meal plan text..."
                          onBlur={(e) => {
                            if (e.target.value) {
                              uploadPlan(u.id, e.target.value);
                            }
                          }}
                        />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="questionnaires">
              <div className="grid gap-4">
                {questionnaires.map((q) => (
                  <Card key={q.id}>
                    <CardHeader>
                      <CardTitle>Questionnaire - {q.userId}</CardTitle>
                      <CardDescription>
                        Completed: {q.completedAt ? new Date(q.completedAt).toLocaleString() : "N/A"}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <pre className="text-sm bg-secondary p-4 rounded overflow-auto">
                        {JSON.stringify(q, null, 2)}
                      </pre>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="messages">
              <div className="grid gap-4">
                {messages.map((m) => (
                  <Card key={m.id}>
                    <CardContent className="pt-6">
                      <p className="font-semibold mb-2">{m.senderName}</p>
                      <p className="text-muted-foreground mb-2">{m.text}</p>
                      <p className="text-xs text-muted-foreground">
                        {m.timestamp?.toDate?.().toLocaleString() || "Just now"}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
}

