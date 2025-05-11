"use client";

import Image from 'next/image';
import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Card, CardContent } from '@/components/ui/card';

// Register GSAP plugin if it hasn't been already (safe to call multiple times)
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const galleryImages = [
  { id: 1, src: 'https://picsum.photos/seed/img1/600/800', alt: 'Abstract mountains', hint: 'mountains abstract', aspectRatio: 'aspect-[3/4]' },
  { id: 2, src: 'https://picsum.photos/seed/img2/800/600', alt: 'City skyline at dusk', hint: 'city dusk', aspectRatio: 'aspect-[4/3]' },
  { id: 3, src: 'https://picsum.photos/seed/img3/700/700', alt: 'Forest path in autumn', hint: 'forest autumn', aspectRatio: 'aspect-square' },
  { id: 4, src: 'https://picsum.photos/seed/img4/600/900', alt: 'Coastal waves crashing', hint: 'ocean waves', aspectRatio: 'aspect-[2/3]' },
  { id: 5, src: 'https://picsum.photos/seed/img5/800/500', alt: 'Desert landscape', hint: 'desert dunes', aspectRatio: 'aspect-[8/5]' },
  { id: 6, src: 'https://picsum.photos/seed/img6/700/800', alt: 'Close-up of a flower', hint: 'flower macro', aspectRatio: 'aspect-[7/8]' },
  { id: 7, src: 'https://picsum.photos/seed/img7/900/600', alt: 'Starry night sky', hint: 'stars galaxy', aspectRatio: 'aspect-[3/2]' },
  { id: 8, src: 'https://picsum.photos/seed/img8/600/700', alt: 'Urban street art', hint: 'street art', aspectRatio: 'aspect-[6/7]' },
  { id: 9, src: 'https://picsum.photos/seed/img9/800/800', alt: 'Wildlife photography', hint: 'animal wildlife', aspectRatio: 'aspect-square' },
];

export function ImageGallery() {
  const galleryRef = useRef<HTMLDivElement>(null);
  const imageElementsRef = useRef<(HTMLDivElement | null)[]>([]);

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
          delay: (index % (gsap.utils.snap(3, imageElements.length / 3) || 3)) * 0.15, // Stagger based on columns
        }
      );
    });

    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
      imageElementsRef.current = []; // Clear refs on unmount
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
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 auto-rows-fr" // auto-rows-fr for equal height rows in grid
        >
          {galleryImages.map((image, index) => (
            <div
              key={image.id}
              ref={(el) => (imageElementsRef.current[index] = el)}
              className="gallery-item group opacity-0" // Initial opacity 0 for GSAP
            >
              <Card className="overflow-hidden bg-card border-border shadow-lg hover:shadow-accent/30 transition-all duration-300 ease-in-out rounded-lg h-full flex flex-col">
                <CardContent className="p-0 flex-grow">
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
                     <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                       <p className="text-primary text-lg font-semibold px-4 text-center">{image.alt}</p>
                     </div>
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
