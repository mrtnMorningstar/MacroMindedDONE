"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface SliderProps {
  min?: number;
  max?: number;
  step?: number;
  value?: number[];
  onValueChange?: (value: number[]) => void;
  className?: string;
  disabled?: boolean;
}

export function Slider({
  min = 0,
  max = 100,
  step = 1,
  value = [0],
  onValueChange,
  className,
  disabled = false,
}: SliderProps) {
  const [internalValue, setInternalValue] = React.useState(value[0]);

  React.useEffect(() => {
    setInternalValue(value[0]);
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = Number(e.target.value);
    setInternalValue(newValue);
    onValueChange?.([newValue]);
  };

  const percentage = ((internalValue - min) / (max - min)) * 100;

  return (
    <div className={cn("relative w-full", className)}>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={internalValue}
        onChange={handleChange}
        disabled={disabled}
        className={cn(
          "w-full h-2 bg-[#222] rounded-lg appearance-none cursor-pointer",
          "focus:outline-none focus:ring-2 focus:ring-[#FF2E2E] focus:ring-offset-2 focus:ring-offset-[#0b0b0b]",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          "[&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#FF2E2E] [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-lg",
          "[&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-[#FF2E2E] [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:shadow-lg"
        )}
        style={{
          background: `linear-gradient(to right, #FF2E2E 0%, #FF2E2E ${percentage}%, #222 ${percentage}%, #222 100%)`,
        }}
      />
    </div>
  );
}

