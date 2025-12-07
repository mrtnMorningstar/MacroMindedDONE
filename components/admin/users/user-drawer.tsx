"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, User, Mail, Package, Clock, MessageSquare } from "lucide-react";
import {
  collection,
  query,
  orderBy,
  addDoc,
  serverTimestamp,
  where,
  onSnapshot,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { Badge } from "@/components/ui/badge";

interface User {
  id: string;
  name?: string;
  email?: string;
  planType?: string;
  planStatus?: string;
  createdAt?: any;
}

interface Message {
  id: string;
  userId: string;
  sender: "admin" | "user";
  text: string;
  timestamp: Timestamp | Date | string;
}

interface UserDrawerProps {
  open: boolean;
  onClose: () => void;
  user: User | null;
}

export function UserDrawer({ open, onClose, user }: UserDrawerProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "chat">("overview");
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Ensure component is mounted before rendering portal
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Load messages when drawer opens
  useEffect(() => {
    if (!open || !user) return;

    const q = query(
      collection(db, "messages"),
      where("userId", "==", user.id),
      orderBy("timestamp", "asc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Message),
      }));
      setMessages(msgs);
    });

    return () => unsubscribe();
  }, [open, user]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!newMessage.trim() || loading || !user) return;

    setLoading(true);
    try {
      await addDoc(collection(db, "messages"), {
        userId: user.id,
        sender: "admin" as const,
        text: newMessage.trim(),
        timestamp: serverTimestamp(),
      });
      setNewMessage("");
    } catch (error: any) {
      console.error("Error sending message:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (timestamp: any) => {
    if (!timestamp) return "";
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
    } catch {
      return "";
    }
  };

  const getStatusBadge = (status?: string) => {
    const normalized = (status || "pending").toLowerCase();
    if (normalized === "delivered") {
      return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Delivered</Badge>;
    }
    if (normalized === "in progress" || normalized === "in-progress") {
      return <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">In Progress</Badge>;
    }
    return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">Pending</Badge>;
  };

  if (!user || !mounted) return null;

  const drawerContent = (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-[9998]"
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-[#151515] border-l border-[#222] z-[9999] shadow-2xl flex flex-col"
            style={{ height: "100vh", maxHeight: "100vh" }}
          >
            {/* Header */}
            <div className="p-6 border-b border-[#222] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#FF2E2E] to-[#7b0000] flex items-center justify-center text-white font-semibold">
                  {(user.name || user.email || "U")[0].toUpperCase()}
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white">{user.name || "User"}</h2>
                  <p className="text-xs text-gray-400">{user.email}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-[#222] text-gray-400 hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-[#222]">
              <button
                onClick={() => setActiveTab("overview")}
                className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${
                  activeTab === "overview"
                    ? "text-[#FF2E2E] border-b-2 border-[#FF2E2E]"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab("chat")}
                className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${
                  activeTab === "chat"
                    ? "text-[#FF2E2E] border-b-2 border-[#FF2E2E]"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                Chat
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-hidden flex flex-col min-h-0">
              {activeTab === "overview" ? (
                <div className="p-6 space-y-6 overflow-y-auto">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Mail className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-400">Email</p>
                        <p className="text-white">{user.email || "N/A"}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Package className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-400">Plan Type</p>
                        <p className="text-white">{user.planType || "No Plan"}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Clock className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-400">Status</p>
                        {getStatusBadge(user.planStatus)}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col flex-1 min-h-0">
                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#0a0a0a] min-h-0">
                    {messages.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full text-center">
                        <MessageSquare className="h-12 w-12 text-gray-600 mb-4" />
                        <p className="text-sm text-gray-400">No messages yet</p>
                        <p className="text-xs text-gray-500">Start a conversation</p>
                      </div>
                    ) : (
                      messages.map((message) => {
                        const isAdmin = message.sender === "admin";
                        return (
                          <motion.div
                            key={message.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`flex ${isAdmin ? "justify-end" : "justify-start"}`}
                          >
                            <div
                              className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                                isAdmin
                                  ? "bg-[#FF2E2E] text-white"
                                  : "bg-[#222] text-gray-300"
                              }`}
                            >
                              <p className="text-sm leading-relaxed">{message.text}</p>
                              <p className="text-xs opacity-70 mt-1">{formatTime(message.timestamp)}</p>
                            </div>
                          </motion.div>
                        );
                      })
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Input */}
                  <div className="p-4 border-t border-[#222] bg-[#151515]">
                    <div className="flex gap-2">
                      <input
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            sendMessage();
                          }
                        }}
                        placeholder="Type a message..."
                        disabled={loading}
                        className="flex-1 px-4 py-2 bg-[#0a0a0a] border border-[#222] rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:border-[#FF2E2E] focus:ring-1 focus:ring-[#FF2E2E]"
                      />
                      <button
                        onClick={sendMessage}
                        disabled={loading || !newMessage.trim()}
                        className="p-2 rounded-lg bg-[#FF2E2E] hover:bg-[#FF2E2E]/90 text-white transition-colors disabled:opacity-50"
                      >
                        <Send className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  // Render using portal to ensure it's at the root level
  if (typeof window === "undefined") return null;
  return createPortal(drawerContent, document.body);
}

