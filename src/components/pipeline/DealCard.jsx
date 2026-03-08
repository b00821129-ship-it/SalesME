import { DollarSign, Calendar, User } from 'lucide-react';
import { motion } from 'framer-motion';

export default function DealCard({ deal, onClick }) {
  const priorityColor = {
    low: '#83A2DB',
    medium: '#F59E0B',
    high: '#CE6969',
    critical: '#DC2626',
  };

  return (
    <motion.div
      layout
      whileHover={{ scale: 1.02, boxShadow: 'var(--shadow-md)' }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onClick(deal)}
      className="rounded-xl p-4 cursor-pointer theme-transition"
      style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-sm)' }}
    >
      <div className="flex items-start justify-between mb-2">
        <h4 className="text-sm font-semibold truncate flex-1" style={{ color: 'var(--text-primary)' }}>{deal.title}</h4>
        <div className="w-2 h-2 rounded-full shrink-0 mt-1.5 ml-2" style={{ backgroundColor: priorityColor[deal.priority] || '#83A2DB' }} />
      </div>
      {deal.company_name && (
        <p className="text-xs mb-2 truncate" style={{ color: 'var(--text-muted)' }}>{deal.company_name}</p>
      )}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          <DollarSign className="w-3 h-3" style={{ color: '#CE6969' }} />
          <span className="text-xs font-semibold" style={{ color: '#CE6969' }}>{(deal.value || 0).toLocaleString()}</span>
        </div>
        {deal.expected_close_date && (
          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3" style={{ color: 'var(--text-muted)' }} />
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{deal.expected_close_date}</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}
