"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { LogOut, MessageSquare, LineChart, Wallet, Brain, Settings, LayoutDashboard } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase/config";
import { useRouter } from "next/navigation";

const navLinks = [
  { name: "Overview", href: "/dashboard/overview", icon: LayoutDashboard },
  { name: "My Plan", href: "/dashboard/plan", icon: Brain },
  { name: "Chat", href: "/dashboard/chat", icon: MessageSquare },
  { name: "Progress", href: "/dashboard/progress", icon: LineChart },
  { name: "Payments", href: "/dashboard/payments", icon: Wallet },
  { name: "Insights", href: "/dashboard/insights", icon: Brain },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const { user } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push("/");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-b from-[#0A0A0A] to-[#141414] text-white">
      {/* Sidebar */}
      <motion.aside
        initial={{ x: -50, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
        className={cn(
          "fixed left-0 top-0 h-full backdrop-blur-xl border-r border-white/10 bg-white/5 shadow-2xl flex flex-col justify-between transition-all z-50",
          collapsed ? "w-[80px]" : "w-[240px]"
        )}
      >
        <div className="p-4 space-y-4">
          <motion.h1
            layout
            className={cn(
              "font-extrabold text-2xl text-[#FF2E2E] tracking-tight transition-all",
              collapsed && "text-center text-lg"
            )}
          >
            {collapsed ? "M" : "MacroMinded"}
          </motion.h1>

          <nav className="space-y-1">
            {navLinks.map(({ name, href, icon: Icon }) => {
              const active = pathname === href || (href !== "/dashboard/overview" && pathname?.startsWith(href));
              return (
                <Link key={name} href={href}>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-xl transition-all cursor-pointer",
                      active
                        ? "bg-[#FF2E2E]/20 text-[#FF2E2E]"
                        : "text-gray-400 hover:text-white hover:bg-white/5"
                    )}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    {!collapsed && <span className="text-sm font-medium">{name}</span>}
                  </motion.div>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="p-4 border-t border-white/10 flex items-center justify-between">
          <motion.button
            onClick={() => setCollapsed(!collapsed)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="text-gray-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-white/5"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? "»" : "«"}
          </motion.button>

          {!collapsed && (
            <motion.button
              onClick={handleLogout}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="text-[#FF2E2E] hover:text-white flex items-center gap-2 text-sm transition-colors"
            >
              <LogOut className="w-4 h-4" /> Logout
            </motion.button>
          )}
        </div>
      </motion.aside>

      {/* Main Content */}
      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className={cn(
          "flex-1 ml-[240px] p-8 transition-all duration-300",
          collapsed && "ml-[80px]"
        )}
      >
        {children}
      </motion.main>
    </div>
  );
}

