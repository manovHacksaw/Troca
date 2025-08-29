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
    <div className={`w-full rounded-2xl bg-black/40 border border-white/10 p-4 shadow-[0_0_40px_rgba(99,102,241,0.2)] ${className}`}>
      <div className="mb-3 h-2 w-full overflow-hidden rounded-full bg-white/10">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-fuchsia-500 to-purple-600"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ type: "spring", stiffness: 120, damping: 20 }}
        />
      </div>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        {steps.map((step, idx) => (
          <div key={idx} className="flex items-center gap-3 rounded-xl bg-white/5 p-3">
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
      ? "from-emerald-400 to-green-600"
      : status === "active"
      ? "from-cyan-400 to-fuchsia-500"
      : status === "error"
      ? "from-red-400 to-rose-600"
      : "from-slate-500 to-slate-700";

  return (
    <motion.div
      className={`relative size-3 rounded-full bg-gradient-to-tr ${color} shadow-[0_0_16px_rgba(34,197,94,0.5)]`}
      animate={status === "active" ? { scale: [1, 1.2, 1] } : undefined}
      transition={{ repeat: Infinity, duration: 1.2 }}
      style={{ imageRendering: "pixelated" }}
    >
      <span className="absolute -inset-1 rounded-full bg-current opacity-20 blur-sm" />
    </motion.div>
  );
}

export default MultiStepLoader;
