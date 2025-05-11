import { Mail, Instagram, Linkedin } from 'lucide-react';
import Link from 'next/link';

const XIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
  </svg>
);

export function Footer() {
  return (
    <footer className="py-8 bg-secondary border-t border-border/40">
      <div className="container max-w-screen-2xl flex flex-col md:flex-row items-center justify-between gap-6">
        <p className="text-sm text-muted-foreground text-center md:text-left">
          &copy; {new Date().getFullYear()} PhotoFlow. All rights reserved. <br className="sm:hidden"/>Designed with passion.
        </p>
        <div className="flex items-center gap-5">
          <Link href="mailto:photographer@example.com" aria-label="Email" className="text-muted-foreground hover:text-accent transition-colors">
            <Mail className="h-5 w-5" />
          </Link>
          <Link href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="text-muted-foreground hover:text-accent transition-colors">
            <Instagram className="h-5 w-5" />
          </Link>
          <Link href="https://x.com" target="_blank" rel="noopener noreferrer" aria-label="X (formerly Twitter)" className="text-muted-foreground hover:text-accent transition-colors">
            <XIcon />
          </Link>
          <Link href="https://linkedin.com" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="text-muted-foreground hover:text-accent transition-colors">
            <Linkedin className="h-5 w-5" />
          </Link>
        </div>
      </div>
    </footer>
  );
}
