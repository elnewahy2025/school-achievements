'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthContext';
import DeleteModal from '@/components/DeleteModal';
import {
  Shield, Settings, FolderPlus, Users, Save, Plus, Trash2, Loader2, AlertCircle
} from 'lucide-react';

export default function AdminPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'settings' | 'departments' | 'teachers'>('settings');

  // Settings
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [settingsSaving, setSettingsSaving] = useState(false);
  const [settingsMsg, setSettingsMsg] = useState({ type: '', text: '' });

  // Departments
  const [departments, setDepartments] = useState<any[]>([]);
  const [newDept, setNewDept] = useState('');
  const [deptSaving, setDeptSaving] = useState(false);
  const [deleteDept, setDeleteDept] = useState<{ open: boolean; dept: any }>({ open: false, dept: null });

  // Teachers
  const [teachers, setTeachers] = useState<any[]>([]);
  const [showTeacherForm, setShowTeacherForm] = useState(false);
  const [teacherForm, setTeacherForm] = useState({ username: '', password: '', full_name: '', department: '', is_admin: false });
  const [teacherSaving, setTeacherSaving] = useState(false);
  const [teacherMsg, setTeacherMsg] = useState({ type: '', text: '' });

  useEffect(() => {
    if (!authLoading && (!user || user.is_admin !== 1)) router.push('/login');
  }, [authLoading, user, router]);

  // Fetch data
  useEffect(() => {
    if (user?.is_admin === 1) {
      fetch('/api/settings').then((r) => r.json()).then(setSettings).catch(() => {});
      fetch('/api/departments').then((r) => r.json()).then(setDepartments).catch(() => {});
      fetch('/api/teachers').then((r) => r.json()).then(setTeachers).catch(() => {});
    }
  }, [user]);

  // Settings
  const handleSaveSettings = async () => {
    setSettingsSaving(true);
    setSettingsMsg({ type: '', text: '' });
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      setSettings(data);
      setSettingsMsg({ type: 'success', text: 'Settings updated successfully!' });
      setTimeout(() => setSettingsMsg({ type: '', text: '' }), 3000);
    } catch {
      setSettingsMsg({ type: 'error', text: 'Failed to update settings' });
    } finally {
      setSettingsSaving(false);
    }
  };

  // Departments
  const handleAddDept = async () => {
    if (!newDept.trim()) return;
    setDeptSaving(true);
    try {
      const res = await fetch('/api/departments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newDept.trim() }),
      });
      const data = await res.json();
      if (!res.ok) { alert(data.error); return; }
      setDepartments([...departments, data]);
      setNewDept('');
    } catch {
      alert('Failed to add department');
    } finally {
      setDeptSaving(false);
    }
  };

  const handleDeleteDept = async () => {
    if (!deleteDept.dept) return;
    try {
      const res = await fetch('/api/departments', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: deleteDept.dept.id }),
      });
      const data = await res.json();
      if (!res.ok) { alert(data.error); return; }
      setDepartments(departments.filter((d) => d.id !== deleteDept.dept.id));
      setDeleteDept({ open: false, dept: null });
    } catch {
      alert('Failed to delete department');
    }
  };

  // Teachers
  const handleCreateTeacher = async () => {
    if (!teacherForm.username || !teacherForm.password || !teacherForm.full_name || !teacherForm.department) {
      setTeacherMsg({ type: 'error', text: 'All fields are required' });
      return;
    }
    setTeacherSaving(true);
    setTeacherMsg({ type: '', text: '' });
    try {
      const res = await fetch('/api/teachers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(teacherForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setTeachers([...teachers, data]);
      setTeacherForm({ username: '', password: '', full_name: '', department: '', is_admin: false });
      setShowTeacherForm(false);
      setTeacherMsg({ type: 'success', text: 'Account created successfully!' });
      setTimeout(() => setTeacherMsg({ type: '', text: '' }), 3000);
    } catch (err: any) {
      setTeacherMsg({ type: 'error', text: err.message || 'Failed to create account' });
    } finally {
      setTeacherSaving(false);
    }
  };

  if (authLoading || !user || user.is_admin !== 1) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 text-kahoot-red animate-spin" /></div>;
  }

  const tabs = [
    { id: 'settings' as const, label: 'School Settings', icon: Settings },
    { id: 'departments' as const, label: 'Departments', icon: FolderPlus },
    { id: 'teachers' as const, label: 'Teacher Accounts', icon: Users },
  ];

  return (
    <div className="min-h-screen pb-16">
      {/* Header */}
      <div className="bg-gradient-to-r from-kahoot-red/20 to-kahoot-orange/20 border-b border-dark-600">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-kahoot-red to-kahoot-orange flex items-center justify-center shadow-lg">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-white">Admin Console</h1>
              <p className="text-gray-400 text-sm">Manage school settings, departments, and teacher accounts</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {/* Tabs */}
        <div className="flex gap-1 mb-8 bg-dark-800 rounded-xl p-1 border border-dark-600">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-kahoot-purple to-kahoot-blue text-white shadow-lg'
                  : 'text-gray-400 hover:text-white hover:bg-dark-700'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="bg-dark-800 rounded-2xl border border-dark-600 p-6 animate-fade-in">
            <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <Settings className="w-5 h-5 text-kahoot-yellow" />
              School Information
            </h2>

            {settingsMsg.text && (
              <div className={`mb-6 p-4 rounded-xl text-sm flex items-center gap-2 ${
                settingsMsg.type === 'success'
                  ? 'bg-kahoot-green/10 border border-kahoot-green/30 text-kahoot-green'
                  : 'bg-kahoot-red/10 border border-kahoot-red/30 text-kahoot-red'
              }`}>
                {settingsMsg.type === 'error' && <AlertCircle className="w-4 h-4 shrink-0" />}
                {settingsMsg.text}
              </div>
            )}

            <div className="space-y-5">
              {[
                { key: 'school_name', label: 'School Name', placeholder: 'My Amazing School' },
                { key: 'manager_name', label: 'Manager Name', placeholder: 'Dr. John Smith' },
                { key: 'tagline', label: 'Tagline', placeholder: 'Celebrating Academic Excellence' },
                { key: 'phone', label: 'Phone', placeholder: '+1 (555) 123-4567' },
                { key: 'address', label: 'Address', placeholder: '123 Education St, Learning City' },
                { key: 'logo_url', label: 'Logo URL', placeholder: 'https://example.com/logo.png' },
              ].map((field) => (
                <div key={field.key}>
                  <label className="block text-sm font-medium text-gray-300 mb-2">{field.label}</label>
                  <input
                    type="text"
                    value={settings[field.key] || ''}
                    onChange={(e) => setSettings({ ...settings, [field.key]: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-dark-700 border border-dark-600 text-white placeholder-gray-500 text-sm"
                    placeholder={field.placeholder}
                  />
                </div>
              ))}
              <button
                onClick={handleSaveSettings}
                disabled={settingsSaving}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-kahoot-green to-emerald-600 text-white font-bold text-sm hover:shadow-lg hover:shadow-kahoot-green/30 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {settingsSaving ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
                ) : (
                  <><Save className="w-4 h-4" /> Save Settings</>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Departments Tab */}
        {activeTab === 'departments' && (
          <div className="bg-dark-800 rounded-2xl border border-dark-600 p-6 animate-fade-in">
            <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <FolderPlus className="w-5 h-5 text-kahoot-yellow" />
              Manage Departments
            </h2>

            <div className="flex gap-3 mb-6">
              <input
                type="text"
                value={newDept}
                onChange={(e) => setNewDept(e.target.value)}
                placeholder="New department name..."
                className="flex-1 px-4 py-3 rounded-xl bg-dark-700 border border-dark-600 text-white placeholder-gray-500 text-sm"
                onKeyDown={(e) => e.key === 'Enter' && handleAddDept()}
              />
              <button
                onClick={handleAddDept}
                disabled={deptSaving || !newDept.trim()}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-kahoot-green to-emerald-600 text-white font-bold text-sm hover:shadow-lg transition-all disabled:opacity-50 flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add
              </button>
            </div>

            <div className="space-y-2">
              {departments.length === 0 ? (
                <p className="text-gray-400 text-sm text-center py-8">No departments yet. Add one above.</p>
              ) : (
                departments.map((dept) => (
                  <div key={dept.id} className="flex items-center justify-between p-4 rounded-xl bg-dark-700 border border-dark-600 group">
                    <div className="flex items-center gap-3">
                      <div className="dept-badge w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white">
                        {dept.name[0]}
                      </div>
                      <span className="text-white text-sm font-medium">{dept.name}</span>
                    </div>
                    <button
                      onClick={() => setDeleteDept({ open: true, dept })}
                      className="w-8 h-8 rounded-lg bg-dark-600 hover:bg-kahoot-red/20 flex items-center justify-center opacity-50 group-hover:opacity-100 transition-all"
                    >
                      <Trash2 className="w-4 h-4 text-kahoot-red" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Teachers Tab */}
        {activeTab === 'teachers' && (
          <div className="bg-dark-800 rounded-2xl border border-dark-600 p-6 animate-fade-in">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-kahoot-yellow" />
                Teacher Accounts
              </h2>
              <button
                onClick={() => setShowTeacherForm(!showTeacherForm)}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-kahoot-purple to-kahoot-blue text-white text-sm font-medium flex items-center gap-2 hover:shadow-lg transition-all"
              >
                <Plus className="w-4 h-4" />
                Add Account
              </button>
            </div>

            {teacherMsg.text && (
              <div className={`mb-4 p-4 rounded-xl text-sm flex items-center gap-2 ${
                teacherMsg.type === 'success'
                  ? 'bg-kahoot-green/10 border border-kahoot-green/30 text-kahoot-green'
                  : 'bg-kahoot-red/10 border border-kahoot-red/30 text-kahoot-red'
              }`}>
                {teacherMsg.type === 'error' && <AlertCircle className="w-4 h-4 shrink-0" />}
                {teacherMsg.text}
              </div>
            )}

            {/* Create Teacher Form */}
            {showTeacherForm && (
              <div className="bg-dark-700 rounded-xl p-5 mb-6 border border-dark-600">
                <h3 className="text-sm font-bold text-white mb-4">Create New Account</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { key: 'username', label: 'Username', placeholder: 'teacher123', type: 'text' },
                    { key: 'full_name', label: 'Full Name', placeholder: 'John Smith', type: 'text' },
                    { key: 'password', label: 'Password', placeholder: '••••••••', type: 'password' },
                  ].map((field) => (
                    <div key={field.key}>
                      <label className="block text-xs font-medium text-gray-400 mb-1">{field.label}</label>
                      <input
                        type={field.type}
                        value={(teacherForm as any)[field.key]}
                        onChange={(e) => setTeacherForm({ ...teacherForm, [field.key]: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg bg-dark-800 border border-dark-600 text-white placeholder-gray-500 text-sm"
                        placeholder={field.placeholder}
                      />
                    </div>
                  ))}
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1">Department</label>
                    <select
                      value={teacherForm.department}
                      onChange={(e) => setTeacherForm({ ...teacherForm, department: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-dark-800 border border-dark-600 text-white text-sm appearance-none"
                    >
                      <option value="">Select...</option>
                      {departments.map((d: any) => (
                        <option key={d.id} value={d.name}>{d.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={teacherForm.is_admin}
                      onChange={(e) => setTeacherForm({ ...teacherForm, is_admin: e.target.checked })}
                      className="w-4 h-4 rounded bg-dark-800 border-dark-600 text-kahoot-purple focus:ring-kahoot-purple"
                    />
                    <span className="text-sm text-gray-300">Admin privileges</span>
                  </label>
                </div>
                <div className="mt-4 flex gap-3">
                  <button
                    onClick={handleCreateTeacher}
                    disabled={teacherSaving}
                    className="px-5 py-2 rounded-lg bg-gradient-to-r from-kahoot-purple to-kahoot-blue text-white text-sm font-medium disabled:opacity-50 flex items-center gap-2"
                  >
                    {teacherSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                    Create Account
                  </button>
                  <button
                    onClick={() => setShowTeacherForm(false)}
                    className="px-4 py-2 rounded-lg bg-dark-600 text-gray-300 hover:bg-dark-500 text-sm transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Teachers List */}
            <div className="space-y-2">
              {teachers.length === 0 ? (
                <p className="text-gray-400 text-sm text-center py-8">No teacher accounts yet.</p>
              ) : (
                teachers.map((t) => (
                  <div key={t.id} className="flex items-center justify-between p-4 rounded-xl bg-dark-700 border border-dark-600">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white ${
                        t.is_admin ? 'bg-gradient-to-br from-kahoot-red to-kahoot-orange' : 'bg-gradient-to-br from-kahoot-purple to-kahoot-blue'
                      }`}>
                        {t.full_name?.[0] || t.username[0]}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-white text-sm font-medium">{t.full_name}</span>
                          {t.is_admin === 1 && (
                            <span className="px-2 py-0.5 rounded-full text-xs bg-kahoot-red/20 text-kahoot-red font-bold">Admin</span>
                          )}
                        </div>
                        <div className="text-xs text-gray-500">
                          @{t.username} · {t.department}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      <DeleteModal
        isOpen={deleteDept.open}
        title="Delete Department"
        message={`Are you sure you want to delete "${deleteDept.dept?.name}"? This will fail if there are accounts or achievements in this department.`}
        onConfirm={handleDeleteDept}
        onCancel={() => setDeleteDept({ open: false, dept: null })}
      />
    </div>
  );
}
