'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import {
  Search, Filter, Award, GraduationCap, Calendar, User, FileText, Image as ImageIcon,
  X, ChevronLeft, ChevronRight, Download, Phone, MapPin, TrendingUp, Sparkles, Clock, CalendarDays, LayoutGrid
} from 'lucide-react';
import { useSettings } from '@/components/SettingsContext';
import CalendarView from '@/components/CalendarView';

interface FileRecord { id: number; file_type: string; original_name: string; stored_name: string; mime_type: string; size: number; }
interface Achievement { id: number; title: string; description: string; department: string; teacher_id: number | null; teacher_name: string; event_date: string | null; is_featured: number; is_pinned: number; reactions: string; categories: string; created_at: string; files: FileRecord[]; }
interface Settings { school_name?: string; tagline?: string; manager_name?: string; phone?: string; address?: string; logo_url?: string; }
interface Stats { achievements: number; teachers: number; departments: number; files: number; }

const DEPT_COLORS: Record<string, string> = { 'Science': 'from-emerald-500 to-teal-600', 'العلوم': 'from-emerald-500 to-teal-600', 'Mathematics': 'from-blue-500 to-indigo-600', 'الرياضيات': 'from-blue-500 to-indigo-600', 'English': 'from-purple-500 to-violet-600', 'History': 'from-amber-500 to-orange-600', 'Arts': 'from-pink-500 to-rose-600', 'Technology': 'from-cyan-500 to-blue-600', 'Administration': 'from-gray-500 to-slate-600' };
const REACTIONS = ['🎉', '👏', '❤️', '🏆', '⭐', '🔥'];

function getDeptColor(d: string) { return DEPT_COLORS[d] || 'from-kahoot-purple to-kahoot-blue'; }

function CountUp({ target, duration = 2000 }: { target: number; duration?: number }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true;
        const start = performance.now();
        const animate = (now: number) => {
          const progress = Math.min((now - start) / duration, 1);
          setCount(Math.floor(progress * target));
          if (progress < 1) requestAnimationFrame(animate);
        };
        requestAnimationFrame(animate);
      }
    }, { threshold: 0.3 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [target, duration]);
  return <span ref={ref}>{count.toLocaleString()}</span>;
}

function SkeletonCard() {
  return <div className="bg-dark-800 rounded-2xl overflow-hidden border border-dark-600"><div className="h-48 skeleton-pulse" /><div className="p-5"><div className="h-4 skeleton-pulse rounded w-1/3 mb-3" /><div className="h-5 skeleton-pulse rounded w-3/4 mb-3" /><div className="h-3 skeleton-pulse rounded w-2/3" /></div></div>;
}

