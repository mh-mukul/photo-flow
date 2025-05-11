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
  const isMobile = useIsMobile(); // From existing hooks

  useEffect(() => {
    setIsMounted(true);
    // Set active link based on initial hash or default to first link
    const currentHash = window.location.hash;
    if (currentHash) {
      setActiveLink(currentHash);
    } else if (navLinks.length > 0) {
      // setActiveLink(navLinks[0].href); // Optional: default to first if no hash
    }
  }, []);

  const handleScroll = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>, href: string) => {
    e.preventDefault();
    setActiveLink(href);
    const targetId = href.replace(/.*#/, "");
    const elem = document.getElementById(targetId);
    elem?.scrollIntoView({ behavior: "smooth" });

    // Update URL hash without page jump for better UX and history
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
      { rootMargin: "-50% 0px -50% 0px" } // Trigger when element is in the middle of the viewport
    );

    navLinks.forEach((link) => {
      const targetId = link.href.replace(/.*#/, "");
      const elem = document.getElementById(targetId);
      if (elem) observer.observe(elem);
    });

    return () => observer.disconnect();
  }, []);


  if (!isMounted) {
    // Return a skeleton or null to avoid hydration errors during SSR
    return (
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 max-w-screen-2xl items-center justify-between">
          <div className="flex items-center gap-2 text-primary">
            <Camera className="h-6 w-6 text-accent" />
            <span className="font-bold text-xl">PhotoFlow</span>
          </div>
          {/* Simple placeholder for nav items */}
          <div className="hidden md:flex h-6 w-32 bg-muted rounded"></div>
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
        // If mobile menu is open, close it
        if (isMobile) {
          const closeButton = document.querySelector('[data-radix-dialog-default-open="false"] > button'); // This might need a more robust selector or state management
          (closeButton as HTMLElement)?.click();
        }
      }}
      className={cn(
        "font-medium transition-colors hover:text-accent",
        activeLink === link.href ? "text-accent" : "text-foreground/80",
        isMobile ? "text-lg py-2" : "text-sm"
      )}
    >
      {link.label}
    </Link>
  ));

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-w-screen-2xl items-center justify-between">
        <Link href="/" onClick={(e) => { e.preventDefault(); window.scrollTo({top: 0, behavior: 'smooth'}); setActiveLink('');}} className="flex items-center gap-2 text-primary hover:text-accent transition-colors">
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
            <SheetContent side="right" className="w-[240px] bg-background p-6">
               <Link href="/" onClick={(e) => { e.preventDefault(); window.scrollTo({top: 0, behavior: 'smooth'}); setActiveLink('');}} className="flex items-center gap-2 text-primary hover:text-accent transition-colors mb-8">
                <Camera className="h-6 w-6 text-accent" />
                <span className="font-bold text-xl">PhotoFlow</span>
              </Link>
              <nav className="flex flex-col space-y-3">
                {navItems}
              </nav>
            </SheetContent>
          </Sheet>
        ) : (
          <nav className="flex items-center gap-6">
            {navItems}
          </nav>
        )}
      </div>
    </header>
  );
}
