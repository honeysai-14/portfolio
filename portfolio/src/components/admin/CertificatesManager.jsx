import React, { useState, useEffect } from 'react';
import { 
  Award, Plus, Pencil, Trash2, Save, X, Upload, CheckCircle, AlertCircle, Calendar, Link as LinkIcon 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function CertificatesManager() {
  const { API_BASE, token } = useAuth();
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState({ type: null, message: '' });

  // Form controls
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    issuer: '',
    issueDate: '',
    credentialId: '',
    credentialUrl: '',
    image: ''
  });

  const fetchCertificates = () => {
    setLoading(true);
    fetch(`${API_BASE}/certificates`)
      .then((res) => res.json())
      .then((data) => {
        if (data) {
          // Sort by issue date descending
          setCertificates(data.sort((a, b) => new Date(b.issueDate) - new Date(a.issueDate)));
        }
      })
      .catch((err) => {
        console.error(err);
        setStatus({ type: 'error', message: 'Unable to fetch certificates list.' });
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchCertificates();
  }, [API_BASE]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Handle Certificate Badge Upload
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingImage(true);
    setStatus({ type: null, message: '' });

    const uploadFormData = new FormData();
    uploadFormData.append('file', file);

    try {
      const res = await fetch(`${API_BASE}/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: uploadFormData
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Badge upload failed.');

      setFormData((prev) => ({
        ...prev,
        image: data.url
      }));

      setStatus({ type: 'success', message: 'Certificate badge uploaded successfully!' });
    } catch (err) {
      console.error(err);
      setStatus({ type: 'error', message: err.message });
    } finally {
      setUploadingImage(false);
    }
  };

  const handleOpenAdd = () => {
    // Current date as default: YYYY-MM-DD
    const today = new Date().toISOString().split('T')[0];
    setFormData({
      title: '',
      issuer: '',
      issueDate: today,
      credentialId: '',
      credentialUrl: '',
      image: ''
    });
    setEditId(null);
    setIsEditing(true);
    setStatus({ type: null, message: '' });
  };

  const handleOpenEdit = (cert) => {
    // Format date string to YYYY-MM-DD for date input
    let formattedDate = '';
    if (cert.issueDate) {
      formattedDate = new Date(cert.issueDate).toISOString().split('T')[0];
    }

    setFormData({
      title: cert.title || '',
      issuer: cert.issuer || '',
      issueDate: formattedDate,
      credentialId: cert.credentialId || '',
      credentialUrl: cert.credentialUrl || '',
      image: cert.image || ''
    });
    setEditId(cert._id);
    setIsEditing(true);
    setStatus({ type: null, message: '' });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setStatus({ type: null, message: '' });

    if (!formData.title || !formData.issuer || !formData.issueDate) {
      setStatus({ type: 'error', message: 'Title, issuer, and issue date are required.' });
      return;
    }

    try {
      const url = editId
        ? `${API_BASE}/admin/certificates/${editId}`
        : `${API_BASE}/admin/certificates`;
      
      const method = editId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Operation failed.');

      setIsEditing(false);
      setEditId(null);
      setStatus({
        type: 'success',
        message: editId ? 'Certificate edited successfully.' : 'New certificate created successfully!'
      });
      fetchCertificates();
    } catch (err) {
      console.error(err);
      setStatus({ type: 'error', message: err.message });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this certificate?')) return;
    setStatus({ type: null, message: '' });

    try {
      const res = await fetch(`${API_BASE}/admin/certificates/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Delete operation failed.');

      setStatus({ type: 'success', message: 'Certificate removed successfully.' });
      fetchCertificates();
    } catch (err) {
      console.error(err);
      setStatus({ type: 'error', message: err.message });
    }
  };

  const formatDate = (dateString) => {
    try {
      const options = { year: 'numeric', month: 'short' };
      return new Date(dateString).toLocaleDateString('en-US', options);
    } catch (e) {
      return dateString;
    }
  };

  const getMediaUrl = (pathString) => {
    if (!pathString) return '';
    if (pathString.startsWith('http') || pathString.startsWith('data:')) return pathString;
    return `${API_BASE.replace('/api', '')}${pathString}`;
  };

  return (
    <div className="text-left animate-fade-in">

      {/* Header Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Certificates Manager</h1>
          <p className="text-sm text-muted-foreground mt-1">Add, edit, or delete professional certifications and licenses.</p>
        </div>
        {!isEditing && (
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold shadow-md hover:-translate-y-0.5 transition-all cursor-pointer"
          >
            <Plus size={16} />
            <span>Add Certificate</span>
          </button>
        )}
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

      {loading && !isEditing ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
        </div>
      ) : isEditing ? (
        /* Form View */
        <div className="glass-panel p-8 rounded-3xl">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/5">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Award size={20} className="text-primary dark:text-violet-400" />
              <span>{editId ? 'Edit Certificate Details' : 'Create New Certificate'}</span>
            </h2>
            <button
              onClick={() => setIsEditing(false)}
              className="p-1.5 rounded-lg text-foreground/75 hover:bg-black/5 dark:hover:bg-white/5"
            >
              <X size={18} />
            </button>
          </div>

          <form onSubmit={handleFormSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Col: Upload and preview badge */}
            <div className="lg:col-span-4 flex flex-col gap-6">
              <div className="glass-panel p-6 rounded-2xl flex flex-col items-center">
                <label className="text-xs font-semibold text-foreground/80 mb-4 w-full text-left">Credential Logo / Badge</label>
                
                <div className="relative w-32 h-32 rounded-xl overflow-hidden bg-muted border border-white/10 mb-4 flex items-center justify-center">
                  {formData.image ? (
                    <img
                      src={getMediaUrl(formData.image)}
                      alt="Certificate Badge Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Award size={32} className="text-muted-foreground/35" />
                  )}
                  {uploadingImage && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                      <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    </div>
                  )}
                </div>

                <label className="w-full py-2.5 rounded-xl border border-dashed border-white/20 hover:border-primary/50 flex items-center justify-center gap-2 cursor-pointer text-xs font-semibold hover:bg-black/5 dark:hover:bg-white/5 transition-all">
                  <Upload size={14} />
                  <span>Choose Badge</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Image URL fallback */}
              <div>
                <label htmlFor="image" className="text-xs font-semibold text-foreground/80 mb-2 block">Or Image URL</label>
                <input
                  id="image"
                  type="text"
                  name="image"
                  value={formData.image}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-xl glass-input text-sm"
                  placeholder="https://example.com/badge.png"
                />
              </div>
            </div>

            {/* Right Col: Fields form */}
            <div className="lg:col-span-8 flex flex-col gap-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                
                {/* Title */}
                <div>
                  <label htmlFor="title" className="text-xs font-semibold text-foreground/80 mb-2 block">Certificate Name *</label>
                  <input
                    id="title"
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-xl glass-input text-sm"
                    placeholder="AWS Solutions Architect"
                    required
                  />
                </div>

                {/* Issuer */}
                <div>
                  <label htmlFor="issuer" className="text-xs font-semibold text-foreground/80 mb-2 block">Issuer *</label>
                  <input
                    id="issuer"
                    type="text"
                    name="issuer"
                    value={formData.issuer}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-xl glass-input text-sm"
                    placeholder="Amazon Web Services"
                    required
                  />
                </div>

              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                
                {/* Issue Date */}
                <div>
                  <label htmlFor="issueDate" className="text-xs font-semibold text-foreground/80 mb-2 block">Issue Date *</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-muted-foreground">
                      <Calendar size={16} />
                    </span>
                    <input
                      id="issueDate"
                      type="date"
                      name="issueDate"
                      value={formData.issueDate}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-3 rounded-xl glass-input text-sm cursor-pointer"
                      required
                    />
                  </div>
                </div>

                {/* Credential ID */}
                <div>
                  <label htmlFor="credentialId" className="text-xs font-semibold text-foreground/80 mb-2 block">Credential ID</label>
                  <input
                    id="credentialId"
                    type="text"
                    name="credentialId"
                    value={formData.credentialId}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-xl glass-input text-sm font-mono text-xs"
                    placeholder="AWS-AS-12345"
                  />
                </div>

              </div>

              {/* Credential Verification URL */}
              <div>
                <label htmlFor="credentialUrl" className="text-xs font-semibold text-foreground/80 mb-2 block">Verification Link</label>
                <input
                  id="credentialUrl"
                  type="url"
                  name="credentialUrl"
                  value={formData.credentialUrl}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-xl glass-input text-sm"
                  placeholder="https://aws.amazon.com/verification"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 mt-4 justify-end">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-6 py-3 rounded-xl glass-panel glass-panel-hover font-semibold transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold shadow-md shadow-primary/10 hover:shadow-lg transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Save size={16} />
                  <span>Save Certificate</span>
                </button>
              </div>
            </div>
          </form>
        </div>
      ) : (
        /* List View */
        <div className="glass-panel rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-black/10 dark:bg-white/5 text-xs font-semibold uppercase tracking-wider text-muted-foreground border-b border-white/5">
                  <th className="px-6 py-4">Badge</th>
                  <th className="px-6 py-4">Certificate Name</th>
                  <th className="px-6 py-4">Issuer</th>
                  <th className="px-6 py-4">Issue Date</th>
                  <th className="px-6 py-4">Verification</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-sm">
                {certificates.map((cert, idx) => (
                  <tr key={cert._id || idx} className="hover:bg-black/[0.02] dark:hover:bg-white/[0.01] transition-colors">
                    
                    {/* Badge Preview */}
                    <td className="px-6 py-4">
                      <div className="w-10 h-10 rounded bg-muted overflow-hidden border border-white/10 flex items-center justify-center">
                        {cert.image ? (
                          <img
                            src={getMediaUrl(cert.image)}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Award size={18} className="text-muted-foreground/50" />
                        )}
                      </div>
                    </td>

                    {/* Title */}
                    <td className="px-6 py-4 font-bold max-w-[200px] truncate">{cert.title}</td>

                    {/* Issuer */}
                    <td className="px-6 py-4 font-semibold text-foreground/80">{cert.issuer}</td>

                    {/* Date */}
                    <td className="px-6 py-4 text-xs text-muted-foreground">{formatDate(cert.issueDate)}</td>

                    {/* Verification Link */}
                    <td className="px-6 py-4">
                      {cert.credentialUrl ? (
                        <a href={cert.credentialUrl} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded-lg glass-panel hover:bg-black/5 dark:hover:bg-white/5 text-primary dark:text-violet-400 inline-block" title="Verify Link">
                          <LinkIcon size={14} />
                        </a>
                      ) : (
                        <span className="text-muted-foreground/30">—</span>
                      )}
                    </td>

                    {/* Action buttons */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenEdit(cert)}
                          className="p-2 rounded-xl text-foreground/75 hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
                          title="Edit Certificate"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(cert._id)}
                          className="p-2 rounded-xl text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer"
                          title="Delete Certificate"
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
          {certificates.length === 0 && (
            <div className="text-center py-16 text-muted-foreground">
              <Award size={40} className="mx-auto opacity-35 mb-2" />
              <p className="text-sm font-semibold">No Certificates Logged Yet.</p>
              <button
                onClick={handleOpenAdd}
                className="text-xs text-primary font-bold hover:underline mt-1 block mx-auto cursor-pointer"
              >
                Log the first certificate
              </button>
            </div>
          )}

        </div>
      )}

    </div>
  );
}
