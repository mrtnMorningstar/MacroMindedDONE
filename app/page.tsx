import { Hero } from "@/components/home/hero";
import { HowItWorks } from "@/components/home/how-it-works";
import { MacroCalculator } from "@/components/home/macro-calculator";
import { Testimonials } from "@/components/home/testimonials";
import { CTA } from "@/components/home/cta";

export default function HomePage() {
  return (
    <>
      <Hero />
      <HowItWorks />
      <MacroCalculator />
      <Testimonials />
      <CTA />
    </>
  );
}

