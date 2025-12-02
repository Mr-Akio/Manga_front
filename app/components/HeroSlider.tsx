'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Star } from 'lucide-react';
import Image from 'next/image';
import { getImageUrl } from '../utils/imageUtils';
import Link from 'next/link';


export default function HeroSlider() {
  const [current, setCurrent] = useState(0);
  const [slides, setSlides] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch featured mangas
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
    fetch(`${baseUrl}/api/mangas/?is_featured=true`)
      .then(res => res.json())
      .then(data => {
        // Map API data to slide format
        const formattedSlides = data.map((manga: any) => ({
          id: manga.id,
          title: manga.title,
          image: manga.banner_image || manga.cover_image,
          description: manga.description,
          rating: manga.rating || 0.0,
          type: manga.type
        }));
        setSlides(formattedSlides);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching featured mangas:", err);
        setLoading(false);
      });
  }, []);

  const next = () => setCurrent((curr) => (curr + 1) % slides.length);
  const prev = () => setCurrent((curr) => (curr - 1 + slides.length) % slides.length);

  useEffect(() => {
    if (slides.length === 0) return;
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  if (loading || slides.length === 0) return null;

  return (
    <div className="relative w-full h-[400px] md:h-[500px] overflow-hidden rounded-xl my-6 group">
      <div 
        className="flex transition-transform duration-500 ease-out h-full"
        style={{ transform: `translateX(-${current * 100}%)` }}
      >
        {slides.map((slide) => (
          <div key={slide.id} className="w-full h-full flex-shrink-0 relative">
             <Link href={`/manga/${slide.id}`} className="block w-full h-full cursor-pointer">
                 <div 
                    className="w-full h-full bg-cover bg-center transition-transform duration-700 hover:scale-105"
                    style={{ backgroundImage: `url(${getImageUrl(slide.image)})` }}
                 >
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent">
                        <div className="absolute bottom-0 left-0 p-8 md:p-12 w-full md:w-3/4 lg:w-1/2">
                            <div className="flex items-center gap-3 mb-4">
                                <span className="bg-primary/90 backdrop-blur-md text-white px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider shadow-lg">{slide.type || "MANHWA"}</span>
                                <span className="flex items-center gap-1 text-yellow-400 font-bold text-sm bg-black/40 backdrop-blur-md px-2 py-1 rounded-lg border border-white/10">
                                    <Star size={14} fill="currentColor" /> {slide.rating}
                                </span>
                            </div>
                            <h2 className="text-4xl md:text-6xl font-black text-white mb-4 leading-tight tracking-tight drop-shadow-xl">{slide.title}</h2>
                            <p className="text-gray-200 line-clamp-2 text-lg font-medium drop-shadow-md">{slide.description}</p>
                        </div>
                    </div>
                 </div>
             </Link>
          </div>
        ))}
      </div>

      <button onClick={prev} className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 p-2 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-primary hover:text-black">
        <ChevronLeft size={24} />
      </button>
      <button onClick={next} className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 p-2 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-primary hover:text-black">
        <ChevronRight size={24} />
      </button>
      
      <div className="absolute bottom-4 right-4 flex gap-2">
        {slides.map((_, i) => (
            <div 
                key={i} 
                className={`w-2 h-2 rounded-full transition-all ${current === i ? 'bg-primary w-6' : 'bg-white/50'}`}
            />
        ))}
      </div>
    </div>
  );
}
