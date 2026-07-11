'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthContext';
import { useSettings } from '@/components/SettingsContext';
import DeleteModal from '@/components/DeleteModal';
import { Shield, Settings, FolderPlus, Users, Save, Plus, Trash2, Loader2, AlertCircle } from 'lucide-react';

export default function AdminPage() {
  const { user, loading: authLoading } = useAuth();
  const { t } = useSettings();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'settings' | 'departments' | 'teachers'>('settings');
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [settingsSaving, setSettingsSaving] = useState(false);
  const [settingsMsg, setSettingsMsg] = useState({ type: '', text: '' });
  const [departments, setDepartments] = useState<any[]>([]);
  const [newDept, setNewDept] = useState('');
  const [deptSaving, setDeptSaving] = useState(false);
  const [deleteDept, setDeleteDept] = useState<{ open: boolean; dept: any }>({ open: false, dept: null });
  const [teachers, setTeachers] = useState<any[]>([]);
  const [showTeacherForm, setShowTeacherForm] = useState(false);
  const [teacherForm, setTeacherForm] = useState({ username: '', password: '', full_name: '', department: '', is_admin: false });
  const [teacherSaving, setTeacherSaving] = useState(false);
  const [teacherMsg, setTeacherMsg] = useState({ type: '', text: '' });

  useEffect(() => { if (!authLoading && (!user || user.is_admin !== 1)) router.push('/login'); }, [authLoading, user, router]);
  useEffect(() => {
    if (user?.is_admin === 1) {
      fetch('/api/settings').then((r) => r.json()).then(setSettings).catch(() => {});
      fetch('/api/departments').then((r) => r.json()).then(setDepartments).catch(() => {});
      fetch('/api/teachers').then((r) => r.json()).then(setTeachers).catch(() => {});
    }
  }, [user]);

  const handleSaveSettings = async () => {
    setSettingsSaving(true); setSettingsMsg({ type: '', text: '' });
    try {
      const res = await fetch('/api/settings', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(settings) });
      if (!res.ok) throw new Error('Failed');
      const data = await res.json(); setSettings(data);
      setSettingsMsg({ type: 'success', text: t('admin.settingsSaved') });
      setTimeout(() => setSettingsMsg({ type: '', text: '' }), 3000);
    } catch { setSettingsMsg({ type: 'error', text: t('error.saveFailed') }); } finally { setSettingsSaving(false); }
  };

  const handleAddDept = async () => {
    if (!newDept.trim()) return; setDeptSaving(true);
    try {
      const res = await fetch('/api/departments', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: newDept.trim() }) });
      const data = await res.json();
      if (!res.ok) { alert(data.error); return; }
      setDepartments([...departments, data]); setNewDept('');
    } catch { alert(t('error.saveFailed')); } finally { setDeptSaving(false); }
  };

  const handleDeleteDept = async () => {
    if (!deleteDept.dept) return;
    try {
      const res = await fetch('/api/departments', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: deleteDept.dept.id }) });
      const data = await res.json();
      if (!res.ok) { alert(data.error); return; }
      setDepartments(departments.filter((d) => d.id !== deleteDept.dept.id));
      setDeleteDept({ open: false, dept: null });
    } catch { alert(t('error.deleteFailed')); }
  };

  const handleCreateTeacher = async () => {
    if (!teacherForm.username || !teacherForm.password || !teacherForm.full_name || !teacherForm.department) { setTeacherMsg({ type: 'error', text: 'All fields required' }); return; }
    setTeacherSaving(true); setTeacherMsg({ type: '', text: '' });
    try {
      const res = await fetch('/api/teachers', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(teacherForm) });
      const data = await res.json(); if (!res.ok) throw new Error(data.error);
      setTeachers([...teachers, data]); setTeacherForm({ username: '', password: '', full_name: '', department: '', is_admin: false }); setShowTeacherForm(false);
      setTeacherMsg({ type: 'success', text: '✅' }); setTimeout(() => setTeacherMsg({ type: '', text: '' }), 3000);
    } catch (err: any) { setTeacherMsg({ type: 'error', text: err.message || t('error.saveFailed') }); } finally { setTeacherSaving(false); }
  };

  if (authLoading || !user || user.is_admin !== 1) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 text-kahoot-red animate-spin" /></div>;

  const tabs = [
    { id: 'settings' as const, label: t('admin.tabSettings'), icon: Settings },
    { id: 'departments' as const, label: t('admin.tabDepts'), icon: FolderPlus },
    { id: 'teachers' as const, label: t('admin.tabTeachers'), icon: Users },
  ];

  return (
    <div className="min-h-screen pb-16">
      <div className="bg-gradient-to-r from-kahoot-red/20 to-kahoot-orange/20 border-b border-dark-600">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-kahoot-red to-kahoot-orange flex items-center justify-center shadow-lg"><Shield className="w-6 h-6 text-white" /></div>
            <div><h1 className="text-3xl font-black text-white">{t('admin.title')}</h1><p className="text-gray-400 text-sm">{t('admin.subtitle')}</p></div>
          </div>
        </div>
      </div>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex gap-1 mb-8 bg-dark-800 rounded-xl p-1 border border-dark-600">
          {tabs.map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg text-sm font-medium transition-all ${activeTab === tab.id ? 'bg-gradient-to-r from-kahoot-purple to-kahoot-blue text-white shadow-lg' : 'text-gray-400 hover:text-white hover:bg-dark-700'}`}>
              <tab.icon className="w-4 h-4" /><span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        {activeTab === 'settings' && (
          <div className="bg-dark-800 rounded-2xl border border-dark-600 p-6 animate-fade-in">
            <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2"><Settings className="w-5 h-5 text-kahoot-yellow" />{t('admin.schoolInfo')}</h2>
            {settingsMsg.text && (<div className={`mb-6 p-4 rounded-xl text-sm flex items-center gap-2 ${settingsMsg.type === 'success' ? 'bg-kahoot-green/10 border border-kahoot-green/30 text-kahoot-green' : 'bg-kahoot-red/10 border border-kahoot-red/30 text-kahoot-red'}`}>{settingsMsg.type === 'error' && <AlertCircle className="w-4 h-4 shrink-0" />}{settingsMsg.text}</div>)}
            <div className="space-y-5">
              {[
                { key: 'school_name', label: t('admin.schoolName'), placeholder: 'My Amazing School' },
                { key: 'manager_name', label: t('admin.managerName'), placeholder: 'Dr. John Smith' },
                { key: 'tagline', label: t('admin.tagline'), placeholder: 'Celebrating Academic Excellence' },
                { key: 'phone', label: t('admin.phone'), placeholder: '+1 (555) 123-4567' },
                { key: 'address', label: t('admin.address'), placeholder: '123 Education St' },
                { key: 'logo_url', label: t('admin.logoUrl'), placeholder: 'https://example.com/logo.png' },
              ].map((field) => (
                <div key={field.key}>
                  <label className="block text-sm font-medium text-gray-300 mb-2">{field.label}</label>
                  <input type="text" value={settings[field.key] || ''} onChange={(e) => setSettings({ ...settings, [field.key]: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-dark-700 border border-dark-600 text-white placeholder-gray-500 text-sm" placeholder={field.placeholder} />
                </div>
              ))}
              <button onClick={handleSaveSettings} disabled={settingsSaving}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-kahoot-green to-emerald-600 text-white font-bold text-sm hover:shadow-lg hover:shadow-kahoot-green/30 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                {settingsSaving ? (<><Loader2 className="w-4 h-4 animate-spin" /></>) : (<><Save className="w-4 h-4" />{t('admin.saveSettings')}</>)}
              </button>
            </div>
          </div>
        )}

        {activeTab === 'departments' && (
          <div className="bg-dark-800 rounded-2xl border border-dark-600 p-6 animate-fade-in">
            <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2"><FolderPlus className="w-5 h-5 text-kahoot-yellow" />{t('admin.manageDepts')}</h2>
            <div className="flex gap-3 mb-6">
              <input type="text" value={newDept} onChange={(e) => setNewDept(e.target.value)} placeholder={t('admin.deptPlaceholder')}
                className="flex-1 px-4 py-3 rounded-xl bg-dark-700 border border-dark-600 text-white placeholder-gray-500 text-sm" onKeyDown={(e) => e.key === 'Enter' && handleAddDept()} />
              <button onClick={handleAddDept} disabled={deptSaving || !newDept.trim()}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-kahoot-green to-emerald-600 text-white font-bold text-sm hover:shadow-lg transition-all disabled:opacity-50 flex items-center gap-2">
                <Plus className="w-4 h-4" />{t('admin.add')}
              </button>
            </div>
            <div className="space-y-2">
              {departments.length === 0 ? (<p className="text-gray-400 text-sm text-center py-8">{t('admin.noDepts')}</p>) : (
                departments.map((dept) => (
                  <div key={dept.id} className="flex items-center justify-between p-4 rounded-xl bg-dark-700 border border-dark-600 group">
                    <div className="flex items-center gap-3">
                      <div className="dept-badge w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white">{dept.name[0]}</div>
                      <span className="text-white text-sm font-medium">{dept.name}</span>
                    </div>
                    <button onClick={() => setDeleteDept({ open: true, dept })} className="w-8 h-8 rounded-lg bg-dark-600 hover:bg-kahoot-red/20 flex items-center justify-center opacity-50 group-hover:opacity-100 transition-all"><Trash2 className="w-4 h-4 text-kahoot-red" /></button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'teachers' && (
          <div className="bg-dark-800 rounded-2xl border border-dark-600 p-6 animate-fade-in">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-white flex items-center gap-2"><Users className="w-5 h-5 text-kahoot-yellow" />{t('admin.teacherAccounts')}</h2>
              <button onClick={() => setShowTeacherForm(!showTeacherForm)}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-kahoot-purple to-kahoot-blue text-white text-sm font-medium flex items-center gap-2 hover:shadow-lg transition-all">
                <Plus className="w-4 h-4" />{t('admin.addAccount')}
              </button>
            </div>
            {teacherMsg.text && (<div className={`mb-4 p-4 rounded-xl text-sm ${teacherMsg.type === 'success' ? 'bg-kahoot-green/10 border border-kahoot-green/30 text-kahoot-green' : 'bg-kahoot-red/10 border border-kahoot-red/30 text-kahoot-red'}`}>{teacherMsg.text}</div>)}
            {showTeacherForm && (
              <div className="bg-dark-700 rounded-xl p-5 mb-6 border border-dark-600">
                <h3 className="text-sm font-bold text-white mb-4">{t('admin.createNewAccount')}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div><label className="block text-xs font-medium text-gray-400 mb-1">{t('login.username')}</label><input type="text" value={teacherForm.username} onChange={(e) => setTeacherForm({ ...teacherForm, username: e.target.value })} className="w-full px-3 py-2 rounded-lg bg-dark-800 border border-dark-600 text-white placeholder-gray-500 text-sm" placeholder="teacher123" /></div>
                  <div><label className="block text-xs font-medium text-gray-400 mb-1">{t('admin.fullName')}</label><input type="text" value={teacherForm.full_name} onChange={(e) => setTeacherForm({ ...teacherForm, full_name: e.target.value })} className="w-full px-3 py-2 rounded-lg bg-dark-800 border border-dark-600 text-white placeholder-gray-500 text-sm" placeholder="John Smith" /></div>
                  <div><label className="block text-xs font-medium text-gray-400 mb-1">{t('login.password')}</label><input type="password" value={teacherForm.password} onChange={(e) => setTeacherForm({ ...teacherForm, password: e.target.value })} className="w-full px-3 py-2 rounded-lg bg-dark-800 border border-dark-600 text-white placeholder-gray-500 text-sm" placeholder="••••••••" /></div>
                  <div><label className="block text-xs font-medium text-gray-400 mb-1">{t('form.dept')}</label>
                    <select value={teacherForm.department} onChange={(e) => setTeacherForm({ ...teacherForm, department: e.target.value })} className="w-full px-3 py-2 rounded-lg bg-dark-800 border border-dark-600 text-white text-sm appearance-none">
                      <option value="">{t('form.selectDept')}</option>
                      {departments.map((d: any) => (<option key={d.id} value={d.name}>{d.name}</option>))}
                    </select>
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={teacherForm.is_admin} onChange={(e) => setTeacherForm({ ...teacherForm, is_admin: e.target.checked })} className="w-4 h-4 rounded bg-dark-800 border-dark-600 text-kahoot-purple" />
                    <span className="text-sm text-gray-300">{t('admin.adminPrivileges')}</span>
                  </label>
                </div>
                <div className="mt-4 flex gap-3">
                  <button onClick={handleCreateTeacher} disabled={teacherSaving} className="px-5 py-2 rounded-lg bg-gradient-to-r from-kahoot-purple to-kahoot-blue text-white text-sm font-medium disabled:opacity-50 flex items-center gap-2">
                    {teacherSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}{t('admin.createAccount')}
                  </button>
                  <button onClick={() => setShowTeacherForm(false)} className="px-4 py-2 rounded-lg bg-dark-600 text-gray-300 hover:bg-dark-500 text-sm transition-colors">{t('form.cancel')}</button>
                </div>
              </div>
            )}
            <div className="space-y-2">
              {teachers.length === 0 ? (<p className="text-gray-400 text-sm text-center py-8">{t('admin.noTeachers')}</p>) : (
                teachers.map((tch) => (
                  <div key={tch.id} className="flex items-center justify-between p-4 rounded-xl bg-dark-700 border border-dark-600">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white ${tch.is_admin ? 'bg-gradient-to-br from-kahoot-red to-kahoot-orange' : 'bg-gradient-to-br from-kahoot-purple to-kahoot-blue'}`}>{tch.full_name?.[0] || tch.username[0]}</div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-white text-sm font-medium">{tch.full_name}</span>
                          {tch.is_admin === 1 && <span className="px-2 py-0.5 rounded-full text-xs bg-kahoot-red/20 text-kahoot-red font-bold">Admin</span>}
                        </div>
                        <div className="text-xs text-gray-500">@{tch.username} · {tch.department}</div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
      <DeleteModal isOpen={deleteDept.open} title={t('modal.delete')} message={`Delete "${deleteDept.dept?.name}"?`} onConfirm={handleDeleteDept} onCancel={() => setDeleteDept({ open: false, dept: null })} />
    </div>
  );
}
