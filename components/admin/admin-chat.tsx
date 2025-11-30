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
  getDoc,
  setDoc
} from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, Check, CheckCheck } from "lucide-react";
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

interface AdminChatProps {
  userId: string;
  userName?: string;
  userEmail?: string;
}

export function AdminChat({ userId, userName, userEmail }: AdminChatProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [userTyping, setUserTyping] = useState(false);
  const [isUserOnline, setIsUserOnline] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (!userId) return;

    // Listen for messages
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

        // Mark messages as read when admin views them
        msgs.forEach((msg) => {
          if (msg.senderId === userId && !msg.read) {
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
        setUserTyping(data?.userTyping || false);
      }
    });

    // Check user online status
    const userRef = doc(db, "users", userId);
    const userUnsubscribe = onSnapshot(userRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        setIsUserOnline(data?.isOnline || false);
      }
    });

    return () => {
      unsubscribe();
      typingUnsubscribe();
      userUnsubscribe();
    };
  }, [userId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, userTyping]);

  const handleTyping = () => {
    setIsTyping(true);
    const typingRef = doc(db, "typing", userId);
    // Use setDoc with merge to create if doesn't exist, update if it does
    setDoc(typingRef, {
      adminTyping: true,
      timestamp: serverTimestamp(),
    }, { merge: true }).catch(console.error);

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      setDoc(typingRef, {
        adminTyping: false,
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
        senderId: user?.uid,
        senderName: "Admin",
        timestamp: serverTimestamp(),
        read: false,
      });

      // Stop typing indicator
      setIsTyping(false);
      const typingRef = doc(db, "typing", userId);
      setDoc(typingRef, {
        adminTyping: false,
      }, { merge: true }).catch(console.error);

      // Send email notification if user is offline
      if (!isUserOnline && userEmail && userName) {
        try {
          // Get message preview (first 100 characters)
          const messagePreview = newMessage.length > 100 
            ? newMessage.substring(0, 100) + "..." 
            : newMessage;
          
          await fetch("/api/chat/notify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
              email: userEmail, 
              name: userName,
              messagePreview 
            }),
          });
        } catch (error) {
          console.error("Error sending email notification:", error);
        }
      }

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

  return (
    <div className="flex flex-col h-[500px] bg-[#0b141a] rounded-lg border border-[#222] overflow-hidden">
      {/* Chat Header */}
      <div className="p-4 border-b border-[#222] bg-[#202c33] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-[#FF2E2E] flex items-center justify-center text-white font-bold">
              {userName?.charAt(0).toUpperCase() || "U"}
            </div>
            <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-[#0b141a] ${isUserOnline ? "bg-green-500" : "bg-gray-500"}`} />
          </div>
          <div>
            <div className="text-white font-semibold">{userName || "User"}</div>
            <div className="text-xs text-gray-400">
              {isUserOnline ? "Online" : "Offline"}
            </div>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto bg-[#0b141a] p-4 space-y-2">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <p className="text-sm text-gray-400">No messages yet</p>
          </div>
        ) : (
          <AnimatePresence>
            {messages.map((message) => {
              const isAdmin = message.senderId === user?.uid;
              return (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className={`flex ${isAdmin ? "justify-end" : "justify-start"} mb-1`}
                >
                  <div className={`max-w-[65%] ${isAdmin ? "flex flex-col items-end" : "flex flex-col items-start"}`}>
                    <div
                      className={`rounded-lg px-3 py-2 ${
                        isAdmin
                          ? "bg-[#005c4b] text-white rounded-tr-none"
                          : "bg-[#202c33] text-[#e9edef] rounded-tl-none"
                      }`}
                    >
                      <p className="text-sm leading-relaxed break-words">{message.text}</p>
                      <div className={`flex items-center gap-1 mt-1 ${isAdmin ? "justify-end" : "justify-start"}`}>
                        <span className="text-[10px] text-gray-400 opacity-70">
                          {formatTime(message.timestamp)}
                        </span>
                        {isAdmin && (
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
              );
            })}
          </AnimatePresence>
        )}

        {/* Typing Indicator */}
        {userTyping && (
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

      {/* Input Area */}
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

