"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Settings, Mail, Clock } from "lucide-react";
import { doc, getDoc, setDoc, updateDoc, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { useToast } from "@/hooks/use-toast";

interface AutomationConfig {
  autoEmail: boolean;
  autoDeactivate: boolean;
}

export function AutomationPanel() {
  const [config, setConfig] = useState<AutomationConfig>({
    autoEmail: false,
    autoDeactivate: false,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const { toast } = useToast();

  // Load config
  useEffect(() => {
    const loadConfig = async () => {
      try {
        const docRef = doc(db, "adminConfig", "automations");
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setConfig(docSnap.data() as AutomationConfig);
        } else {
          // Create default config
          await setDoc(docRef, {
            autoEmail: false,
            autoDeactivate: false,
            createdAt: Timestamp.now(),
          });
        }
      } catch (error: any) {
        console.error("Error loading config:", error);
      } finally {
        setLoading(false);
      }
    };

    loadConfig();
  }, []);

  const toggleAutomation = async (key: keyof AutomationConfig) => {
    setSaving(key);
    try {
      const newValue = !config[key];
      const docRef = doc(db, "adminConfig", "automations");

      await updateDoc(docRef, {
        [key]: newValue,
        updatedAt: Timestamp.now(),
      });

      setConfig((prev) => ({ ...prev, [key]: newValue }));

      toast({
        title: "Settings Updated",
        description: `${key === "autoEmail" ? "Auto-email" : "Auto-deactivate"} ${newValue ? "enabled" : "disabled"}.`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update settings.",
        variant: "destructive",
      });
    } finally {
      setSaving(null);
    }
  };

  const automations = [
    {
      key: "autoEmail" as const,
      label: "Auto-send Plan Ready Email",
      description: "Automatically email users when plan status changes to 'Delivered'",
      icon: Mail,
    },
    {
      key: "autoDeactivate" as const,
      label: "Auto-mark Inactive Users",
      description: "Automatically mark users as inactive after 30 days of no login",
      icon: Clock,
    },
  ];

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[#151515] border border-[#222] rounded-2xl p-6"
      >
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-[#222] rounded"></div>
          <div className="h-20 bg-[#222] rounded"></div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[#151515] border border-[#222] rounded-2xl p-6 shadow-lg backdrop-blur-sm"
    >
      <div className="flex items-center gap-2 mb-6">
        <div className="p-2 rounded-lg bg-[#FF2E2E]/10 border border-[#FF2E2E]/20">
          <Settings className="h-5 w-5 text-[#FF2E2E]" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-white">Automations</h2>
          <p className="text-xs text-gray-400">Configure automated tasks</p>
        </div>
      </div>

      <div className="space-y-4">
        {automations.map((automation) => {
          const Icon = automation.icon;
          const isEnabled = config[automation.key];
          const isSaving = saving === automation.key;

          return (
            <div
              key={automation.key}
              className="p-4 rounded-lg bg-[#1a1a1a] border border-[#222] hover:border-[#FF2E2E]/30 transition-all"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <div className={`p-2 rounded-lg ${isEnabled ? "bg-[#FF2E2E]/10" : "bg-[#222]"}`}>
                    <Icon className={`h-4 w-4 ${isEnabled ? "text-[#FF2E2E]" : "text-gray-500"}`} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white">{automation.label}</p>
                    <p className="text-xs text-gray-400 mt-1">{automation.description}</p>
                  </div>
                </div>

                {/* Toggle Switch */}
                <button
                  onClick={() => toggleAutomation(automation.key)}
                  disabled={isSaving}
                  className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${
                    isEnabled ? "bg-[#FF2E2E]" : "bg-[#333]"
                  } ${isSaving ? "opacity-50" : ""}`}
                >
                  <motion.div
                    className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow-lg"
                    animate={{
                      x: isEnabled ? 24 : 0,
                    }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}

