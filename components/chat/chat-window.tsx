"use client";

import { motion } from "framer-motion";
import { X, Bell, BellOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ChatInterface } from "@/components/chat/chat-interface";

interface ChatWindowProps {
  userId: string;
  muted: boolean;
  onToggleMute: () => void;
  onClose: () => void;
}

export function ChatWindow({ userId, muted, onToggleMute, onClose }: ChatWindowProps) {
  return (
    <div className="flex flex-col h-full">
      {/* Chat Header */}
      <div className="p-4 border-b border-[#222] bg-[#111] flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#FF2E2E] to-[#FF5555] flex items-center justify-center text-white font-bold">
                N
              </div>
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-[#111]" />
            </div>
            <div>
              <div className="text-white font-semibold">Nutrition Expert</div>
              <div className="text-xs text-gray-400">Online</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Mute Notifications Toggle */}
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                variant="ghost"
                size="icon"
                onClick={onToggleMute}
                className={`text-white hover:bg-[#222] transition-all ${
                  muted ? "text-[#FF2E2E] shadow-[0_0_10px_rgba(255,46,46,0.5)]" : ""
                }`}
                title={muted ? "Unmute notifications" : "Mute notifications"}
                aria-label={muted ? "Unmute notifications" : "Mute notifications"}
              >
                {muted ? (
                  <BellOff className="h-5 w-5" />
                ) : (
                  <Bell className="h-5 w-5" />
                )}
              </Button>
            </motion.div>
            {/* Close Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-gray-400 hover:text-white hover:bg-[#222]"
              title="Close chat"
              aria-label="Close chat"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
      
      {/* Chat Content - Scrollable */}
      <div className="flex-1 overflow-hidden min-h-0" style={{ minHeight: 0 }}>
        <ChatInterface userId={userId} />
      </div>
    </div>
  );
}

