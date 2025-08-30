"use client";

import { motion } from "framer-motion";
import { Sparkles } from "@/components/ui/sparkles";
import { BackgroundBeams } from "@/components/ui/background-beams";
import Link from "next/link";
import { ArrowRight, Github } from "lucide-react";

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-black">
      <BackgroundBeams className="absolute inset-0" />
      
      <div className="relative z-10 max-w-6xl mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="space-y-8"
        >
          {/* Main Headline */}
          <div className="space-y-4">
            <Sparkles
              id="hero-sparkles"
              background="transparent"
              minSize={0.4}
              maxSize={1}
              particleDensity={1200}
              className="w-full h-32"
              particleColor="#14F195"
            >
              <h1 className="text-6xl md:text-8xl font-bold text-white tracking-tight">
                Troca
              </h1>
            </Sparkles>
            
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed"
            >
              Swap Solana Tokens Instantly
            </motion.p>
            
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="text-lg text-gray-400 max-w-2xl mx-auto"
            >
              Mint, offer, and swap SPL tokens securely and effortlessly.
            </motion.p>
          </div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.8 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <Link href="/offers">
              <button className="group relative px-8 py-4 bg-[#14F195] text-black font-semibold rounded-lg hover:bg-[#0FD085] transition-all duration-200 flex items-center gap-2 text-lg">
                Launch Troca
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </Link>
            
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="group px-8 py-4 border border-gray-600 text-white font-semibold rounded-lg hover:border-[#14F195] hover:text-[#14F195] transition-all duration-200 flex items-center gap-2 text-lg"
            >
              <Github className="w-5 h-5" />
              GitHub
            </a>
          </motion.div>

          {/* Swap Animation Visual */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1, duration: 0.8 }}
            className="mt-16 flex justify-center"
          >
            <div className="relative">
              <div className="flex items-center gap-8">
                <motion.div
                  animate={{ 
                    scale: [1, 1.1, 1],
                    rotate: [0, 5, 0]
                  }}
                  transition={{ 
                    duration: 2,
                    repeat: Infinity,
                    repeatType: "reverse"
                  }}
                  className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xl"
                >
                  A
                </motion.div>
                
                <motion.div
                  animate={{ x: [0, 10, 0] }}
                  transition={{ 
                    duration: 1.5,
                    repeat: Infinity,
                    repeatType: "reverse"
                  }}
                  className="text-[#14F195] text-3xl"
                >
                  ⇄
                </motion.div>
                
                <motion.div
                  animate={{ 
                    scale: [1, 1.1, 1],
                    rotate: [0, -5, 0]
                  }}
                  transition={{ 
                    duration: 2,
                    repeat: Infinity,
                    repeatType: "reverse",
                    delay: 0.5
                  }}
                  className="w-16 h-16 bg-gradient-to-br from-green-500 to-teal-600 rounded-full flex items-center justify-center text-white font-bold text-xl"
                >
                  B
                </motion.div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}