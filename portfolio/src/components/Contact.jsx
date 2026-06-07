import React, { useState, useEffect } from 'react';
import { Mail, MapPin, Send, CheckCircle, AlertCircle } from 'lucide-react';
import { fallbackProfile } from '../data/fallback-data';
import { useAuth } from '../context/AuthContext';

export default function Contact() {
  const { API_BASE } = useAuth();
  const [profile, setProfile] = useState(fallbackProfile);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState({ type: null, message: '' }); // 'success', 'error', or null
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetch(`${API_BASE}/profile`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch');
        return res.json();
      })
      .then((data) => {
        if (data && data.name) {
          setProfile(data);
        }
      })
      .catch((err) => {
        console.warn('Unable to load contact profile from API, using fallback data:', err);
      });
  }, [API_BASE]);

  const validate = () => {
    const tempErrors = {};
    if (!formData.name.trim()) tempErrors.name = 'Name is required.';
    
    if (!formData.email.trim()) {
      tempErrors.email = 'Email is required.';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      tempErrors.email = 'Email address is invalid.';
    }

    if (!formData.message.trim()) tempErrors.message = 'Message is required.';
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    // Clear validation error when typing
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setStatus({ type: null, message: '' });

    try {
      const res = await fetch(`${API_BASE}/contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Something went wrong. Please try again.');
      }

      setStatus({ type: 'success', message: 'Thank you! Your message has been sent successfully.' });
      setFormData({ name: '', email: '', subject: '', message: '' }); // Reset form
    } catch (err) {
      console.error('Submit contact error:', err);
      setStatus({ type: 'error', message: err.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact" className="py-20 bg-black/5 dark:bg-black/20 relative">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">

        {/* Section Title */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-2">
            Get in <span className="text-gradient">Touch</span>
          </h2>
          <p className="text-sm text-muted-foreground">Feel free to reach out for collaborations, queries, or just a hello!</p>
          <div className="w-12 h-1 bg-primary mx-auto rounded-full mt-3"></div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Contact Details Panel */}
          <div className="lg:col-span-5 flex flex-col justify-between">
            <div className="text-left">
              <h3 className="text-2xl font-bold mb-4">Contact Info</h3>
              <p className="text-foreground/75 text-sm mb-8 leading-relaxed max-w-sm">
                Have an exciting project idea, looking to hire, or simply want to chat? Drop me a message, and I'll get back to you within 24 hours.
              </p>

              <div className="flex flex-col gap-6">
                
                {/* Email Address */}
                {profile.socialLinks && profile.socialLinks.email && (
                  <div className="flex items-center gap-4">
                    <div className="p-3.5 rounded-xl glass-panel text-primary dark:text-violet-400">
                      <Mail size={20} />
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground font-semibold">Email Me</div>
                      <a 
                        href={`mailto:${profile.socialLinks.email}`}
                        className="text-sm font-medium hover:text-primary dark:hover:text-violet-400 transition-colors"
                      >
                        {profile.socialLinks.email}
                      </a>
                    </div>
                  </div>
                )}

                {/* Location */}
                <div className="flex items-center gap-4">
                  <div className="p-3.5 rounded-xl glass-panel text-primary dark:text-violet-400">
                    <MapPin size={20} />
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground font-semibold">Location</div>
                    <div className="text-sm font-medium">{profile.location || 'Hyderabad, India'}</div>
                  </div>
                </div>

              </div>
            </div>

            {/* Bottom Graphic */}
            <div className="hidden lg:block text-left opacity-30 mt-12">
              <div className="text-sm font-mono tracking-widest text-primary dark:text-violet-400">DESIGNED BY HONEYSAI</div>
              <div className="text-[10px] font-mono tracking-widest mt-1">© ALL RIGHTS RESERVED</div>
            </div>
          </div>

          {/* Contact Form Panel */}
          <div className="lg:col-span-7">
            <div className="glass-panel p-8 rounded-2xl">
              
              {/* Feedback Toasts */}
              {status.type === 'success' && (
                <div className="mb-6 p-4 rounded-xl bg-green-500/15 border border-green-500/20 text-green-700 dark:text-green-400 flex items-start gap-3 text-left text-sm">
                  <CheckCircle size={18} className="flex-shrink-0 mt-0.5" />
                  <span>{status.message}</span>
                </div>
              )}
              {status.type === 'error' && (
                <div className="mb-6 p-4 rounded-xl bg-destructive/15 border border-destructive/20 text-destructive dark:text-red-400 flex items-start gap-3 text-left text-sm">
                  <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
                  <span>{status.message}</span>
                </div>
              )}

              {/* Form Element */}
              <form onSubmit={handleSubmit} className="flex flex-col gap-5 text-left">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  
                  {/* Name field */}
                  <div>
                    <label htmlFor="name" className="text-xs font-semibold text-foreground/80 mb-2 block">Your Name *</label>
                    <input
                      id="name"
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 rounded-xl glass-input text-sm ${errors.name ? 'border-destructive focus:ring-destructive' : ''}`}
                      placeholder="John Doe"
                    />
                    {errors.name && <span className="text-xs text-destructive mt-1 block font-medium">{errors.name}</span>}
                  </div>

                  {/* Email field */}
                  <div>
                    <label htmlFor="email" className="text-xs font-semibold text-foreground/80 mb-2 block">Your Email *</label>
                    <input
                      id="email"
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 rounded-xl glass-input text-sm ${errors.email ? 'border-destructive focus:ring-destructive' : ''}`}
                      placeholder="john@example.com"
                    />
                    {errors.email && <span className="text-xs text-destructive mt-1 block font-medium">{errors.email}</span>}
                  </div>

                </div>

                {/* Subject field */}
                <div>
                  <label htmlFor="subject" className="text-xs font-semibold text-foreground/80 mb-2 block">Subject</label>
                  <input
                    id="subject"
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-xl glass-input text-sm"
                    placeholder="Collaboration opportunity"
                  />
                </div>

                {/* Message field */}
                <div>
                  <label htmlFor="message" className="text-xs font-semibold text-foreground/80 mb-2 block">Message *</label>
                  <textarea
                    id="message"
                    name="message"
                    rows="5"
                    value={formData.message}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 rounded-xl glass-input text-sm resize-none ${errors.message ? 'border-destructive focus:ring-destructive' : ''}`}
                    placeholder="Write your message here..."
                  ></textarea>
                  {errors.message && <span className="text-xs text-destructive mt-1 block font-medium">{errors.message}</span>}
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-primary text-primary-foreground font-semibold shadow-md shadow-primary/10 hover:shadow-lg hover:shadow-primary/20 hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer mt-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin"></div>
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <Send size={16} />
                      <span>Send Message</span>
                    </>
                  )}
                </button>

              </form>

            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
