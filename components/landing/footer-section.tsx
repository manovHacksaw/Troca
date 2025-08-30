"use client";

import { motion } from "framer-motion";
import { Github, Twitter, MessageCircle } from "lucide-react";

export default function FooterSection() {
  return (
    <footer className="py-16 bg-gray-900">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center space-y-8"
        >
          {/* Community Links */}
          <div className="flex justify-center gap-6">
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="group p-3 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"
            >
              <Github className="w-6 h-6 text-gray-400 group-hover:text-white" />
            </a>
            <a
              href="https://discord.com"
              target="_blank"
              rel="noopener noreferrer"
              className="group p-3 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"
            >
              <MessageCircle className="w-6 h-6 text-gray-400 group-hover:text-white" />
            </a>
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              className="group p-3 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"
            >
              <Twitter className="w-6 h-6 text-gray-400 group-hover:text-white" />
            </a>
          </div>

          {/* Navigation Links */}
          <div className="flex justify-center gap-8 text-gray-400">
            <a href="#" className="hover:text-white transition-colors">
              Docs
            </a>
            <a href="https://github.com" className="hover:text-white transition-colors">
              GitHub
            </a>
            <a href="#" className="hover:text-white transition-colors">
              Contact
            </a>
          </div>

          {/* Branding */}
          <div className="border-t border-gray-800 pt-8">
            <p className="text-gray-400 mb-2">
              Powered by Solana • Built with Anchor
            </p>
            <p className="text-gray-500 text-sm">
              Built by hackathon winners, now open to everyone.
            </p>
          </div>
        </motion.div>
      </div>
    </footer>
  );
}