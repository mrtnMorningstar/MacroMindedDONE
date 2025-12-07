"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";

export function Hero() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 500], [0, 200]);
  const opacity = useTransform(scrollY, [0, 400], [1, 0]);
  const scale = useTransform(scrollY, [0, 500], [1, 0.8]);
  const backgroundY = useTransform(scrollY, [0, 500], [0, 100]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth - 0.5) * 20,
        y: (e.clientY / window.innerHeight - 0.5) * 20,
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-gradient-to-b from-[#000] via-[#111] to-[#000] py-24">
      {/* Animated 3D Background Elements with Parallax */}
      <motion.div 
        className="absolute inset-0 -z-10 overflow-hidden"
        style={{ y: backgroundY }}
      >
        <motion.div
          className="absolute top-20 left-10 w-96 h-96 bg-[#FF2E2E]/20 rounded-full blur-3xl"
          animate={{
            x: [0, 50, 0],
            y: [0, 30, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-20 right-10 w-[500px] h-[500px] bg-[#FF2E2E]/10 rounded-full blur-3xl"
          animate={{
            x: [0, -50, 0],
            y: [0, -30, 0],
            scale: [1, 1.3, 1],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#FF2E2E]/5 rounded-full blur-3xl"
          animate={{
            rotate: [0, 360],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      </motion.div>

      {/* Floating Macro Icons - Protein, Carbs, Fats */}
      {[
        { emoji: "🥩", label: "Protein", x: 10, y: 20 },
        { emoji: "🍞", label: "Carbs", x: 30, y: 60 },
        { emoji: "🥑", label: "Fats", x: 70, y: 30 },
        { emoji: "🥗", label: "Veggies", x: 50, y: 70 },
        { emoji: "💪", label: "Strength", x: 80, y: 50 },
      ].map((macro, i) => (
        <motion.div
          key={macro.label}
          className="absolute text-5xl md:text-6xl opacity-15"
          style={{
            left: `${macro.x}%`,
            top: `${macro.y}%`,
            filter: "drop-shadow(0 0 20px rgba(255, 46, 46, 0.3))",
          }}
          animate={{
            y: [0, -40, 0],
            x: [0, Math.sin(i) * 30, 0],
            rotate: [0, 20, -20, 0],
            scale: [1, 1.3, 1],
          }}
          transition={{
            duration: 5 + i * 0.5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.3,
          }}
        >
          {macro.emoji}
        </motion.div>
      ))}

      <motion.div
        style={{ y, opacity, scale }}
        className="container mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10"
      >
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          {/* Animated Logo */}
          <motion.div
            className="mb-8"
            style={{
              transform: `perspective(1000px) rotateY(${mousePosition.x}deg) rotateX(${-mousePosition.y}deg)`,
            }}
          >
            <motion.h1
              className="text-6xl md:text-8xl lg:text-9xl font-black mb-6"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <span className="text-white">Macro</span>
              <motion.span
                className="text-[#FF2E2E] inline-block"
                animate={{
                  textShadow: [
                    "0 0 20px rgba(255, 46, 46, 0.5)",
                    "0 0 40px rgba(255, 46, 46, 0.8)",
                    "0 0 20px rgba(255, 46, 46, 0.5)",
                  ],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                Minded
              </motion.span>
            </motion.h1>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="flex items-center justify-center gap-2 mb-6"
          >
            <Sparkles className="h-6 w-6 text-[#FF2E2E]" />
            <motion.p
              className="text-2xl md:text-3xl font-bold text-white"
              animate={{
                opacity: [0.7, 1, 0.7],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              Real Plans. Real Results.
            </motion.p>
            <Sparkles className="h-6 w-6 text-[#FF2E2E]" />
          </motion.div>

          <motion.p
            className="text-lg md:text-xl text-gray-400 mb-12 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
          >
            Professional custom meal plans created by nutrition experts to help you lose, gain, or maintain weight.
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row gap-6 justify-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.6 }}
          >
            <Link href="/plans">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  size="lg"
                  className="group macro-gradient hover:macro-glow text-white text-lg px-8 py-6 rounded-lg transition-all duration-300"
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
                  className="border-2 border-[#222] text-white hover:bg-[#222] hover:border-[#FF2E2E] text-lg px-8 py-6 rounded-lg"
                >
                  Get Started
                </Button>
              </motion.div>
            </Link>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Scroll Indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
        animate={{
          y: [0, 10, 0],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <div className="w-6 h-10 border-2 border-gray-600 rounded-full flex justify-center p-2">
          <motion.div
            className="w-1 h-3 bg-[#FF2E2E] rounded-full"
            animate={{
              y: [0, 12, 0],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </div>
      </motion.div>
    </section>
  );
}
