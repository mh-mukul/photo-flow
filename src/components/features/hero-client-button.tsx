
"use client";

import type React from 'react';
import { ArrowDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';

export function HeroClientButton() {
  const handleScrollToGallery = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault();
    const galleryElement = document.getElementById('gallery');
    galleryElement?.scrollIntoView({ behavior: 'smooth' });
    
    // Update URL hash without page jump for better UX and history
    if (history.pushState) {
      history.pushState(null, "", "#gallery");
    } else {
      // Fallback for older browsers
      window.location.hash = "#gallery";
    }
  };

  return (
     <button
        onClick={handleScrollToGallery}
        className={cn(
          buttonVariants({ size: 'lg' }),
          "bg-accent text-accent-foreground hover:bg-accent/90",
          "group rounded-lg px-8 py-6 text-lg",
          "shadow-lg hover:shadow-accent/50 transition-all duration-300 ease-in-out transform hover:scale-105"
        )}
      >
        View My Work
        <ArrowDown className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-y-1" />
      </button>
  );
}
