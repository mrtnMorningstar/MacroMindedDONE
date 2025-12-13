"use client";

import { Skeleton } from "@/components/ui/skeleton";

export function WeeklyReportSkeleton() {
  return (
    <div className="rounded-2xl border border-white/10 p-6 bg-gradient-to-br from-[#1E1E1E]/40 to-[#0A0A0A]/60 backdrop-blur-xl">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-3">
          <Skeleton className="w-5 h-5 rounded-full bg-white/10" />
          <Skeleton className="w-32 h-5 bg-white/10" />
        </div>
        <Skeleton className="w-20 h-8 rounded-full bg-white/10" />
      </div>
      <div className="space-y-2">
        <Skeleton className="w-full h-4 bg-white/10" />
        <Skeleton className="w-5/6 h-4 bg-white/10" />
        <Skeleton className="w-4/6 h-4 bg-white/10" />
      </div>
    </div>
  );
}

export function SmartRecommendationsSkeleton() {
  return (
    <div className="rounded-2xl border border-white/10 p-6 bg-gradient-to-br from-[#1E1E1E]/50 to-[#0A0A0A]/70 backdrop-blur-xl">
      <div className="flex items-center gap-3 mb-4">
        <Skeleton className="w-5 h-5 rounded-full bg-white/10" />
        <Skeleton className="w-40 h-5 bg-white/10" />
      </div>
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-start gap-3">
            <Skeleton className="w-2 h-2 rounded-full bg-white/10 mt-2" />
            <Skeleton className="flex-1 h-4 bg-white/10" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function ProgressTimelineSkeleton() {
  return (
    <div className="relative border-l-2 border-[#FF2E2E]/30 ml-6 pl-8 space-y-6">
      {[1, 2, 3].map((i) => (
        <div key={i} className="relative">
          <div className="absolute -left-[2.4rem] top-2">
            <Skeleton className="w-5 h-5 rounded-full bg-white/10" />
          </div>
          <div className="p-5 rounded-xl border border-white/10 bg-white/[0.03]">
            <div className="flex justify-between mb-3">
              <Skeleton className="w-32 h-5 bg-white/10" />
              <Skeleton className="w-16 h-4 bg-white/10" />
            </div>
            <div className="flex gap-4 mb-3">
              <Skeleton className="w-20 h-6 bg-white/10 rounded-lg" />
              <Skeleton className="w-24 h-6 bg-white/10 rounded-lg" />
              <Skeleton className="w-20 h-6 bg-white/10 rounded-lg" />
            </div>
            <Skeleton className="w-full h-4 bg-white/10" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function ChartSkeleton() {
  return (
    <div className="rounded-2xl border border-white/10 p-6 bg-white/[0.03] backdrop-blur-xl">
      <div className="flex justify-between items-center mb-4">
        <Skeleton className="w-40 h-5 bg-white/10" />
        <Skeleton className="w-24 h-4 bg-white/10" />
      </div>
      <Skeleton className="w-full h-64 bg-white/10 rounded-lg" />
    </div>
  );
}

