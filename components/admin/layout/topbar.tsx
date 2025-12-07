"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, User, Menu, X } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface TopbarProps {
  onMenuClick: () => void;
  sidebarOpen?: boolean;
}

export function Topbar({ onMenuClick, sidebarOpen = true }: TopbarProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="sticky top-0 z-30 bg-[#0b0b0b]/80 backdrop-blur-md border-b border-[#222]"
    >
      <div className="flex items-center justify-between px-6 py-4">
        {/* Left: Mobile Menu + Logo */}
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className={cn(
              "p-2 rounded-lg hover:bg-[#222] text-gray-400 hover:text-white transition-colors",
              sidebarOpen && "lg:hidden"
            )}
            aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
          >
            <Menu className="h-5 w-5" />
          </button>

          {/* Logo */}
          <button
            onClick={() => router.push("/")}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#FF2E2E] to-[#7b0000] flex items-center justify-center">
              <span className="text-white font-bold text-sm">M</span>
            </div>
            <span className="text-white font-semibold text-lg hidden sm:block">MacroMinded</span>
          </button>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-3">
          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="relative p-2 rounded-lg hover:bg-[#222] text-gray-400 hover:text-white transition-colors"
              aria-label="Notifications"
            >
              <Bell className="h-5 w-5" />
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute top-1 right-1 w-2 h-2 bg-[#FF2E2E] rounded-full"
              />
            </button>

            {/* Notifications Dropdown */}
            <AnimatePresence>
              {notificationsOpen && (
                <>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-40"
                    onClick={() => setNotificationsOpen(false)}
                  />
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 top-full mt-2 w-80 bg-[#151515] border border-[#222] rounded-lg shadow-xl z-50 overflow-hidden"
                  >
                    <div className="p-4 border-b border-[#222] flex items-center justify-between">
                      <h3 className="text-white font-semibold">Notifications</h3>
                      <button
                        onClick={() => setNotificationsOpen(false)}
                        className="p-1 rounded-lg hover:bg-[#222] text-gray-400 hover:text-white transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      <div className="p-8 text-center">
                        <Bell className="h-12 w-12 text-gray-600 mx-auto mb-3" />
                        <p className="text-gray-400 text-sm">No notifications yet</p>
                        <p className="text-gray-500 text-xs mt-1">
                          You'll see notifications here when they arrive
                        </p>
                      </div>
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          {/* Profile */}
          <div className="flex items-center gap-3 pl-3 border-l border-[#222]">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-white">
                {user?.displayName || "Admin"}
              </p>
              <p className="text-xs text-gray-400">{user?.email}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#FF2E2E] to-[#7b0000] flex items-center justify-center">
              <User className="h-5 w-5 text-white" />
            </div>
          </div>
        </div>
      </div>
    </motion.header>
  );
}

