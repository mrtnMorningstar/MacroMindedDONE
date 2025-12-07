"use client";

import { motion } from "framer-motion";
import { AlertCircle } from "lucide-react";
import Link from "next/link";

export default function AdminNotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center space-y-4"
      >
        <div className="flex justify-center mb-4">
          <div className="p-4 rounded-full bg-[#FF2E2E]/10 border border-[#FF2E2E]/20">
            <AlertCircle className="h-12 w-12 text-[#FF2E2E]" />
          </div>
        </div>
        <h1 className="text-4xl font-bold text-white">404</h1>
        <p className="text-gray-400 text-lg">Page not found</p>
        <Link
          href="/admin"
          className="inline-block mt-6 px-6 py-3 bg-[#FF2E2E] hover:bg-[#FF2E2E]/90 text-white rounded-lg transition-colors"
        >
          Return to Dashboard
        </Link>
      </motion.div>
    </div>
  );
}

