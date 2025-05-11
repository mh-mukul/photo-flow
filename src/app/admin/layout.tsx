import type { Metadata } from 'next';
import Link from 'next/link';
import { LogOut, Image as ImageIcon, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { logout } from '@/actions/auth';
import { headers } from 'next/headers';

export const metadata: Metadata = {
  title: 'PhotoFlow Admin',
  description: 'Manage your PhotoFlow portfolio.',
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = headers().get('next-url');

  if (pathname === '/admin/login') {
    return <>{children}</>; // Render children directly without sidebar for login page
  }

  return (
    <div className="flex min-h-screen bg-muted/40">
      <aside className="sticky top-0 h-screen w-64 bg-background border-r border-border flex flex-col">
        <div className="p-4 border-b border-border">
          <Link href="/admin/photos" className="text-2xl font-bold text-primary hover:text-accent transition-colors">
            PhotoFlow Admin
          </Link>
        </div>
        <nav className="flex-grow p-4 space-y-2">
          <Button variant="ghost" className="w-full justify-start" asChild>
            <Link href="/admin/photos">
              <ImageIcon className="mr-2 h-4 w-4" />
              Photos
            </Link>
          </Button>
          {/* Add more admin navigation links here if needed */}
          {/* <Button variant="ghost" className="w-full justify-start" asChild>
            <Link href="/admin/settings">
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </Link>
          </Button> */}
        </nav>
        <Separator />
        <div className="p-4">
          <form action={logout}>
            <Button variant="outline" className="w-full justify-start">
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </form>
        </div>
      </aside>
      <main className="flex-1 p-6 overflow-auto">
        {children}
      </main>
    </div>
  );
}
