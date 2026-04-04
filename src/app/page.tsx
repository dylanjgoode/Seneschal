import { Nav } from "@/components/landing/nav";
import { Hero } from "@/components/landing/hero";
import { WhyNow } from "@/components/landing/why-now";
import { HowItWorks } from "@/components/landing/how-it-works";
import { BottomCta } from "@/components/landing/bottom-cta";
import { Faq } from "@/components/landing/faq";
import { Footer } from "@/components/landing/footer";

export default function Home() {
  return (
    <div className="landing-grain dark min-h-screen bg-[oklch(0.16_0_0)] text-white selection:bg-white/20">
      <Nav />
      <Hero />
      <WhyNow />
      <HowItWorks />
      <BottomCta />
      <Faq />
      <Footer />
    </div>
  );
}
