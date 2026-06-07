import React, { useState, useEffect, useContext } from 'react';
import { FolderOpen, FileText, MessageSquare, ArrowDown } from 'lucide-react';
import { fallbackProfile } from '../data/fallback-data';
import { useAuth } from '../context/AuthContext';

// Inline brand icon SVGs to avoid version differences in lucide-react
const Github = ({ size = 16 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

const Linkedin = ({ size = 16 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect width="4" height="12" x="2" y="9" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

const Twitter = ({ size = 16 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
  </svg>
);

const Email = ({ size = 16 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="16" x="2" y="4" rx="2" />
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </svg>
);

export default function Hero() {
  const { API_BASE } = useAuth();
  const [profile, setProfile] = useState(fallbackProfile);

  useEffect(() => {
    fetch(`${API_BASE}/profile`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch');
        return res.json();
      })
      .then((data) => {
        if (data && data.name) {
          setProfile(data);
        }
      })
      .catch((err) => {
        console.warn('Unable to load hero profile from API, using fallback data:', err);
      });
  }, [API_BASE]);

  // Splits name so the last initial is isolated for blue/purple gradient coloring (e.g. "Narsimulu G.")
  const splitName = (fullName) => {
    if (!fullName) return { first: 'Narsimulu', last: 'G.' };
    const parts = fullName.split(' ');
    if (parts.length > 1) {
      const last = parts.pop();
      const first = parts.join(' ');
      return { first, last };
    }
    return { first: fullName, last: '' };
  };

  const { first, last } = splitName(profile.name);

  const handleScrollTo = (id) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 100;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  const getMediaUrl = (pathString) => {
    if (!pathString) return 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&h=400&q=80';
    if (pathString.startsWith('http') || pathString.startsWith('data:')) return pathString;
    return `${API_BASE.replace('/api', '')}${pathString}`;
  };

  const getResumeUrl = () => {
    if (!profile.resumeUrl || profile.resumeUrl === '#') return '#';
    if (profile.resumeUrl.startsWith('http') || profile.resumeUrl.startsWith('data:')) {
      return profile.resumeUrl;
    }
    const rootBase = API_BASE.replace('/api', '');
    return `${rootBase}${profile.resumeUrl}`;
  };

  const handleDownloadResume = async (e) => {
    e.preventDefault();
    const url = getResumeUrl();
    if (url === '#') return;

    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error('Network response was not ok');
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `${profile.name.replace(/\s+/g, '_')}_Resume.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.warn('Blob download failed, falling back to direct tab open:', err);
      window.open(url, '_blank');
    }
  };

  return (
    <section id="home" className="w-full flex items-center justify-center py-6">
      <div className="w-full max-w-6xl bg-white/70 dark:bg-black/40 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-[2.5rem] shadow-2xl p-8 md:p-14 relative overflow-hidden flex flex-col md:flex-row items-center gap-10 md:gap-14 text-left">
        
        {/* Floating gradient accent dots */}
        <div className="absolute top-8 left-[45%] w-3 h-3 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 opacity-60"></div>
        <div className="absolute bottom-10 right-8 w-4 h-4 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 opacity-60"></div>

        {/* Left Side: Biography & Actions */}
        <div className="flex-1 flex flex-col gap-6 relative z-10">
          <div>
            <span className="text-sm font-semibold text-foreground/50 tracking-wider">Hello I'M</span>
            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight mt-1 text-slate-800 dark:text-white leading-tight">
              {first} <span className="text-gradient font-black">{last}</span>
            </h1>
          </div>

          <p className="text-sm sm:text-base text-foreground/75 leading-relaxed max-w-xl">
            {profile.heroBio || profile.bio}
          </p>

          {/* Action Row 1: View Work & Resume */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => handleScrollTo('projects')}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-lg shadow-blue-500/10 hover:shadow-blue-500/20 transition-all cursor-pointer"
            >
              <FolderOpen size={14} />
              <span>View Work</span>
            </button>
            
            {profile.resumeUrl && profile.resumeUrl !== '#' ? (
              <button
                onClick={handleDownloadResume}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-white dark:bg-white/10 hover:bg-black/5 dark:hover:bg-white/5 border border-border dark:border-white/10 text-slate-800 dark:text-white font-semibold text-xs transition-all cursor-pointer"
              >
                <FileText size={14} />
                <span>Download Resume</span>
              </button>
            ) : (
              <button
                disabled
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-muted text-muted-foreground font-semibold text-xs cursor-not-allowed"
              >
                <FileText size={14} />
                <span>Download Resume</span>
              </button>
            )}
          </div>

          {/* Action Row 2: Follow Me */}
          <div className="flex items-center gap-3 mt-1">
            <span className="text-xs font-bold text-muted-foreground">Follow me:</span>
            <div className="flex items-center gap-2">
              {profile.socialLinks?.linkedin && (
                <a href={profile.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-white dark:bg-white/10 border border-border dark:border-white/10 flex items-center justify-center text-blue-600 dark:text-blue-400 hover:scale-105 shadow-sm transition-all">
                  <Linkedin size={14} />
                </a>
              )}
              {profile.socialLinks?.github && (
                <a href={profile.socialLinks.github} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-white dark:bg-white/10 border border-border dark:border-white/10 flex items-center justify-center text-slate-800 dark:text-white hover:scale-105 shadow-sm transition-all">
                  <Github size={14} />
                </a>
              )}
              {profile.socialLinks?.email && (
                <a href={`mailto:${profile.socialLinks.email}`} className="w-8 h-8 rounded-full bg-white dark:bg-white/10 border border-border dark:border-white/10 flex items-center justify-center text-red-500 dark:text-red-400 hover:scale-105 shadow-sm transition-all">
                  <Email size={14} />
                </a>
              )}
              {profile.socialLinks?.twitter && (
                <a href={profile.socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-white dark:bg-white/10 border border-border dark:border-white/10 flex items-center justify-center text-sky-500 hover:scale-105 shadow-sm transition-all">
                  <Twitter size={14} />
                </a>
              )}
            </div>
          </div>

          {/* Action Row 3: Let's Chat */}
          <div className="mt-2">
            <button
              onClick={() => handleScrollTo('contact')}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-500 hover:opacity-95 text-white font-extrabold text-xs shadow-md shadow-pink-500/20 hover:shadow-pink-500/35 transition-all cursor-pointer"
            >
              <MessageSquare size={14} />
              <span>Let's Chat</span>
            </button>
          </div>
        </div>

        {/* Right Side: Double-Border Circular Photo */}
        <div className="flex-shrink-0 flex justify-center relative z-10">
          <div className="relative group">
            {/* Outer Blue Gradient Border Frame */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-blue-500 via-indigo-500 to-purple-500 blur-sm scale-[1.03] group-hover:scale-[1.05] transition-all duration-300"></div>
            <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-blue-500 via-indigo-500 to-purple-500 scale-[1.02]"></div>
            
            {/* Inner White Border and Frame */}
            <div className="relative w-72 h-72 sm:w-80 sm:h-80 rounded-full p-1 bg-white dark:bg-zinc-900 overflow-hidden shadow-xl">
              <img
                src={getMediaUrl(profile.avatarUrl)}
                alt={profile.name}
                className="w-full h-full object-cover rounded-full transition-transform duration-500 group-hover:scale-103"
                onError={(e) => {
                  e.target.src = 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&h=400&q=80';
                }}
              />
            </div>
          </div>
        </div>

        {/* Scroll Hint indicator at bottom */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 opacity-70">
          <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Scroll Down</span>
          <button
            onClick={() => handleScrollTo('about')}
            className="w-5 h-8 border-2 border-muted-foreground/40 rounded-full flex items-start justify-center p-1 hover:border-primary transition-colors cursor-pointer"
            aria-label="Scroll to About"
          >
            <span className="w-1.5 h-1.5 bg-primary dark:bg-violet-400 rounded-full animate-bounce"></span>
          </button>
        </div>

      </div>
    </section>
  );
}
