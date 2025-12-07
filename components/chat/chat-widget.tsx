"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { ChatInterface } from "@/components/chat/chat-interface";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useChatNotifications } from "@/hooks/use-chat-notifications";
import Link from "next/link";

// Framer Motion variants for animations
const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      delay: 0.5,
      type: "spring",
      stiffness: 200,
      damping: 20,
      duration: 0.4,
    },
  },
};

const chatPanelVariants = {
  hidden: { opacity: 0, scale: 0.8, y: 40 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: "spring", stiffness: 180, damping: 22 },
  },
  exit: {
    opacity: 0,
    scale: 0.8,
    y: 40,
    transition: { duration: 0.3, ease: "easeInOut" },
  },
};

const badgeVariants = {
  hidden: { scale: 0, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: { duration: 0.25, ease: "easeInOut" },
  },
  exit: {
    scale: 0.5,
    opacity: 0,
    transition: { duration: 0.25, ease: "easeInOut" },
  },
};

const pulseRingVariants = {
  hidden: { scale: 0.8, opacity: 0.6 },
  visible: {
    scale: [0.8, 1.4, 0.8],
    opacity: [0.6, 0, 0.6],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
  exit: { scale: 0.8, opacity: 0 },
};

const rippleVariants = {
  hidden: { scale: 1, opacity: 0.2 },
  visible: {
    scale: 1.6,
    opacity: 0,
    transition: { duration: 0.6, ease: "easeOut" },
  },
  exit: { opacity: 0 },
};

const buttonVariants = {
  default: {
    scale: 1,
  },
  hover: {
    scale: 1.05,
    boxShadow: "0 0 25px rgba(255, 46, 46, 0.6)",
    transition: {
      duration: 0.2,
      ease: "easeOut",
    },
  },
};

export function ChatWidget() {
  const { user, loading: authLoading } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const {
    unreadCount,
    muted,
    showRipple,
    controls,
    toggleMute,
  } = useChatNotifications({
    userId: user?.uid || null,
    isOpen: isOpen && !isMinimized,
    enabled: !authLoading,
  });

  const handleClick = () => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    if (isMinimized) {
      setIsMinimized(false);
      setIsOpen(true);
    } else {
      setIsOpen(!isOpen);
    }
  };

  const handleMinimize = () => {
    setIsMinimized(true);
    setIsOpen(false);
  };

  const handleClose = () => {
    setIsOpen(false);
    setIsMinimized(false);
  };

  if (authLoading) return null;

  return (
    <>
      {/* Floating Chat Widget Container - Non-blocking */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end overflow-visible pointer-events-none"
        style={{
          right: "max(24px, env(safe-area-inset-right, 24px))",
          bottom: "max(24px, env(safe-area-inset-bottom, 24px))",
        }}
      >
        {/* Chat Window - Appears above button */}
        <AnimatePresence mode="wait">
          {isOpen && !isMinimized && user && (
            <motion.div
              key="chat-panel"
              variants={chatPanelVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="mb-3 w-[380px] h-[520px] rounded-2xl border border-[#2a2a2a]/60 bg-[#0a0a0a]/90 backdrop-blur-md shadow-[0_0_35px_rgba(255,46,46,0.15)] overflow-hidden flex flex-col pointer-events-auto"
              onWheel={(e) => e.stopPropagation()}
              onTouchStart={(e) => e.stopPropagation()}
              onTouchMove={(e) => e.stopPropagation()}
              onTouchEnd={(e) => e.stopPropagation()}
            >
              <ChatInterface userId={user.uid} onMinimize={handleMinimize} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Chat Bubble Button - Premium Messenger-Style Design */}
        <motion.button
          onClick={handleClick}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.95 }}
          className="relative flex items-center justify-center w-14 h-14 sm:w-12 sm:h-12 rounded-full bg-[#0a0a0a] border border-[#FF2E2E]/70 pointer-events-auto shadow-none transition-all duration-300 overflow-hidden"
          style={{
            background: "radial-gradient(circle at center, #111 40%, #0a0a0a 100%)",
            boxShadow: isOpen
              ? "0 0 25px rgba(255, 46, 46, 0.5)"
              : "0 0 15px 3px rgba(255, 46, 46, 0.35)",
          }}
          aria-label="Chat with your coach"
          title="Chat with your coach"
        >
          {/* Chat icon */}
          <MessageCircle className="h-6 w-6 text-white sm:h-5 sm:w-5 relative z-10" />

          {/* Gentle heartbeat pulse when closed */}
          {!isOpen && (
            <motion.div
              className="absolute inset-0 rounded-full pointer-events-none"
              style={{
                boxShadow: "0 0 25px 8px rgba(255, 46, 46, 0.35)",
              }}
              animate={{
                opacity: [0.3, 0.1, 0.3],
                scale: [1, 1.25, 1],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          )}

          {/* Hover ripple / wave animation */}
          <motion.div
            className="absolute inset-0 rounded-full border border-[#FF2E2E]/40 pointer-events-none"
            initial={{ scale: 0.95, opacity: 0 }}
            whileHover={{ scale: 1.2, opacity: 0.3 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          />

          {/* Ripple Effect (for new messages) */}
          <AnimatePresence>
            {showRipple && (
              <motion.div
                variants={rippleVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="absolute inset-0 rounded-full bg-[#FF2E2E] pointer-events-none z-0"
              />
            )}
          </AnimatePresence>

          {/* Unread Badge with Count - White background, red text */}
          <AnimatePresence mode="wait">
            {unreadCount > 0 && (
              <motion.span
                key="badge"
                variants={badgeVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-[5px] text-xs font-semibold bg-white text-[#FF2E2E] rounded-full flex items-center justify-center shadow-md shadow-[0_0_6px_rgba(255,46,46,0.4)] z-20"
              >
                <motion.span
                  key={unreadCount}
                  initial={{ scale: 1.2 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {unreadCount > 9 ? "9+" : unreadCount}
                </motion.span>
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      </motion.div>

      {/* Auth Modal */}
      <Dialog open={showAuthModal} onOpenChange={setShowAuthModal}>
        <DialogContent className="max-w-sm bg-[#0a0a0a] border-[#222]">
          <DialogHeader>
            <DialogTitle className="text-white text-xl">Login to Start Chatting</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <p className="text-gray-400 text-sm">
              Please log in to chat with our nutrition expert and get personalized support.
            </p>
            <div className="flex flex-col gap-3">
              <Link href="/auth/login" className="w-full">
                <Button
                  className="w-full bg-[#FF2E2E] hover:bg-[#FF2E2E]/90 text-white"
                  onClick={() => setShowAuthModal(false)}
                >
                  Login
                </Button>
              </Link>
              <Link href="/auth/signup" className="w-full">
                <Button
                  variant="outline"
                  className="w-full border-[#222] text-white hover:bg-[#222] hover:border-[#FF2E2E]"
                  onClick={() => setShowAuthModal(false)}
                >
                  Sign Up
                </Button>
              </Link>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
