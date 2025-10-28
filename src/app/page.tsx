import Header from '@/components/landingpage/Header';
import Hero from '@/components/landingpage/Hero';
import Features from '@/components/landingpage/Features';
import HowItWorks from '@/components/landingpage/HowItWorks';
import Stats from '@/components/landingpage/Stats';
import Footer from '@/components/landingpage/Footer';

export default function Home() {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <Hero />
        <Features />
        <HowItWorks />
        <Stats />
      </main>
      <Footer />
    </div>
  );
}
