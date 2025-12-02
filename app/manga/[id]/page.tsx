'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useParams } from 'next/navigation';
import api from '../../lib/axios';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { Star, Bookmark, Eye, Calendar, User, BookOpen, List } from 'lucide-react';
import Link from 'next/link';
import { getImageUrl } from '../../utils/imageUtils';

interface Chapter {
    id: number;
    chapter_number: string;
    released_at: string;
}

interface Manga {
    id: number;
    title: string;
    description: string;
    cover_image: string;
    genres: string[];
    status: string;
    type: string;
    released_year: string;
    author: string;
    artist: string;
    rating?: number;
    created_at: string;
    chapters: Chapter[];
}

export default function MangaDetailsPage() {
    const { id } = useParams();
    const [manga, setManga] = useState<Manga | null>(null);
    const [loading, setLoading] = useState(true);
    const [history, setHistory] = useState<any[]>([]);
    const { user } = useAuth();
    const [isBookmarked, setIsBookmarked] = useState(false);
    const [bookmarkId, setBookmarkId] = useState<number | null>(null);
    const [userRating, setUserRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);

    useEffect(() => {
        if (id && user) {
             // Fetch Bookmarks
             api.get(`/api/bookmarks/`)
                .then(response => {
                    const data = response.data;
                    const results = Array.isArray(data) ? data : data.results || [];
                    const bookmark = results.find((b: any) => b.manga === Number(id));
                    if (bookmark) {
                        setIsBookmarked(true);
                        setBookmarkId(bookmark.id);
                    }
                })
                .catch(err => console.error("Error fetching bookmarks:", err));

            // Fetch User Rating
            api.get(`/api/ratings/`)
                .then(response => {
                    const data = response.data;
                    const results = Array.isArray(data) ? data : data.results || [];
                    const rating = results.find((r: any) => r.manga === Number(id));
                    if (rating) {
                        setUserRating(rating.score);
                    }
                })
                .catch(err => console.error("Error fetching rating:", err));
        }
    }, [id, user]);

    const handleRate = async (score: number) => {
        if (!user) {
            alert("Please login to rate");
            return;
        }

        try {
            await api.post('/api/ratings/', {
                manga: id,
                score: score
            });
            setUserRating(score);
            // Optionally refresh manga details to update average rating immediately
            // But for now, user's rating update is enough feedback
        } catch (error) {
            console.error("Error submitting rating:", error);
        }
    };

    const toggleBookmark = async () => {
        if (!user) {
            alert("Please login to bookmark");
            return;
        }

        try {
            if (isBookmarked && bookmarkId) {
                await api.delete(`/api/bookmarks/${bookmarkId}/`);
                setIsBookmarked(false);
                setBookmarkId(null);
            } else {
                const response = await api.post(`/api/bookmarks/`, {
                    manga: id
                });
                setIsBookmarked(true);
                setBookmarkId(response.data.id);
            }
        } catch (error) {
            console.error("Error toggling bookmark:", error);
        }
    };

    useEffect(() => {
        if (id) {
            api.get(`/api/mangas/${id}/`)
                .then(response => {
                    setManga(response.data);
                    setLoading(false);
                })
                .catch(error => {
                    console.error("Error fetching manga details:", error);
                    setLoading(false);
                });
            
            // Fetch history
            const allHistory = JSON.parse(localStorage.getItem('reading_history') || '[]');
            const mangaHistory = allHistory.filter((item: any) => item.mangaId === Number(id)).slice(0, 3);
            setHistory(mangaHistory);
        }
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen bg-background text-foreground">
                <Navbar />
                <div className="container mx-auto px-4 py-8 flex justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
            </div>
        );
    }

    if (!manga) {
        return (
            <div className="min-h-screen bg-background text-foreground">
                <Navbar />
                <div className="container mx-auto px-4 py-8 text-center">
                    <h1 className="text-2xl font-bold">Manga not found</h1>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background text-foreground font-sans">
            <Navbar />
            
            {/* Backdrop Header */}
            <div className="relative w-full h-[400px] overflow-hidden">
                <div 
                    className="absolute inset-0 bg-cover bg-center blur-xl opacity-50 scale-110"
                    style={{ backgroundImage: `url(${getImageUrl(manga.cover_image)})` }}
                />
                <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/80 to-background" />
            </div>

            <main className="container mx-auto px-4 -mt-64 relative z-10 max-w-7xl">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                    {/* Left Column: Cover & Actions */}
                    <div className="lg:col-span-3 flex flex-col gap-6">
                        <div className="relative rounded-xl overflow-hidden shadow-2xl shadow-black/50 border-4 border-card group">
                            <img 
                                src={getImageUrl(manga.cover_image) || "https://via.placeholder.com/350x500?text=No+Cover"} 
                                alt={manga.title}
                                className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                            <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg text-sm font-bold text-yellow-400 flex items-center gap-1 border border-white/10">
                                <Star size={14} fill="currentColor" /> {manga.rating || "0.0"}
                            </div>
                        </div>

                        {/* Rating Section */}
                        <div className="bg-card/50 backdrop-blur-sm rounded-xl p-4 border border-white/5 text-center">
                            <p className="text-sm text-muted-foreground mb-2">Rate this manga</p>
                            <div className="flex justify-center gap-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        onClick={() => handleRate(star)}
                                        onMouseEnter={() => setHoverRating(star)}
                                        onMouseLeave={() => setHoverRating(0)}
                                        className="focus:outline-none transition-transform hover:scale-110"
                                    >
                                        <Star 
                                            size={24} 
                                            className={`${
                                                (hoverRating || userRating) >= star 
                                                ? "text-yellow-400 fill-yellow-400" 
                                                : "text-muted-foreground"
                                            } transition-colors`}
                                        />
                                    </button>
                                ))}
                            </div>
                            {userRating > 0 && (
                                <p className="text-xs text-primary mt-2">You rated: {userRating}/5</p>
                            )}
                        </div>
                        
                        <button 
                            onClick={toggleBookmark}
                            className={`w-full py-3 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg font-bold text-lg ${
                                isBookmarked 
                                ? "bg-red-500 hover:bg-red-600 text-white shadow-red-500/20" 
                                : "bg-primary hover:bg-primary/90 text-white shadow-primary/20"
                            }`}
                        >
                            <Bookmark size={20} fill={isBookmarked ? "currentColor" : "none"} /> 
                            {isBookmarked ? "Bookmarked" : "Bookmark"}
                        </button>
                        
                        {/* Recently Read Section */}
                        {history.length > 0 && (
                            <div className="bg-card/50 backdrop-blur-sm rounded-xl p-4 border border-white/5">
                                <h4 className="text-xs font-bold text-muted-foreground uppercase mb-3 tracking-wider">Recently Read</h4>
                                <div className="space-y-2">
                                    {history.map((item: any) => (
                                        <Link 
                                            key={item.chapterId}
                                            href={`/manga/${manga.id}/chapter/${item.chapterNumber}`}
                                            className="block text-sm text-primary hover:text-accent transition-colors truncate"
                                        >
                                            <span className="text-foreground/80">Continue:</span> Chapter {item.chapterNumber}
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Column: Info & Chapters */}
                    <div className="lg:col-span-9 pt-8 lg:pt-32">
                        <div className="mb-8">
                            <h1 className="text-4xl md:text-6xl font-black text-white mb-4 leading-tight tracking-tight drop-shadow-2xl">
                                {manga.title}
                            </h1>
                            <div className="flex flex-wrap gap-3 mb-6">
                                {Array.isArray(manga.genres) && manga.genres.map((genre, index) => (
                                    <Link 
                                        key={index} 
                                        href={`/genres/${genre.trim().toLowerCase()}`}
                                        className="px-4 py-1.5 bg-white/5 backdrop-blur-md text-white/90 text-sm font-medium rounded-lg border border-white/10 hover:bg-primary hover:border-primary transition-all cursor-pointer"
                                    >
                                        {genre.trim()}
                                    </Link>
                                ))}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Main Content */}
                            <div className="lg:col-span-2 space-y-8">
                                {/* Description */}
                                <div className="bg-card/30 backdrop-blur-sm rounded-xl p-6 border border-white/5">
                                    <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                        <BookOpen size={20} className="text-primary" /> Synopsis
                                    </h3>
                                    <p className="text-muted-foreground leading-relaxed text-base">
                                        {manga.description || "No description available."}
                                    </p>
                                </div>

                                {/* Chapter List */}
                                <div className="bg-card/30 backdrop-blur-sm rounded-xl border border-white/5 overflow-hidden">
                                    <div className="bg-white/5 p-5 border-b border-white/5 flex justify-between items-center">
                                        <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                            <List size={20} className="text-primary" /> Chapters
                                        </h3>
                                        <div className="relative">
                                            <input 
                                                type="text" 
                                                placeholder="Search Chapter..." 
                                                className="bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-primary w-48 text-white placeholder:text-white/30"
                                            />
                                        </div>
                                    </div>
                                    
                                    <div className="max-h-[600px] overflow-y-auto custom-scrollbar p-2">
                                        {manga.chapters && manga.chapters.length > 0 ? (
                                            <div className="grid grid-cols-1 gap-2">
                                                {manga.chapters.map((chapter) => (
                                                    <Link 
                                                        key={chapter.id} 
                                                        href={`/manga/${manga.id}/chapter/${chapter.chapter_number}`}
                                                        className="flex items-center justify-between p-4 hover:bg-white/5 rounded-lg transition-all group border border-transparent hover:border-white/5"
                                                    >
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-sm group-hover:bg-primary group-hover:text-white transition-colors">
                                                                {chapter.chapter_number}
                                                            </div>
                                                            <span className="font-medium text-foreground group-hover:text-primary transition-colors">
                                                                Chapter {chapter.chapter_number}
                                                            </span>
                                                        </div>
                                                        <span className="text-xs text-muted-foreground">
                                                            {new Date(chapter.released_at).toLocaleDateString()}
                                                        </span>
                                                    </Link>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="p-12 text-center text-muted-foreground">
                                                No chapters available yet.
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Sidebar Info */}
                            <div className="space-y-6">
                                <div className="bg-card/30 backdrop-blur-sm rounded-xl p-6 border border-white/5">
                                    <h3 className="text-lg font-bold text-white mb-4 border-b border-white/5 pb-2">Information</h3>
                                    <div className="space-y-4 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Status</span>
                                            <span className="text-primary font-medium">{manga.status}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Type</span>
                                            <span className="text-white">{manga.type}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Released</span>
                                            <span className="text-white">{manga.released_year}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Author</span>
                                            <span className="text-white">{manga.author}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Artist</span>
                                            <span className="text-white">{manga.artist}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
            
            <Footer />
        </div>
    );
}
