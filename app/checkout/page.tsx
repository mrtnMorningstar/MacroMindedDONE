"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { loadStripe } from "@stripe/stripe-js";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { getCurrentUser } from "@/lib/firebase/auth";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "");

const plans: Record<string, { name: string; price: number; stripePriceId: string }> = {
  basic: {
    name: "Basic",
    price: 49,
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_BASIC_PRICE_ID || "",
  },
  pro: {
    name: "Pro",
    price: 99,
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID || "",
  },
  elite: {
    name: "Elite",
    price: 149,
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_ELITE_PRICE_ID || "",
  },
};

export default function CheckoutPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const planId = searchParams.get("plan");
  const [coupon, setCoupon] = useState("");
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    getCurrentUser().then(setUser);
  }, []);

  useEffect(() => {
    if (!planId || !plans[planId]) {
      router.push("/plans");
    }
  }, [planId, router]);

  if (!planId || !plans[planId]) {
    return null;
  }

  const plan = plans[planId];

  const handleCheckout = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to continue with checkout.",
        variant: "destructive",
      });
      router.push("/auth/login?redirect=/checkout?plan=" + planId);
      return;
    }

    setLoading(true);

    try {
      const stripe = await stripePromise;
      if (!stripe) throw new Error("Stripe failed to load");

      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planId: plan.stripePriceId,
          userId: user.uid,
          coupon: coupon || undefined,
        }),
      });

      const { sessionId } = await response.json();

      if (sessionId) {
        await stripe.redirectToCheckout({ sessionId });
      } else {
        throw new Error("Failed to create checkout session");
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to start checkout. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Checkout</CardTitle>
            <CardDescription>Complete your purchase</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="p-4 bg-secondary rounded-lg">
              <h3 className="font-semibold mb-2">{plan.name} Plan</h3>
              <p className="text-2xl font-bold text-primary">${plan.price}</p>
              <p className="text-sm text-muted-foreground">One-time payment</p>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Coupon Code (Optional)</label>
              <Input
                type="text"
                placeholder="Enter coupon code"
                value={coupon}
                onChange={(e) => setCoupon(e.target.value)}
              />
            </div>

            <Button onClick={handleCheckout} className="w-full" disabled={loading} size="lg">
              {loading ? "Processing..." : `Pay $${plan.price}`}
            </Button>

            <p className="text-xs text-center text-muted-foreground">
              By completing this purchase, you agree to our Terms of Service and Privacy Policy.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

