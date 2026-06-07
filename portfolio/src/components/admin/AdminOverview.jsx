import React, { useState, useEffect } from 'react';
import { 
  FolderKanban, Brain, Award, Mail, Cloud, Server, CheckCircle2, XCircle, ChevronRight, AlertCircle 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function AdminOverview({ setActiveTab }) {
  const { API_BASE, token, apiHealth } = useAuth();
  const [stats, setStats] = useState({
    projectsCount: 0,
    skillsCount: 0,
    certificatesCount: 0,
    unreadMessagesCount: 0
  });
  const [cloudinaryStatus, setCloudinaryStatus] = useState({
    configured: false,
    checking: true,
    message: ''
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch counters stats
        const statsRes = await fetch(`${API_BASE}/admin/summary`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!statsRes.ok) throw new Error('Failed to load dashboard metrics.');
        const statsData = await statsRes.ok ? await statsRes.json() : null;
        if (statsData) setStats(statsData);

        // Fetch upload service configuration health
        const uploadHealthRes = await fetch(`${API_BASE}/upload/health`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (uploadHealthRes.ok) {
          const uploadHealthData = await uploadHealthRes.json();
          setCloudinaryStatus({
            configured: uploadHealthData.cloudinaryConfigured,
            checking: false,
            message: uploadHealthData.message
          });
        } else {
          setCloudinaryStatus({ configured: false, checking: false, message: 'Upload settings unreachable.' });
        }
      } catch (err) {
        console.error(err);
        setError('Error connecting to the backend services. Running in restricted mode.');
        setCloudinaryStatus({ configured: false, checking: false, message: 'Server is offline.' });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [API_BASE, token]);

  const statCards = [
    { id: 'projects', title: 'Total Projects', value: stats.projectsCount, icon: <FolderKanban size={22} />, color: 'text-violet-500 bg-violet-500/10' },
    { id: 'skills', title: 'Total Skills', value: stats.skillsCount, icon: <Brain size={22} />, color: 'text-cyan-500 bg-cyan-500/10' },
    { id: 'certificates', title: 'Total Certificates', value: stats.certificatesCount, icon: <Award size={22} />, color: 'text-pink-500 bg-pink-500/10' },
    { id: 'inbox', title: 'Unread Messages', value: stats.unreadMessagesCount, icon: <Mail size={22} />, color: 'text-amber-500 bg-amber-500/10', highlight: stats.unreadMessagesCount > 0 }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="text-left animate-fade-in">
      {/* Title */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight">Overview Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">Quick summary of portfolio metrics and server health statuses.</p>
      </div>

      {/* Error banner */}
      {error && (
        <div className="mb-8 p-4 rounded-2xl bg-amber-500/15 border border-amber-500/20 text-amber-600 dark:text-amber-400 flex items-start gap-3 text-sm">
          <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">System Offline Fallback Mode: </span>
            <span>{error} The dashboard CRUD actions will only execute when the backend MongoDB server is actively running.</span>
          </div>
        </div>
      )}

      {/* Metric Counters Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((card) => (
          <div
            key={card.id}
            onClick={() => setActiveTab(card.id)}
            className={`glass-panel p-6 rounded-2xl cursor-pointer hover:border-primary/20 transition-all duration-300 ${
              card.highlight ? 'ring-1 ring-amber-500/30 bg-amber-500/[0.02]' : ''
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-xl ${card.color}`}>
                {card.icon}
              </div>
              <ChevronRight size={16} className="text-muted-foreground/50" />
            </div>
            <div className="text-2xl font-extrabold">{card.value}</div>
            <div className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mt-1">{card.title}</div>
          </div>
        ))}
      </div>

      {/* System Status Tracker */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* API Health */}
        <div className="glass-panel p-6 rounded-2xl">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Server size={18} className="text-primary dark:text-violet-400" />
            <span>API Server Health</span>
          </h3>

          <div className="flex items-center gap-3">
            {apiHealth.online ? (
              <>
                <CheckCircle2 size={24} className="text-green-500" />
                <div>
                  <div className="text-sm font-bold text-green-500">API Connection Active</div>
                  <div className="text-xs text-muted-foreground mt-0.5">Database connections are fully online and synced.</div>
                </div>
              </>
            ) : (
              <>
                <XCircle size={24} className="text-red-500" />
                <div>
                  <div className="text-sm font-bold text-red-500">API Connection Failed</div>
                  <div className="text-xs text-muted-foreground mt-0.5">Could not reach the server API. Verify running servers.</div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Cloudinary Health */}
        <div className="glass-panel p-6 rounded-2xl">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Cloud size={18} className="text-primary dark:text-violet-400" />
            <span>Media Hosting Status</span>
          </h3>

          <div className="flex items-center gap-3">
            {cloudinaryStatus.checking ? (
              <div className="w-5 h-5 border-2 border-primary/20 border-t-primary rounded-full animate-spin"></div>
            ) : cloudinaryStatus.configured ? (
              <>
                <CheckCircle2 size={24} className="text-green-500" />
                <div>
                  <div className="text-sm font-bold text-green-500">Cloudinary Configured</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{cloudinaryStatus.message}</div>
                </div>
              </>
            ) : (
              <>
                <AlertCircle size={24} className="text-amber-500" />
                <div>
                  <div className="text-sm font-bold text-amber-500">Local Upload Fallback</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{cloudinaryStatus.message}</div>
                </div>
              </>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
