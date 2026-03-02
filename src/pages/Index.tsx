import HeroSection from "@/components/HeroSection";
import ComparisonTable from "@/components/ComparisonTable";
import SavingsCalculator from "@/components/SavingsCalculator";
import FeaturesSection from "@/components/FeaturesSection";

import ServicesSection from "@/components/ServicesSection";
import HowItWorksSection from "@/components/HowItWorksSection";
import CTASection from "@/components/CTASection";
const Index = () => {
  return (
    <div className="bg-background">
      <HeroSection />

      {/* Premium Trust Builder */}
      <ComparisonTable />

      {/* Services/Marketplace Pillar */}
      <ServicesSection />

      <CTASection />
    </div>
  );
};

export default Index;
