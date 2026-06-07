import React, { useState, useEffect } from 'react';
import { Download, MapPin, Briefcase, Calendar } from 'lucide-react';
import { fallbackProfile } from '../data/fallback-data';
import { useAuth } from '../context/AuthContext';

export default function About() {
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
        console.warn('Unable to load about profile from API, using fallback data:', err);
      });
  }, [API_BASE]);

  const defaultAvatar = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&h=400&q=80";

  // Prepend backend base URL if it's a relative path upload
  const getAvatarUrl = () => {
    if (!profile.aboutAvatarUrl) return defaultAvatar;
    if (profile.aboutAvatarUrl.startsWith('http') || profile.aboutAvatarUrl.startsWith('data:')) {
      return profile.aboutAvatarUrl;
    }
    // Relative upload url
    const rootBase = API_BASE.replace('/api', '');
    return `${rootBase}${profile.aboutAvatarUrl}`;
  };

  const getResumeUrl = () => {
    if (!profile.resumeUrl || profile.resumeUrl === '#') return '#';
    if (profile.resumeUrl.startsWith('http')) {
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
    <section id="about" className="py-20 bg-black/5 dark:bg-black/20 relative">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        
        {/* Section Title */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-2">
            About <span className="text-gradient">Me</span>
          </h2>
          <div className="w-12 h-1 bg-primary mx-auto rounded-full"></div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Avatar Area */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative group">
              {/* Outer decorative gradient border */}
              <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-violet-600 to-cyan-500 opacity-75 blur-md group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
              
              {/* Image Frame */}
              <div className="relative w-72 h-72 sm:w-80 sm:h-80 rounded-2xl overflow-hidden bg-card border border-white/10">
                <img
                  src={getAvatarUrl()}
                  alt={profile.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  onError={(e) => {
                    e.target.src = defaultAvatar;
                  }}
                />
              </div>
            </div>
          </div>

          {/* Biography and Details */}
          <div className="lg:col-span-7 flex flex-col items-start text-left">
            <h3 className="text-2xl font-bold mb-4">
              Hello, I am {profile.name}
            </h3>
            
            <p className="text-foreground/75 leading-relaxed mb-6 text-base">
              {profile.bio || "No biography provided yet. Use the admin panel to update this profile details."}
            </p>

            {/* Micro Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full mb-8">
              <div className="flex items-center gap-3 text-foreground/80">
                <div className="p-2.5 rounded-xl glass-panel text-primary dark:text-violet-400">
                  <MapPin size={18} />
                </div>
                <div>
                  <div className="text-xs text-muted-foreground font-semibold">Location</div>
                  <div className="text-sm font-medium">{profile.location || 'Not Specified'}</div>
                </div>
              </div>

              <div className="flex items-center gap-3 text-foreground/80">
                <div className="p-2.5 rounded-xl glass-panel text-primary dark:text-violet-400">
                  <Briefcase size={18} />
                </div>
                <div>
                  <div className="text-xs text-muted-foreground font-semibold">Role</div>
                  <div className="text-sm font-medium">
                    {profile.title && profile.title.length > 0 ? profile.title[0] : 'Full-Stack Developer'}
                  </div>
                </div>
              </div>
            </div>

            {/* Resume Button */}
            {profile.resumeUrl && profile.resumeUrl !== '#' ? (
              <button
                onClick={handleDownloadResume}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold shadow-md shadow-primary/10 hover:shadow-lg hover:shadow-primary/20 hover:-translate-y-0.5 transition-all duration-300 cursor-pointer"
              >
                <Download size={18} />
                <span>Download Resume</span>
              </button>
            ) : (
              <button
                disabled
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-muted text-muted-foreground font-semibold cursor-not-allowed"
                title="Resume not uploaded yet"
              >
                <Download size={18} />
                <span>Resume Not Available</span>
              </button>
            )}

          </div>
        </div>

      </div>
    </section>
  );
}
