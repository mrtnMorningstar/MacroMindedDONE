"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home,
  FileText,
  MessageSquare,
  CreditCard,
  Crown,
  Menu,
  X,
  LayoutDashboard,
  Users,
  Settings,
} from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { cn } from "@/lib/utils";
import { isAdminUser } from "@/lib/utils/admin";

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  public?: boolean;
  admin?: boolean;
}

const publicNavItems: NavItem[] = [
  { href: "/", label: "Home", icon: Home, public: true },
  { href: "/plans", label: "Plans", icon: Crown, public: true },
  { href: "/blog", label: "Blog", icon: FileText, public: true },
  { href: "/contact", label: "Contact", icon: MessageSquare, public: true },
];

const dashboardNavItems: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/plan", label: "My Plan", icon: FileText },
  { href: "/dashboard/chat", label: "Chat", icon: MessageSquare },
  { href: "/dashboard/payments", label: "Payments", icon: CreditCard },
  { href: "/plans", label: "Upgrade", icon: Crown },
];

const adminNavItems: NavItem[] = [
  { href: "/admin", label: "Admin", icon: Users, admin: true },
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
];

export function GlobalSidebar() {
  const pathname = usePathname();
  const { user, userData } = useAuth();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Determine which nav items to show
  const isAdminRoute = pathname?.startsWith("/admin");
  const isDashboardRoute = pathname?.startsWith("/dashboard");
  const isPublicRoute = !isAdminRoute && !isDashboardRoute;

  const navItems = isAdminRoute
    ? adminNavItems
    : isDashboardRoute
    ? dashboardNavItems
    : publicNavItems;

  // Check if user is admin
  const isAdmin = isAdminUser(user, userData);

  // Handle responsive collapse (icon-only on mobile)
  useEffect(() => {
    const checkWidth = () => {
      setIsCollapsed(window.innerWidth < 1024);
    };
    checkWidth();
    window.addEventListener("resize", checkWidth);
    return () => window.removeEventListener("resize", checkWidth);
  }, []);

  const handleLogout = async () => {
    const { logout } = await import("@/lib/firebase/auth");
    await logout();
    window.location.href = "/";
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <motion.aside
        animate={{
          x: isCollapsed && !isMobileOpen ? -280 : 0,
        }}
        initial={false}
        className={cn(
          "hidden lg:flex fixed lg:sticky top-0 left-0 h-screen w-[280px] z-40",
          "bg-gradient-to-b from-[#0b0b0b] to-[#1a1a1a]",
          "border-r border-[#222]",
          "lg:translate-x-0 lg:flex-shrink-0"
        )}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
      >
        <div className="flex flex-col h-full p-4">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <Link href="/" className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#FF2E2E] to-[#FF5555] flex items-center justify-center">
                <span className="text-white font-black text-xl">M</span>
              </div>
              <span className="text-xl font-black text-white">MacroMinded</span>
            </Link>
          </motion.div>

          {/* Navigation */}
          <nav className="flex-1 space-y-2">
            {navItems.map((item, index) => {
              // Filter admin items
              if (item.admin && !isAdmin) return null;
              
              const Icon = item.icon;
              const isActive =
                pathname === item.href || pathname?.startsWith(item.href + "/");

              return (
                <motion.div
                  key={item.href}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Link
                    href={item.href}
                    onClick={() => setIsMobileOpen(false)}
                    className={cn(
                      "relative flex items-center gap-3 px-4 py-3 rounded-lg transition-all group",
                      "hover:bg-[#1a1a1a]",
                      isActive
                        ? "text-white"
                        : "text-gray-400 hover:text-white"
                    )}
                  >
                    {/* Active indicator bar (desktop) */}
                    {isActive && (
                      <motion.div
                        layoutId="active-sidebar-indicator"
                        className="absolute left-0 top-0 bottom-0 w-1 bg-[#FF2E2E] rounded-r-full hidden lg:block"
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      />
                    )}
                    <Icon className="h-5 w-5 flex-shrink-0" />
                    <span className="font-medium hide-text-mobile">{item.label}</span>
                  </Link>
                </motion.div>
              );
            })}
          </nav>

          {/* User Section / Upgrade CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-auto space-y-2"
          >
            {user ? (
              <>
                {isDashboardRoute && (
                  <Link
                    href="/plans"
                    className="block p-4 rounded-lg bg-gradient-to-r from-[#FF2E2E] to-[#FF5555] text-white text-center font-bold hover:shadow-lg shadow-[#FF2E2E]/50 transition-all"
                  >
                    Upgrade to Elite
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="w-full px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link
                href="/auth/login"
                className="block p-4 rounded-lg bg-gradient-to-r from-[#FF2E2E] to-[#FF5555] text-white text-center font-bold hover:shadow-lg shadow-[#FF2E2E]/50 transition-all"
              >
                Sign In
              </Link>
            )}
          </motion.div>
        </div>
      </motion.aside>

      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#0b0b0b]/80 backdrop-blur-lg border-t border-[#222]/50">
        <div className="flex items-center justify-around h-16 px-2">
          {navItems.slice(0, 5).map((item) => {
            if (item.admin && !isAdmin) return null;
            
            const Icon = item.icon;
            const isActive =
              pathname === item.href || pathname?.startsWith(item.href + "/");

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative flex flex-col items-center justify-center flex-1 h-full transition-colors",
                  isActive ? "text-[#FF2E2E]" : "text-gray-400"
                )}
              >
                <Icon className="h-5 w-5 mb-1" />
                {/* Active indicator dot */}
                {isActive && (
                  <motion.div
                    layoutId="mobile-active-dot"
                    className="absolute bottom-1 w-1.5 h-1.5 bg-[#FF2E2E] rounded-full"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}

