"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { User, Mail, Save, Link2 } from "lucide-react";
import { doc, getDoc, updateDoc, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/auth-context";

export function AccountSettings() {
  const { user } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [bio, setBio] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const loadAccount = async () => {
      if (!user) return;

      try {
        const docRef = doc(db, "admins", user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setName(data.name || user.displayName || "");
          setEmail(data.email || user.email || "");
          setBio(data.bio || "");
        } else {
          // Initialize with user data
          setName(user.displayName || "");
          setEmail(user.email || "");
        }
      } catch (error: any) {
        console.error("Error loading account:", error);
      } finally {
        setLoading(false);
      }
    };

    loadAccount();
  }, [user]);

  const handleSave = async () => {
    if (!user) return;

    setSaving(true);
    try {
      const docRef = doc(db, "admins", user.uid);
      await updateDoc(docRef, {
        name,
        email,
        bio,
        updatedAt: Timestamp.now(),
      });

      toast({
        title: "Profile Updated",
        description: "Your account settings have been saved.",
      });
    } catch (error: any) {
      // If document doesn't exist, create it
      if (error.code === "not-found") {
        try {
          const docRef = doc(db, "admins", user.uid);
          await updateDoc(docRef, {
            name,
            email,
            bio,
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
          });
          toast({
            title: "Profile Updated",
            description: "Your account settings have been saved.",
          });
        } catch (createError: any) {
          toast({
            title: "Error",
            description: createError.message || "Failed to save settings.",
            variant: "destructive",
          });
        }
      } else {
        toast({
          title: "Error",
          description: error.message || "Failed to save settings.",
          variant: "destructive",
        });
      }
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

  const initials = (name || user?.displayName || user?.email || "A")[0].toUpperCase();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[#151515] border border-[#222] rounded-2xl p-6 shadow-lg backdrop-blur-sm"
    >
      <div className="flex items-center gap-2 mb-6">
        <div className="p-2 rounded-lg bg-[#FF2E2E]/10 border border-[#FF2E2E]/20">
          <User className="h-5 w-5 text-[#FF2E2E]" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-white">Account Settings</h2>
          <p className="text-xs text-gray-400">Manage your admin profile</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Avatar */}
        <div className="flex items-center gap-4">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="relative w-20 h-20 rounded-full bg-gradient-to-br from-[#FF2E2E] to-[#7b0000] flex items-center justify-center text-white font-bold text-2xl border-4 border-[#222] hover:border-[#FF2E2E] transition-colors cursor-pointer"
          >
            {initials}
            <div className="absolute inset-0 rounded-full border-2 border-[#FF2E2E] opacity-0 hover:opacity-100 transition-opacity" />
          </motion.div>
          <div>
            <p className="text-white font-medium">{name || "Admin"}</p>
            <p className="text-sm text-gray-400">{email}</p>
          </div>
        </div>

        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-2 bg-[#0a0a0a] border border-[#222] rounded-lg text-white focus:outline-none focus:border-[#FF2E2E] focus:ring-2 focus:ring-[#FF2E2E]/20 transition-all"
          />
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 bg-[#0a0a0a] border border-[#222] rounded-lg text-white focus:outline-none focus:border-[#FF2E2E] focus:ring-2 focus:ring-[#FF2E2E]/20 transition-all"
          />
        </div>

        {/* Bio */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Bio</label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={4}
            placeholder="Tell us about yourself..."
            className="w-full px-4 py-2 bg-[#0a0a0a] border border-[#222] rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:border-[#FF2E2E] focus:ring-2 focus:ring-[#FF2E2E]/20 transition-all resize-none"
          />
        </div>

        {/* Integrations */}
        <div className="pt-4 border-t border-[#222]">
          <h3 className="text-sm font-medium text-gray-300 mb-4">Integrations</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-lg bg-[#1a1a1a] border border-[#222]">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-[#635BFF]/10">
                  <Link2 className="h-4 w-4 text-[#635BFF]" />
                </div>
                <div>
                  <p className="text-sm text-white">Stripe</p>
                  <p className="text-xs text-gray-400">Payment processing</p>
                </div>
              </div>
              <button className="px-4 py-2 rounded-lg bg-[#222] hover:bg-[#FF2E2E]/20 border border-[#222] hover:border-[#FF2E2E]/50 text-gray-400 hover:text-white transition-colors text-sm">
                Connect
              </button>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-[#1a1a1a] border border-[#222]">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-[#FFA500]/10">
                  <Link2 className="h-4 w-4 text-[#FFA500]" />
                </div>
                <div>
                  <p className="text-sm text-white">Firebase</p>
                  <p className="text-xs text-gray-400">Database & auth</p>
                </div>
              </div>
              <span className="px-4 py-2 rounded-lg bg-green-500/20 text-green-400 text-sm border border-green-500/30">
                Connected
              </span>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full px-6 py-3 rounded-lg bg-gradient-to-r from-[#FF2E2E] to-[#7b0000] hover:from-[#FF2E2E]/90 hover:to-[#7b0000]/90 text-white transition-all shadow-lg hover:shadow-[0_0_20px_rgba(255,46,46,0.3)] flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <Save className="h-4 w-4" />
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </motion.div>
  );
}

