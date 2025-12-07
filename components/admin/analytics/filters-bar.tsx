"use client";

import { motion } from "framer-motion";
import { Calendar, Package } from "lucide-react";

interface FiltersBarProps {
  dateRange: string;
  onDateRangeChange: (range: string) => void;
  planTypeFilter: string;
  onPlanTypeFilterChange: (type: string) => void;
  onExportClick: () => void;
}

export function FiltersBar({
  dateRange,
  onDateRangeChange,
  planTypeFilter,
  onPlanTypeFilterChange,
  onExportClick,
}: FiltersBarProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[#151515] border border-[#222] rounded-2xl p-4 mb-6"
    >
      <div className="flex flex-col lg:flex-row gap-4 items-center">
        {/* Date Range */}
        <div className="flex items-center gap-2 flex-1">
          <Calendar className="h-4 w-4 text-gray-400" />
          <label className="text-sm text-gray-400">Date Range:</label>
          <select
            value={dateRange}
            onChange={(e) => onDateRangeChange(e.target.value)}
            className="px-4 py-2 bg-[#0a0a0a] border border-[#222] rounded-lg text-white focus:outline-none focus:border-[#FF2E2E] focus:ring-1 focus:ring-[#FF2E2E] transition-colors"
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="all">All Time</option>
          </select>
        </div>

        {/* Plan Type Filter */}
        <div className="flex items-center gap-2">
          <Package className="h-4 w-4 text-gray-400" />
          <label className="text-sm text-gray-400">Plan Type:</label>
          <select
            value={planTypeFilter}
            onChange={(e) => onPlanTypeFilterChange(e.target.value)}
            className="px-4 py-2 bg-[#0a0a0a] border border-[#222] rounded-lg text-white focus:outline-none focus:border-[#FF2E2E] focus:ring-1 focus:ring-[#FF2E2E] transition-colors"
          >
            <option value="all">All Plans</option>
            <option value="Basic">Basic</option>
            <option value="Pro">Pro</option>
            <option value="Elite">Elite</option>
          </select>
        </div>

        {/* Export Button */}
        <button
          onClick={onExportClick}
          className="px-6 py-2 rounded-lg bg-[#FF2E2E] hover:bg-[#FF2E2E]/90 text-white transition-colors font-medium"
        >
          Export
        </button>
      </div>
    </motion.div>
  );
}

