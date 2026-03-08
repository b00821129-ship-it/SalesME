import { Link, useLocation } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useTheme } from '../ThemeProvider';
import {
  LayoutDashboard, Calendar, Users, UserPlus, ListTodo,
  Wrench, FileText, Settings, Phone, Sun, Moon, ChevronLeft, ChevronRight, BookOpen, Swords
} from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard, page: 'Dashboard' },
  { label: 'Dialer', icon: Phone, page: 'Dialer' },
  { label: 'Scripts & Objections', icon: Swords, page: 'ScriptsObjections' },
  { label: 'Pipeline', icon: Users, page: 'Pipeline' },
  { label: 'Leads', icon: UserPlus, page: 'Leads' },
  { label: 'Calendar', icon: Calendar, page: 'CalendarView' },
  { label: 'Tasks', icon: ListTodo, page: 'Tasks' },
  { label: 'SOPs', icon: BookOpen, page: 'SOPs' },
  { label: 'Settings', icon: Settings, page: 'Settings' },
];

export default function Sidebar({ currentPageName }) {
  const { theme, toggleTheme } = useTheme();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <motion.nav
      animate={{ width: collapsed ? 72 : 240 }}
      transition={{ duration: 0.2, ease: 'easeInOut' }}
      className="h-screen fixed left-0 top-0 z-50 flex flex-col theme-transition"
      style={{ backgroundColor: 'var(--nav-bg)', borderRight: '1px solid var(--border-subtle)' }}
    >
      {/* Logo */}
      <div className="h-16 flex items-center px-5 gap-3 shrink-0" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: '#CE6969' }}>
          <Phone className="w-4 h-4 text-white" />
        </div>
        <AnimatePresence>
          {!collapsed && (
            <motion.span
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
              className="font-bold text-lg whitespace-nowrap overflow-hidden"
              style={{ color: 'var(--text-primary)' }}
            >
              SalesME
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* Nav Items */}
      <div className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {navItems.map(item => {
          const isActive = currentPageName === item.page;
          return (
            <Link
              key={item.page}
              to={createPageUrl(item.page)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative ${
                collapsed ? 'justify-center' : ''
              }`}
              style={{
                backgroundColor: isActive ? 'rgba(206,105,105,0.12)' : 'transparent',
                color: isActive ? '#CE6969' : 'var(--nav-text)',
              }}
              onMouseEnter={e => { if (!isActive) e.currentTarget.style.backgroundColor = 'var(--bg-surface-hover)'; }}
              onMouseLeave={e => { if (!isActive) e.currentTarget.style.backgroundColor = 'transparent'; }}
            >
              <item.icon className="w-5 h-5 shrink-0" />
              <AnimatePresence>
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: 'auto' }}
                    exit={{ opacity: 0, width: 0 }}
                    className="whitespace-nowrap overflow-hidden"
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
              {isActive && (
                <motion.div
                  layoutId="activeIndicator"
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 rounded-r-full"
                  style={{ backgroundColor: '#CE6969' }}
                />
              )}
            </Link>
          );
        })}
      </div>

      {/* Bottom Controls */}
      <div className="p-3 space-y-1 shrink-0" style={{ borderTop: '1px solid var(--border-subtle)' }}>
        <button
          onClick={toggleTheme}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium w-full transition-all duration-200 ${
            collapsed ? 'justify-center' : ''
          }`}
          style={{ color: 'var(--nav-text)' }}
          onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'var(--bg-surface-hover)'; }}
          onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; }}
        >
          {theme === 'dark' ? <Sun className="w-5 h-5 shrink-0" /> : <Moon className="w-5 h-5 shrink-0" />}
          {!collapsed && <span>{theme === 'dark' ? 'Clear Mode' : 'Dark Mode'}</span>}
        </button>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium w-full transition-all duration-200 ${
            collapsed ? 'justify-center' : ''
          }`}
          style={{ color: 'var(--nav-text)' }}
          onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'var(--bg-surface-hover)'; }}
          onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; }}
        >
          {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
          {!collapsed && <span>Collapse</span>}
        </button>
      </div>
    </motion.nav>
  );
}
