'use client';

import { useState, useEffect } from 'react';
import api from '../../lib/axios';
import { X, Plus, Search, Trash2 } from 'lucide-react';

interface Genre {
  id: number;
  name: string;
}

interface GenreSelectorProps {
  selectedGenres: string[];
  onChange: (genres: string[]) => void;
}

export default function GenreSelector({ selectedGenres, onChange }: GenreSelectorProps) {
  const [availableGenres, setAvailableGenres] = useState<Genre[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchGenres();
  }, []);

  const fetchGenres = async () => {
    try {
      const response = await api.get('/api/genres/');
      const data = response.data;
      const results = Array.isArray(data) ? data : data.results || [];
      setAvailableGenres(results);
    } catch (error) {
      console.error("Error fetching genres:", error);
    }
  };

  const handleAddGenre = async () => {
    if (!search.trim()) return;
    
    // Check if already exists
    const existing = availableGenres.find(g => g.name.toLowerCase() === search.toLowerCase());
    if (existing) {
        if (!selectedGenres.includes(existing.name)) {
            onChange([...selectedGenres, existing.name]);
        }
        setSearch('');
        return;
    }

    // Create new genre
    setLoading(true);
    try {
        const response = await api.post('/api/genres/', { name: search });
        const newGenre = response.data;
        setAvailableGenres([...availableGenres, newGenre]);
        onChange([...selectedGenres, newGenre.name]);
        setSearch('');
    } catch (error) {
        console.error("Error creating genre:", error);
        alert("Failed to create genre. It might already exist.");
    } finally {
        setLoading(false);
    }
  };

  const handleDeleteGenre = async (id: number, name: string) => {
    if (!confirm(`Delete tag "${name}"? This will remove it from all mangas.`)) return;
    
    try {
        await api.delete(`/api/genres/${id}/`);
        setAvailableGenres(availableGenres.filter(g => g.id !== id));
        // Remove from selected if present
        if (selectedGenres.includes(name)) {
            onChange(selectedGenres.filter(g => g !== name));
        }
    } catch (error) {
        console.error("Error deleting genre:", error);
    }
  };

  const toggleGenre = (name: string) => {
    if (selectedGenres.includes(name)) {
        onChange(selectedGenres.filter(g => g !== name));
    } else {
        onChange([...selectedGenres, name]);
    }
  };

  const filteredGenres = availableGenres.filter(g => 
    g.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-3">
      {/* Selected Tags */}
      <div className="flex flex-wrap gap-2 mb-2">
        {selectedGenres.map(genre => (
            <span key={genre} className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                {genre}
                <button 
                    type="button"
                    onClick={() => toggleGenre(genre)}
                    className="hover:text-red-500 transition-colors"
                >
                    <X size={14} />
                </button>
            </span>
        ))}
      </div>

      {/* Input & Search */}
      <div className="relative flex gap-2">
        <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
            <input 
                type="text" 
                placeholder="Search or add new tag..." 
                className="w-full bg-background border border-border rounded-lg pl-9 pr-4 py-2 text-sm outline-none focus:border-primary transition-colors"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddGenre();
                    }
                }}
            />
        </div>
        <button 
            type="button"
            onClick={handleAddGenre}
            disabled={!search.trim() || loading}
            className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-bold hover:bg-primary/90 disabled:opacity-50 transition-colors"
        >
            <Plus size={16} />
        </button>
      </div>

      {/* Suggestions List */}
      {search && (
          <div className="border border-border rounded-lg p-2 max-h-40 overflow-y-auto bg-card shadow-sm">
            {filteredGenres.length > 0 ? (
                filteredGenres.map(genre => (
                    <div 
                        key={genre.id} 
                        className="flex items-center justify-between p-2 hover:bg-accent rounded-md cursor-pointer group"
                    >
                        <div 
                            className="flex-1"
                            onClick={() => {
                                toggleGenre(genre.name);
                                setSearch('');
                            }}
                        >
                            <span className={selectedGenres.includes(genre.name) ? 'font-bold text-primary' : ''}>
                                {genre.name}
                            </span>
                        </div>
                        <button 
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteGenre(genre.id, genre.name);
                            }}
                            className="text-muted-foreground hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1"
                            title="Delete Tag"
                        >
                            <Trash2 size={14} />
                        </button>
                    </div>
                ))
            ) : (
                <div className="p-2 text-sm text-muted-foreground text-center">
                    No matching tags. Press Enter to create "{search}".
                </div>
            )}
          </div>
      )}
      
      {/* All Tags (Optional: Show some common ones if search is empty) */}
      {!search && availableGenres.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
              {availableGenres.slice(0, 10).map(genre => (
                  <button
                    key={genre.id}
                    type="button"
                    onClick={() => toggleGenre(genre.name)}
                    className={`text-xs px-2 py-1 rounded-md border transition-colors ${
                        selectedGenres.includes(genre.name) 
                        ? 'bg-primary text-primary-foreground border-primary' 
                        : 'bg-background border-border hover:border-primary/50'
                    }`}
                  >
                      {genre.name}
                  </button>
              ))}
          </div>
      )}
    </div>
  );
}
