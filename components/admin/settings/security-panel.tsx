"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Shield, Lock, Smartphone, AlertTriangle } from "lucide-react";
import { doc, getDoc, updateDoc, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/auth-context";

export function SecurityPanel() {
  const { user } = useAuth();
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [panelLocked, setPanelLocked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const loadSecurity = async () => {
      try {
        const configRef = doc(db, "adminConfig", "security");
        const configSnap = await getDoc(configRef);

        if (configSnap.exists()) {
          const data = configSnap.data();
          setTwoFactorEnabled(data.twoFactorEnabled || false);
        }

        const lockRef = doc(db, "adminConfig", "lock");
        const lockSnap = await getDoc(lockRef);
        if (lockSnap.exists()) {
          setPanelLocked(lockSnap.data().locked || false);
        }
      } catch (error: any) {
        console.error("Error loading security:", error);
      } finally {
        setLoading(false);
      }
    };

    loadSecurity();
  }, []);

  const toggle2FA = async () => {
    setSaving("2fa");
    try {
      const configRef = doc(db, "adminConfig", "security");
      await updateDoc(configRef, {
        twoFactorEnabled: !twoFactorEnabled,
        updatedAt: Timestamp.now(),
      });

      setTwoFactorEnabled(!twoFactorEnabled);
      toast({
        title: "2FA Updated",
        description: `Two-factor authentication ${!twoFactorEnabled ? "enabled" : "disabled"}.`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update 2FA.",
        variant: "destructive",
      });
    } finally {
      setSaving(null);
    }
  };

  const togglePanelLock = async () => {
    setSaving("lock");
    try {
      const lockRef = doc(db, "adminConfig", "lock");
      await updateDoc(lockRef, {
        locked: !panelLocked,
        updatedAt: Timestamp.now(),
      });

      setPanelLocked(!panelLocked);
      toast({
        title: panelLocked ? "Panel Unlocked" : "Panel Locked",
        description: panelLocked
          ? "Admin panel is now unlocked."
          : "Admin panel is now locked. Writes are disabled.",
        variant: panelLocked ? "default" : "destructive",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update lock status.",
        variant: "destructive",
      });
    } finally {
      setSaving(null);
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
        <div className="p-2 rounded-lg bg-[#FF2E2E]/10 border border-[#FF2E2E]/20">
          <Shield className="h-5 w-5 text-[#FF2E2E]" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-white">Security & Access</h2>
          <p className="text-xs text-gray-400">Manage security settings</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* 2FA Toggle */}
        <div className="p-4 rounded-lg bg-[#1a1a1a] border border-[#222]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-400/10">
                <Smartphone className="h-4 w-4 text-blue-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">Two-Factor Authentication</p>
                <p className="text-xs text-gray-400">Add an extra layer of security</p>
              </div>
            </div>
            <button
              onClick={toggle2FA}
              disabled={saving === "2fa"}
              className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${
                twoFactorEnabled ? "bg-[#FF2E2E]" : "bg-[#333]"
              } ${saving === "2fa" ? "opacity-50" : ""}`}
            >
              <motion.div
                className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow-lg"
                animate={{
                  x: twoFactorEnabled ? 24 : 0,
                }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            </button>
          </div>
        </div>

        {/* Panel Lock */}
        <div className="p-4 rounded-lg bg-[#1a1a1a] border border-[#222]">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-[#FF2E2E]/10">
                <Lock className="h-4 w-4 text-[#FF2E2E]" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">Lock Admin Panel</p>
                <p className="text-xs text-gray-400">Disable all write operations</p>
              </div>
            </div>
            <button
              onClick={togglePanelLock}
              disabled={saving === "lock"}
              className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${
                panelLocked ? "bg-[#FF2E2E]" : "bg-[#333]"
              } ${saving === "lock" ? "opacity-50" : ""}`}
            >
              <motion.div
                className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow-lg"
                animate={{
                  x: panelLocked ? 24 : 0,
                }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            </button>
          </div>
          {panelLocked && (
            <div className="mt-3 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/30 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-yellow-400" />
              <p className="text-xs text-yellow-400">
                Admin panel is locked. All write operations are disabled.
              </p>
            </div>
          )}
        </div>

        {/* Device Sessions (Mock) */}
        <div className="p-4 rounded-lg bg-[#1a1a1a] border border-[#222]">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-gray-400/10">
              <Smartphone className="h-4 w-4 text-gray-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-white">Active Sessions</p>
              <p className="text-xs text-gray-400">Manage device access</p>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between p-2 rounded bg-[#0a0a0a]">
              <div>
                <p className="text-xs text-white">Current Device</p>
                <p className="text-xs text-gray-500">Chrome on macOS</p>
              </div>
              <span className="text-xs text-green-400">Active</span>
            </div>
            <p className="text-xs text-gray-500 text-center">Session management coming soon</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

