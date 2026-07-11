'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthContext';
import { Plus, X, FileText, Image as ImageIcon, Upload, Loader2 } from 'lucide-react';

export default function CreateAchievement() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [departments, setDepartments] = useState<any[]>([]);
  const [form, setForm] = useState({ title: '', description: '', department: '', event_date: '' });
  const [files, setFiles] = useState<File[]>([]);
  const [saving, setSaving] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!authLoading && !user) router.push('/login');
  }, [authLoading, user, router]);

  useEffect(() => {
    fetch('/api/departments').then((r) => r.json()).then(setDepartments).catch(() => {});
    if (user) setForm((f) => ({ ...f, department: user.department }));
  }, [user]);

  const validateFile = (file: File): string | null => {
    const imageTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    const pdfTypes = ['application/pdf'];
    if (imageTypes.includes(file.type)) {
      if (file.size > 10 * 1024 * 1024) return `${file.name}: Image must be under 10MB`;
    } else if (pdfTypes.includes(file.type)) {
      if (file.size > 20 * 1024 * 1024) return `${file.name}: PDF must be under 20MB`;
    } else {
      return `${file.name}: Invalid file type. Allowed: JPG, PNG, WebP, GIF, PDF`;
    }
    return null;
  };

  const handleFiles = (newFiles: FileList | File[]) => {
    const fileArray = Array.from(newFiles);
    for (const file of fileArray) {
      const err = validateFile(file);
      if (err) { alert(err); return; }
    }
    setFiles((prev) => [...prev, ...fileArray]);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) { setError('Title is required'); return; }
    if (!form.department) { setError('Department is required'); return; }
    setError('');
    setSaving(true);

    try {
      const res = await fetch('/api/achievements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      if (files.length > 0) {
        const formData = new FormData();
        files.forEach((file) => formData.append('files', file));
        await fetch(`/api/achievements/${data.id}/upload`, { method: 'POST', body: formData });
      }

      router.push('/teacher/dashboard');
    } catch (err: any) {
      setError(err.message || 'Failed to create achievement');
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || !user) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 text-kahoot-purple animate-spin" /></div>;
  }

  return (
    <div className="min-h-screen pb-16">
      <div className="bg-gradient-to-r from-kahoot-purple/20 to-kahoot-blue/20 border-b border-dark-600">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
          <h1 className="text-3xl font-black text-white">Create New Achievement</h1>
          <p className="text-gray-400 mt-2">Share your accomplishment with the school community</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-kahoot-red/10 border border-kahoot-red/30 rounded-xl p-4 text-kahoot-red text-sm">{error}</div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Title *</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
              className="w-full px-4 py-3 rounded-xl bg-dark-700 border border-dark-600 text-white placeholder-gray-400 text-sm"
              placeholder="e.g., Regional Science Fair First Place"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={4}
              className="w-full px-4 py-3 rounded-xl bg-dark-700 border border-dark-600 text-white placeholder-gray-400 text-sm resize-none"
              placeholder="Describe the achievement in detail..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Department *</label>
              <select
                value={form.department}
                onChange={(e) => setForm({ ...form, department: e.target.value })}
                required
                className="w-full px-4 py-3 rounded-xl bg-dark-700 border border-dark-600 text-white text-sm appearance-none"
              >
                <option value="">Select Department</option>
                {departments.map((d: any) => (
                  <option key={d.id} value={d.name}>{d.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Event Date</label>
              <input
                type="date"
                value={form.event_date}
                onChange={(e) => setForm({ ...form, event_date: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-dark-700 border border-dark-600 text-white text-sm"
              />
            </div>
          </div>

          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Files</label>
            <div
              className={`border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer ${
                dragActive ? 'border-kahoot-purple bg-kahoot-purple/10' : 'border-dark-600 hover:border-dark-500'
              }`}
              onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
              onDragLeave={() => setDragActive(false)}
              onDrop={handleDrop}
              onClick={() => document.getElementById('file-input')?.click()}
            >
              <Upload className="w-10 h-10 text-gray-500 mx-auto mb-3" />
              <p className="text-gray-300 text-sm">
                Drag & drop files here or <span className="text-kahoot-purple">browse</span>
              </p>
              <p className="text-xs text-gray-500 mt-2">
                Images (JPG, PNG, WebP, GIF) up to 10MB • PDFs up to 20MB
              </p>
              <input
                id="file-input"
                type="file"
                multiple
                accept=".jpg,.jpeg,.png,.webp,.gif,.pdf"
                className="hidden"
                onChange={(e) => e.target.files && handleFiles(e.target.files)}
              />
            </div>

            {/* Selected Files */}
            {files.length > 0 && (
              <div className="mt-4 space-y-2">
                {files.map((file, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-dark-700 border border-dark-600">
                    {file.type.startsWith('image/') ? (
                      <ImageIcon className="w-5 h-5 text-kahoot-purple shrink-0" />
                    ) : (
                      <FileText className="w-5 h-5 text-kahoot-red shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white truncate">{file.name}</p>
                      <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(1)} KB</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setFiles(files.filter((_, j) => j !== i))}
                      className="w-6 h-6 rounded-full bg-dark-600 hover:bg-kahoot-red/30 flex items-center justify-center"
                    >
                      <X className="w-3 h-3 text-gray-400" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-3 rounded-xl bg-gradient-to-r from-kahoot-purple to-kahoot-blue text-white font-bold text-sm hover:shadow-lg hover:shadow-kahoot-purple/30 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {saving ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Creating...</>
              ) : (
                <><Plus className="w-4 h-4" /> Create Achievement</>
              )}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-3 rounded-xl bg-dark-700 text-gray-300 hover:bg-dark-600 hover:text-white transition-all text-sm"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
