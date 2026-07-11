'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthContext';
import { useSettings } from '@/components/SettingsContext';
import { Award, LogIn, Eye, EyeOff, AlertCircle, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { t } = useSettings();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(username, password);
      const sessionRes = await fetch('/api/auth/session');
      const sessionData = await sessionRes.json();
      router.push(sessionData.user?.is_admin === 1 ? '/admin' : '/teacher/dashboard');
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-bounce-in">
        <div className="bg-dark-800 rounded-3xl border border-dark-600 p-8 shadow-2xl">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-kahoot-purple to-pink-500 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-kahoot-purple/30">
              <Award className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white">{t('login.welcome')}</h1>
            <p className="text-gray-400 text-sm mt-1">{t('login.subtitle')}</p>
          </div>
          {error && (
            <div className="bg-kahoot-red/10 border border-kahoot-red/30 rounded-xl p-4 mb-6 flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-kahoot-red shrink-0" />
              <p className="text-kahoot-red text-sm">{error}</p>
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">{t('login.username')}</label>
              <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required autoFocus
                className="w-full px-4 py-3 rounded-xl bg-dark-700 border border-dark-600 text-white placeholder-gray-400 text-sm"
                placeholder={t('login.usernamePlaceholder')} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">{t('login.password')}</label>
              <div className="relative">
                <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} required
                  className="w-full px-4 py-3 pr-12 rounded-xl bg-dark-700 border border-dark-600 text-white placeholder-gray-400 text-sm"
                  placeholder={t('login.passwordPlaceholder')} />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors">
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-kahoot-purple to-kahoot-blue text-white font-bold text-sm hover:shadow-lg hover:shadow-kahoot-purple/30 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
              {loading ? (<><Loader2 className="w-4 h-4 animate-spin" />{t('login.signingIn')}</>) : (<><LogIn className="w-4 h-4" />{t('login.signIn')}</>)}
            </button>
          </form>
          <div className="mt-6 pt-6 border-t border-dark-600">
            <p className="text-xs text-gray-500 text-center mb-2">{t('login.demo')}</p>
            <div className="bg-dark-700 rounded-xl p-3 text-xs text-center">
              <span className="text-gray-400">{t('login.admin')} </span>
              <span className="text-kahoot-yellow font-mono">admin</span>
              <span className="text-gray-500"> / </span>
              <span className="text-kahoot-yellow font-mono">admin123</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
