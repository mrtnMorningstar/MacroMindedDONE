"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { PlanCard, Plan } from "@/components/plans/plan-card";
import { Input } from "@/components/ui/input";
import { Tag } from "lucide-react";

const plans: Plan[] = [
  {
    id: "basic",
    name: "Basic",
    price: 49,
    description: "Perfect for getting started on your nutrition journey",
    features: [
      { text: "Custom Meal Plan", icon: "🥗" },
      { text: "7-day meal schedule", icon: "📅" },
      { text: "Macro breakdown", icon: "📊" },
      { text: "Email support", icon: "📞" },
    ],
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_BASIC_PRICE_ID || "",
  },
  {
    id: "pro",
    name: "Pro",
    price: 99,
    description: "Most popular choice for serious results",
    features: [
      { text: "Everything in Basic", icon: "✅" },
      { text: "14-day meal schedule", icon: "📅" },
      { text: "Recipe collection", icon: "📖" },
      { text: "Priority email support", icon: "📞" },
      { text: "1 revision included", icon: "🔁" },
    ],
    popular: true,
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID || "",
  },
  {
    id: "elite",
    name: "Elite",
    price: 149,
    description: "Complete nutrition solution with ongoing support",
    features: [
      { text: "Everything in Pro", icon: "✅" },
      { text: "30-day meal schedule", icon: "📅" },
      { text: "Full recipe database", icon: "📚" },
      { text: "Direct chat support", icon: "💬" },
      { text: "Unlimited revisions", icon: "🔁" },
      { text: "Progress tracking", icon: "📈" },
    ],
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_ELITE_PRICE_ID || "",
  },
];

export default function PlansPage() {
  const [coupon, setCoupon] = useState("");

  return (
    <div className="min-h-screen py-20 bg-gradient-to-b from-[#000] via-[#111] to-[#000]">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#FF2E2E]/10 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            x: [0, 50, 0],
            y: [0, 30, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#FF2E2E]/5 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.3, 1],
            x: [0, -50, 0],
            y: [0, -30, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
        />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <motion.h1
            className="text-5xl md:text-7xl font-black mb-6 text-white"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
          >
            Choose Your <span className="text-[#FF2E2E]">Plan</span>
          </motion.h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-8">
            Select the perfect meal plan to help you achieve your goals
          </p>

          {/* Coupon Code Input */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="max-w-md mx-auto"
          >
            <div className="relative">
              <Tag className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
              <Input
                id="coupon-code"
                name="coupon-code"
                type="text"
                placeholder="Enter coupon code (optional)"
                value={coupon}
                onChange={(e) => setCoupon(e.target.value.toUpperCase())}
                className="pl-12 bg-[#111] border-[#333] text-white placeholder:text-gray-500 focus:border-[#FF2E2E] h-12 text-center"
              />
            </div>
            {coupon && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-sm text-[#FF2E2E] mt-2"
              >
                Coupon code: {coupon}
              </motion.p>
            )}
          </motion.div>
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
          {plans.map((plan, index) => (
            <PlanCard key={plan.id} plan={plan} index={index} coupon={coupon} />
          ))}
        </div>

        {/* Additional Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6 }}
          className="mt-16 text-center"
        >
          <p className="text-gray-400 text-sm">
            All plans include a one-time payment. No recurring charges.
          </p>
          <p className="text-gray-500 text-xs mt-2">
            Secure payment powered by Stripe
          </p>
        </motion.div>
      </div>
    </div>
  );
}
