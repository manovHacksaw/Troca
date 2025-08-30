"use client";

import { motion } from "framer-motion";
import { Monitor, Smartphone } from "lucide-react";
import Link from "next/link";

export default function DemoSection() {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            See It In Action
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Experience the clean, intuitive interface designed for seamless token trading
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="relative"
        >
          {/* Demo Preview */}
          <div className="bg-gradient-to-br from-gray-900 to-black rounded-2xl p-8 border border-gray-800 shadow-2xl">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <div className="ml-4 text-gray-400 text-sm font-mono">
                troca.app
              </div>
            </div>
            
            <div className="bg-gray-800 rounded-lg p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="text-[#14F195] font-bold text-lg">ACTIVE OFFERS</div>
                <div className="text-gray-400 text-sm">42 LIVE TRADES</div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-700 rounded-lg p-4 border border-gray-600">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-green-400 font-bold">OFFERING: 100 USDC</span>
                    <span className="text-xs text-gray-400">OFFER #1337</span>
                  </div>
                  <div className="text-center text-[#14F195] text-sm mb-2">↓ FOR ↓</div>
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-red-400 font-bold">WANTING: 0.5 SOL</span>
                    <span className="text-xs text-yellow-400">RATE: 0.005</span>
                  </div>
                  <button className="w-full bg-[#14F195] text-black font-bold py-2 rounded hover:bg-[#0FD085] transition-colors">
                    ACCEPT TRADE
                  </button>
                </div>
                
                <div className="bg-gray-700 rounded-lg p-4 border border-gray-600">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-green-400 font-bold">OFFERING: 1000 BONK</span>
                    <span className="text-xs text-gray-400">OFFER #420</span>
                  </div>
                  <div className="text-center text-[#14F195] text-sm mb-2">↓ FOR ↓</div>
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-red-400 font-bold">WANTING: 10 USDC</span>
                    <span className="text-xs text-yellow-400">RATE: 0.01</span>
                  </div>
                  <button className="w-full bg-[#14F195] text-black font-bold py-2 rounded hover:bg-[#0FD085] transition-colors">
                    ACCEPT TRADE
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Device Icons */}
          <div className="absolute -bottom-6 -right-6 flex gap-2">
            <div className="bg-white rounded-lg p-3 shadow-lg border border-gray-200">
              <Monitor className="w-6 h-6 text-gray-600" />
            </div>
            <div className="bg-white rounded-lg p-3 shadow-lg border border-gray-200">
              <Smartphone className="w-6 h-6 text-gray-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <Link href="/offers">
            <button className="px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:border-[#14F195] hover:text-[#14F195] transition-all duration-200">
              Try Live Demo →
            </button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}