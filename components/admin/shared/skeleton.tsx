"use client";

import { motion } from "framer-motion";

export function SkeletonCard() {
  return (
    <div className="bg-[#151515] border border-[#222] rounded-2xl p-6 animate-pulse">
      <div className="h-6 bg-[#222] rounded mb-4 w-3/4"></div>
      <div className="h-4 bg-[#222] rounded mb-2 w-full"></div>
      <div className="h-4 bg-[#222] rounded w-2/3"></div>
    </div>
  );
}

export function SkeletonTable() {
  return (
    <div className="bg-[#151515] border border-[#222] rounded-2xl overflow-hidden">
      <div className="p-4 border-b border-[#222]">
        <div className="h-6 bg-[#222] rounded w-1/4 animate-pulse"></div>
      </div>
      <div className="p-4 space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-12 bg-[#222] rounded animate-pulse"></div>
        ))}
      </div>
    </div>
  );
}

export function SkeletonChart() {
  return (
    <div className="bg-[#151515] border border-[#222] rounded-2xl p-6">
      <div className="h-6 bg-[#222] rounded mb-4 w-1/3 animate-pulse"></div>
      <div className="h-64 bg-[#222] rounded animate-pulse"></div>
    </div>
  );
}

