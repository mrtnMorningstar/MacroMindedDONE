"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Settings, Palette, Users, FileText, Shield, FileText as LogsIcon, User } from "lucide-react";
import { ThemeSwitcher } from "@/components/admin/settings/theme-switcher";
import { RoleManagement } from "@/components/admin/settings/role-management";
import { EmailTemplates } from "@/components/admin/settings/email-templates";
import { SecurityPanel } from "@/components/admin/settings/security-panel";
import { LogsViewer } from "@/components/admin/settings/logs-viewer";
import { AccountSettings } from "@/components/admin/settings/account-settings";

type Tab = "general" | "roles" | "templates" | "security" | "logs" | "account";

const tabs = [
  { id: "general" as Tab, label: "General", icon: Palette },
  { id: "roles" as Tab, label: "Roles", icon: Users },
  { id: "templates" as Tab, label: "Templates", icon: FileText },
  { id: "security" as Tab, label: "Security", icon: Shield },
  { id: "logs" as Tab, label: "Logs", icon: LogsIcon },
  { id: "account" as Tab, label: "Account", icon: User },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("general");

  const renderTabContent = () => {
    switch (activeTab) {
      case "general":
        return <ThemeSwitcher />;
      case "roles":
        return <RoleManagement />;
      case "templates":
        return <EmailTemplates />;
      case "security":
        return <SecurityPanel />;
      case "logs":
        return <LogsViewer />;
      case "account":
        return <AccountSettings />;
      default:
        return null;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">
          System <span className="text-[#FF2E2E]">Settings</span>
        </h1>
        <p className="text-gray-400">
          Manage roles, preferences, and automation across MacroMinded Admin.
        </p>
      </div>

      {/* Tabs */}
      <div className="bg-[#151515] border border-[#222] rounded-2xl p-2 mb-6">
        <div className="flex flex-wrap gap-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                  isActive
                    ? "bg-[#FF2E2E] text-white shadow-[0_0_15px_rgba(255,46,46,0.3)]"
                    : "text-gray-400 hover:text-white hover:bg-[#222]"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span className="text-sm font-medium">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.25 }}
        >
          {renderTabContent()}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}
