import React, { useState, useEffect } from 'react';
import { 
  FolderKanban, Plus, Pencil, Trash2, ArrowUp, ArrowDown, Save, X, Upload, CheckCircle, AlertCircle, Link as LinkIcon 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function ProjectsManager() {
  const { API_BASE, token } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState({ type: null, message: '' });
  
  // Form controls
  const [isEditing, setIsEditing] = useState(false); // true shows add/edit screen
  const [editId, setEditId] = useState(null); // null means adding new
  const [uploadingImage, setUploadingImage] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    tagsString: '',
    demoUrl: '',
    githubUrl: '',
    image: '',
    order: 0
  });

  const categoriesList = ['Frontend', 'Backend', 'Full-Stack', 'Mobile', 'UI/UX', 'Cloud', 'AI/Data Science'];

  const fetchProjects = () => {
    setLoading(true);
    fetch(`${API_BASE}/projects`)
      .then((res) => res.json())
      .then((data) => {
        if (data) {
          // Sort locally by order to guarantee visual alignment
          setProjects(data.sort((a, b) => a.order - b.order));
        }
      })
      .catch((err) => {
        console.error(err);
        setStatus({ type: 'error', message: 'Unable to fetch projects list.' });
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchProjects();
  }, [API_BASE]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Handle Project Image Upload
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
      if (!res.ok) throw new Error(data.message || 'Image upload failed.');

      setFormData((prev) => ({
        ...prev,
        image: data.url
      }));

      setStatus({ type: 'success', message: 'Project image uploaded successfully!' });
    } catch (err) {
      console.error(err);
      setStatus({ type: 'error', message: err.message });
    } finally {
      setUploadingImage(false);
    }
  };

  const handleOpenAdd = () => {
    setFormData({
      title: '',
      description: '',
      category: 'Frontend',
      tagsString: '',
      demoUrl: '',
      githubUrl: '',
      image: '',
      order: projects.length // default to bottom of list
    });
    setEditId(null);
    setIsEditing(true);
    setStatus({ type: null, message: '' });
  };

  const handleOpenEdit = (project) => {
    setFormData({
      title: project.title || '',
      description: project.description || '',
      category: project.category || 'Frontend',
      tagsString: project.tags ? project.tags.join(', ') : '',
      demoUrl: project.demoUrl || '',
      githubUrl: project.githubUrl || '',
      image: project.image || '',
      order: project.order || 0
    });
    setEditId(project._id);
    setIsEditing(true);
    setStatus({ type: null, message: '' });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setStatus({ type: null, message: '' });

    if (!formData.title || !formData.description || !formData.category) {
      setStatus({ type: 'error', message: 'Title, description, and category are required.' });
      return;
    }

    const tags = formData.tagsString
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    const payload = {
      ...formData,
      tags
    };

    try {
      const url = editId 
        ? `${API_BASE}/admin/projects/${editId}` 
        : `${API_BASE}/admin/projects`;
      
      const method = editId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Operation failed.');

      setIsEditing(false);
      setEditId(null);
      setStatus({ 
        type: 'success', 
        message: editId ? 'Project edited successfully.' : 'New project created successfully!' 
      });
      fetchProjects();
    } catch (err) {
      console.error(err);
      setStatus({ type: 'error', message: err.message });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this project?')) return;
    setStatus({ type: null, message: '' });

    try {
      const res = await fetch(`${API_BASE}/admin/projects/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Delete operation failed.');

      setStatus({ type: 'success', message: 'Project removed successfully.' });
      fetchProjects();
    } catch (err) {
      console.error(err);
      setStatus({ type: 'error', message: err.message });
    }
  };

  // Reordering helpers (Shift Up/Down)
  const handleMoveOrder = async (index, direction) => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === projects.length - 1) return;

    setStatus({ type: null, message: '' });
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    const projectA = projects[index];
    const projectB = projects[targetIdx];

    // Swap order property values
    const tempOrder = projectA.order;
    projectA.order = projectB.order;
    projectB.order = tempOrder;

    try {
      // Send PUT requests to save both orders
      await Promise.all([
        fetch(`${API_BASE}/admin/projects/${projectA._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({ order: projectA.order })
        }),
        fetch(`${API_BASE}/admin/projects/${projectB._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({ order: projectB.order })
        })
      ]);

      fetchProjects();
    } catch (err) {
      console.error('Reordering failed:', err);
      setStatus({ type: 'error', message: 'Failed to update order in database.' });
    }
  };

  const getMediaUrl = (pathString) => {
    if (!pathString) return '';
    if (pathString.startsWith('http') || pathString.startsWith('data:')) return pathString;
    return `${API_BASE.replace('/api', '')}${pathString}`;
  };

  return (
    <div className="text-left animate-fade-in">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Projects Manager</h1>
          <p className="text-sm text-muted-foreground mt-1">Add, edit, delete, or sort display order of projects showcase.</p>
        </div>
        {!isEditing && (
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold shadow-md hover:-translate-y-0.5 transition-all cursor-pointer"
          >
            <Plus size={16} />
            <span>Add Project</span>
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
        /* Edit / Create Form View */
        <div className="glass-panel p-8 rounded-3xl">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/5">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <FolderKanban size={20} className="text-primary dark:text-violet-400" />
              <span>{editId ? 'Edit Project Details' : 'Create New Project'}</span>
            </h2>
            <button
              onClick={() => setIsEditing(false)}
              className="p-1.5 rounded-lg text-foreground/75 hover:bg-black/5 dark:hover:bg-white/5"
            >
              <X size={18} />
            </button>
          </div>

          <form onSubmit={handleFormSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Col: Upload and preview image */}
            <div className="lg:col-span-4 flex flex-col gap-6">
              <div className="glass-panel p-6 rounded-2xl flex flex-col items-center">
                <label className="text-xs font-semibold text-foreground/80 mb-4 w-full text-left">Project Cover Image</label>
                
                <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-muted border border-white/10 mb-4 flex items-center justify-center">
                  {formData.image ? (
                    <img
                      src={getMediaUrl(formData.image)}
                      alt="Project Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <FolderKanban size={32} className="text-muted-foreground/35" />
                  )}
                  {uploadingImage && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                      <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    </div>
                  )}
                </div>

                <label className="w-full py-2.5 rounded-xl border border-dashed border-white/20 hover:border-primary/50 flex items-center justify-center gap-2 cursor-pointer text-xs font-semibold hover:bg-black/5 dark:hover:bg-white/5 transition-all">
                  <Upload size={14} />
                  <span>Choose Image</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Direct image URL uploader */}
              <div>
                <label htmlFor="image" className="text-xs font-semibold text-foreground/80 mb-2 block">Or Image URL</label>
                <input
                  id="image"
                  type="text"
                  name="image"
                  value={formData.image}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-xl glass-input text-sm"
                  placeholder="https://example.com/photo.jpg"
                />
              </div>
            </div>

            {/* Right Col: Fields form */}
            <div className="lg:col-span-8 flex flex-col gap-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                
                {/* Title */}
                <div>
                  <label htmlFor="title" className="text-xs font-semibold text-foreground/80 mb-2 block">Project Title *</label>
                  <input
                    id="title"
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-xl glass-input text-sm"
                    placeholder="E-Commerce API"
                    required
                  />
                </div>

                {/* Category */}
                <div>
                  <label htmlFor="category" className="text-xs font-semibold text-foreground/80 mb-2 block">Category *</label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-xl glass-input text-sm cursor-pointer"
                  >
                    {categoriesList.map((cat) => (
                      <option key={cat} value={cat} className="bg-background text-foreground">{cat}</option>
                    ))}
                  </select>
                </div>

              </div>

              {/* Description */}
              <div>
                <label htmlFor="description" className="text-xs font-semibold text-foreground/80 mb-2 block">Description *</label>
                <textarea
                  id="description"
                  name="description"
                  rows="4"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-xl glass-input text-sm resize-none"
                  placeholder="Describe your project, technologies, features..."
                  required
                ></textarea>
              </div>

              {/* Tags */}
              <div>
                <label htmlFor="tagsString" className="text-xs font-semibold text-foreground/80 mb-2 block">Tech Stack Tags (comma-separated)</label>
                <input
                  id="tagsString"
                  type="text"
                  name="tagsString"
                  value={formData.tagsString}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-xl glass-input text-sm font-mono text-xs"
                  placeholder="React, Node.js, Express, MongoDB, Tailwind"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                
                {/* Demo Url */}
                <div>
                  <label htmlFor="demoUrl" className="text-xs font-semibold text-foreground/80 mb-2 block">Live Demo Link</label>
                  <input
                    id="demoUrl"
                    type="url"
                    name="demoUrl"
                    value={formData.demoUrl}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-xl glass-input text-sm"
                    placeholder="https://example.com"
                  />
                </div>

                {/* Github Url */}
                <div>
                  <label htmlFor="githubUrl" className="text-xs font-semibold text-foreground/80 mb-2 block">GitHub Source Link</label>
                  <input
                    id="githubUrl"
                    type="url"
                    name="githubUrl"
                    value={formData.githubUrl}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-xl glass-input text-sm"
                    placeholder="https://github.com/myfriend/repo"
                  />
                </div>

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
                  <span>Save Project</span>
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
                  <th className="px-6 py-4">Order</th>
                  <th className="px-6 py-4">Image</th>
                  <th className="px-6 py-4">Title</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Links</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-sm">
                {projects.map((project, idx) => (
                  <tr key={project._id || idx} className="hover:bg-black/[0.02] dark:hover:bg-white/[0.01] transition-colors">
                    {/* Reordering column */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        <button
                          disabled={idx === 0}
                          onClick={() => handleMoveOrder(idx, 'up')}
                          className="p-1 rounded hover:bg-black/5 dark:hover:bg-white/5 text-foreground/60 disabled:opacity-30 disabled:pointer-events-none"
                          title="Move Up"
                        >
                          <ArrowUp size={14} />
                        </button>
                        <button
                          disabled={idx === projects.length - 1}
                          onClick={() => handleMoveOrder(idx, 'down')}
                          className="p-1 rounded hover:bg-black/5 dark:hover:bg-white/5 text-foreground/60 disabled:opacity-30 disabled:pointer-events-none"
                          title="Move Down"
                        >
                          <ArrowDown size={14} />
                        </button>
                      </div>
                    </td>

                    {/* Image cover column */}
                    <td className="px-6 py-4">
                      <div className="w-14 h-9 rounded bg-muted overflow-hidden border border-white/10">
                        {project.image ? (
                          <img
                            src={getMediaUrl(project.image)}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                            <FolderKanban size={14} />
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Title */}
                    <td className="px-6 py-4 font-bold max-w-[200px] truncate">{project.title}</td>
                    
                    {/* Category */}
                    <td className="px-6 py-4">
                      <span className="px-2 py-0.5 rounded text-xs font-semibold bg-primary/10 text-primary dark:text-violet-400">
                        {project.category}
                      </span>
                    </td>

                    {/* Links */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {project.githubUrl && (
                          <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className="p-1 text-foreground/60 hover:text-foreground" title="Source Code">
                            <ArrowUp size={14} className="rotate-45" />
                          </a>
                        )}
                        {project.demoUrl && (
                          <a href={project.demoUrl} target="_blank" rel="noopener noreferrer" className="p-1 text-foreground/60 hover:text-foreground" title="Live Demo">
                            <LinkIcon size={14} />
                          </a>
                        )}
                      </div>
                    </td>

                    {/* Action Buttons column */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenEdit(project)}
                          className="p-2 rounded-xl text-foreground/75 hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
                          title="Edit Project"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(project._id)}
                          className="p-2 rounded-xl text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer"
                          title="Delete Project"
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

          {/* Empty State */}
          {projects.length === 0 && (
            <div className="text-center py-16 text-muted-foreground">
              <FolderKanban size={40} className="mx-auto opacity-35 mb-2" />
              <p className="text-sm font-semibold">No Projects Created Yet.</p>
              <button
                onClick={handleOpenAdd}
                className="text-xs text-primary font-bold hover:underline mt-1 block mx-auto cursor-pointer"
              >
                Create the first project
              </button>
            </div>
          )}

        </div>
      )}

    </div>
  );
}
