"use client";
import Link from "next/link";
import { useWallet } from "@solana/wallet-adapter-react";
import { useState, useEffect } from "react";

const LandingPage = () => {
  const { connected, publicKey } = useWallet();
  const [displayText, setDisplayText] = useState("");
  const fullText = "WELCOME TO TOKEN SWAP";

  // Typewriter effect
  useEffect(() => {
    let index = 0;
    const timer = setInterval(() => {
      if (index < fullText.length) {
        setDisplayText(fullText.substring(0, index + 1));
        index++;
      } else {
        clearInterval(timer);
      }
    }, 100);

    return () => clearInterval(timer);
  }, []);

  const features = [
    {
      title: "MINT TOKENS",
      description: "Create your own SPL tokens with custom names and symbols",
      icon: "⛏️",
      link: "/mint"
    },
    {
      title: "TRADE TOKENS", 
      description: "Make offers to swap your tokens with other users",
      icon: "🔄",
      link: "/make-offer"
    },
    {
      title: "BROWSE OFFERS",
      description: "Discover and accept trading offers from the community",
      icon: "🛒",
      link: "/offers"
    },
    {
      title: "MY TOKENS",
      description: "View and manage all your token holdings",
      icon: "💎",
      link: "/my-tokens"
    }
  ];

  const stats = [
    { label: "ACTIVE TRADERS", value: "1,337" },
    { label: "TOKENS CREATED", value: "42,069" },
    { label: "TRADES COMPLETED", value: "9,001" },
    { label: "TOTAL VOLUME", value: "∞ SOL" }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="pixel-container py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold text-cyan-400 mb-4">
            {displayText}
            <span className="pixel-loading">█</span>
          </h1>
          <p className="pixel-text text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
            THE ULTIMATE RETRO TRADING PLATFORM FOR SOLANA TOKENS
          </p>
          
          {!connected ? (
            <div className="pixel-card bg-red-900 border-red-400 max-w-md mx-auto">
              <p className="pixel-text text-red-100 mb-4">
                CONNECT YOUR WALLET TO START TRADING
              </p>
              <div className="pixel-btn-warning cursor-pointer px-6 py-3 text-center">
                WALLET REQUIRED
              </div>
            </div>
          ) : (
            <div className="pixel-card bg-green-900 border-green-400 max-w-md mx-auto">
              <p className="pixel-text text-green-100 mb-2">
                WALLET CONNECTED
              </p>
              <p className="pixel-text text-xs text-green-300 break-all">
                {publicKey?.toBase58()}
              </p>
            </div>
          )}
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {features.map((feature, index) => (
            <Link key={index} href={feature.link}>
              <div className="pixel-card hover:border-cyan-400 transition-all duration-200 cursor-pointer h-full">
                <div className="text-center">
                  <div className="text-4xl mb-4">{feature.icon}</div>
                  <h3 className="pixel-subtitle text-cyan-400 mb-4">
                    {feature.title}
                  </h3>
                  <p className="pixel-text text-gray-300">
                    {feature.description}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Stats Section */}
        <div className="pixel-card bg-purple-900 border-purple-400 mb-16">
          <h2 className="pixel-title text-purple-400 mb-8">PLATFORM STATS</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl font-bold text-yellow-400 mb-2">
                  {stat.value}
                </div>
                <div className="pixel-text text-purple-200">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* How It Works */}
        <div className="pixel-card bg-blue-900 border-blue-400">
          <h2 className="pixel-title text-blue-400 mb-8">HOW IT WORKS</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="pixel-card bg-yellow-600 border-yellow-400 inline-block px-4 py-2 mb-4">
                <span className="text-2xl font-bold text-black">1</span>
              </div>
              <h3 className="pixel-subtitle text-yellow-400 mb-2">CONNECT WALLET</h3>
              <p className="pixel-text text-blue-200">
                Link your Solana wallet to start trading
              </p>
            </div>
            <div className="text-center">
              <div className="pixel-card bg-yellow-600 border-yellow-400 inline-block px-4 py-2 mb-4">
                <span className="text-2xl font-bold text-black">2</span>
              </div>
              <h3 className="pixel-subtitle text-yellow-400 mb-2">MINT OR TRADE</h3>
              <p className="pixel-text text-blue-200">
                Create new tokens or make trading offers
              </p>
            </div>
            <div className="text-center">
              <div className="pixel-card bg-yellow-600 border-yellow-400 inline-block px-4 py-2 mb-4">
                <span className="text-2xl font-bold text-black">3</span>
              </div>
              <h3 className="pixel-subtitle text-yellow-400 mb-2">PROFIT!</h3>
              <p className="pixel-text text-blue-200">
                Execute trades and grow your portfolio
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="pixel-nav mt-16">
        <div className="pixel-container text-center">
          <p className="pixel-text text-gray-400">
            BUILT WITH ❤️ ON SOLANA • 2025 • TOKEN SWAP PROTOCOL
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
