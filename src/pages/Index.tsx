import HeroSection from "@/components/HeroSection";
import DifferentiationSection from "@/components/DifferentiationSection";
import SavingsCalculator from "@/components/SavingsCalculator";
import FeaturesSection from "@/components/FeaturesSection";

import ServicesSection from "@/components/ServicesSection";
import HowItWorksSection from "@/components/HowItWorksSection";
import CTASection from "@/components/CTASection";

const Index = () => {
  return (
    <div className="bg-background">
      <HeroSection />
      <DifferentiationSection />
      <SavingsCalculator />
      <FeaturesSection />
      
      <ServicesSection />
      <HowItWorksSection />
      <CTASection />
    </div>
  );
};

export default Index;
