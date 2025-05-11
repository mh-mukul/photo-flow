import type { Metadata } from 'next';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import './globals.css';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Toaster } from "@/components/ui/toaster";
import { headers } from 'next/headers';
import { isAuthenticated } from '@/actions/auth'; // Import isAuthenticated

export const metadata: Metadata = {
  title: 'PhotoFlow | Photography Portfolio',
  description: 'A stunning photography portfolio showcasing captivating images and creative vision.',
};

export default async function RootLayout({ // Make RootLayout async
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = headers().get('next-url') || '';
  const isAdminRoute = pathname.startsWith('/admin');
  const isAdminLoginPage = pathname === '/admin/login';
  const isUserAuthenticated = await isAuthenticated(); // Get authentication status

  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable} dark`}>
      <body className={`font-sans antialiased`}>
        <div className="flex flex-col min-h-screen">
          {/* Conditionally render Header based on route */}
          {/* Show header for public pages and admin login, pass auth status */}
          {!isAdminRoute || isAdminLoginPage ? (
            <Header 
              isAdminLogin={isAdminLoginPage} 
              isLoggedIn={isUserAuthenticated} // Pass auth status
            />
          ) : null}
          <main className="flex-grow">
            {children}
          </main>
          {/* Footer conditional rendering remains the same */}
          {!isAdminRoute || isAdminLoginPage ? <Footer /> : null}
        </div>
        <Toaster />
      </body>
    </html>
  );
}
