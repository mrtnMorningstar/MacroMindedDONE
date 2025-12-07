"use client";

import { useAuth } from "@/context/auth-context";
import { db } from "@/lib/firebase/config";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { AnimatedCard } from "@/components/ui/animated-card";

export default function SettingsPage() {
  const { user } = useAuth();
  const [form, setForm] = useState<any>({});
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.uid) return;

    (async () => {
      try {
        const uSnap = await getDoc(doc(db, "users", user.uid));
        if (uSnap.exists()) setForm(uSnap.data());
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    })();
  }, [user?.uid]);

  const save = async () => {
    if (!user?.uid) return;

    setSaving(true);
    try {
      await updateDoc(doc(db, "users", user.uid), form);
    } catch (error) {
      console.error("Error saving settings:", error);
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return <p className="text-gray-400 text-center py-10">Loading settings...</p>;

  return (
    <div className="space-y-6">
      <motion.h1
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-2xl font-black text-white"
      >
        Settings
      </motion.h1>

      <AnimatedCard>
        <div className="grid gap-4 sm:grid-cols-2">
          {["age", "height", "weight", "activityLevel", "goal"].map((field, i) => (
            <motion.div
              key={field}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="flex flex-col"
            >
              <label className="text-sm text-gray-400 mb-1 capitalize">{field}</label>
              <motion.input
                whileFocus={{ scale: 1.02, boxShadow: "0 0 10px rgba(255,46,46,0.3)" }}
                className="bg-[#0f0f0f] border border-[#1f1f1f] rounded-lg px-3 py-2 text-sm text-gray-300 focus:outline-none focus:border-[#FF2E2E] transition-all duration-200"
                value={form[field] || ""}
                onChange={(e) => setForm({ ...form, [field]: e.target.value })}
              />
            </motion.div>
          ))}
        </div>
      </AnimatedCard>

      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
        <Button
          onClick={save}
          disabled={saving}
          className="bg-[#FF2E2E] hover:bg-[#e62a2a] text-white transition-all duration-200 hover:shadow-[0_0_15px_rgba(255,46,46,0.4)]"
        >
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </motion.div>
    </div>
  );
}
