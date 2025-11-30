"use client";

import { useState } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Sparkles, Zap } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { loadStripe } from "@stripe/stripe-js";

// Lazy load Stripe to avoid blocking initial render
let stripePromise: Promise<any> | null = null;
const getStripe = () => {
  if (typeof window === "undefined") return null;
  if (!stripePromise) {
    const key = process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY || process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "";
    if (!key) {
      console.error("Stripe public key is missing!");
      return null;
    }
    stripePromise = loadStripe(key);
  }
  return stripePromise;
};

export interface Plan {
  id: string;
  name: string;
  price: number;
  description: string;
  features: Array<{
    text: string;
    icon: string;
  }>;
  popular?: boolean;
  stripePriceId: string;
}

interface PlanCardProps {
  plan: Plan;
  index: number;
  coupon?: string;
}

export function PlanCard({ plan, index, coupon }: PlanCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  // 3D Tilt Effect
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 500, damping: 100 });
  const mouseYSpring = useSpring(y, { stiffness: 500, damping: 100 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["7.5deg", "-7.5deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-7.5deg", "7.5deg"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    // Don't interfere with button interactions - check target first
    const target = e.target as HTMLElement;
    const button = target.closest("button");
    const footer = target.closest('[data-footer-area]');
    
    if (button || target.tagName === "BUTTON" || footer) {
      // Reset tilt when over button or footer area
      x.set(0);
      y.set(0);
      return;
    }
    
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    // Don't apply tilt if mouse is in bottom 35% (footer area)
    if (mouseY / height > 0.65) {
      x.set(0);
      y.set(0);
      return;
    }
    
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
    setIsHovered(false);
  };

  const handleGetStarted = async (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    console.log("handleGetStarted called!", { plan: plan.name, user: user?.uid, isProcessing });
    
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to continue with checkout.",
        variant: "destructive",
      });
      router.push(`/auth/login?redirect=/plans`);
      return;
    }

    setIsProcessing(true);

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planId: plan.stripePriceId,
          userId: user.uid,
          coupon: coupon || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create checkout session");
      }

      // The API returns { url: session.url }
      if (data.url) {
        // Redirect directly to Stripe checkout URL
        window.location.href = data.url;
      } else if (data.sessionId) {
        // Fallback: Use Stripe.js redirect if sessionId is provided
        const stripe = await getStripe();
        if (!stripe) throw new Error("Stripe failed to load");
        await stripe.redirectToCheckout({ sessionId: data.sessionId });
      } else {
        throw new Error("Failed to create checkout session - no URL or sessionId returned");
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to start checkout. Please try again.",
        variant: "destructive",
      });
      setIsProcessing(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        delay: index * 0.15,
        duration: 0.6,
        type: "spring",
        stiffness: 100,
      }}
      className="relative"
      onMouseMove={(e) => {
        // Check if mouse is in footer area before handling
        const rect = e.currentTarget.getBoundingClientRect();
        const mouseY = e.clientY - rect.top;
        const height = rect.height;
        
        // If mouse is in bottom 35% (footer area), don't handle tilt
        if (mouseY / height > 0.65) {
          const target = e.target as HTMLElement;
          if (target.tagName === "BUTTON" || target.closest("button") || target.closest('[data-footer-area]')) {
            e.stopPropagation();
            return;
          }
        }
        
        handleMouseMove(e);
      }}
      onMouseLeave={handleMouseLeave}
      onMouseEnter={() => setIsHovered(true)}
      style={{
        perspective: "1000px",
      }}
    >
      {plan.popular && (
        <motion.div
          className="absolute -top-5 left-1/2 -translate-x-1/2 z-10"
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: index * 0.15 + 0.3, type: "spring" }}
        >
          <div className="bg-gradient-to-r from-[#FF2E2E] to-[#FF5555] text-white px-6 py-2 rounded-full text-sm font-bold shadow-lg shadow-[#FF2E2E]/50 flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Most Popular
          </div>
        </motion.div>
      )}

      <motion.div
        style={{
          rotateX,
          rotateY,
          transformStyle: "preserve-3d",
        }}
        whileHover={{
          scale: 1.03,
          z: 50,
        }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="relative"
        onPointerDown={(e) => {
          const target = e.target as HTMLElement;
          if (target.tagName === "BUTTON" || target.closest("button")) {
            console.log("Motion div detected button pointerdown, allowing through");
            return;
          }
          e.stopPropagation();
        }}
      >
        <Card
          className={`h-full bg-gradient-to-br from-[#111] to-[#222] border-2 transition-all duration-300 relative ${
            plan.popular
              ? "border-[#FF2E2E] shadow-2xl shadow-[#FF2E2E]/20"
              : "border-[#333] hover:border-[#FF2E2E]/50"
          }`}
        >
          <CardHeader className="relative overflow-hidden">
            {/* Animated Background Gradient */}
            <motion.div
              className={`absolute inset-0 bg-gradient-to-br from-[#FF2E2E]/10 to-transparent pointer-events-none ${
                isHovered ? "opacity-100" : "opacity-0"
              } transition-opacity duration-300`}
            />

            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <CardTitle className="text-3xl font-black text-white">
                  {plan.name}
                </CardTitle>
                {plan.popular && (
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Sparkles className="h-6 w-6 text-[#FF2E2E]" />
                  </motion.div>
                )}
              </div>
              <CardDescription className="text-gray-400 text-base mb-6">
                {plan.description}
              </CardDescription>
              <div className="mb-6">
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-black text-white">${plan.price}</span>
                  <span className="text-gray-500 text-sm">one-time</span>
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            <ul className="space-y-4">
              {plan.features.map((feature, idx) => (
                <motion.li
                  key={idx}
                  className="flex items-start gap-3"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.15 + idx * 0.1 }}
                >
                  <motion.div
                    className="flex-shrink-0 w-6 h-6 rounded-full bg-[#FF2E2E]/20 flex items-center justify-center mt-0.5"
                    whileHover={{ scale: 1.2, rotate: 360 }}
                    transition={{ duration: 0.3 }}
                  >
                    <span className="text-lg">{feature.icon}</span>
                  </motion.div>
                  <span className="text-white text-sm leading-relaxed">
                    {feature.text}
                  </span>
                </motion.li>
              ))}
            </ul>
          </CardContent>

          <CardFooter className="pt-6">
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log("Button clicked!", plan.name);
                if (!isProcessing) {
                  handleGetStarted(e);
                }
              }}
              disabled={isProcessing}
              className={`w-full text-lg py-6 font-bold cursor-pointer rounded-md transition-colors ${
                isProcessing 
                  ? "opacity-50 cursor-not-allowed" 
                  : ""
              } ${
                plan.popular
                  ? "bg-[#FF2E2E] hover:bg-[#FF2E2E]/90 text-white shadow-lg shadow-[#FF2E2E]/50"
                  : "bg-[#222] hover:bg-[#FF2E2E] text-white border border-[#333] hover:border-[#FF2E2E]"
              }`}
              type="button"
            >
              {isProcessing ? "Processing..." : "Get Started →"}
            </button>
          </CardFooter>
        </Card>
      </motion.div>
    </motion.div>
  );
}
