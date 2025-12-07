"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { doc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { getCurrentUser } from "@/lib/firebase/auth";
import { useToast } from "@/hooks/use-toast";
import { 
  Target, 
  Ruler, 
  Users, 
  Activity, 
  UtensilsCrossed, 
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Sparkles
} from "lucide-react";

interface Step {
  id: string;
  title: string;
  description: string;
  icon: typeof Target;
}

const steps: Step[] = [
  {
    id: "goal",
    title: "What's Your Goal?",
    description: "Tell us what you want to achieve",
    icon: Target,
  },
  {
    id: "measurements",
    title: "Your Measurements",
    description: "Help us understand your body composition",
    icon: Ruler,
  },
  {
    id: "gender",
    title: "Gender",
    description: "This helps us calculate your macros accurately",
    icon: Users,
  },
  {
    id: "activity",
    title: "Activity Level",
    description: "How active is your lifestyle?",
    icon: Activity,
  },
  {
    id: "dietary",
    title: "Dietary Preferences",
    description: "Any restrictions or preferences?",
    icon: UtensilsCrossed,
  },
  {
    id: "review",
    title: "Review & Submit",
    description: "Review your information before submitting",
    icon: CheckCircle2,
  },
];

function QuestionnaireContent() {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);
  const [completed, setCompleted] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const handleNext = () => {
    // Validate current step before proceeding
    if (currentStep === 0 && !formData.goal) {
      toast({
        title: "Please select a goal",
        variant: "destructive",
      });
      return;
    }
    if (currentStep === 1 && (!formData.height || !formData.weight || !formData.age)) {
      toast({
        title: "Please fill in all measurements",
        variant: "destructive",
      });
      return;
    }
    if (currentStep === 2 && !formData.gender) {
      toast({
        title: "Please select your gender",
        variant: "destructive",
      });
      return;
    }
    if (currentStep === 3 && !formData.activityLevel) {
      toast({
        title: "Please select your activity level",
        variant: "destructive",
      });
      return;
    }

    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);

    try {
      const user = await getCurrentUser();
      if (!user) {
        router.push("/auth/login");
        return;
      }

      const sessionId = searchParams.get("session_id");
      
      // Save questionnaire data to Firestore
      await setDoc(doc(db, "questionnaires", user.uid), {
        ...formData,
        userId: user.uid,
        sessionId,
        completedAt: new Date().toISOString(),
        status: "pending",
      });

      // Update user document
      await setDoc(doc(db, "users", user.uid), {
        questionnaireCompleted: true,
        questionnaireData: formData,
        planStatus: "pending",
      }, { merge: true });

      setCompleted(true);
      toast({
        title: "Success!",
        description: "Your questionnaire has been submitted. Your plan is being created!",
      });

      setTimeout(() => {
        router.push("/dashboard");
      }, 4000);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to submit questionnaire. Please try again.",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  const updateField = (name: string, value: any) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Confirmation Screen
  if (completed) {
    return (
      <div className="flex items-center justify-center py-12 px-4 bg-gradient-to-b from-[#000] via-[#111] to-[#000]">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-2xl"
        >
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="mb-8 relative"
          >
            <div className="relative inline-block">
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  rotate: [0, 5, -5, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="absolute inset-0 bg-[#FF2E2E]/20 rounded-full blur-2xl"
              />
              <CheckCircle2 className="h-32 w-32 text-[#FF2E2E] relative z-10" />
            </div>
            <motion.div
              className="absolute -top-4 -right-4"
              animate={{
                rotate: [0, 360],
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "linear",
              }}
            >
              <Sparkles className="h-8 w-8 text-[#FF2E2E]" />
            </motion.div>
          </motion.div>

          <motion.h2
            className="text-4xl md:text-6xl font-black mb-6 text-white"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            Your Plan is Being <span className="text-[#FF2E2E]">Created!</span>
          </motion.h2>

          <motion.p
            className="text-xl text-gray-400 mb-8 leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            Our nutrition expert is crafting your personalized meal plan based on your goals and preferences.
          </motion.p>

          <motion.p
            className="text-lg text-gray-500"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            You&apos;ll be redirected to your dashboard shortly...
          </motion.p>

          <motion.div
            className="mt-8 flex justify-center gap-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
          >
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-2 h-2 bg-[#FF2E2E] rounded-full"
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: i * 0.2,
                }}
              />
            ))}
          </motion.div>
        </motion.div>
      </div>
    );
  }

  const currentStepData = steps[currentStep];
  const Icon = currentStepData.icon;
  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className="py-12 px-4 bg-gradient-to-b from-[#000] via-[#111] to-[#000]">
      <div className="container mx-auto max-w-3xl">
        {/* Progress Bar */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm font-semibold text-gray-400">
              Step {currentStep + 1} of {steps.length}
            </span>
            <span className="text-sm font-bold text-[#FF2E2E]">
              {Math.round(progress)}%
            </span>
          </div>
          <div className="w-full bg-[#222] h-3 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-[#FF2E2E] to-[#FF5555]"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>
        </motion.div>

        {/* Step Indicator */}
        <div className="flex justify-center mb-8">
          {steps.map((step, index) => {
            const StepIcon = step.icon;
            const isActive = index === currentStep;
            const isCompleted = index < currentStep;
            
            return (
              <div key={step.id} className="flex items-center">
                <motion.div
                  className={`relative flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all ${
                    isActive
                      ? "border-[#FF2E2E] bg-[#FF2E2E]/20 scale-110"
                      : isCompleted
                      ? "border-[#FF2E2E] bg-[#FF2E2E]"
                      : "border-[#333] bg-[#222]"
                  }`}
                  animate={isActive ? { scale: [1, 1.1, 1] } : {}}
                  transition={{ duration: 2, repeat: isActive ? Infinity : 0 }}
                >
                  <StepIcon
                    className={`h-6 w-6 ${
                      isActive || isCompleted ? "text-[#FF2E2E]" : "text-gray-500"
                    }`}
                  />
                  {isCompleted && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -bottom-1 -right-1"
                    >
                      <CheckCircle2 className="h-4 w-4 text-[#FF2E2E]" />
                    </motion.div>
                  )}
                </motion.div>
                {index < steps.length - 1 && (
                  <div
                    className={`w-12 h-0.5 mx-2 ${
                      isCompleted ? "bg-[#FF2E2E]" : "bg-[#333]"
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 50, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -50, scale: 0.95 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="bg-[#111] border-[#222] shadow-2xl">
              <CardHeader className="text-center pb-8">
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", delay: 0.1 }}
                  className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[#FF2E2E]/10 mb-4"
                >
                  <Icon className="h-10 w-10 text-[#FF2E2E]" />
                </motion.div>
                <CardTitle className="text-3xl font-black text-white mb-2">
                  {currentStepData.title}
                </CardTitle>
                <CardDescription className="text-gray-400 text-lg">
                  {currentStepData.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Step 1: Goal */}
                {currentStep === 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {["Lose Weight", "Gain Weight", "Maintain Weight"].map((goal) => (
                      <motion.button
                        key={goal}
                        onClick={() => updateField("goal", goal)}
                        className={`p-6 rounded-xl border-2 transition-all text-left ${
                          formData.goal === goal
                            ? "border-[#FF2E2E] bg-[#FF2E2E]/10 scale-105"
                            : "border-[#333] bg-[#222] hover:border-[#FF2E2E]/50"
                        }`}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <div className="text-3xl mb-2">
                          {goal === "Lose Weight" && "🔥"}
                          {goal === "Gain Weight" && "💪"}
                          {goal === "Maintain Weight" && "⚖️"}
                        </div>
                        <div className="font-bold text-white">{goal}</div>
                      </motion.button>
                    ))}
                  </div>
                )}

                {/* Step 2: Measurements */}
                {currentStep === 1 && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-sm font-semibold mb-2 block text-white">
                        Height (cm)
                      </label>
                      <Input
                        type="number"
                        placeholder="175"
                        value={formData.height || ""}
                        onChange={(e) => updateField("height", e.target.value)}
                        className="bg-[#222] border-[#333] text-white focus:border-[#FF2E2E] h-12"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-sm font-semibold mb-2 block text-white">
                        Weight (kg)
                      </label>
                      <Input
                        type="number"
                        placeholder="70"
                        value={formData.weight || ""}
                        onChange={(e) => updateField("weight", e.target.value)}
                        className="bg-[#222] border-[#333] text-white focus:border-[#FF2E2E] h-12"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-sm font-semibold mb-2 block text-white">
                        Age
                      </label>
                      <Input
                        type="number"
                        placeholder="25"
                        value={formData.age || ""}
                        onChange={(e) => updateField("age", e.target.value)}
                        className="bg-[#222] border-[#333] text-white focus:border-[#FF2E2E] h-12"
                        required
                      />
                    </div>
                  </div>
                )}

                {/* Step 3: Gender */}
                {currentStep === 2 && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {["Male", "Female", "Other"].map((gender) => (
                      <motion.button
                        key={gender}
                        onClick={() => updateField("gender", gender)}
                        className={`p-6 rounded-xl border-2 transition-all ${
                          formData.gender === gender
                            ? "border-[#FF2E2E] bg-[#FF2E2E]/10 scale-105"
                            : "border-[#333] bg-[#222] hover:border-[#FF2E2E]/50"
                        }`}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <div className="text-3xl mb-2">
                          {gender === "Male" && "👨"}
                          {gender === "Female" && "👩"}
                          {gender === "Other" && "👤"}
                        </div>
                        <div className="font-bold text-white">{gender}</div>
                      </motion.button>
                    ))}
                  </div>
                )}

                {/* Step 4: Activity Level */}
                {currentStep === 3 && (
                  <div className="space-y-3">
                    {[
                      { label: "Sedentary", desc: "Little to no exercise", icon: "🛋️" },
                      { label: "Lightly Active", desc: "Light exercise 1-3 days/week", icon: "🚶" },
                      { label: "Moderately Active", desc: "Moderate exercise 3-5 days/week", icon: "🏃" },
                      { label: "Very Active", desc: "Hard exercise 6-7 days/week", icon: "💪" },
                      { label: "Extremely Active", desc: "Very hard exercise, physical job", icon: "🔥" },
                    ].map((activity) => (
                      <motion.button
                        key={activity.label}
                        onClick={() => updateField("activityLevel", activity.label)}
                        className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                          formData.activityLevel === activity.label
                            ? "border-[#FF2E2E] bg-[#FF2E2E]/10"
                            : "border-[#333] bg-[#222] hover:border-[#FF2E2E]/50"
                        }`}
                        whileHover={{ scale: 1.02, x: 5 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="flex items-center gap-4">
                          <span className="text-2xl">{activity.icon}</span>
                          <div>
                            <div className="font-semibold text-white">{activity.label}</div>
                            <div className="text-sm text-gray-400">{activity.desc}</div>
                          </div>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                )}

                {/* Step 5: Dietary Preferences */}
                {currentStep === 4 && (
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-semibold mb-3 block text-white">
                        Dietary Preferences (Select all that apply)
                      </label>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {["Vegetarian", "Vegan", "Gluten-Free", "Dairy-Free", "Keto", "Paleo", "None"].map((pref) => (
                          <motion.button
                            key={pref}
                            onClick={() => {
                              const current = formData.dietaryPreferences || [];
                              if (pref === "None") {
                                updateField("dietaryPreferences", ["None"]);
                              } else {
                                const filtered = current.filter((p: string) => p !== "None");
                                if (current.includes(pref)) {
                                  updateField("dietaryPreferences", filtered.filter((p: string) => p !== pref));
                                } else {
                                  updateField("dietaryPreferences", [...filtered, pref]);
                                }
                              }
                            }}
                            className={`p-3 rounded-lg border-2 transition-all ${
                              (formData.dietaryPreferences || []).includes(pref)
                                ? "border-[#FF2E2E] bg-[#FF2E2E]/10"
                                : "border-[#333] bg-[#222] hover:border-[#FF2E2E]/50"
                            }`}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <div className="text-sm font-medium text-white">{pref}</div>
                          </motion.button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-semibold mb-2 block text-white">
                        Food Allergies (optional)
                      </label>
                      <Input
                        type="text"
                        placeholder="Peanuts, Shellfish, etc."
                        value={formData.allergies || ""}
                        onChange={(e) => updateField("allergies", e.target.value)}
                        className="bg-[#222] border-[#333] text-white focus:border-[#FF2E2E]"
                      />
                    </div>
                  </div>
                )}

                {/* Step 6: Review */}
                {currentStep === 5 && (
                  <div className="space-y-4">
                    <div className="bg-[#222] rounded-xl p-6 space-y-4">
                      <div className="flex justify-between items-center border-b border-[#333] pb-3">
                        <span className="text-gray-400">Goal</span>
                        <span className="text-white font-semibold">{formData.goal}</span>
                      </div>
                      <div className="flex justify-between items-center border-b border-[#333] pb-3">
                        <span className="text-gray-400">Height</span>
                        <span className="text-white font-semibold">{formData.height} cm</span>
                      </div>
                      <div className="flex justify-between items-center border-b border-[#333] pb-3">
                        <span className="text-gray-400">Weight</span>
                        <span className="text-white font-semibold">{formData.weight} kg</span>
                      </div>
                      <div className="flex justify-between items-center border-b border-[#333] pb-3">
                        <span className="text-gray-400">Age</span>
                        <span className="text-white font-semibold">{formData.age}</span>
                      </div>
                      <div className="flex justify-between items-center border-b border-[#333] pb-3">
                        <span className="text-gray-400">Gender</span>
                        <span className="text-white font-semibold">{formData.gender}</span>
                      </div>
                      <div className="flex justify-between items-center border-b border-[#333] pb-3">
                        <span className="text-gray-400">Activity Level</span>
                        <span className="text-white font-semibold">{formData.activityLevel}</span>
                      </div>
                      <div className="flex justify-between items-center border-b border-[#333] pb-3">
                        <span className="text-gray-400">Dietary Preferences</span>
                        <span className="text-white font-semibold">
                          {(formData.dietaryPreferences || []).join(", ") || "None"}
                        </span>
                      </div>
                      {formData.allergies && (
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400">Allergies</span>
                          <span className="text-white font-semibold">{formData.allergies}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Navigation Buttons */}
                <div className="flex justify-between pt-6 border-t border-[#333]">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleBack}
                    disabled={currentStep === 0 || loading}
                    className="border-[#333] text-white hover:bg-[#222] hover:border-[#FF2E2E]"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>
                  {currentStep === steps.length - 1 ? (
                    <Button
                      onClick={handleSubmit}
                      disabled={loading}
                      className="bg-[#FF2E2E] hover:bg-[#FF2E2E]/90 text-white"
                    >
                      {loading ? (
                        "Submitting..."
                      ) : (
                        <>
                          Submit
                          <CheckCircle2 className="ml-2 h-4 w-4" />
                        </>
                      )}
                    </Button>
                  ) : (
                    <Button
                      onClick={handleNext}
                      className="bg-[#FF2E2E] hover:bg-[#FF2E2E]/90 text-white"
                    >
                      Next
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

export default function QuestionnairePage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF2E2E] mx-auto mb-4"></div>
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    }>
      <QuestionnaireContent />
    </Suspense>
  );
}
