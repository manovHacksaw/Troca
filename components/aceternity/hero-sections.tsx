"use client";
import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";

export default function HeroSections() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-black via-[#0a0a12] to-black">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(59,130,246,0.15),transparent_55%),radial-gradient(ellipse_at_bottom,rgba(217,70,239,0.15),transparent_55%)]" />
      <div className="pixel-container relative z-10 py-16 sm:py-24">
        <div className="mx-auto max-w-3xl text-center">
          <motion.h1
            className="text-balance bg-gradient-to-r from-cyan-400 via-fuchsia-400 to-purple-500 bg-clip-text text-4xl font-extrabold text-transparent sm:text-6xl"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            Troca — Solana Token Studio
          </motion.h1>
          <motion.p
            className="mt-6 text-pretty text-base text-white/70 sm:text-lg"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            Mint SPL tokens, make swap offers, and manage your portfolio — smooth, fast, and beautifully animated with a subtle 8‑bit twist.
          </motion.p>
          <motion.div
            className="mt-8 flex items-center justify-center gap-3"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
          >
            <Link
              href="/mint"
              className="rounded-2xl bg-gradient-to-r from-cyan-500 to-fuchsia-500 px-5 py-3 text-sm font-semibold text-white shadow-[0_20px_60px_-20px_rgba(217,70,239,0.55)]"
            >
              Launch App
            </Link>
            <Link
              href="/offers"
              className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white/90"
            >
              Browse Offers
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
