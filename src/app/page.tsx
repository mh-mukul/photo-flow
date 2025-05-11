import { ImageGallery } from '@/components/features/image-gallery';
import { AboutMe } from '@/components/features/about-me';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowDown } from 'lucide-react';

// Client component for smooth scroll functionality
function HeroClientButton() {
  "use client";
  const handleScrollToGallery = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    e.preventDefault();
    const galleryElement = document.getElementById('gallery');
    galleryElement?.scrollIntoView({ behavior: 'smooth' });
    
    // Update URL hash without page jump for better UX and history
    if (history.pushState) {
      history.pushState(null, "", "#gallery");
    } else {
      window.location.hash = "#gallery";
    }
  };

  return (
     <Button asChild size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 group rounded-lg px-8 py-6 text-lg shadow-lg hover:shadow-accent/50 transition-all duration-300 ease-in-out transform hover:scale-105">
        <Link href="#gallery" onClick={handleScrollToGallery}>
          View My Work
          <ArrowDown className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-y-1" />
        </Link>
      </Button>
  );
}

function HeroSection() {
  return (
    <section className="relative h-[calc(100svh-4rem)] min-h-[500px] flex flex-col items-center justify-center text-center bg-gradient-to-br from-background via-secondary/50 to-background p-6">
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-5"
        style={{ backgroundImage: "url('https://picsum.photos/seed/hero-bg/1920/1080')" }}
        data-ai-hint="abstract dark"
      />
      <div className="absolute inset-0 bg-background/50 backdrop-blur-sm"></div>
      <div className="relative z-10 max-w-4xl mx-auto">
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tighter mb-6">
          <span className="block text-primary leading-tight">Capturing Moments,</span>
          <span className="block text-accent leading-tight drop-shadow-md">Creating Memories.</span>
        </h1>
        <p className="max-w-2xl mx-auto text-md sm:text-lg md:text-xl text-foreground/80 mb-10 leading-relaxed">
          Welcome to PhotoFlow, a visual journey through stunning photography. Explore a curated collection of moments frozen in time, crafted with passion and precision.
        </p>
        <HeroClientButton />
      </div>
    </section>
  );
}

export default function HomePage() {
  return (
    <> {/* Using fragment as main is now in RootLayout */}
      <HeroSection />
      <ImageGallery />
      <AboutMe />
    </>
  );
}
