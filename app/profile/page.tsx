'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import api from '../lib/axios';
import Link from 'next/link';
import { Bookmark, Clock, BookOpen, Trash2 } from 'lucide-react';
import { getImageUrl } from '../utils/imageUtils';

export default function ProfilePage() {
    const { user, loading: authLoading } = useAuth();
    const [bookmarks, setBookmarks] = useState<any[]>([]);
    const [history, setHistory] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            const fetchData = async () => {
                try {
                    const [bookmarksRes, historyRes] = await Promise.all([
                        api.get('/api/bookmarks/'),
                        api.get('/api/history/')
                    ]);
                    const bookmarksData = bookmarksRes.data;
                    const historyData = historyRes.data;
                    
                    setBookmarks(Array.isArray(bookmarksData) ? bookmarksData : bookmarksData.results || []);
                    setHistory(Array.isArray(historyData) ? historyData : historyData.results || []);
                } catch (error) {
                    console.error("Error fetching profile data:", error);
                } finally {
                    setLoading(false);
                }
            };
            fetchData();
        } else if (!authLoading) {
            setLoading(false);
        }
    }, [user, authLoading]);

    const removeBookmark = async (id: number) => {
        try {
            await api.delete(`/api/bookmarks/${id}/`);
            setBookmarks(bookmarks.filter(b => b.id !== id));
        } catch (error) {
            console.error("Error removing bookmark:", error);
        }
    };

    if (authLoading || loading) {
        return (
            <div className="min-h-screen bg-background text-foreground">
                <Navbar />
                <div className="flex justify-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="min-h-screen bg-background text-foreground flex flex-col">
                <Navbar />
                <div className="flex-grow flex flex-col items-center justify-center gap-4">
                    <h1 className="text-2xl font-bold">Please Login</h1>
                    <p className="text-muted-foreground">You need to be logged in to view your profile.</p>
                    <Link href="/login" className="bg-primary text-white px-6 py-2 rounded-full font-bold hover:bg-primary/90 transition-colors">
                        Login
                    </Link>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background text-foreground font-sans">
            <Navbar />
            
            <main className="container mx-auto px-4 py-8">
                <div className="mb-10">
                    <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent mb-2">
                        My Profile
                    </h1>
                    <p className="text-muted-foreground">Welcome back, <span className="text-white font-bold">{user.username}</span></p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                    {/* Bookmarks Section */}
                    <div className="space-y-6">
                        <h2 className="text-xl font-bold flex items-center gap-2 border-b border-white/10 pb-4">
                            <Bookmark className="text-primary" /> My Bookmarks
                        </h2>
                        
                        {bookmarks.length > 0 ? (
                            <div className="grid grid-cols-1 gap-4">
                                {bookmarks.map((bookmark) => (
                                    <div key={bookmark.id} className="bg-card/30 border border-white/5 rounded-xl p-4 flex gap-4 hover:border-primary/50 transition-all group relative">
                                        <Link href={`/manga/${bookmark.manga}`} className="absolute inset-0 z-10" />
                                        <div className="w-16 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-black/50">
                                            <img 
                                                src={getImageUrl(bookmark.manga_cover)} 
                                                alt={bookmark.manga_title}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <div className="flex-grow flex flex-col justify-center">
                                            <h3 className="font-bold text-lg group-hover:text-primary transition-colors line-clamp-1">
                                                {bookmark.manga_title}
                                            </h3>
                                            <p className="text-xs text-muted-foreground mt-1">
                                                Added on {new Date(bookmark.created_at).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <button 
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                removeBookmark(bookmark.id);
                                            }}
                                            className="z-20 p-2 text-muted-foreground hover:text-red-500 transition-colors"
                                            title="Remove Bookmark"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-10 bg-card/10 rounded-xl border border-white/5 border-dashed">
                                <p className="text-muted-foreground">No bookmarks yet.</p>
                                <Link href="/manga" className="text-primary text-sm hover:underline mt-2 inline-block">
                                    Browse Manga
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* History Section */}
                    <div className="space-y-6">
                        <h2 className="text-xl font-bold flex items-center gap-2 border-b border-white/10 pb-4">
                            <Clock className="text-primary" /> Reading History
                        </h2>
                        
                        {history.length > 0 ? (
                            <div className="grid grid-cols-1 gap-4">
                                {history.map((item) => (
                                    <Link 
                                        key={item.id} 
                                        href={`/manga/${item.manga}/chapter/${item.chapter_number}`}
                                        className="bg-card/30 border border-white/5 rounded-xl p-4 flex gap-4 hover:bg-white/5 transition-all group"
                                    >
                                        <div className="w-16 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-black/50">
                                            <img 
                                                src={getImageUrl(item.manga_cover)} 
                                                alt={item.manga_title}
                                                className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                                            />
                                        </div>
                                        <div className="flex-grow flex flex-col justify-center">
                                            <h3 className="font-bold text-base group-hover:text-primary transition-colors line-clamp-1">
                                                {item.manga_title}
                                            </h3>
                                            <div className="flex items-center gap-2 mt-2">
                                                <span className="bg-primary/20 text-primary text-xs px-2 py-1 rounded font-bold">
                                                    Ch. {item.chapter_number}
                                                </span>
                                                <span className="text-xs text-muted-foreground">
                                                    {new Date(item.last_read_at).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex items-center text-muted-foreground group-hover:text-white">
                                            <BookOpen size={20} />
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-10 bg-card/10 rounded-xl border border-white/5 border-dashed">
                                <p className="text-muted-foreground">No reading history yet.</p>
                            </div>
                        )}
                    </div>
                </div>
            </main>
            
            <Footer />
        </div>
    );
}
