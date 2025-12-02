'use client';

import { useState } from 'react';
import api from '../../../lib/axios';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Upload, Save } from 'lucide-react';
import Link from 'next/link';
import GenreSelector from '../../components/GenreSelector';

export default function CreateMangaPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'Manhwa',
    status: 'Ongoing',
    author: '',
    artist: '',
    released_year: new Date().getFullYear().toString(),
  });
  
  const [genres, setGenres] = useState<string[]>([]);
  const [coverFile, setCoverFile] = useState<File | null>(null);

  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setCoverFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setBannerFile(file);
      setBannerPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
        const data = new FormData();
        Object.entries(formData).forEach(([key, value]) => {
            data.append(key, value);
        });
        
        // Append genres
        genres.forEach(genre => {
            data.append('genres', genre);
        });

        if (coverFile) {
            data.append('cover_image_file', coverFile);
        }
        if (bannerFile) {
            data.append('banner_image_file', bannerFile);
        }

        const response = await api.post('/api/mangas/', data, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });

        alert("Manga created successfully! Now you can add chapters.");
        router.push(`/admin/manga/${response.data.id}`);
    } catch (error) {
        console.error("Error creating manga:", error);
        alert("Failed to create manga. Please try again.");
    } finally {
        setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <Link href="/admin" className="text-muted-foreground hover:text-foreground flex items-center gap-2 mb-4 transition-colors">
            <ArrowLeft size={16} /> Back to Dashboard
        </Link>
        <h1 className="text-3xl font-bold text-foreground">Add New Manga</h1>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Form Fields */}
        <div className="lg:col-span-2 space-y-6">
            <div className="bg-card border border-border rounded-xl p-6 space-y-4">
                <h2 className="text-xl font-bold mb-4">Basic Information</h2>
                
                <div>
                    <label className="block text-sm font-medium mb-1">Title</label>
                    <input 
                        type="text" 
                        name="title"
                        required
                        className="w-full bg-background border border-border rounded-lg px-4 py-2 focus:ring-1 focus:ring-primary outline-none"
                        value={formData.title}
                        onChange={handleChange}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Description</label>
                    <textarea 
                        name="description"
                        rows={5}
                        className="w-full bg-background border border-border rounded-lg px-4 py-2 focus:ring-1 focus:ring-primary outline-none resize-none"
                        value={formData.description}
                        onChange={handleChange}
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Type</label>
                        <select 
                            name="type"
                            className="w-full bg-background border border-border rounded-lg px-4 py-2 focus:ring-1 focus:ring-primary outline-none"
                            value={formData.type}
                            onChange={handleChange}
                        >
                            <option value="Manhwa">Manhwa</option>
                            <option value="Manhua">Manhua</option>
                            <option value="Manga">Manga</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Status</label>
                        <select 
                            name="status"
                            className="w-full bg-background border border-border rounded-lg px-4 py-2 focus:ring-1 focus:ring-primary outline-none"
                            value={formData.status}
                            onChange={handleChange}
                        >
                            <option value="Ongoing">Ongoing</option>
                            <option value="Completed">Completed</option>
                            <option value="Hiatus">Hiatus</option>
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Author</label>
                        <input 
                            type="text" 
                            name="author"
                            className="w-full bg-background border border-border rounded-lg px-4 py-2 focus:ring-1 focus:ring-primary outline-none"
                            value={formData.author}
                            onChange={handleChange}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Artist</label>
                        <input 
                            type="text" 
                            name="artist"
                            className="w-full bg-background border border-border rounded-lg px-4 py-2 focus:ring-1 focus:ring-primary outline-none"
                            value={formData.artist}
                            onChange={handleChange}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Released Year</label>
                        <input 
                            type="text" 
                            name="released_year"
                            className="w-full bg-background border border-border rounded-lg px-4 py-2 focus:ring-1 focus:ring-primary outline-none"
                            value={formData.released_year}
                            onChange={handleChange}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Genres</label>
                        <GenreSelector 
                            selectedGenres={genres} 
                            onChange={setGenres} 
                        />
                    </div>
                </div>
            </div>
        </div>

        {/* Right Column: Cover Image & Actions */}
        <div className="space-y-6">
            <div className="bg-card border border-border rounded-xl p-6">
                <h2 className="text-xl font-bold mb-4">Cover Image</h2>
                <div className="aspect-[2/3] w-full bg-muted rounded-lg overflow-hidden mb-4 border-2 border-dashed border-border flex items-center justify-center relative group">
                    {preview ? (
                        <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                        <div className="text-center text-muted-foreground p-4">
                            <Upload className="mx-auto mb-2 opacity-50" />
                            <span className="text-sm">Upload Cover</span>
                        </div>
                    )}
                    <input 
                        type="file" 
                        accept="image/*"
                        className="absolute inset-0 opacity-0 cursor-pointer"
                        onChange={handleFileChange}
                    />
                </div>
                <p className="text-xs text-muted-foreground text-center">
                    Click to upload. Supports JPG, PNG, WEBP.
                </p>
            </div>

            <div className="bg-card border border-border rounded-xl p-6">
                <h2 className="text-xl font-bold mb-4">Banner Image</h2>
                <div className="aspect-video w-full bg-muted rounded-lg overflow-hidden mb-4 border-2 border-dashed border-border flex items-center justify-center relative group">
                    {bannerPreview ? (
                        <img src={bannerPreview} alt="Banner Preview" className="w-full h-full object-cover" />
                    ) : (
                        <div className="text-center text-muted-foreground p-4">
                            <Upload className="mx-auto mb-2 opacity-50" />
                            <span className="text-sm">Upload Banner</span>
                        </div>
                    )}
                    <input 
                        type="file" 
                        accept="image/*"
                        className="absolute inset-0 opacity-0 cursor-pointer"
                        onChange={handleBannerChange}
                    />
                </div>
                <p className="text-xs text-muted-foreground text-center">
                    Optional. Used for Hero Slider.
                </p>
            </div>

            <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-3 rounded-xl font-bold shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {loading ? 'Saving...' : (
                    <>
                        <Save size={20} /> Create Manga
                    </>
                )}
            </button>
            <p className="text-xs text-muted-foreground text-center mt-2">
                * You can add chapters after creating the manga.
            </p>
        </div>
      </form>
    </div>
  );
}
