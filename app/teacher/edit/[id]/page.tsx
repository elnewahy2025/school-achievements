'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/components/AuthContext';
import { useSettings } from '@/components/SettingsContext';
import DeleteModal from '@/components/DeleteModal';
import { Save, X, FileText, Image as ImageIcon, Upload, Loader2, Trash2 } from 'lucide-react';

interface FileRecord { id: number; file_type: string; original_name: string; stored_name: string; mime_type: string; size: number; }
interface Achievement { id: number; title: string; description: string; department: string; teacher_id: number | null; teacher_name: string; event_date: string | null; created_at: string; files: FileRecord[]; }

export default function EditAchievement() {
  const { user, loading: authLoading } = useAuth();
  const { t } = useSettings();
  const router = useRouter();
  const params = useParams();
  const achievementId = params?.id as string;
  const [departments, setDepartments] = useState<any[]>([]);
  const [form, setForm] = useState({ title: '', description: '', department: '', event_date: '' });
  const [existingFiles, setExistingFiles] = useState<FileRecord[]>([]);
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [deleteFileModal, setDeleteFileModal] = useState<{ open: boolean; file: FileRecord | null }>({ open: false, file: null });
  const [deletingFile, setDeletingFile] = useState(false);

  useEffect(() => { if (!authLoading && !user) router.push('/login'); }, [authLoading, user, router]);
  useEffect(() => { fetch('/api/departments').then((r) => r.json()).then(setDepartments).catch(() => {}); }, []);

  const fetchAchievement = useCallback(async () => {
    if (!achievementId) return;
    try {
      const res = await fetch('/api/achievements');
      const data: Achievement[] = await res.json();
      const a = data.find((x) => x.id === parseInt(achievementId));
      if (a) { setForm({ title: a.title, description: a.description, department: a.department, event_date: a.event_date || '' }); setExistingFiles(a.files); }
    } catch {} finally { setLoading(false); }
  }, [achievementId]);
  useEffect(() => { fetchAchievement(); }, [fetchAchievement]);

  const validateFile = (file: File): string | null => {
    const imageTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (imageTypes.includes(file.type)) { if (file.size > 10 * 1024 * 1024) return `${file.name}: Image must be under 10MB`; }
    else if (file.type === 'application/pdf') { if (file.size > 20 * 1024 * 1024) return `${file.name}: PDF must be under 20MB`; }
    else return `${file.name}: Invalid file type`;
    return null;
  };

  const handleFiles = (fl: FileList | File[]) => {
    const arr = Array.from(fl);
    for (const f of arr) { const err = validateFile(f); if (err) { alert(err); return; } }
    setNewFiles((prev) => [...prev, ...arr]);
  };

  const handleDeleteFile = async () => {
    if (!deleteFileModal.file) return;
    setDeletingFile(true);
    try {
      const res = await fetch(`/api/achievements/${achievementId}/files/${deleteFileModal.file.id}`, { method: 'DELETE' });
      if (!res.ok) { const data = await res.json(); throw new Error(data.error); }
      setExistingFiles((prev) => prev.filter((f) => f.id !== deleteFileModal.file!.id));
      setDeleteFileModal({ open: false, file: null });
    } catch (err: any) { alert(err.message || t('error.deleteFailed')); } finally { setDeletingFile(false); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) { setError(t('form.title')); return; }
    if (!form.department) { setError(t('form.dept')); return; }
    setError('');
    setSaving(true);
    try {
      const res = await fetch('/api/achievements', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: parseInt(achievementId), ...form }) });
      if (!res.ok) { const data = await res.json(); throw new Error(data.error); }
      if (newFiles.length > 0) {
        const formData = new FormData();
        newFiles.forEach((file) => formData.append('files', file));
        await fetch(`/api/achievements/${achievementId}/upload`, { method: 'POST', body: formData });
      }
      router.push('/teacher/dashboard');
    } catch (err: any) { setError(err.message || t('error.saveFailed')); } finally { setSaving(false); }
  };

  if (authLoading || loading || !user) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 text-kahoot-purple animate-spin" /></div>;

  return (
    <div className="min-h-screen pb-16">
      <div className="bg-gradient-to-r from-kahoot-purple/20 to-kahoot-blue/20 border-b border-dark-600">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
          <h1 className="text-3xl font-black text-white">{t('form.edit')}</h1>
          <p className="text-gray-400 mt-2">{t('form.editDesc')}</p>
        </div>
      </div>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && <div className="bg-kahoot-red/10 border border-kahoot-red/30 rounded-xl p-4 text-kahoot-red text-sm">{error}</div>}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">{t('form.title')}</label>
            <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required
              className="w-full px-4 py-3 rounded-xl bg-dark-700 border border-dark-600 text-white placeholder-gray-400 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">{t('form.desc')}</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={4}
              className="w-full px-4 py-3 rounded-xl bg-dark-700 border border-dark-600 text-white placeholder-gray-400 text-sm resize-none" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">{t('form.dept')}</label>
              <select value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} required
                className="w-full px-4 py-3 rounded-xl bg-dark-700 border border-dark-600 text-white text-sm appearance-none">
                {departments.map((d: any) => (<option key={d.id} value={d.name}>{d.name}</option>))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">{t('form.eventDate')}</label>
              <input type="date" value={form.event_date} onChange={(e) => setForm({ ...form, event_date: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-dark-700 border border-dark-600 text-white text-sm" />
            </div>
          </div>
          {existingFiles.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">{t('form.currentFiles')}</label>
              <div className="space-y-2">
                {existingFiles.map((file) => (
                  <div key={file.id} className="flex items-center gap-3 p-3 rounded-xl bg-dark-700 border border-dark-600 group">
                    {file.file_type === 'image' ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={`/uploads/${achievementId}/${file.stored_name}`} alt={file.original_name} className="w-10 h-10 rounded-lg object-cover" />
                    ) : (<div className="w-10 h-10 rounded-lg bg-kahoot-red/20 flex items-center justify-center"><FileText className="w-5 h-5 text-kahoot-red" /></div>)}
                    <div className="flex-1 min-w-0"><p className="text-sm text-white truncate">{file.original_name}</p><p className="text-xs text-gray-500">{(file.size / 1024).toFixed(1)} KB</p></div>
                    <button type="button" onClick={() => setDeleteFileModal({ open: true, file })}
                      className="w-8 h-8 rounded-lg bg-dark-600 hover:bg-kahoot-red/20 flex items-center justify-center opacity-50 group-hover:opacity-100 transition-all shrink-0">
                      <Trash2 className="w-4 h-4 text-kahoot-red" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">{t('form.addMore')}</label>
            <div className={`border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer ${dragActive ? 'border-kahoot-purple bg-kahoot-purple/10' : 'border-dark-600 hover:border-dark-500'}`}
              onDragOver={(e) => { e.preventDefault(); setDragActive(true); }} onDragLeave={() => setDragActive(false)} onDrop={(e) => { e.preventDefault(); setDragActive(false); handleFiles(e.dataTransfer.files); }}
              onClick={() => document.getElementById('file-input-edit')?.click()}>
              <Upload className="w-8 h-8 text-gray-500 mx-auto mb-2" />
              <p className="text-gray-300 text-sm" dangerouslySetInnerHTML={{ __html: t('form.dragDropShort', { browse: `<span class="text-kahoot-purple">${t('form.browse')}</span>` }) }} />
              <p className="text-xs text-gray-500 mt-1">{t('form.fileHintShort')}</p>
              <input id="file-input-edit" type="file" multiple accept=".jpg,.jpeg,.png,.webp,.gif,.pdf" className="hidden"
                onChange={(e) => e.target.files && handleFiles(e.target.files)} />
            </div>
            {newFiles.length > 0 && (
              <div className="mt-3 space-y-2">
                {newFiles.map((file, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-dark-700 border border-dark-600">
                    {file.type.startsWith('image/') ? <ImageIcon className="w-5 h-5 text-kahoot-purple shrink-0" /> : <FileText className="w-5 h-5 text-kahoot-red shrink-0" />}
                    <div className="flex-1 min-w-0"><p className="text-sm text-white truncate">{file.name}</p><p className="text-xs text-gray-500">{(file.size / 1024).toFixed(1)} KB</p></div>
                    <button type="button" onClick={() => setNewFiles(newFiles.filter((_, j) => j !== i))} className="w-6 h-6 rounded-full bg-dark-600 hover:bg-kahoot-red/30 flex items-center justify-center"><X className="w-3 h-3 text-gray-400" /></button>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="flex gap-4 pt-4">
            <button type="submit" disabled={saving}
              className="flex-1 py-3 rounded-xl bg-gradient-to-r from-kahoot-purple to-kahoot-blue text-white font-bold text-sm hover:shadow-lg hover:shadow-kahoot-purple/30 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
              {saving ? (<><Loader2 className="w-4 h-4 animate-spin" />{t('form.saving')}</>) : (<><Save className="w-4 h-4" />{t('form.saveBtn')}</>)}
            </button>
            <button type="button" onClick={() => router.back()} className="px-6 py-3 rounded-xl bg-dark-700 text-gray-300 hover:bg-dark-600 hover:text-white transition-all text-sm">{t('form.cancel')}</button>
          </div>
        </form>
      </div>
      <DeleteModal isOpen={deleteFileModal.open} title={t('modal.delete')} message={`Delete "${deleteFileModal.file?.original_name}"?`} onConfirm={handleDeleteFile} onCancel={() => setDeleteFileModal({ open: false, file: null })} loading={deletingFile} />
    </div>
  );
}
