import type { Metadata } from 'next';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import './globals.css';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
  title: 'PhotoFlow | Photography Portfolio',
  description: 'A stunning photography portfolio showcasing captivating images and creative vision.',
  // Favicon can be an icon file in the app directory (e.g. app/favicon.ico)
  // or specified here.
  // icons: {
  //   icon: "/favicon.ico",
  // }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable} dark`}>
      {/* Apply dark theme and font variables globally via className on <html> */}
      <head>
        {/*
          Next.js automatically populates the head based on the metadata export.
          You can add other head elements here if needed, e.g., for specific preconnects
          or scripts not managed by Next.js.
          The key is that <head> and <body> are direct children of <html>
          without any intermediate text nodes.
        */}
      </head>
      <body className={`font-sans antialiased`}>
        {/* font-sans will use --font-geist-sans defined in html tag via className on <body> */}
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
