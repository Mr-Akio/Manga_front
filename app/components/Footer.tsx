import Link from 'next/link';

import { Facebook, Twitter, Instagram, Github } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-white/5 bg-background/95 backdrop-blur-xl mt-12">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <Link href="/" className="inline-block mb-4">
              <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent tracking-tighter">Daily-Manga</span>
            </Link>
            <p className="text-sm text-muted-foreground max-w-sm leading-relaxed">
              เว็บอ่านการ์ตูนมังงะใหม่! 2025 อัพเร็ว โหลดไว อ่านฟรี
              รวมมังงะใหม่ Manga อ่านฟรี แอพอ่านการ์ตูนออนไลน์ จีน เกาหลี ญี่ปุ่น
            </p>
          </div>
          
          <div>
            <h4 className="font-bold text-foreground mb-6">หมวดหมู่ยอดฮิต</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><Link href="/genres/action" className="hover:text-primary transition-colors">Action</Link></li>
              <li><Link href="/genres/fantasy" className="hover:text-primary transition-colors">Fantasy</Link></li>
              <li><Link href="/genres/romance" className="hover:text-primary transition-colors">Romance</Link></li>
              <li><Link href="/genres/comedy" className="hover:text-primary transition-colors">Comedy</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-foreground mb-6">ติดตามเรา</h4>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-white transition-all">
                <Facebook size={20} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-white transition-all">
                <Twitter size={20} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-white transition-all">
                <Instagram size={20} />
              </a>
            </div>
          </div>
        </div>
        <div className="border-t border-white/5 mt-12 pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; 2025 Daily-Manga. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
