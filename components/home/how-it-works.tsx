"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { ClipboardList, FileText, MessageSquare, CheckCircle } from "lucide-react";

const steps = [
  {
    icon: ClipboardList,
    title: "Choose Your Plan",
    description: "Select from Basic, Pro, or Elite plans tailored to your goals.",
    color: "from-[#FF2E2E] to-[#FF5555]",
  },
  {
    icon: FileText,
    title: "Complete Questionnaire",
    description: "Share your goals, preferences, and lifestyle for a personalized plan.",
    color: "from-[#FF5555] to-[#FF7777]",
  },
  {
    icon: MessageSquare,
    title: "Expert Creates Your Plan",
    description: "Our nutrition expert crafts your custom meal plan based on your needs.",
    color: "from-[#FF7777] to-[#FF9999]",
  },
  {
    icon: CheckCircle,
    title: "Get Your Plan & Results",
    description: "Receive your plan and start your journey to better nutrition.",
    color: "from-[#FF9999] to-[#FFBBBB]",
  },
];

export function HowItWorks() {
  return (
    <section className="py-24 bg-[#111] relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, #FF2E2E 1px, transparent 0)`,
          backgroundSize: "40px 40px",
        }} />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <ScrollReveal className="text-center mb-16">
          <h2 className="text-4xl md:text-6xl font-black mb-4 text-white">
            How It <span className="text-[#FF2E2E]">Works</span>
          </h2>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Simple steps to get your personalized meal plan
          </p>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 50, rotateX: -15 }}
                whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{
                  delay: index * 0.15,
                  duration: 0.6,
                  type: "spring",
                  stiffness: 100,
                }}
                whileHover={{
                  y: -10,
                  rotateY: 5,
                  scale: 1.02,
                }}
                style={{
                  perspective: "1000px",
                }}
              >
                <Card className="h-full bg-[#222] border-[#333] hover:border-[#FF2E2E] transition-all duration-300 group cursor-pointer">
                  <CardHeader className="relative overflow-hidden">
                    <motion.div
                      className={`absolute inset-0 bg-gradient-to-br ${step.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}
                    />
                    <motion.div
                      className={`w-16 h-16 rounded-xl bg-gradient-to-br ${step.color} flex items-center justify-center mb-4 relative z-10 shadow-lg shadow-[#FF2E2E]/50`}
                      whileHover={{
                        rotate: [0, -10, 10, -10, 0],
                        scale: 1.1,
                      }}
                      transition={{ duration: 0.5 }}
                    >
                      <Icon className="h-8 w-8 text-white" />
                    </motion.div>
                    <CardTitle className="text-xl text-white relative z-10">
                      {step.title}
                    </CardTitle>
                    <motion.div
                      className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#FF2E2E] to-transparent opacity-0 group-hover:opacity-100 transition-opacity"
                    />
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base text-gray-400">
                      {step.description}
                    </CardDescription>
                    <motion.div
                      className="mt-4 text-[#FF2E2E] font-semibold text-sm opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      Step {index + 1} →
                    </motion.div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
