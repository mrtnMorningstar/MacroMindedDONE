"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { motion } from "framer-motion";
import { Menu, X, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/auth-context";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuth();
  const pathname = usePathname();

  const handleLogout = async () => {
    const { logout } = await import("@/lib/firebase/auth");
    await logout();
    window.location.href = "/";
  };

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/plans", label: "Plans" },
    { href: "/blog", label: "Blog" },
    { href: "/contact", label: "Contact" },
  ];

  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="sticky top-0 z-50 w-full border-b border-[#222] bg-[#111]/95 backdrop-blur-md"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <motion.span
              className="text-2xl font-bold text-white"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Macro<span className="text-[#FF2E2E]">Minded</span>
            </motion.span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link key={link.href} href={link.href}>
                  <motion.div
                    className={`relative px-4 py-2 text-sm font-medium text-white transition-colors ${
                      isActive
                        ? "text-[#FF2E2E]"
                        : "hover:text-[#FF2E2E]"
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {link.label}
                    {isActive && (
                      <motion.div
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#FF2E2E]"
                        layoutId="navbar-indicator"
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      />
                    )}
                  </motion.div>
                </Link>
              );
            })}
            {user ? (
              <>
                <Link href="/dashboard" className="ml-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-white hover:text-[#FF2E2E] hover:bg-[#222]"
                  >
                    <User className="mr-2 h-4 w-4" />
                    Dashboard
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  className="ml-2 border-[#222] text-white hover:bg-[#FF2E2E] hover:border-[#FF2E2E]"
                >
                  Logout
                </Button>
              </>
            ) : (
              <Link href="/auth/login" className="ml-4">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-[#222] text-white hover:bg-[#FF2E2E] hover:border-[#FF2E2E]"
                >
                  Sign In
                </Button>
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-white hover:text-[#FF2E2E] transition-colors"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            {isOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden py-4 space-y-2 border-t border-[#222]"
          >
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`block px-4 py-2 text-sm font-medium transition-colors ${
                  pathname === link.href
                    ? "text-[#FF2E2E]"
                    : "text-white hover:text-[#FF2E2E]"
                }`}
                onClick={() => setIsOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            {user ? (
              <>
                <Link
                  href="/dashboard"
                  onClick={() => setIsOpen(false)}
                  className="block px-4 py-2"
                >
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full text-white hover:text-[#FF2E2E] hover:bg-[#222]"
                  >
                    <User className="mr-2 h-4 w-4" />
                    Dashboard
                  </Button>
                </Link>
                <div className="px-4">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full border-[#222] text-white hover:bg-[#FF2E2E] hover:border-[#FF2E2E]"
                    onClick={handleLogout}
                  >
                    Logout
                  </Button>
                </div>
              </>
            ) : (
              <div className="px-4">
                <Link href="/auth/login" onClick={() => setIsOpen(false)}>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full border-[#222] text-white hover:bg-[#FF2E2E] hover:border-[#FF2E2E]"
                  >
                    Sign In
                  </Button>
                </Link>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </motion.nav>
  );
}

