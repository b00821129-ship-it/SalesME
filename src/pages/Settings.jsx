import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useTheme } from '../components/ThemeProvider';
import { Sun, Moon, User, Bell, Shield, Palette, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion } from 'framer-motion';

export default function Settings() {
  const { theme, toggleTheme } = useTheme();
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>Settings</h1>
      <p className="text-sm mb-8" style={{ color: 'var(--text-secondary)' }}>Manage your preferences</p>

      <div className="space-y-4">
        {/* Profile */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl p-6 theme-transition"
          style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--border-subtle)' }}>
          <div className="flex items-center gap-3 mb-4">
            <User className="w-5 h-5" style={{ color: '#CE6969' }} />
            <h2 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Profile</h2>
          </div>
          <div className="space-y-3">
            <div>
              <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Full Name</p>
              <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{user?.full_name || '—'}</p>
            </div>
            <div>
              <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Email</p>
              <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{user?.email || '—'}</p>
            </div>
            <div>
              <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Role</p>
              <p className="text-sm font-medium capitalize" style={{ color: 'var(--text-primary)' }}>{user?.role || '—'}</p>
            </div>
          </div>
        </motion.div>

        {/* Appearance */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
          className="rounded-2xl p-6 theme-transition"
          style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--border-subtle)' }}>
          <div className="flex items-center gap-3 mb-4">
            <Palette className="w-5 h-5" style={{ color: '#83A2DB' }} />
            <h2 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Appearance</h2>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Theme</p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Switch between clear and dark mode</p>
            </div>
            <button
              onClick={toggleTheme}
              className="w-14 h-8 rounded-full flex items-center px-1 transition-all"
              style={{ backgroundColor: theme === 'dark' ? '#CE6969' : 'var(--border-color)' }}
            >
              <motion.div
                animate={{ x: theme === 'dark' ? 22 : 0 }}
                className="w-6 h-6 rounded-full flex items-center justify-center bg-white shadow-sm"
              >
                {theme === 'dark' ? <Moon className="w-3 h-3 text-gray-700" /> : <Sun className="w-3 h-3 text-gray-700" />}
              </motion.div>
            </button>
          </div>
        </motion.div>

        {/* Sign Out */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Button variant="outline" className="rounded-xl" style={{ borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }}
            onClick={() => base44.auth.logout()}>
            <LogOut className="w-4 h-4 mr-2" />Sign Out
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
