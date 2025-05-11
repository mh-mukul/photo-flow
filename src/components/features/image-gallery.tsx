// @ts-nocheck
"use client";

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Card, CardContent } from '@/components/ui/card';
import { TypingAnimation } from '@/components/effects/typing-animation';

// Register GSAP plugin if it hasn't been already (safe to call multiple times)
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const galleryImages = [
  { id: 1, src: 'https://picsum.photos/seed/img1/800/600', alt: 'Abstract Mountains', hint: 'mountains abstract', aspectRatio: 'aspect-[4/3]', description: "Vast mountain ranges under a cloudy sky, rendered in an abstract style." },
  { id: 2, src: 'https://picsum.photos/seed/img2/800/600', alt: 'City Skyline at Dusk', hint: 'city dusk', aspectRatio: 'aspect-[4/3]', description: "A sprawling city skyline illuminated as dusk settles over the urban landscape." },
  { id: 3, src: 'https://picsum.photos/seed/img3/800/600', alt: 'Forest Path in Autumn', hint: 'forest autumn', aspectRatio: 'aspect-[4/3]', description: "A serene forest path carpeted with colorful autumn leaves, inviting a peaceful walk." },
  { id: 4, src: 'https://picsum.photos/seed/img4/800/600', alt: 'Coastal Waves Crashing', hint: 'ocean waves', aspectRatio: 'aspect-[4/3]', description: "Powerful ocean waves dynamically crashing against a rugged and rocky coastline." },
  { id: 5, src: 'https://picsum.photos/seed/img5/800/600', alt: 'Desert Landscape Panorama', hint: 'desert dunes', aspectRatio: 'aspect-[4/3]', description: "An expansive panoramic view of desert dunes under a clear, vast blue sky." },
  { id: 6, src: 'https://picsum.photos/seed/img6/800/600', alt: 'Close-up of a Vibrant Flower', hint: 'flower macro', aspectRatio: 'aspect-[4/3]', description: "A detailed macro photograph capturing the vibrant colors and intricate textures of a flower." },
  { id: 7, src: 'https://picsum.photos/seed/img7/800/600', alt: 'Starry Night Sky View', hint: 'stars galaxy', aspectRatio: 'aspect-[4/3]', description: "A breathtaking view of a starry night sky, with a distant galaxy subtly visible." },
  { id: 8, src: 'https://picsum.photos/seed/img8/800/600', alt: 'Urban Street Art Mural', hint: 'street art', aspectRatio: 'aspect-[4/3]', description: "Colorful and expressive street art adorning an urban wall, showcasing modern creativity." },
  { id: 9, src: 'https://picsum.photos/seed/img9/800/600', alt: 'Wildlife in Natural Habitat', hint: 'animal wildlife', aspectRatio: 'aspect-[4/3]', description: "A majestic wild animal captured in a stunning moment within its natural habitat." },
];

export function ImageGallery() {
  const galleryRef = useRef<HTMLDivElement>(null);
  const imageElementsRef = useRef<(HTMLDivElement | null)[]>([]);
  const [hoveredImageId, setHoveredImageId] = useState<number | null>(null);

  useEffect(() => {
    const imageElements = imageElementsRef.current.filter(el => el !== null) as HTMLDivElement[];
    
    if (imageElements.length === 0) return;

    imageElements.forEach((el, index) => {
      gsap.fromTo(
        el,
        { opacity: 0, y: 60, scale: 0.9 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.7,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 90%', 
            end: 'bottom 10%',
            toggleActions: 'play none none none', 
          },
          delay: (index % (gsap.utils.snap(3, imageElements.length / 3) || 3)) * 0.15,
        }
      );
    });

    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
      imageElementsRef.current = [];
    };
  }, []);

  return (
    <section id="gallery" className="py-16 md:py-24 bg-secondary">
      <div className="container max-w-screen-xl mx-auto px-4">
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-center mb-12 md:mb-16 text-primary tracking-tight">
          Portfolio Showcase
        </h2>
        <div
          ref={galleryRef}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 auto-rows-fr"
        >
          {galleryImages.map((image, index) => (
            <div
              key={image.id}
              ref={(el) => (imageElementsRef.current[index] = el)}
              className="gallery-item group opacity-0 relative"
              onMouseEnter={() => setHoveredImageId(image.id)}
              onMouseLeave={() => setHoveredImageId(null)}
            >
              <Card className="overflow-hidden bg-card border-border shadow-lg hover:shadow-accent/30 transition-all duration-300 ease-in-out rounded-lg h-full flex flex-col">
                <CardContent className="p-0 flex-grow relative">
                  <div className={`relative w-full ${image.aspectRatio} overflow-hidden`}>
                    <Image
                      src={image.src}
                      alt={image.alt}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-500 ease-in-out"
                      priority={index < 3}
                      data-ai-hint={image.hint}
                    />
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/90 via-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-in-out flex flex-col justify-end h-[110px]">
                    <h3 className="text-primary font-semibold text-base mb-1 truncate">{image.alt}</h3>
                    {image.description && (
                      <div className="h-[3.75rem] overflow-hidden"> {/* Approx 3 lines for text-sm (0.875rem * 1.5 line-height * 3 lines) */}
                        <TypingAnimation
                          text={image.description}
                          speed={25} // Adjusted speed
                          className="text-sm text-foreground/90 leading-relaxed"
                          startCondition={hoveredImageId === image.id}
                        />
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
