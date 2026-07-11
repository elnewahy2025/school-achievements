'use client';

import Link from 'next/link';
import { useAuth } from './AuthContext';
import { useSettings } from './SettingsContext';
import { Award, LayoutDashboard, Shield, LogOut, User, Home, Sun, Moon } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { theme, language, toggleTheme, toggleLanguage } = useSettings();

  return (
    <nav className="bg-dark-800/95 backdrop-blur-md border-b border-dark-600 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-kahoot-purple to-pink-500 flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg shadow-kahoot-purple/30">
              <Award className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold text-white hidden sm:block">
              <span className="text-kahoot-yellow">School</span> Achievements
            </span>
          </Link>

          <div className="flex items-center gap-1 sm:gap-2">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="w-9 h-9 rounded-lg flex items-center justify-center text-gray-300 hover:text-kahoot-yellow hover:bg-dark-700 transition-all"
              title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Language Toggle */}
            <button
              onClick={toggleLanguage}
              className="h-9 px-2.5 rounded-lg flex items-center gap-1 text-xs font-bold text-gray-300 hover:text-kahoot-purple hover:bg-dark-700 transition-all border border-dark-600"
              title={language === 'en' ? 'تبديل إلى العربية' : 'Switch to English'}
            >
              <span className={language === 'ar' ? 'text-kahoot-purple' : ''}>EN</span>
              <span className="text-gray-500">/</span>
              <span className={language === 'ar' ? '' : 'text-kahoot-purple'}>عربي</span>
            </button>

            {/* Divider */}
            <div className="w-px h-6 bg-dark-600 mx-1 hidden sm:block" />

            <Link
              href="/"
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-300 hover:text-white hover:bg-dark-700 transition-all text-sm"
            >
              <Home className="w-4 h-4" />
              <span className="hidden sm:inline">{language === 'ar' ? 'المعرض' : 'Gallery'}</span>
            </Link>

            {user ? (
              <>
                <Link
                  href="/teacher/dashboard"
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-300 hover:text-white hover:bg-dark-700 transition-all text-sm"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span className="hidden sm:inline">{language === 'ar' ? 'لوحة التحكم' : 'Dashboard'}</span>
                </Link>

                {user.is_admin === 1 && (
                  <Link
                    href="/admin"
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-300 hover:text-white hover:bg-kahoot-red/20 hover:text-kahoot-red transition-all text-sm"
                  >
                    <Shield className="w-4 h-4" />
                    <span className="hidden sm:inline">{language === 'ar' ? 'الإدارة' : 'Admin'}</span>
                  </Link>
                )}

                <div className="flex items-center gap-2 ml-1 pl-3 border-l border-dark-600">
                  <div className="flex items-center gap-2 text-sm text-gray-300">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-kahoot-purple to-kahoot-blue flex items-center justify-center">
                      <User className="w-4 h-4 text-white" />
                    </div>
                    <span className="hidden md:inline">{user.full_name}</span>
                  </div>
                  <button
                    onClick={logout}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-400 hover:text-kahoot-red hover:bg-kahoot-red/10 transition-all text-sm"
                    title={language === 'ar' ? 'تسجيل الخروج' : 'Logout'}
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </>
            ) : (
              <Link
                href="/login"
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-kahoot-purple to-kahoot-blue text-white hover:shadow-lg hover:shadow-kahoot-purple/30 transition-all text-sm font-medium"
              >
                <User className="w-4 h-4" />
                {language === 'ar' ? 'تسجيل الدخول' : 'Login'}
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
