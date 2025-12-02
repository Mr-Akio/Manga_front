'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import AdminSidebar from './components/AdminSidebar';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    // Skip check for login page
    if (pathname === '/admin/login') {
        setAuthorized(true);
        return;
    }

    const token = localStorage.getItem('adminToken');
    if (!token) {
        router.push('/admin/login');
    } else {
        setAuthorized(true);
    }
  }, [pathname, router]);

  if (!authorized && pathname !== '/admin/login') {
      return null; // Or a loading spinner
  }

  // If on login page, render children without sidebar
  if (pathname === '/admin/login') {
      return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen bg-background text-foreground font-sans">
      <AdminSidebar />
      <main className="flex-1 p-8 overflow-y-auto h-screen">
        <div className="max-w-6xl mx-auto">
            {children}
        </div>
      </main>
    </div>
  );
}
