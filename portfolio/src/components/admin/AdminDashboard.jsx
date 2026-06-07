import React, { useState, useContext } from 'react';
import { 
  LayoutDashboard, User, FolderKanban, Award, Brain, Mail, LogOut, ArrowLeft, Menu, X, ShieldAlert 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { RouterContext } from '../../App';

// Import managers
import AdminOverview from './AdminOverview';
import ProfileManager from './ProfileManager';
import ProjectsManager from './ProjectsManager';
import SkillsManager from './SkillsManager';
import CertificatesManager from './CertificatesManager';
import InboxManager from './InboxManager';

export default function AdminDashboard() {
  const { admin, logout } = useAuth();
  const { navigate } = useContext(RouterContext);
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const tabs = [
    { id: 'overview', name: 'Overview', icon: <LayoutDashboard size={18} /> },
    { id: 'profile', name: 'Profile Settings', icon: <User size={18} /> },
    { id: 'projects', name: 'Projects Manager', icon: <FolderKanban size={18} /> },
    { id: 'skills', name: 'Skills Manager', icon: <Brain size={18} /> },
    { id: 'certificates', name: 'Certificates Manager', icon: <Award size={18} /> },
    { id: 'inbox', name: 'Inbox Panel', icon: <Mail size={18} /> }
  ];

  const renderActiveContent = () => {
    switch (activeTab) {
      case 'overview':
        return <AdminOverview setActiveTab={setActiveTab} />;
      case 'profile':
        return <ProfileManager />;
      case 'projects':
        return <ProjectsManager />;
      case 'skills':
        return <SkillsManager />;
      case 'certificates':
        return <CertificatesManager />;
      case 'inbox':
        return <InboxManager />;
      default:
        return <AdminOverview setActiveTab={setActiveTab} />;
    }
  };

  const handleTabClick = (tabId) => {
    setActiveTab(tabId);
    setSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col md:flex-row relative">
      
      {/* Mobile Top Navbar bar */}
      <header className="md:hidden glass-panel border-b border-white/10 px-6 py-4 flex items-center justify-between w-full relative z-20">
        <button 
          onClick={() => navigate('/')}
          className="text-xl font-bold tracking-tight text-gradient cursor-pointer"
        >
          HoneySai.K
        </button>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-xl glass-panel text-foreground/80"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </header>

      {/* Sidebar Navigation */}
      <aside className={`fixed md:sticky top-0 z-30 w-64 h-[100vh] glass-panel border-r border-white/10 flex flex-col justify-between py-6 px-4 transition-transform duration-300 md:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div>
          {/* Brand header */}
          <div className="flex items-center justify-between mb-8 px-2">
            <button 
              onClick={() => navigate('/')}
              className="text-xl font-bold tracking-tight text-gradient cursor-pointer"
            >
              HoneySai.K
            </button>
            <button
              onClick={() => setSidebarOpen(false)}
              className="md:hidden p-1.5 rounded-lg text-foreground/75 hover:bg-black/5"
            >
              <X size={18} />
            </button>
          </div>

          {/* User Meta Card */}
          <div className="glass-card p-4 mb-6 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary dark:text-violet-400 flex items-center justify-center font-bold text-sm">
              {admin?.username?.substring(0, 2).toUpperCase() || 'AD'}
            </div>
            <div className="text-left overflow-hidden">
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Signed In As</div>
              <div className="text-sm font-bold truncate">{admin?.username || 'Administrator'}</div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col gap-1.5">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-primary text-primary-foreground shadow-md shadow-primary/15'
                    : 'text-foreground/75 hover:bg-black/5 dark:hover:bg-white/5'
                }`}
              >
                {tab.icon}
                <span>{tab.name}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Bottom actions */}
        <div className="flex flex-col gap-2 pt-6 border-t border-white/10">
          <button
            onClick={() => navigate('/')}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold text-foreground/75 hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer"
          >
            <ArrowLeft size={16} />
            <span>Return to Portfolio</span>
          </button>
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold text-red-500 hover:bg-red-500/10 cursor-pointer"
          >
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Pane */}
      <main className="flex-1 min-h-[100vh] py-8 px-6 md:px-10 overflow-y-auto relative z-10 w-full">
        {/* Background Subtle Blurs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-primary/5 blur-[120px]"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-cyan-500/5 blur-[120px]"></div>
        </div>

        <div className="max-w-6xl mx-auto relative z-10">
          {renderActiveContent()}
        </div>
      </main>

    </div>
  );
}
