"use client";

import React from "react";

interface LogoProps {
  className?: string;
  iconOnly?: boolean;
  size?: "sm" | "md" | "lg" | "xl";
}

export default function Logo({ className = "", iconOnly = false, size = "md" }: LogoProps) {
  const sizeClasses = {
    sm: { icon: "w-6 h-6", text: "text-base", gap: "gap-2" },
    md: { icon: "w-10 h-10", text: "text-lg", gap: "gap-3" },
    lg: { icon: "w-12 h-12", text: "text-2xl", gap: "gap-4" },
    xl: { icon: "w-16 h-16", text: "text-4xl", gap: "gap-4" },
  };

  const currentSize = sizeClasses[size];

  return (
    <div className={`flex items-center ${currentSize.gap} ${className}`}>
      <div className={`${currentSize.icon} bg-gradient-to-br from-teal-400 to-teal-600 rounded-xl flex items-center justify-center shadow-lg shadow-teal-500/20 transform transition-transform hover:scale-110 duration-300`}>
        <svg className="w-1/2 h-1/2 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
        </svg>
      </div>
      {!iconOnly && (
        <h2 className={`${currentSize.text} font-black leading-none tracking-tight flex items-center`}>
          Task<span className="text-teal-500">Flow</span>
        </h2>
      )}
    </div>
  );
}
