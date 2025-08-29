"use client";
import React from "react";
import HeroSections from "@/components/aceternity/hero-sections";
import HeroParallax from "@/components/aceternity/hero-parallax";
import FeaturesGrid from "@/components/aceternity/features-grid";
import ContainerScrollAnimation from "@/components/aceternity/container-scroll-animation";
import HowItWorks from "@/components/aceternity/how-it-works";
import CallToAction from "@/components/aceternity/cta";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-black">
      <HeroSections />
      <div className="bg-black">
        <HeroParallax />
      </div>
      <FeaturesGrid />
      <ContainerScrollAnimation />
      <HowItWorks />
      <CallToAction />
      <footer className="border-t border-white/10 bg-black py-8">
        <div className="pixel-container text-center">
          <p className="text-xs text-white/60">
            Built on Solana • Troca © {new Date().getFullYear()}
          </p>
        </div>
      </footer>
    </div>
  );
}
