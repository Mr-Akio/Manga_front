'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import api from '../lib/axios';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Star, BookOpen, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { getImageUrl } from '../utils/imageUtils';

interface Manga {
    id: number;
    title: string;
    cover_image: string;
    type?: string;
    views?: number;
    rating?: number;
    status?: string;
    chapters?: { id: number; chapter_number: string; released_at: string }[];
}

function MangaListContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    
    // Filter States
    const [genre, setGenre] = useState(searchParams.get('genre') || '');
    const [status, setStatus] = useState(searchParams.get('status') || '');
    const [type, setType] = useState(searchParams.get('type') || '');
    const [order, setOrder] = useState(searchParams.get('order') || 'update');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    
    const [mangas, setMangas] = useState<Manga[]>([]);
    const [loading, setLoading] = useState(true);

    const [genres, setGenres] = useState<{id: number, name: string}[]>([]);

    // Fetch Genres
    useEffect(() => {
        api.get('/api/genres/')
            .then(response => {
                setGenres(response.data);
            })
            .catch(error => {
                console.error("Error fetching genres:", error);
            });
    }, []);

    // Sync state with URL params
    useEffect(() => {
        setGenre(searchParams.get('genre') || '');
        setStatus(searchParams.get('status') || '');
        setType(searchParams.get('type') || '');
        setOrder(searchParams.get('order') || 'update');
    }, [searchParams]);

    // Fetch Mangas
    useEffect(() => {
        setLoading(true);
        let url = `/api/mangas/?page=${page}&`;
        
        if (genre) url += `genre=${encodeURIComponent(genre)}&`;
        if (status) url += `status=${encodeURIComponent(status)}&`;
        if (type) url += `type=${encodeURIComponent(type)}&`;
        
        // Mapping frontend order to backend ordering
        let ordering = '-updated_at'; // Default to update
        if (order === 'latest') ordering = '-created_at';
        if (order === 'popular') ordering = '-views';
        if (order === 'title') ordering = 'title';
        if (order === 'titlereverse') ordering = '-title';
        
        url += `ordering=${ordering}`;

        api.get(url)
            .then(response => {
                // Handle paginated response
                const data = response.data;
                if (data.results) {
                    setMangas(data.results);
                    setTotalPages(Math.ceil(data.count / 20)); // Assuming page size is 20
                } else {
                    setMangas(data); // Fallback for non-paginated
                }
                setLoading(false);
            })
            .catch(error => {
                console.error("Error fetching mangas:", error);
                setLoading(false);
            });
                setLoading(false);
            });
    }, [genre, status, type, order, page]);

    // Update URL when filters change
    const updateFilters = (key: string, value: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (value) {
            params.set(key, value);
        } else {
            params.delete(key);
        }
        // Reset to page 1 when filter changes
        setPage(1);
        router.push(`/manga?${params.toString()}`);
        
        // Update local state immediately for responsiveness
        if (key === 'genre') setGenre(value);
        if (key === 'status') setStatus(value);
        if (key === 'type') setType(value);
        if (key === 'order') setOrder(value);
    };

    return (
        <div className="min-h-screen bg-background text-foreground font-sans">
            <Navbar />
            
            <main className="container mx-auto px-4 py-8">
                <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
                    <h1 className="text-3xl font-bold text-primary flex items-center gap-2">
                        <BookOpen className="h-8 w-8" /> Manga Lists
                    </h1>
                </div>

                {/* Filters Section */}
                <div className="bg-card/50 backdrop-blur-sm border border-white/5 rounded-xl p-6 mb-8 shadow-xl">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {/* Genre Filter */}
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Genre</label>
                            <select 
                                value={genre} 
                                onChange={(e) => updateFilters('genre', e.target.value)}
                                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                            >
                                <option value="">All Genres</option>
                                {genres.map((g) => (
                                    <option key={g.id} value={g.name}>{g.name}</option>
                                ))}
                            </select>
                        </div>

                        {/* Status Filter */}
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Status</label>
                            <select 
                                value={status} 
                                onChange={(e) => updateFilters('status', e.target.value)}
                                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                            >
                                <option value="">All Status</option>
                                <option value="Ongoing">Ongoing</option>
                                <option value="Completed">Completed</option>
                                <option value="Hiatus">Hiatus</option>
                            </select>
                        </div>

                        {/* Type Filter */}
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Type</label>
                            <select 
                                value={type} 
                                onChange={(e) => updateFilters('type', e.target.value)}
                                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                            >
                                <option value="">All Types</option>
                                <option value="Manga">Manga (JP)</option>
                                <option value="Manhwa">Manhwa (KR)</option>
                                <option value="Manhua">Manhua (CN)</option>
                            </select>
                        </div>

                        {/* Order Filter */}
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Order By</label>
                            <select 
                                value={order} 
                                onChange={(e) => updateFilters('order', e.target.value)}
                                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                            >
                                <option value="update">Latest Update</option>
                                <option value="latest">Newest Added</option>
                                <option value="popular">Popularity</option>
                                <option value="title">A-Z</option>
                                <option value="titlereverse">Z-A</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Results Grid */}
                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary"></div>
                    </div>
                ) : mangas.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                        {mangas.map((manga) => (
                            <div key={manga.id} className="group relative block overflow-hidden rounded-xl bg-card/50 hover:bg-card transition-all duration-300 hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-1 border border-white/5">
                                <Link href={`/manga/${manga.id}`}>
                                    <div className="aspect-[2/3] w-full overflow-hidden relative">
                                        <img 
                                            src={getImageUrl(manga.cover_image) || "https://via.placeholder.com/350x500?text=No+Cover"} 
                                            alt={manga.title}
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                            loading="lazy"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                        
                                        {/* Type Badge */}
                                        <div className="absolute top-2 left-2 bg-primary/90 backdrop-blur-md text-white px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider shadow-lg">
                                            {manga.type || "Manga"}
                                        </div>

                                        {/* Rating Badge */}
                                        <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded text-xs font-bold text-yellow-400 flex items-center gap-1 border border-white/10">
                                            <Star size={10} fill="currentColor" /> {manga.rating || "0.0"}
                                        </div>

                                        {/* Latest Chapter Overlay (Visible on Hover) */}
                                        <div className="absolute bottom-0 left-0 w-full p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                                            <div className="bg-primary text-white text-center py-2 rounded-lg font-bold text-sm shadow-lg">
                                                Read Now
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="p-3">
                                        <h3 className="font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1 text-sm mb-1" title={manga.title}>
                                            {manga.title}
                                        </h3>
                                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                                            <span>{manga.chapters && manga.chapters.length > 0 ? `Ch. ${manga.chapters[0].chapter_number}` : 'No Ch.'}</span>
                                            <span className="flex items-center gap-1">
                                                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                                {manga.status || "Ongoing"}
                                            </span>
                                        </div>
                                    </div>
                                </Link>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-card/30 rounded-xl border border-white/5">
                        <Filter className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                        <h3 className="text-xl font-bold text-foreground mb-2">No Manga Found</h3>
                        <p className="text-muted-foreground">Try adjusting your filters to find what you're looking for.</p>
                        <button 
                            onClick={() => {
                                setGenre(''); setStatus(''); setType(''); setOrder('update');
                                router.push('/manga');
                            }}
                            className="mt-6 px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                        >
                            Reset Filters
                        </button>
                    </div>
                )}

                {/* Pagination Controls */}
                {!loading && mangas.length > 0 && (
                    <div className="flex justify-center items-center gap-4 mt-12">
                        <button
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-card border border-border hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <ChevronLeft size={20} /> Previous
                        </button>
                        
                        <span className="text-sm font-medium">
                            Page {page} of {totalPages}
                        </span>

                        <button
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-card border border-border hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            Next <ChevronRight size={20} />
                        </button>
                    </div>
                )}
            </main>
            
            <Footer />
        </div>
    );
}

export default function ArchivePage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-background text-foreground flex items-center justify-center">Loading...</div>}>
            <MangaListContent />
        </Suspense>
    );
}
