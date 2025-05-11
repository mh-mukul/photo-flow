
import { ImageGallery } from '@/components/features/image-gallery';
import { AboutMe } from '@/components/features/about-me';
import { HeroClientButton } from '@/components/features/hero-client-button';

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
