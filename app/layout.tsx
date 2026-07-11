import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/components/AuthContext';
import Navbar from '@/components/Navbar';

export const metadata: Metadata = {
  title: 'School Achievements 🏆',
  description: 'A polished web app for showcasing student achievements',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-dark-900 text-white min-h-screen antialiased">
        <AuthProvider>
          <Navbar />
          <main>{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}
