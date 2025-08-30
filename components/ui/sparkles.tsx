"use client";
import React, { useId } from "react";
import { cn } from "@/lib/utils";

interface SparklesProps {
  id?: string;
  background?: string;
  minSize?: number;
  maxSize?: number;
  particleDensity?: number;
  className?: string;
  particleColor?: string;
}

export const SparklesCore = (props: SparklesProps) => {
  const {
    id,
    className,
    background = "transparent",
    minSize = 0.4,
    maxSize = 1,
    particleDensity = 1200,
    particleColor = "#FFF",
  } = props;
  const generateId = useId();
  const sparklesId = id || generateId;

  return (
    <div className={cn("relative", className)}>
      <svg
        className="animate-pulse absolute inset-0 h-full w-full"
        viewBox="0 0 400 400"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g opacity="0.8">
          <circle cx="100" cy="100" r="1" fill={particleColor}>
            <animate
              attributeName="opacity"
              values="0;1;0"
              dur="2s"
              repeatCount="indefinite"
              begin="0s"
            />
          </circle>
          <circle cx="200" cy="150" r="1" fill={particleColor}>
            <animate
              attributeName="opacity"
              values="0;1;0"
              dur="2s"
              repeatCount="indefinite"
              begin="0.5s"
            />
          </circle>
          <circle cx="300" cy="200" r="1" fill={particleColor}>
            <animate
              attributeName="opacity"
              values="0;1;0"
              dur="2s"
              repeatCount="indefinite"
              begin="1s"
            />
          </circle>
          <circle cx="150" cy="250" r="1" fill={particleColor}>
            <animate
              attributeName="opacity"
              values="0;1;0"
              dur="2s"
              repeatCount="indefinite"
              begin="1.5s"
            />
          </circle>
        </g>
      </svg>
    </div>
  );
};

export const Sparkles = ({ children, ...props }: SparklesProps & { children: React.ReactNode }) => {
  return (
    <div className="relative">
      <SparklesCore {...props} />
      {children}
    </div>
  );
};