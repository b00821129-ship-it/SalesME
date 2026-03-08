import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Search, Plus, ArrowRight, Trash2, Globe, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { motion, AnimatePresence } from 'framer-motion';

export default function Leads() {
  const queryClient = useQueryClient();
  const { data: leads = [], isLoading } = useQuery({ queryKey: ['leads'], queryFn: () => base44.entities.Lead.list('-created_date') });
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showCreate, setShowCreate] = useState(false);
  const [newLead, setNewLead] = useState({ company_name: '', contact_name: '', email: '', phone: '', website: '', industry: '', source: 'web_scraper', notes: '' });

  const createLead = useMutation({
    mutationFn: (data) => base44.entities.Lead.create(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['leads'] }); setShowCreate(false); setNewLead({ company_name: '', contact_name: '', email: '', phone: '', website: '', industry: '', source: 'web_scraper', notes: '' }); },
  });

  const convertLead = useMutation({
    mutationFn: async (lead) => {
      await base44.entities.Deal.create({
        title: lead.company_name,
        company_name: lead.company_name,
        contact_name: lead.contact_name,
        email: lead.email,
        phone: lead.phone,
        stage: 'discovery',
        lead_id: lead.id,
      });
      await base44.entities.Lead.update(lead.id, { status: 'converted' });
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['leads'] }); queryClient.invalidateQueries({ queryKey: ['deals'] }); },
  });

  const deleteLead = useMutation({
    mutationFn: (id) => base44.entities.Lead.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['leads'] }),
  });

  const filtered = leads.filter(l => {
    const matchSearch = (l.company_name || '').toLowerCase().includes(search.toLowerCase()) || (l.contact_name || '').toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || l.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const statusColors = { new: '#83A2DB', qualified: '#22C55E', converted: '#8B5CF6', disqualified: '#6B7280' };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Leads Inbox</h1>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{leads.filter(l => l.status === 'new').length} new leads</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} />
            <Input placeholder="Search leads..." value={search} onChange={e => setSearch(e.target.value)}
              className="pl-9 w-56 rounded-xl text-sm" style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--border-subtle)' }} />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-36 rounded-xl" style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-subtle)' }}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="new">New</SelectItem>
              <SelectItem value="qualified">Qualified</SelectItem>
              <SelectItem value="converted">Converted</SelectItem>
              <SelectItem value="disqualified">Disqualified</SelectItem>
            </SelectContent>
          </Select>
          <Dialog open={showCreate} onOpenChange={setShowCreate}>
            <DialogTrigger asChild>
              <Button className="rounded-xl text-white" style={{ backgroundColor: '#CE6969' }}>
                <Plus className="w-4 h-4 mr-2" />Lead
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}>
              <DialogHeader><DialogTitle style={{ color: 'var(--text-primary)' }}>New Lead</DialogTitle></DialogHeader>
              <div className="space-y-3 pt-2">
                <Input placeholder="Company name *" value={newLead.company_name} onChange={e => setNewLead({ ...newLead, company_name: e.target.value })} className="rounded-xl" />
                <Input placeholder="Contact name" value={newLead.contact_name} onChange={e => setNewLead({ ...newLead, contact_name: e.target.value })} className="rounded-xl" />
                <div className="grid grid-cols-2 gap-3">
                  <Input placeholder="Email" value={newLead.email} onChange={e => setNewLead({ ...newLead, email: e.target.value })} className="rounded-xl" />
                  <Input placeholder="Phone" value={newLead.phone} onChange={e => setNewLead({ ...newLead, phone: e.target.value })} className="rounded-xl" />
                </div>
                <Input placeholder="Website" value={newLead.website} onChange={e => setNewLead({ ...newLead, website: e.target.value })} className="rounded-xl" />
                <Input placeholder="Industry" value={newLead.industry} onChange={e => setNewLead({ ...newLead, industry: e.target.value })} className="rounded-xl" />
                <Textarea placeholder="Notes" value={newLead.notes} onChange={e => setNewLead({ ...newLead, notes: e.target.value })} className="rounded-xl" />
                <Button className="w-full rounded-xl text-white" style={{ backgroundColor: '#CE6969' }}
                  onClick={() => createLead.mutate(newLead)} disabled={!newLead.company_name}>Create Lead</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Lead Cards */}
      <div className="space-y-3">
        <AnimatePresence>
          {filtered.map(lead => (
            <motion.div
              key={lead.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="rounded-2xl p-4 flex items-center gap-4 theme-transition"
              style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--border-subtle)' }}
            >
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0" style={{ backgroundColor: statusColors[lead.status] || '#83A2DB' }}>
                {(lead.company_name || '?')[0]}
              </div>
              <div className="flex-1 min-w-0 grid grid-cols-4 gap-4 items-center">
                <div>
                  <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{lead.company_name}</p>
                  <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>{lead.contact_name}</p>
                </div>
                <div>
                  <p className="text-xs truncate" style={{ color: 'var(--text-secondary)' }}>{lead.email}</p>
                  <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>{lead.phone}</p>
                </div>
                <div className="flex items-center gap-2">
                  {lead.website && <Globe className="w-3 h-3" style={{ color: 'var(--text-muted)' }} />}
                  <span className="text-xs capitalize" style={{ color: 'var(--text-muted)' }}>{lead.industry || '—'}</span>
                </div>
                <div className="flex items-center justify-end gap-2">
                  <Badge className="text-xs capitalize rounded-full px-2" style={{ backgroundColor: `${statusColors[lead.status]}20`, color: statusColors[lead.status] }}>
                    {lead.status}
                  </Badge>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {lead.status !== 'converted' && lead.status !== 'disqualified' && (
                  <Button size="sm" className="rounded-xl text-white text-xs" style={{ backgroundColor: '#CE6969' }}
                    onClick={() => convertLead.mutate(lead)}>
                    <ArrowRight className="w-3 h-3 mr-1" />Convert
                  </Button>
                )}
                <Button size="icon" variant="ghost" className="rounded-xl" onClick={() => deleteLead.mutate(lead.id)}>
                  <Trash2 className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                </Button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {filtered.length === 0 && !isLoading && (
          <div className="text-center py-16">
            <Star className="w-12 h-12 mx-auto mb-3" style={{ color: 'var(--text-muted)' }} />
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No leads found. Add your first lead!</p>
          </div>
        )}
      </div>
    </div>
  );
}
