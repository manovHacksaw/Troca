import HeroSection from "@/components/landing/hero-section";
import HowItWorks from "@/components/landing/how-it-works";
import FeaturesSection from "@/components/landing/features-section";
import DemoSection from "@/components/landing/demo-section";
import StatsSection from "@/components/landing/stats-section";
import FooterSection from "@/components/landing/footer-section";

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      <HeroSection />
      <HowItWorks />
      <FeaturesSection />
      <DemoSection />
      <StatsSection />
      <FooterSection />
    </div>
  );
}