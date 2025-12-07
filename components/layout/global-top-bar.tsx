"use client";

import { motion } from "framer-motion";
import { useAuth } from "@/context/auth-context";
import { NotificationsDropdown } from "@/components/dashboard/notifications";

export function GlobalTopBar() {
  const { user, userData } = useAuth();

  // Get user initials
  const getInitials = () => {
    if (userData?.name) {
      const names = userData.name.split(" ");
      if (names.length >= 2) {
        return `${names[0][0]}${names[1][0]}`.toUpperCase();
      }
      return names[0][0].toUpperCase();
    }
    if (user?.email) {
      return user.email[0].toUpperCase();
    }
    return "U";
  };

  const userName = userData?.name || user?.email?.split("@")[0] || "User";

  return (
    <motion.div
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="sticky top-0 z-30 bg-[#0b0b0b]/80 backdrop-blur-lg border-b border-[#222]"
    >
      {/* Subtle top gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#FF2E2E]/5 to-transparent pointer-events-none" />
      
      <div className="relative flex items-center justify-between px-6 py-4">
        {/* Greeting */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="flex items-center gap-4"
        >
          <h1 className="text-2xl font-black text-white">
            Welcome back, {userName} 👋
          </h1>
        </motion.div>

        {/* Right side: Notifications & Avatar */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="flex items-center gap-4"
        >
          {/* Notifications */}
          {user && <NotificationsDropdown />}

          {/* User Avatar */}
          {user ? (
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-12 h-12 rounded-full bg-gradient-to-br from-[#FF2E2E] to-[#FF5555] flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-[#FF2E2E]/30"
            >
              {getInitials()}
            </motion.div>
          ) : (
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-12 h-12 rounded-full bg-[#222] flex items-center justify-center text-gray-400"
            >
              <span className="text-lg">👤</span>
            </motion.div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
}

