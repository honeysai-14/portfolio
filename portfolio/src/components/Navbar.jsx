import React, { useState, useEffect, useContext } from 'react';
import { Menu, X, Sun, Moon, Shield } from 'lucide-react';
import { RouterContext } from '../App';

export default function Navbar() {
  const { navigate } = useContext(RouterContext);
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const [darkMode, setDarkMode] = useState(() => {
    // Check local storage or system preferences
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme');
      if (saved) return saved === 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return true; // default dark
  });

  const navLinks = [
    { name: 'Home', id: 'home' },
    { name: 'About', id: 'about' },
    { name: 'Projects', id: 'projects' },
    { name: 'Skills', id: 'skills' },
    { name: 'Contact', id: 'contact' }
  ];

  // Sync dark mode class
  useEffect(() => {
    const root = window.document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  // Handle scroll events
  useEffect(() => {
    const handleScroll = () => {
      // Spy scroll active sections
      const scrollPosition = window.scrollY + 150; // offset for navbar height
      for (const link of navLinks) {
        const element = document.getElementById(link.id);
        if (element) {
          const offsetTop = element.offsetTop;
          const offsetHeight = element.offsetHeight;
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(link.id);
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (id) => {
    setIsOpen(false);
    const element = document.getElementById(id);
    if (element) {
      const offset = 100; // height of floating navbar
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
      setActiveSection(id);
    }
  };

  return (
    <nav className="sticky top-0 z-50 w-full pt-4 px-4 transition-all duration-300">
      <div className="max-w-3xl mx-auto glass-panel border border-white/20 dark:border-white/10 shadow-lg py-2.5 px-6 rounded-full flex items-center justify-between transition-all duration-300 bg-white/70 dark:bg-black/60 backdrop-blur-md">
        
        {/* Brand Logo / Desktop Links wrapper */}
        <div className="hidden md:flex items-center gap-8 justify-center w-full">
          <ul className="flex items-center gap-6">
            {navLinks.map((link) => (
              <li key={link.id}>
                <button
                  onClick={() => handleNavClick(link.id)}
                  className={`text-xs font-semibold tracking-wide transition-colors cursor-pointer ${
                    activeSection === link.id
                      ? 'text-primary dark:text-violet-400'
                      : 'text-foreground/70 hover:text-primary dark:hover:text-violet-400'
                  }`}
                >
                  {link.name}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Brand logo for mobile view */}
        <button 
          onClick={() => handleNavClick('home')}
          className="text-base font-bold tracking-tight text-gradient cursor-pointer md:hidden"
        >
          Narsimulu
        </button>

        {/* Action Buttons: Dark Mode & Login */}
        <div className="flex items-center gap-2">
          {/* Dark mode */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-full text-foreground/80 hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
            title="Toggle theme"
          >
            {darkMode ? <Sun size={15} /> : <Moon size={15} />}
          </button>

          {/* Centered blue Login button */}
          <button
            onClick={() => navigate('/admin')}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-1.5 rounded-full text-xs transition-all duration-200 cursor-pointer shadow-md shadow-blue-500/10 hover:shadow-blue-500/20"
          >
            Login
          </button>
        </div>

        {/* Mobile menu toggle */}
        <div className="flex items-center md:hidden">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-1 rounded-lg text-foreground/80"
          >
            {isOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="md:hidden glass-panel border border-white/10 mt-2 mx-4 p-5 rounded-2xl flex flex-col gap-3 absolute top-full left-0 right-0 z-50">
          <ul className="flex flex-col gap-3 text-left">
            {navLinks.map((link) => (
              <li key={link.id}>
                <button
                  onClick={() => handleNavClick(link.id)}
                  className={`text-xs font-bold w-full text-left py-1 ${
                    activeSection === link.id
                      ? 'text-primary dark:text-violet-400'
                      : 'text-foreground/85'
                  }`}
                >
                  {link.name}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </nav>
  );
}
