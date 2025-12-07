"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Palette, Moon, Sun } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useTheme } from "@/context/theme-context";

type ThemeMode = "dark" | "light";
type AccentColor = "red" | "gold" | "silver";

const accentColors = {
  red: { name: "Red", value: "#FF2E2E", class: "bg-[#FF2E2E]" },
  gold: { name: "Gold", value: "#FFD700", class: "bg-[#FFD700]" },
  silver: { name: "Silver", value: "#C0C0C0", class: "bg-[#C0C0C0]" },
};

export function ThemeSwitcher() {
  const { theme, updateTheme, loading } = useTheme();
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const themeMode = theme.mode;
  // Find the accent color key that matches the current theme accent value
  const accentColor = (Object.keys(accentColors).find(
    (key) => accentColors[key as AccentColor].value === theme.accent
  ) || "red") as AccentColor;

  const handleModeChange = async (mode: ThemeMode) => {
    setSaving(true);
    try {
      await updateTheme({ mode });
      toast({
        title: "Theme Updated",
        description: `Switched to ${mode} mode.`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update theme.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleAccentChange = async (color: AccentColor) => {
    setSaving(true);
    try {
      await updateTheme({ accent: accentColors[color].value });
      toast({
        title: "Theme Updated",
        description: `Accent color changed to ${accentColors[color].name}.`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update theme.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-[#151515] border border-[#222] rounded-2xl p-6 animate-pulse">
        <div className="h-32 bg-[#222] rounded"></div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[#151515] border border-[#222] rounded-2xl p-6 shadow-lg backdrop-blur-sm"
    >
      <div className="flex items-center gap-2 mb-6">
        <div 
          className="p-2 rounded-lg border transition-colors" 
          style={{ 
            backgroundColor: `${theme.accent}1A`, 
            borderColor: `${theme.accent}33` 
          }}
        >
          <Palette className="h-5 w-5 transition-colors" style={{ color: theme.accent }} />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-white">Theme Customization</h2>
          <p className="text-xs text-gray-400">Personalize your admin interface</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Theme Mode */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-3">Theme Mode</label>
          <div className="flex gap-3">
            <button
              onClick={() => handleModeChange("dark")}
              disabled={saving || loading}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border transition-all ${
                themeMode === "dark"
                  ? "bg-[var(--accent-color)]/20 border-[var(--accent-color)] text-white"
                  : "bg-[#0a0a0a] border-[#222] text-gray-400 hover:border-[var(--accent-color)]/50"
              }`}
            >
              <Moon className="h-4 w-4" />
              Dark
            </button>
            <button
              onClick={() => handleModeChange("light")}
              disabled={saving || loading}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border transition-all ${
                themeMode === "light"
                  ? "bg-[var(--accent-color)]/20 border-[var(--accent-color)] text-white"
                  : "bg-[#0a0a0a] border-[#222] text-gray-400 hover:border-[var(--accent-color)]/50"
              }`}
            >
              <Sun className="h-4 w-4" />
              Light
            </button>
          </div>
        </div>

        {/* Accent Color */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-3">Accent Color</label>
          <div className="grid grid-cols-3 gap-3">
            {Object.entries(accentColors).map(([key, color]) => (
              <motion.button
                key={key}
                onClick={() => handleAccentChange(key as AccentColor)}
                disabled={saving || loading}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`p-4 rounded-lg border-2 transition-all ${
                  accentColor === key
                    ? "border-[var(--accent-color)] shadow-[0_0_20px_var(--accent-color)]/30"
                    : "border-[#222] hover:border-[var(--accent-color)]/50"
                }`}
              >
                <div className={`w-full h-12 rounded-lg ${color.class} mb-2`} />
                <p className="text-xs text-gray-300">{color.name}</p>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Live Preview */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-3">Preview</label>
            <div
              className="p-6 rounded-lg border border-[var(--border-color)]"
              style={{
                backgroundColor: "var(--card-bg)",
                color: "var(--text-color)",
              }}
            >
              <div
                className="px-4 py-2 rounded-lg text-white inline-block mb-3 transition-colors"
                style={{ backgroundColor: "var(--accent-color)" }}
              >
                Sample Button
              </div>
              <p className="text-sm opacity-70">
                This is how your theme will look
              </p>
            </div>
        </div>
      </div>
    </motion.div>
  );
}

