import React, { useState, useEffect } from 'react';
import { Save, Upload, FileText, CheckCircle, AlertCircle, Image as ImageIcon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function ProfileManager() {
  const { API_BASE, token } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    titlesString: '',
    bio: '',
    heroBio: '',
    location: '',
    avatarUrl: '',
    aboutAvatarUrl: '',
    resumeUrl: '',
    github: '',
    linkedin: '',
    twitter: '',
    email: ''
  });
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingAboutAvatar, setUploadingAboutAvatar] = useState(false);
  const [uploadingResume, setUploadingResume] = useState(false);
  const [status, setStatus] = useState({ type: null, message: '' });
  const [loading, setLoading] = useState(true);

  // Fetch current profile on mount
  useEffect(() => {
    fetch(`${API_BASE}/profile`)
      .then((res) => res.json())
      .then((data) => {
        if (data) {
          setFormData({
            name: data.name || '',
            titlesString: data.title ? data.title.join(', ') : '',
            bio: data.bio || '',
            heroBio: data.heroBio || '',
            location: data.location || '',
            avatarUrl: data.avatarUrl || '',
            aboutAvatarUrl: data.aboutAvatarUrl || '',
            resumeUrl: data.resumeUrl || '',
            github: data.socialLinks?.github || '',
            linkedin: data.socialLinks?.linkedin || '',
            twitter: data.socialLinks?.twitter || '',
            email: data.socialLinks?.email || ''
          });
        }
      })
      .catch((err) => {
        console.error('Error fetching profile settings:', err);
        setStatus({ type: 'error', message: 'Unable to fetch current profile details.' });
      })
      .finally(() => setLoading(false));
  }, [API_BASE]);

  // Handle file uploads
  const handleFileChange = async (e, field) => {
    const file = e.target.files[0];
    if (!file) return;

    const isHeroAvatar = field === 'avatarUrl';
    const isAboutAvatar = field === 'aboutAvatarUrl';

    if (isHeroAvatar) setUploadingAvatar(true);
    else if (isAboutAvatar) setUploadingAboutAvatar(true);
    else setUploadingResume(true);

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
      if (!res.ok) throw new Error(data.message || 'File upload failed.');

      setFormData((prev) => ({
        ...prev,
        [field]: data.url
      }));

      setStatus({ 
        type: 'success', 
        message: `${isHeroAvatar ? 'Hero photo' : isAboutAvatar ? 'About biography photo' : 'Resume file'} uploaded and staged successfully!` 
      });
    } catch (err) {
      console.error(err);
      setStatus({ type: 'error', message: err.message });
    } finally {
      if (isHeroAvatar) setUploadingAvatar(false);
      else if (isAboutAvatar) setUploadingAboutAvatar(false);
      else setUploadingResume(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setStatus({ type: null, message: '' });

    // Format roles string to array
    const title = formData.titlesString
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    const payload = {
      name: formData.name,
      title,
      bio: formData.bio,
      heroBio: formData.heroBio,
      location: formData.location,
      avatarUrl: formData.avatarUrl,
      aboutAvatarUrl: formData.aboutAvatarUrl,
      resumeUrl: formData.resumeUrl,
      socialLinks: {
        github: formData.github,
        linkedin: formData.linkedin,
        twitter: formData.twitter,
        email: formData.email
      }
    };

    try {
      const res = await fetch(`${API_BASE}/admin/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to update profile settings.');

      setStatus({ type: 'success', message: 'Profile details updated and saved successfully!' });
    } catch (err) {
      console.error(err);
      setStatus({ type: 'error', message: err.message });
    }
  };

  const getMediaUrl = (pathString) => {
    if (!pathString) return '';
    if (pathString.startsWith('http') || pathString.startsWith('data:')) return pathString;
    return `${API_BASE.replace('/api', '')}${pathString}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="text-left animate-fade-in">
      {/* Title Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight">Profile Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage your biographical info, credentials, and social links.</p>
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

      {/* Main Settings Form */}
      <form onSubmit={handleFormSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left column: Files Uploaders */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          
          {/* Hero Avatar Frame */}
          <div className="glass-panel p-6 rounded-2xl flex flex-col items-center">
            <h3 className="text-sm font-bold mb-4 w-full">Hero Section Photo</h3>
            
            <div className="relative w-40 h-40 rounded-2xl overflow-hidden bg-muted border border-white/10 mb-4 flex items-center justify-center">
              {formData.avatarUrl ? (
                <img
                  src={getMediaUrl(formData.avatarUrl)}
                  alt="Hero Avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                <ImageIcon size={32} className="text-muted-foreground/45" />
              )}
              {uploadingAvatar && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                  <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                </div>
              )}
            </div>

            <label className="w-full py-2.5 rounded-xl border border-dashed border-white/20 hover:border-primary/50 flex items-center justify-center gap-2 cursor-pointer text-xs font-semibold hover:bg-black/5 dark:hover:bg-white/5 transition-all">
              <Upload size={14} />
              <span>Choose Hero Photo</span>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleFileChange(e, 'avatarUrl')}
                className="hidden"
              />
            </label>
          </div>

          {/* About Avatar Frame */}
          <div className="glass-panel p-6 rounded-2xl flex flex-col items-center">
            <h3 className="text-sm font-bold mb-4 w-full">About Section Photo</h3>
            
            <div className="relative w-40 h-40 rounded-2xl overflow-hidden bg-muted border border-white/10 mb-4 flex items-center justify-center">
              {formData.aboutAvatarUrl ? (
                <img
                  src={getMediaUrl(formData.aboutAvatarUrl)}
                  alt="About Avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                <ImageIcon size={32} className="text-muted-foreground/45" />
              )}
              {uploadingAboutAvatar && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                  <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                </div>
              )}
            </div>

            <label className="w-full py-2.5 rounded-xl border border-dashed border-white/20 hover:border-primary/50 flex items-center justify-center gap-2 cursor-pointer text-xs font-semibold hover:bg-black/5 dark:hover:bg-white/5 transition-all">
              <Upload size={14} />
              <span>Choose About Photo</span>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleFileChange(e, 'aboutAvatarUrl')}
                className="hidden"
              />
            </label>
          </div>

          {/* Resume PDF uploader */}
          <div className="glass-panel p-6 rounded-2xl">
            <h3 className="text-sm font-bold mb-4 flex items-center gap-1.5">
              <FileText size={16} className="text-primary dark:text-violet-400" />
              <span>Curriculum Vitae</span>
            </h3>

            {formData.resumeUrl && formData.resumeUrl !== '#' ? (
              <div className="mb-4 text-xs bg-black/5 dark:bg-white/5 p-3 rounded-xl border border-white/5 truncate font-mono text-muted-foreground">
                Path: {formData.resumeUrl}
              </div>
            ) : (
              <div className="mb-4 text-xs text-muted-foreground italic">
                Resume PDF file not uploaded yet.
              </div>
            )}

            <label className="w-full py-2.5 rounded-xl border border-dashed border-white/20 hover:border-primary/50 flex items-center justify-center gap-2 cursor-pointer text-xs font-semibold hover:bg-black/5 dark:hover:bg-white/5 transition-all">
              {uploadingResume ? (
                <div className="w-4 h-4 border-2 border-primary/20 border-t-primary rounded-full animate-spin"></div>
              ) : (
                <Upload size={14} />
              )}
              <span>Upload PDF Resume</span>
              <input
                type="file"
                accept=".pdf"
                onChange={(e) => handleFileChange(e, 'resumeUrl')}
                className="hidden"
              />
            </label>
          </div>

        </div>

        {/* Right column: Form fields */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <div className="glass-panel p-8 rounded-2xl flex flex-col gap-5">
            <h3 className="text-base font-bold mb-2">Biographical Information</h3>

            {/* Name */}
            <div>
              <label htmlFor="name" className="text-xs font-semibold text-foreground/80 mb-2 block">Full Name</label>
              <input
                id="name"
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-xl glass-input text-sm"
                required
              />
            </div>

            {/* Typewriter Titles */}
            <div>
              <label htmlFor="titlesString" className="text-xs font-semibold text-foreground/80 mb-2 block">Job Titles (comma-separated)</label>
              <input
                id="titlesString"
                type="text"
                name="titlesString"
                value={formData.titlesString}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-xl glass-input text-sm font-mono text-xs"
                placeholder="Full-Stack Developer, UI/UX Designer, Team Lead"
              />
            </div>

            {/* Hero Bio */}
            <div>
              <label htmlFor="heroBio" className="text-xs font-semibold text-foreground/80 mb-2 block">Hero Section Description</label>
              <textarea
                id="heroBio"
                name="heroBio"
                rows="3"
                value={formData.heroBio}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-xl glass-input text-sm resize-none"
                placeholder="Short intro description shown in the hero block..."
              ></textarea>
            </div>

            {/* Bio */}
            <div>
              <label htmlFor="bio" className="text-xs font-semibold text-foreground/80 mb-2 block">About Section Biography</label>
              <textarea
                id="bio"
                name="bio"
                rows="6"
                value={formData.bio}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-xl glass-input text-sm resize-none"
                required
              ></textarea>
            </div>

            {/* Location */}
            <div>
              <label htmlFor="location" className="text-xs font-semibold text-foreground/80 mb-2 block">Location</label>
              <input
                id="location"
                type="text"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-xl glass-input text-sm"
                placeholder="Hyderabad, India"
              />
            </div>

            <h3 className="text-base font-bold mt-4 mb-2">Social & Communication Links</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              
              {/* GitHub */}
              <div>
                <label htmlFor="github" className="text-xs font-semibold text-foreground/80 mb-2 block">GitHub URL</label>
                <input
                  id="github"
                  type="url"
                  name="github"
                  value={formData.github}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-xl glass-input text-sm"
                  placeholder="https://github.com/username"
                />
              </div>

              {/* LinkedIn */}
              <div>
                <label htmlFor="linkedin" className="text-xs font-semibold text-foreground/80 mb-2 block">LinkedIn URL</label>
                <input
                  id="linkedin"
                  type="url"
                  name="linkedin"
                  value={formData.linkedin}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-xl glass-input text-sm"
                  placeholder="https://linkedin.com/in/username"
                />
              </div>

              {/* Twitter */}
              <div>
                <label htmlFor="twitter" className="text-xs font-semibold text-foreground/80 mb-2 block">Twitter URL</label>
                <input
                  id="twitter"
                  type="url"
                  name="twitter"
                  value={formData.twitter}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-xl glass-input text-sm"
                  placeholder="https://twitter.com/username"
                />
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="text-xs font-semibold text-foreground/80 mb-2 block">Public Contact Email</label>
                <input
                  id="email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-xl glass-input text-sm"
                  placeholder="hello@example.com"
                />
              </div>

            </div>

            {/* Save Button */}
            <button
              type="submit"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-primary text-primary-foreground font-semibold shadow-md shadow-primary/10 hover:shadow-lg hover:shadow-primary/20 hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer mt-4 ml-auto"
            >
              <Save size={16} />
              <span>Save Changes</span>
            </button>

          </div>
        </div>

      </form>
    </div>
  );
}
