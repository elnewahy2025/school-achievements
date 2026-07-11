'use client';

import Link from 'next/link';
import { useAuth } from './AuthContext';
import { Award, LayoutDashboard, Shield, LogOut, User, Home } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();

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

          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-300 hover:text-white hover:bg-dark-700 transition-all text-sm"
            >
              <Home className="w-4 h-4" />
              <span className="hidden sm:inline">Gallery</span>
            </Link>

            {user ? (
              <>
                <Link
                  href="/teacher/dashboard"
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-300 hover:text-white hover:bg-dark-700 transition-all text-sm"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span className="hidden sm:inline">Dashboard</span>
                </Link>

                {user.is_admin === 1 && (
                  <Link
                    href="/admin"
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-300 hover:text-white hover:bg-kahoot-red/20 hover:text-kahoot-red transition-all text-sm"
                  >
                    <Shield className="w-4 h-4" />
                    <span className="hidden sm:inline">Admin</span>
                  </Link>
                )}

                <div className="flex items-center gap-2 ml-2 pl-3 border-l border-dark-600">
                  <div className="flex items-center gap-2 text-sm text-gray-300">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-kahoot-purple to-kahoot-blue flex items-center justify-center">
                      <User className="w-4 h-4 text-white" />
                    </div>
                    <span className="hidden md:inline">{user.full_name}</span>
                  </div>
                  <button
                    onClick={logout}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-400 hover:text-kahoot-red hover:bg-kahoot-red/10 transition-all text-sm"
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
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
