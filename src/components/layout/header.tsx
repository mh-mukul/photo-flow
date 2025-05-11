
"use client";

import Link from 'next/link';
import { Camera, Menu, LogOut } from 'lucide-react'; // Import LogOut icon
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetClose } from '@/components/ui/sheet';
import { useIsMobile } from '@/hooks/use-mobile';
import { useEffect, useState, useRef } from 'react';
import { cn } from '@/lib/utils';
import { logout } from '@/actions/auth'; // Import logout action

const navLinks = [
  { href: '#gallery', label: 'Gallery' },
  { href: '#about', label: 'About Me' },
];

interface HeaderProps {
  isAdminLogin?: boolean;
  isLoggedIn?: boolean; // Add isLoggedIn prop
}

export function Header({ isAdminLogin = false, isLoggedIn = false }: HeaderProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [activeLink, setActiveLink] = useState('');
  const isMobile = useIsMobile();
  const sheetCloseRef = useRef<HTMLButtonElement>(null);


  useEffect(() => {
    setIsMounted(true);
    if (!isAdminLogin) {
      const currentHash = window.location.hash;
      if (currentHash) {
        setActiveLink(currentHash);
      }
    }
  }, [isAdminLogin]);

  const handleScroll = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>, href: string) => {
    if (isAdminLogin || href.startsWith('mailto:')) { // Allow default for mailto links
      return;
    }
    e.preventDefault();
    
    // If it's a full path (like /admin/login), let Link handle it
    if (!href.startsWith('#')) {
        if (isMobile && sheetCloseRef.current) {
            sheetCloseRef.current.click();
        }
        // For non-hash links, we let the Link component do its job, no special scroll handling.
        // This part is mainly for hash links for scrolling.
        return; 
    }

    setActiveLink(href);
    const targetId = href.replace(/.*#/, "");
    const elem = document.getElementById(targetId);
    elem?.scrollIntoView({ behavior: "smooth" });

    if (history.pushState) {
      history.pushState(null, "", href);
    } else {
      window.location.hash = href;
    }
    if (isMobile && sheetCloseRef.current) {
      sheetCloseRef.current.click();
    }
  };
  
  useEffect(() => {
    if (isAdminLogin || typeof window === 'undefined') return;

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
  }, [isAdminLogin]);

  const handleLogoClick = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    if (pathname === '/admin/login' || pathname.startsWith('/admin/')) {
      // Allow default Link behavior to navigate to "/"
      if (isMobile && sheetCloseRef.current) {
        sheetCloseRef.current.click();
      }
      return;
    }
    // For public pages
    e.preventDefault(); 
    window.scrollTo({top: 0, behavior: 'smooth'}); 
    setActiveLink('');
    if (history.pushState) {
      history.pushState(null, "", "/");
    } else {
      window.location.pathname = "/";
    }
    if (isMobile && sheetCloseRef.current) {
      sheetCloseRef.current.click();
    }
  };

  // Get current pathname for conditional rendering
  const [pathname, setPathname] = useState('');
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setPathname(window.location.pathname);
    }
  }, []);


  if (!isMounted) {
    return (
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 max-w-screen-2xl items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-2 text-primary">
            <Camera className="h-6 w-6 text-accent" />
            <span className="font-bold text-xl">PhotoFlow</span>
          </div>
          {!isAdminLogin && <div className="hidden md:flex h-6 w-32 bg-muted rounded animate-pulse"></div>}
        </div>
      </header>
    );
  }

  const navItems = navLinks.map((link) => (
    <Link
      key={link.href}
      href={link.href}
      onClick={(e) => handleScroll(e, link.href)}
      className={cn(
        "font-medium transition-colors hover:text-accent",
        activeLink === link.href ? "text-accent" : "text-foreground/80",
        isMobile ? "text-lg py-3 block w-full text-left px-3" : "text-sm px-3 py-2" 
      )}
    >
      {link.label}
    </Link>
  ));

  const LogoutButton = () => (
    <form action={logout}>
      <Button type="submit" variant="ghost" size={isMobile ? "lg" : "sm"} className={isMobile ? "w-full justify-start text-left px-3 py-3 text-lg" : "text-sm"}>
        <LogOut className={cn("h-4 w-4", isMobile && "mr-3 h-5 w-5")} />
        Logout
      </Button>
    </form>
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-w-screen-2xl items-center justify-between px-4 md:px-6">
        <Link 
          href="/" 
          onClick={handleLogoClick}
          className="flex items-center gap-2 text-primary hover:text-accent transition-colors"
          aria-label="PhotoFlow Home"
        >
          <Camera className="h-6 w-6 text-accent" />
          <span className="font-bold text-xl">PhotoFlow</span>
        </Link>
        
        {!isAdminLogin && isMobile ? (
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
                    handleLogoClick(e); 
                     if (sheetCloseRef.current) sheetCloseRef.current.click();
                  }} 
                  className="flex items-center gap-2 text-primary hover:text-accent transition-colors mb-6"
                  aria-label="PhotoFlow Home"
                >
                <Camera className="h-6 w-6 text-accent" />
                <span className="font-bold text-xl">PhotoFlow</span>
              </Link>
              {!isLoggedIn && (
                <nav className="flex flex-col space-y-1">
                  {navItems}
                </nav>
              )}
              {isLoggedIn && (
                <div className="mt-auto flex flex-col space-y-1">
                  <LogoutButton />
                </div>
              )}
              <SheetClose ref={sheetCloseRef} className="hidden" />
            </SheetContent>
          </Sheet>
        ) : !isAdminLogin ? (
          <nav className="flex items-center gap-1 md:gap-2">
            {!isLoggedIn && navItems}
            {isLoggedIn && <LogoutButton />}
          </nav>
        ) : null}

        {/* Admin Login Page specific: No nav items, no logout button if not logged in */}
        {isAdminLogin && !isLoggedIn && (
            <div className="flex items-center">
                {/* Placeholder or specific content for login page header if needed */}
            </div>
        )}
         {/* Admin Login Page specific: show logout if somehow logged in (middleware should prevent this) */}
        {isAdminLogin && isLoggedIn && (
             <nav className="flex items-center gap-1 md:gap-2">
                <LogoutButton />
            </nav>
        )}

      </div>
    </header>
  );
}
