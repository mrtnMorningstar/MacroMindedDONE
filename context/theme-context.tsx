"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { onSnapshot, doc, setDoc, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase/config";

interface Theme {
  mode: "dark" | "light";
  accent: string;
}

interface ThemeContextType {
  theme: Theme;
  updateTheme: (updates: Partial<Theme>) => Promise<void>;
  loading: boolean;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>({
    mode: "dark",
    accent: "#FF2E2E",
  });
  const [loading, setLoading] = useState(true);

  // Load from Firestore
  useEffect(() => {
    const ref = doc(db, "adminConfig", "theme");
    const unsub = onSnapshot(
      ref,
      (snap) => {
        if (snap.exists()) {
          const data = snap.data();
          setTheme({
            mode: data.mode || "dark",
            accent: data.accentColor || "#FF2E2E",
          });
        } else {
          // Initialize with defaults
          setDoc(ref, {
            mode: "dark",
            accentColor: "#FF2E2E",
            createdAt: Timestamp.now(),
          }).catch(console.error);
        }
        setLoading(false);
      },
      (error) => {
        console.error("Error loading theme:", error);
        setLoading(false);
      }
    );

    return () => unsub();
  }, []);

  // Apply to document root and body
  useEffect(() => {
    if (typeof document === "undefined") return;

    const root = document.documentElement;
    const body = document.body;

    // Set CSS variables
    root.style.setProperty("--accent-color", theme.accent);
    const bgColor = theme.mode === "dark" ? "#0b0b0b" : "#f5f5f5";
    const textColor = theme.mode === "dark" ? "#ffffff" : "#111111";
    const cardBg = theme.mode === "dark" ? "#151515" : "#ffffff";
    const borderColor = theme.mode === "dark" ? "#222222" : "#e5e5e5";

    root.style.setProperty("--bg-color", bgColor);
    root.style.setProperty("--text-color", textColor);
    root.style.setProperty("--card-bg", cardBg);
    root.style.setProperty("--border-color", borderColor);

    // Apply directly to body for immediate effect
    body.style.backgroundColor = bgColor;
    body.style.color = textColor;

    // Apply to admin layout container if it exists
    const adminContainer = document.querySelector('[data-admin-container]');
    if (adminContainer) {
      (adminContainer as HTMLElement).style.backgroundColor = bgColor;
    }
  }, [theme]);

  const updateTheme = async (updates: Partial<Theme>) => {
    const ref = doc(db, "adminConfig", "theme");
    const newTheme = {
      ...theme,
      ...updates,
    };

    // Optimistic update
    setTheme(newTheme);

    try {
      await setDoc(
        ref,
        {
          mode: newTheme.mode,
          accentColor: newTheme.accent,
          updatedAt: Timestamp.now(),
        },
        { merge: true }
      );
    } catch (error) {
      console.error("Error updating theme:", error);
      // Revert on error
      setTheme(theme);
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, updateTheme, loading }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
}

