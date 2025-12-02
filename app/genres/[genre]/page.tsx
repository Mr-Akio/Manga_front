'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import api from '../../lib/axios';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import MangaGrid from '../../components/MangaGrid';

interface Manga {
    id: number;
    title: string;
    cover_image: string;
    chapters: { id: number; chapter_number: string; released_at: string }[];
    genres: string[] | string;
    type?: string;
    views?: number;
    rating?: number;
}

export default function GenrePage() {
    const { genre } = useParams();
    const [mangas, setMangas] = useState<Manga[]>([]);
    const [loading, setLoading] = useState(true);
    const decodedGenre = decodeURIComponent(genre as string);

    useEffect(() => {
        if (genre) {
            api.get('/api/mangas/')
                .then(response => {
                    // Filter locally for now since backend doesn't support filtering yet
                    // In a real app, we should add ?genre=... to the API
                    const allMangas = response.data;
                    const filtered = allMangas.filter((m: Manga) => {
                        // Check if genres is an array (new format) or string (old format fallback)
                        let genreMatch = false;
                        if (Array.isArray(m.genres)) {
                            genreMatch = m.genres.some((g: string) => g.toLowerCase() === decodedGenre.toLowerCase());
                        } else if (typeof m.genres === 'string') {
                            genreMatch = (m.genres as string).toLowerCase().includes(decodedGenre.toLowerCase());
                        }
                        
                        const typeMatch = m.type && m.type.toLowerCase() === decodedGenre.toLowerCase();
                        return genreMatch || typeMatch;
                    });
                    setMangas(filtered);
                    setLoading(false);
                })
                .catch(error => {
                    console.error("Error fetching mangas:", error);
                    setLoading(false);
                });
        }
    }, [genre, decodedGenre]);

    return (
        <div className="min-h-screen bg-background text-foreground font-sans">
            <Navbar />
            
            <main className="container mx-auto px-4 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-primary capitalize">
                        {decodedGenre} Manga
                    </h1>
                    <p className="text-muted-foreground mt-2">
                        List of manga in the {decodedGenre} genre.
                    </p>
                </div>

                {loading ? (
                    <div className="flex justify-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                    </div>
                ) : mangas.length > 0 ? (
                    <MangaGrid title={`${decodedGenre} Manga`} mangas={mangas} />
                ) : (
                    <div className="text-center py-12 text-muted-foreground">
                        No manga found in this genre.
                    </div>
                )}
            </main>
            
            <Footer />
        </div>
    );
}
