"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Activity, TrendingUp, Flame, MessageSquare, Save, Sparkles } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { collection, addDoc, query, where, onSnapshot, orderBy, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { useToast } from "@/hooks/use-toast";

interface LogEntry {
  id?: string;
  userId?: string;
  date?: any;
  weight?: number;
  calories?: number;
  steps?: number;
  note?: string;
  compliancePercent?: number;
  createdAt?: any;
}

export default function LogPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [weight, setWeight] = useState("");
  const [calories, setCalories] = useState("");
  const [steps, setSteps] = useState("");
  const [note, setNote] = useState("");
  const [entries, setEntries] = useState<LogEntry[]>([]);
  const [aiMessage, setAiMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Real-time listener for entries
  useEffect(() => {
    if (!user?.uid) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const progressRef = collection(db, "progress");
    
    let q;
    try {
      q = query(
        progressRef,
        where("userId", "==", user.uid),
        orderBy("date", "desc")
      );
    } catch (error: any) {
      // If index error, use fallback query without orderBy
      if (error.code === "failed-precondition") {
        q = query(progressRef, where("userId", "==", user.uid));
      } else {
        console.error("Error setting up query:", error);
        setLoading(false);
        return;
      }
    }

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const loadedEntries = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as LogEntry[];

        // Sort by date if orderBy wasn't applied (check by trying to access queryConstraints or by checking if entries are already sorted)
        if (loadedEntries.length > 1) {
          // Check if entries need sorting by comparing first two dates
          const firstDate = loadedEntries[0].date?.toDate ? loadedEntries[0].date.toDate() : new Date(loadedEntries[0].date || 0);
          const secondDate = loadedEntries[1].date?.toDate ? loadedEntries[1].date.toDate() : new Date(loadedEntries[1].date || 0);
          
          // If not in descending order, sort them
          if (firstDate.getTime() < secondDate.getTime()) {
            loadedEntries.sort((a, b) => {
              const dateA = a.date?.toDate ? a.date.toDate() : new Date(a.date || 0);
              const dateB = b.date?.toDate ? b.date.toDate() : new Date(b.date || 0);
              return dateB.getTime() - dateA.getTime();
            });
          }
        }

        setEntries(loadedEntries);
        setLoading(false);
      },
      (error) => {
        console.error("Error loading entries:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user?.uid]);

  const generateAiFeedback = (entry: LogEntry): string => {
    const cal = entry.calories || 0;
    const wt = entry.weight || 0;
    const st = entry.steps || 0;

    if (!cal && !wt && !st) {
      return "Great start! Try entering full data for more detailed insights tomorrow.";
    }

    if (st > 9000 && cal > 0 && cal < 2200) {
      return "🔥 Excellent balance! You're in a strong caloric zone with solid activity — great consistency.";
    }
    if (cal > 3000) {
      return "⚠️ Calories a bit high today — focus on portion control or add a walk to balance it.";
    }
    if (wt > 0 && wt < 70) {
      return "👏 You're trending leaner — keep your protein up to retain strength.";
    }
    if (st > 10000) {
      return "💪 Outstanding step count! Your activity level is on point.";
    }
    if (cal > 0 && cal < 1500) {
      return "📊 Calories seem low — make sure you're fueling your body adequately for your goals.";
    }
    return "✅ Entry logged successfully — keep this consistency up!";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.uid) {
      toast({
        title: "Error",
        description: "Please log in to save entries",
        variant: "destructive",
      });
      return;
    }

    const weightNum = weight ? parseFloat(weight) : 0;
    const caloriesNum = calories ? parseFloat(calories) : 0;
    const stepsNum = steps ? parseFloat(steps) : 0;

    if (!weightNum && !caloriesNum && !stepsNum) {
      toast({
        title: "Error",
        description: "Please enter at least one metric (weight, calories, or steps)",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);

    try {
      // Calculate compliance percent (simplified - can be enhanced)
      let compliancePercent = 0;
      if (caloriesNum > 0) {
        // Assume target is 2000-2500 range for compliance calculation
        const targetCalories = 2250;
        const diff = Math.abs(caloriesNum - targetCalories);
        compliancePercent = Math.max(0, Math.min(100, 100 - (diff / targetCalories) * 100));
      }

      // Save to Firestore
      const newEntry = {
        userId: user.uid,
        date: serverTimestamp(),
        weight: weightNum || null,
        calories: caloriesNum || null,
        steps: stepsNum || null,
        note: note || null,
        compliancePercent: compliancePercent || null,
        createdAt: serverTimestamp(),
      };

      await addDoc(collection(db, "progress"), newEntry);

      // Generate AI feedback
      const feedback = generateAiFeedback({
        weight: weightNum,
        calories: caloriesNum,
        steps: stepsNum,
        note,
      });
      setAiMessage(feedback);

      // Add to local state
      const formattedEntry: LogEntry = {
        id: Date.now().toString(),
        date: new Date(),
        weight: weightNum || undefined,
        calories: caloriesNum || undefined,
        steps: stepsNum || undefined,
        note: note || undefined,
      };
      setEntries([formattedEntry, ...entries]);

      // Clear form
      setWeight("");
      setCalories("");
      setSteps("");
      setNote("");

      toast({
        title: "Success",
        description: "Entry logged successfully!",
      });
    } catch (error) {
      console.error("Error saving entry:", error);
      toast({
        title: "Error",
        description: "Failed to save entry. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (date: any) => {
    if (!date) return "";
    try {
      const dateObj = date.toDate ? date.toDate() : new Date(date);
      return dateObj.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return "";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[70vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF2E2E] mx-auto mb-4"></div>
          <p className="text-gray-400">Loading your logs...</p>
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
          Log Your <span className="text-[#FF2E2E]">Progress</span>
        </h1>
        <p className="text-gray-400 mt-2">
          Daily logs keep your coach and AI insights up to date.
        </p>
      </motion.div>

      {/* Log Form */}
      <motion.form
        onSubmit={handleSubmit}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="rounded-2xl border border-white/10 p-6 bg-white/[0.03] backdrop-blur-xl space-y-5"
      >
        <div className="grid sm:grid-cols-3 gap-4">
          <div>
            <label className="text-gray-300 text-sm mb-2 block">Weight (kg)</label>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#FF2E2E] flex-shrink-0" />
              <Input
                type="number"
                step="0.1"
                placeholder="e.g. 80"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                className="bg-[#111] border-[#222] text-white"
              />
            </div>
          </div>

          <div>
            <label className="text-gray-300 text-sm mb-2 block">Calories</label>
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-[#FF2E2E] flex-shrink-0" />
              <Input
                type="number"
                placeholder="e.g. 2400"
                value={calories}
                onChange={(e) => setCalories(e.target.value)}
                className="bg-[#111] border-[#222] text-white"
              />
            </div>
          </div>

          <div>
            <label className="text-gray-300 text-sm mb-2 block">Steps</label>
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#FF2E2E] flex-shrink-0" />
              <Input
                type="number"
                placeholder="e.g. 10000"
                value={steps}
                onChange={(e) => setSteps(e.target.value)}
                className="bg-[#111] border-[#222] text-white"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="text-gray-300 text-sm mb-2 block">Notes</label>
          <Textarea
            placeholder="How did you feel today? Any observations?"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            className="bg-[#111] border-[#222] text-white placeholder:text-gray-500"
          />
        </div>

        <Button
          type="submit"
          disabled={saving}
          className="bg-[#FF2E2E] hover:bg-[#FF2E2E]/90 rounded-full px-6"
        >
          <Save className="w-4 h-4 mr-2" /> {saving ? "Saving..." : "Log Entry"}
        </Button>
      </motion.form>

      {/* AI Feedback */}
      <AnimatePresence>
        {aiMessage && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="rounded-2xl border border-white/10 p-4 bg-gradient-to-br from-[#1E1E1E]/40 to-[#0A0A0A]/60 backdrop-blur-xl"
          >
            <div className="flex items-center gap-3 mb-2">
              <Sparkles className="text-[#FF2E2E] w-5 h-5" />
              <h3 className="font-semibold">AI Feedback</h3>
            </div>
            <p className="text-gray-300">{aiMessage}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Logged Entries */}
      {entries.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="rounded-2xl border border-white/10 p-6 bg-white/[0.03] backdrop-blur-xl"
        >
          <h2 className="text-lg font-semibold mb-4">Recent Logs</h2>
          <div className="space-y-3">
            <AnimatePresence>
              {entries.slice(0, 10).map((entry, index) => (
                <motion.div
                  key={entry.id || index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: index * 0.05 }}
                  className="border border-white/5 rounded-lg p-4 hover:bg-white/[0.03] transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="text-gray-400 text-sm mb-2">{formatDate(entry.date)}</p>
                      <div className="flex flex-wrap gap-3 text-sm text-gray-300">
                        {entry.weight && (
                          <span className="flex items-center gap-1">
                            <TrendingUp className="w-3 h-3 text-[#FF2E2E]" />
                            {entry.weight}kg
                          </span>
                        )}
                        {entry.calories && (
                          <span className="flex items-center gap-1">
                            <Flame className="w-3 h-3 text-[#FF2E2E]" />
                            {entry.calories}cal
                          </span>
                        )}
                        {entry.steps && (
                          <span className="flex items-center gap-1">
                            <Activity className="w-3 h-3 text-[#FF2E2E]" />
                            {entry.steps.toLocaleString()} steps
                          </span>
                        )}
                      </div>
                      {entry.note && (
                        <p className="text-gray-400 text-sm mt-2 italic">"{entry.note}"</p>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
          {entries.length > 10 && (
            <p className="text-gray-500 text-sm mt-4 text-center">
              Showing 10 most recent entries. View all on the Progress page.
            </p>
          )}
        </motion.div>
      )}

      {entries.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12 rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl"
        >
          <Activity className="w-12 h-12 mx-auto mb-4 text-gray-600" />
          <p className="text-gray-400">No entries yet</p>
          <p className="text-sm text-gray-500 mt-1">Start logging your progress above!</p>
        </motion.div>
      )}
    </div>
  );
}

