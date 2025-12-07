"use client";

export default function ShimmerLoader() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="h-8 bg-gray-800 rounded w-1/3"></div>
      <div className="h-4 bg-gray-800 rounded w-2/3"></div>
      <div className="h-4 bg-gray-800 rounded w-1/2"></div>
    </div>
  );
}

