"use client";

import { motion } from "framer-motion";
import { Shield, Zap, Coins, Users } from "lucide-react";

const features = [
  {
    icon: Shield,
    title: "Secure",
    description: "Tokens are held in vault PDAs with built-in security guarantees."
  },
  {
    icon: Zap,
    title: "Fast & Low-cost",
    description: "Powered by Solana's high-speed, low-fee blockchain infrastructure."
  },
  {
    icon: Coins,
    title: "Any Token",
    description: "Trade any SPL token with complete flexibility and control."
  },
  {
    icon: Users,
    title: "Permissionless",
    description: "Open to everyone, no KYC or registration required."
  }
];

export default function FeaturesSection() {
  return (
    <section className="py-24 bg-gray-50">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Why Choose Troca
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Built for traders who value security, speed, and simplicity
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="group"
            >
              <div className="bg-white rounded-xl p-6 border border-gray-200 hover:border-[#14F195] transition-all duration-300 hover:shadow-lg h-full">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-[#14F195] rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300 flex-shrink-0">
                    <feature.icon className="w-6 h-6 text-black" />
                  </div>
                  
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}