"use client";
import React from "react";
import { motion } from "framer-motion";

export function Loader({ label = "Loading...", className = "" }: { label?: string; className?: string }) {
  return (
    <div className={`flex items-center justify-center gap-3 ${className}`}>
      <motion.div
        className="size-4 rounded-full bg-gradient-to-tr from-cyan-400 to-fuchsia-500 shadow-[0_0_12px_rgba(56,189,248,0.6)]"
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ repeat: Infinity, duration: 0.8 }}
        style={{ imageRendering: "pixelated" }}
      />
      <motion.div
        className="size-4 rounded-full bg-gradient-to-tr from-fuchsia-500 to-purple-500 shadow-[0_0_12px_rgba(168,85,247,0.6)]"
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ repeat: Infinity, duration: 0.8, delay: 0.15 }}
        style={{ imageRendering: "pixelated" }}
      />
      <motion.div
        className="size-4 rounded-full bg-gradient-to-tr from-purple-500 to-cyan-400 shadow-[0_0_12px_rgba(192,132,252,0.6)]"
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ repeat: Infinity, duration: 0.8, delay: 0.3 }}
        style={{ imageRendering: "pixelated" }}
      />
      <span className="text-sm font-medium text-foreground/80 tracking-wide">
        {label}
      </span>
    </div>
  );
}

export default Loader;
