"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Upload, FileText, CheckCircle2 } from "lucide-react";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { doc, updateDoc, collection, addDoc, serverTimestamp } from "firebase/firestore";
import { storage } from "@/lib/firebase/config";
import { db } from "@/lib/firebase/config";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/auth-context";
import Confetti from "react-confetti";

interface User {
  id: string;
  name?: string;
  email?: string;
}

interface PlanUploadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User | null;
  onSuccess?: () => void;
}

export function PlanUploadModal({
  open,
  onOpenChange,
  user,
  onSuccess,
}: PlanUploadModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [planTitle, setPlanTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [uploading, setUploading] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const { toast } = useToast();
  const { user: currentUser } = useAuth();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!user) return;

    if (!file && !planTitle.trim()) {
      toast({
        title: "Error",
        description: "Please upload a file or enter a plan title.",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);

    try {
      let fileUrl = "";

      // Upload file if provided
      if (file) {
        const fileRef = ref(storage, `plans/${user.id}/${Date.now()}_${file.name}`);
        await uploadBytes(fileRef, file);
        fileUrl = await getDownloadURL(fileRef);
      }

      // Save plan to Firestore
      await addDoc(collection(db, "plans"), {
        userId: user.id,
        planTitle: planTitle.trim() || `Plan for ${user.name || user.email}`,
        fileUrl: fileUrl || null,
        notes: notes.trim() || null,
        status: "delivered",
        createdAt: serverTimestamp(),
      });

      // Update user plan status
      await updateDoc(doc(db, "users", user.id), {
        planStatus: "Delivered",
      });

      // Log admin action
      const { logAdminAction } = await import("@/lib/utils/admin-logger");
      await logAdminAction({
        action: `Plan uploaded: ${planTitle.trim() || `Plan for ${user.name || user.email}`}`,
        user: currentUser?.email || "Unknown",
        userId: currentUser?.uid,
        type: "upload",
        details: `Plan delivered to ${user.name || user.email}`,
      });

      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);

      toast({
        title: "Success!",
        description: "Plan uploaded and delivered successfully!",
      });

      // Reset form
      setFile(null);
      setPlanTitle("");
      setNotes("");
      onOpenChange(false);
      onSuccess?.();
    } catch (error: any) {
      console.error("Upload error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to upload plan.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  if (!user) return null;

  return (
    <>
      {showConfetti && (
        <Confetti
          width={window.innerWidth}
          height={window.innerHeight}
          recycle={false}
          numberOfPieces={200}
        />
      )}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => onOpenChange(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-[#151515] border border-[#222] rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
              >
                {/* Header */}
                <div className="p-6 border-b border-[#222] flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-white">
                      Upload Plan for {user.name || user.email}
                    </h2>
                    <p className="text-sm text-gray-400 mt-1">Upload a meal plan file or enter details</p>
                  </div>
                  <button
                    onClick={() => onOpenChange(false)}
                    className="p-2 rounded-lg hover:bg-[#222] text-gray-400 hover:text-white transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                  {/* Plan Title */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Plan Title
                    </label>
                    <input
                      type="text"
                      value={planTitle}
                      onChange={(e) => setPlanTitle(e.target.value)}
                      placeholder="e.g., Custom Meal Plan - Week 1"
                      className="w-full px-4 py-3 bg-[#0a0a0a] border border-[#222] rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:border-[#FF2E2E] focus:ring-1 focus:ring-[#FF2E2E] transition-colors"
                    />
                  </div>

                  {/* File Upload */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Upload File (PDF, Image)
                    </label>
                    <div className="border-2 border-dashed border-[#222] rounded-lg p-8 text-center hover:border-[#FF2E2E]/50 transition-colors">
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={handleFileChange}
                        className="hidden"
                        id="file-upload"
                      />
                      <label
                        htmlFor="file-upload"
                        className="cursor-pointer flex flex-col items-center gap-3"
                      >
                        <Upload className="h-8 w-8 text-gray-400" />
                        <span className="text-sm text-gray-400">
                          {file ? file.name : "Click to upload or drag and drop"}
                        </span>
                        {file && (
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex items-center gap-2 mt-2"
                          >
                            <FileText className="h-4 w-4 text-[#FF2E2E]" />
                            <span className="text-sm text-[#FF2E2E]">{file.name}</span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setFile(null);
                              }}
                              className="text-gray-400 hover:text-white"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </motion.div>
                        )}
                      </label>
                    </div>
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Notes (Optional)
                    </label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Add any additional notes or instructions..."
                      rows={4}
                      className="w-full px-4 py-3 bg-[#0a0a0a] border border-[#222] rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:border-[#FF2E2E] focus:ring-1 focus:ring-[#FF2E2E] transition-colors resize-none"
                    />
                  </div>

                  {/* Actions */}
                  <div className="flex justify-end gap-3 pt-4 border-t border-[#222]">
                    <button
                      onClick={() => onOpenChange(false)}
                      className="px-6 py-3 rounded-lg bg-[#222] hover:bg-[#333] text-white transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleUpload}
                      disabled={uploading || (!file && !planTitle.trim())}
                      className="px-6 py-3 rounded-lg bg-[#FF2E2E] hover:bg-[#FF2E2E]/90 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {uploading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="h-4 w-4" />
                          Upload Plan
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

