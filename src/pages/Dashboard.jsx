import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Phone, Users, CalendarCheck, DollarSign, TrendingUp } from 'lucide-react';
import StatCard from '../components/ui/StatCard';
import Leaderboard from '../components/dashboard/Leaderboard';
import ActivityChart from '../components/dashboard/ActivityChart';
import { motion } from 'framer-motion';

export default function Dashboard() {
  const { data: deals = [] } = useQuery({ queryKey: ['deals'], queryFn: () => base44.entities.Deal.list() });
  const { data: leads = [] } = useQuery({ queryKey: ['leads'], queryFn: () => base44.entities.Lead.list() });
  const { data: callLogs = [] } = useQuery({ queryKey: ['callLogs'], queryFn: () => base44.entities.CallLog.list() });
  const { data: activities = [] } = useQuery({ queryKey: ['activities'], queryFn: () => base44.entities.Activity.list() });
  const { data: tasks = [] } = useQuery({ queryKey: ['tasks'], queryFn: () => base44.entities.Task.list() });

  const activeDeals = deals.filter(d => !['won', 'lost'].includes(d.stage));
  const wonDeals = deals.filter(d => d.stage === 'won');
  const totalRevenue = wonDeals.reduce((sum, d) => sum + (d.value || 0), 0);
  const pendingTasks = tasks.filter(t => t.status === 'pending');
  const todayBookings = callLogs.filter(l => l.disposition === 'BKD');

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Dashboard</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>Your sales command center</p>
      </motion.div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard title="Total Calls" value={callLogs.length} icon={Phone} />
        <StatCard title="Active Deals" value={activeDeals.length} icon={Users} />
        <StatCard title="Bookings" value={todayBookings.length} icon={CalendarCheck} />
        <StatCard title="Revenue" value={`$${totalRevenue.toLocaleString()}`} icon={DollarSign} accent />
        <StatCard title="Conversion" value={callLogs.length ? `${Math.round((wonDeals.length / Math.max(callLogs.length, 1)) * 100)}%` : '0%'} icon={TrendingUp} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ActivityChart callLogs={callLogs} />
        </div>
        <Leaderboard callLogs={callLogs} activities={activities} deals={deals} />
      </div>

      {/* Recent Activity & Pending Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-2xl p-5 theme-transition" style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--border-subtle)' }}>
          <h3 className="font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Recent Calls</h3>
          {callLogs.slice(0, 5).map((log, i) => (
            <div key={log.id} className="flex items-center gap-3 py-3" style={{ borderBottom: i < 4 ? '1px solid var(--border-subtle)' : 'none' }}>
              <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(206,105,105,0.1)' }}>
                <Phone className="w-4 h-4" style={{ color: '#CE6969' }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>{log.contact_name}</p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{log.phone_number}</p>
              </div>
              <span className="text-xs font-semibold px-2 py-1 rounded-full" style={{ backgroundColor: 'rgba(206,105,105,0.12)', color: '#CE6969' }}>
                {log.disposition || '—'}
              </span>
            </div>
          ))}
          {callLogs.length === 0 && <p className="text-sm text-center py-6" style={{ color: 'var(--text-muted)' }}>No calls yet</p>}
        </div>

        <div className="rounded-2xl p-5 theme-transition" style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--border-subtle)' }}>
          <h3 className="font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Pending Tasks</h3>
          {pendingTasks.slice(0, 5).map((task, i) => (
            <div key={task.id} className="flex items-center gap-3 py-3" style={{ borderBottom: i < 4 ? '1px solid var(--border-subtle)' : 'none' }}>
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: task.priority === 'urgent' ? '#CE6969' : task.priority === 'high' ? '#F59E0B' : '#83A2DB' }} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>{task.title}</p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{task.due_date || 'No due date'}</p>
              </div>
              <span className="text-xs px-2 py-1 rounded-full capitalize" style={{ backgroundColor: 'var(--bg-surface-hover)', color: 'var(--text-secondary)' }}>
                {task.priority}
              </span>
            </div>
          ))}
          {pendingTasks.length === 0 && <p className="text-sm text-center py-6" style={{ color: 'var(--text-muted)' }}>All caught up!</p>}
        </div>
      </div>
    </div>
  );
}
