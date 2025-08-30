"use client";
import React from "react";
import { motion } from "framer-motion";

export type StepStatus = "pending" | "active" | "complete" | "error";

export interface Step {
  label: string;
  status: StepStatus;
  hint?: string;
}

export function MultiStepLoader({
  steps,
  className = "",
}: {
  steps: Step[];
  className?: string;
}) {
  const activeIndex = steps.findIndex((s) => s.status === "active");
  const progress = Math.max(
    0,
    Math.min(100, Math.round(((steps.filter((s) => s.status === "complete").length + (activeIndex >= 0 ? 0.5 : 0)) / steps.length) * 100))
  );

  return (
    <div className={`w-full rounded-xl bg-[#0F0F0F] border border-[var(--border)] p-4 ${className}`}>
      <div className="mb-3 h-2 w-full overflow-hidden rounded-full bg-[#111213]">
        <motion.div
          className="h-full rounded-full bg-[var(--primary)]"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ type: "spring", stiffness: 120, damping: 20 }}
        />
      </div>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        {steps.map((step, idx) => (
          <div key={idx} className="flex items-center gap-3 rounded-lg bg-[#111213] p-3">
            <StatusDot status={step.status} />
            <div className="flex-1">
              <div className="text-sm font-semibold text-white/90">{step.label}</div>
              {step.hint ? (
                <div className="text-xs text-white/60">{step.hint}</div>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function StatusDot({ status }: { status: StepStatus }) {
  const color =
    status === "complete"
      ? "bg-emerald-400"
      : status === "active"
      ? "bg-[var(--primary)]"
      : status === "error"
      ? "bg-rose-400"
      : "bg-slate-600";

  return (
    <motion.div
      className={`relative size-3 rounded-full ${color}`}
      animate={status === "active" ? { scale: [1, 1.2, 1] } : undefined}
      transition={{ repeat: Infinity, duration: 1.2 }}
      style={{ imageRendering: "pixelated" }}
    >
      <span className="absolute -inset-1 rounded-full bg-current opacity-20 blur-sm" />
    </motion.div>
  );
}

export default MultiStepLoader;
