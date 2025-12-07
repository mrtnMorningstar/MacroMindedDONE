"use client";

import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Users,
  FileText,
  CreditCard,
  Brain,
  Settings,
  Menu,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/admin" },
  { icon: Users, label: "Users", path: "/admin/users" },
  { icon: FileText, label: "Plans", path: "/admin/plans" },
  { icon: CreditCard, label: "Payments", path: "/admin/payments" },
  { icon: Brain, label: "Insights", path: "/admin/insights" },
  { icon: Settings, label: "Settings", path: "/admin/settings" },
];

export function Sidebar({ isOpen, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <>
      {/* Mobile Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={onToggle}
          />
        )}
      </AnimatePresence>

      {/* Floating Toggle Button (when sidebar is closed) */}
      {!isOpen && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          onClick={onToggle}
          className="fixed top-1/2 left-4 -translate-y-1/2 z-50 lg:left-6 p-3 rounded-lg bg-[#151515] border border-[#222] hover:bg-[#1a1a1a] hover:border-[#FF2E2E] text-gray-400 hover:text-white transition-all shadow-lg"
          aria-label="Open sidebar"
        >
          <Menu className="h-5 w-5" />
        </motion.button>
      )}

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{
          width: isOpen ? 280 : 0,
        }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className={cn(
          "fixed lg:static inset-y-0 left-0 z-40",
          "bg-gradient-to-b from-[#0b0b0b] to-[#151515]",
          "border-r border-[#222]",
          "overflow-hidden",
          isOpen ? "w-[280px]" : "w-0 lg:w-20"
        )}
      >
        <div className="h-full flex flex-col">
          {/* Logo & Toggle */}
          <div className="p-6 border-b border-[#222] flex items-center justify-between min-h-[80px]">
            {isOpen && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex items-center gap-2"
              >
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#FF2E2E] to-[#7b0000] flex items-center justify-center">
                  <span className="text-white font-bold text-sm">M</span>
                </div>
                <span className="text-white font-semibold text-lg">Admin</span>
              </motion.div>
            )}
            <button
              onClick={onToggle}
              className={cn(
                "p-2 rounded-lg hover:bg-[#222] text-gray-400 hover:text-white transition-colors",
                "flex-shrink-0",
                !isOpen && "lg:mx-auto"
              )}
              aria-label={isOpen ? "Close sidebar" : "Open sidebar"}
            >
              {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>

          {/* Menu Items */}
          <nav className={cn("flex-1 p-4 space-y-2 overflow-y-auto", !isOpen && "lg:px-2")}>
            {menuItems.map((item, index) => {
              const Icon = item.icon;
              const isActive = pathname === item.path || pathname?.startsWith(item.path + "/");

              return (
                <motion.button
                  key={item.path}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => {
                    router.push(item.path);
                    if (window.innerWidth < 1024) {
                      onToggle();
                    }
                  }}
                  className={cn(
                    "w-full flex items-center gap-3 rounded-lg",
                    "text-left transition-all duration-300",
                    isOpen ? "px-4 py-3" : "lg:px-2 lg:py-3 px-4 py-3",
                    "hover:bg-[#1a1a1a] hover:border-l-4 hover:border-[#FF2E2E]",
                    isActive
                      ? "bg-[#1a1a1a] border-l-4 border-[#FF2E2E] text-white shadow-[0_0_20px_rgba(255,46,46,0.2)]"
                      : "text-gray-400 hover:text-white"
                  )}
                  title={!isOpen ? item.label : undefined}
                >
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  {isOpen && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="font-medium"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </motion.button>
              );
            })}
          </nav>
        </div>
      </motion.aside>
    </>
  );
}

