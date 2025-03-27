import FeaturesSection from "@/components/features-section";
import HeroSection from "@/components/hero-section";


export default function Home() {
  return (
    <main className="flex-1">
      <HeroSection />
      <FeaturesSection />
    </main>
  );
}
