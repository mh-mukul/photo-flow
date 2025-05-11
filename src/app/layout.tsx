import type { Metadata } from 'next';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import './globals.css';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Toaster } from "@/components/ui/toaster";
import { headers } from 'next/headers';

export const metadata: Metadata = {
  title: 'PhotoFlow | Photography Portfolio',
  description: 'A stunning photography portfolio showcasing captivating images and creative vision.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = headers().get('next-url') || '';
  const isAdminRoute = pathname.startsWith('/admin');
  const isAdminLoginPage = pathname === '/admin/login';

  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable} dark`}>
      <head />
      <body className={`font-sans antialiased`}>
        <div className="flex flex-col min-h-screen">
          {/* Conditionally render Header based on route */}
          {/* Show header without nav items for admin login, regular header for public, no header for other admin routes */}
          {!isAdminRoute || isAdminLoginPage ? <Header isAdminLogin={isAdminLoginPage} /> : null}
          <main className="flex-grow">
            {children}
          </main>
          {!isAdminRoute && <Footer />}
        </div>
        <Toaster />
      </body>
    </html>
  );
}
