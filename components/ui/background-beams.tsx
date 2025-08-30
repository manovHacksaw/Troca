"use client";
import { cn } from "@/lib/utils";
import React from "react";

export const BackgroundBeams = ({ className }: { className?: string }) => {
  const paths = [
    "M-380 -189C-380 -189 -312 216 152 343C616 470 684 875 684 875",
    "M-373 -197C-373 -197 -305 208 159 335C623 462 691 867 691 867",
    "M-366 -205C-366 -205 -298 200 166 327C630 454 698 859 698 859",
    "M-359 -213C-359 -213 -291 192 173 319C637 446 705 851 705 851",
    "M-352 -221C-352 -221 -284 184 180 311C644 438 712 843 712 843",
    "M-345 -229C-345 -229 -277 176 187 303C651 430 719 835 719 835",
  ];

  return (
    <div
      className={cn(
        "absolute inset-0 h-full w-full bg-neutral-950 [mask-image:radial-gradient(350px_200px_at_top,transparent_20%,white)]",
        className
      )}
    >
      <svg
        className="absolute inset-0 h-full w-full"
        width="100%"
        height="100%"
        viewBox="0 0 696 316"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g opacity="0.4">
          {paths.map((path, index) => (
            <path
              key={index}
              d={path}
              stroke={`url(#gradient-${index})`}
              strokeOpacity="0.4"
              strokeWidth="0.5"
            />
          ))}
        </g>
        <defs>
          {paths.map((_, index) => (
            <linearGradient
              key={index}
              id={`gradient-${index}`}
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <stop offset="0%" stopColor="#14F195" stopOpacity="0" />
              <stop offset="50%" stopColor="#14F195" stopOpacity="1" />
              <stop offset="100%" stopColor="#14F195" stopOpacity="0" />
            </linearGradient>
          ))}
        </defs>
      </svg>
    </div>
  );
};