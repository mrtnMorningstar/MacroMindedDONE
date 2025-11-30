"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { Calculator, ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";

export function MacroCalculator() {
  const [age, setAge] = useState("");
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [activity, setActivity] = useState("1.2");
  const [result, setResult] = useState<{
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
  } | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  const calculateMacros = () => {
    if (!age || !weight || !height) return;

    setIsCalculating(true);
    setTimeout(() => {
      const ageNum = parseInt(age);
      const weightNum = parseFloat(weight);
      const heightNum = parseFloat(height);
      const activityNum = parseFloat(activity);

      // BMR calculation (Mifflin-St Jeor Equation)
      const bmr = 10 * weightNum + 6.25 * heightNum - 5 * ageNum + 5;
      const tdee = bmr * activityNum;

      // Macro split (30% protein, 40% carbs, 30% fats)
      const protein = Math.round((tdee * 0.3) / 4);
      const carbs = Math.round((tdee * 0.4) / 4);
      const fats = Math.round((tdee * 0.3) / 9);

      setResult({
        calories: Math.round(tdee),
        protein,
        carbs,
        fats,
      });
      setIsCalculating(false);
    }, 800);
  };

  return (
    <section className="py-24 bg-[#111] relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 opacity-10">
        <motion.div
          className="absolute top-1/4 left-1/4 w-64 h-64 bg-[#FF2E2E] rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            x: [0, 50, 0],
            y: [0, 30, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <ScrollReveal className="text-center mb-12">
          <motion.div
            className="inline-flex items-center gap-2 mb-4"
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            transition={{ type: "spring", delay: 0.2 }}
          >
            <Calculator className="h-8 w-8 text-[#FF2E2E]" />
            <h2 className="text-4xl md:text-6xl font-black text-white">
              Macro <span className="text-[#FF2E2E]">Calculator</span>
            </h2>
          </motion.div>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Get a quick estimate of your daily calorie and macro needs
          </p>
        </ScrollReveal>

        <ScrollReveal delay={0.2} className="max-w-3xl mx-auto">
          <Card className="bg-[#222] border-[#333]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white text-2xl">
                <Sparkles className="h-6 w-6 text-[#FF2E2E]" />
                Calculate Your Macros
              </CardTitle>
              <CardDescription className="text-gray-400">
                This is a quick estimate. For a personalized plan tailored to your exact needs, choose one of our plans.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <label htmlFor="age" className="text-sm font-semibold mb-2 block text-white">
                    Age
                  </label>
                  <Input
                    id="age"
                    name="age"
                    type="number"
                    placeholder="25"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    className="bg-[#111] border-[#333] text-white placeholder:text-gray-500 focus:border-[#FF2E2E]"
                  />
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <label htmlFor="weight" className="text-sm font-semibold mb-2 block text-white">
                    Weight (kg)
                  </label>
                  <Input
                    id="weight"
                    name="weight"
                    type="number"
                    placeholder="70"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    className="bg-[#111] border-[#333] text-white placeholder:text-gray-500 focus:border-[#FF2E2E]"
                  />
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <label htmlFor="height" className="text-sm font-semibold mb-2 block text-white">
                    Height (cm)
                  </label>
                  <Input
                    id="height"
                    name="height"
                    type="number"
                    placeholder="175"
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                    className="bg-[#111] border-[#333] text-white placeholder:text-gray-500 focus:border-[#FF2E2E]"
                  />
                </motion.div>
              </div>
              <div>
                <label htmlFor="activity" className="text-sm font-semibold mb-2 block text-white">
                  Activity Level
                </label>
                <select
                  id="activity"
                  name="activity"
                  className="flex h-12 w-full rounded-md border border-[#333] bg-[#111] px-4 py-2 text-sm text-white focus:border-[#FF2E2E] focus:outline-none"
                  value={activity}
                  onChange={(e) => setActivity(e.target.value)}
                >
                  <option value="1.2">Sedentary (little to no exercise)</option>
                  <option value="1.375">Lightly Active (light exercise 1-3 days/week)</option>
                  <option value="1.55">Moderately Active (moderate exercise 3-5 days/week)</option>
                  <option value="1.725">Very Active (hard exercise 6-7 days/week)</option>
                  <option value="1.9">Extremely Active (very hard exercise, physical job)</option>
                </select>
              </div>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  onClick={calculateMacros}
                  className="w-full bg-[#FF2E2E] hover:bg-[#FF2E2E]/90 text-white text-lg py-6"
                  disabled={isCalculating || !age || !weight || !height}
                >
                  {isCalculating ? (
                    <motion.span
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 1, repeat: Infinity }}
                    >
                      Calculating...
                    </motion.span>
                  ) : (
                    <>
                      <Calculator className="mr-2 h-5 w-5" />
                      Calculate My Macros
                    </>
                  )}
                </Button>
              </motion.div>

              {result && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ type: "spring", stiffness: 200 }}
                  className="mt-8 p-8 bg-gradient-to-br from-[#111] to-[#222] rounded-xl border border-[#333] space-y-6"
                >
                  <div className="text-center mb-6">
                    <h3 className="text-2xl font-bold text-white mb-2">
                      Your Estimated Macros
                    </h3>
                    <p className="text-sm text-gray-400">
                      For a personalized plan, get started with one of our plans below
                    </p>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { label: "Calories", value: result.calories, unit: "kcal", color: "text-[#FF2E2E]" },
                      { label: "Protein", value: result.protein, unit: "g", color: "text-white" },
                      { label: "Carbs", value: result.carbs, unit: "g", color: "text-white" },
                      { label: "Fats", value: result.fats, unit: "g", color: "text-white" },
                    ].map((item, index) => (
                      <motion.div
                        key={item.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="text-center p-4 bg-[#000] rounded-lg border border-[#333]"
                      >
                        <p className="text-sm text-gray-400 mb-2">{item.label}</p>
                        <p className={`text-3xl font-black ${item.color} mb-1`}>
                          {item.value}
                        </p>
                        <p className="text-xs text-gray-500">{item.unit}</p>
                      </motion.div>
                    ))}
                  </div>
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="pt-6 border-t border-[#333]"
                  >
                    <Link href="/plans">
                      <Button className="w-full bg-[#FF2E2E] hover:bg-[#FF2E2E]/90 text-white text-lg py-6 group">
                        Get Your Custom Plan
                        <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </Link>
                    <p className="text-center text-sm text-gray-400 mt-4">
                      Get a personalized meal plan created by our nutrition experts
                    </p>
                  </motion.div>
                </motion.div>
              )}
            </CardContent>
          </Card>
        </ScrollReveal>
      </div>
    </section>
  );
}
