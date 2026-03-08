import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import moment from 'moment';
import { ChevronLeft, ChevronRight, Plus, Phone, Mail, Calendar as CalIcon, Users, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { motion } from 'framer-motion';

const typeIcons = { call: Phone, email: Mail, meeting: Users, task: CalIcon, follow_up: Clock, note: CalIcon };
const typeColors = { call: '#CE6969', email: '#83A2DB', meeting: '#8B5CF6', task: '#F59E0B', follow_up: '#22C55E', note: '#6B7280' };

export default function CalendarView() {
  const queryClient = useQueryClient();
  const { data: activities = [] } = useQuery({ queryKey: ['activities'], queryFn: () => base44.entities.Activity.list() });
  const [currentDate, setCurrentDate] = useState(moment());
  const [view, setView] = useState('week');
  const [showCreate, setShowCreate] = useState(false);
  const [newAct, setNewAct] = useState({ title: '', type: 'call', description: '', scheduled_at: moment().format('YYYY-MM-DDTHH:mm') });

  const createActivity = useMutation({
    mutationFn: (data) => base44.entities.Activity.create(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['activities'] }); setShowCreate(false); },
  });

  const hours = Array.from({ length: 14 }, (_, i) => i + 7); // 7am-8pm

  const weekDays = useMemo(() => {
    const start = moment(currentDate).startOf('week');
    return Array.from({ length: 7 }, (_, i) => moment(start).add(i, 'days'));
  }, [currentDate]);

  const getActivitiesForSlot = (day, hour) => {
    return activities.filter(a => {
      if (!a.scheduled_at) return false;
      const m = moment(a.scheduled_at);
      return m.isSame(day, 'day') && m.hour() === hour;
    });
  };

  const navigate = (dir) => {
    setCurrentDate(prev => moment(prev).add(dir, view === 'week' ? 'week' : 'day'));
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Calendar</h1>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            {view === 'week' ? `${weekDays[0].format('MMM D')} - ${weekDays[6].format('MMM D, YYYY')}` : currentDate.format('dddd, MMMM D, YYYY')}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center rounded-xl overflow-hidden" style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--border-subtle)' }}>
            <button onClick={() => setView('day')} className="px-4 py-2 text-xs font-medium transition-all"
              style={{ backgroundColor: view === 'day' ? '#CE6969' : 'transparent', color: view === 'day' ? '#fff' : 'var(--text-secondary)' }}>Day</button>
            <button onClick={() => setView('week')} className="px-4 py-2 text-xs font-medium transition-all"
              style={{ backgroundColor: view === 'week' ? '#CE6969' : 'transparent', color: view === 'week' ? '#fff' : 'var(--text-secondary)' }}>Week</button>
          </div>
          <div className="flex items-center gap-1">
            <Button size="icon" variant="ghost" className="rounded-xl" onClick={() => navigate(-1)}>
              <ChevronLeft className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
            </Button>
            <Button variant="ghost" className="rounded-xl text-xs" onClick={() => setCurrentDate(moment())}
              style={{ color: 'var(--text-secondary)' }}>Today</Button>
            <Button size="icon" variant="ghost" className="rounded-xl" onClick={() => navigate(1)}>
              <ChevronRight className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
            </Button>
          </div>
          <Dialog open={showCreate} onOpenChange={setShowCreate}>
            <DialogTrigger asChild>
              <Button className="rounded-xl text-white" style={{ backgroundColor: '#CE6969' }}>
                <Plus className="w-4 h-4 mr-2" />Activity
              </Button>
            </DialogTrigger>
            <DialogContent style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}>
              <DialogHeader><DialogTitle style={{ color: 'var(--text-primary)' }}>Schedule Activity</DialogTitle></DialogHeader>
              <div className="space-y-3 pt-2">
                <Input placeholder="Title" value={newAct.title} onChange={e => setNewAct({ ...newAct, title: e.target.value })} className="rounded-xl" />
                <Select value={newAct.type} onValueChange={v => setNewAct({ ...newAct, type: v })}>
                  <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.keys(typeColors).map(t => <SelectItem key={t} value={t} className="capitalize">{t.replace('_', ' ')}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Input type="datetime-local" value={newAct.scheduled_at} onChange={e => setNewAct({ ...newAct, scheduled_at: e.target.value })} className="rounded-xl" />
                <Textarea placeholder="Description" value={newAct.description} onChange={e => setNewAct({ ...newAct, description: e.target.value })} className="rounded-xl" />
                <Button className="w-full rounded-xl text-white" style={{ backgroundColor: '#CE6969' }}
                  onClick={() => createActivity.mutate(newAct)} disabled={!newAct.title}>Schedule</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="rounded-2xl overflow-hidden theme-transition" style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--border-subtle)' }}>
        {/* Day Headers */}
        <div className="grid" style={{ gridTemplateColumns: `60px repeat(${view === 'week' ? 7 : 1}, 1fr)` }}>
          <div className="p-3" style={{ borderBottom: '1px solid var(--border-subtle)' }} />
          {(view === 'week' ? weekDays : [currentDate]).map(day => (
            <div key={day.format('YYYY-MM-DD')} className="p-3 text-center" style={{ borderBottom: '1px solid var(--border-subtle)', borderLeft: '1px solid var(--border-subtle)' }}>
              <p className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>{day.format('ddd')}</p>
              <p className="text-lg font-bold" style={{ color: day.isSame(moment(), 'day') ? '#CE6969' : 'var(--text-primary)' }}>{day.format('D')}</p>
            </div>
          ))}
        </div>

        {/* Time Grid */}
        <div className="max-h-[65vh] overflow-y-auto">
          {hours.map(hour => (
            <div key={hour} className="grid" style={{ gridTemplateColumns: `60px repeat(${view === 'week' ? 7 : 1}, 1fr)`, minHeight: 60 }}>
              <div className="p-2 text-right pr-3" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{moment().hour(hour).format('h A')}</span>
              </div>
              {(view === 'week' ? weekDays : [currentDate]).map(day => {
                const slotActivities = getActivitiesForSlot(day, hour);
                return (
                  <div key={`${day.format('YYYY-MM-DD')}-${hour}`} className="relative p-1"
                    style={{ borderBottom: '1px solid var(--border-subtle)', borderLeft: '1px solid var(--border-subtle)' }}>
                    {slotActivities.map(a => {
                      const Icon = typeIcons[a.type] || CalIcon;
                      return (
                        <motion.div
                          key={a.id}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="rounded-lg px-2 py-1 mb-1 flex items-center gap-1 text-white text-xs cursor-pointer"
                          style={{ backgroundColor: typeColors[a.type] || '#CE6969' }}
                        >
                          <Icon className="w-3 h-3 shrink-0" />
                          <span className="truncate">{a.title}</span>
                        </motion.div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
