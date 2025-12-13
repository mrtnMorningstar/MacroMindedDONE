"use client";

import { useState, useEffect } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { useAuth } from "@/context/auth-context";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Save, Target, Scale, Activity, Flame, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function GoalsPage() {
  const { user } = useAuth();
  const [startWeight, setStartWeight] = useState("");
  const [targetWeight, setTargetWeight] = useState("");
  const [activityGoal, setActivityGoal] = useState(10000);
  const [calorieTarget, setCalorieTarget] = useState(2400);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (!user?.uid) return;

    const fetchGoal = async () => {
      try {
        const ref = doc(db, "users", user.uid, "goals", "default");
        const snap = await getDoc(ref);
        if (snap.exists()) {
          const data = snap.data();
          setStartWeight(data.startWeight?.toString() || "");
          setTargetWeight(data.targetWeight?.toString() || "");
          setActivityGoal(data.activityGoal || 10000);
          setCalorieTarget(data.calorieTarget || 2400);
        }
      } catch (error) {
        console.error("Error fetching goal:", error);
      } finally {
        setLoading(false);
      }
    };

    setLoading(true);
    fetchGoal();
  }, [user?.uid]);

  const handleSave = async () => {
    if (!user?.uid) {
      toast({
        title: "Error",
        description: "Please log in to save your goals.",
        variant: "destructive",
      });
      return;
    }

    if (!startWeight || !targetWeight) {
      toast({
        title: "Missing Information",
        description: "Please enter both starting weight and target weight.",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    setSaved(false);

    try {
      await setDoc(
        doc(db, "users", user.uid, "goals", "default"),
        {
          goalType: Number(targetWeight) < Number(startWeight) ? "weight_loss" : "weight_gain",
          startWeight: Number(startWeight),
          targetWeight: Number(targetWeight),
          activityGoal,
          calorieTarget,
          startDate: new Date(),
          updatedAt: new Date(),
        },
        { merge: true }
      );

      setSaved(true);
      toast({
        title: "Success",
        description: "Your goals have been saved successfully!",
      });

      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error("Error saving goal:", error);
      toast({
        title: "Error",
        description: "Failed to save your goals. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF2E2E] mx-auto mb-4"></div>
          <p className="text-gray-400">Loading your goals...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-10"
    >
      <div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
          Your <span className="text-[#FF2E2E]">Goals</span>
        </h1>
        <p className="text-gray-400 mt-2">Adjust and track your targets anytime.</p>
      </div>

      <div className="space-y-6 bg-white/[0.03] p-6 rounded-2xl border border-white/10 backdrop-blur-xl shadow-lg">
        <div className="grid sm:grid-cols-2 gap-6">
          <div>
            <label className="text-gray-300 flex items-center gap-2 mb-2">
              <Scale className="w-4 h-4 text-[#FF2E2E]" /> Starting Weight (kg)
            </label>
            <Input
              value={startWeight}
              onChange={(e) => setStartWeight(e.target.value)}
              placeholder="80"
              type="number"
              className="bg-[#111] border-[#222] text-white"
            />
          </div>
          <div>
            <label className="text-gray-300 flex items-center gap-2 mb-2">
              <Target className="w-4 h-4 text-[#FF2E2E]" /> Target Weight (kg)
            </label>
            <Input
              value={targetWeight}
              onChange={(e) => setTargetWeight(e.target.value)}
              placeholder="75"
              type="number"
              className="bg-[#111] border-[#222] text-white"
            />
          </div>
        </div>

        <div>
          <label className="text-gray-300 flex items-center gap-2 mb-2">
            <Activity className="w-4 h-4 text-[#FF2E2E]" /> Daily Step Goal
          </label>
          <Slider
            min={2000}
            max={20000}
            step={500}
            value={[activityGoal]}
            onValueChange={(v) => setActivityGoal(v[0])}
          />
          <p className="text-sm text-gray-400 mt-2">{activityGoal.toLocaleString()} steps/day</p>
        </div>

        <div>
          <label className="text-gray-300 flex items-center gap-2 mb-2">
            <Flame className="w-4 h-4 text-[#FF2E2E]" /> Daily Calorie Target
          </label>
          <Slider
            min={1200}
            max={4000}
            step={100}
            value={[calorieTarget]}
            onValueChange={(v) => setCalorieTarget(v[0])}
          />
          <p className="text-sm text-gray-400 mt-2">{calorieTarget.toLocaleString()} kcal/day</p>
        </div>

        <Button
          onClick={handleSave}
          disabled={saving}
          className="bg-[#FF2E2E] hover:bg-[#FF2E2E]/80 rounded-full mt-4"
        >
          {saved ? (
            <>
              <CheckCircle2 className="w-4 h-4 mr-2" /> Saved!
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" /> {saving ? "Saving..." : "Save Goal"}
            </>
          )}
        </Button>
      </div>

      {/* Info Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="rounded-2xl border border-white/10 p-6 bg-gradient-to-br from-[#1E1E1E]/40 to-[#0A0A0A]/60 backdrop-blur-xl"
      >
        <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
          <Target className="w-5 h-5 text-[#FF2E2E]" />
          About Your Goals
        </h3>
        <p className="text-gray-300 text-sm leading-relaxed">
          Setting clear goals helps you stay motivated and track your progress. Your goals will be used to calculate
          your progress percentage and generate personalized insights. You can update them anytime as your journey evolves.
        </p>
      </motion.div>
    </motion.div>
  );
}

