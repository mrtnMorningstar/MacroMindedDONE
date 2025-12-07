"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, Download, Search, Filter } from "lucide-react";
import { collection, onSnapshot, query, orderBy, limit, Timestamp, startAfter } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { EmptyState } from "@/components/admin/shared/empty-state";

interface Log {
  id: string;
  action: string;
  user?: string;
  userId?: string;
  timestamp: Timestamp | Date | string;
  type: string;
  details?: string;
}

type LogType = "all" | "upload" | "delete" | "payment" | "login" | "chat";

export function LogsViewer() {
  const [logs, setLogs] = useState<Log[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<LogType>("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "systemLogs"), orderBy("timestamp", "desc"), limit(100));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const logsList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Log),
      }));
      setLogs(logsList);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      // Type filter
      if (typeFilter !== "all" && log.type?.toLowerCase() !== typeFilter.toLowerCase()) {
        return false;
      }

      // Search filter
      if (searchTerm) {
        const search = searchTerm.toLowerCase();
        return (
          log.action?.toLowerCase().includes(search) ||
          log.user?.toLowerCase().includes(search) ||
          log.type?.toLowerCase().includes(search)
        );
      }

      return true;
    });
  }, [logs, searchTerm, typeFilter]);

  const formatDate = (timestamp: any) => {
    if (!timestamp) return "Unknown";
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return date.toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
      });
    } catch {
      return "Unknown";
    }
  };

  const getTypeColor = (type: string) => {
    const normalized = type?.toLowerCase() || "";
    if (normalized === "upload") return "text-blue-400";
    if (normalized === "delete") return "text-red-400";
    if (normalized === "payment") return "text-green-400";
    if (normalized === "login") return "text-yellow-400";
    if (normalized === "chat") return "text-purple-400";
    return "text-gray-400";
  };

  const exportLogs = () => {
    const headers = ["Timestamp", "Action", "User", "Type", "Details"];
    const rows = filteredLogs.map((log) => [
      formatDate(log.timestamp),
      log.action || "",
      log.user || "System",
      log.type || "",
      log.details || "",
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `macrominded-logs-${new Date().toISOString().split("T")[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="bg-[#151515] border border-[#222] rounded-2xl p-6 animate-pulse">
        <div className="h-32 bg-[#222] rounded"></div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[#151515] border border-[#222] rounded-2xl p-6 shadow-lg backdrop-blur-sm"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-[#FF2E2E]/10 border border-[#FF2E2E]/20">
            <FileText className="h-5 w-5 text-[#FF2E2E]" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-white">System Logs</h2>
            <p className="text-xs text-gray-400">View all system activity</p>
          </div>
        </div>
        <button
          onClick={exportLogs}
          className="px-4 py-2 rounded-lg bg-[#FF2E2E] hover:bg-[#FF2E2E]/90 text-white transition-colors flex items-center gap-2"
        >
          <Download className="h-4 w-4" />
          Export
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search logs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[#0a0a0a] border border-[#222] rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:border-[#FF2E2E] focus:ring-1 focus:ring-[#FF2E2E]"
          />
        </div>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value as LogType)}
          className="px-4 py-2 bg-[#0a0a0a] border border-[#222] rounded-lg text-white focus:outline-none focus:border-[#FF2E2E] focus:ring-1 focus:ring-[#FF2E2E]"
        >
          <option value="all">All Actions</option>
          <option value="upload">Upload</option>
          <option value="delete">Delete</option>
          <option value="payment">Payment</option>
          <option value="login">Login</option>
          <option value="chat">Chat</option>
        </select>
      </div>

      {/* Logs Table */}
      <div className="overflow-x-auto">
        {filteredLogs.length === 0 ? (
          <EmptyState icon={FileText} title="No logs found" description="System logs will appear here as actions occur." />
        ) : (
          <table className="w-full">
            <thead className="bg-[#1a1a1a] border-b border-[#222]">
              <tr>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-300 uppercase tracking-wider">
                  Timestamp
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-300 uppercase tracking-wider">
                  Action
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-300 uppercase tracking-wider">
                  User
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-300 uppercase tracking-wider">
                  Type
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#222]">
              <AnimatePresence>
                {filteredLogs.map((log, index) => (
                  <motion.tr
                    key={log.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ delay: index * 0.02 }}
                    className="bg-[#151515] hover:bg-[#1a1a1a] transition-colors"
                  >
                    <td className="py-3 px-4 text-sm text-gray-400">{formatDate(log.timestamp)}</td>
                    <td className="py-3 px-4 text-sm text-white">{log.action || "Unknown"}</td>
                    <td className="py-3 px-4 text-sm text-gray-300">{log.user || "System"}</td>
                    <td className="py-3 px-4">
                      <span className={`text-xs font-medium ${getTypeColor(log.type)}`}>
                        {log.type || "Unknown"}
                      </span>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        )}
      </div>
    </motion.div>
  );
}

