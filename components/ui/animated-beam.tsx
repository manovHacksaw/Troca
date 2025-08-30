"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface AnimatedBeamProps {
  className?: string;
  containerRef?: React.RefObject<HTMLElement>;
  fromRef: React.RefObject<HTMLElement>;
  toRef: React.RefObject<HTMLElement>;
  curvature?: number;
  reverse?: boolean;
  duration?: number;
  delay?: number;
}

export const AnimatedBeam: React.FC<AnimatedBeamProps> = ({
  className,
  containerRef,
  fromRef,
  toRef,
  curvature = 0,
  reverse = false,
  duration = Math.random() * 3 + 4,
  delay = 0,
}) => {
  return (
    <svg
      fill="none"
      width="200"
      height="200"
      xmlns="http://www.w3.org/2000/svg"
      className={cn(
        "pointer-events-none absolute left-0 top-0 transform-gpu stroke-2",
        className
      )}
      viewBox="0 0 200 200"
    >
      <path
        d="M50 100 Q 100 50 150 100"
        stroke="url(#gradient)"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
      />
      <defs>
        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#14F195" stopOpacity="0" />
          <stop offset="50%" stopColor="#14F195" stopOpacity="1" />
          <stop offset="100%" stopColor="#14F195" stopOpacity="0" />
        </linearGradient>
      </defs>
      <motion.circle
        r="2"
        fill="#14F195"
        initial={{ offsetDistance: "0%" }}
        animate={{ offsetDistance: "100%" }}
        transition={{
          duration,
          delay,
          repeat: Infinity,
          ease: "linear",
        }}
        style={{
          offsetPath: "path('M50 100 Q 100 50 150 100')",
        }}
      />
    </svg>
  );
};