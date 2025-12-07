"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { FolderOpen, ChefHat, Dumbbell, FileText, Paperclip, Sparkles, Download, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/auth-context";
import { collection, getDocs, query, where, orderBy, doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/config";

interface PlanData {
  id?: string;
  userId?: string;
  fileUrl?: string;
  meals?: string;
  training?: string;
  notes?: string;
  attachments?: string | string[];
  createdAt?: any;
  uploadedBy?: string;
}

export default function MyPlanPage() {
  const { user } = useAuth();
  const [planData, setPlanData] = useState<PlanData | null>(null);
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [planStatus, setPlanStatus] = useState<string>("Pending");

  useEffect(() => {
    async function loadPlan() {
      if (!user?.uid) {
        setLoading(false);
        return;
      }

      try {
        // Fetch user document for plan status
        const userDocRef = doc(db, "users", user.uid);
        const userDocSnap = await getDoc(userDocRef);
        
        if (userDocSnap.exists()) {
          const userData = userDocSnap.data();
          setPlanStatus(userData.planStatus || "Pending");
        }

        // Try to fetch plan from plans collection (filtered by userId)
        const plansRef = collection(db, "plans");
        const q = query(
          plansRef,
          where("userId", "==", user.uid),
          orderBy("createdAt", "desc")
        );

        let snapshot;
        try {
          snapshot = await getDocs(q);
        } catch (error: any) {
          // If index error, try without orderBy
          if (error.code === "failed-precondition") {
            const fallbackQ = query(plansRef, where("userId", "==", user.uid));
            snapshot = await getDocs(fallbackQ);
          } else {
            throw error;
          }
        }

        if (!snapshot.empty) {
          // Get the most recent plan
          const planDoc = snapshot.docs[0];
          const plan = {
            id: planDoc.id,
            ...planDoc.data(),
          } as PlanData;
          setPlanData(plan);
        } else {
          // Try checking for plan in subcollection (if using versions structure)
          try {
            const versionsRef = collection(db, "plans", user.uid, "versions");
            const versionsSnap = await getDocs(versionsRef);
            if (!versionsSnap.empty) {
              const versionDoc = versionsSnap.docs[0];
              const plan = {
                id: versionDoc.id,
                ...versionDoc.data(),
              } as PlanData;
              setPlanData(plan);
            } else {
              setPlanData(null);
            }
          } catch (subError) {
            // Subcollection might not exist, that's okay
            setPlanData(null);
          }
        }
      } catch (err) {
        console.error("Error loading plan:", err);
        setPlanData(null);
      } finally {
        setLoading(false);
      }
    }

    loadPlan();
  }, [user?.uid]);

  const sections = [
    {
      id: "meals",
      icon: ChefHat,
      title: "Meals",
      content: planData?.meals || "Your meal plan will appear here soon. Your coach is preparing personalized meal recommendations based on your goals.",
    },
    {
      id: "training",
      icon: Dumbbell,
      title: "Training",
      content: planData?.training || "Your workout program will appear here soon. Your coach is designing a training plan tailored to your fitness level and objectives.",
    },
    {
      id: "notes",
      icon: FileText,
      title: "Notes",
      content: planData?.notes || "Any personal notes from your expert will appear here. This section includes tips, reminders, and personalized guidance.",
    },
    {
      id: "attachments",
      icon: Paperclip,
      title: "Attachments",
      content: planData?.attachments || planData?.fileUrl || "No files uploaded yet.",
      isFile: !!planData?.fileUrl,
      fileUrl: planData?.fileUrl,
    },
  ];

  const handleAIExplain = async () => {
    setAiSummary("Analyzing your plan...");
    
    // Simulate AI analysis with a delay
    setTimeout(() => {
      if (planData) {
        setAiSummary(
          "Your current plan focuses on progressive overload and maintaining a high-protein intake. Meals are optimized for 40/30/30 macros and a mild caloric deficit to support recomposition goals. Training emphasizes compound movements with progressive volume increases."
        );
      } else {
        setAiSummary(
          "While your plan is being prepared, here are some general tips: Focus on consistent protein intake (1g per lb of bodyweight), prioritize compound movements in your training, and maintain a slight caloric deficit if your goal is fat loss. Your coach will customize these recommendations based on your specific needs."
        );
      }
    }, 1200);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[70vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF2E2E] mx-auto mb-4"></div>
          <p className="text-gray-400">Loading your plan...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
          Your <span className="text-[#FF2E2E]">Plan</span>
        </h1>
        <p className="text-gray-400 mt-2">
          Everything your expert has set up for you.
        </p>
      </motion.div>

      {/* Plan Status Badge */}
      {planStatus && (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#FF2E2E]/10 border border-[#FF2E2E]/20 text-[#FF2E2E] text-sm font-medium"
        >
          <span className="w-2 h-2 rounded-full bg-[#FF2E2E] animate-pulse"></span>
          Status: {planStatus}
        </motion.div>
      )}

      {/* Empty State */}
      {!planData && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="text-center p-12 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl"
        >
          <FolderOpen className="w-12 h-12 mx-auto mb-4 text-[#FF2E2E]" />
          <h2 className="text-xl font-semibold mb-2">No Plan Yet</h2>
          <p className="text-gray-400 mb-6 max-w-md mx-auto">
            Your coach is preparing your custom plan. It will appear here soon.
          </p>
          <Button
            onClick={handleAIExplain}
            className="bg-[#FF2E2E] hover:bg-[#FF2E2E]/90 rounded-full"
          >
            <Sparkles className="w-4 h-4 mr-2" /> Ask AI for Tips
          </Button>

          {aiSummary && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 p-4 rounded-xl bg-gradient-to-br from-[#1E1E1E]/40 to-[#0A0A0A]/60 border border-white/10 text-gray-300 text-sm max-w-xl mx-auto"
            >
              {aiSummary}
            </motion.div>
          )}
        </motion.div>
      )}

      {/* Plan Sections */}
      {planData && (
        <div className="grid gap-6">
          {sections.map(({ id, icon: Icon, title, content, isFile, fileUrl }) => (
            <motion.div
              key={id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: sections.indexOf(sections.find(s => s.id === id)!) * 0.1 }}
              layout
              className="border border-white/10 rounded-2xl overflow-hidden backdrop-blur-xl bg-white/[0.03] shadow-lg hover:shadow-xl transition-shadow"
            >
              <button
                onClick={() => setExpanded(expanded === id ? null : id)}
                className="w-full flex justify-between items-center p-5 hover:bg-white/[0.05] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-5 h-5 text-[#FF2E2E]" />
                  <span className="font-semibold text-lg">{title}</span>
                </div>
                <span className="text-gray-400 text-sm">
                  {expanded === id ? "−" : "+"}
                </span>
              </button>

              <AnimatePresence>
                {expanded === id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="p-5 border-t border-white/10"
                  >
                    {isFile && fileUrl ? (
                      <div className="space-y-4">
                        <p className="text-gray-300 leading-relaxed mb-4">
                          Your plan document is available for download.
                        </p>
                        <div className="flex gap-3">
                          <Button
                            asChild
                            className="bg-[#FF2E2E] hover:bg-[#FF2E2E]/90"
                          >
                            <a
                              href={fileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2"
                            >
                              <ExternalLink className="w-4 h-4" />
                              View Plan
                            </a>
                          </Button>
                          <Button
                            asChild
                            variant="outline"
                            className="border-white/20 hover:bg-white/5"
                          >
                            <a
                              href={fileUrl}
                              download
                              className="flex items-center gap-2"
                            >
                              <Download className="w-4 h-4" />
                              Download
                            </a>
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                        {content}
                      </p>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}

          {/* AI Explanation Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="border border-white/10 rounded-2xl p-6 backdrop-blur-xl bg-gradient-to-br from-[#1E1E1E]/40 to-[#0A0A0A]/60 shadow-2xl"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Sparkles className="text-[#FF2E2E] w-5 h-5" />
                <h3 className="font-semibold text-lg">AI Plan Breakdown</h3>
              </div>
              <Button
                onClick={handleAIExplain}
                size="sm"
                className="bg-[#FF2E2E]/20 hover:bg-[#FF2E2E]/30 text-[#FF2E2E] border border-[#FF2E2E]/30"
              >
                Generate
              </Button>
            </div>
            {aiSummary ? (
              <motion.p
                key={aiSummary}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-gray-300 leading-relaxed"
              >
                {aiSummary}
              </motion.p>
            ) : (
              <p className="text-gray-500 text-sm">
                Click "Generate" to get an AI-powered breakdown of your plan.
              </p>
            )}
          </motion.div>
        </div>
      )}
    </div>
  );
}
