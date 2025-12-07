"use client";

import { motion } from "framer-motion";

interface ChartWrapperProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
}

export function ChartWrapper({ children, title, description }: ChartWrapperProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[#151515] border border-[#222] rounded-lg p-6"
    >
      {title && (
        <div className="mb-6">
          <h3 className="text-xl font-semibold text-white mb-1">{title}</h3>
          {description && <p className="text-sm text-gray-400">{description}</p>}
        </div>
      )}
      <div className="h-64 flex items-center justify-center">{children}</div>
    </motion.div>
  );
}

