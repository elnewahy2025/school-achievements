'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useSettings } from '@/components/SettingsContext';
import { Award, Calendar, User, FileText, Download, ChevronLeft, ChevronRight, Share2, Copy, Check, ArrowLeft, FileDown } from 'lucide-react';
import { exportSingleAchievementPdf } from '@/lib/exportPdf';

interface Achievement { id: number; title: string; description: string; department: string; teacher_id: number | null; teacher_name: string; event_date: string | null; reactions: string; categories: string; created_at: string; files: any[]; teacher?: any; }

const REACTIONS = ['🎉', '👏', '❤️', '🏆', '⭐', '🔥'];
const DEPT_COLORS: Record<string, string> = { 'Science': 'from-emerald-500 to-teal-600', 'Mathematics': 'from-blue-500 to-indigo-600', 'English': 'from-purple-500 to-violet-600', 'History': 'from-amber-500 to-orange-600', 'Arts': 'from-pink-500 to-rose-600', 'Technology': 'from-cyan-500 to-blue-600', 'Administration': 'from-gray-500 to-slate-600' };
function getDeptColor(d: string) { return DEPT_COLORS[d] || 'from-kahoot-purple to-kahoot-blue'; }

export default function AchievementDetail() {
  const { t, language } = useSettings();
  const params = useParams();
  const router = useRouter();
  const [achievement, setAchievement] = useState<Achievement | null>(null);
  const [loading, setLoading] = useState(true);
  const [imgIndex, setImgIndex] = useState(0);
  const [reactions, setReactions] = useState<Record<string, number>>({});
  const [copied, setCopied] = useState(false);
  const [reacting, setReacting] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/achievements/${params.id}/detail`).then((r) => r.json()).then((data) => {
      if (data.error) { router.push('/'); return; }
      setAchievement(data);
      try { setReactions(JSON.parse(data.reactions || '{}')); } catch { setReactions({}); }
    }).catch(() => router.push('/')).finally(() => setLoading(false));
  }, [params.id, router]);

  const handleReact = async (emoji: string) => {
    setReacting(emoji);
    try {
      const res = await fetch(`/api/achievements/${params.id}/react`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ emoji }), credentials: 'same-origin' });
      const data = await res.json();
      if (data.reactions) setReactions(data.reactions);
    } catch {} finally { setReacting(null); }
  };

  const handleShare = async (platform: string) => {
    const url = window.location.href;
    const text = `${achievement?.title} — School Achievements`;
    if (platform === 'copy') { await navigator.clipboard.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 2000); return; }
    const urls: Record<string, string> = { twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, whatsapp: `https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}` };
    window.open(urls[platform], '_blank', 'width=600,height=400');
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-4 border-kahoot-purple border-t-transparent rounded-full animate-spin" /></div>;
  if (!achievement) return null;

  const images = achievement.files.filter((f: any) => f.file_type === 'image');
  const pdfs = achievement.files.filter((f: any) => f.file_type === 'pdf');
  const totalReactions = Object.values(reactions).reduce((a, b) => a + b, 0);
  const formatDate = (d: string | null) => { if (!d) return null; const dt = new Date(d); return isNaN(dt.getTime()) ? null : dt.toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' }); };

  return (
    <div className="min-h-screen pb-16">
      {/* Back button */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-6">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm">
          <ArrowLeft className="w-4 h-4" />{language === 'ar' ? 'العودة' : 'Back'}
        </button>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Image Area */}
          <div className="lg:col-span-3">
            {images.length > 0 ? (
              <div className="relative rounded-2xl overflow-hidden bg-dark-800 border border-dark-600">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={`/uploads/${achievement.id}/${images[imgIndex]?.stored_name}`} alt={achievement.title} className="w-full aspect-video object-cover" />
                {images.length > 1 && (<>
                  <button onClick={() => setImgIndex(Math.max(0, imgIndex - 1))} disabled={imgIndex === 0} className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 hover:bg-black/70 flex items-center justify-center disabled:opacity-30 transition-all"><ChevronLeft className="w-5 h-5 text-white" /></button>
                  <button onClick={() => setImgIndex(Math.min(images.length - 1, imgIndex + 1))} disabled={imgIndex === images.length - 1} className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 hover:bg-black/70 flex items-center justify-center disabled:opacity-30 transition-all"><ChevronRight className="w-5 h-5 text-white" /></button>
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                    {images.map((_: any, i: number) => (<button key={i} onClick={() => setImgIndex(i)} className={`w-2 h-2 rounded-full transition-all ${i === imgIndex ? 'bg-white w-5' : 'bg-white/40'}`} />))}
                  </div>
                </>)}
              </div>
            ) : (
              <div className={`aspect-video rounded-2xl bg-gradient-to-br ${getDeptColor(achievement.department)} flex items-center justify-center`}>
                <Award className="w-24 h-24 text-white/20" />
              </div>
            )}
            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-2 mt-3 overflow-x-auto pb-2">
                {images.map((f: any, i: number) => (
                  <button key={f.id} onClick={() => setImgIndex(i)} className={`shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${i === imgIndex ? 'border-kahoot-purple' : 'border-transparent opacity-60 hover:opacity-100'}`}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={`/uploads/${achievement.id}/${f.stored_name}`} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="dept-badge px-3 py-1 rounded-full text-xs font-bold text-white">{achievement.department}</span>
                {achievement.categories && achievement.categories.split(',').filter(Boolean).map((c: string) => (
                  <span key={c} className="px-2 py-0.5 rounded-full text-xs bg-dark-700 text-gray-300 border border-dark-600">{c.trim()}</span>
                ))}
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white mb-4">{achievement.title}</h1>
              {achievement.description && <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">{achievement.description}</p>}
            </div>

            {/* Meta */}
            <div className="space-y-3">
              <Link href={`/teacher/${achievement.teacher_id}`} className="flex items-center gap-3 p-3 rounded-xl bg-dark-800 border border-dark-600 hover:border-kahoot-purple/50 transition-all group">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-kahoot-purple to-kahoot-blue flex items-center justify-center text-white font-bold text-sm">{achievement.teacher_name[0]}</div>
                <div><p className="text-white text-sm font-medium group-hover:text-kahoot-purple transition-colors">{achievement.teacher_name}</p><p className="text-xs text-gray-500">{achievement.department}</p></div>
              </Link>
              {achievement.event_date && formatDate(achievement.event_date) && (
                <div className="flex items-center gap-2 text-sm text-gray-400"><Calendar className="w-4 h-4 text-kahoot-yellow" />{formatDate(achievement.event_date)}</div>
              )}
            </div>

            {/* Reactions */}
            <div className="p-4 rounded-xl bg-dark-800 border border-dark-600">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-sm font-medium text-gray-300">{totalReactions > 0 ? `${totalReactions} ${language === 'ar' ? 'تفاعل' : 'reactions'}` : (language === 'ar' ? 'كن أول من يتفاعل' : 'Be the first to react')}</span>
              </div>
              <div className="flex gap-2 flex-wrap">
                {REACTIONS.map((emoji) => (
                  <button key={emoji} onClick={() => handleReact(emoji)} disabled={reacting === emoji}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm transition-all border ${reactions[emoji] ? 'bg-kahoot-purple/20 border-kahoot-purple/50 text-white' : 'bg-dark-700 border-dark-600 text-gray-400 hover:border-gray-500'}`}>
                    <span className="text-base">{emoji}</span>
                    {reactions[emoji] ? <span className="font-bold">{reactions[emoji]}</span> : null}
                  </button>
                ))}
              </div>
            </div>

            {/* Share */}
            <div className="p-4 rounded-xl bg-dark-800 border border-dark-600">
              <div className="flex items-center gap-2 mb-3"><Share2 className="w-4 h-4 text-gray-400" /><span className="text-sm font-medium text-gray-300">{language === 'ar' ? 'مشاركة' : 'Share'}</span></div>
              <div className="flex gap-2">
                <button onClick={() => handleShare('twitter')} className="px-3 py-2 rounded-lg bg-dark-700 hover:bg-dark-600 text-gray-300 text-xs transition-all">Twitter</button>
                <button onClick={() => handleShare('facebook')} className="px-3 py-2 rounded-lg bg-dark-700 hover:bg-dark-600 text-gray-300 text-xs transition-all">Facebook</button>
                <button onClick={() => handleShare('whatsapp')} className="px-3 py-2 rounded-lg bg-dark-700 hover:bg-dark-600 text-gray-300 text-xs transition-all">WhatsApp</button>
                <button onClick={() => handleShare('copy')} className="px-3 py-2 rounded-lg bg-dark-700 hover:bg-dark-600 text-gray-300 text-xs transition-all flex items-center gap-1">
                  {copied ? <><Check className="w-3 h-3 text-kahoot-green" />Copied!</> : <><Copy className="w-3 h-3" />Copy link</>}
                </button>
                <button onClick={() => exportSingleAchievementPdf(achievement, 'School Achievements')} className="px-3 py-2 rounded-lg bg-kahoot-purple/20 hover:bg-kahoot-purple/30 text-kahoot-purple text-xs transition-all flex items-center gap-1">
                  <FileDown className="w-3 h-3" />PDF
                </button>
              </div>
            </div>

            {/* PDFs */}
            {pdfs.length > 0 && (
              <div className="p-4 rounded-xl bg-dark-800 border border-dark-600">
                <p className="text-sm font-medium text-gray-300 mb-3">{language === 'ar' ? 'المرفقات' : 'Attachments'}</p>
                <div className="space-y-2">
                  {pdfs.map((f: any) => (
                    <a key={f.id} href={`/uploads/${achievement.id}/${f.stored_name}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 rounded-lg bg-dark-700 hover:bg-dark-600 border border-dark-600 transition-all group">
                      <FileText className="w-5 h-5 text-kahoot-red shrink-0" />
                      <div className="flex-1 min-w-0"><p className="text-sm text-white truncate">{f.original_name}</p><p className="text-xs text-gray-500">{(f.size / 1024).toFixed(1)} KB</p></div>
                      <Download className="w-4 h-4 text-gray-400 group-hover:text-kahoot-yellow transition-colors" />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
