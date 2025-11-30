"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { Star, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const testimonials = [
  {
    name: "Sarah Johnson",
    role: "Lost 15kg",
    content: "MacroMinded changed my relationship with food. The personalized plan made it so easy to stick to my goals. I've never felt better!",
    rating: 5,
    image: "👩",
  },
  {
    name: "Mike Chen",
    role: "Gained 10kg Muscle",
    content: "As someone who struggled to gain weight, the expert guidance and meal plan helped me finally see results. Highly recommend!",
    rating: 5,
    image: "👨",
  },
  {
    name: "Emma Williams",
    role: "Maintained Weight",
    content: "The ongoing support and chat feature made all the difference. I feel confident about my nutrition now. Thank you MacroMinded!",
    rating: 5,
    image: "👩‍🦰",
  },
  {
    name: "David Martinez",
    role: "Lost 20kg",
    content: "Best investment I've made in my health. The meal plans are delicious and the results speak for themselves. Life-changing!",
    rating: 5,
    image: "👨‍💼",
  },
  {
    name: "Lisa Anderson",
    role: "Gained 8kg",
    content: "Finally found a solution that works! The expert team really understands nutrition. I'm stronger and healthier than ever.",
    rating: 5,
    image: "👩‍💻",
  },
];

export function Testimonials() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0,
    }),
  };

  const swipeConfidenceThreshold = 10000;
  const swipePower = (offset: number, velocity: number) => {
    return Math.abs(offset) * velocity;
  };

  const paginate = (newDirection: number) => {
    setDirection(newDirection);
    setCurrentIndex((prevIndex) => {
      if (newDirection === 1) {
        return prevIndex === testimonials.length - 1 ? 0 : prevIndex + 1;
      } else {
        return prevIndex === 0 ? testimonials.length - 1 : prevIndex - 1;
      }
    });
  };

  return (
    <section className="py-24 bg-[#000] relative overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal className="text-center mb-16">
          <h2 className="text-4xl md:text-6xl font-black mb-4 text-white">
            What Our <span className="text-[#FF2E2E]">Clients</span> Say
          </h2>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Real results from real people
          </p>
        </ScrollReveal>

        <div className="relative max-w-4xl mx-auto">
          <div className="relative h-[400px] overflow-hidden rounded-2xl">
            <AnimatePresence initial={false} custom={direction}>
              <motion.div
                key={currentIndex}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{
                  x: { type: "spring", stiffness: 300, damping: 30 },
                  opacity: { duration: 0.2 },
                }}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={1}
                onDragEnd={(e, { offset, velocity }) => {
                  const swipe = swipePower(offset.x, velocity.x);

                  if (swipe < -swipeConfidenceThreshold) {
                    paginate(1);
                  } else if (swipe > swipeConfidenceThreshold) {
                    paginate(-1);
                  }
                }}
                className="absolute inset-0"
              >
                <Card className="h-full bg-[#111] border-[#222]">
                  <CardContent className="pt-12 pb-8 px-8 h-full flex flex-col items-center justify-center text-center">
                    <motion.div
                      className="text-6xl mb-6"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.2, type: "spring" }}
                    >
                      {testimonials[currentIndex].image}
                    </motion.div>
                    <div className="flex mb-6">
                      {[...Array(testimonials[currentIndex].rating)].map((_, i) => (
                        <motion.div
                          key={i}
                          initial={{ scale: 0, rotate: -180 }}
                          animate={{ scale: 1, rotate: 0 }}
                          transition={{ delay: 0.3 + i * 0.1, type: "spring" }}
                        >
                          <Star className="h-6 w-6 fill-[#FF2E2E] text-[#FF2E2E]" />
                        </motion.div>
                      ))}
                    </div>
                    <motion.p
                      className="text-lg text-gray-300 mb-8 max-w-2xl leading-relaxed"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                    >
                      &ldquo;{testimonials[currentIndex].content}&rdquo;
                    </motion.p>
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5 }}
                    >
                      <p className="font-bold text-xl text-white mb-1">
                        {testimonials[currentIndex].name}
                      </p>
                      <p className="text-sm text-[#FF2E2E] font-semibold">
                        {testimonials[currentIndex].role}
                      </p>
                    </motion.div>
                  </CardContent>
                </Card>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation Buttons */}
          <Button
            variant="outline"
            size="icon"
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 border-[#222] bg-[#111]/80 hover:bg-[#FF2E2E] hover:border-[#FF2E2E]"
            onClick={() => paginate(-1)}
          >
            <ChevronLeft className="h-6 w-6 text-white" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 border-[#222] bg-[#111]/80 hover:bg-[#FF2E2E] hover:border-[#FF2E2E]"
            onClick={() => paginate(1)}
          >
            <ChevronRight className="h-6 w-6 text-white" />
          </Button>

          {/* Dots Indicator */}
          <div className="flex justify-center gap-2 mt-8">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  setDirection(index > currentIndex ? 1 : -1);
                  setCurrentIndex(index);
                }}
                className={`h-2 rounded-full transition-all ${
                  index === currentIndex
                    ? "w-8 bg-[#FF2E2E]"
                    : "w-2 bg-[#333] hover:bg-[#555]"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
