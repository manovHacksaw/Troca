"use client";

import { motion } from "framer-motion";

const stats = [
  { label: "Active Traders", value: "1,337", suffix: "" },
  { label: "Tokens Created", value: "42", suffix: "K+" },
  { label: "Trades Completed", value: "9", suffix: "K+" },
  { label: "Total Volume", value: "∞", suffix: " SOL" }
];

export default function StatsSection() {
  return (
    <section className="py-16 bg-black">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div className="text-3xl md:text-4xl font-bold text-[#14F195] mb-2">
                {stat.value}
                <span className="text-white">{stat.suffix}</span>
              </div>
              <div className="text-gray-400 font-medium">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}