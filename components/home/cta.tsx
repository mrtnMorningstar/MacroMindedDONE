"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { ArrowRight, Zap } from "lucide-react";

export function CTA() {
  return (
    <section className="py-24 bg-gradient-to-b from-[#000] to-[#111] relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#FF2E2E]/10 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <ScrollReveal className="bg-gradient-to-br from-[#111] to-[#222] rounded-3xl p-12 md:p-16 text-center border border-[#333] shadow-2xl">
          <motion.div
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            transition={{ type: "spring", delay: 0.2 }}
            className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[#FF2E2E]/20 mb-6"
          >
            <Zap className="h-10 w-10 text-[#FF2E2E]" />
          </motion.div>

          <motion.h2
            className="text-4xl md:text-6xl font-black mb-6 text-white"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
          >
            Ready to Transform Your{" "}
            <span className="text-[#FF2E2E]">Nutrition?</span>
          </motion.h2>

          <motion.p
            className="text-lg md:text-xl text-gray-400 mb-10 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
          >
            Join thousands of clients who have achieved their goals with MacroMinded.
            Start your journey today.
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row gap-6 justify-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
          >
            <Link href="/plans">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  size="lg"
                  className="group bg-[#FF2E2E] hover:bg-[#FF2E2E]/90 text-white text-lg px-10 py-7 rounded-lg shadow-lg shadow-[#FF2E2E]/50"
                >
                  View Plans
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </motion.div>
            </Link>
            <Link href="/contact">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  size="lg"
                  variant="outline"
                  className="border-2 border-[#333] text-white hover:bg-[#222] hover:border-[#FF2E2E] text-lg px-10 py-7 rounded-lg"
                >
                  Get Started
                </Button>
              </motion.div>
            </Link>
          </motion.div>
        </ScrollReveal>
      </div>
    </section>
  );
}
