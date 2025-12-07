"use client";

import { useState, useEffect, useRef } from "react";
import { 
  collection, 
  query, 
  orderBy, 
  onSnapshot, 
  addDoc, 
  serverTimestamp, 
  where,
  doc,
  updateDoc,
  setDoc
} from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, MessageCircle, Check, CheckCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/auth-context";

interface Message {
  id: string;
  text: string;
  senderId: string;
  senderName: string;
  timestamp: any;
  read: boolean;
}

interface ChatBoxProps {
  userId: string;
}

export function ChatBox({ userId }: ChatBoxProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [adminTyping, setAdminTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (!userId) return;

    // Track user online status
    const userStatusRef = doc(db, "users", userId);
    const updateOnlineStatus = async () => {
      try {
        await updateDoc(userStatusRef, {
          lastSeen: serverTimestamp(),
          isOnline: true,
        });
      } catch (error) {
        console.error("Error updating online status:", error);
      }
    };

    updateOnlineStatus();

    // Update last seen periodically
    const interval = setInterval(updateOnlineStatus, 30000); // Every 30 seconds

    // Set offline when component unmounts
    return () => {
      clearInterval(interval);
      updateDoc(userStatusRef, {
        isOnline: false,
        lastSeen: serverTimestamp(),
      }).catch(console.error);
    };
  }, [userId]);

  useEffect(() => {
    if (!userId) return;

    const q = query(
      collection(db, "messages"),
      where("userId", "==", userId),
      orderBy("timestamp", "asc")
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const msgs = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Message[];
        setMessages(msgs);

        // Mark messages as read when user views them
        msgs.forEach((msg) => {
          if (msg.senderId !== userId && !msg.read) {
            updateDoc(doc(db, "messages", msg.id), {
              read: true,
            }).catch(console.error);
          }
        });
      },
      (error: any) => {
        console.error("Error in messages snapshot:", error);
        // If index error, show helpful message but don't throw
        if (error.code === "failed-precondition") {
          console.warn(
            "Firestore index required. Please create the index at the URL provided in the error message."
          );
          // Set empty messages array to prevent UI errors
          setMessages([]);
        } else {
          // For other errors, also set empty array
          setMessages([]);
        }
      }
    );

    // Listen for typing indicators
    const typingRef = doc(db, "typing", userId);
    const typingUnsubscribe = onSnapshot(typingRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        setAdminTyping(data?.adminTyping || false);
      }
    });

    return () => {
      unsubscribe();
      typingUnsubscribe();
    };
  }, [userId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, adminTyping]);

  const handleTyping = () => {
    setIsTyping(true);
    const typingRef = doc(db, "typing", userId);
    // Use setDoc with merge to create if doesn't exist, update if it does
    setDoc(typingRef, {
      userTyping: true,
      timestamp: serverTimestamp(),
    }, { merge: true }).catch(console.error);

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      setDoc(typingRef, {
        userTyping: false,
      }, { merge: true }).catch(console.error);
    }, 1000);
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || loading || !userId) return;

    setLoading(true);
    try {
      await addDoc(collection(db, "messages"), {
        userId,
        text: newMessage,
        senderId: userId,
        senderName: "You",
        timestamp: serverTimestamp(),
        read: false,
      });

      // Stop typing indicator
      setIsTyping(false);
      const typingRef = doc(db, "typing", userId);
      setDoc(typingRef, {
        userTyping: false,
      }, { merge: true }).catch(console.error);

      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setLoading(false);
    }
  };

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
    <div className="flex flex-col h-[600px] bg-[#0b141a] rounded-lg border border-[#222] overflow-hidden">
      {/* Chat Header - WhatsApp Style */}
      <div className="p-4 border-b border-[#222] bg-[#202c33] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-[#FF2E2E] flex items-center justify-center text-white font-bold">
              {userId.charAt(0).toUpperCase()}
            </div>
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-[#0b141a]" />
          </div>
          <div>
            <div className="text-white font-semibold">Nutrition Expert</div>
            <div className="text-xs text-gray-400">Online</div>
          </div>
        </div>
      </div>

      {/* Messages Area - WhatsApp Style */}
      <div className="flex-1 overflow-y-auto bg-[#0b141a] p-4 space-y-2">
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
              const isUser = message.senderId === userId;
              const prevMessage = index > 0 ? messages[index - 1] : null;
              const dateHeader = formatDateHeader(message.timestamp, prevMessage?.timestamp);

              return (
                <div key={message.id}>
                  {dateHeader && (
                    <div className="flex justify-center my-4">
                      <div className="px-3 py-1 bg-[#182229] rounded-full text-xs text-gray-400">
                        {dateHeader}
                      </div>
                    </div>
                  )}
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className={`flex ${isUser ? "justify-end" : "justify-start"} mb-1`}
                  >
                    <div className={`max-w-[65%] ${isUser ? "flex flex-col items-end" : "flex flex-col items-start"}`}>
                      <div
                        className={`rounded-lg px-3 py-2 ${
                          isUser
                            ? "bg-[#005c4b] text-white rounded-tr-none"
                            : "bg-[#202c33] text-[#e9edef] rounded-tl-none"
                        }`}
                      >
                        <p className="text-sm leading-relaxed break-words">{message.text}</p>
                        <div className={`flex items-center gap-1 mt-1 ${isUser ? "justify-end" : "justify-start"}`}>
                          <span className="text-[10px] text-gray-400 opacity-70">
                            {formatTime(message.timestamp)}
                          </span>
                          {isUser && (
                            <span className="ml-1">
                              {message.read ? (
                                <CheckCheck className="h-3 w-3 text-blue-400" />
                              ) : (
                                <Check className="h-3 w-3 text-gray-400" />
                              )}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </div>
              );
            })}
          </AnimatePresence>
        )}

        {/* Typing Indicator */}
        {adminTyping && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex justify-start mb-1"
          >
            <div className="bg-[#202c33] rounded-lg rounded-tl-none px-4 py-3">
              <div className="flex gap-1">
                <motion.div
                  className="w-2 h-2 bg-gray-400 rounded-full"
                  animate={{ y: [0, -4, 0] }}
                  transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                />
                <motion.div
                  className="w-2 h-2 bg-gray-400 rounded-full"
                  animate={{ y: [0, -4, 0] }}
                  transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                />
                <motion.div
                  className="w-2 h-2 bg-gray-400 rounded-full"
                  animate={{ y: [0, -4, 0] }}
                  transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                />
              </div>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area - WhatsApp Style */}
      <div className="p-3 border-t border-[#222] bg-[#202c33]">
        <div className="flex gap-2 items-end">
          <div className="flex-1 bg-[#2a3942] rounded-lg px-4 py-2 border border-[#333] focus-within:border-[#FF2E2E]/50 transition-colors">
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
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              onClick={sendMessage}
              disabled={loading || !newMessage.trim()}
              size="icon"
              className="bg-[#FF2E2E] hover:bg-[#FF2E2E]/90 text-white rounded-full w-10 h-10"
            >
              <Send className="h-5 w-5" />
            </Button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
