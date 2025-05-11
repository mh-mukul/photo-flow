import type { Metadata } from 'next';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import './globals.css';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Toaster } from "@/components/ui/toaster";

// const geistSans = GeistSans({ // This was incorrect, GeistSans is not a function
//   variable: '--font-geist-sans',
//   subsets: ['latin'],
//   display: 'swap', 
// });

// const geistMono = GeistMono({ // This was incorrect, GeistMono is not a function
//   variable: '--font-geist-mono',
//   subsets: ['latin'],
//   display: 'swap', 
// });

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
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable} dark`}> {/* Apply dark theme and font variables globally */}
      <body className={`font-sans antialiased`}> {/* font-sans will use --font-geist-sans defined in html tag */}
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
