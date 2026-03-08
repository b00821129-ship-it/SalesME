import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { X, Building2, DollarSign, Calendar, Phone, Mail, FileText, Plus, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { motion } from 'framer-motion';

const stages = ['discovery', 'proposal', 'negotiation', 'contract', 'won', 'lost'];

export default function DealDetailPanel({ deal, onClose }) {
  const queryClient = useQueryClient();
  const [newNote, setNewNote] = useState('');
  
  const { data: activities = [] } = useQuery({
    queryKey: ['activities', deal.id],
    queryFn: () => base44.entities.Activity.filter({ deal_id: deal.id }),
  });

  const { data: tasks = [] } = useQuery({
    queryKey: ['tasks', deal.id],
    queryFn: () => base44.entities.Task.filter({ deal_id: deal.id }),
  });

  const updateDeal = useMutation({
    mutationFn: (data) => base44.entities.Deal.update(deal.id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['deals'] }),
  });

  const addActivity = useMutation({
    mutationFn: (data) => base44.entities.Activity.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['activities', deal.id] }),
  });

  const handleAddNote = () => {
    if (!newNote.trim()) return;
    addActivity.mutate({ type: 'note', title: 'Note', description: newNote, deal_id: deal.id, completed: true });
    setNewNote('');
  };

  const currentStageIdx = stages.indexOf(deal.stage);
  const progressPct = deal.stage === 'won' ? 100 : deal.stage === 'lost' ? 0 : ((currentStageIdx + 1) / (stages.length - 2)) * 100;

  return (
    <motion.div
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="fixed inset-y-0 right-0 w-full max-w-2xl z-50 overflow-y-auto theme-transition"
      style={{ backgroundColor: 'var(--bg-surface)', borderLeft: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-lg)' }}
    >
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>{deal.title}</h2>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{deal.company_name}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg" style={{ color: 'var(--text-muted)' }}>
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between text-xs mb-2" style={{ color: 'var(--text-muted)' }}>
            {stages.filter(s => s !== 'lost').map(s => (
              <span key={s} className="capitalize" style={{ color: stages.indexOf(s) <= currentStageIdx ? '#CE6969' : 'var(--text-muted)' }}>{s}</span>
            ))}
          </div>
          <div className="h-2 rounded-full" style={{ backgroundColor: 'var(--bg-surface-hover)' }}>
            <div className="h-full rounded-full transition-all duration-500" style={{ width: `${progressPct}%`, backgroundColor: '#CE6969' }} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          {/* Left - Data Hub */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Data Hub</h3>
            <div className="space-y-3">
              {[
                { icon: Building2, label: 'Organization', value: deal.company_name },
                { icon: DollarSign, label: 'Deal Value', value: `$${(deal.value || 0).toLocaleString()}` },
                { icon: DollarSign, label: 'Budget', value: deal.budget ? `$${deal.budget.toLocaleString()}` : '—' },
                { icon: Calendar, label: 'Close Date', value: deal.expected_close_date || '—' },
                { icon: Phone, label: 'Phone', value: deal.phone || '—' },
                { icon: Mail, label: 'Email', value: deal.email || '—' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <item.icon className="w-4 h-4 shrink-0" style={{ color: 'var(--text-muted)' }} />
                  <div>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{item.label}</p>
                    <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{item.value}</p>
                  </div>
                </div>
              ))}
            </div>

            {deal.service_areas && (
              <div>
                <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Service Areas</p>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{deal.service_areas}</p>
              </div>
            )}
          </div>

          {/* Right - Communication Hub */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Communication</h3>
            
            {/* Focus - Pending Tasks */}
            {tasks.filter(t => t.status !== 'completed').length > 0 && (
              <div className="rounded-xl p-3" style={{ backgroundColor: 'rgba(206,105,105,0.06)', border: '1px solid rgba(206,105,105,0.15)' }}>
                <p className="text-xs font-semibold mb-2" style={{ color: '#CE6969' }}>Focus</p>
                {tasks.filter(t => t.status !== 'completed').slice(0, 3).map(task => (
                  <div key={task.id} className="flex items-center gap-2 mb-1">
                    <CheckCircle className="w-3 h-3" style={{ color: 'var(--text-muted)' }} />
                    <span className="text-xs" style={{ color: 'var(--text-primary)' }}>{task.title}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Activity Log */}
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {activities.map(a => (
                <div key={a.id} className="flex items-start gap-2 p-2 rounded-lg" style={{ backgroundColor: 'var(--bg-surface-hover)' }}>
                  <FileText className="w-3 h-3 mt-0.5 shrink-0" style={{ color: 'var(--text-muted)' }} />
                  <div>
                    <p className="text-xs font-medium capitalize" style={{ color: 'var(--text-primary)' }}>{a.type}: {a.title}</p>
                    {a.description && <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{a.description}</p>}
                  </div>
                </div>
              ))}
              {activities.length === 0 && <p className="text-xs text-center py-4" style={{ color: 'var(--text-muted)' }}>No activity yet</p>}
            </div>

            {/* Add Note */}
            <div className="flex gap-2">
              <Input placeholder="Add a note..." value={newNote} onChange={e => setNewNote(e.target.value)}
                className="text-sm rounded-xl" style={{ backgroundColor: 'var(--bg-surface-hover)', border: 'none' }}
                onKeyDown={e => { if (e.key === 'Enter') handleAddNote(); }} />
              <Button size="icon" className="rounded-xl shrink-0" style={{ backgroundColor: '#CE6969' }} onClick={handleAddNote}>
                <Plus className="w-4 h-4 text-white" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
