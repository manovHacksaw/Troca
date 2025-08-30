"use client";
import React from "react";
import { motion } from "framer-motion";

export function Loader({ label = "Loading...", className = "" }: { label?: string; className?: string }) {
  return (
    <div className={`flex items-center justify-center gap-3 ${className}`}>
      <motion.div
        className="size-2.5 rounded-full bg-[var(--primary)]"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ repeat: Infinity, duration: 1 }}
      />
      <motion.div
        className="size-2.5 rounded-full bg-zinc-500"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ repeat: Infinity, duration: 1, delay: 0.15 }}
      />
      <motion.div
        className="size-2.5 rounded-full bg-zinc-600"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ repeat: Infinity, duration: 1, delay: 0.3 }}
      />
      <span className="text-sm font-medium text-zinc-300 tracking-wide">{label}</span>
    </div>
  );
}

export default Loader;