export default function GalleryPage() {
  const { t, language } = useSettings();
  const [settings, setSettings] = useState<Settings>({});
  const [stats, setStats] = useState<Stats | null>(null);
  const [featured, setFeatured] = useState<Achievement[]>([]);
  const [recent, setRecent] = useState<Achievement[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [departments, setDepartments] = useState<string[]>([]);
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedTeacher, setSelectedTeacher] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchSuggestions, setSearchSuggestions] = useState<Achievement[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(true);
  const [lightbox, setLightbox] = useState<{ achievement: Achievement; imageIndex: number } | null>(null);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [reacting, setReacting] = useState<number | null>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'calendar'>('grid');

  // Close suggestions on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => { if (searchRef.current && !searchRef.current.contains(e.target as Node)) setShowSuggestions(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Fetch data
  useEffect(() => {
    fetch('/api/settings').then((r) => r.json()).then(setSettings).catch(() => {});
    fetch('/api/stats').then((r) => r.json()).then(setStats).catch(() => {});
    fetch('/api/gallery?featured=1').then((r) => r.json()).then(setFeatured).catch(() => {});
    fetch('/api/gallery?recent=1').then((r) => r.json()).then(setRecent).catch(() => {});
    fetch('/api/departments').then((r) => r.json()).then((d) => setDepartments(d.map((x: any) => x.name).sort())).catch(() => {});
  }, []);

  const fetchAchievements = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (selectedDept) params.set('department', selectedDept);
      if (selectedTeacher) params.set('teacher', selectedTeacher);
      if (searchQuery) params.set('search', searchQuery);
    if (selectedCategory) params.set('category', selectedCategory);
      const res = await fetch(`/api/gallery?${params.toString()}`);
      setAchievements(await res.json());
    } catch {} finally { setLoading(false); }
  }, [selectedDept, selectedTeacher, searchQuery, selectedCategory]);

  useEffect(() => { const timer = setTimeout(fetchAchievements, 300); return () => clearTimeout(timer); }, [fetchAchievements]);

  // Search autocomplete
  useEffect(() => {
    if (searchQuery.length < 2) { setSearchSuggestions([]); return; }
    const timer = setTimeout(() => {
      fetch(`/api/gallery?search=${encodeURIComponent(searchQuery)}`).then((r) => r.json()).then((d) => { setSearchSuggestions(d.slice(0, 5)); setShowSuggestions(true); }).catch(() => {});
    }, 200);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const allTeachers = [...new Set(achievements.map((a) => a.teacher_name))].sort();
  const allCategories = [...new Set(achievements.flatMap((a) => (a.categories || '').split(',').filter(Boolean).map((c: string) => c.trim())))].sort();
  const imageFiles = lightbox ? lightbox.achievement.files.filter((f) => f.file_type === 'image') : [];
  const pdfFiles = lightbox ? lightbox.achievement.files.filter((f) => f.file_type === 'pdf') : [];
  const navigateLightbox = (dir: number) => { if (!lightbox) return; const i = lightbox.imageIndex + dir; if (i >= 0 && i < imageFiles.length) setLightbox({ ...lightbox, imageIndex: i }); };
  const formatDate = (d: string | null) => { if (!d) return null; const dt = new Date(d); return isNaN(dt.getTime()) ? null : dt.toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' }); };

  const handleReact = async (achievementId: number, emoji: string) => {
    setReacting(achievementId);
    try {
      const res = await fetch(`/api/achievements/${achievementId}/react`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ emoji }), credentials: 'same-origin' });
      const data = await res.json();
      if (data.reactions) {
        const update = (list: Achievement[]) => list.map((a) => a.id === achievementId ? { ...a, reactions: JSON.stringify(data.reactions) } : a);
        setAchievements(update); setFeatured(update); setRecent(update);
      }
    } catch {} finally { setReacting(null); }
  };

  const getReactions = (r: string) => { try { return JSON.parse(r || '{}'); } catch { return {}; } };
  const getTotalReactions = (r: string) => Object.values(getReactions(r)).reduce((a: number, b: any) => a + b, 0);

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="hero-gradient relative overflow-hidden">
        <div className="absolute inset-0 bg-black/30" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
          <div className="text-center animate-fade-in">
            {settings.logo_url ? (
              <div className="flex justify-center mb-6"><div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center overflow-hidden border-2 border-white/30">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={settings.logo_url} alt="Logo" className="w-full h-full object-cover" />
              </div></div>
            ) : (
              <div className="flex justify-center mb-6"><div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border-2 border-white/30 animate-float"><Award className="w-10 h-10 text-white" /></div></div>
            )}
            <h1 className="text-4xl sm:text-6xl font-black text-white mb-4 drop-shadow-lg">{settings.school_name || 'School Achievements'}</h1>
            <p className="text-xl sm:text-2xl text-white/90 font-medium mb-6 drop-shadow">{settings.tagline || t('hero.tagline')}</p>
            {(settings.manager_name || settings.phone || settings.address) && (
              <div className="flex flex-wrap justify-center gap-4 text-white/80 text-sm">
                {settings.manager_name && <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full"><GraduationCap className="w-4 h-4" /><span>{t('hero.managedBy')} {settings.manager_name}</span></div>}
                {settings.phone && <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full"><Phone className="w-4 h-4" /><span>{settings.phone}</span></div>}
                {settings.address && <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full"><MapPin className="w-4 h-4" /><span>{settings.address}</span></div>}
              </div>
            )}
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-dark-900 to-transparent" />
      </section>

      {/* Stats Banner */}
      {stats && (
        <section className="bg-dark-800/80 backdrop-blur-md border-b border-dark-600">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
              <div className="flex flex-col items-center"><p className="text-3xl font-black text-white"><CountUp target={stats.achievements} /></p><p className="text-xs text-gray-400 mt-1">{language === 'ar' ? 'إنجاز' : 'Achievements'}</p></div>
              <div className="flex flex-col items-center"><p className="text-3xl font-black text-kahoot-purple"><CountUp target={stats.teachers} /></p><p className="text-xs text-gray-400 mt-1">{language === 'ar' ? 'معلم' : 'Teachers'}</p></div>
              <div className="flex flex-col items-center"><p className="text-3xl font-black text-kahoot-blue"><CountUp target={stats.departments} /></p><p className="text-xs text-gray-400 mt-1">{language === 'ar' ? 'قسم' : 'Departments'}</p></div>
              <div className="flex flex-col items-center"><p className="text-3xl font-black text-kahoot-green"><CountUp target={stats.files} /></p><p className="text-xs text-gray-400 mt-1">{language === 'ar' ? 'ملف' : 'Files'}</p></div>
            </div>
          </div>
        </section>
      )}

      {/* Featured Carousel */}
      {featured.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2"><Sparkles className="w-5 h-5 text-kahoot-yellow" />{language === 'ar' ? 'إنجازات مميزة' : 'Featured Achievements'}</h2>
          <div className="relative">
            <div className="overflow-hidden rounded-2xl">
              <div className="flex transition-transform duration-500 ease-out" style={{ transform: `translateX(-${carouselIndex * 100}%)` }}>
                {featured.map((a) => {
                  const images = a.files.filter((f) => f.file_type === 'image');
                  return (
                    <Link key={a.id} href={`/achievement/${a.id}`} className="w-full shrink-0 relative group cursor-pointer">
                      <div className="aspect-[21/9] sm:aspect-[3/1] overflow-hidden rounded-2xl">
                        {images.length > 0 ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={`/uploads/${a.id}/${images[0].stored_name}`} alt={a.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                        ) : (
                          <div className={`w-full h-full bg-gradient-to-br ${getDeptColor(a.department)} flex items-center justify-center`}><Award className="w-20 h-20 text-white/20" /></div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                        <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
                          <span className="dept-badge px-3 py-1 rounded-full text-xs font-bold text-white mb-3 inline-block">{a.department}</span>
                          <h3 className="text-xl sm:text-2xl font-black text-white mb-2">{a.title}</h3>
                          <div className="flex items-center gap-3 text-white/70 text-sm">
                            <span className="flex items-center gap-1"><User className="w-3 h-3" />{a.teacher_name}</span>
                            {a.event_date && <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{new Date(a.event_date).toLocaleDateString()}</span>}
                            {getTotalReactions(a.reactions) > 0 && <span>🎉 {getTotalReactions(a.reactions)}</span>}
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
            {featured.length > 1 && (<>
              <button onClick={() => setCarouselIndex(Math.max(0, carouselIndex - 1))} disabled={carouselIndex === 0} className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 hover:bg-black/70 flex items-center justify-center disabled:opacity-30 transition-all z-10"><ChevronLeft className="w-5 h-5 text-white" /></button>
              <button onClick={() => setCarouselIndex(Math.min(featured.length - 1, carouselIndex + 1))} disabled={carouselIndex === featured.length - 1} className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 hover:bg-black/70 flex items-center justify-center disabled:opacity-30 transition-all z-10"><ChevronRight className="w-5 h-5 text-white" /></button>
              <div className="flex justify-center gap-2 mt-4">
                {featured.map((_, i) => (<button key={i} onClick={() => setCarouselIndex(i)} className={`w-2 h-2 rounded-full transition-all ${i === carouselIndex ? 'bg-kahoot-yellow w-6' : 'bg-gray-500'}`} />))}
              </div>
            </>)}
          </div>
        </section>
      )}

      {/* Just Added */}
      {recent.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-8">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2"><Clock className="w-5 h-5 text-kahoot-green" />{language === 'ar' ? 'أضيف هذا الأسبوع' : 'New This Week'}</h2>
          <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory">
            {recent.slice(0, 6).map((a) => {
              const images = a.files.filter((f) => f.file_type === 'image');
              return (
                <Link key={a.id} href={`/achievement/${a.id}`} className="shrink-0 w-64 snap-start bg-dark-800 rounded-2xl overflow-hidden border border-dark-600 card-hover block">
                  <div className="relative h-36 overflow-hidden">
                    {images.length > 0 ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={`/uploads/${a.id}/${images[0].stored_name}`} alt={a.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className={`w-full h-full bg-gradient-to-br ${getDeptColor(a.department)} flex items-center justify-center`}><Award className="w-8 h-8 text-white/30" /></div>
                    )}
                    <div className="absolute top-2 left-2"><span className="dept-badge px-2 py-0.5 rounded-full text-[10px] font-bold text-white">{a.department}</span></div>
                  </div>
                  <div className="p-3">
                    <h3 className="font-bold text-white text-sm line-clamp-1">{a.title}</h3>
                    <p className="text-xs text-gray-500 mt-1">{a.teacher_name}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* Filters */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 mb-8">
        <div className="bg-dark-800 rounded-2xl border border-dark-600 p-6 shadow-xl">
          <div className="flex items-center gap-2 mb-4 text-gray-300"><Filter className="w-4 h-4" /><span className="text-sm font-medium">{t('filter.title')}</span></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="relative" ref={searchRef}>
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="text" placeholder={t('filter.search')} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-dark-700 border border-dark-600 text-white placeholder-gray-400 text-sm" />
              {showSuggestions && searchSuggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-dark-800 border border-dark-600 rounded-xl shadow-xl z-30 overflow-hidden">
                  {searchSuggestions.map((s) => (
                    <Link key={s.id} href={`/achievement/${s.id}`} onClick={() => { setShowSuggestions(false); setSearchQuery(''); }}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-dark-700 transition-colors border-b border-dark-600 last:border-0">
                      <Award className="w-4 h-4 text-kahoot-purple shrink-0" />
                      <div className="min-w-0"><p className="text-sm text-white truncate">{s.title}</p><p className="text-xs text-gray-500">{s.teacher_name} · {s.department}</p></div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
            <select value={selectedDept} onChange={(e) => setSelectedDept(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-dark-700 border border-dark-600 text-white text-sm appearance-none cursor-pointer">
              <option value="">{t('filter.allDepts')}</option>
              {departments.map((d) => (<option key={d} value={d}>{d}</option>))}
            </select>
            <select value={selectedTeacher} onChange={(e) => setSelectedTeacher(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-dark-700 border border-dark-600 text-white text-sm appearance-none cursor-pointer">
              <option value="">{t('filter.allTeachers')}</option>
              {allTeachers.map((tn) => (<option key={tn} value={tn}>{tn}</option>))}
            </select>
            <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-dark-700 border border-dark-600 text-white text-sm appearance-none cursor-pointer">
              <option value="">{t('filter.allCategories')}</option>
              {allCategories.map((c) => (<option key={c} value={c}>{c}</option>))}
            </select>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 mb-6 flex items-center justify-between">
        <p className="text-gray-400 text-sm">{loading ? t('filter.loading') : t('filter.results', { count: achievements.length, s: achievements.length !== 1 ? 's' : '' })}</p>
        <div className="flex gap-1 bg-dark-800 rounded-lg p-0.5 border border-dark-600">
          <button onClick={() => setViewMode('grid')} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${viewMode === 'grid' ? 'bg-kahoot-purple text-white' : 'text-gray-400 hover:text-white'}`}><LayoutGrid className="w-3 h-3" />Grid</button>
          <button onClick={() => setViewMode('calendar')} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${viewMode === 'calendar' ? 'bg-kahoot-purple text-white' : 'text-gray-400 hover:text-white'}`}><CalendarDays className="w-3 h-3" />{t('calendar.title')}</button>
        </div>
      </div>

      {/* Grid or Calendar */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-16">
        {viewMode === 'calendar' && !loading ? (
          <CalendarView achievements={achievements} />
        ) : loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">{Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}</div>
        ) : achievements.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-24 h-24 rounded-full bg-dark-800 flex items-center justify-center mx-auto mb-6 border border-dark-600"><Award className="w-12 h-12 text-gray-600" /></div>
            <h3 className="text-xl font-bold text-white mb-2">{t('empty.title')}</h3>
            <p className="text-gray-400">{searchQuery || selectedDept || selectedTeacher ? t('empty.adjust') : t('empty.none')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {achievements.map((a, index) => {
              const images = a.files.filter((f) => f.file_type === 'image');
              const hasFiles = a.files.length > 0;
              const reactions = getReactions(a.reactions);
              return (
                <div key={a.id} className="bg-dark-800 rounded-2xl overflow-hidden border border-dark-600 card-hover animate-slide-up" style={{ animationDelay: `${Math.min(index * 60, 600)}ms` }}>
                  <Link href={`/achievement/${a.id}`} className="block">
                    <div className="relative h-48 overflow-hidden">
                      {images.length > 0 ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={`/uploads/${a.id}/${images[0].stored_name}`} alt={a.title} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <div className={`w-full h-full bg-gradient-to-br ${getDeptColor(a.department)} flex items-center justify-center`}><Award className="w-12 h-12 text-white/30" /></div>
                      )}
                      <div className="absolute top-3 left-3"><span className="dept-badge px-3 py-1 rounded-full text-xs font-bold text-white shadow-lg">{a.department}</span></div>
                      {a.categories && a.categories.split(',').filter(Boolean).slice(0, 2).map((c: string, ci: number) => (<span key={ci} className="absolute top-3 ml-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-black/50 backdrop-blur-md text-white">{c.trim()}</span>))}
                      {hasFiles && <div className="absolute top-3 right-3"><div className="bg-black/50 backdrop-blur-md px-2 py-1 rounded-full text-xs text-white flex items-center gap-1"><ImageIcon className="w-3 h-3" />{a.files.length}</div></div>}
                      {a.is_pinned ? <div className="absolute bottom-3 right-3"><div className="bg-kahoot-yellow/90 px-2 py-0.5 rounded-full text-[10px] font-bold text-black">📌 Pinned</div></div> : null}
                    </div>
                    <div className="p-5">
                      <h3 className="font-bold text-white mb-2 line-clamp-2">{a.title}</h3>
                      {a.description && <p className="text-gray-400 text-sm line-clamp-2 mb-3">{a.description}</p>}
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <div className="flex items-center gap-1.5"><User className="w-3 h-3" /><span>{a.teacher_name}</span></div>
                        {a.event_date && <div className="flex items-center gap-1.5"><Calendar className="w-3 h-3" /><span>{new Date(a.event_date).toLocaleDateString()}</span></div>}
                      </div>
                    </div>
                  </Link>
                  {/* Reactions bar */}
                  <div className="px-5 pb-4 flex items-center gap-1.5 flex-wrap">
                    {REACTIONS.slice(0, 4).map((emoji) => {
                      const count = reactions[emoji] || 0;
                      return (
                        <button key={emoji} onClick={(e) => { e.preventDefault(); handleReact(a.id, emoji); }} disabled={reacting === a.id}
                          className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs transition-all border ${count > 0 ? 'bg-kahoot-purple/15 border-kahoot-purple/40 text-white' : 'bg-dark-700 border-dark-600 text-gray-500 hover:border-gray-500'}`}>
                          <span>{emoji}</span>{count > 0 && <span className="font-bold">{count}</span>}
                        </button>
                      );
                    })}
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
                {(lightbox.achievement.categories || '').split(',').filter(Boolean).map((c: string, ci: number) => (<span key={ci} className="px-2 py-0.5 rounded-full text-xs bg-dark-700 text-gray-300 border border-dark-600">{c.trim()}</span>))}
              </div>
            </div>
            <button onClick={() => setLightbox(null)} className="w-10 h-10 rounded-full bg-dark-700 hover:bg-dark-600 flex items-center justify-center transition-colors"><X className="w-5 h-5 text-white" /></button>
          </div>
          <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
            {imageFiles.length > 0 ? (
              <div className="flex-1 flex items-center justify-center relative p-4">
                {imageFiles.length > 1 && <button onClick={(e) => { e.stopPropagation(); navigateLightbox(-1); }} disabled={lightbox.imageIndex === 0} className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-dark-800/80 hover:bg-dark-700 flex items-center justify-center disabled:opacity-30 z-10 border border-dark-600"><ChevronLeft className="w-6 h-6 text-white" /></button>}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={`/uploads/${lightbox.achievement.id}/${imageFiles[lightbox.imageIndex]?.stored_name}`} alt={lightbox.achievement.title} className="max-w-full max-h-full object-contain rounded-xl" onClick={(e) => e.stopPropagation()} />
                {imageFiles.length > 1 && <button onClick={(e) => { e.stopPropagation(); navigateLightbox(1); }} disabled={lightbox.imageIndex === imageFiles.length - 1} className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-dark-800/80 hover:bg-dark-700 flex items-center justify-center disabled:opacity-30 z-10 border border-dark-600"><ChevronRight className="w-6 h-6 text-white" /></button>}
                {imageFiles.length > 1 && <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">{imageFiles.map((_, i) => (<button key={i} onClick={(e) => { e.stopPropagation(); setLightbox({ ...lightbox, imageIndex: i }); }} className={`w-2 h-2 rounded-full transition-all ${i === lightbox.imageIndex ? 'bg-kahoot-yellow w-6' : 'bg-white/40'}`} />))}</div>}
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center p-4"><div className={`w-64 h-64 rounded-3xl bg-gradient-to-br ${getDeptColor(lightbox.achievement.department)} flex items-center justify-center`}><Award className="w-24 h-24 text-white/30" /></div></div>
            )}
            <div className={`w-full lg:w-96 bg-dark-800 border-l border-dark-600 p-6 overflow-y-auto ${language === 'ar' ? 'lg:border-l-0 lg:border-r' : ''}`}>
              <Link href={`/achievement/${lightbox.achievement.id}`} className="inline-flex items-center gap-1 text-kahoot-purple text-sm hover:underline mb-4">
                {language === 'ar' ? 'عرض التفاصيل' : 'View full details'} →
              </Link>
              {lightbox.achievement.description && <div className="mb-6"><h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">{t('lightbox.description')}</h3><p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">{lightbox.achievement.description}</p></div>}
              {(lightbox.achievement.event_date && formatDate(lightbox.achievement.event_date)) && <div className="mb-6"><h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">{t('lightbox.date')}</h3><p className="text-gray-300 text-sm flex items-center gap-2"><Calendar className="w-4 h-4 text-kahoot-yellow" />{formatDate(lightbox.achievement.event_date)}</p></div>}
              {pdfFiles.length > 0 && <div><h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">{t('lightbox.attachments')}</h3><div className="space-y-2">{pdfFiles.map((f) => (<a key={f.id} href={`/uploads/${lightbox.achievement.id}/${f.stored_name}`} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="flex items-center gap-3 p-3 rounded-xl bg-dark-700 hover:bg-dark-600 border border-dark-600 transition-all group"><div className="w-10 h-10 rounded-lg bg-kahoot-red/20 flex items-center justify-center"><FileText className="w-5 h-5 text-kahoot-red" /></div><div className="flex-1 min-w-0"><p className="text-sm text-white truncate">{f.original_name}</p><p className="text-xs text-gray-500">{(f.size / 1024).toFixed(1)} KB</p></div><Download className="w-4 h-4 text-gray-400 group-hover:text-kahoot-yellow transition-colors" /></a>))}</div></div>}
            </div>
          </div>
        </div>
      )}

      <footer className="bg-dark-800/50 border-t border-dark-600 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <p className="text-gray-500 text-sm">© {new Date().getFullYear()} {settings.school_name || 'School Achievements'}. {t('footer.builtWith')} <span className="text-kahoot-red">♥</span> {t('footer.vibes')}</p>
        </div>
      </footer>
    </div>
  );
}
