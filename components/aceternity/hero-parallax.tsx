"use client";
import React, { useEffect, useRef } from "react";

const ICONS = ["🪙", "⚡", "💎", "🎛️", "🛰️", "🌐", "🧩", "📈", "🔒", "🧠"];

export default function HeroParallax() {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onMove = (e: MouseEvent) => {
      const { innerWidth, innerHeight } = window;
      const x = (e.clientX / innerWidth - 0.5) * 10;
      const y = (e.clientY / innerHeight - 0.5) * 10;
      el.style.setProperty("--x", `${x}`);
      el.style.setProperty("--y", `${y}`);
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  return (
    <div
      ref={ref}
      className="pointer-events-none relative mx-auto grid h-[240px] w-full max-w-5xl grid-cols-5 place-items-center gap-8 opacity-90 [transform:translate3d(calc(var(--x,0)*1px),calc(var(--y,0)*1px),0)]"
    >
      {Array.from({ length: 20 }).map((_, i) => (
        <div
          key={i}
          className="grid size-16 place-items-center rounded-2xl border border-white/10 bg-gradient-to-tr from-white/5 to-white/0 text-2xl text-white shadow-[0_8px_30px_-10px_rgba(59,130,246,0.25)]"
          style={{ imageRendering: "pixelated" }}
        >
          {ICONS[i % ICONS.length]}
        </div>
      ))}
    </div>
  );
}
