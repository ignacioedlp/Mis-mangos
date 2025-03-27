import HeroSection from "@/components/hero-section";
import TechStackSection from "@/components/tech-stack-section";

export default function Home() {
  return (
    <main className="flex-1">
      <HeroSection />
      <TechStackSection />
    </main>
  );
}
