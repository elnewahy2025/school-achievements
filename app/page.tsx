'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Search, Filter, Award, GraduationCap, Calendar, User, FileText, Image as ImageIcon,
  X, ChevronLeft, ChevronRight, Download, Phone, MapPin
} from 'lucide-react';
import { useSettings } from '@/components/SettingsContext';

interface FileRecord {
  id: number;
  file_type: string;
  original_name: string;
  stored_name: string;
  mime_type: string;
  size: number;
}

interface Achievement {
  id: number;
  title: string;
  description: string;
  department: string;
  teacher_id: number | null;
  teacher_name: string;
  event_date: string | null;
  created_at: string;
  files: FileRecord[];
}

interface Settings {
  school_name?: string;
  tagline?: string;
  manager_name?: string;
  phone?: string;
  address?: string;
  logo_url?: string;
}

const DEPT_COLORS: Record<string, string> = {
  'Science': 'from-emerald-500 to-teal-600',
  'العلوم': 'from-emerald-500 to-teal-600',
  'Mathematics': 'from-blue-500 to-indigo-600',
  'الرياضيات': 'from-blue-500 to-indigo-600',
  'English': 'from-purple-500 to-violet-600',
  'اللغة الإنجليزية': 'from-purple-500 to-violet-600',
  'History': 'from-amber-500 to-orange-600',
  'التاريخ': 'from-amber-500 to-orange-600',
  'Arts': 'from-pink-500 to-rose-600',
  'الفنون': 'from-pink-500 to-rose-600',
  'Physical Education': 'from-red-500 to-pink-600',
  'التربية البدنية': 'from-red-500 to-pink-600',
  'Technology': 'from-cyan-500 to-blue-600',
  'التكنولوجيا': 'from-cyan-500 to-blue-600',
  'Music': 'from-yellow-500 to-amber-600',
  'الموسيقى': 'from-yellow-500 to-amber-600',
  'Administration': 'from-gray-500 to-slate-600',
  'الإدارة': 'from-gray-500 to-slate-600',
};

function getDeptColor(dept: string) {
  return DEPT_COLORS[dept] || 'from-kahoot-purple to-kahoot-blue';
}

function SkeletonCard() {
  return (
    <div className="bg-dark-800 rounded-2xl overflow-hidden border border-dark-600">
      <div className="h-48 skeleton-pulse" />
      <div className="p-5">
        <div className="h-4 skeleton-pulse rounded w-1/3 mb-3" />
        <div className="h-5 skeleton-pulse rounded w-3/4 mb-3" />
        <div className="h-3 skeleton-pulse rounded w-full mb-2" />
        <div className="h-3 skeleton-pulse rounded w-2/3" />
      </div>
    </div>
  );
}

