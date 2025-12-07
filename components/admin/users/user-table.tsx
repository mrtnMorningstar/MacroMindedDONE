"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { MessageSquare, Upload, ChevronUp, ChevronDown, MoreVertical } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/admin/shared/empty-state";
import { Users } from "lucide-react";

interface User {
  id: string;
  name?: string;
  email?: string;
  planType?: string;
  planStatus?: string;
  lastActive?: any;
  isOnline?: boolean;
  createdAt?: any;
}

interface UserTableProps {
  users: User[];
  onOpenChat: (user: User) => void;
  onOpenUpload: (user: User) => void;
}

type SortField = "name" | "email" | "status" | "lastActive" | null;
type SortDirection = "asc" | "desc";

export function UserTable({ users, onOpenChat, onOpenUpload }: UserTableProps) {
  const [sortField, setSortField] = useState<SortField>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const sortedUsers = useMemo(() => {
    if (!sortField) return users;

    return [...users].sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortField) {
        case "name":
          aValue = (a.name || a.email || "").toLowerCase();
          bValue = (b.name || b.email || "").toLowerCase();
          break;
        case "email":
          aValue = (a.email || "").toLowerCase();
          bValue = (b.email || "").toLowerCase();
          break;
        case "status":
          aValue = (a.planStatus || "pending").toLowerCase();
          bValue = (b.planStatus || "pending").toLowerCase();
          break;
        case "lastActive":
          aValue = a.lastActive?.toMillis?.() || a.lastActive?.getTime?.() || 0;
          bValue = b.lastActive?.toMillis?.() || b.lastActive?.getTime?.() || 0;
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
      if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
  }, [users, sortField, sortDirection]);

  const getStatusBadge = (status?: string) => {
    const normalized = (status || "pending").toLowerCase();
    if (normalized === "delivered") {
      return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Delivered</Badge>;
    }
    if (normalized === "in progress" || normalized === "in-progress") {
      return <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">In Progress</Badge>;
    }
    return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">Pending</Badge>;
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return "Never";
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      const now = new Date();
      const diff = now.getTime() - date.getTime();
      const days = Math.floor(diff / 86400000);
      
      if (days === 0) return "Today";
      if (days === 1) return "Yesterday";
      if (days < 7) return `${days}d ago`;
      return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    } catch {
      return "Unknown";
    }
  };

  const SortButton = ({ field, children }: { field: SortField; children: React.ReactNode }) => {
    const isActive = sortField === field;
    const direction = isActive ? sortDirection : null;

    return (
      <button
        onClick={() => handleSort(field)}
        className="flex items-center gap-1 hover:text-[#FF2E2E] transition-colors"
      >
        {children}
        <div className="flex flex-col">
          <ChevronUp
            className={`h-3 w-3 ${isActive && direction === "asc" ? "text-[#FF2E2E]" : "text-gray-500"}`}
          />
          <ChevronDown
            className={`h-3 w-3 -mt-1 ${isActive && direction === "desc" ? "text-[#FF2E2E]" : "text-gray-500"}`}
          />
        </div>
      </button>
    );
  };

  if (!users || users.length === 0) {
    return <EmptyState icon={Users} title="No users found" description="Users will appear here once they register." />;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[#151515] border border-[#222] rounded-2xl overflow-hidden shadow-lg"
    >
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-[#1a1a1a] border-b border-[#222]">
            <tr>
              <th className="text-left py-4 px-6 text-sm font-semibold text-gray-300 uppercase tracking-wider">
                <SortButton field="name">Name</SortButton>
              </th>
              <th className="text-left py-4 px-6 text-sm font-semibold text-gray-300 uppercase tracking-wider">
                <SortButton field="email">Email</SortButton>
              </th>
              <th className="text-left py-4 px-6 text-sm font-semibold text-gray-300 uppercase tracking-wider">
                Plan Type
              </th>
              <th className="text-left py-4 px-6 text-sm font-semibold text-gray-300 uppercase tracking-wider">
                <SortButton field="status">Status</SortButton>
              </th>
              <th className="text-left py-4 px-6 text-sm font-semibold text-gray-300 uppercase tracking-wider">
                <SortButton field="lastActive">Last Active</SortButton>
              </th>
              <th className="text-left py-4 px-6 text-sm font-semibold text-gray-300 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#222]">
            {sortedUsers.map((user, index) => (
              <motion.tr
                key={user.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-[#151515] hover:bg-[#1a1a1a] hover:border-l-4 hover:border-[#FF2E2E] transition-all duration-300"
              >
                <td className="py-4 px-6">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#FF2E2E] to-[#7b0000] flex items-center justify-center text-white font-semibold">
                        {(user.name || user.email || "U")[0].toUpperCase()}
                      </div>
                      {user.isOnline && (
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-[#151515]" />
                      )}
                    </div>
                    <div>
                      <p className="text-white font-medium">{user.name || "N/A"}</p>
                      {user.isOnline && (
                        <p className="text-xs text-green-400">Online</p>
                      )}
                    </div>
                  </div>
                </td>
                <td className="py-4 px-6 text-gray-300">{user.email || "N/A"}</td>
                <td className="py-4 px-6 text-gray-300">{user.planType || "No Plan"}</td>
                <td className="py-4 px-6">{getStatusBadge(user.planStatus)}</td>
                <td className="py-4 px-6 text-gray-400 text-sm">{formatDate(user.lastActive)}</td>
                <td className="py-4 px-6">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onOpenChat(user)}
                      className="p-2 rounded-lg bg-[#222] hover:bg-[#FF2E2E]/20 border border-[#222] hover:border-[#FF2E2E]/50 text-gray-400 hover:text-white transition-colors"
                      title="Chat"
                    >
                      <MessageSquare className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onOpenUpload(user)}
                      className="p-2 rounded-lg bg-[#FF2E2E] hover:bg-[#FF2E2E]/90 text-white transition-colors"
                      title="Upload Plan"
                    >
                      <Upload className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}

