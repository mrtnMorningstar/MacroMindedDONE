"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Sparkles, Bot, User, WifiOff, MessageCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { collection, addDoc, orderBy, query, where, onSnapshot, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { useAuth } from "@/context/auth-context";
import { useRealtimeCollection } from "@/hooks/use-realtime-collection";
import { useMemo } from "react";

interface Message {
  id: string;
  sender: "user" | "admin" | "assistant";
  text: string;
  timestamp: any;
  userId?: string;
}

export default function ChatPage() {
  const { user } = useAuth();
  const [newMessage, setNewMessage] = useState("");
  const [aiMode, setAiMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Real-time Firestore listener for messages
  const messagesQuery = useMemo(() => {
    if (!user?.uid) return null;
    return query(
      collection(db, "messages"),
      where("userId", "==", user.uid),
      orderBy("timestamp", "asc")
    );
  }, [user?.uid]);

  const { data: messagesData, error: messagesError } = useRealtimeCollection<Message>(
    messagesQuery,
    { enabled: !!user?.uid }
  );

  const messages = messagesError?.code === "failed-precondition" ? [] : (messagesData || []);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Check online status
  useEffect(() => {
    setIsOnline(navigator.onLine);
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Format timestamp
  const formatTime = (timestamp: any) => {
    if (!timestamp) return "";
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      const now = new Date();
      const isToday = date.toDateString() === now.toDateString();
      
      if (isToday) {
        return date.toLocaleTimeString("en-US", { 
          hour: "numeric", 
          minute: "2-digit",
          hour12: true 
        });
      }
      
      return date.toLocaleDateString("en-US", { 
        month: "short", 
        day: "numeric",
        hour: "numeric", 
        minute: "2-digit"
      });
    } catch {
      return "";
    }
  };

  // Send message
  const sendMessage = async () => {
    if (!newMessage.trim() || !user || loading || aiLoading) return;

    const text = newMessage.trim();
    setNewMessage("");
    setLoading(true);

    try {
      // Send user message to Firestore
      await addDoc(collection(db, "messages"), {
        userId: user.uid,
        sender: "user",
        text,
        timestamp: serverTimestamp(),
      });

      // If AI mode is on, get AI response
      if (aiMode) {
        setAiLoading(true);
        try {
          const res = await fetch("/api/ai/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId: user.uid, prompt: text }),
          });

          if (!res.ok) {
            throw new Error("AI API error");
          }

          const data = await res.json();
          const aiResponse = data.text || "I'm having trouble processing that right now. Please try again.";

          // Save AI assistant response
          await addDoc(collection(db, "messages"), {
            userId: user.uid,
            sender: "assistant",
            text: aiResponse,
            timestamp: serverTimestamp(),
          });
        } catch (aiError) {
          console.error("Error getting AI response:", aiError);
          // Fallback: show simple AI response
          await addDoc(collection(db, "messages"), {
            userId: user.uid,
            sender: "assistant",
            text: text.toLowerCase().includes("meal")
              ? "🤖 Here's a quick tip: Try to balance your meals with 40% carbs, 30% protein, 30% fats!"
              : "🤖 Got it! I'm here to keep you on track while your coach reviews your message.",
            timestamp: serverTimestamp(),
          });
        } finally {
          setAiLoading(false);
        }
      }
    } catch (err) {
      console.error("Error sending message:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
          <span className="text-[#FF2E2E]">Chat</span> with Your Coach
        </h1>
        <p className="text-gray-400 mt-2">
          Connect with your nutrition expert or get instant AI assistance.
        </p>
      </motion.div>

      {/* Chat Container */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-col h-[calc(100vh-280px)] min-h-[600px] bg-[#0b0b0b] rounded-2xl border border-white/10 overflow-hidden backdrop-blur-xl shadow-xl"
      >
        {/* Chat Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10 bg-[#111]/80 backdrop-blur-md">
          <div className="flex items-center gap-3">
            {aiMode ? (
              <Bot className="text-[#FF2E2E] w-5 h-5" />
            ) : (
              <User className="text-[#FF2E2E] w-5 h-5" />
            )}
            <div>
              <h2 className="font-semibold text-white text-lg">
                {aiMode ? "AI Coach" : "Your Coach"}
              </h2>
              <p className="text-xs text-gray-400">
                {aiMode ? "Chatting with AI Assistant" : "Connected to your nutrition expert"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              size="sm"
              variant="outline"
              className={`text-xs border-[#FF2E2E]/40 transition-all ${
                aiMode
                  ? "bg-[#FF2E2E]/20 text-[#FF2E2E] border-[#FF2E2E]/40"
                  : "text-white hover:bg-[#FF2E2E]/20 hover:border-[#FF2E2E]/60"
              }`}
              onClick={() => setAiMode(!aiMode)}
            >
              <Sparkles className="w-3 h-3 mr-1" /> {aiMode ? "AI On" : "AI Off"}
            </Button>

            {!isOnline && (
              <div className="flex items-center gap-1 text-gray-500 text-xs">
                <WifiOff className="w-3 h-3" /> Offline
              </div>
            )}
          </div>
        </div>

        {/* Messages Area */}
        <div
          ref={messagesContainerRef}
          className="flex-1 overflow-y-auto px-4 py-6 space-y-4 scrollbar-thin scrollbar-thumb-[#333] scrollbar-track-transparent"
        >
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500 text-sm">
              <MessageCircle className="w-12 h-12 mb-4 text-gray-600" />
              <p>No messages yet</p>
              <p className="text-xs mt-1 text-gray-600">Start a conversation below.</p>
            </div>
          ) : (
            <AnimatePresence>
              {messages.map((msg) => {
                const isUser = msg.sender === "user";
                const isAI = msg.sender === "assistant";
                const isAdmin = msg.sender === "admin";

                return (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className={`flex ${isUser ? "justify-end" : "justify-start"}`}
                  >
                    <div className={`max-w-[70%] flex flex-col ${isUser ? "items-end" : "items-start"}`}>
                      <div
                        className={`rounded-2xl px-4 py-2.5 ${
                          isUser
                            ? "bg-[#FF2E2E]/90 text-white rounded-br-none"
                            : isAI
                            ? "bg-gradient-to-br from-[#FF2E2E]/20 to-[#FF2E2E]/5 text-[#FFAAAA] border border-[#FF2E2E]/30"
                            : "bg-white/10 text-gray-100 rounded-bl-none"
                        }`}
                      >
                        {isAI && (
                          <div className="flex items-center gap-1.5 mb-1.5">
                            <Sparkles className="w-3 h-3 text-[#FF2E2E]" />
                            <span className="text-xs font-semibold text-[#FF2E2E]">AI Assistant</span>
                          </div>
                        )}
                        <p className="text-sm leading-relaxed break-words">{msg.text}</p>
                        <span className="text-[10px] opacity-70 mt-1.5 block">
                          {formatTime(msg.timestamp)}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          )}

          {/* AI Typing Indicator */}
          {aiLoading && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex justify-start"
            >
              <div className="bg-gradient-to-br from-[#FF2E2E]/20 to-[#FF2E2E]/5 rounded-2xl px-4 py-3 border border-[#FF2E2E]/30">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-3 h-3 text-[#FF2E2E]" />
                  <div className="flex gap-1">
                    <motion.div
                      className="w-2 h-2 bg-[#FF2E2E] rounded-full"
                      animate={{ y: [0, -4, 0] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                    />
                    <motion.div
                      className="w-2 h-2 bg-[#FF2E2E] rounded-full"
                      animate={{ y: [0, -4, 0] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                    />
                    <motion.div
                      className="w-2 h-2 bg-[#FF2E2E] rounded-full"
                      animate={{ y: [0, -4, 0] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-white/10 bg-[#111]/80 flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
            placeholder={aiMode ? "Ask your AI assistant anything..." : "Type a message to your coach..."}
            disabled={loading || aiLoading}
            className="bg-[#1a1a1a] text-white border-[#222] focus-visible:ring-[#FF2E2E] placeholder:text-gray-500"
          />
          <Button
            disabled={!newMessage.trim() || loading || aiLoading}
            onClick={sendMessage}
            className="bg-[#FF2E2E] hover:bg-[#FF2E2E]/90 text-white px-4 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading || aiLoading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
