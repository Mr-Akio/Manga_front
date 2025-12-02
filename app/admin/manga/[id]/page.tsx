'use client';

import { useState, useEffect } from 'react';
import api from '../../../lib/axios';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Upload, Save, Plus, Trash2, FileText, Image as ImageIcon } from 'lucide-react';
import Link from 'next/link';
import { getImageUrl } from '../../../utils/imageUtils';
import ConfirmModal from '../../../components/ConfirmModal';
import GenreSelector from '../../components/GenreSelector';

interface Chapter {
    id: number;
    chapter_number: string;
    released_at: string;
    pages: string[];
}

export default function EditMangaPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  
  // Modal State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [chapterToDelete, setChapterToDelete] = useState<number | null>(null);
  
  // Manga Data
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'Manhwa',
    status: 'Ongoing',
    author: '',
    artist: '',
    released_year: '',
    views: 0,
    rating: 0.0,
    is_featured: false,
    cover_image: '',
    banner_image: '',
  });
  const [genres, setGenres] = useState<string[]>([]);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);

  // New Chapter Data
  const [newChapterNum, setNewChapterNum] = useState('');
  const [chapterFiles, setChapterFiles] = useState<FileList | null>(null);
  const [uploadingChapter, setUploadingChapter] = useState(false);

  useEffect(() => {
    fetchMangaDetails();
  }, [id]);

  const fetchMangaDetails = async () => {
    try {
        const response = await api.get(`/api/mangas/${id}/`);
        const data = response.data;
        setFormData({
            title: data.title,
            description: data.description,
            type: data.type,
            status: data.status,
            author: data.author,
            artist: data.artist,
            released_year: data.released_year,
            views: data.views || 0,
            rating: data.rating || 0.0,
            is_featured: data.is_featured || false,
            cover_image: data.cover_image || '',
            banner_image: data.banner_image || '',
        });
        setGenres(data.genres || []);
        setPreview(getImageUrl(data.cover_image));
        setBannerPreview(getImageUrl(data.banner_image));
        setChapters(data.chapters || []);
        setLoading(false);
    } catch (error) {
        console.error("Error fetching manga:", error);
        alert("Failed to load manga details.");
        router.push('/admin');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
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

  const handleUpdateManga = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
        const data = new FormData();
        Object.entries(formData).forEach(([key, value]) => {
            if (key === 'is_featured') {
                data.append(key, value ? 'true' : 'false');
            } else {
                data.append(key, String(value));
            }
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

        await api.patch(`/api/mangas/${id}/`, data, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });

        // alert("Manga updated successfully!"); // Removed alert
        setSaved(true);
        setTimeout(() => setSaved(false), 3000); // Reset after 3 seconds
        
        // Refresh data to get new URLs etc
        fetchMangaDetails();
    } catch (error) {
        console.error("Error updating manga:", error);
        alert("Failed to update manga.");
    } finally {
        setSaving(false);
    }
  };

  const handleAddChapter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChapterNum || !chapterFiles || chapterFiles.length === 0) {
        alert("Please enter a chapter number and select files.");
        return;
    }

    setUploadingChapter(true);
    try {
        const data = new FormData();
        data.append('manga', id as string);
        data.append('chapter_number', newChapterNum);
        
        // Append each file
        for (let i = 0; i < chapterFiles.length; i++) {
            data.append('files_input', chapterFiles[i]);
        }

        await api.post('/api/chapters/', data, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });

        alert("Chapter added successfully!");
        setNewChapterNum('');
        setChapterFiles(null);
        // Reset file input manually if needed or just rely on state
        const fileInput = document.getElementById('chapter-files') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
        
        fetchMangaDetails();
    } catch (error) {
        console.error("Error adding chapter:", error);
        alert("Failed to add chapter. Check console for details.");
    } finally {
        setUploadingChapter(false);
    }
  };

  const confirmDeleteChapter = (chapterId: number) => {
    setChapterToDelete(chapterId);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteChapter = async () => {
    if (!chapterToDelete) return;
    try {
        await api.delete(`/api/chapters/${chapterToDelete}/`);
        setChapters(chapters.filter(c => c.id !== chapterToDelete));
    } catch (error) {
        console.error("Error deleting chapter:", error);
        alert("Failed to delete chapter.");
    }
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div>
      <ConfirmModal 
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteChapter}
        title="Delete Chapter?"
        message="Are you sure you want to delete this chapter? This action cannot be undone."
        confirmText="Yes, Delete"
        isDestructive={true}
      />

      <div className="mb-6 flex items-center justify-between">
        <div>
            <Link href="/admin" className="text-muted-foreground hover:text-foreground flex items-center gap-2 mb-2 transition-colors">
                <ArrowLeft size={16} /> Back to Dashboard
            </Link>
            <h1 className="text-3xl font-bold text-foreground">Edit Manga: {formData.title}</h1>
        </div>
        <div className="flex gap-2">
            <Link href={`/manga/${id}`} target="_blank" className="bg-secondary hover:bg-secondary/80 text-secondary-foreground px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors">
                <ArrowLeft size={16} className="rotate-180" /> View on Site
            </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Edit Form */}
        <div className="lg:col-span-2 space-y-8">
            {/* Manga Details Form */}
            <form onSubmit={handleUpdateManga} className="bg-card border border-border rounded-xl p-6 space-y-4">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold">Basic Information</h2>

                    <button 
                        type="submit" 
                        disabled={saving}
                        className={`px-4 py-2 rounded-lg font-bold text-sm shadow-lg transition-all flex items-center gap-2 disabled:opacity-50 ${
                            saved 
                            ? 'bg-green-600 hover:bg-green-700 text-white shadow-green-600/20' 
                            : 'bg-primary hover:bg-primary/90 text-primary-foreground shadow-primary/20'
                        }`}
                    >
                        {saving ? 'Saving...' : saved ? <><Save size={16} /> Saved!</> : <><Save size={16} /> Save Changes</>}
                    </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
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

                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium mb-1">Description</label>
                        <textarea 
                            name="description"
                            rows={4}
                            className="w-full bg-background border border-border rounded-lg px-4 py-2 focus:ring-1 focus:ring-primary outline-none resize-none"
                            value={formData.description}
                            onChange={handleChange}
                        />
                    </div>

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
                    
                    <div>
                        <label className="block text-sm font-medium mb-1">Author</label>
                        <input type="text" name="author" className="w-full bg-background border border-border rounded-lg px-4 py-2" value={formData.author} onChange={handleChange} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Artist</label>
                        <input type="text" name="artist" className="w-full bg-background border border-border rounded-lg px-4 py-2" value={formData.artist} onChange={handleChange} />
                    </div>

                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium mb-1">Genres</label>
                        <GenreSelector 
                            selectedGenres={genres} 
                            onChange={setGenres} 
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4 md:col-span-2">
                        <div>
                            <label className="block text-sm font-medium mb-1">Views</label>
                            <input 
                                type="number" 
                                name="views" 
                                className="w-full bg-background border border-border rounded-lg px-4 py-2" 
                                value={formData.views} 
                                onChange={handleChange} 
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Rating</label>
                            <input 
                                type="number" 
                                step="0.1"
                                name="rating" 
                                className="w-full bg-background border border-border rounded-lg px-4 py-2" 
                                value={formData.rating} 
                                onChange={handleChange} 
                            />
                        </div>
                    </div>

                    <div className="md:col-span-2 flex items-center gap-2">
                        <input 
                            type="checkbox" 
                            id="is_featured"
                            name="is_featured" 
                            className="w-4 h-4"
                            checked={formData.is_featured} 
                            onChange={handleChange} 
                        />
                        <label htmlFor="is_featured" className="text-sm font-medium">Is Featured (Show on Hero Slider)</label>
                    </div>
                </div>
            </form>

            {/* Chapter Management */}
            <div className="bg-card border border-border rounded-xl p-6">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                    <FileText className="text-primary" /> Chapters
                </h2>

                {/* Add Chapter Form */}
                <div className="bg-muted/30 border border-border rounded-lg p-4 mb-6">
                    <h3 className="font-bold text-sm mb-3 uppercase tracking-wider text-muted-foreground">Add New Chapter</h3>
                    <form onSubmit={handleAddChapter} className="flex flex-col md:flex-row gap-4 items-end">
                        <div className="w-full md:w-32">
                            <label className="block text-xs font-bold mb-1">Chapter #</label>
                            <input 
                                type="text" 
                                placeholder="e.g. 1"
                                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm"
                                value={newChapterNum}
                                onChange={(e) => setNewChapterNum(e.target.value)}
                            />
                        </div>
                        <div className="flex-1 w-full">
                            <label className="block text-xs font-bold mb-1">Chapter Pages (Images)</label>
                            <input 
                                id="chapter-files"
                                type="file" 
                                multiple
                                accept="image/*"
                                className="w-full bg-background border border-border rounded-lg px-3 py-1.5 text-sm file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                                onChange={(e) => setChapterFiles(e.target.files)}
                            />
                        </div>
                        <button 
                            type="submit" 
                            disabled={uploadingChapter}
                            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-bold text-sm transition-colors flex items-center gap-2 disabled:opacity-50 whitespace-nowrap"
                        >
                            {uploadingChapter ? 'Uploading...' : <><Plus size={16} /> Add Chapter</>}
                        </button>
                    </form>
                </div>

                {/* Chapter List */}
                <div className="space-y-2">
                    {chapters.length > 0 ? (
                        chapters.map((chapter) => (
                            <div key={chapter.id} className="flex items-center justify-between p-3 bg-background border border-border rounded-lg hover:border-primary/50 transition-colors group">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                                        {chapter.chapter_number}
                                    </div>
                                    <div>
                                        <div className="font-bold text-sm">Chapter {chapter.chapter_number}</div>
                                        <div className="text-xs text-muted-foreground">{chapter.pages?.length || 0} pages • {new Date(chapter.released_at).toLocaleDateString()}</div>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => confirmDeleteChapter(chapter.id)}
                                    className="p-2 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                                    title="Delete Chapter"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-8 text-muted-foreground text-sm">
                            No chapters yet. Add one above!
                        </div>
                    )}
                </div>
            </div>
        </div>

        {/* Right Column: Cover Image */}
        <div className="space-y-6">
            <div className="bg-card border border-border rounded-xl p-6">
                <h2 className="text-xl font-bold mb-4">Cover Image</h2>
                <div className="aspect-[2/3] w-full bg-muted rounded-lg overflow-hidden mb-4 border-2 border-dashed border-border flex items-center justify-center relative group">
                    {preview ? (
                        <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                        <div className="text-center text-muted-foreground p-4">
                            <ImageIcon className="mx-auto mb-2 opacity-50" />
                            <span className="text-sm">No Cover</span>
                        </div>
                    )}
                    <input 
                        type="file" 
                        accept="image/*"
                        className="absolute inset-0 opacity-0 cursor-pointer"
                        onChange={handleFileChange}
                    />
                </div>
                <div className="mb-2">
                    <label className="block text-xs font-bold mb-1">Or Image URL</label>
                    <input 
                        type="text" 
                        name="cover_image"
                        placeholder="https://example.com/image.jpg"
                        className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm"
                        value={formData.cover_image}
                        onChange={(e) => {
                            handleChange(e);
                            setPreview(e.target.value);
                        }}
                    />
                </div>
                <p className="text-xs text-muted-foreground text-center">
                    Upload file or paste URL.
                </p>
            </div>

            <div className="bg-card border border-border rounded-xl p-6">
                <h2 className="text-xl font-bold mb-4">Banner Image</h2>
                <div className="aspect-video w-full bg-muted rounded-lg overflow-hidden mb-4 border-2 border-dashed border-border flex items-center justify-center relative group">
                    {bannerPreview ? (
                        <img src={bannerPreview} alt="Banner Preview" className="w-full h-full object-cover" />
                    ) : (
                        <div className="text-center text-muted-foreground p-4">
                            <ImageIcon className="mx-auto mb-2 opacity-50" />
                            <span className="text-sm">No Banner</span>
                        </div>
                    )}
                    <input 
                        type="file" 
                        accept="image/*"
                        className="absolute inset-0 opacity-0 cursor-pointer"
                        onChange={handleBannerChange}
                    />
                </div>
                <div className="mb-2">
                    <label className="block text-xs font-bold mb-1">Or Image URL</label>
                    <input 
                        type="text" 
                        name="banner_image"
                        placeholder="https://example.com/banner.jpg"
                        className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm"
                        value={formData.banner_image}
                        onChange={(e) => {
                            handleChange(e);
                            setBannerPreview(e.target.value);
                        }}
                    />
                </div>
                <p className="text-xs text-muted-foreground text-center">
                    Optional. Used for Hero Slider.
                </p>
            </div>
        </div>
      </div>
    </div>
  );
}