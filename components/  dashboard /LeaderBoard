import { motion } from 'framer-motion';
import { Trophy, TrendingUp, Phone, CalendarCheck } from 'lucide-react';

export default function Leaderboard({ callLogs, activities, deals }) {
  // Calculate rep stats
  const repStats = {};
  
  callLogs.forEach(log => {
    const rep = log.assigned_to || log.created_by || 'Unknown';
    if (!repStats[rep]) repStats[rep] = { calls: 0, bookings: 0, conversions: 0 };
    repStats[rep].calls++;
    if (log.disposition === 'BKD') repStats[rep].bookings++;
    if (log.disposition === 'sale') repStats[rep].conversions++;
  });

  deals.filter(d => d.stage === 'won').forEach(deal => {
    const rep = deal.assigned_to || deal.created_by || 'Unknown';
    if (!repStats[rep]) repStats[rep] = { calls: 0, bookings: 0, conversions: 0 };
    repStats[rep].conversions++;
  });

  const sorted = Object.entries(repStats)
    .map(([email, stats]) => ({ email, ...stats, score: stats.calls * 1 + stats.bookings * 5 + stats.conversions * 10 }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);

  const medals = ['🥇', '🥈', '🥉'];

  return (
    <div className="rounded-2xl p-5 theme-transition" style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--border-subtle)' }}>
      <div className="flex items-center gap-2 mb-4">
        <Trophy className="w-5 h-5" style={{ color: '#CE6969' }} />
        <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Leaderboard</h3>
      </div>
      {sorted.length === 0 ? (
        <p className="text-sm text-center py-6" style={{ color: 'var(--text-muted)' }}>No activity yet</p>
      ) : (
        <div className="space-y-3">
          {sorted.map((rep, i) => (
            <motion.div
              key={rep.email}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-center gap-3 p-3 rounded-xl"
              style={{ backgroundColor: 'var(--bg-surface-hover)' }}
            >
              <span className="text-lg w-8 text-center">{medals[i] || `#${i + 1}`}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                  {rep.email.split('@')[0]}
                </p>
                <div className="flex gap-3 mt-1">
                  <span className="text-xs flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
                    <Phone className="w-3 h-3" />{rep.calls}
                  </span>
                  <span className="text-xs flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
                    <CalendarCheck className="w-3 h-3" />{rep.bookings}
                  </span>
                  <span className="text-xs flex items-center gap-1" style={{ color: '#CE6969' }}>
                    <TrendingUp className="w-3 h-3" />{rep.conversions}
                  </span>
                </div>
              </div>
              <span className="text-sm font-bold" style={{ color: '#CE6969' }}>{rep.score}</span>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
