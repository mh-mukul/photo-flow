import type { Metadata } from 'next';
import { Geist } from 'next/font/google';
import { GeistMono } from 'next/font/google';
import './globals.css';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
  display: 'swap', // Improves font loading
});

const geistMono = GeistMono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
  display: 'swap', // Improves font loading
});

export const metadata: Metadata = {
  title: 'PhotoFlow | Photography Portfolio',
  description: 'A stunning photography portfolio showcasing captivating images and creative vision.',
  icons: {
    // Note: Favicon generation is not part of this task, but this is where it would go.
    // icon: "/favicon.ico", 
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark"> {/* Apply dark theme globally */}
      <body className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}>
        <div className="flex flex-col min-h-screen">
          <Header />
          <main className="flex-grow">
            {children}
          </main>
          <Footer />
        </div>
        <Toaster />
      </body>
    </html>
  );
}
