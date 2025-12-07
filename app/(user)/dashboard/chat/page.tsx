"use client";

import { ChatInterface } from "@/components/chat/chat-interface";
import { useAuth } from "@/context/auth-context";
import { motion } from "framer-motion";
import { AnimatedCard } from "@/components/ui/animated-card";

export default function ChatPage() {
  const { user } = useAuth();

  if (!user?.uid) {
    return (
      <AnimatedCard className="text-center">
        <p className="text-gray-300">Please log in to access chat.</p>
      </AnimatedCard>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="h-[80vh] rounded-xl border border-[#1f1f1f] bg-gradient-to-b from-[#0f0f0f] via-[#0b0b0b] to-[#0f0f0f] p-4 relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-[#FF2E2E]/5 via-transparent to-transparent pointer-events-none" />
      <div className="relative z-10 h-full">
        <ChatInterface userId={user.uid} />
      </div>
    </motion.div>
  );
}
