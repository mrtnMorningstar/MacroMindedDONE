"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { 
  collection, 
  query, 
  orderBy, 
  addDoc, 
  serverTimestamp, 
  where
} from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { useRealtimeDoc } from "@/hooks/use-realtime-doc";
import { useRealtimeCollection } from "@/hooks/use-realtime-collection";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, MessageCircle, Minus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/auth-context";

interface Message {
  id: string;
  userId: string;
  sender: "admin" | "user";
  text: string;
  timestamp: any;
}

interface ChatInterfaceProps {
  userId: string;
  onMinimize?: () => void;
}

export function ChatInterface({ userId, onMinimize }: ChatInterfaceProps) {
  const { user } = useAuth();
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [scrollLocked, setScrollLocked] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const lastTouchYRef = useRef<number | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  // Check if user is online
  const { data: userDoc } = useRealtimeDoc(
    userId ? `users/${userId}` : null,
    { enabled: !!userId }
  );
  const isUserOnline = userDoc?.isOnline || false;

  // Real-time messages collection query
  const messagesQuery = useMemo(() => {
    if (!userId) return null;
    return query(
      collection(db, "messages"),
      where("userId", "==", userId),
      orderBy("timestamp", "asc")
    );
  }, [userId]);

  const { data: messagesData, error: messagesError } = useRealtimeCollection<Message>(
    messagesQuery,
    { enabled: !!userId }
  );

  const messages = messagesError?.code === "failed-precondition" ? [] : (messagesData || []);

  // Listen for admin typing indicator
  const { data: typingDoc } = useRealtimeDoc(
    userId ? `typing/${userId}` : null,
    { enabled: !!userId }
  );
  const adminTyping = typingDoc?.adminTyping || false;

  // Check for new admin messages when user is offline
  useEffect(() => {
    if (!isUserOnline && messages.length > 0) {
      const latestMessage = messages[messages.length - 1];
      if (latestMessage.sender === "admin") {
        // Stub: Email notification would be sent here via Cloud Function
        console.log("User is offline - admin message received. Email notification stub triggered.");
      }
    }
  }, [messages, isUserOnline]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, adminTyping]);

  // Auto-lock focus effect - freeze background scroll when interacting with chat
  useEffect(() => {
    if (scrollLocked) {
      document.body.style.overflow = "hidden"; // Lock background scroll
    } else {
      document.body.style.overflow = ""; // Restore normal scroll
    }

    // Cleanup on unmount
    return () => {
      document.body.style.overflow = "";
    };
  }, [scrollLocked]);

  // Non-passive event listeners for scroll isolation
  useEffect(() => {
    const el = messagesContainerRef.current;
    if (!el) return;

    // Helper: detect if chat is scrolled to top/bottom
    const atTop = () => el.scrollTop <= 0;
    const atBottom = () =>
      Math.ceil(el.scrollTop + el.clientHeight) >= el.scrollHeight;

    // Desktop wheel scroll isolation
    const onWheel = (e: WheelEvent) => {
      const delta = e.deltaY;
      if ((delta < 0 && atTop()) || (delta > 0 && atBottom())) {
        e.preventDefault(); // prevent page scroll
      }
      e.stopPropagation();
    };

    // Touch scroll isolation (mobile)
    const onTouchStart = (e: TouchEvent) => {
      lastTouchYRef.current = e.touches[0].clientY;
      e.stopPropagation();
    };

    const onTouchMove = (e: TouchEvent) => {
      if (lastTouchYRef.current == null) return;
      const currY = e.touches[0].clientY;
      const delta = lastTouchYRef.current - currY;
      lastTouchYRef.current = currY;

      if ((delta < 0 && atTop()) || (delta > 0 && atBottom())) {
        e.preventDefault(); // stop scroll chaining
      }
      e.stopPropagation();
    };

    const onTouchEnd = (e: TouchEvent) => {
      lastTouchYRef.current = null;
      e.stopPropagation();
    };

    // Attach listeners with passive:false (critical)
    el.addEventListener("wheel", onWheel, { passive: false });
    el.addEventListener("touchstart", onTouchStart, { passive: false });
    el.addEventListener("touchmove", onTouchMove, { passive: false });
    el.addEventListener("touchend", onTouchEnd, { passive: false });

    return () => {
      el.removeEventListener("wheel", onWheel);
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchmove", onTouchMove);
      el.removeEventListener("touchend", onTouchEnd);
    };
  }, []);

  // Typing indicator
  const handleTyping = () => {
    setIsTyping(true);
    
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
    }, 1000);
  };

  // Send message
  const sendMessage = async () => {
    if (!newMessage.trim() || loading || !userId) return;

    setLoading(true);
    setIsTyping(false);
    
    try {
      await addDoc(collection(db, "messages"), {
        userId,
        sender: "user" as const,
        text: newMessage.trim(),
        timestamp: serverTimestamp(),
      });

      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setLoading(false);
    }
  };

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

  // Format date header
  const formatDateHeader = (timestamp: any, prevTimestamp: any) => {
    if (!timestamp || !prevTimestamp) return null;
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      const prevDate = prevTimestamp.toDate ? prevTimestamp.toDate() : new Date(prevTimestamp);
      
      if (date.toDateString() !== prevDate.toDateString()) {
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        
        if (date.toDateString() === today.toDateString()) {
          return "Today";
        } else if (date.toDateString() === yesterday.toDateString()) {
          return "Yesterday";
        } else {
          return date.toLocaleDateString("en-US", { 
            weekday: "long",
            month: "long", 
            day: "numeric" 
          });
        }
      }
      return null;
    } catch {
      return null;
    }
  };

  return (
    <div 
      className="flex flex-col h-full bg-[#0a0a0a]"
      style={{
        overflowX: "hidden",
        contain: "layout paint",
      }}
    >
      {/* Chat Header */}
      <div className="p-4 bg-gradient-to-r from-[#111] to-[#1a1a1a] border-b border-[#222]/60 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#FF2E2E] to-[#FF5555] flex items-center justify-center text-white font-bold">
              N
            </div>
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-[#111]" />
          </div>
          <div>
            <div className="text-white font-semibold tracking-wide">Nutrition Expert</div>
            <div className="text-xs text-gray-400">Online</div>
          </div>
        </div>
        {onMinimize && (
          <motion.button
            onClick={onMinimize}
            className="text-gray-400 hover:text-[#FF2E2E] transition-colors p-1.5 rounded-full hover:bg-[#222]/50"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            title="Minimize Chat"
            aria-label="Minimize Chat"
          >
            <Minus className="h-4 w-4" />
          </motion.button>
        )}
      </div>

      {/* Messages Area - Scrollable with event capture */}
      <div 
        ref={messagesContainerRef}
        className="flex-1 overflow-y-scroll bg-[#0a0a0a] scroll-smooth scrollbar-thin scrollbar-thumb-[#333] scrollbar-track-transparent"
        style={{
          overflowY: "scroll", // always show internal scroll area
          scrollbarGutter: "stable", // prevent scrollbar shift
          overscrollBehavior: "contain",
          WebkitOverflowScrolling: "touch",
          touchAction: "pan-y",
        }}
        onMouseEnter={() => setScrollLocked(true)}
        onMouseLeave={() => setScrollLocked(false)}
        onTouchStart={() => setScrollLocked(true)}
        onTouchEnd={() => setScrollLocked(false)}
      >
        {/* Inner wrapper for padding and spacing */}
        <div className="p-4 space-y-3 scroll-pb-16">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", delay: 0.2 }}
              >
                <MessageCircle className="h-16 w-16 text-gray-600 mb-4" />
              </motion.div>
              <p className="text-sm text-gray-400 mb-1">No messages yet</p>
              <p className="text-xs text-gray-500">Start a conversation with our nutrition expert!</p>
            </div>
          ) : (
            <AnimatePresence>
              {messages.map((message, index) => {
                const isUser = message.sender === "user";
                const prevMessage = index > 0 ? messages[index - 1] : null;
                const dateHeader = formatDateHeader(message.timestamp, prevMessage?.timestamp);

                return (
                  <div key={message.id}>
                    {dateHeader && (
                      <div className="flex justify-center my-4">
                        <div className="px-3 py-1 bg-[#1a1a1a] rounded-full text-xs text-gray-400">
                          {dateHeader}
                        </div>
                      </div>
                    )}
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className={`flex ${isUser ? "justify-end" : "justify-start"}`}
                    >
                      <div className={`max-w-[70%] ${isUser ? "flex flex-col items-end" : "flex flex-col items-start"}`}>
                        <div
                          className={`rounded-3xl px-4 py-2.5 ${
                            isUser
                              ? "bg-gradient-to-br from-[#1a1a1a] to-[#222] text-white border border-[#333]/30 shadow-lg"
                              : "bg-gradient-to-br from-[#FF2E2E] to-[#FF5555] text-white shadow-[0_0_15px_rgba(255,46,46,0.25)]"
                          }`}
                        >
                          <p className="text-sm leading-relaxed break-words">{message.text}</p>
                          <div className={`flex items-center gap-1 mt-1.5 ${isUser ? "justify-end" : "justify-start"}`}>
                            <span className="text-[10px] opacity-70">
                              {formatTime(message.timestamp)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                );
              })}
            </AnimatePresence>
          )}

          {/* Admin Typing Indicator */}
          {adminTyping && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex justify-start"
            >
              <div className="bg-gradient-to-br from-[#FF2E2E] to-[#FF5555] rounded-3xl rounded-tl-none px-4 py-3 shadow-[0_0_15px_rgba(255,46,46,0.25)]">
                <div className="flex gap-1">
                  <motion.div
                    className="w-2 h-2 bg-white/80 rounded-full"
                    animate={{ y: [0, -4, 0] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                  />
                  <motion.div
                    className="w-2 h-2 bg-white/80 rounded-full"
                    animate={{ y: [0, -4, 0] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                  />
                  <motion.div
                    className="w-2 h-2 bg-white/80 rounded-full"
                    animate={{ y: [0, -4, 0] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                  />
                </div>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Fixed Input Area at Bottom */}
      <div className="p-4 border-t border-[#222]/60 bg-[#111]/90 backdrop-blur-sm">
        <div className="flex gap-2 items-end max-w-7xl mx-auto">
          <div className="flex-1 bg-[#111]/90 rounded-lg px-4 py-3 border border-[#333]/50 focus-within:border-[#FF2E2E]/40 focus-within:ring-2 focus-within:ring-[#FF2E2E]/40 transition-all">
            <Input
              value={newMessage}
              onChange={(e) => {
                setNewMessage(e.target.value);
                handleTyping();
              }}
              onKeyPress={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              placeholder="Type a message..."
              disabled={loading}
              className="bg-transparent border-0 text-white placeholder:text-gray-500 focus-visible:ring-0 focus-visible:ring-offset-0 p-0 h-auto"
            />
          </div>
          <motion.div 
            whileHover={{ scale: 1.05 }} 
            whileTap={{ scale: 0.95 }}
            className="shadow-[0_0_15px_rgba(255,46,46,0.4)] hover:shadow-[0_0_20px_rgba(255,46,46,0.6)] transition-shadow"
          >
            <Button
              onClick={sendMessage}
              disabled={loading || !newMessage.trim()}
              size="icon"
              className="bg-[#FF2E2E] hover:bg-[#FF2E2E]/90 text-white rounded-full w-12 h-12"
            >
              <Send className="h-5 w-5" />
            </Button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

