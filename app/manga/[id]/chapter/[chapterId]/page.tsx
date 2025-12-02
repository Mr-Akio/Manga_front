'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../../../../context/AuthContext';
import { useParams, useRouter } from 'next/navigation';
import api from '../../../../lib/axios';
import Navbar from '../../../../components/Navbar';
import Footer from '../../../../components/Footer';
import CommentSection from '../../../../components/CommentSection';
import { ChevronLeft, ChevronRight, List } from 'lucide-react';
import Link from 'next/link';
import { getImageUrl } from '../../../../utils/imageUtils';

interface Chapter {
    id: number;
    chapter_number: string;
    released_at: string;
    pages: string[];
    manga: number; // Manga ID
}

interface Manga {
    id: number;
    title: string;
    chapters: { id: number; chapter_number: string }[];
}

export default function ChapterReadingPage() {
    const params = useParams();
    const id = params?.id as string;
    const chapterId = params?.chapterId as string;
    
    const router = useRouter();
    const [manga, setManga] = useState<Manga | null>(null);
    const [currentChapter, setCurrentChapter] = useState<Chapter | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id && chapterId) {
            console.log("Fetching details for Manga:", id, "Chapter:", chapterId);
            
            // Fetch Manga Details to get context and chapter list
            api.get(`/api/mangas/${id}/`)
                .then(response => {
                    const mangaData = response.data;
                    setManga(mangaData);
                    console.log("Manga Data:", mangaData);
                    
                    // Find the current chapter from the list
                    // Ensure robust comparison by converting both to string
                    const chapter = mangaData.chapters.find((c: any) => String(c.chapter_number) === String(chapterId));
                    
                    if (chapter) {
                        console.log("Found Chapter:", chapter);
                        // Fetch full chapter details (with pages)
                        api.get(`/api/chapters/${chapter.id}/`)
                            .then(chResponse => {
                                setCurrentChapter(chResponse.data);
                                setLoading(false);
                                saveHistory(mangaData, chResponse.data);
                            })
                            .catch(err => {
                                console.error("Error fetching chapter details:", err);
                                setLoading(false);
                            });
                    } else {
                        console.error("Chapter not found in manga. Available chapters:", mangaData.chapters);
                        setLoading(false);
                    }
                })
                .catch(error => {
                    console.error("Error fetching manga:", error);
                    setLoading(false);
                });
        }
    }, [id, chapterId]);

    const { user } = useAuth();

    const saveHistory = (manga: Manga, chapter: Chapter) => {
        // 1. Save to LocalStorage (Always, for guest support)
        const historyItem = {
            mangaId: manga.id,
            mangaTitle: manga.title,
            chapterId: chapter.id,
            chapterNumber: chapter.chapter_number,
            readAt: new Date().toISOString()
        };

        const history = JSON.parse(localStorage.getItem('reading_history') || '[]');
        const filteredHistory = history.filter((item: any) => item.mangaId !== manga.id);
        const newHistory = [historyItem, ...filteredHistory].slice(0, 10);
        localStorage.setItem('reading_history', JSON.stringify(newHistory));

        // 2. Save to Backend (If logged in)
        if (user) {
            api.post('/api/history/update_history/', {
                manga: manga.id,
                chapter: chapter.id
            }).catch(err => console.error("Failed to sync history:", err));
        }
    };

    const handleChapterChange = (newChapterNumber: string) => {
        router.push(`/manga/${id}/chapter/${newChapterNumber}`);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!currentChapter || !manga) {
        return (
            <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center gap-4">
                <h1 className="text-2xl font-bold">Chapter not found</h1>
                <p className="text-muted-foreground">Manga ID: {id}, Chapter: {chapterId}</p>
                <Link href={`/manga/${id}`} className="text-primary hover:underline">
                    Back to Manga
                </Link>
            </div>
        );
    }

    // Calculate Next/Prev
    const sortedChapters = [...manga.chapters].sort((a, b) => {
        return parseFloat(a.chapter_number) - parseFloat(b.chapter_number);
    });

    const currentIndex = sortedChapters.findIndex(c => String(c.chapter_number) === String(currentChapter.chapter_number));
    const prevChapter = currentIndex > 0 ? sortedChapters[currentIndex - 1] : null;
    const nextChapter = currentIndex < sortedChapters.length - 1 ? sortedChapters[currentIndex + 1] : null;

    return (
        <div className="min-h-screen bg-[#1a1a1a] text-foreground font-sans">
            <Navbar />
            
            <main className="container mx-auto px-0 md:px-4 py-4 max-w-4xl">
                {/* Header / Navigation */}
                <div className="bg-card p-4 rounded-lg mb-4 flex flex-col md:flex-row items-center justify-between gap-4 border border-border">
                    <div className="text-center md:text-left">
                        <Link href={`/manga/${id}`} className="text-lg font-bold hover:text-primary transition-colors block">
                            {manga.title}
                        </Link>
                        <span className="text-sm text-muted-foreground">Chapter {currentChapter.chapter_number}</span>
                    </div>

                    <div className="flex items-center gap-2">
                        <button 
                            onClick={() => prevChapter && handleChapterChange(prevChapter.chapter_number)}
                            disabled={!prevChapter}
                            className="p-2 rounded bg-accent/20 hover:bg-accent/40 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <ChevronLeft size={20} />
                        </button>

                        <select 
                            value={currentChapter.chapter_number}
                            onChange={(e) => handleChapterChange(e.target.value)}
                            className="bg-background border border-border rounded px-4 py-2 text-sm focus:outline-none focus:border-primary min-w-[150px]"
                        >
                            {sortedChapters.map(c => (
                                <option key={c.id} value={c.chapter_number}>
                                    Chapter {c.chapter_number}
                                </option>
                            ))}
                        </select>

                        <button 
                            onClick={() => nextChapter && handleChapterChange(nextChapter.chapter_number)}
                            disabled={!nextChapter}
                            className="p-2 rounded bg-accent/20 hover:bg-accent/40 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <ChevronRight size={20} />
                        </button>
                    </div>
                </div>

                {/* Reading Area */}
                <div className="flex flex-col items-center min-h-[500px]">
                    {currentChapter.pages && currentChapter.pages.length > 0 ? (
                        currentChapter.pages.map((pageUrl, index) => (
                            <img 
                                key={index}
                                src={getImageUrl(pageUrl)}
                                alt={`Page ${index + 1}`}
                                className="w-full max-w-3xl h-auto object-contain"
                                loading="lazy"
                            />
                        ))
                    ) : (
                        <div className="p-12 text-center text-muted-foreground">
                            <p>No pages available for this chapter.</p>
                            <p className="text-xs mt-2">Admin: Add pages via Django Admin (JSON format: ["url1", "url2"])</p>
                        </div>
                    )}
                </div>

                {/* Bottom Navigation */}
                <div className="mt-6 flex justify-between items-center">
                    <button 
                        onClick={() => prevChapter && handleChapterChange(prevChapter.chapter_number)}
                        disabled={!prevChapter}
                        className="px-6 py-2 rounded bg-card hover:bg-accent/20 border border-border disabled:opacity-50 transition-colors flex items-center gap-2"
                    >
                        <ChevronLeft size={16} /> Prev
                    </button>
                    
                    <button 
                        onClick={() => nextChapter && handleChapterChange(nextChapter.chapter_number)}
                        disabled={!nextChapter}
                        className="px-6 py-2 rounded bg-card hover:bg-accent/20 border border-border disabled:opacity-50 transition-colors flex items-center gap-2"
                    >
                        Next <ChevronRight size={16} />
                    </button>
                </div>
                
                {/* Comments Section */}
                <div className="mt-8">
                    <CommentSection mangaId={manga.id} chapterId={currentChapter.id} />
                </div>

            </main>
            
            <Footer />
        </div>
    );
}
