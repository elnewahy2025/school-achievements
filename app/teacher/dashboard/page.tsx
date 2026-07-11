'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthContext';
import { useSettings } from '@/components/SettingsContext';
import DeleteModal from '@/components/DeleteModal';
import { Plus, Award, FolderOpen, Users, Trash2, Edit3, FileText, Loader2 } from 'lucide-react';

interface FileRecord { id: number; file_type: string; original_name: string; stored_name: string; mime_type: string; size: number; }
interface Achievement { id: number; title: string; description: string; department: string; teacher_id: number | null; teacher_name: string; event_date: string | null; created_at: string; files: FileRecord[]; }

export default function TeacherDashboard() {
  const { user, loading: authLoading } = useAuth();
  const { t } = useSettings();
  const router = useRouter();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; achievement: Achievement | null }>({ open: false, achievement: null });
  const [deleting, setDeleting] = useState(false);

  useEffect(() => { if (!authLoading && !user) router.push('/login'); }, [authLoading, user, router]);
  useEffect(() => { if (user) fetch('/api/achievements').then((r) => r.json()).then(setAchievements).catch(() => {}).finally(() => setLoading(false)); }, [user]);

  const handleDelete = async () => {
    if (!deleteModal.achievement) return;
    setDeleting(true);
    try {
      await fetch(`/api/achievements/${deleteModal.achievement.id}/delete`, { method: 'POST' });
      setAchievements(achievements.filter((a) => a.id !== deleteModal.achievement!.id));
      setDeleteModal({ open: false, achievement: null });
    } catch { alert(t('error.deleteFailed')); } finally { setDeleting(false); }
  };

  if (authLoading || !user) return <div className="min-h-[calc(100vh-64px)] flex items-center justify-center"><Loader2 className="w-8 h-8 text-kahoot-purple animate-spin" /></div>;

  const isAdmin = user.is_admin === 1;
  const myAchievements = achievements.filter((a) => a.teacher_id === user.id);
  const deptAchievements = achievements.filter((a) => a.department === user.department);
  const totalFiles = achievements.reduce((sum, a) => sum + a.files.length, 0);
  const canEdit = (a: Achievement) => isAdmin || a.teacher_id === user.id;

  const stats = [
    { label: t('dash.totalAch'), value: achievements.length, icon: Award, color: 'from-kahoot-purple to-pink-500' },
    { label: t('dash.myAch'), value: myAchievements.length, icon: Users, color: 'from-kahoot-blue to-cyan-500' },
    { label: t('dash.department'), value: deptAchievements.length, icon: FolderOpen, color: 'from-kahoot-green to-emerald-500' },
    { label: t('dash.totalFiles'), value: totalFiles, icon: FileText, color: 'from-kahoot-orange to-yellow-500' },
  ];

  return (
    <div className="min-h-screen pb-16">
      <div className="bg-gradient-to-r from-kahoot-purple/20 to-kahoot-blue/20 border-b border-dark-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-black text-white mb-2">{t('dash.welcome', { name: user.full_name })}</h1>
              <div className="flex items-center gap-3">
                <span className="dept-badge px-3 py-1 rounded-full text-xs font-bold text-white">{user.department}</span>
                <span className="text-gray-400 text-sm">{isAdmin ? t('dash.adminBadge') : t('dash.teacherBadge')}</span>
              </div>
            </div>
            <button onClick={() => router.push('/teacher/create')}
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-kahoot-purple to-kahoot-blue text-white font-bold text-sm hover:shadow-lg hover:shadow-kahoot-purple/30 transition-all">
              <Plus className="w-5 h-5" />{t('dash.newAchievement')}
            </button>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat) => (
            <div key={stat.label} className="bg-dark-800 rounded-2xl border border-dark-600 p-5 card-hover">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-lg`}><stat.icon className="w-6 h-6 text-white" /></div>
                <div><p className="text-2xl font-black text-white">{stat.value}</p><p className="text-xs text-gray-400">{stat.label}</p></div>
              </div>
            </div>
          ))}
        </div>
        <div className="bg-dark-800 rounded-2xl border border-dark-600 overflow-hidden">
          <div className="p-5 border-b border-dark-600">
            <h2 className="text-lg font-bold text-white flex items-center gap-2"><Award className="w-5 h-5 text-kahoot-yellow" />{isAdmin ? t('dash.allAch') : t('dash.yourAch')}</h2>
          </div>
          {loading ? (
            <div className="p-8 text-center"><Loader2 className="w-8 h-8 text-kahoot-purple animate-spin mx-auto" /></div>
          ) : achievements.length === 0 ? (
            <div className="p-12 text-center">
              <Award className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-white mb-2">{t('dash.noTitle')}</h3>
              <p className="text-gray-400 text-sm mb-4">{t('dash.noDesc')}</p>
              <button onClick={() => router.push('/teacher/create')} className="px-5 py-2 rounded-xl bg-gradient-to-r from-kahoot-purple to-kahoot-blue text-white text-sm font-medium">{t('dash.createFirst')}</button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead><tr className="text-left text-xs text-gray-400 uppercase tracking-wider">
                  <th className="px-5 py-3">{t('dash.col.title')}</th>
                  <th className="px-5 py-3">{t('dash.col.dept')}</th>
                  <th className="px-5 py-3">{t('dash.col.date')}</th>
                  <th className="px-5 py-3">{t('dash.col.files')}</th>
                  <th className="px-5 py-3 text-right">{t('dash.col.actions')}</th>
                </tr></thead>
                <tbody className="divide-y divide-dark-600">
                  {achievements.map((a) => {
                    const editable = canEdit(a);
                    return (
                      <tr key={a.id} className="hover:bg-dark-700/50 transition-colors">
                        <td className="px-5 py-4"><div className="font-medium text-white text-sm">{a.title}</div><div className="text-xs text-gray-500">{a.teacher_name}</div></td>
                        <td className="px-5 py-4"><span className="dept-badge px-2 py-0.5 rounded-full text-xs text-white">{a.department}</span></td>
                        <td className="px-5 py-4 text-sm text-gray-400">{a.event_date ? new Date(a.event_date).toLocaleDateString() : '—'}</td>
                        <td className="px-5 py-4"><div className="flex items-center gap-1 text-sm text-gray-400"><FileText className="w-3 h-3" />{a.files.length}</div></td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2 justify-end">
                            {editable && (<>
                              <button onClick={() => router.push(`/teacher/edit/${a.id}`)} className="w-8 h-8 rounded-lg bg-kahoot-blue/20 hover:bg-kahoot-blue/30 flex items-center justify-center transition-colors"><Edit3 className="w-4 h-4 text-kahoot-blue" /></button>
                              <button onClick={() => setDeleteModal({ open: true, achievement: a })} className="w-8 h-8 rounded-lg bg-kahoot-red/20 hover:bg-kahoot-red/30 flex items-center justify-center transition-colors"><Trash2 className="w-4 h-4 text-kahoot-red" /></button>
                            </>)}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      <DeleteModal isOpen={deleteModal.open} title={t('modal.delete')} message={`Are you sure you want to delete "${deleteModal.achievement?.title}"?`} onConfirm={handleDelete} onCancel={() => setDeleteModal({ open: false, achievement: null })} loading={deleting} />
    </div>
  );
}
