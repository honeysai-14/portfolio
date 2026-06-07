import React, { useState, useEffect } from 'react';
import * as Icons from 'lucide-react';
import { fallbackSkills } from '../data/fallback-data';
import { useAuth } from '../context/AuthContext';

export default function Skills() {
  const { API_BASE } = useAuth();
  const [skills, setSkills] = useState([]);
  const [activeCategory, setActiveCategory] = useState('All');

  useEffect(() => {
    fetch(`${API_BASE}/skills`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch');
        return res.json();
      })
      .then((data) => {
        if (data && data.length > 0) {
          setSkills(data);
        } else {
          setSkills(fallbackSkills);
        }
      })
      .catch((err) => {
        console.warn('Unable to load skills from API, using fallback data:', err);
        setSkills(fallbackSkills);
      });
  }, [API_BASE]);

  // Map proficiency level to percentage width
  const getProgressWidth = (level) => {
    switch (level) {
      case 'Expert': return '100%';
      case 'Advanced': return '75%';
      case 'Intermediate': return '50%';
      case 'Beginner': return '25%';
      default: return '0%';
    }
  };

  // Helper to resolve Lucide Icon dynamically
  const renderSkillIcon = (iconName) => {
    const IconComponent = Icons[iconName];
    if (IconComponent) {
      return <IconComponent className="text-primary dark:text-violet-400" size={20} />;
    }
    return <Icons.Code className="text-primary dark:text-violet-400" size={20} />;
  };

  // Categories extraction
  const categories = ['All', ...new Set(skills.map(skill => skill.category))];

  // Filtering
  const filteredSkills = activeCategory === 'All'
    ? skills
    : skills.filter(skill => skill.category === activeCategory);

  // Statistics calculation
  const totalCount = skills.length;
  const expertCount = skills.filter(s => s.level === 'Expert').length;
  const featuredCount = skills.filter(s => s.isFeatured).length;

  return (
    <section id="skills" className="py-20 bg-black/5 dark:bg-black/20 relative">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">

        {/* Section Title */}
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-2">
            Skills & <span className="text-gradient">Proficiencies</span>
          </h2>
          <p className="text-sm text-muted-foreground">My technical toolkit and professional competencies.</p>
          <div className="w-12 h-1 bg-primary mx-auto rounded-full mt-3"></div>
        </div>

        {/* Interactive Stats Panel */}
        <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto mb-12">
          <div className="glass-panel p-4 rounded-xl text-center">
            <div className="text-2xl sm:text-3xl font-extrabold text-primary dark:text-violet-400">{totalCount}</div>
            <div className="text-xs text-muted-foreground font-semibold mt-1">Total Skills</div>
          </div>
          <div className="glass-panel p-4 rounded-xl text-center">
            <div className="text-2xl sm:text-3xl font-extrabold text-primary dark:text-violet-400">{expertCount}</div>
            <div className="text-xs text-muted-foreground font-semibold mt-1">Expert Level</div>
          </div>
          <div className="glass-panel p-4 rounded-xl text-center">
            <div className="text-2xl sm:text-3xl font-extrabold text-primary dark:text-violet-400">{featuredCount}</div>
            <div className="text-xs text-muted-foreground font-semibold mt-1">Core Tech</div>
          </div>
        </div>

        {/* Categories Tab Selector */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all duration-200 cursor-pointer ${
                activeCategory === category
                  ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20'
                  : 'glass-panel hover:bg-black/5 dark:hover:bg-white/5'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Skills Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSkills.map((skill, idx) => (
            <div
              key={skill._id || idx}
              className={`glass-panel p-6 rounded-2xl flex flex-col justify-between transition-all duration-300 hover:shadow-lg hover:border-primary/20 ${
                skill.isFeatured ? 'ring-1 ring-primary/30 dark:ring-violet-500/20 bg-primary/[0.02]' : ''
              }`}
            >
              <div className="text-left">
                {/* Header Icon + Name */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-black/5 dark:bg-white/5">
                      {renderSkillIcon(skill.icon)}
                    </div>
                    <div>
                      <h3 className="font-bold text-base flex items-center gap-1.5">
                        {skill.name}
                        {skill.isFeatured && (
                          <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary animate-pulse" title="Core Skill"></span>
                        )}
                      </h3>
                      <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">
                        {skill.category}
                      </span>
                    </div>
                  </div>
                  <span className="text-xs font-bold px-2 py-0.5 rounded bg-primary/10 text-primary dark:text-violet-400">
                    {skill.level}
                  </span>
                </div>

                {/* Description */}
                <p className="text-foreground/75 text-sm mb-4 leading-relaxed line-clamp-2">
                  {skill.description || `Experienced working with ${skill.name}.`}
                </p>
              </div>

              {/* Progress Slider bar */}
              <div className="mt-auto">
                <div className="w-full h-1.5 bg-black/10 dark:bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-violet-600 to-indigo-500 dark:from-violet-400 dark:to-cyan-400 rounded-full"
                    style={{ width: getProgressWidth(skill.level) }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
