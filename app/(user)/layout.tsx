"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import "@/app/globals.css";
import { ChatWidget } from "@/components/chat/chat-widget";

export default function UserLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  const navItems = [
    ["Overview", "/dashboard"],
    ["My Plan", "/dashboard/plan"],
    ["Chat", "/dashboard/chat"],
    ["Progress", "/dashboard/progress"],
    ["Payments", "/dashboard/payments"],
    ["Insights", "/dashboard/insights"],
    ["Settings", "/dashboard/settings"],
  ];

  return (
    <div className="min-h-screen bg-[#0b0b0b] text-white">
      <header className="sticky top-0 z-40 border-b border-[#1f1f1f] bg-gradient-to-b from-[#0b0b0b]/95 to-[#0b0b0b]/80 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
          <Link href="/" className="text-lg font-black transition-all duration-200 hover:opacity-80">
            <span className="text-white">Macro</span>
            <span className="text-[#FF2E2E]">Minded</span>
          </Link>
          <nav className="flex items-center gap-2 text-sm">
            {navItems.map(([label, href]) => {
              const isActive = pathname === href || (href !== "/dashboard" && pathname?.startsWith(href));
              return (
                <Link
                  key={href}
                  href={href}
                  className="relative rounded-md px-3 py-1.5 transition-all duration-200 hover:text-[#FF2E2E]"
                >
                  <span className={isActive ? "text-[#FF2E2E]" : "text-white"}>
                    {label}
                  </span>
                  {isActive && (
                    <motion.div
                      layoutId="activeNavIndicator"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#FF2E2E]"
                      initial={false}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>
      <ChatWidget />
    </div>
  );
}

