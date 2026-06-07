import React, { useState, useEffect } from 'react';
import { Award, ExternalLink, Calendar, Search } from 'lucide-react';
import { fallbackCertificates } from '../data/fallback-data';
import { useAuth } from '../context/AuthContext';

export default function Certificates() {
  const { API_BASE } = useAuth();
  const [certificates, setCertificates] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetch(`${API_BASE}/certificates`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch');
        return res.json();
      })
      .then((data) => {
        if (data && data.length > 0) {
          setCertificates(data);
        } else {
          setCertificates(fallbackCertificates);
        }
      })
      .catch((err) => {
        console.warn('Unable to load certificates from API, using fallback data:', err);
        setCertificates(fallbackCertificates);
      });
  }, [API_BASE]);

  // Format Dates cleanly
  const formatDate = (dateString) => {
    try {
      const options = { year: 'numeric', month: 'long' };
      return new Date(dateString).toLocaleDateString('en-US', options);
    } catch (e) {
      return dateString;
    }
  };

  // Filter certificates by search term
  const filteredCertificates = certificates.filter((cert) => {
    const term = searchQuery.toLowerCase();
    return (
      cert.title.toLowerCase().includes(term) ||
      cert.issuer.toLowerCase().includes(term)
    );
  });

  const getImageUrl = (imagePath) => {
    if (!imagePath) return "https://images.unsplash.com/photo-1496096265110-f83ad7f96608?auto=format&fit=crop&w=400&q=80";
    if (imagePath.startsWith('http') || imagePath.startsWith('data:')) {
      return imagePath;
    }
    const rootBase = API_BASE.replace('/api', '');
    return `${rootBase}${imagePath}`;
  };

  return (
    <section id="certificates" className="py-20 relative">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">

        {/* Section Title */}
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-2">
            Licenses & <span className="text-gradient">Certificates</span>
          </h2>
          <p className="text-sm text-muted-foreground">My verified professional credentials and educational accolades.</p>
          <div className="w-12 h-1 bg-primary mx-auto rounded-full mt-3"></div>
        </div>

        {/* Search Bar filter */}
        <div className="max-w-md mx-auto mb-12">
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-muted-foreground">
              <Search size={18} />
            </span>
            <input
              type="text"
              placeholder="Search by certificate title or issuer..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl glass-input text-sm"
            />
          </div>
        </div>

        {/* Certificates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {filteredCertificates.map((cert, idx) => (
            <div
              key={cert._id || idx}
              className="glass-panel p-6 rounded-2xl flex flex-col sm:flex-row gap-6 hover:shadow-lg hover:border-primary/20 transition-all duration-300 group hover:-translate-y-0.5"
            >
              {/* Image Frame */}
              <div className="relative w-full sm:w-32 h-32 rounded-xl overflow-hidden bg-muted flex-shrink-0">
                <img
                  src={getImageUrl(cert.image)}
                  alt={cert.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
              </div>

              {/* Certificate Details */}
              <div className="flex flex-col text-left justify-between py-1 w-full">
                <div>
                  <h3 className="text-lg font-bold group-hover:text-primary dark:group-hover:text-violet-400 transition-colors">
                    {cert.title}
                  </h3>
                  <div className="text-sm font-semibold text-foreground/80 mt-1">
                    {cert.issuer}
                  </div>
                  
                  {/* Metadata */}
                  <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground mt-3">
                    <span className="flex items-center gap-1">
                      <Calendar size={14} />
                      {formatDate(cert.issueDate)}
                    </span>
                    {cert.credentialId && (
                      <span className="bg-black/5 dark:bg-white/5 px-2 py-0.5 rounded border border-white/5 font-mono">
                        ID: {cert.credentialId}
                      </span>
                    )}
                  </div>
                </div>

                {/* External Link */}
                {cert.credentialUrl && (
                  <div className="mt-4 pt-4 border-t border-white/5">
                    <a
                      href={cert.credentialUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-primary dark:text-violet-400 hover:underline"
                    >
                      <ExternalLink size={14} />
                      <span>Verify Credential</span>
                    </a>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredCertificates.length === 0 && (
          <div className="text-center py-16 glass-panel rounded-2xl max-w-md mx-auto">
            <Award size={48} className="mx-auto text-muted-foreground/50 mb-3" />
            <h3 className="text-lg font-bold">No Credentials Found</h3>
            <p className="text-sm text-muted-foreground mt-1">Try tweaking your search term.</p>
          </div>
        )}

      </div>
    </section>
  );
}
