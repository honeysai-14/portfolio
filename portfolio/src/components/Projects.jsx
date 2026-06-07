import React, { useState, useEffect } from 'react';
import { ExternalLink, Folder } from 'lucide-react';
import { fallbackProjects } from '../data/fallback-data';
import { useAuth } from '../context/AuthContext';

// Inline brand icon SVGs to avoid version differences in lucide-react
const Github = ({ size = 20 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide-github">
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);


export default function Projects() {
  const { API_BASE } = useAuth();
  const [projects, setProjects] = useState([]);
  const [activeFilter, setActiveFilter] = useState('All');

  useEffect(() => {
    fetch(`${API_BASE}/projects`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch');
        return res.json();
      })
      .then((data) => {
        if (data && data.length > 0) {
          setProjects(data);
        } else {
          setProjects(fallbackProjects);
        }
      })
      .catch((err) => {
        console.warn('Unable to load projects from API, using fallback data:', err);
        setProjects(fallbackProjects);
      });
  }, [API_BASE]);

  // Compute unique categories dynamically
  const categories = ['All', ...new Set(projects.map(project => project.category))];

  // Filter projects
  const filteredProjects = activeFilter === 'All'
    ? projects
    : projects.filter(project => project.category === activeFilter);

  // Prepend backend base URL if it's a relative path upload
  const getImageUrl = (imagePath) => {
    if (!imagePath) return "https://images.unsplash.com/photo-1557821552-17105176677c?auto=format&fit=crop&w=400&q=80";
    if (imagePath.startsWith('http') || imagePath.startsWith('data:')) {
      return imagePath;
    }
    const rootBase = API_BASE.replace('/api', '');
    return `${rootBase}${imagePath}`;
  };

  return (
    <section id="projects" className="py-20 relative">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">

        {/* Section Title */}
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-2">
            My <span className="text-gradient">Projects</span>
          </h2>
          <p className="text-sm text-muted-foreground">A curated selection of my professional work and personal projects.</p>
          <div className="w-12 h-1 bg-primary mx-auto rounded-full mt-3"></div>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-12">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveFilter(category)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer ${
                activeFilter === category
                  ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20'
                  : 'glass-panel hover:bg-black/5 dark:hover:bg-white/5'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProjects.map((project, idx) => (
            <div
              key={project._id || idx}
              className="glass-panel rounded-2xl overflow-hidden flex flex-col h-full group hover:shadow-xl hover:border-primary/30 dark:hover:border-primary/20 transition-all duration-300 hover:-translate-y-1"
            >
              {/* Project Image */}
              <div className="relative aspect-video overflow-hidden bg-muted">
                <img
                  src={getImageUrl(project.image)}
                  alt={project.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-sm text-white text-xs font-semibold px-2.5 py-1 rounded-lg">
                  {project.category}
                </div>
              </div>

              {/* Project Details */}
              <div className="p-6 flex flex-col flex-grow text-left">
                <h3 className="text-xl font-bold mb-2 group-hover:text-primary dark:group-hover:text-violet-400 transition-colors">
                  {project.title}
                </h3>
                <p className="text-foreground/70 text-sm mb-4 line-clamp-3 leading-relaxed">
                  {project.description}
                </p>

                {/* Tech Tags */}
                <div className="flex flex-wrap gap-1.5 mb-6 mt-auto">
                  {project.tags && project.tags.map((tag, tagIdx) => (
                    <span
                      key={tagIdx}
                      className="bg-black/5 dark:bg-white/5 border border-white/5 text-xs text-foreground/80 px-2 py-0.5 rounded-md"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Action Links */}
                <div className="flex items-center gap-4 pt-4 border-t border-white/5">
                  {project.githubUrl && (
                    <a
                      href={project.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-foreground/85 hover:text-primary dark:hover:text-violet-400 transition-colors"
                    >
                      <Github size={16} />
                      <span>Source Code</span>
                    </a>
                  )}
                  {project.demoUrl && (
                    <a
                      href={project.demoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-foreground/85 hover:text-primary dark:hover:text-violet-400 transition-colors ml-auto"
                    >
                      <ExternalLink size={16} />
                      <span>Live Demo</span>
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredProjects.length === 0 && (
          <div className="text-center py-16 glass-panel rounded-2xl max-w-md mx-auto">
            <Folder size={48} className="mx-auto text-muted-foreground/50 mb-3" />
            <h3 className="text-lg font-bold">No Projects Found</h3>
            <p className="text-sm text-muted-foreground mt-1">Check back later or change filters.</p>
          </div>
        )}

      </div>
    </section>
  );
}
