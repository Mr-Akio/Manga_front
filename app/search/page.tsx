'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import api from '../lib/axios';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import MangaGrid from '../components/MangaGrid';

interface Manga {
    id: number;
    title: string;
    cover_image: string;
    type?: string;
    views?: number;
    rating?: number;
    chapters?: { id: number; chapter_number: string; released_at: string }[];
}

function SearchContent() {
    const searchParams = useSearchParams();
    const query = searchParams.get('q');
    const [mangas, setMangas] = useState<Manga[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (query) {
            setLoading(true);
            api.get(`/api/mangas/?search=${encodeURIComponent(query)}`)
                .then(response => {
                    setMangas(response.data);
                    setLoading(false);
                })
                .catch(error => {
                    console.error("Error fetching search results:", error);
                    setLoading(false);
                });
        }
    }, [query]);

    return (
        <div className="min-h-screen bg-background text-foreground font-sans">
            <Navbar />
            
            <main className="container mx-auto px-4 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-primary">
                        Search Results: "{query}"
                    </h1>
                </div>

                {loading ? (
                    <div className="flex justify-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                    </div>
                ) : mangas.length > 0 ? (
                    <MangaGrid title={`Found ${mangas.length} results`} mangas={mangas} />
                ) : (
                    <div className="text-center py-12 text-muted-foreground">
                        No manga found matching "{query}".
                    </div>
                )}
            </main>
            
            <Footer />
        </div>
    );
}

export default function SearchPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-background text-foreground flex items-center justify-center">Loading...</div>}>
            <SearchContent />
        </Suspense>
    );
}
