'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useSettings } from '@/components/SettingsContext';
import { Award, Calendar, User, ArrowLeft, Mail, BookOpen, FileText, Loader2 } from 'lucide-react';

interface Teacher { id: number; full_name: string; department: string; bio: string; avatar_url: string; created_at: string; }
interface Achievement { id: number; title: string; description: string; department: string; teacher_name: string; event_date: string | null; reactions: string; files: any[]; created_at: string; }

const DEPT_COLORS: Record<string, string> = { 'Science': 'from-emerald-500 to-teal-600', 'Mathematics': 'from-blue-500 to-indigo-600', 'English': 'from-purple-500 to-violet-600', 'History': 'from-amber-500 to-orange-600', 'Arts': 'from-pink-500 to-rose-600', 'Technology': 'from-cyan-500 to-blue-600', 'Administration': 'from-gray-500 to-slate-600' };
function getDeptColor(d: string) { return DEPT_COLORS[d] || 'from-kahoot-purple to-kahoot-blue'; }

export default function TeacherProfile() {
  const { t, language } = useSettings();
  const params = useParams();
  const router = useRouter();
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/teachers/${params.id}`).then((r) => r.json()).then((data) => {
      if (data.error) { router.push('/'); return; }
      setTeacher(data.teacher);
      setAchievements(data.achievements || []);
    }).catch(() => router.push('/')).finally(() => setLoading(false));
  }, [params.id, router]);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 text-kahoot-purple animate-spin" /></div>;
  if (!teacher) return null;

  const totalReactions = achievements.reduce((sum, a) => { try { return sum + Object.values(JSON.parse(a.reactions || '{}')).reduce((x: number, y: any) => x + y, 0); } catch { return sum; } }, 0);

  return (
    <div className="min-h-screen pb-16">
      {/* Hero */}
      <div className={`bg-gradient-to-br ${getDeptColor(teacher.department)} relative`}>
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 py-12">
          <button onClick={() => router.back()} className="flex items-center gap-2 text-white/70 hover:text-white transition-colors text-sm mb-6">
            <ArrowLeft className="w-4 h-4" />{language === 'ar' ? 'العودة' : 'Back'}
          </button>
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white text-4xl font-black border-2 border-white/30">
              {teacher.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={teacher.avatar_url} alt={teacher.full_name} className="w-full h-full object-cover rounded-2xl" />
              ) : teacher.full_name[0]}
            </div>
            <div>
              <h1 className="text-3xl font-black text-white mb-1">{teacher.full_name}</h1>
              <div className="flex items-center gap-3 text-white/80 text-sm">
                <span className="flex items-center gap-1"><BookOpen className="w-4 h-4" />{teacher.department}</span>
                <span>·</span>
                <span>{achievements.length} {language === 'ar' ? 'إنجاز' : 'achievements'}</span>
                {totalReactions > 0 && <><span>·</span><span>🎉 {totalReactions} {language === 'ar' ? 'تفاعل' : 'reactions'}</span></>}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {/* Bio */}
        {teacher.bio && (
          <div className="mb-8 p-6 rounded-2xl bg-dark-800 border border-dark-600">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">{language === 'ar' ? 'السيرة الذاتية' : 'About'}</h3>
            <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">{teacher.bio}</p>
          </div>
        )}

        {/* Achievements */}
        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <Award className="w-5 h-5 text-kahoot-yellow" />
          {language === 'ar' ? 'إنجازات' : 'Achievements'} ({achievements.length})
        </h2>
        {achievements.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Award className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>{language === 'ar' ? 'لا توجد إنجازات بعد' : 'No achievements yet'}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {achievements.map((a) => {
              const images = a.files.filter((f: any) => f.file_type === 'image');
              return (
                <Link key={a.id} href={`/achievement/${a.id}`} className="bg-dark-800 rounded-2xl overflow-hidden border border-dark-600 card-hover block">
                  <div className="relative h-40 overflow-hidden">
                    {images.length > 0 ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={`/uploads/${a.id}/${images[0].stored_name}`} alt={a.title} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className={`w-full h-full bg-gradient-to-br ${getDeptColor(a.department)} flex items-center justify-center`}><Award className="w-10 h-10 text-white/30" /></div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-white text-sm mb-1 line-clamp-2">{a.title}</h3>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      {a.event_date && <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{new Date(a.event_date).toLocaleDateString()}</span>}
                      {(() => { try { const r = JSON.parse(a.reactions || '{}'); const total = Object.values(r).reduce((x: number, y: any) => x + y, 0); return total > 0 ? <span>🎉 {total}</span> : null; } catch { return null; } })()}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
