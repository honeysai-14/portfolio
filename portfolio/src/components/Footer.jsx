import React from 'react';
import { ArrowUp, Heart } from 'lucide-react';

export default function Footer() {
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <footer className="py-12 border-t border-border bg-black/10 dark:bg-black/40 relative">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
        
        {/* Left copyright info */}
        <div className="text-sm text-muted-foreground text-center md:text-left">
          <span>© {new Date().getFullYear()} HoneySai K. Built with </span>
          <Heart size={14} className="inline-block text-red-500 fill-red-500 mx-0.5 animate-pulse" />
          <span> for a premium web showcase.</span>
        </div>

        {/* Right back-to-top link button */}
        <button
          onClick={scrollToTop}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-foreground/80 hover:text-primary dark:hover:text-violet-400 transition-colors p-2 rounded-xl glass-panel glass-panel-hover cursor-pointer"
          title="Scroll to Top"
        >
          <span className="hidden sm:inline">Back to Top</span>
          <ArrowUp size={14} />
        </button>

      </div>
    </footer>
  );
}
