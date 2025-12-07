"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User, Bell, Shield, Monitor, Save } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/context/auth-context";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { updatePassword, reauthenticateWithCredential, EmailAuthProvider } from "firebase/auth";
import { auth } from "@/lib/firebase/config";
import { useToast } from "@/hooks/use-toast";

interface UserPreferences {
  emailNotifications?: boolean;
  planUpdateAlerts?: boolean;
  paymentReminders?: boolean;
  weeklyInsights?: boolean;
  accentColor?: string;
  backgroundMode?: string;
}

export default function SettingsPage() {
  const { user, userData } = useAuth();
  const { toast } = useToast();
  const [tab, setTab] = useState("profile");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Profile state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  // Preferences state
  const [preferences, setPreferences] = useState<UserPreferences>({
    emailNotifications: true,
    planUpdateAlerts: true,
    paymentReminders: true,
    weeklyInsights: true,
  });

  // Theme state
  const [accentColor, setAccentColor] = useState("#FF2E2E");
  const [backgroundMode, setBackgroundMode] = useState("Dark (Default)");

  // Security state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Load user data
  useEffect(() => {
    async function loadUserData() {
      if (!user?.uid) return;

      try {
        const userDocRef = doc(db, "users", user.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          const data = userDocSnap.data();
          setName(data.name || user.displayName || "");
          setEmail(data.email || user.email || "");
          setPhone(data.phone || "");

          // Load preferences
          if (data.preferences) {
            setPreferences({
              emailNotifications: data.preferences.emailNotifications ?? true,
              planUpdateAlerts: data.preferences.planUpdateAlerts ?? true,
              paymentReminders: data.preferences.paymentReminders ?? true,
              weeklyInsights: data.preferences.weeklyInsights ?? true,
              accentColor: data.preferences.accentColor || "#FF2E2E",
              backgroundMode: data.preferences.backgroundMode || "Dark (Default)",
            });
          }

          setAccentColor(data.preferences?.accentColor || "#FF2E2E");
          setBackgroundMode(data.preferences?.backgroundMode || "Dark (Default)");
        } else {
          // Use auth data as fallback
          setName(user.displayName || "");
          setEmail(user.email || "");
        }
      } catch (error) {
        console.error("Error loading user data:", error);
        toast({
          title: "Error",
          description: "Failed to load user data",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }

    loadUserData();
  }, [user, toast]);

  const handleSaveProfile = async () => {
    if (!user?.uid) return;

    setSaving(true);
    try {
      await updateDoc(doc(db, "users", user.uid), {
        name,
        email,
        phone,
        updatedAt: new Date().toISOString(),
      });

      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSavePreferences = async () => {
    if (!user?.uid) return;

    setSaving(true);
    try {
      await updateDoc(doc(db, "users", user.uid), {
        preferences: {
          ...preferences,
          accentColor,
          backgroundMode,
        },
        updatedAt: new Date().toISOString(),
      });

      toast({
        title: "Success",
        description: "Preferences saved successfully",
      });
    } catch (error) {
      console.error("Error saving preferences:", error);
      toast({
        title: "Error",
        description: "Failed to save preferences",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (!user?.email || !currentPassword || !newPassword) {
      toast({
        title: "Error",
        description: "Please fill in all password fields",
        variant: "destructive",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: "Error",
        description: "New passwords do not match",
        variant: "destructive",
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      // Re-authenticate user
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(auth.currentUser!, credential);

      // Update password
      await updatePassword(auth.currentUser!, newPassword);

      toast({
        title: "Success",
        description: "Password updated successfully",
      });

      // Clear password fields
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      console.error("Error updating password:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update password",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: "profile", label: "Profile", icon: User },
    { id: "preferences", label: "Preferences", icon: Bell },
    { id: "theme", label: "Theme", icon: Monitor },
    { id: "security", label: "Security", icon: Shield },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[70vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF2E2E] mx-auto mb-4"></div>
          <p className="text-gray-400">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
          Your <span className="text-[#FF2E2E]">Settings</span>
        </h1>
        <p className="text-gray-400 mt-2">Manage your profile, preferences, and privacy.</p>
      </motion.div>

      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-3 border-b border-white/10 pb-4">
        {tabs.map(({ id, label, icon: Icon }) => (
          <Button
            key={id}
            variant={tab === id ? "default" : "outline"}
            onClick={() => setTab(id)}
            className={`rounded-full transition-all ${
              tab === id
                ? "bg-[#FF2E2E] text-white shadow-lg"
                : "border-[#FF2E2E]/30 text-gray-300 hover:bg-[#FF2E2E]/10"
            }`}
          >
            <Icon className="w-4 h-4 mr-2" />
            {label}
          </Button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        <AnimatePresence mode="wait">
          {tab === "profile" && (
            <motion.div
              key="profile"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="rounded-2xl border border-white/10 p-6 bg-white/[0.03] backdrop-blur-xl space-y-4"
            >
              <h2 className="text-xl font-semibold mb-3">Profile Information</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <Input
                  placeholder="Full Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-[#111] text-white border-[#222]"
                />
                <Input
                  placeholder="Email Address"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-[#111] text-white border-[#222]"
                />
              </div>
              <Input
                placeholder="Phone Number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="bg-[#111] text-white border-[#222]"
              />
              <Button
                onClick={handleSaveProfile}
                disabled={saving}
                className="bg-[#FF2E2E] hover:bg-[#FF2E2E]/90 mt-3 rounded-full"
              >
                <Save className="w-4 h-4 mr-2" /> {saving ? "Saving..." : "Save Changes"}
              </Button>
            </motion.div>
          )}

          {tab === "preferences" && (
            <motion.div
              key="preferences"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="rounded-2xl border border-white/10 p-6 bg-white/[0.03] backdrop-blur-xl space-y-5"
            >
              <h2 className="text-xl font-semibold mb-3">Notification Preferences</h2>
              <div className="space-y-4">
                {[
                  { label: "Email Notifications", id: "email", key: "emailNotifications" as keyof UserPreferences },
                  { label: "Plan Update Alerts", id: "plan", key: "planUpdateAlerts" as keyof UserPreferences },
                  { label: "Payment Reminders", id: "billing", key: "paymentReminders" as keyof UserPreferences },
                  { label: "Weekly Insights", id: "insights", key: "weeklyInsights" as keyof UserPreferences },
                ].map(({ label, id, key }) => (
                  <div key={id} className="flex justify-between items-center">
                    <p className="text-gray-300">{label}</p>
                    <Switch
                      id={id}
                      checked={preferences[key] as boolean}
                      onCheckedChange={(checked) =>
                        setPreferences((prev) => ({ ...prev, [key]: checked }))
                      }
                    />
                  </div>
                ))}
              </div>
              <Button
                onClick={handleSavePreferences}
                disabled={saving}
                className="bg-[#FF2E2E] hover:bg-[#FF2E2E]/90 mt-3 rounded-full"
              >
                <Save className="w-4 h-4 mr-2" /> {saving ? "Saving..." : "Save Preferences"}
              </Button>
            </motion.div>
          )}

          {tab === "theme" && (
            <motion.div
              key="theme"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="rounded-2xl border border-white/10 p-6 bg-gradient-to-br from-[#1E1E1E]/40 to-[#0A0A0A]/60 backdrop-blur-xl space-y-5"
            >
              <h2 className="text-xl font-semibold mb-3">Theme Customization</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="flex flex-col space-y-2">
                  <label className="text-gray-400 text-sm">Accent Color</label>
                  <input
                    type="color"
                    value={accentColor}
                    onChange={(e) => setAccentColor(e.target.value)}
                    className="w-16 h-10 rounded border border-[#333] cursor-pointer"
                  />
                </div>
                <div className="flex flex-col space-y-2">
                  <label className="text-gray-400 text-sm">Background Mode</label>
                  <select
                    value={backgroundMode}
                    onChange={(e) => setBackgroundMode(e.target.value)}
                    className="bg-[#111] border border-[#222] text-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-[#FF2E2E]"
                  >
                    <option>Dark (Default)</option>
                    <option>Dim</option>
                    <option>High Contrast</option>
                  </select>
                </div>
              </div>
              <Button
                onClick={handleSavePreferences}
                disabled={saving}
                className="bg-[#FF2E2E] hover:bg-[#FF2E2E]/90 mt-3 rounded-full"
              >
                <Save className="w-4 h-4 mr-2" /> {saving ? "Applying..." : "Apply Theme"}
              </Button>
            </motion.div>
          )}

          {tab === "security" && (
            <motion.div
              key="security"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="rounded-2xl border border-white/10 p-6 bg-white/[0.03] backdrop-blur-xl space-y-5"
            >
              <h2 className="text-xl font-semibold mb-3">Security Settings</h2>
              <Input
                type="password"
                placeholder="Current Password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="bg-[#111] text-white border-[#222]"
              />
              <Input
                type="password"
                placeholder="New Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="bg-[#111] text-white border-[#222]"
              />
              <Input
                type="password"
                placeholder="Confirm New Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="bg-[#111] text-white border-[#222]"
              />
              <Button
                onClick={handleUpdatePassword}
                disabled={saving || !currentPassword || !newPassword || !confirmPassword}
                className="bg-[#FF2E2E] hover:bg-[#FF2E2E]/90 mt-3 rounded-full"
              >
                <Shield className="w-4 h-4 mr-2" /> {saving ? "Updating..." : "Update Password"}
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
