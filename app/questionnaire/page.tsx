"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { doc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { getCurrentUser } from "@/lib/firebase/auth";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle } from "lucide-react";

const steps = [
  {
    id: "goal",
    title: "What's your goal?",
    fields: [
      { name: "goal", type: "select", options: ["Lose Weight", "Gain Weight", "Maintain Weight"] },
    ],
  },
  {
    id: "personal",
    title: "Personal Information",
    fields: [
      { name: "age", type: "number", label: "Age", placeholder: "25" },
      { name: "gender", type: "select", options: ["Male", "Female", "Other"], label: "Gender" },
      { name: "height", type: "number", label: "Height (cm)", placeholder: "175" },
      { name: "weight", type: "number", label: "Current Weight (kg)", placeholder: "70" },
    ],
  },
  {
    id: "activity",
    title: "Activity Level",
    fields: [
      {
        name: "activityLevel",
        type: "select",
        options: ["Sedentary", "Lightly Active", "Moderately Active", "Very Active", "Extremely Active"],
        label: "How active are you?",
      },
    ],
  },
  {
    id: "preferences",
    title: "Dietary Preferences",
    fields: [
      {
        name: "dietaryPreferences",
        type: "multiselect",
        options: ["Vegetarian", "Vegan", "Gluten-Free", "Dairy-Free", "Keto", "Paleo", "None"],
        label: "Select all that apply",
      },
      { name: "allergies", type: "text", label: "Food Allergies (optional)", placeholder: "Peanuts, Shellfish, etc." },
    ],
  },
];

export default function QuestionnairePage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);
  const [completed, setCompleted] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const handleNext = () => {
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
      }, { merge: true });

      setCompleted(true);
      toast({
        title: "Success!",
        description: "Your questionnaire has been submitted. Your plan is being created!",
      });

      setTimeout(() => {
        router.push("/dashboard");
      }, 3000);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to submit questionnaire. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateField = (name: string, value: any) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  if (completed) {
    return (
      <div className="min-h-screen flex items-center justify-center py-12 px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="mb-6"
          >
            <CheckCircle className="h-24 w-24 text-primary mx-auto" />
          </motion.div>
          <h2 className="text-3xl font-bold mb-4">Your Plan is Being Created!</h2>
          <p className="text-lg text-muted-foreground">
            Our nutrition expert is crafting your personalized meal plan. You'll be notified when it's ready.
          </p>
        </motion.div>
      </div>
    );
  }

  const currentStepData = steps[currentStep];

  return (
    <div className="min-h-screen py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-2xl">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            <span className="text-sm font-medium">
              Step {currentStep + 1} of {steps.length}
            </span>
            <span className="text-sm text-muted-foreground">
              {Math.round(((currentStep + 1) / steps.length) * 100)}%
            </span>
          </div>
          <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-primary"
              initial={{ width: 0 }}
              animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>{currentStepData.title}</CardTitle>
                <CardDescription>
                  Please provide the following information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {currentStepData.fields.map((field) => (
                  <div key={field.name}>
                    {field.label && (
                      <label className="text-sm font-medium mb-2 block">
                        {field.label}
                      </label>
                    )}
                    {field.type === "select" && (
                      <select
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        value={formData[field.name] || ""}
                        onChange={(e) => updateField(field.name, e.target.value)}
                        required
                      >
                        <option value="">Select an option</option>
                        {field.options?.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    )}
                    {field.type === "multiselect" && (
                      <div className="space-y-2">
                        {field.options?.map((opt) => (
                          <label key={opt} className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              checked={(formData[field.name] || []).includes(opt)}
                              onChange={(e) => {
                                const current = formData[field.name] || [];
                                if (e.target.checked) {
                                  updateField(field.name, [...current, opt]);
                                } else {
                                  updateField(field.name, current.filter((v: string) => v !== opt));
                                }
                              }}
                              className="rounded"
                            />
                            <span>{opt}</span>
                          </label>
                        ))}
                      </div>
                    )}
                    {(field.type === "text" || field.type === "number") && (
                      <Input
                        type={field.type}
                        placeholder={field.placeholder}
                        value={formData[field.name] || ""}
                        onChange={(e) => updateField(field.name, e.target.value)}
                        required={field.type === "number"}
                      />
                    )}
                  </div>
                ))}

                <div className="flex justify-between pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleBack}
                    disabled={currentStep === 0}
                  >
                    Back
                  </Button>
                  {currentStep === steps.length - 1 ? (
                    <Button onClick={handleSubmit} disabled={loading}>
                      {loading ? "Submitting..." : "Submit"}
                    </Button>
                  ) : (
                    <Button onClick={handleNext}>
                      Next
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

