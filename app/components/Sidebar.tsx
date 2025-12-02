'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';


import { getImageUrl } from '../utils/imageUtils';

export default function Sidebar() {
  const [topMangas, setTopMangas] = useState<any[]>([]);

  useEffect(() => {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
    fetch(`${baseUrl}/api/mangas/?ordering=-views&limit=10`)
      .then(res => res.json())
      .then(data => {
        // Handle pagination if API returns { results: [...] } or just array
        const results = Array.isArray(data) ? data : data.results || [];
        setTopMangas(results.slice(0, 10));
      })
      .catch(err => console.error("Error fetching top mangas:", err));
  }, []);

  return (
    <aside className="w-full lg:w-[320px] flex-shrink-0 space-y-8">
      <div className="bg-card rounded-xl p-4 border border-border">
        <h3 className="text-lg font-bold text-primary mb-4 border-b border-border pb-2">มังงะติดอันดับ TOP 10</h3>
        <div className="space-y-4">
            {topMangas.map((manga, index) => (
                <Link key={manga.id} href={`/manga/${manga.id}`} className="flex gap-3 group">
                    <div className="relative w-[60px] h-[80px] flex-shrink-0 overflow-hidden rounded">
                        <img src={getImageUrl(manga.cover_image) || "https://via.placeholder.com/60x80"} alt={manga.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                        <div className="absolute top-0 left-0 bg-primary text-black text-xs font-bold w-5 h-5 flex items-center justify-center rounded-br">
                            {index + 1}
                        </div>
                    </div>
                    <div className="flex flex-col justify-center">
                        <h4 className="text-sm font-bold text-foreground group-hover:text-primary line-clamp-2 transition-colors">{manga.title}</h4>
                        <div className="text-xs text-muted-foreground mt-1">
                            Views: <span className="text-primary font-bold">{manga.views.toLocaleString()}</span>
                        </div>
                        <div className="text-xs text-muted-foreground">
                            {Array.isArray(manga.genres) && manga.genres.length > 0 ? manga.genres[0] : 'Manhwa'}
                        </div>
                    </div>
                </Link>
            ))}
        </div>
      </div>
      
      <div className="bg-card rounded-xl p-4 border border-border">
         <h3 className="text-lg font-bold text-primary mb-4 border-b border-border pb-2">Facebook Page</h3>
         <div className="aspect-video bg-border/20 rounded flex items-center justify-center text-muted-foreground text-sm">
            Facebook Widget Placeholder
         </div>
      </div>
    </aside>
  );
}
