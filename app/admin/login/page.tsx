'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '../../lib/axios';
import { Lock, User } from 'lucide-react';

export default function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await api.post('/api/token/', {
        username,
        password
      });

      // Save token
      localStorage.setItem('adminToken', response.data.access);
      
      // Redirect to dashboard
      router.push('/admin');
    } catch (err) {
      console.error("Login error:", err);
      setError('Invalid username or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-[#1A222C]">
      <div className="bg-white dark:bg-[#1C2434] p-8 rounded-xl shadow-lg w-full max-w-md border border-stroke dark:border-strokedark">
        <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-black dark:text-white">Admin Login</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">Enter your credentials to access the dashboard</p>
        </div>

        {error && (
            <div className="bg-red-500/10 text-red-500 p-3 rounded-lg mb-6 text-sm text-center">
                {error}
            </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
            <div>
                <label className="block text-sm font-medium text-black dark:text-white mb-2">Username</label>
                <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input 
                        type="text" 
                        required
                        className="w-full bg-transparent border border-stroke dark:border-strokedark rounded-lg py-3 pl-10 pr-4 outline-none focus:border-primary transition-colors text-black dark:text-white"
                        placeholder="Enter username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-black dark:text-white mb-2">Password</label>
                <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input 
                        type="password" 
                        required
                        className="w-full bg-transparent border border-stroke dark:border-strokedark rounded-lg py-3 pl-10 pr-4 outline-none focus:border-primary transition-colors text-black dark:text-white"
                        placeholder="Enter password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>
            </div>

            <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-primary text-white font-bold py-3 rounded-lg hover:bg-opacity-90 transition-opacity disabled:opacity-50"
            >
                {loading ? 'Signing in...' : 'Sign In'}
            </button>
        </form>
      </div>
    </div>
  );
}
