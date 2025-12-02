'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Menu, Search, User, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

import { useAuth } from '../context/AuthContext';
import { LogOut } from 'lucide-react';

export default function Navbar() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
      setIsMenuOpen(false);
    }
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-white/5 bg-background/60 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <button 
            className="lg:hidden text-foreground hover:text-primary transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <Menu className="h-6 w-6" />
          </button>
          <Link href="/" className="flex items-center gap-2 mr-8">
            <div className="relative h-10 w-10">
              <Image 
                src="/logo-final1.png" 
                alt="Daily-Manga Logo" 
                fill
                className="object-contain"
                priority
              />
            </div>
            <span className="hidden sm:block text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent tracking-tighter">Daily-Manga</span>
          </Link>
          <div className="hidden lg:flex items-center gap-8 text-sm font-medium text-muted-foreground">
            <Link href="/" className="text-foreground hover:text-primary transition-colors">Home</Link>
            <Link href="/manga" className="hover:text-primary transition-colors">Manga List</Link>
            <Link href="/manga?type=Manhwa" className="hover:text-primary transition-colors">Manhwa</Link>
            <Link href="/manga?type=Manhua" className="hover:text-primary transition-colors">Manhua</Link>
            <Link href="/manga?genre=Action" className="hover:text-primary transition-colors">Action</Link>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <form onSubmit={handleSearch} className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="search"
              placeholder="ค้นหามังงะ..."
              className="h-9 w-64 rounded-full border border-border bg-muted/50 pl-9 pr-4 text-sm focus:border-primary focus:outline-none focus:border-primary transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>
          <button 
            className="md:hidden text-foreground"
            onClick={() => setIsMenuOpen(!isMenuOpen)} 
          >
            <Search className="h-5 w-5" />
          </button>
          
          {user ? (
            <div className="relative">
                <button 
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="flex items-center gap-2 text-sm font-medium hover:text-primary transition-colors focus:outline-none group"
                >
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                        <User size={18} />
                    </div>
                    <span className="hidden md:block group-hover:text-primary transition-colors">Hi, {user.username}</span>
                    <ChevronDown size={16} className={`text-muted-foreground group-hover:text-primary transition-transform duration-200 ${isProfileOpen ? 'rotate-180' : ''}`} />
                </button>

                {isProfileOpen && (
                    <>
                        <div 
                            className="fixed inset-0 z-40" 
                            onClick={() => setIsProfileOpen(false)}
                        />
                        <div className="absolute right-0 mt-2 w-56 bg-[#1a1a1a] border border-white/10 rounded-xl shadow-2xl py-2 animate-in fade-in zoom-in-95 duration-200 z-50">
                            <div className="px-4 py-3 border-b border-white/5 mb-2">
                                <p className="text-xs text-muted-foreground mb-1">Signed in as</p>
                                <p className="font-bold text-white truncate">{user.username}</p>
                            </div>
                            
                            <Link 
                                href="/profile" 
                                className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:bg-primary/10 hover:text-primary transition-colors mx-2 rounded-lg"
                                onClick={() => setIsProfileOpen(false)}
                            >
                                <User size={16} /> My Profile
                            </Link>
                            
                            <div className="h-px bg-white/5 my-2 mx-2" />
                            
                            <button 
                                onClick={() => {
                                    logout();
                                    setIsProfileOpen(false);
                                }}
                                className="w-[calc(100%-16px)] flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-500 transition-colors mx-2 rounded-lg text-left"
                            >
                                <LogOut size={16} /> Logout
                            </button>
                        </div>
                    </>
                )}
            </div>
          ) : (
            <Link href="/login" className="text-sm font-bold bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-full transition-all shadow-lg shadow-primary/20">
                Login
            </Link>
          )}
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="lg:hidden border-t border-white/5 bg-background/95 backdrop-blur-xl absolute w-full left-0 px-4 py-4 flex flex-col gap-4 shadow-2xl">
            <form onSubmit={handleSearch} className="relative md:hidden">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="search"
                  placeholder="Search manga..."
                  className="h-10 w-full rounded-lg border border-border bg-muted/50 pl-9 pr-4 text-sm focus:border-primary focus:outline-none"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
            </form>
            <div className="flex flex-col gap-2">
                <Link href="/" className="px-4 py-2 hover:bg-white/5 rounded-lg transition-colors" onClick={() => setIsMenuOpen(false)}>Home</Link>
                <Link href="/manga" className="px-4 py-2 hover:bg-white/5 rounded-lg transition-colors" onClick={() => setIsMenuOpen(false)}>Manga List</Link>
                <Link href="/manga?type=Manhwa" className="px-4 py-2 hover:bg-white/5 rounded-lg transition-colors" onClick={() => setIsMenuOpen(false)}>Manhwa</Link>
                <Link href="/manga?type=Manhua" className="px-4 py-2 hover:bg-white/5 rounded-lg transition-colors" onClick={() => setIsMenuOpen(false)}>Manhua</Link>
                <Link href="/manga?genre=Action" className="px-4 py-2 hover:bg-white/5 rounded-lg transition-colors" onClick={() => setIsMenuOpen(false)}>Action</Link>
            </div>
        </div>
      )}
    </nav>
  );
}
