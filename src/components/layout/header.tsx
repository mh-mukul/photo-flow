
"use client";

import Link from 'next/link';
import { Camera, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useIsMobile } from '@/hooks/use-mobile';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

const navLinks = [
  { href: '#gallery', label: 'Gallery' },
  { href: '#about', label: 'About Me' },
];

export function Header() {
  const [isMounted, setIsMounted] = useState(false);
  const [activeLink, setActiveLink] = useState('');
  const isMobile = useIsMobile(); 

  useEffect(() => {
    setIsMounted(true);
    const currentHash = window.location.hash;
    if (currentHash) {
      setActiveLink(currentHash);
    }
  }, []);

  const handleScroll = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>, href: string) => {
    e.preventDefault();
    setActiveLink(href);
    const targetId = href.replace(/.*#/, "");
    const elem = document.getElementById(targetId);
    elem?.scrollIntoView({ behavior: "smooth" });

    if (history.pushState) {
      history.pushState(null, "", href);
    } else {
      window.location.hash = href;
    }
  };
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveLink(`#${entry.target.id}`);
          }
        });
      },
      { rootMargin: "-50% 0px -50% 0px" } 
    );

    navLinks.forEach((link) => {
      const targetId = link.href.replace(/.*#/, "");
      const elem = document.getElementById(targetId);
      if (elem) observer.observe(elem);
    });

    return () => observer.disconnect();
  }, []);


  if (!isMounted) {
    return (
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 max-w-screen-2xl items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-2 text-primary">
            <Camera className="h-6 w-6 text-accent" />
            <span className="font-bold text-xl">PhotoFlow</span>
          </div>
          <div className="hidden md:flex h-6 w-32 bg-muted rounded animate-pulse"></div>
        </div>
      </header>
    );
  }

  const navItems = navLinks.map((link) => (
    <Link
      key={link.href}
      href={link.href}
      onClick={(e) => {
        handleScroll(e, link.href);
        if (isMobile) {
          // Attempt to close sheet - more robust way would be managing sheet's open state via prop
          const sheetCloseButton = document.querySelector('#mobile-menu-close-button') as HTMLElement;
          sheetCloseButton?.click();
        }
      }}
      className={cn(
        "font-medium transition-colors hover:text-accent",
        activeLink === link.href ? "text-accent" : "text-foreground/80",
        isMobile ? "text-lg py-3 block w-full text-left px-3" : "text-sm px-3 py-2" // Adjusted padding for mobile
      )}
    >
      {link.label}
    </Link>
  ));

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-w-screen-2xl items-center justify-between px-4 md:px-6">
        <Link 
          href="/" 
          onClick={(e) => { 
            e.preventDefault(); 
            window.scrollTo({top: 0, behavior: 'smooth'}); 
            setActiveLink('');
            if (isMobile) {
              const sheetCloseButton = document.querySelector('#mobile-menu-close-button') as HTMLElement;
              sheetCloseButton?.click();
            }
          }} 
          className="flex items-center gap-2 text-primary hover:text-accent transition-colors"
          aria-label="PhotoFlow Home"
        >
          <Camera className="h-6 w-6 text-accent" />
          <span className="font-bold text-xl">PhotoFlow</span>
        </Link>
        
        {isMobile ? (
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Toggle menu">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[260px] bg-background p-6 flex flex-col">
               <Link 
                  href="/" 
                  onClick={(e) => { 
                    e.preventDefault(); 
                    window.scrollTo({top: 0, behavior: 'smooth'}); 
                    setActiveLink('');
                    const sheetCloseButton = document.querySelector('#mobile-menu-close-button') as HTMLElement;
                    sheetCloseButton?.click();
                  }} 
                  className="flex items-center gap-2 text-primary hover:text-accent transition-colors mb-6"
                  aria-label="PhotoFlow Home"
                >
                <Camera className="h-6 w-6 text-accent" />
                <span className="font-bold text-xl">PhotoFlow</span>
              </Link>
              <nav className="flex flex-col space-y-2 mt-4"> {/* Adjusted spacing */}
                {navItems}
              </nav>
              {/* Hidden button to control sheet closure programmatically */}
              <button id="mobile-menu-close-button" data-radix-dialog-default-open="false" className="hidden"></button>
            </SheetContent>
          </Sheet>
        ) : (
          <nav className="flex items-center gap-2 md:gap-4"> {/* Adjusted gap */}
            {navItems}
          </nav>
        )}
      </div>
    </header>
  );
}
