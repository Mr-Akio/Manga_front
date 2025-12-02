'use client';

import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../lib/axios';
import { useRouter } from 'next/navigation';

interface User {
    id: number;
    username: string;
    email: string;
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (token: string, refresh: string) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const initAuth = async () => {
            const token = localStorage.getItem('access_token');
            if (token) {
                try {
                    // Configure axios default header
                    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                    
                    // Fetch user profile
                    const response = await api.get('/api/profile/');
                    setUser(response.data);
                } catch (error) {
                    console.error("Auth initialization failed:", error);
                    logout();
                }
            }
            setLoading(false);
        };

        initAuth();
    }, []);

    const login = (token: string, refresh: string) => {
        localStorage.setItem('access_token', token);
        localStorage.setItem('refresh_token', refresh);
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        // Fetch user profile immediately after login
        api.get('/api/profile/')
            .then(response => {
                setUser(response.data);
                router.push('/'); // Redirect to home
            })
            .catch(err => {
                console.error("Failed to fetch profile after login:", err);
            });
    };

    const logout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        delete api.defaults.headers.common['Authorization'];
        setUser(null);
        router.push('/login');
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
