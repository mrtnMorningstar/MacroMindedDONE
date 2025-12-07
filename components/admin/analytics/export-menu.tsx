"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, FileText, FileSpreadsheet, X } from "lucide-react";

interface Payment {
  id: string;
  userName?: string;
  userEmail?: string;
  planType?: string;
  amount: number;
  status?: string;
  createdAt?: any;
}

interface ExportMenuProps {
  payments: Payment[];
  open: boolean;
  onClose: () => void;
}

export function ExportMenu({ payments, open, onClose }: ExportMenuProps) {
  const [exporting, setExporting] = useState(false);

  const formatDate = (timestamp: any) => {
    if (!timestamp) return "Unknown";
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return date.toLocaleDateString("en-US", {
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

  const exportCSV = () => {
    setExporting(true);
    try {
      const headers = ["Date", "User", "Email", "Plan Type", "Amount", "Status"];
      const rows = payments.map((payment) => [
        formatDate(payment.createdAt),
        payment.userName || "Unknown",
        payment.userEmail || "",
        payment.planType || "Basic",
        `$${payment.amount.toLocaleString()}`,
        payment.status || "completed",
      ]);

      const csvContent = [
        headers.join(","),
        ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
      ].join("\n");

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", `macrominded-payments-${new Date().toISOString().split("T")[0]}.csv`);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setTimeout(() => {
        setExporting(false);
        onClose();
      }, 500);
    } catch (error) {
      console.error("Error exporting CSV:", error);
      setExporting(false);
    }
  };

  const exportPDF = async () => {
    setExporting(true);
    try {
      // Check if jsPDF is available
      let jsPDF;
      try {
        const module = await import("jspdf");
        // Handle both ESM and CJS exports
        jsPDF = module.default || (module as any).jsPDF || module;
        if (typeof jsPDF !== "function" && jsPDF?.jsPDF) {
          jsPDF = jsPDF.jsPDF;
        }
      } catch (error) {
        console.error("Failed to load jsPDF:", error);
        alert("PDF export is currently unavailable. Please use CSV export instead.");
        setExporting(false);
        return;
      }
      
      if (!jsPDF || typeof jsPDF !== "function") {
        alert("PDF export is currently unavailable. Please use CSV export instead.");
        setExporting(false);
        return;
      }
      
      const doc = new jsPDF();

      // Header
      doc.setFontSize(20);
      doc.setTextColor(255, 46, 46); // #FF2E2E
      doc.text("MacroMinded Payments Report", 14, 20);
      doc.setFontSize(10);
      doc.setTextColor(128, 128, 128);
      doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 28);

      // Table headers
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      let y = 40;
      doc.text("Date", 14, y);
      doc.text("User", 50, y);
      doc.text("Plan", 90, y);
      doc.text("Amount", 120, y);
      doc.text("Status", 150, y);

      // Table rows
      y += 8;
      payments.slice(0, 20).forEach((payment) => {
        if (y > 280) {
          doc.addPage();
          y = 20;
        }
        doc.setFontSize(8);
        doc.text(formatDate(payment.createdAt).substring(0, 12), 14, y);
        doc.text((payment.userName || "Unknown").substring(0, 15), 50, y);
        doc.text((payment.planType || "Basic").substring(0, 10), 90, y);
        doc.text(`$${payment.amount}`, 120, y);
        doc.text((payment.status || "completed").substring(0, 10), 150, y);
        y += 6;
      });

      doc.save(`macrominded-payments-${new Date().toISOString().split("T")[0]}.pdf`);
      setTimeout(() => {
        setExporting(false);
        onClose();
      }, 500);
    } catch (error) {
      console.error("Error exporting PDF:", error);
      setExporting(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-40"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="fixed bottom-6 right-6 bg-[#151515] border border-[#222] rounded-2xl p-4 shadow-2xl z-50 min-w-[200px]"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Export Data</h3>
              <button
                onClick={onClose}
                className="p-1 rounded-lg hover:bg-[#222] text-gray-400 hover:text-white transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-2">
              <button
                onClick={exportCSV}
                disabled={exporting}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-[#222] hover:bg-[#FF2E2E]/20 border border-[#222] hover:border-[#FF2E2E]/50 text-white transition-colors disabled:opacity-50"
              >
                <FileSpreadsheet className="h-5 w-5" />
                <span>Download CSV</span>
              </button>
              <button
                onClick={exportPDF}
                disabled={exporting}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-[#222] hover:bg-[#FF2E2E]/20 border border-[#222] hover:border-[#FF2E2E]/50 text-white transition-colors disabled:opacity-50"
              >
                <FileText className="h-5 w-5" />
                <span>Download PDF</span>
              </button>
            </div>
            {exporting && (
              <div className="mt-4 text-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#FF2E2E] mx-auto"></div>
                <p className="text-xs text-gray-400 mt-2">Exporting...</p>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

