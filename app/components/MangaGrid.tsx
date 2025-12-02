import MangaCard from './MangaCard';

interface Chapter {
    id: number;
    chapter_number: string;
    released_at: string;
}

interface Manga {
    id: number;
    title: string;
    cover_image: string;
    type?: string;
    views?: number;
    rating?: number;
    chapters?: Chapter[];
}

export default function MangaGrid({ title, mangas }: { title: string, mangas: Manga[] }) {
  return (
    <section className="my-8">
      <div className="flex items-center justify-between mb-6 border-l-4 border-primary pl-4">
        <h2 className="text-2xl font-bold text-primary">{title}</h2>
        <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">ดูทั้งหมด</a>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
        {mangas.map((manga) => (
          <MangaCard key={manga.id} manga={manga} />
        ))}
      </div>
    </section>
  );
}
