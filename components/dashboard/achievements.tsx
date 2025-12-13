"use client";

import { motion } from "framer-motion";
import { Trophy, Flame, Star, Zap, Medal } from "lucide-react";

interface Achievement {
  icon: React.ReactNode;
  text: string;
  color: string;
}

export function Achievements({ streak, progress }: { streak: number; progress: number }) {
  const achievements: Achievement[] = [];

  if (streak >= 3) {
    achievements.push({
      icon: <Flame className="w-6 h-6" />,
      text: "🔥 3-Day Streak",
      color: "text-[#FF2E2E]",
    });
  }
  if (streak >= 7) {
    achievements.push({
      icon: <Zap className="w-6 h-6" />,
      text: "⚡ 7-Day Streak",
      color: "text-[#FFD60A]",
    });
  }
  if (streak >= 14) {
    achievements.push({
      icon: <Zap className="w-6 h-6" />,
      text: "⚡ 14-Day Streak",
      color: "text-[#00FF94]",
    });
  }
  if (streak >= 30) {
    achievements.push({
      icon: <Trophy className="w-6 h-6" />,
      text: "🏆 30-Day Streak",
      color: "text-[#FF2E2E]",
    });
  }
  if (progress >= 25) {
    achievements.push({
      icon: <Medal className="w-6 h-6" />,
      text: "🏅 25% Goal Achieved",
      color: "text-[#FFD60A]",
    });
  }
  if (progress >= 50) {
    achievements.push({
      icon: <Star className="w-6 h-6" />,
      text: "🌟 Halfway There",
      color: "text-[#00FF94]",
    });
  }
  if (progress >= 75) {
    achievements.push({
      icon: <Star className="w-6 h-6" />,
      text: "⭐ Almost There",
      color: "text-[#FF2E2E]",
    });
  }
  if (progress >= 100) {
    achievements.push({
      icon: <Trophy className="w-6 h-6" />,
      text: "🏆 Goal Complete!",
      color: "text-[#FFD60A]",
    });
  }

  if (achievements.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-gray-400 italic text-sm text-center py-6 rounded-xl bg-white/[0.02] border border-white/5"
      >
        No badges yet — log daily to earn your first one!
      </motion.div>
    );
  }

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {achievements.map((achievement, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 10, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: i * 0.1, type: "spring", stiffness: 200 }}
          whileHover={{ scale: 1.05 }}
          className="flex flex-col items-center justify-center p-4 rounded-xl bg-white/[0.05] border border-white/10 backdrop-blur-sm hover:bg-white/[0.08] transition-all"
        >
          <div className={`${achievement.color} mb-2`}>{achievement.icon}</div>
          <p className="text-gray-300 text-sm font-medium text-center">{achievement.text}</p>
        </motion.div>
      ))}
    </div>
  );
}

