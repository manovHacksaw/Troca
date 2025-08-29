"use client";
import React from "react";
import Link from "next/link";

export default function CallToAction() {
  return (
    <section className="relative bg-black">
      <div className="pixel-container py-16">
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-r from-cyan-500/10 via-fuchsia-500/10 to-purple-600/10 p-8 text-center shadow-[0_40px_120px_-60px_rgba(217,70,239,0.45)]">
          <h3 className="text-balance bg-gradient-to-r from-white to-white/70 bg-clip-text text-2xl font-extrabold text-transparent sm:text-3xl">
            Ready to build on Solana?
          </h3>
          <p className="mx-auto mt-2 max-w-xl text-pretty text-sm text-white/70">
            Launch Troca and mint your token in seconds with smooth, production‑ready UX.
          </p>
          <div className="mt-6 flex items-center justify-center gap-3">
            <Link
              href="/mint"
              className="rounded-2xl bg-gradient-to-r from-cyan-500 to-fuchsia-500 px-5 py-3 text-sm font-semibold text-white"
            >
              Launch App
            </Link>
            <Link
              href="/offers"
              className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white/90"
            >
              View Offers
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
