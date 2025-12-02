'use client';

import { useEffect, useState } from 'react';
import api from './lib/axios';
import Navbar from './components/Navbar';
import HeroSlider from './components/HeroSlider';
import MangaGrid from './components/MangaGrid';
import Sidebar from './components/Sidebar';
import Footer from './components/Footer';

interface Manga {
  id: number;
  title: string;
  description: string;
  cover_image: string;
  banner_image?: string;
  genres: string;
  created_at: string;
  type: string;
  views: number;
  rating?: number;
}

export default function Home() {
  const [mangas, setMangas] = useState<Manga[]>([]);
  const [popularMangas, setPopularMangas] = useState<Manga[]>([]);
  const [loading, setLoading] = useState(true);

  // Pagination State
  const [latestPage, setLatestPage] = useState(1);
  const [popularPage, setPopularPage] = useState(1);
  const [latestCount, setLatestCount] = useState(0);
  const [popularCount, setPopularCount] = useState(0);
  const LIMIT = 12; // Items per page for latest
  const POPULAR_LIMIT = 6; // Items per page for popular

  useEffect(() => {
    fetchLatestMangas(latestPage);
  }, [latestPage]);

  useEffect(() => {
    fetchPopularMangas(popularPage);
  }, [popularPage]);

  const fetchLatestMangas = async (page: number) => {
    try {
      const offset = (page - 1) * LIMIT;
      const response = await api.get(`/api/mangas/?limit=${LIMIT}&offset=${offset}`);
      const data = response.data;
      
      if (Array.isArray(data)) {
        setMangas(data);
        setLatestCount(data.length); // Fallback if no count
      } else {
        setMangas(data.results || []);
        setLatestCount(data.count || 0);
      }
    } catch (error) {
      console.error('Error fetching latest mangas:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPopularMangas = async (page: number) => {
    try {
      const offset = (page - 1) * POPULAR_LIMIT;
      const response = await api.get(`/api/mangas/?ordering=-views&limit=${POPULAR_LIMIT}&offset=${offset}`);
      const data = response.data;

      if (Array.isArray(data)) {
        setPopularMangas(data);
        setPopularCount(data.length);
      } else {
        setPopularMangas(data.results || []);
        setPopularCount(data.count || 0);
      }
    } catch (error) {
      console.error('Error fetching popular mangas:', error);
    }
  };

  const totalLatestPages = Math.ceil(latestCount / LIMIT);
  const totalPopularPages = Math.ceil(popularCount / POPULAR_LIMIT);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="container mx-auto px-4 flex-grow">
        <HeroSlider />
        
        <div className="flex flex-col lg:flex-row gap-8 mt-8">
          <div className="flex-grow">
            {/* Latest Updates Section */}
            <div className="bg-card rounded-xl border border-border p-4 mb-8">
                <div className="flex items-center justify-between mb-4 border-b border-border pb-2">
                    <h2 className="text-xl font-bold text-primary">อัพเดทล่าสุด</h2>
                    <a href="/manga" className="text-sm text-muted-foreground hover:text-primary">ทั้งหมด</a>
                </div>
                
                {loading ? (
                    <div className="text-center py-10 text-muted-foreground">Loading...</div>
                ) : mangas.length > 0 ? (
                    <>
                        <MangaGrid title="มังงะมาใหม่" mangas={mangas} />
                        
                        {/* Pagination Controls for Latest */}
                        <div className="flex justify-center items-center gap-4 mt-6">
                            <button 
                                onClick={() => setLatestPage(p => Math.max(1, p - 1))}
                                disabled={latestPage === 1}
                                className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg disabled:opacity-50 hover:bg-secondary/80 transition-colors"
                            >
                                Previous
                            </button>
                            <span className="text-sm text-muted-foreground">
                                Page {latestPage} of {totalLatestPages || 1}
                            </span>
                            <button 
                                onClick={() => setLatestPage(p => Math.min(totalLatestPages, p + 1))}
                                disabled={latestPage >= totalLatestPages}
                                className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg disabled:opacity-50 hover:bg-secondary/80 transition-colors"
                            >
                                Next
                            </button>
                        </div>
                    </>
                ) : (
                    <div className="text-center py-10 text-muted-foreground">
                        No mangas found. <br/>
                        <span className="text-xs">Start the backend and add some data!</span>
                    </div>
                )}
            </div>

            {/* Popular Manga Section */}
            <div className="bg-card rounded-xl border border-border p-4">
                <div className="flex items-center justify-between mb-4 border-b border-border pb-2">
                    <h2 className="text-xl font-bold text-primary">มังงะยอดนิยม</h2>
                    <a href="#" className="text-sm text-muted-foreground hover:text-primary">ทั้งหมด</a>
                </div>
                {loading ? (
                    <div className="text-center py-10 text-muted-foreground">Loading...</div>
                ) : popularMangas.length > 0 ? (
                    <>
                        <MangaGrid title="" mangas={popularMangas} />
                        
                        {/* Pagination Controls for Popular */}
                        <div className="flex justify-center items-center gap-4 mt-6">
                            <button 
                                onClick={() => setPopularPage(p => Math.max(1, p - 1))}
                                disabled={popularPage === 1}
                                className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg disabled:opacity-50 hover:bg-secondary/80 transition-colors"
                            >
                                Previous
                            </button>
                            <span className="text-sm text-muted-foreground">
                                Page {popularPage} of {totalPopularPages || 1}
                            </span>
                            <button 
                                onClick={() => setPopularPage(p => Math.min(totalPopularPages, p + 1))}
                                disabled={popularPage >= totalPopularPages}
                                className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg disabled:opacity-50 hover:bg-secondary/80 transition-colors"
                            >
                                Next
                            </button>
                        </div>
                    </>
                ) : (
                    <div className="text-center py-10 text-muted-foreground">
                        No popular mangas found.
                    </div>
                )}
            </div>
          </div>

          <Sidebar />
        </div>
      </main>

      <Footer />
    </div>
  );
}
