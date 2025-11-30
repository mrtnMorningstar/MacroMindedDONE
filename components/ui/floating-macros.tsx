"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";

interface MacroIcon {
  emoji: string;
  label: string;
  color: string;
}

const macros: MacroIcon[] = [
  { emoji: "🥩", label: "Protein", color: "#FF2E2E" },
  { emoji: "🍞", label: "Carbs", color: "#FFA500" },
  { emoji: "🥑", label: "Fats", color: "#FFD700" },
];

export function FloatingMacros() {
  const [positions, setPositions] = useState<Array<{ x: number; y: number }>>([]);

  useEffect(() => {
    // Generate random positions for each macro icon
    const newPositions = macros.map(() => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
    }));
    setPositions(newPositions);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {macros.map((macro, index) => (
        <motion.div
          key={macro.label}
          className="absolute opacity-10"
          style={{
            left: `${positions[index]?.x || 0}%`,
            top: `${positions[index]?.y || 0}%`,
          }}
          animate={{
            y: [0, -30, 0],
            x: [0, Math.sin(index) * 20, 0],
            rotate: [0, 15, -15, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 4 + index,
            repeat: Infinity,
            ease: "easeInOut",
            delay: index * 0.5,
          }}
        >
          <div className="text-6xl md:text-8xl" style={{ filter: `drop-shadow(0 0 10px ${macro.color})` }}>
            {macro.emoji}
          </div>
        </motion.div>
      ))}
    </div>
  );
}

