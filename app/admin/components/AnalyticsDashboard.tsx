'use client';

import { useState, useEffect } from 'react';
import api from '../../lib/axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Eye, BookOpen, Layers, TrendingUp } from 'lucide-react';

export default function AnalyticsDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await api.get('/api/analytics/');
      setData(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching analytics:", error);
      setLoading(false);
    }
  };

  if (loading) return <div className="p-8 text-center">Loading analytics...</div>;
  if (!data) return <div className="p-8 text-center">Failed to load analytics.</div>;

  return (
    <div className="space-y-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-card border border-border rounded-xl p-6 flex items-center gap-4 shadow-sm">
            <div className="p-3 bg-primary/10 rounded-full text-primary">
                <Eye size={24} />
            </div>
            <div>
                <p className="text-sm text-muted-foreground">Total Views</p>
                <h3 className="text-2xl font-bold">{data.total_views.toLocaleString()}</h3>
            </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-6 flex items-center gap-4 shadow-sm">
            <div className="p-3 bg-blue-500/10 rounded-full text-blue-500">
                <BookOpen size={24} />
            </div>
            <div>
                <p className="text-sm text-muted-foreground">Total Mangas</p>
                <h3 className="text-2xl font-bold">{data.total_mangas.toLocaleString()}</h3>
            </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-6 flex items-center gap-4 shadow-sm">
            <div className="p-3 bg-purple-500/10 rounded-full text-purple-500">
                <Layers size={24} />
            </div>
            <div>
                <p className="text-sm text-muted-foreground">Total Chapters</p>
                <h3 className="text-2xl font-bold">{data.total_chapters.toLocaleString()}</h3>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Chart */}
        <div className="lg:col-span-2 bg-card border border-border rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                <TrendingUp size={20} className="text-primary" /> Daily Views (Last 7 Days)
            </h3>
            <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.chart_data}>
                        <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                        <XAxis 
                            dataKey="date" 
                            tick={{fontSize: 12}} 
                            tickFormatter={(value: any) => new Date(value).toLocaleDateString(undefined, {weekday: 'short'})}
                        />
                        <YAxis tick={{fontSize: 12}} />
                        <Tooltip 
                            contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff' }}
                            itemStyle={{ color: '#fff' }}
                            cursor={{fill: 'rgba(255,255,255,0.05)'}}
                        />
                        <Bar dataKey="views" fill="#4bdd9e" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>

        {/* Top Mangas */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-bold mb-6">Top 5 Popular Mangas</h3>
            <div className="space-y-4">
                {data.top_mangas.map((manga: any, index: number) => (
                    <div key={manga.id} className="flex items-center gap-3 pb-3 border-b border-border last:border-0 last:pb-0">
                        <div className="font-bold text-muted-foreground w-6 text-center">{index + 1}</div>
                        <div className="w-10 h-14 bg-muted rounded overflow-hidden flex-shrink-0">
                            {manga.cover_image && (
                                <img src={manga.cover_image} alt={manga.title} className="w-full h-full object-cover" />
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-sm truncate" title={manga.title}>{manga.title}</h4>
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                                <Eye size={12} /> {manga.views.toLocaleString()}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
      </div>
    </div>
  );
}
