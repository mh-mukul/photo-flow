import type { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ImageIcon, LogOutIcon, SettingsIcon, HomeIcon } from 'lucide-react'; // Added HomeIcon
import { logout } from '@/actions/auth';
import { Separator } from '@/components/ui/separator';

export const metadata: Metadata = {
  title: 'Admin Panel | PhotoFlow',
  description: 'Manage your PhotoFlow portfolio.',
};

function AdminHeader() {
  return (
    <header className="p-4 border-b border-border sticky top-0 bg-background z-10">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2 text-primary hover:text-accent transition-colors">
          <HomeIcon className="h-6 w-6" />
          <span className="font-bold text-xl">PhotoFlow</span>
          <span className="text-sm text-muted-foreground ml-2">Admin Panel</span>
        </Link>
        {/* Future: User profile/menu could go here */}
      </div>
    </header>
  );
}


function AdminSidebar() {
  return (
    <aside className="sticky top-0 h-screen w-60 bg-card border-r border-border flex-col hidden md:flex shadow-lg">
      <div className="p-4 border-b border-border">
         <Link href="/admin/photos" className="flex items-center gap-2 text-primary hover:text-accent transition-colors">
            <SettingsIcon className="h-6 w-6 text-accent" />
            <span className="font-semibold text-lg">Admin Menu</span>
        </Link>
      </div>
      <nav className="flex-grow px-2 py-4 space-y-1">
        <Button variant="ghost" className="w-full justify-start" asChild>
          <Link href="/admin/photos">
            <ImageIcon className="mr-3 h-5 w-5" />
            Photos
          </Link>
        </Button>
        {/* Add other admin links here */}
      </nav>
      <Separator />
      <form action={logout} className="p-2">
        <Button type="submit" variant="ghost" className="w-full justify-start text-left hover:bg-destructive/10 hover:text-destructive group">
          <LogOutIcon className="mr-3 h-5 w-5 text-muted-foreground group-hover:text-destructive transition-colors" />
          <span className="text-muted-foreground group-hover:text-destructive transition-colors">Logout</span>
        </Button>
      </form>
    </aside>
  );
}


export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />
      <div className="flex-1 flex flex-col">
        <AdminHeader />
        <main className="flex-grow p-6 container mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
