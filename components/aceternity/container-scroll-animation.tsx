"use client";
import React from "react";

export default function ContainerScrollAnimation() {
  return (
    <section className="relative bg-black">
      <div className="pixel-container py-16">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-3xl font-bold text-transparent sm:text-4xl">
            See Troca in action
          </h2>
          <p className="mt-2 text-sm text-white/70">
            Smooth scroll previews of the experience — mint, make offers, and manage tokens.
          </p>
        </div>
        <div className="mt-10 overflow-hidden rounded-2xl border border-white/10 bg-white/5">
          <div className="no-scrollbar flex snap-x snap-mandatory overflow-x-auto">
            {["Mint", "Offers", "Portfolio"].map((label, idx) => (
              <div key={label} className="snap-center shrink-0 basis-full p-6 sm:p-10">
                <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-[#0b0b13] to-[#0a0a10] p-6 shadow-[0_30px_80px_-40px_rgba(217,70,239,0.35)]">
                  <div className="mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="size-2 rounded-full bg-rose-500" />
                      <div className="size-2 rounded-full bg-amber-500" />
                      <div className="size-2 rounded-full bg-emerald-500" />
                    </div>
                    <span className="text-xs font-medium text-white/60">{label} Preview</span>
                  </div>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="aspect-video rounded-xl bg-gradient-to-tr from-cyan-500/10 to-fuchsia-500/10" />
                    <div className="aspect-video rounded-xl bg-gradient-to-tr from-purple-500/10 to-cyan-500/10" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
