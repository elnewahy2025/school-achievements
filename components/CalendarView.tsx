'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Award } from 'lucide-react';
import { useSettings } from './SettingsContext';

interface Achievement { id: number; title: string; department: string; event_date: string | null; created_at: string; files: any[]; }

const DEPT_COLORS: Record<string, string> = { 'Science': '#10b981', 'Mathematics': '#3b82f6', 'English': '#8b5cf6', 'History': '#f59e0b', 'Arts': '#ec4899', 'Technology': '#06b6d4', 'Administration': '#64748b' };

export default function CalendarView({ achievements }: { achievements: Achievement[] }) {
  const { language } = useSettings();
  const [currentDate, setCurrentDate] = useState(new Date());
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = useMemo(() => {
    const en = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const ar = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
    return language === 'ar' ? ar : en;
  }, [language]);

  const dayNames = useMemo(() => {
    return language === 'ar' ? ['أحد', 'إثن', 'ثلا', 'أرب', 'خمي', 'جمع', 'سبت'] : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  }, [language]);

  // Map achievements by date
  const achievementsByDate = useMemo(() => {
    const map: Record<string, Achievement[]> = {};
    achievements.forEach((a) => {
      const dateStr = a.event_date || a.created_at?.split(' ')[0];
      if (dateStr) {
        const key = dateStr.split('T')[0];
        if (!map[key]) map[key] = [];
        map[key].push(a);
      }
    });
    return map;
  }, [achievements]);

  // Calendar grid
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div className="bg-dark-800 rounded-2xl border border-dark-600 p-6">
      {/* Month navigation */}
      <div className="flex items-center justify-between mb-6">
        <button onClick={prevMonth} className="w-9 h-9 rounded-lg bg-dark-700 hover:bg-dark-600 flex items-center justify-center transition-colors">
          {language === 'ar' ? <ChevronRight className="w-4 h-4 text-gray-300" /> : <ChevronLeft className="w-4 h-4 text-gray-300" />}
        </button>
        <h3 className="text-lg font-bold text-white">{monthNames[month]} {year}</h3>
        <button onClick={nextMonth} className="w-9 h-9 rounded-lg bg-dark-700 hover:bg-dark-600 flex items-center justify-center transition-colors">
          {language === 'ar' ? <ChevronLeft className="w-4 h-4 text-gray-300" /> : <ChevronRight className="w-4 h-4 text-gray-300" />}
        </button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {dayNames.map((d) => (
          <div key={d} className="text-center text-xs font-medium text-gray-500 py-2">{d}</div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {cells.map((day, i) => {
          if (day === null) return <div key={`empty-${i}`} />;
          const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const dayAchievements = achievementsByDate[dateStr] || [];
          const isToday = dateStr === todayStr;
          const hasAchievements = dayAchievements.length > 0;

          return (
            <div key={day} className={`relative min-h-[60px] sm:min-h-[80px] rounded-lg p-1.5 transition-colors ${isToday ? 'bg-kahoot-purple/20 border border-kahoot-purple/40' : hasAchievements ? 'bg-dark-700 border border-dark-600 hover:border-dark-500' : 'border border-transparent hover:bg-dark-700/50'}`}>
              <span className={`text-xs font-medium ${isToday ? 'text-kahoot-purple' : 'text-gray-400'}`}>{day}</span>
              {hasAchievements && (
                <div className="mt-1 space-y-0.5">
                  {dayAchievements.slice(0, 2).map((a) => (
                    <Link key={a.id} href={`/achievement/${a.id}`} className="block truncate">
                      <div className="flex items-center gap-1 px-1 py-0.5 rounded text-[9px] bg-dark-600 hover:bg-dark-500 transition-colors">
                        <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: DEPT_COLORS[a.department] || '#7b2ff2' }} />
                        <span className="text-white truncate">{a.title}</span>
                      </div>
                    </Link>
                  ))}
                  {dayAchievements.length > 2 && (
                    <span className="text-[9px] text-gray-500 px-1">+{dayAchievements.length - 2} more</span>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 mt-4 pt-4 border-t border-dark-600">
        {Object.entries(DEPT_COLORS).map(([dept, color]) => (
          <div key={dept} className="flex items-center gap-1.5 text-xs text-gray-400">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
            {dept}
          </div>
        ))}
      </div>
    </div>
  );
}
