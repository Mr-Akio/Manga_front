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

  useEffect(() => {
    const fetchMangas = async () => {
      try {
        const [latestRes, popularRes] = await Promise.all([
          api.get('/api/mangas/'),
          api.get('/api/mangas/?ordering=-views&limit=6')
        ]);
        
        setMangas(latestRes.data);
        
        // Handle pagination structure if present
        const popularData = Array.isArray(popularRes.data) ? popularRes.data : popularRes.data.results || [];
        setPopularMangas(popularData.slice(0, 6));
        
      } catch (error) {
        console.error('Error fetching mangas:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMangas();
  }, []);

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
                    <MangaGrid title="มังงะมาใหม่" mangas={mangas} />
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
                    <MangaGrid title="" mangas={popularMangas} />
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
