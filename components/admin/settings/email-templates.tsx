"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FileText, Save, Eye, RotateCcw } from "lucide-react";
import { collection, onSnapshot, doc, setDoc, updateDoc, deleteDoc, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/auth-context";
import { Modal } from "@/components/admin/shared/modal";

interface EmailTemplate {
  id: string;
  title: string;
  subject: string;
  body: string;
  lastEditedBy?: string;
  lastEditedAt?: any;
}

const defaultTemplates: Omit<EmailTemplate, "id" | "lastEditedBy" | "lastEditedAt">[] = [
  {
    title: "Welcome Email",
    subject: "Welcome to MacroMinded!",
    body: "Hi {{name}},\n\nWelcome to MacroMinded! We're excited to help you achieve your goals.\n\nYour {{planType}} plan is being prepared.\n\nBest regards,\nThe MacroMinded Team",
  },
  {
    title: "Plan Ready",
    subject: "Your Meal Plan is Ready!",
    body: "Hi {{name}},\n\nYour custom {{planType}} meal plan is ready for you!\n\nYou can access it in your dashboard.\n\nBest regards,\nThe MacroMinded Team",
  },
];

export function EmailTemplates() {
  const { user } = useAuth();
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "emailTemplates"), (snapshot) => {
      const templatesList = snapshot.docs.map((d) => ({
        id: d.id,
        ...(d.data() as EmailTemplate),
      }));
      setTemplates(templatesList);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleSave = async () => {
    if (!editingTemplate || !user) return;

    setLoading(true);
    try {
      if (editingTemplate.id && templates.find((t) => t.id === editingTemplate!.id)) {
        await updateDoc(doc(db, "emailTemplates", editingTemplate.id), {
          title: editingTemplate.title,
          subject: editingTemplate.subject,
          body: editingTemplate.body,
          lastEditedBy: user.email,
          lastEditedAt: Timestamp.now(),
        });
      } else {
        await setDoc(doc(db, "emailTemplates", editingTemplate.id || Date.now().toString()), {
          title: editingTemplate.title,
          subject: editingTemplate.subject,
          body: editingTemplate.body,
          lastEditedBy: user.email,
          lastEditedAt: Timestamp.now(),
          createdAt: Timestamp.now(),
        });
      }

      toast({
        title: "Template Saved",
        description: "Email template has been saved successfully.",
      });

      setEditingTemplate(null);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save template.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRestoreDefault = async (template: Omit<EmailTemplate, "id" | "lastEditedBy" | "lastEditedAt">) => {
    if (!user) return;

    setLoading(true);
    try {
      const existing = templates.find((t) => t.title === template.title);
      if (existing) {
        await updateDoc(doc(db, "emailTemplates", existing.id), {
          subject: template.subject,
          body: template.body,
          lastEditedBy: user.email,
          lastEditedAt: Timestamp.now(),
        });
      } else {
        await setDoc(doc(db, "emailTemplates", Date.now().toString()), {
          ...template,
          lastEditedBy: user.email,
          lastEditedAt: Timestamp.now(),
          createdAt: Timestamp.now(),
        });
      }

      toast({
        title: "Template Restored",
        description: "Default template has been restored.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to restore template.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatPreview = (body: string) => {
    return body
      .replace(/\{\{name\}\}/g, "John Doe")
      .replace(/\{\{planType\}\}/g, "Pro")
      .replace(/\n/g, "<br />");
  };

  if (loading && templates.length === 0) {
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
          <FileText className="h-5 w-5 text-[#FF2E2E]" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-white">Email Templates</h2>
          <p className="text-xs text-gray-400">Manage automated email templates</p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Template List */}
        <div className="space-y-3">
          {templates.map((template) => (
            <div
              key={template.id}
              className="p-4 rounded-lg bg-[#1a1a1a] border border-[#222] hover:border-[#FF2E2E]/50 transition-all"
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-white font-medium">{template.title}</h3>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setSelectedTemplate(template);
                      setPreviewModalOpen(true);
                    }}
                    className="p-2 rounded-lg bg-[#222] hover:bg-[#FF2E2E]/20 border border-[#222] hover:border-[#FF2E2E]/50 text-gray-400 hover:text-white transition-colors"
                    title="Preview"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setEditingTemplate(template)}
                    className="px-3 py-1.5 rounded-lg bg-[#FF2E2E] hover:bg-[#FF2E2E]/90 text-white text-sm transition-colors"
                  >
                    Edit
                  </button>
                </div>
              </div>
              <p className="text-sm text-gray-400 mb-1">Subject: {template.subject}</p>
              {template.lastEditedAt && (
                <p className="text-xs text-gray-500">
                  Last edited: {template.lastEditedAt.toDate?.().toLocaleDateString() || "Unknown"}
                </p>
              )}
            </div>
          ))}
        </div>

        {/* Default Templates */}
        <div className="pt-4 border-t border-[#222]">
          <h3 className="text-sm font-medium text-gray-300 mb-3">Default Templates</h3>
          <div className="space-y-2">
            {defaultTemplates.map((template, index) => {
              const exists = templates.find((t) => t.title === template.title);
              return (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 rounded-lg bg-[#0a0a0a] border border-[#222]"
                >
                  <span className="text-sm text-gray-300">{template.title}</span>
                  <button
                    onClick={() => handleRestoreDefault(template)}
                    disabled={loading}
                    className="px-3 py-1.5 rounded-lg bg-[#222] hover:bg-[#FF2E2E]/20 border border-[#222] hover:border-[#FF2E2E]/50 text-gray-400 hover:text-white transition-colors flex items-center gap-2 text-sm"
                  >
                    <RotateCcw className="h-3 w-3" />
                    {exists ? "Restore" : "Add"}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {editingTemplate && (
        <Modal
          open={!!editingTemplate}
          onClose={() => setEditingTemplate(null)}
          title="Edit Email Template"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Title</label>
              <input
                type="text"
                value={editingTemplate.title}
                onChange={(e) =>
                  setEditingTemplate({ ...editingTemplate, title: e.target.value })
                }
                className="w-full px-4 py-2 bg-[#0a0a0a] border border-[#222] rounded-lg text-white focus:outline-none focus:border-[#FF2E2E] focus:ring-1 focus:ring-[#FF2E2E]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Subject</label>
              <input
                type="text"
                value={editingTemplate.subject}
                onChange={(e) =>
                  setEditingTemplate({ ...editingTemplate, subject: e.target.value })
                }
                className="w-full px-4 py-2 bg-[#0a0a0a] border border-[#222] rounded-lg text-white focus:outline-none focus:border-[#FF2E2E] focus:ring-1 focus:ring-[#FF2E2E]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Body (use {'{{'}name{'}}'}, {'{{'}planType{'}}'} for placeholders)
              </label>
              <textarea
                value={editingTemplate.body}
                onChange={(e) =>
                  setEditingTemplate({ ...editingTemplate, body: e.target.value })
                }
                rows={8}
                className="w-full px-4 py-2 bg-[#0a0a0a] border border-[#222] rounded-lg text-white focus:outline-none focus:border-[#FF2E2E] focus:ring-1 focus:ring-[#FF2E2E] resize-none font-mono text-sm"
              />
            </div>
            <div className="flex gap-3 pt-4">
              <button
                onClick={() => setEditingTemplate(null)}
                className="flex-1 px-4 py-2 rounded-lg bg-[#222] hover:bg-[#333] text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={loading}
                className="flex-1 px-4 py-2 rounded-lg bg-[#FF2E2E] hover:bg-[#FF2E2E]/90 text-white transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Save className="h-4 w-4" />
                Save Template
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Preview Modal */}
      <Modal
        open={previewModalOpen}
        onClose={() => {
          setPreviewModalOpen(false);
          setSelectedTemplate(null);
        }}
        title={selectedTemplate ? `Preview: ${selectedTemplate.title}` : "Preview"}
      >
        {selectedTemplate && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Subject</label>
              <p className="text-white">{selectedTemplate.subject}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Body</label>
              <div
                className="p-4 rounded-lg bg-[#0a0a0a] border border-[#222] text-white"
                dangerouslySetInnerHTML={{ __html: formatPreview(selectedTemplate.body) }}
              />
            </div>
          </div>
        )}
      </Modal>
    </motion.div>
  );
}

