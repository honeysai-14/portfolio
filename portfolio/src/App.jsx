import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import About from './components/About';
import Projects from './components/Projects';
import Skills from './components/Skills';
import Certificates from './components/Certificates';
import Contact from './components/Contact';
import Footer from './components/Footer';
import AdminLogin from './components/admin/AdminLogin';
import AdminDashboard from './components/admin/AdminDashboard';

// Custom lightweight routing helper
export const RouterContext = React.createContext({
  path: '/',
  navigate: () => {}
});

function AppContent() {
  const { token, loading } = useAuth();
  const [path, setPath] = useState(window.location.pathname);

  useEffect(() => {
    const handleLocationChange = () => {
      setPath(window.location.pathname);
    };
    // Intercept standard popstate events (e.g. back button)
    window.addEventListener('popstate', handleLocationChange);
    return () => window.removeEventListener('popstate', handleLocationChange);
  }, []);

  const navigate = (to) => {
    window.history.pushState({}, '', to);
    setPath(to);
    // Smooth scroll back to top on navigation
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 border-4 border-primary/20 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-t-primary rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <RouterContext.Provider value={{ path, navigate }}>
      {path.startsWith('/admin') ? (
        token ? (
          <AdminDashboard />
        ) : (
          <AdminLogin />
        )
      ) : (
        <div className="min-h-screen bg-background text-foreground relative overflow-hidden">
          <Navbar />
          <main>
            <Hero />
            <About />
            <Projects />
            <Skills />
            <Certificates />
            <Contact />
          </main>
          <Footer />
        </div>
      )}
    </RouterContext.Provider>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
