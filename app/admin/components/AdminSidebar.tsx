'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { LayoutDashboard, Plus, LogOut, BookOpen, Users, MessageSquare } from 'lucide-react';

export default function AdminSidebar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentTab = searchParams.get('tab') || 'overview';

  // Helper to determine if a link is active
  const isActive = (path: string, tab?: string) => {
      if (path === '/admin' && tab) {
          return pathname === '/admin' && currentTab === tab;
      }
      return pathname === path;
  };

  return (
    <aside className="w-64 bg-card border-r border-border h-screen sticky top-0 flex flex-col">
      <div className="p-6 border-b border-border">
        <h2 className="text-2xl font-bold text-primary">MangaAdmin</h2>
      </div>
      
      <nav className="flex-1 p-4 space-y-2">
        <Link 
            href="/admin?tab=overview" 
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive('/admin', 'overview')
                ? 'bg-primary text-primary-foreground font-bold shadow-lg shadow-primary/20' 
                : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
            }`}
        >
            <LayoutDashboard size={20} />
            Dashboard
        </Link>
        
        <Link 
            href="/admin?tab=mangas" 
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive('/admin', 'mangas')
                ? 'bg-primary text-primary-foreground font-bold shadow-lg shadow-primary/20' 
                : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
            }`}
        >
            <BookOpen size={20} />
            Mangas
        </Link>

        <Link 
            href="/admin?tab=users" 
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive('/admin', 'users')
                ? 'bg-primary text-primary-foreground font-bold shadow-lg shadow-primary/20' 
                : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
            }`}
        >
            <Users size={20} />
            Users
        </Link>

        <Link 
            href="/admin?tab=comments" 
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive('/admin', 'comments')
                ? 'bg-primary text-primary-foreground font-bold shadow-lg shadow-primary/20' 
                : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
            }`}
        >
            <MessageSquare size={20} />
            Comments
        </Link>

        <div className="pt-4 mt-4 border-t border-border">
            <Link 
                href="/admin/manga/create" 
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    pathname === '/admin/manga/create' 
                    ? 'bg-primary text-primary-foreground font-bold shadow-lg shadow-primary/20' 
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                }`}
            >
                <Plus size={20} />
                Add Manga
            </Link>
        </div>
      </nav>

      <div className="p-4 border-t border-border">
        <Link href="/" className="flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:bg-red-500/10 hover:text-red-500 transition-colors">
            <LogOut size={20} />
            Back to Site
        </Link>
      </div>
    </aside>
  );
}
