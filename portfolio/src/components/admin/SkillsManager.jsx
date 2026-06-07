import React, { useState, useEffect } from 'react';
import { 
  Brain, Plus, Pencil, Trash2, ArrowUp, ArrowDown, Save, X, CheckCircle, AlertCircle, Star 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function SkillsManager() {
  const { API_BASE, token } = useAuth();
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState({ type: null, message: '' });

  // Form controls
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    category: 'Technical',
    level: 'Expert',
    icon: 'Code',
    description: '',
    isFeatured: false,
    order: 0
  });

  const categories = ['Technical', 'Programming Languages', 'Frameworks', 'Tools', 'Soft Skills', 'Certifications', 'Languages'];
  const levels = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];

  const fetchSkills = () => {
    setLoading(true);
    fetch(`${API_BASE}/skills`)
      .then((res) => res.json())
      .then((data) => {
        if (data) {
          setSkills(data.sort((a, b) => a.order - b.order));
        }
      })
      .catch((err) => {
        console.error(err);
        setStatus({ type: 'error', message: 'Unable to fetch skills list.' });
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchSkills();
  }, [API_BASE]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleOpenAdd = () => {
    setFormData({
      name: '',
      category: 'Technical',
      level: 'Expert',
      icon: 'Code',
      description: '',
      isFeatured: false,
      order: skills.length
    });
    setEditId(null);
    setIsEditing(true);
    setStatus({ type: null, message: '' });
  };

  const handleOpenEdit = (skill) => {
    setFormData({
      name: skill.name || '',
      category: skill.category || 'Technical',
      level: skill.level || 'Expert',
      icon: skill.icon || 'Code',
      description: skill.description || '',
      isFeatured: skill.isFeatured || false,
      order: skill.order || 0
    });
    setEditId(skill._id);
    setIsEditing(true);
    setStatus({ type: null, message: '' });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setStatus({ type: null, message: '' });

    if (!formData.name) {
      setStatus({ type: 'error', message: 'Skill name is required.' });
      return;
    }

    try {
      const url = editId
        ? `${API_BASE}/admin/skills/${editId}`
        : `${API_BASE}/admin/skills`;
      
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
        message: editId ? 'Skill edited successfully.' : 'New skill created successfully!'
      });
      fetchSkills();
    } catch (err) {
      console.error(err);
      setStatus({ type: 'error', message: err.message });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this skill?')) return;
    setStatus({ type: null, message: '' });

    try {
      const res = await fetch(`${API_BASE}/admin/skills/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Delete operation failed.');

      setStatus({ type: 'success', message: 'Skill removed successfully.' });
      fetchSkills();
    } catch (err) {
      console.error(err);
      setStatus({ type: 'error', message: err.message });
    }
  };

  // Reordering helpers (Shift Up/Down)
  const handleMoveOrder = async (index, direction) => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === skills.length - 1) return;

    setStatus({ type: null, message: '' });
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    const skillA = skills[index];
    const skillB = skills[targetIdx];

    // Swap order locally
    const tempOrder = skillA.order;
    skillA.order = skillB.order;
    skillB.order = tempOrder;

    try {
      // Send PUT requests to save orders in database
      await Promise.all([
        fetch(`${API_BASE}/admin/skills/${skillA._id}/reorder`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({ order: skillA.order })
        }),
        fetch(`${API_BASE}/admin/skills/${skillB._id}/reorder`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({ order: skillB.order })
        })
      ]);

      fetchSkills();
    } catch (err) {
      console.error('Reordering failed:', err);
      setStatus({ type: 'error', message: 'Failed to update order in database.' });
    }
  };

  return (
    <div className="text-left animate-fade-in">

      {/* Header Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Skills Manager</h1>
          <p className="text-sm text-muted-foreground mt-1">Add, edit, delete, or organize your list of competencies.</p>
        </div>
        {!isEditing && (
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold shadow-md hover:-translate-y-0.5 transition-all cursor-pointer"
          >
            <Plus size={16} />
            <span>Add Skill</span>
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
              <Brain size={20} className="text-primary dark:text-violet-400" />
              <span>{editId ? 'Edit Skill Details' : 'Create New Skill'}</span>
            </h2>
            <button
              onClick={() => setIsEditing(false)}
              className="p-1.5 rounded-lg text-foreground/75 hover:bg-black/5 dark:hover:bg-white/5"
            >
              <X size={18} />
            </button>
          </div>

          <form onSubmit={handleFormSubmit} className="flex flex-col gap-5 max-w-2xl">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              
              {/* Skill Name */}
              <div>
                <label htmlFor="name" className="text-xs font-semibold text-foreground/80 mb-2 block">Skill Name *</label>
                <input
                  id="name"
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-xl glass-input text-sm"
                  placeholder="JavaScript"
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
                  {categories.map((cat) => (
                    <option key={cat} value={cat} className="bg-background text-foreground">{cat}</option>
                  ))}
                </select>
              </div>

            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              
              {/* Level */}
              <div>
                <label htmlFor="level" className="text-xs font-semibold text-foreground/80 mb-2 block">Proficiency Level *</label>
                <select
                  id="level"
                  name="level"
                  value={formData.level}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-xl glass-input text-sm cursor-pointer"
                >
                  {levels.map((lvl) => (
                    <option key={lvl} value={lvl} className="bg-background text-foreground">{lvl}</option>
                  ))}
                </select>
              </div>

              {/* Icon Name */}
              <div>
                <label htmlFor="icon" className="text-xs font-semibold text-foreground/80 mb-2 block">Lucide Icon Name</label>
                <input
                  id="icon"
                  type="text"
                  name="icon"
                  value={formData.icon}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-xl glass-input text-sm font-mono text-xs"
                  placeholder="Code, Server, Database, Globe..."
                />
              </div>

            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="text-xs font-semibold text-foreground/80 mb-2 block">Short Description</label>
              <textarea
                id="description"
                name="description"
                rows="3"
                value={formData.description}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-xl glass-input text-sm resize-none"
                placeholder="Brief description of experience or projects worked on..."
              ></textarea>
            </div>

            {/* Checkboxes: Featured / Core Tech */}
            <div className="flex items-center gap-2 mt-2">
              <input
                id="isFeatured"
                type="checkbox"
                name="isFeatured"
                checked={formData.isFeatured}
                onChange={handleInputChange}
                className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
              />
              <label htmlFor="isFeatured" className="text-xs font-semibold text-foreground/80 cursor-pointer flex items-center gap-1.5">
                <Star size={14} className="text-amber-500 fill-amber-500" />
                <span>Featured / Highlight as Core Tech</span>
              </label>
            </div>

            {/* Form actions */}
            <div className="flex gap-3 justify-end mt-4">
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
                <span>Save Skill</span>
              </button>
            </div>
          </form>
        </div>
      ) : (
        /* List Table View */
        <div className="glass-panel rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-black/10 dark:bg-white/5 text-xs font-semibold uppercase tracking-wider text-muted-foreground border-b border-white/5">
                  <th className="px-6 py-4">Sort</th>
                  <th className="px-6 py-4">Name</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Level</th>
                  <th className="px-6 py-4 text-center">Featured</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-sm">
                {skills.map((skill, idx) => (
                  <tr key={skill._id || idx} className="hover:bg-black/[0.02] dark:hover:bg-white/[0.01] transition-colors">
                    {/* Reorder column */}
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
                          disabled={idx === skills.length - 1}
                          onClick={() => handleMoveOrder(idx, 'down')}
                          className="p-1 rounded hover:bg-black/5 dark:hover:bg-white/5 text-foreground/60 disabled:opacity-30 disabled:pointer-events-none"
                          title="Move Down"
                        >
                          <ArrowDown size={14} />
                        </button>
                      </div>
                    </td>

                    {/* Skill Name */}
                    <td className="px-6 py-4 font-bold">{skill.name}</td>

                    {/* Category */}
                    <td className="px-6 py-4">
                      <span className="px-2 py-0.5 rounded text-[10px] uppercase font-semibold bg-black/10 dark:bg-white/10 text-foreground/80">
                        {skill.category}
                      </span>
                    </td>

                    {/* Level */}
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-0.5 rounded text-xs font-semibold bg-primary/10 text-primary dark:text-violet-400">
                        {skill.level}
                      </span>
                    </td>

                    {/* Featured status indicator */}
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center">
                        {skill.isFeatured ? (
                          <Star size={16} className="text-amber-500 fill-amber-500" title="Featured core tech" />
                        ) : (
                          <span className="text-muted-foreground/30 font-semibold">—</span>
                        )}
                      </div>
                    </td>

                    {/* Action buttons */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenEdit(skill)}
                          className="p-2 rounded-xl text-foreground/75 hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
                          title="Edit Skill"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(skill._id)}
                          className="p-2 rounded-xl text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer"
                          title="Delete Skill"
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
          {skills.length === 0 && (
            <div className="text-center py-16 text-muted-foreground">
              <Brain size={40} className="mx-auto opacity-35 mb-2" />
              <p className="text-sm font-semibold">No Skills Added Yet.</p>
              <button
                onClick={handleOpenAdd}
                className="text-xs text-primary font-bold hover:underline mt-1 block mx-auto cursor-pointer"
              >
                Create the first skill entry
              </button>
            </div>
          )}

        </div>
      )}

    </div>
  );
}
