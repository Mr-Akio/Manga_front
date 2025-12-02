'use client';

import { useState, useEffect } from 'react';
import api from '../lib/axios';
import { User, MessageSquare, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Comment {
    id: number;
    name: string;
    user_username?: string;
    content: string;
    created_at: string;
}

interface CommentSectionProps {
    mangaId: number;
    chapterId?: number;
}

import { useAuth } from '../context/AuthContext';

// ... inside component ...
export default function CommentSection({ mangaId, chapterId }: CommentSectionProps) {
    const { user } = useAuth();
    const [comments, setComments] = useState<Comment[]>([]);
    const [name, setName] = useState('');
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const fetchComments = async () => {
        try {
            let url = `/api/comments/?manga=${mangaId}`;
            if (chapterId) {
                url += `&chapter=${chapterId}`;
            }
            const response = await api.get(url);
            setComments(response.data);
        } catch (error) {
            console.error("Error fetching comments:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchComments();
    }, [mangaId, chapterId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim()) return;

        setSubmitting(true);
        try {
            const payload: any = {
                manga: mangaId,
                chapter: chapterId,
                content: content
            };

            if (!user) {
                payload.name = name.trim() || 'Guest';
            }

            await api.post('/api/comments/', payload);
            setContent('');
            if (!user) setName('');
            fetchComments(); // Refresh comments
        } catch (error) {
            console.error("Error posting comment:", error);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="bg-card rounded-xl border border-white/5 p-6 shadow-xl">
            <h3 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
                <MessageSquare className="text-primary" /> Comments
                <span className="text-sm font-normal text-muted-foreground ml-2">({comments.length})</span>
            </h3>

            {/* Comment Form */}
            <form onSubmit={handleSubmit} className="mb-8 space-y-4">
                {!user && (
                    <div>
                        <input
                            type="text"
                            placeholder="Name (Optional)"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full md:w-1/3 bg-background/50 border border-border rounded-lg px-4 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                        />
                    </div>
                )}
                {user && (
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold">
                            <User size={14} />
                        </div>
                        <span className="text-sm font-bold text-primary">Commenting as {user.username}</span>
                    </div>
                )}
                <div className="relative">
                    <textarea
                        placeholder="Write a comment..."
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        rows={3}
                        className="w-full bg-background/50 border border-border rounded-lg px-4 py-3 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all resize-none"
                        required
                    />
                    <button
                        type="submit"
                        disabled={submitting || !content.trim()}
                        className="absolute bottom-3 right-3 bg-primary text-white px-4 py-1.5 rounded-md text-xs font-bold hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                        {submitting ? 'Posting...' : 'Post'}
                    </button>
                </div>
            </form>

            {/* Comments List */}
            <div className="space-y-6">
                {loading ? (
                    <div className="text-center py-8 text-muted-foreground">Loading comments...</div>
                ) : comments.length > 0 ? (
                    comments.map((comment) => (
                        <div key={comment.id} className="flex gap-4 group">
                            <div className="flex-shrink-0">
                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                                    <User size={20} />
                                </div>
                            </div>
                            <div className="flex-grow">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="font-bold text-foreground text-sm">{comment.user_username || comment.name}</span>
                                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                                        <Clock size={10} />
                                        {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                                    </span>
                                </div>
                                <p className="text-sm text-muted-foreground leading-relaxed group-hover:text-foreground transition-colors">
                                    {comment.content}
                                </p>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-8 text-muted-foreground bg-background/30 rounded-lg border border-white/5 border-dashed">
                        No comments yet. Be the first to share your thoughts!
                    </div>
                )}
            </div>
        </div>
    );
}
