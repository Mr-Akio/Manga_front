'use client';

import { useState, useEffect } from 'react';
import api from '../lib/axios';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Plus, Search, Edit, Trash2, Eye, Star, Users, Shield, Key, MessageSquare } from 'lucide-react';
import { getImageUrl } from '../utils/imageUtils';
import ConfirmModal from '../components/ConfirmModal';
import { useAuth } from '../context/AuthContext';

interface Manga {
  id: number;
  title: string;
  cover_image: string;
  type: string;
  status: string;
  views: number;
  rating: number;
  created_at: string;
}

interface User {
    id: number;
    username: string;
    email: string;
    is_staff: boolean;
    date_joined: string;
}

interface Comment {
    id: number;
    user_username: string;
    manga: number; // ID
    content: string;
    created_at: string;
}

import AnalyticsDashboard from './components/AnalyticsDashboard';

export default function AdminDashboard() {
  // const { token } = useAuth(); // Remove this if not used for user info, or keep for other things but not token
  const searchParams = useSearchParams();
  const activeTab = searchParams.get('tab') || 'overview';
  
  const [mangas, setMangas] = useState<Manga[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Modal State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<number | null>(null);
  const [deleteType, setDeleteType] = useState<'manga' | 'user' | 'comment'>('manga');

  // Password Reset State
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [userToReset, setUserToReset] = useState<number | null>(null);
  const [newPassword, setNewPassword] = useState('');

  const fetchMangas = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/api/mangas/?search=${encodeURIComponent(search)}`);
      // Handle pagination
      const data = response.data;
      const results = Array.isArray(data) ? data : data.results || [];
      setMangas(results);
    } catch (error) {
      console.error("Error fetching mangas:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    const token = localStorage.getItem('adminToken');
    if (!token) return;

    setLoading(true);
    try {
        const response = await api.get('/api/admin/users/', {
            headers: { Authorization: `Bearer ${token}` }
        });
        // Handle pagination
        const data = response.data;
        const results = Array.isArray(data) ? data : data.results || [];
        setUsers(results);
    } catch (error: any) {
        console.error("Error fetching users:", error);
        if (error.response && error.response.status === 401) {
            localStorage.removeItem('adminToken');
            window.location.href = '/admin/login';
        }
    } finally {
        setLoading(false);
    }
  };

  const fetchComments = async () => {
    setLoading(true);
    try {
        const response = await api.get('/api/comments/');
        // Handle pagination
        const data = response.data;
        const results = Array.isArray(data) ? data : data.results || [];
        
        // Sort by newest first
        const sorted = results.sort((a: Comment, b: Comment) => 
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        setComments(sorted);
    } catch (error) {
        console.error("Error fetching comments:", error);
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'mangas') {
        const timer = setTimeout(() => {
            fetchMangas();
        }, 500);
        return () => clearTimeout(timer);
    } else if (activeTab === 'users') {
        fetchUsers();
    } else if (activeTab === 'comments') {
        fetchComments();
    }
  }, [search, activeTab]);

  const confirmDelete = (id: number, type: 'manga' | 'user' | 'comment') => {
    setItemToDelete(id);
    setDeleteType(type);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;
    
    const token = localStorage.getItem('adminToken');

    try {
        if (deleteType === 'manga') {
            await api.delete(`/api/mangas/${itemToDelete}/`);
            setMangas(mangas.filter(m => m.id !== itemToDelete));
        } else if (deleteType === 'user') {
            if (!token) return;
            await api.delete(`/api/admin/users/${itemToDelete}/`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUsers(users.filter(u => u.id !== itemToDelete));
        } else if (deleteType === 'comment') {
            if (!token) return;
            await api.delete(`/api/comments/${itemToDelete}/`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setComments(comments.filter(c => c.id !== itemToDelete));
        }
    } catch (error) {
        console.error(`Error deleting ${deleteType}:`, error);
        alert(`Failed to delete ${deleteType}.`);
    }
  };

  const openResetModal = (userId: number) => {
    setUserToReset(userId);
    setNewPassword('');
    setIsResetModalOpen(true);
  };

  const handleResetPassword = async () => {
    if (!userToReset || !newPassword) return;
    
    const token = localStorage.getItem('adminToken');
    if (!token) return;

    try {
        await api.post(`/api/admin/users/${userToReset}/reset_password/`, 
            { new_password: newPassword },
            { headers: { Authorization: `Bearer ${token}` } }
        );
        alert('Password reset successfully!');
        setIsResetModalOpen(false);
    } catch (error) {
        console.error("Error resetting password:", error);
        alert('Failed to reset password.');
    }
  };

  return (
    <div>
      <ConfirmModal 
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}

        title={`Delete ${deleteType.charAt(0).toUpperCase() + deleteType.slice(1)}?`}
        message={`Are you sure you want to delete this ${deleteType}? This action cannot be undone.`}
        confirmText="Yes, Delete"
        isDestructive={true}
      />

      {/* Password Reset Modal */}
      {isResetModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-card border border-border p-6 rounded-xl shadow-xl w-full max-w-md">
                <h3 className="text-xl font-bold mb-4">Reset User Password</h3>
                <p className="text-muted-foreground mb-4">Enter a new password for this user.</p>
                
                <input 
                    type="text" 
                    placeholder="New Password" 
                    className="w-full bg-muted/50 border border-border rounded-lg px-4 py-2 mb-6 outline-none focus:border-primary transition-colors"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                />

                <div className="flex justify-end gap-3">
                    <button 
                        onClick={() => setIsResetModalOpen(false)}
                        className="px-4 py-2 rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={handleResetPassword}
                        disabled={!newPassword}
                        className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-50 font-bold"
                    >
                        Reset Password
                    </button>
                </div>
            </div>
        </div>
      )}

      <div className="flex items-center justify-between mb-8">
        <div>
            <h1 className="text-3xl font-bold text-foreground capitalize">{activeTab}</h1>
            <p className="text-muted-foreground mt-1">
                {activeTab === 'overview' && 'System overview and statistics'}
                {activeTab === 'mangas' && 'Manage your manga library'}
                {activeTab === 'users' && 'Manage registered users'}
                {activeTab === 'comments' && 'Moderate user comments'}
            </p>
        </div>
        {activeTab === 'mangas' && (
            <Link 
                href="/admin/manga/create" 
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors shadow-lg shadow-primary/20"
            >
                <Plus size={20} /> Add New Manga
            </Link>
        )}
      </div>

      {activeTab === 'overview' ? (
        <AnalyticsDashboard />
      ) : activeTab === 'mangas' ? (
        <>
            {/* Search Bar */}
            <div className="bg-card border border-border rounded-xl p-4 mb-6 flex items-center gap-3 shadow-sm">
                <Search className="text-muted-foreground" size={20} />
                <input 
                    type="text" 
                    placeholder="Search by title..." 
                    className="bg-transparent border-none outline-none flex-1 text-foreground placeholder:text-muted-foreground"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            {/* Manga Table */}
            <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-muted/50 border-b border-border text-sm font-medium text-muted-foreground uppercase tracking-wider">
                                <th className="p-4 pl-6">Cover</th>
                                <th className="p-4">Title</th>
                                <th className="p-4">Type</th>
                                <th className="p-4">Status</th>
                                <th className="p-4">Stats</th>
                                <th className="p-4 text-right pr-6">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="p-8 text-center text-muted-foreground">Loading...</td>
                                </tr>
                            ) : mangas.length > 0 ? (
                                mangas.map((manga) => (
                                    <tr key={manga.id} className="hover:bg-accent/5 transition-colors group">
                                        <td className="p-4 pl-6">
                                            <div className="w-12 h-16 rounded-md overflow-hidden bg-muted relative">
                                                <img 
                                                    src={getImageUrl(manga.cover_image) || "https://via.placeholder.com/100x150"} 
                                                    alt={manga.title}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="font-bold text-foreground">{manga.title}</div>
                                            <div className="text-xs text-muted-foreground mt-1">ID: {manga.id}</div>
                                        </td>
                                        <td className="p-4">
                                            <span className="px-2 py-1 rounded text-xs font-bold bg-secondary text-secondary-foreground">
                                                {manga.type}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 rounded text-xs font-bold ${
                                                manga.status === 'Ongoing' ? 'bg-green-500/10 text-green-500' : 
                                                manga.status === 'Completed' ? 'bg-blue-500/10 text-blue-500' : 
                                                'bg-yellow-500/10 text-yellow-500'
                                            }`}>
                                                {manga.status}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex flex-col gap-1 text-xs text-muted-foreground">
                                                <span className="flex items-center gap-1"><Eye size={12} /> {manga.views.toLocaleString()}</span>
                                                <span className="flex items-center gap-1"><Star size={12} /> {manga.rating}</span>
                                            </div>
                                        </td>
                                        <td className="p-4 text-right pr-6">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Link 
                                                    href={`/admin/manga/${manga.id}`}
                                                    className="p-2 rounded-lg bg-blue-500/10 text-blue-500 hover:bg-blue-500 hover:text-white transition-colors"
                                                    title="Edit"
                                                >
                                                    <Edit size={16} />
                                                </Link>
                                                <button 
                                                    onClick={() => confirmDelete(manga.id, 'manga')}
                                                    className="p-2 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-colors"
                                                    title="Delete"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} className="p-8 text-center text-muted-foreground">No mangas found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
      ) : activeTab === 'users' ? (
        /* Users Tab Content */
        <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-muted/50 border-b border-border text-sm font-medium text-muted-foreground uppercase tracking-wider">
                            <th className="p-4 pl-6">User</th>
                            <th className="p-4">Email</th>
                            <th className="p-4">Role</th>
                            <th className="p-4">Joined</th>
                            <th className="p-4 text-right pr-6">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {loading ? (
                            <tr>
                                <td colSpan={5} className="p-8 text-center text-muted-foreground">Loading...</td>
                            </tr>
                        ) : users.length > 0 ? (
                            users.map((u) => (
                                <tr key={u.id} className="hover:bg-accent/5 transition-colors group">
                                    <td className="p-4 pl-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                                <Users size={20} />
                                            </div>
                                            <div>
                                                <div className="font-bold text-foreground">{u.username}</div>
                                                <div className="text-xs text-muted-foreground">ID: {u.id}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4 text-sm text-muted-foreground">
                                        {u.email || "-"}
                                    </td>
                                    <td className="p-4">
                                        {u.is_staff ? (
                                            <span className="flex items-center gap-1 px-2 py-1 rounded text-xs font-bold bg-purple-500/10 text-purple-500 w-fit">
                                                <Shield size={12} /> Admin
                                            </span>
                                        ) : (
                                            <span className="px-2 py-1 rounded text-xs font-bold bg-secondary text-secondary-foreground">
                                                User
                                            </span>
                                        )}
                                    </td>
                                    <td className="p-4 text-sm text-muted-foreground">
                                        {new Date(u.date_joined).toLocaleDateString()}
                                    </td>
                                    <td className="p-4 text-right pr-6">
                                        {!u.is_staff && (
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button 
                                                    onClick={() => openResetModal(u.id)}
                                                    className="p-2 rounded-lg bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500 hover:text-white transition-colors"
                                                    title="Reset Password"
                                                >
                                                    <Key size={16} />
                                                </button>
                                                <button 
                                                    onClick={() => confirmDelete(u.id, 'user')}
                                                    className="p-2 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-colors"
                                                    title="Delete User"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={5} className="p-8 text-center text-muted-foreground">No users found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
      ) : (
        /* Comments Tab Content */
        <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-muted/50 border-b border-border text-sm font-medium text-muted-foreground uppercase tracking-wider">
                            <th className="p-4 pl-6">User</th>
                            <th className="p-4">Comment</th>
                            <th className="p-4">Manga ID</th>
                            <th className="p-4">Date</th>
                            <th className="p-4 text-right pr-6">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {loading ? (
                            <tr>
                                <td colSpan={5} className="p-8 text-center text-muted-foreground">Loading...</td>
                            </tr>
                        ) : comments.length > 0 ? (
                            comments.map((c) => (
                                <tr key={c.id} className="hover:bg-accent/5 transition-colors group">
                                    <td className="p-4 pl-6">
                                        <div className="font-bold text-foreground">{c.user_username || 'Guest'}</div>
                                    </td>
                                    <td className="p-4 max-w-md">
                                        <p className="text-sm text-foreground line-clamp-2">{c.content}</p>
                                    </td>
                                    <td className="p-4 text-sm text-muted-foreground">
                                        {c.manga}
                                    </td>
                                    <td className="p-4 text-sm text-muted-foreground">
                                        {new Date(c.created_at).toLocaleString()}
                                    </td>
                                    <td className="p-4 text-right pr-6">
                                        <button 
                                            onClick={() => confirmDelete(c.id, 'comment')}
                                            className="p-2 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-colors opacity-0 group-hover:opacity-100"
                                            title="Delete Comment"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={5} className="p-8 text-center text-muted-foreground">No comments found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
      )}
    </div>
  );
}
