import { Droplet, Heart, Phone, Mail, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="bg-muted/50 border-t mt-auto">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <Droplet className="h-6 w-6 text-primary fill-primary" />
              <span className="text-lg font-bold text-gradient-blood">Blood Link</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              রক্তদানে জীবন বাঁচান। প্রতিটি ফোঁটা রক্ত মূল্যবান।
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-4">দ্রুত লিংক</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/donors" className="hover:text-primary transition-colors">ডোনার খুঁজুন</Link></li>
              <li><Link to="/posts" className="hover:text-primary transition-colors">রক্তের অনুরোধ</Link></li>
              <li><Link to="/register" className="hover:text-primary transition-colors">রেজিস্ট্রেশন</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold mb-4">যোগাযোগ</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-primary" />
                <span>+880 1700-000000</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-primary" />
                <span>info@bloodlink.com</span>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" />
                <span>ঢাকা, বাংলাদেশ</span>
              </li>
            </ul>
          </div>

          {/* Emergency */}
          <div>
            <h3 className="font-semibold mb-4">জরুরি সেবা</h3>
            <div className="bg-primary/10 rounded-lg p-4">
              <p className="text-sm text-muted-foreground mb-2">
                জরুরি রক্তের প্রয়োজনে কল করুন
              </p>
              <p className="text-xl font-bold text-primary">999</p>
            </div>
          </div>
        </div>

        <div className="border-t mt-8 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            © 2025 Blood Link. সর্বস্বত্ব সংরক্ষিত।
          </p>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <span>Made with</span>
            <Heart className="h-4 w-4 text-primary fill-primary" />
            <span>in Bangladesh</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
