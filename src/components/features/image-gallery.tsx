// @ts-nocheck
"use client";

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Card, CardContent } from '@/components/ui/card';
import { TypingAnimation } from '@/components/effects/typing-animation';
import type { Photo } from '@/types';
import { getPublicPhotos } from '@/actions/photos'; // Import the server action

// Register GSAP plugin if it hasn't been already (safe to call multiple times)
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export function ImageGallery() {
  const galleryRef = useRef<HTMLDivElement>(null);
  const imageElementsRef = useRef<(HTMLDivElement | null)[]>([]);
  const [hoveredImageId, setHoveredImageId] = useState<string | null>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPhotos() {
      setIsLoading(true);
      setError(null);
      try {
        const fetchedPhotos = await getPublicPhotos();
         // Filter out photos with invalid src before setting state, client-side validation
        const validPhotos = (fetchedPhotos || []).filter(
          (photo) => typeof photo.src === 'string' && photo.src.trim() !== '' && photo.src.startsWith('http')
        );
        setPhotos(validPhotos);
      } catch (err) {
        console.error('Error fetching photos for gallery:', err);
        setError(err instanceof Error ? err.message : 'Failed to load photos.');
        setPhotos([]);
      }
      setIsLoading(false);
    }
    fetchPhotos();
  }, []);

  useEffect(() => {
    if (isLoading || photos.length === 0 || error) return;

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
    };
  }, [photos, isLoading, error]); 

  if (isLoading) {
    return (
      <section id="gallery" className="py-16 md:py-24 bg-secondary">
        <div className="container max-w-screen-xl mx-auto px-4 text-center">
          <p className="text-lg text-foreground">Loading gallery...</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section id="gallery" className="py-16 md:py-24 bg-secondary">
        <div className="container max-w-screen-xl mx-auto px-4 text-center">
           <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-center mb-12 md:mb-16 text-primary tracking-tight">
            Portfolio Showcase
          </h2>
          <p className="text-lg text-destructive">Error: {error}</p>
        </div>
      </section>
    );
  }
  
  if (!photos.length) {
    return (
      <section id="gallery" className="py-16 md:py-24 bg-secondary">
        <div className="container max-w-screen-xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-center mb-12 md:mb-16 text-primary tracking-tight">
            Portfolio Showcase
          </h2>
          <p className="text-lg text-muted-foreground">No photos available in the gallery yet. Check back soon!</p>
        </div>
      </section>
    );
  }

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
          {photos.map((image, index) => (
            <div
              key={image.id}
              ref={(el) => (imageElementsRef.current[index] = el)}
              className="gallery-item group opacity-0 relative" 
              onMouseEnter={() => setHoveredImageId(image.id)}
              onMouseLeave={() => setHoveredImageId(null)}
            >
              <Card className="overflow-hidden bg-card border-border shadow-lg hover:shadow-accent/30 transition-all duration-300 ease-in-out rounded-lg h-full flex flex-col">
                <CardContent className="p-0 flex-grow relative">
                  <div className={`relative w-full aspect-[4/3] overflow-hidden`}>
                    {image.src && (image.src.startsWith('http://') || image.src.startsWith('https://')) ? (
                        <Image
                        src={image.src}
                        alt={image.alt || 'Portfolio image'}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-500 ease-in-out"
                        priority={index < 3} 
                        data-ai-hint={image.alt ? image.alt.split(' ').slice(0,2).join(' ') : "landscape abstract"}
                        onError={(e) => {
                            // Fallback for broken image links during rendering
                            e.currentTarget.src = "https://picsum.photos/seed/error/600/400"; 
                            e.currentTarget.srcset = "";
                        }}
                        />
                    ) : (
                        <div className="w-full h-full bg-muted flex items-center justify-center text-muted-foreground text-xs p-2">
                            Invalid or missing image URL
                        </div>
                    )}
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/90 via-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-in-out flex flex-col justify-end h-[110px]">
                    <h3 className="text-primary font-semibold text-base mb-1 truncate">{image.alt || 'Untitled'}</h3>
                    {image.description && (
                      <div className="h-[3.75rem] overflow-hidden">
                        <TypingAnimation
                          text={image.description}
                          speed={25}
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