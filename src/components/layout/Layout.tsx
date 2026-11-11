import { ReactNode } from 'react';
import { Header } from './Header';
import { Footer } from './Footer';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="relative isolate flex-1">
        {/* Soft aurora + grid backdrop, matching the home hero. Sections with
            their own background (like the hero) simply paint over it. */}
        <div className="page-decor" aria-hidden="true">
          <div className="page-decor-grid" />
        </div>
        {children}
      </main>
      <Footer />
    </div>
  );
}
