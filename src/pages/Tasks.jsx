import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Plus, CheckCircle, Circle, Clock, Trash2, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { motion, AnimatePresence } from 'framer-motion';

export default function Tasks() {
  const queryClient = useQueryClient();
  const { data: tasks = [] } = useQuery({ queryKey: ['tasks'], queryFn: () => base44.entities.Task.list('-created_date') });
  const [filter, setFilter] = useState('all');
  const [catFilter, setCatFilter] = useState('all');
  const [showCreate, setShowCreate] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', description: '', priority: 'medium', category: 'general', due_date: '' });

  const createTask = useMutation({
    mutationFn: (data) => base44.entities.Task.create(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['tasks'] }); setShowCreate(false); setNewTask({ title: '', description: '', priority: 'medium', category: 'general', due_date: '' }); },
  });

  const updateTask = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Task.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tasks'] }),
  });

  const deleteTask = useMutation({
    mutationFn: (id) => base44.entities.Task.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tasks'] }),
  });

  const toggleStatus = (task) => {
    const next = task.status === 'completed' ? 'pending' : 'completed';
    updateTask.mutate({ id: task.id, data: { status: next } });
  };

  const filtered = tasks.filter(t => {
    const statusMatch = filter === 'all' || t.status === filter;
    const catMatch = catFilter === 'all' || t.category === catFilter;
    return statusMatch && catMatch;
  });

  const priorityColor = { low: '#83A2DB', medium: '#F59E0B', high: '#CE6969', urgent: '#DC2626' };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Tasks</h1>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{tasks.filter(t => t.status !== 'completed').length} pending</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-32 rounded-xl" style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-subtle)' }}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
          <Select value={catFilter} onValueChange={setCatFilter}>
            <SelectTrigger className="w-36 rounded-xl" style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-subtle)' }}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="onboarding">Onboarding</SelectItem>
              <SelectItem value="follow_up">Follow Up</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="sop">SOP</SelectItem>
              <SelectItem value="general">General</SelectItem>
            </SelectContent>
          </Select>
          <Dialog open={showCreate} onOpenChange={setShowCreate}>
            <DialogTrigger asChild>
              <Button className="rounded-xl text-white" style={{ backgroundColor: '#CE6969' }}>
                <Plus className="w-4 h-4 mr-2" />Task
              </Button>
            </DialogTrigger>
            <DialogContent style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}>
              <DialogHeader><DialogTitle style={{ color: 'var(--text-primary)' }}>New Task</DialogTitle></DialogHeader>
              <div className="space-y-3 pt-2">
                <Input placeholder="Task title *" value={newTask.title} onChange={e => setNewTask({ ...newTask, title: e.target.value })} className="rounded-xl" />
                <Textarea placeholder="Description" value={newTask.description} onChange={e => setNewTask({ ...newTask, description: e.target.value })} className="rounded-xl" />
                <div className="grid grid-cols-2 gap-3">
                  <Select value={newTask.priority} onValueChange={v => setNewTask({ ...newTask, priority: v })}>
                    <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={newTask.category} onValueChange={v => setNewTask({ ...newTask, category: v })}>
                    <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">General</SelectItem>
                      <SelectItem value="onboarding">Onboarding</SelectItem>
                      <SelectItem value="follow_up">Follow Up</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="sop">SOP</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Input type="date" value={newTask.due_date} onChange={e => setNewTask({ ...newTask, due_date: e.target.value })} className="rounded-xl" />
                <Button className="w-full rounded-xl text-white" style={{ backgroundColor: '#CE6969' }}
                  onClick={() => createTask.mutate(newTask)} disabled={!newTask.title}>Create Task</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="space-y-2">
        <AnimatePresence>
          {filtered.map(task => (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -30 }}
              className="rounded-xl p-4 flex items-center gap-4 theme-transition"
              style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--border-subtle)' }}
            >
              <button onClick={() => toggleStatus(task)} className="shrink-0">
                {task.status === 'completed'
                  ? <CheckCircle className="w-5 h-5" style={{ color: '#22C55E' }} />
                  : <Circle className="w-5 h-5" style={{ color: 'var(--text-muted)' }} />
                }
              </button>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium ${task.status === 'completed' ? 'line-through' : ''}`}
                  style={{ color: task.status === 'completed' ? 'var(--text-muted)' : 'var(--text-primary)' }}>
                  {task.title}
                </p>
                {task.description && <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--text-muted)' }}>{task.description}</p>}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs capitalize px-2 py-1 rounded-full" style={{ backgroundColor: `${priorityColor[task.priority]}15`, color: priorityColor[task.priority] }}>
                  {task.priority}
                </span>
                <span className="text-xs capitalize px-2 py-1 rounded-full" style={{ backgroundColor: 'var(--bg-surface-hover)', color: 'var(--text-muted)' }}>
                  {task.category}
                </span>
                {task.due_date && (
                  <span className="text-xs flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
                    <Clock className="w-3 h-3" />{task.due_date}
                  </span>
                )}
                <Button size="icon" variant="ghost" className="rounded-lg" onClick={() => deleteTask.mutate(task.id)}>
                  <Trash2 className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                </Button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {filtered.length === 0 && (
          <div className="text-center py-16">
            <CheckCircle className="w-12 h-12 mx-auto mb-3" style={{ color: 'var(--text-muted)' }} />
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No tasks found</p>
          </div>
        )}
      </div>
    </div>
  );
}
