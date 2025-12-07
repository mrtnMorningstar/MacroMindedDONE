"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost";
  glow?: boolean;
}

export function AdminButton({
  children,
  className,
  variant = "primary",
  glow = false,
  ...props
}: ButtonProps) {
  const baseStyles = "px-6 py-3 rounded-lg font-medium transition-all duration-300";
  const variants = {
    primary: "bg-[#FF2E2E] hover:bg-[#FF2E2E]/90 text-white",
    secondary: "bg-[#151515] border border-[#222] hover:border-[#FF2E2E] text-white",
    ghost: "hover:bg-[#222] text-gray-400 hover:text-white",
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        baseStyles,
        variants[variant],
        glow && "shadow-[0_0_20px_rgba(255,46,46,0.3)]",
        className
      )}
      {...props}
    >
      {children}
    </motion.button>
  );
}

