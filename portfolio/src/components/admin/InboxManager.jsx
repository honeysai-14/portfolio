import React, { useState, useEffect } from 'react';
import { 
  Mail, MailOpen, Trash2, Calendar, User, Eye, X, CheckCircle, AlertCircle 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function InboxManager() {
  const { API_BASE, token } = useAuth();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState({ type: null, message: '' });
  
  // Modal detail control
  const [selectedMessage, setSelectedMessage] = useState(null);

  const fetchMessages = () => {
    setLoading(true);
    fetch(`${API_BASE}/admin/messages`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then((res) => res.json())
      .then((data) => {
        if (data) {
          setMessages(data);
        }
      })
      .catch((err) => {
        console.error(err);
        setStatus({ type: 'error', message: 'Unable to load inbox messages.' });
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchMessages();
  }, [API_BASE]);

  // Toggle Read / Unread Status
  const handleToggleRead = async (msg) => {
    const nextReadState = !msg.isRead;
    try {
      const res = await fetch(`${API_BASE}/admin/messages/${msg._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ isRead: nextReadState })
      });

      if (!res.ok) throw new Error('Failed to update message status.');

      // Update state locally
      setMessages((prev) =>
        prev.map((m) => (m._id === msg._id ? { ...m, isRead: nextReadState } : m))
      );

      // If active inside modal, update modal state too
      if (selectedMessage && selectedMessage._id === msg._id) {
        setSelectedMessage({ ...selectedMessage, isRead: nextReadState });
      }
    } catch (err) {
      console.error(err);
      setStatus({ type: 'error', message: err.message });
    }
  };

  // Inspect message
  const handleOpenMessage = async (msg) => {
    setSelectedMessage(msg);
    // Automatically mark as read if opened and currently unread
    if (!msg.isRead) {
      await handleToggleRead(msg);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this message?')) return;
    setStatus({ type: null, message: '' });

    try {
      const res = await fetch(`${API_BASE}/admin/messages/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!res.ok) throw new Error('Delete operation failed.');

      setStatus({ type: 'success', message: 'Message deleted successfully.' });
      setSelectedMessage(null);
      fetchMessages();
    } catch (err) {
      console.error(err);
      setStatus({ type: 'error', message: err.message });
    }
  };

  const formatMessageDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return dateString;
    }
  };

  return (
    <div className="text-left animate-fade-in">

      {/* Title Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight">Inbox Panel</h1>
        <p className="text-sm text-muted-foreground mt-1">Review contact form submissions and messages from visitors.</p>
      </div>

      {/* Toast Alert */}
      {status.type === 'success' && (
        <div className="mb-6 p-4 rounded-xl bg-green-500/15 border border-green-500/20 text-green-700 dark:text-green-400 flex items-start gap-3 text-sm">
          <CheckCircle size={18} className="flex-shrink-0 mt-0.5" />
          <span>{status.message}</span>
        </div>
      )}
      {status.type === 'error' && (
        <div className="mb-6 p-4 rounded-xl bg-destructive/15 border border-destructive/20 text-destructive dark:text-red-400 flex items-start gap-3 text-sm">
          <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
          <span>{status.message}</span>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
        </div>
      ) : (
        /* Message List table */
        <div className="glass-panel rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-black/10 dark:bg-white/5 text-xs font-semibold uppercase tracking-wider text-muted-foreground border-b border-white/5">
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Name</th>
                  <th className="px-6 py-4">Subject</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-sm">
                {messages.map((msg, idx) => (
                  <tr 
                    key={msg._id || idx} 
                    className={`hover:bg-black/[0.02] dark:hover:bg-white/[0.01] transition-colors cursor-pointer ${
                      !msg.isRead ? 'font-bold bg-primary/[0.01]' : 'text-foreground/75'
                    }`}
                    onClick={() => handleOpenMessage(msg)}
                  >
                    
                    {/* Status Mail icon */}
                    <td className="px-6 py-4" onClick={(e) => { e.stopPropagation(); handleToggleRead(msg); }}>
                      <button className="text-foreground/60 hover:text-primary transition-colors">
                        {msg.isRead ? <MailOpen size={16} /> : <Mail size={16} className="text-primary dark:text-violet-400" />}
                      </button>
                    </td>

                    {/* Date */}
                    <td className="px-6 py-4 text-xs whitespace-nowrap">{formatMessageDate(msg.createdAt)}</td>

                    {/* Name */}
                    <td className="px-6 py-4 truncate max-w-[150px]">{msg.name}</td>

                    {/* Subject */}
                    <td className="px-6 py-4 truncate max-w-[240px]">{msg.subject}</td>

                    {/* Actions column */}
                    <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenMessage(msg)}
                          className="p-2 rounded-xl text-foreground/75 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                          title="Open Message"
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(msg._id)}
                          className="p-2 rounded-xl text-red-500 hover:bg-red-500/10 transition-colors"
                          title="Delete Message"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Empty state */}
          {messages.length === 0 && (
            <div className="text-center py-16 text-muted-foreground">
              <Mail size={40} className="mx-auto opacity-35 mb-2" />
              <p className="text-sm font-semibold">Your Inbox is Clean.</p>
              <p className="text-xs mt-1">When visitors submit messages, they will appear here.</p>
            </div>
          )}

        </div>
      )}

      {/* Message Viewer Slide-Out Modal */}
      {selectedMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="glass-panel w-full max-w-lg rounded-3xl p-8 relative flex flex-col gap-5 text-left shadow-2xl">
            {/* Close */}
            <button
              onClick={() => setSelectedMessage(null)}
              className="absolute top-5 right-5 p-1.5 rounded-lg text-foreground/75 hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer"
            >
              <X size={18} />
            </button>

            {/* Header info */}
            <div className="border-b border-white/5 pb-4">
              <h2 className="text-xl font-bold mb-1">{selectedMessage.subject}</h2>
              <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2">
                <span className="flex items-center gap-1">
                  <User size={12} />
                  {selectedMessage.name} ({selectedMessage.email})
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Calendar size={12} />
                  {formatMessageDate(selectedMessage.createdAt)}
                </span>
              </div>
            </div>

            {/* Message Body */}
            <div className="bg-black/5 dark:bg-white/5 border border-white/5 p-4 rounded-2xl max-h-60 overflow-y-auto">
              <p className="text-sm leading-relaxed whitespace-pre-wrap text-foreground/90">
                {selectedMessage.message}
              </p>
            </div>

            {/* Actions footer */}
            <div className="flex items-center gap-3 pt-2 justify-end border-t border-white/5">
              <button
                onClick={() => handleToggleRead(selectedMessage)}
                className="px-4 py-2 text-xs font-semibold rounded-xl glass-panel glass-panel-hover"
              >
                {selectedMessage.isRead ? 'Mark Unread' : 'Mark Read'}
              </button>
              <button
                onClick={() => handleDelete(selectedMessage._id)}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-destructive text-destructive-foreground shadow hover:opacity-95"
              >
                Delete Message
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
