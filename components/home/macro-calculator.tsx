"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calculator } from "lucide-react";

export function MacroCalculator() {
  const [age, setAge] = useState("");
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [activity, setActivity] = useState("1.2");
  const [result, setResult] = useState<{ calories: number; protein: number; carbs: number; fats: number } | null>(null);

  const calculateMacros = () => {
    if (!age || !weight || !height) return;

    const ageNum = parseInt(age);
    const weightNum = parseFloat(weight);
    const heightNum = parseFloat(height);
    const activityNum = parseFloat(activity);

    // BMR calculation (Mifflin-St Jeor Equation)
    const bmr = 10 * weightNum + 6.25 * heightNum - 5 * ageNum + 5;
    const tdee = bmr * activityNum;

    // Macro split (example: 30% protein, 40% carbs, 30% fats)
    const protein = Math.round((tdee * 0.3) / 4);
    const carbs = Math.round((tdee * 0.4) / 4);
    const fats = Math.round((tdee * 0.3) / 9);

    setResult({
      calories: Math.round(tdee),
      protein,
      carbs,
      fats,
    });
  };

  return (
    <section className="py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">Macro Calculator</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Get a quick estimate of your daily calorie and macro needs
          </p>
        </motion.div>

        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                Calculate Your Macros
              </CardTitle>
              <CardDescription>
                This is a quick estimate. For a personalized plan, choose one of our plans.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Age</label>
                  <Input
                    type="number"
                    placeholder="25"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Weight (kg)</label>
                  <Input
                    type="number"
                    placeholder="70"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Height (cm)</label>
                  <Input
                    type="number"
                    placeholder="175"
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Activity Level</label>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={activity}
                  onChange={(e) => setActivity(e.target.value)}
                >
                  <option value="1.2">Sedentary</option>
                  <option value="1.375">Lightly Active</option>
                  <option value="1.55">Moderately Active</option>
                  <option value="1.725">Very Active</option>
                  <option value="1.9">Extremely Active</option>
                </select>
              </div>
              <Button onClick={calculateMacros} className="w-full">
                Calculate
              </Button>

              {result && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mt-6 p-6 bg-secondary rounded-lg space-y-3"
                >
                  <h3 className="text-lg font-semibold mb-4">Your Estimated Macros</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Calories</p>
                      <p className="text-2xl font-bold text-primary">{result.calories}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Protein (g)</p>
                      <p className="text-2xl font-bold">{result.protein}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Carbs (g)</p>
                      <p className="text-2xl font-bold">{result.carbs}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Fats (g)</p>
                      <p className="text-2xl font-bold">{result.fats}</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}

