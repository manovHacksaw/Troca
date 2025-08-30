"use client";

import { motion } from "framer-motion";
import { Plus, Lock, ArrowLeftRight } from "lucide-react";

const steps = [
  {
    icon: Plus,
    title: "Mint",
    description: "Create your own SPL tokens with custom names and symbols on Solana."
  },
  {
    icon: Lock,
    title: "Offer", 
    description: "Lock your tokens in secure vault PDAs and set your trading terms."
  },
  {
    icon: ArrowLeftRight,
    title: "Swap",
    description: "Execute instant, trustless token swaps with other traders."
  }
];

export default function HowItWorks() {
  return (
    <section className="py-24 bg-[#0A0A0A]">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            How It Works
          </h2>
          <p className="text-xl text-zinc-400 max-w-2xl mx-auto">
            Three simple steps to start trading tokens on Solana
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              viewport={{ once: true }}
              className="group relative"
            >
              <div className="rounded-2xl p-8 h-full border border-[var(--border)] bg-[#111213] hover:border-[#14F195] transition-all duration-300">
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="w-16 h-16 bg-[#14F195] rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <step.icon className="w-8 h-8 text-black" />
                  </div>
                  
                  <h3 className="text-2xl font-bold text-white">
                    {step.title}
                  </h3>
                  
                  <p className="text-zinc-400 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>

              {/* Step Number */}
              <div className="absolute -top-4 -left-4 w-8 h-8 bg-white/10 text-white rounded-full flex items-center justify-center font-bold text-sm">
                {index + 1}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
