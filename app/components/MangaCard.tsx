import Link from 'next/link';
import { Star } from 'lucide-react';
import { getImageUrl } from '../utils/imageUtils';

interface Chapter {
  id: number;
  chapter_number: string;
  released_at: string;
}

interface MangaProps {
  id: number;
  title: string;
  cover_image: string;
  rating?: number;
  type?: string;
  chapters?: Chapter[];
}

export default function MangaCard({ manga }: { manga: MangaProps }) {
  return (
    <div className="group relative block overflow-hidden rounded-xl bg-card/50 hover:bg-card transition-all duration-300 hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-1">
      <Link href={`/manga/${manga.id}`}>
        <div className="aspect-[2/3] w-full overflow-hidden relative">
            <img 
            src={getImageUrl(manga.cover_image) || "https://via.placeholder.com/300x450?text=No+Cover"} 
            alt={manga.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
            loading="lazy"
            />
            <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md px-2 py-1 rounded-lg text-xs font-bold text-yellow-400 flex items-center gap-1 border border-white/10">
                <Star size={12} fill="currentColor" /> {manga.rating || "0.0"}
            </div>
            <div className="absolute top-2 left-2 bg-primary/90 backdrop-blur-md text-white px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider shadow-lg">
                {manga.type || "Manhwa"}
            </div>
        </div>
      </Link>
      
      <div className="p-3">
        <Link href={`/manga/${manga.id}`}>
            <h3 className="line-clamp-1 text-sm font-bold text-foreground group-hover:text-primary transition-colors mb-2">
            {manga.title}
            </h3>
        </Link>
        
        <div className="space-y-1">
            {manga.chapters && manga.chapters.length > 0 ? (
                manga.chapters.map((chapter) => (
                    <Link key={chapter.id} href={`/manga/${manga.id}/chapter/${chapter.chapter_number}`} className="flex justify-between items-center text-xs text-muted-foreground hover:text-primary transition-colors bg-accent/50 p-1.5 rounded">
                        <span>ตอนที่ {chapter.chapter_number}</span>
                        <span className="text-[10px] opacity-70">New</span>
                    </Link>
                ))
            ) : (
                <div className="text-xs text-muted-foreground">No chapters yet</div>
            )}
        </div>
      </div>
    </div>
  );
}
