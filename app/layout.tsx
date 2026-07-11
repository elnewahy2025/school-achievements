import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/components/AuthContext';
import { SettingsProvider } from '@/components/SettingsContext';
import Navbar from '@/components/Navbar';

export const metadata: Metadata = {
  title: 'School Achievements 🏆',
  description: 'A polished web app for showcasing student achievements',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" dir="ltr" data-theme="dark" suppressHydrationWarning>
      <body className="bg-dark-900 text-white min-h-screen antialiased">
        <SettingsProvider>
          <AuthProvider>
            <Navbar />
            <main>{children}</main>
          </AuthProvider>
        </SettingsProvider>
      </body>
    </html>
  );
}
