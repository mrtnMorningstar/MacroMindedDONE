"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export function AnimatedCard({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02, boxShadow: "0 0 15px rgba(255,46,46,0.25)" }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={cn("rounded-xl border border-[#1f1f1f] bg-gradient-to-b from-[#111] to-[#0b0b0b] p-4 transition-all duration-200", className)}
    >
      {children}
    </motion.div>
  );
}
