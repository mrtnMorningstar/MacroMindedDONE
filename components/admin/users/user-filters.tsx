"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, Filter, X } from "lucide-react";

interface UserFiltersProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  statusFilter: string;
  onStatusFilterChange: (status: string) => void;
  planTypeFilter: string;
  onPlanTypeFilterChange: (type: string) => void;
  showActiveOnly: boolean;
  onActiveOnlyChange: (active: boolean) => void;
}

export function UserFilters({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  planTypeFilter,
  onPlanTypeFilterChange,
  showActiveOnly,
  onActiveOnlyChange,
}: UserFiltersProps) {
  const [debouncedSearch, setDebouncedSearch] = useState(searchTerm);

  useEffect(() => {
    const timer = setTimeout(() => {
      onSearchChange(debouncedSearch);
    }, 300);

    return () => clearTimeout(timer);
  }, [debouncedSearch, onSearchChange]);

  const hasFilters = statusFilter !== "all" || planTypeFilter !== "all" || showActiveOnly;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[#151515] border border-[#222] rounded-2xl p-4 mb-6"
    >
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Search */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search users by name or email..."
            value={debouncedSearch}
            onChange={(e) => setDebouncedSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[#0a0a0a] border border-[#222] rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:border-[#FF2E2E] focus:ring-1 focus:ring-[#FF2E2E] transition-colors"
          />
        </div>

        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={(e) => onStatusFilterChange(e.target.value)}
          className="px-4 py-2 bg-[#0a0a0a] border border-[#222] rounded-lg text-white focus:outline-none focus:border-[#FF2E2E] focus:ring-1 focus:ring-[#FF2E2E] transition-colors"
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="in-progress">In Progress</option>
          <option value="delivered">Delivered</option>
        </select>

        {/* Plan Type Filter */}
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

        {/* Active Users Toggle */}
        <label className="flex items-center gap-2 px-4 py-2 bg-[#0a0a0a] border border-[#222] rounded-lg cursor-pointer hover:border-[#FF2E2E]/50 transition-colors">
          <input
            type="checkbox"
            checked={showActiveOnly}
            onChange={(e) => onActiveOnlyChange(e.target.checked)}
            className="w-4 h-4 rounded border-[#222] bg-[#151515] text-[#FF2E2E] focus:ring-[#FF2E2E] focus:ring-offset-0"
          />
          <span className="text-sm text-gray-300">Active Only</span>
        </label>

        {/* Clear Filters */}
        {hasFilters && (
          <button
            onClick={() => {
              onStatusFilterChange("all");
              onPlanTypeFilterChange("all");
              onActiveOnlyChange(false);
            }}
            className="px-4 py-2 bg-[#222] hover:bg-[#FF2E2E]/20 border border-[#222] hover:border-[#FF2E2E]/50 rounded-lg text-gray-400 hover:text-white transition-colors flex items-center gap-2"
          >
            <X className="h-4 w-4" />
            Clear
          </button>
        )}
      </div>
    </motion.div>
  );
}