export default function GalleryPage() {
  const { t, language } = useSettings();
  const [settings, setSettings] = useState<Settings>({});
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [departments, setDepartments] = useState<string[]>([]);
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedTeacher, setSelectedTeacher] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [lightbox, setLightbox] = useState<{ achievement: Achievement; imageIndex: number } | null>(null);

  const fetchAchievements = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (selectedDept) params.set('department', selectedDept);
      if (selectedTeacher) params.set('teacher', selectedTeacher);
      if (searchQuery) params.set('search', searchQuery);
      const res = await fetch(`/api/gallery?${params.toString()}`);
      const data = await res.json();
      setAchievements(data);
    } catch (err) {
      console.error('Failed to load gallery:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedDept, selectedTeacher, searchQuery]);

  useEffect(() => {
    fetch('/api/settings').then((r) => r.json()).then(setSettings).catch(() => {});
    fetch('/api/departments').then((r) => r.json()).then((data) => setDepartments(data.map((d: any) => d.name).sort())).catch(() => {});
  }, []);

  useEffect(() => {
    const timer = setTimeout(fetchAchievements, 300);
    return () => clearTimeout(timer);
  }, [fetchAchievements]);

  const allTeachers = [...new Set(achievements.map((a) => a.teacher_name))].sort();
  const imageFiles = lightbox ? lightbox.achievement.files.filter((f) => f.file_type === 'image') : [];
  const pdfFiles = lightbox ? lightbox.achievement.files.filter((f) => f.file_type === 'pdf') : [];

  const navigateLightbox = (direction: number) => {
    if (!lightbox) return;
    const newIndex = lightbox.imageIndex + direction;
    if (newIndex >= 0 && newIndex < imageFiles.length) setLightbox({ ...lightbox, imageIndex: newIndex });
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return null;
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return null;
    return d.toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="hero-gradient relative overflow-hidden">
        <div className="absolute inset-0 bg-black/30" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
          <div className="text-center animate-fade-in">
            {settings.logo_url ? (
              <div className="flex justify-center mb-6">
                <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center overflow-hidden border-2 border-white/30">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={settings.logo_url} alt="School Logo" className="w-full h-full object-cover" />
                </div>
              </div>
            ) : (
              <div className="flex justify-center mb-6">
                <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border-2 border-white/30 animate-float">
                  <Award className="w-10 h-10 text-white" />
                </div>
              </div>
            )}
            <h1 className="text-4xl sm:text-6xl font-black text-white mb-4 drop-shadow-lg">
              {settings.school_name || 'School Achievements'}
            </h1>
            <p className="text-xl sm:text-2xl text-white/90 font-medium mb-6 drop-shadow">
              {settings.tagline || t('hero.tagline')}
            </p>
            {(settings.manager_name || settings.phone || settings.address) && (
              <div className="flex flex-wrap justify-center gap-4 text-white/80 text-sm">
                {settings.manager_name && (
                  <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full">
                    <GraduationCap className="w-4 h-4" />
                    <span>{t('hero.managedBy')} {settings.manager_name}</span>
                  </div>
                )}
                {settings.phone && (
                  <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full">
                    <Phone className="w-4 h-4" />
                    <span>{settings.phone}</span>
                  </div>
                )}
                {settings.address && (
                  <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full">
                    <MapPin className="w-4 h-4" />
                    <span>{settings.address}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-dark-900 to-transparent" />
      </section>

      {/* Filters */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 -mt-8 relative z-10 mb-8">
        <div className="bg-dark-800 rounded-2xl border border-dark-600 p-6 shadow-xl">
          <div className="flex items-center gap-2 mb-4 text-gray-300">
            <Filter className="w-4 h-4" />
            <span className="text-sm font-medium">{t('filter.title')}</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="text" placeholder={t('filter.search')} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-dark-700 border border-dark-600 text-white placeholder-gray-400 text-sm" />
            </div>
            <select value={selectedDept} onChange={(e) => setSelectedDept(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-dark-700 border border-dark-600 text-white text-sm appearance-none cursor-pointer">
              <option value="">{t('filter.allDepts')}</option>
              {departments.map((d) => (<option key={d} value={d}>{d}</option>))}
            </select>
            <select value={selectedTeacher} onChange={(e) => setSelectedTeacher(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-dark-700 border border-dark-600 text-white text-sm appearance-none cursor-pointer">
              <option value="">{t('filter.allTeachers')}</option>
              {allTeachers.map((tName) => (<option key={tName} value={tName}>{tName}</option>))}
            </select>
          </div>
        </div>
      </section>

      {/* Results Count */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 mb-6">
        <p className="text-gray-400 text-sm">
          {loading ? t('filter.loading') : t('filter.results', { count: achievements.length, s: achievements.length !== 1 ? 's' : '' })}
        </p>
      </div>

      {/* Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-16">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (<SkeletonCard key={i} />))}
          </div>
        ) : achievements.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-24 h-24 rounded-full bg-dark-800 flex items-center justify-center mx-auto mb-6 border border-dark-600">
              <Award className="w-12 h-12 text-gray-600" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">{t('empty.title')}</h3>
            <p className="text-gray-400">
              {searchQuery || selectedDept || selectedTeacher ? t('empty.adjust') : t('empty.none')}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {achievements.map((achievement, index) => {
              const images = achievement.files.filter((f) => f.file_type === 'image');
              const hasFiles = achievement.files.length > 0;
              return (
                <div key={achievement.id}
                  onClick={() => hasFiles && setLightbox({ achievement, imageIndex: 0 })}
                  className={`bg-dark-800 rounded-2xl overflow-hidden border border-dark-600 card-hover animate-slide-up ${hasFiles ? 'cursor-pointer' : ''}`}
                  style={{ animationDelay: `${Math.min(index * 60, 600)}ms` }}>
                  <div className="relative h-48 overflow-hidden">
                    {images.length > 0 ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={`/uploads/${achievement.id}/${images[0].stored_name}`} alt={achievement.title}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className={`w-full h-full bg-gradient-to-br ${getDeptColor(achievement.department)} flex items-center justify-center`}>
                        <Award className="w-12 h-12 text-white/30" />
                      </div>
                    )}
                    <div className="absolute top-3 left-3">
                      <div className="dept-badge px-3 py-1 rounded-full text-xs font-bold text-white shadow-lg">{achievement.department}</div>
                    </div>
                    {hasFiles && (
                      <div className="absolute top-3 right-3">
                        <div className="bg-black/50 backdrop-blur-md px-2 py-1 rounded-full text-xs text-white flex items-center gap-1">
                          <ImageIcon className="w-3 h-3" />{achievement.files.length}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="p-5">
                    <h3 className="font-bold text-white mb-2 line-clamp-2">{achievement.title}</h3>
                    {achievement.description && (<p className="text-gray-400 text-sm line-clamp-2 mb-3">{achievement.description}</p>)}
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <div className="flex items-center gap-1.5"><User className="w-3 h-3" /><span>{achievement.teacher_name}</span></div>
                      {achievement.event_date && (
                        <div className="flex items-center gap-1.5"><Calendar className="w-3 h-3" /><span>{new Date(achievement.event_date).toLocaleDateString()}</span></div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Lightbox */}
      {lightbox && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-md z-50 flex flex-col animate-fade-in" onClick={() => setLightbox(null)}>
          <div className="flex items-center justify-between p-4 bg-dark-900/80 backdrop-blur-md border-b border-dark-600">
            <div>
              <h2 className="text-lg font-bold text-white">{lightbox.achievement.title}</h2>
              <div className="flex items-center gap-3 text-sm text-gray-400">
                <span className="flex items-center gap-1"><User className="w-3 h-3" />{lightbox.achievement.teacher_name}</span>
                <span className="dept-badge px-2 py-0.5 rounded-full text-xs text-white">{lightbox.achievement.department}</span>
              </div>
            </div>
            <button onClick={() => setLightbox(null)} className="w-10 h-10 rounded-full bg-dark-700 hover:bg-dark-600 flex items-center justify-center transition-colors">
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
          <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
            {imageFiles.length > 0 ? (
              <div className="flex-1 flex items-center justify-center relative p-4">
                {imageFiles.length > 1 && (
                  <button onClick={(e) => { e.stopPropagation(); navigateLightbox(-1); }} disabled={lightbox.imageIndex === 0}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-dark-800/80 hover:bg-dark-700 flex items-center justify-center transition-all disabled:opacity-30 z-10 border border-dark-600">
                    <ChevronLeft className="w-6 h-6 text-white" />
                  </button>
                )}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={`/uploads/${lightbox.achievement.id}/${imageFiles[lightbox.imageIndex]?.stored_name}`}
                  alt={lightbox.achievement.title} className="max-w-full max-h-full object-contain rounded-xl" onClick={(e) => e.stopPropagation()} />
                {imageFiles.length > 1 && (
                  <button onClick={(e) => { e.stopPropagation(); navigateLightbox(1); }} disabled={lightbox.imageIndex === imageFiles.length - 1}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-dark-800/80 hover:bg-dark-700 flex items-center justify-center transition-all disabled:opacity-30 z-10 border border-dark-600">
                    <ChevronRight className="w-6 h-6 text-white" />
                  </button>
                )}
                {imageFiles.length > 1 && (
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                    {imageFiles.map((_, i) => (
                      <button key={i} onClick={(e) => { e.stopPropagation(); setLightbox({ ...lightbox, imageIndex: i }); }}
                        className={`w-2 h-2 rounded-full transition-all ${i === lightbox.imageIndex ? 'bg-kahoot-yellow w-6' : 'bg-white/40'}`} />
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center p-4">
                <div className={`w-64 h-64 rounded-3xl bg-gradient-to-br ${getDeptColor(lightbox.achievement.department)} flex items-center justify-center`}>
                  <Award className="w-24 h-24 text-white/30" />
                </div>
              </div>
            )}
            <div className={`w-full lg:w-96 bg-dark-800 border-l border-dark-600 p-6 overflow-y-auto ${language === 'ar' ? 'lg:border-l-0 lg:border-r' : ''}`}>
              {lightbox.achievement.description && (
                <div className="mb-6">
                  <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">{t('lightbox.description')}</h3>
                  <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">{lightbox.achievement.description}</p>
                </div>
              )}
              {(lightbox.achievement.event_date && formatDate(lightbox.achievement.event_date)) && (
                <div className="mb-6">
                  <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">{t('lightbox.date')}</h3>
                  <p className="text-gray-300 text-sm flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-kahoot-yellow" />{formatDate(lightbox.achievement.event_date)}
                  </p>
                </div>
              )}
              {pdfFiles.length > 0 && (
                <div>
                  <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">{t('lightbox.attachments')}</h3>
                  <div className="space-y-2">
                    {pdfFiles.map((file) => (
                      <a key={file.id} href={`/uploads/${lightbox.achievement.id}/${file.stored_name}`} target="_blank" rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center gap-3 p-3 rounded-xl bg-dark-700 hover:bg-dark-600 border border-dark-600 transition-all group">
                        <div className="w-10 h-10 rounded-lg bg-kahoot-red/20 flex items-center justify-center"><FileText className="w-5 h-5 text-kahoot-red" /></div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-white truncate">{file.original_name}</p>
                          <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(1)} KB</p>
                        </div>
                        <Download className="w-4 h-4 text-gray-400 group-hover:text-kahoot-yellow transition-colors" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
              {imageFiles.length > 1 && (
                <div className="mt-6 pt-6 border-t border-dark-600">
                  <p className="text-xs text-gray-500 text-center">{t('lightbox.browse', { count: imageFiles.length })}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-dark-800/50 border-t border-dark-600 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <p className="text-gray-500 text-sm">
            © {new Date().getFullYear()} {settings.school_name || 'School Achievements'}. {t('footer.builtWith')} <span className="text-kahoot-red">♥</span> {t('footer.vibes')}
          </p>
        </div>
      </footer>
    </div>
  );
}
