import { motion } from 'framer-motion';

export default function StatCard({ title, value, subtitle, icon: Icon, accent = false }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl p-5 theme-transition"
      style={{
        backgroundColor: accent ? '#CE6969' : 'var(--card-bg)',
        boxShadow: 'var(--shadow-sm)',
        border: accent ? 'none' : '1px solid var(--border-subtle)',
      }}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider mb-1"
            style={{ color: accent ? 'rgba(255,255,255,0.7)' : 'var(--text-muted)' }}>
            {title}
          </p>
          <p className="text-2xl font-bold" style={{ color: accent ? '#fff' : 'var(--text-primary)' }}>
            {value}
          </p>
          {subtitle && (
            <p className="text-xs mt-1" style={{ color: accent ? 'rgba(255,255,255,0.6)' : 'var(--text-secondary)' }}>
              {subtitle}
            </p>
          )}
        </div>
        {Icon && (
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: accent ? 'rgba(255,255,255,0.2)' : 'rgba(206,105,105,0.1)' }}>
            <Icon className="w-5 h-5" style={{ color: accent ? '#fff' : '#CE6969' }} />
          </div>
        )}
      </div>
    </motion.div>
  );
}
