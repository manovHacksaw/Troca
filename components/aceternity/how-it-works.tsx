"use client";
import React from "react";

const STEPS = [
  { n: 1, title: "Connect Wallet", desc: "Use Phantom or Solflare on Solana Devnet." },
  { n: 2, title: "Mint or Trade", desc: "Create tokens or make swap offers in seconds." },
  { n: 3, title: "Manage", desc: "Track holdings and act fast with smooth UX." },
];

export default function HowItWorks() {
  return (
    <section className="relative bg-gradient-to-b from-[#0a0a12] to-black">
      <div className="pixel-container py-16">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-3xl font-bold text-transparent sm:text-4xl">
            How it works
          </h2>
          <p className="mt-2 text-sm text-white/70">Three simple steps to get started.</p>
        </div>
        <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-3">
          {STEPS.map((s) => (
            <div key={s.n} className="rounded-2xl border border-white/10 bg-white/5 p-6 text-center">
              <div className="mx-auto grid size-10 place-items-center rounded-xl bg-gradient-to-tr from-yellow-400/20 to-amber-500/20 text-base font-bold text-yellow-300">
                {s.n}
              </div>
              <div className="mt-4 text-base font-semibold text-white">{s.title}</div>
              <div className="mt-1 text-sm text-white/70">{s.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
