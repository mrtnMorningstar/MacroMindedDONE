"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Sparkles, X } from "lucide-react";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase/config";

interface Message {
  id: string;
  type: "user" | "assistant";
  text: string;
  timestamp: Date;
}

interface Suggestion {
  text: string;
  query: string;
}

const suggestions: Suggestion[] = [
  { text: "Show users without plans", query: "users without plans" },
  { text: "Who spent the most this week?", query: "top spender this week" },
  { text: "Summarize revenue changes", query: "revenue summary" },
  { text: "List pending plans", query: "pending plans" },
  { text: "Show inactive users", query: "inactive users" },
];

export function AIConsole() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [users, setUsers] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Real-time data listeners
  useEffect(() => {
    const usersUnsub = onSnapshot(collection(db, "users"), (snapshot) => {
      setUsers(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    const paymentsUnsub = onSnapshot(collection(db, "payments"), (snapshot) => {
      setPayments(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return () => {
      usersUnsub();
      paymentsUnsub();
    };
  }, []);

  // Auto-scroll only within the chat container, not the page
  useEffect(() => {
    if (messagesEndRef.current && messages.length > 0) {
      // Only scroll if user is near the bottom (within 100px)
      const container = messagesEndRef.current.parentElement;
      if (container) {
        const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 100;
        if (isNearBottom) {
          messagesEndRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
        }
      }
    }
  }, [messages]);

  const processQuery = async (query: string): Promise<string> => {
    const lowerQuery = query.toLowerCase();
    const clients = users.filter((u) => (u.role ?? "").toLowerCase() !== "admin");

    // Users without plans
    if (lowerQuery.includes("without plans") || lowerQuery.includes("no plan")) {
      const withoutPlans = clients.filter((u) => !u.planType || u.planType === "");
      return `Found ${withoutPlans.length} user${withoutPlans > 1 ? "s" : ""} without plans.`;
    }

    // Top spender
    if (lowerQuery.includes("top spender") || lowerQuery.includes("most spent")) {
      const now = new Date();
      const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const recentPayments = payments.filter((p) => {
        const date = p.createdAt?.toDate?.() || new Date(p.createdAt || now);
        return date >= last7Days;
      });

      const userTotals: { [key: string]: { amount: number; name: string } } = {};
      recentPayments.forEach((p) => {
        const userId = p.userId || "";
        const user = users.find((u) => u.id === userId);
        if (!userTotals[userId]) {
          userTotals[userId] = { amount: 0, name: user?.name || user?.email || "Unknown" };
        }
        const amount = typeof p.amount === "number" ? p.amount : parseFloat(p.amount || "0") || 0;
        userTotals[userId].amount += amount;
      });

      const topUser = Object.values(userTotals).sort((a, b) => b.amount - a.amount)[0];
      return topUser
        ? `Top spender this week: ${topUser.name} with $${topUser.amount.toLocaleString()}`
        : "No payments found this week.";
    }

    // Revenue summary
    if (lowerQuery.includes("revenue") || lowerQuery.includes("summary")) {
      const now = new Date();
      const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const previous7Days = new Date(last7Days.getTime() - 7 * 24 * 60 * 60 * 1000);

      const recentRevenue = payments
        .filter((p) => {
          const date = p.createdAt?.toDate?.() || new Date(p.createdAt || now);
          return date >= last7Days;
        })
        .reduce((sum, p) => sum + (typeof p.amount === "number" ? p.amount : parseFloat(p.amount || "0") || 0), 0);

      const previousRevenue = payments
        .filter((p) => {
          const date = p.createdAt?.toDate?.() || new Date(p.createdAt || now);
          return date >= previous7Days && date < last7Days;
        })
        .reduce((sum, p) => sum + (typeof p.amount === "number" ? p.amount : parseFloat(p.amount || "0") || 0), 0);

      const change = previousRevenue > 0 ? ((recentRevenue - previousRevenue) / previousRevenue) * 100 : 0;
      return `Revenue this week: $${recentRevenue.toLocaleString()}. ${change > 0 ? "+" : ""}${change.toFixed(1)}% vs last week.`;
    }

    // Pending plans
    if (lowerQuery.includes("pending")) {
      const pending = clients.filter((u) => (u.planStatus || "").toLowerCase() === "pending");
      return `Found ${pending.length} pending plan${pending > 1 ? "s" : ""}.`;
    }

    // Inactive users
    if (lowerQuery.includes("inactive")) {
      const now = new Date();
      const inactive = clients.filter((u) => {
        const lastActive = u.lastActive?.toDate?.() || new Date(u.lastActive || u.createdAt || now);
        const daysSince = (now.getTime() - lastActive.getTime()) / (1000 * 60 * 60 * 24);
        return daysSince > 30;
      });
      return `Found ${inactive.length} inactive user${inactive > 1 ? "s" : ""} (no activity >30 days).`;
    }

    return "I can help you with: users without plans, top spenders, revenue summaries, pending plans, and inactive users. Try asking one of these!";
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      text: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    // Simulate AI processing
    setTimeout(async () => {
      const response = await processQuery(input.trim());
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "assistant",
        text: response,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
      setLoading(false);
    }, 500);
  };

  const handleSuggestion = (suggestion: Suggestion) => {
    setInput(suggestion.query);
    inputRef.current?.focus();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[#151515] border border-[#222] rounded-2xl p-6 shadow-lg backdrop-blur-sm flex flex-col h-[500px]"
    >
      <div className="flex items-center gap-2 mb-4">
        <div className="p-2 rounded-lg bg-[#FF2E2E]/10 border border-[#FF2E2E]/20">
          <Sparkles className="h-5 w-5 text-[#FF2E2E]" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-white">AI Assistant</h2>
          <p className="text-xs text-gray-400">Ask questions about your data</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-3 mb-4 pr-2">
        {messages.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-400 text-sm mb-4">Start a conversation</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestion(suggestion)}
                  className="px-3 py-1.5 rounded-lg bg-[#222] hover:bg-[#FF2E2E]/20 border border-[#222] hover:border-[#FF2E2E]/50 text-xs text-gray-300 hover:text-white transition-colors"
                >
                  {suggestion.text}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <AnimatePresence>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                    message.type === "user"
                      ? "bg-[#FF2E2E] text-white"
                      : "bg-[#222] text-gray-300"
                  }`}
                >
                  <p className="text-sm">{message.text}</p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-[#222] rounded-2xl px-4 py-2">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-[#FF2E2E] rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <div className="w-2 h-2 bg-[#FF2E2E] rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <div className="w-2 h-2 bg-[#FF2E2E] rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          placeholder="Ask me anything about your data..."
          className="w-full pl-4 pr-12 py-3 bg-[#0a0a0a] border border-[#222] rounded-2xl text-white placeholder:text-gray-500 focus:outline-none focus:border-[#FF2E2E] focus:ring-2 focus:ring-[#FF2E2E]/20 transition-all shadow-lg"
        />
        <button
          onClick={handleSend}
          disabled={loading || !input.trim()}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-[#FF2E2E] hover:bg-[#FF2E2E]/90 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Send className="h-4 w-4" />
        </button>
      </div>
    </motion.div>
  );
}

