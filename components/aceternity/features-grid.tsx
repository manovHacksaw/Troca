"use client";
import React from "react";
import Link from "next/link";

const FEATURES = [
  {
    icon: "⛏️",
    title: "Mint Tokens",
    desc: "Create SPL tokens with custom name, symbol, and decimals.",
    href: "/mint",
  },
  {
    icon: "🔄",
    title: "Trade Offers",
    desc: "Make and accept swap offers with anyone on Solana.",
    href: "/make-offer",
  },
  {
    icon: "🛒",
    title: "Browse Offers",
    desc: "Discover open trades and find the best price.",
    href: "/offers",
  },
  {
    icon: "💼",
    title: "Portfolio",
    desc: "View balances and quickly act on your assets.",
    href: "/my-tokens",
  },
];

export default function FeaturesGrid() {
  return (
    <section className="relative bg-gradient-to-b from-black to-[#0a0a12]">
      <div className="pixel-container py-14">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="bg-gradient-to-r from-cyan-400 to-fuchsia-400 bg-clip-text text-3xl font-bold text-transparent sm:text-4xl">
            Everything you need
          </h2>
          <p className="mt-2 text-sm text-white/70">
            Clean, fast, and fun — with a subtle retro vibe.
          </p>
        </div>
        <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((f) => (
            <Link
              key={f.title}
              href={f.href}
              className="group rounded-2xl border border-white/10 bg-white/5 p-5 shadow-[0_30px_80px_-40px_rgba(59,130,246,0.35)] transition hover:translate-y-[-2px] hover:bg-white/10"
            >
              <div className="text-3xl">{f.icon}</div>
              <div className="mt-4 text-base font-semibold text-white">{f.title}</div>
              <div className="mt-1 text-sm text-white/70">{f.desc}</div>
              <div className="mt-4 text-xs font-semibold text-cyan-300 group-hover:text-fuchsia-300">
                Explore →
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
