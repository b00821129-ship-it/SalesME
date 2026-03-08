import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Plus, FileText, Trash2, Edit3, Eye, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import ReactMarkdown from 'react-markdown';
import { motion, AnimatePresence } from 'framer-motion';

export default function SOPs() {
  const queryClient = useQueryClient();
  const { data: sops = [] } = useQuery({ queryKey: ['sops'], queryFn: () => base44.entities.SOP.list('-created_date') });
  const [showCreate, setShowCreate] = useState(false);
  const [viewing, setViewing] = useState(null);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ title: '', content: '', category: 'general', status: 'draft' });

  const createSOP = useMutation({
    mutationFn: (data) => base44.entities.SOP.create(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['sops'] }); setShowCreate(false); setForm({ title: '', content: '', category: 'general', status: 'draft' }); },
  });

  const updateSOP = useMutation({
    mutationFn: ({ id, data }) => base44.entities.SOP.update(id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['sops'] }); setEditing(null); },
  });

  const deleteSOP = useMutation({
    mutationFn: (id) => base44.entities.SOP.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['sops'] }),
  });

  const statusColor = { draft: '#F59E0B', published: '#22C55E', archived: '#6B7280' };
  const catColor = { sales: '#CE6969', onboarding: '#83A2DB', support: '#8B5CF6', operations: '#F59E0B', general: '#6B7280' };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>SOPs</h1>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{sops.length} procedures</p>
        </div>
        <Dialog open={showCreate} onOpenChange={setShowCreate}>
          <DialogTrigger asChild>
            <Button className="rounded-xl text-white" style={{ backgroundColor: '#CE6969' }}>
              <Plus className="w-4 h-4 mr-2" />SOP
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}>
            <DialogHeader><DialogTitle style={{ color: 'var(--text-primary)' }}>New SOP</DialogTitle></DialogHeader>
            <div className="space-y-3 pt-2">
              <Input placeholder="Title *" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="rounded-xl" />
              <div className="grid grid-cols-2 gap-3">
                <Select value={form.category} onValueChange={v => setForm({ ...form, category: v })}>
                  <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sales">Sales</SelectItem>
                    <SelectItem value="onboarding">Onboarding</SelectItem>
                    <SelectItem value="support">Support</SelectItem>
                    <SelectItem value="operations">Operations</SelectItem>
                    <SelectItem value="general">General</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={form.status} onValueChange={v => setForm({ ...form, status: v })}>
                  <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Textarea placeholder="Content (Markdown supported)" value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} className="rounded-xl min-h-[200px]" />
              <Button className="w-full rounded-xl text-white" style={{ backgroundColor: '#CE6969' }}
                onClick={() => createSOP.mutate(form)} disabled={!form.title}>Create SOP</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <AnimatePresence>
          {sops.map(sop => (
            <motion.div
              key={sop.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="rounded-2xl p-5 theme-transition"
              style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--border-subtle)' }}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4" style={{ color: catColor[sop.category] || '#6B7280' }} />
                  <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{sop.title}</h3>
                </div>
                <div className="flex items-center gap-1">
                  <Badge className="text-xs capitalize rounded-full" style={{ backgroundColor: `${statusColor[sop.status]}20`, color: statusColor[sop.status] }}>
                    {sop.status}
                  </Badge>
                </div>
              </div>
              <p className="text-xs mb-3 line-clamp-2" style={{ color: 'var(--text-muted)' }}>
                {sop.content?.replace(/[#*_]/g, '').slice(0, 120) || 'No content'}
              </p>
              <div className="flex items-center justify-between">
                <Badge className="text-xs capitalize rounded-full" style={{ backgroundColor: `${catColor[sop.category]}15`, color: catColor[sop.category] }}>
                  {sop.category}
                </Badge>
                <div className="flex items-center gap-1">
                  <Button size="icon" variant="ghost" className="rounded-lg" onClick={() => setViewing(sop)}>
                    <Eye className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                  </Button>
                  <Button size="icon" variant="ghost" className="rounded-lg" onClick={() => deleteSOP.mutate(sop.id)}>
                    <Trash2 className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {sops.length === 0 && (
        <div className="text-center py-16">
          <FileText className="w-12 h-12 mx-auto mb-3" style={{ color: 'var(--text-muted)' }} />
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No SOPs yet. Create your first procedure!</p>
        </div>
      )}

      {/* View Dialog */}
      <Dialog open={!!viewing} onOpenChange={() => setViewing(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}>
          <DialogHeader>
            <DialogTitle style={{ color: 'var(--text-primary)' }}>{viewing?.title}</DialogTitle>
          </DialogHeader>
          <div className="prose prose-sm max-w-none" style={{ color: 'var(--text-secondary)' }}>
            <ReactMarkdown>{viewing?.content || ''}</ReactMarkdown>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
