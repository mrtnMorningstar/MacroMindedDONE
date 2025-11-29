import { PlanCard, Plan } from "@/components/plans/plan-card";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Plans - MacroMinded",
  description: "Choose the perfect meal plan for your goals",
};

const plans: Plan[] = [
  {
    id: "basic",
    name: "Basic",
    price: 49,
    description: "Perfect for getting started",
    features: [
      "Custom meal plan",
      "7-day meal schedule",
      "Macro breakdown",
      "Email support",
    ],
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_BASIC_PRICE_ID || "",
  },
  {
    id: "pro",
    name: "Pro",
    price: 99,
    description: "Most popular choice",
    features: [
      "Everything in Basic",
      "14-day meal schedule",
      "Recipe collection",
      "Priority email support",
      "1 revision included",
    ],
    popular: true,
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID || "",
  },
  {
    id: "elite",
    name: "Elite",
    price: 149,
    description: "Complete nutrition solution",
    features: [
      "Everything in Pro",
      "30-day meal schedule",
      "Full recipe database",
      "Direct chat support",
      "Unlimited revisions",
      "Progress tracking",
    ],
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_ELITE_PRICE_ID || "",
  },
];

export default function PlansPage() {
  return (
    <div className="min-h-screen py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Choose Your Plan</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Select the perfect meal plan to help you achieve your goals
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
          {plans.map((plan, index) => (
            <PlanCard key={plan.id} plan={plan} index={index} />
          ))}
        </div>
      </div>
    </div>
  );
}
