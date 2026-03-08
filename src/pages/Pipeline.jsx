import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import DealCard from '../components/pipeline/DealCard';
import DealDetailPanel from '../components/pipeline/DealDetailPanel';
import { Plus, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AnimatePresence, motion } from 'framer-motion';

const STAGES = [
  { key: 'discovery', label: 'Discovery', color: '#83A2DB' },
  { key: 'proposal', label: 'Proposal', color: '#F59E0B' },
  { key: 'negotiation', label: 'Negotiation', color: '#8B5CF6' },
  { key: 'contract', label: 'Contract', color: '#CE6969' },
];

export default function Pipeline() {
  const queryClient = useQueryClient();
  const { data: deals = [] } = useQuery({ queryKey: ['deals'], queryFn: () => base44.entities.Deal.list() });
  const [selectedDeal, setSelectedDeal] = useState(null);
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [newDeal, setNewDeal] = useState({ title: '', company_name: '', value: 0, stage: 'discovery', priority: 'medium' });

  const updateDeal = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Deal.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['deals'] }),
  });

  const createDeal = useMutation({
    mutationFn: (data) => base44.entities.Deal.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deals'] });
      setShowCreate(false);
      setNewDeal({ title: '', company_name: '', value: 0, stage: 'discovery', priority: 'medium' });
    },
  });

  // Auto-create tasks & SOPs when deal moves to "won"
  const handleWonDeal = async (dealId, deal) => {
    await updateDeal.mutateAsync({ id: dealId, data: { stage: 'won' } });
    await base44.entities.Task.bulkCreate([
      { title: `Onboarding: ${deal.title}`, category: 'onboarding', deal_id: dealId, priority: 'high' },
      { title: `Setup account for ${deal.company_name || deal.title}`, category: 'onboarding', deal_id: dealId },
      { title: `Schedule kickoff call with ${deal.contact_name || deal.title}`, category: 'follow_up', deal_id: dealId },
    ]);
    await base44.entities.SOP.create({
      title: `Onboarding SOP: ${deal.title}`,
      category: 'onboarding',
      deal_id: dealId,
      content: `## Onboarding for ${deal.title}\n\n1. Account setup\n2. Kickoff call\n3. Service delivery\n4. Follow-up check-in`,
      status: 'published',
    });
    queryClient.invalidateQueries({ queryKey: ['tasks'] });
  };

  const onDragEnd = (result) => {
    if (!result.destination) return;
    const dealId = result.draggableId;
    const newStage = result.destination.droppableId;
    const deal = deals.find(d => d.id === dealId);
    if (!deal || deal.stage === newStage) return;

    if (newStage === 'won') {
      handleWonDeal(dealId, deal);
    } else {
      updateDeal.mutate({ id: dealId, data: { stage: newStage } });
    }
  };

  // Filter out won/lost deals from pipeline view
  const activeDeals = deals.filter(d => !['won', 'lost'].includes(d.stage));
  const filteredDeals = activeDeals.filter(d =>
    (d.title || '').toLowerCase().includes(search.toLowerCase()) ||
    (d.company_name || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-full mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Pipeline</h1>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{activeDeals.length} active deals</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} />
            <Input placeholder="Search deals..." value={search} onChange={e => setSearch(e.target.value)}
              className="pl-9 w-56 rounded-xl text-sm" style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--border-subtle)' }} />
          </div>
          <Dialog open={showCreate} onOpenChange={setShowCreate}>
            <DialogTrigger asChild>
              <Button className="rounded-xl text-white" style={{ backgroundColor: '#CE6969' }}>
                <Plus className="w-4 h-4 mr-2" />Deal
              </Button>
            </DialogTrigger>
            <DialogContent style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}>
              <DialogHeader>
                <DialogTitle style={{ color: 'var(--text-primary)' }}>New Deal</DialogTitle>
              </DialogHeader>
              <div className="space-y-3 pt-2">
                <Input placeholder="Deal title" value={newDeal.title} onChange={e => setNewDeal({ ...newDeal, title: e.target.value })} className="rounded-xl" />
                <Input placeholder="Company name" value={newDeal.company_name} onChange={e => setNewDeal({ ...newDeal, company_name: e.target.value })} className="rounded-xl" />
                <Input type="number" placeholder="Value" value={newDeal.value} onChange={e => setNewDeal({ ...newDeal, value: Number(e.target.value) })} className="rounded-xl" />
                <Select value={newDeal.priority} onValueChange={v => setNewDeal({ ...newDeal, priority: v })}>
                  <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
                <Button className="w-full rounded-xl text-white" style={{ backgroundColor: '#CE6969' }}
                  onClick={() => createDeal.mutate(newDeal)} disabled={!newDeal.title}>
                  Create Deal
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Kanban Board */}
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="grid grid-cols-4 gap-4">
          {STAGES.map(stage => {
            const stageDeals = filteredDeals.filter(d => d.stage === stage.key);
            const stageTotal = stageDeals.reduce((sum, d) => sum + (d.value || 0), 0);
            return (
              <div key={stage.key}>
                <div className="flex items-center justify-between mb-3 px-1">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: stage.color }} />
                    <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{stage.label}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: 'var(--bg-surface-hover)', color: 'var(--text-muted)' }}>
                      {stageDeals.length}
                    </span>
                  </div>
                  <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>${stageTotal.toLocaleString()}</span>
                </div>
                <Droppable droppableId={stage.key}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className="kanban-column rounded-2xl p-2 space-y-2 transition-colors"
                      style={{
                        backgroundColor: snapshot.isDraggingOver ? 'rgba(206,105,105,0.06)' : 'var(--bg-elevated)',
                        border: `1px dashed ${snapshot.isDraggingOver ? '#CE6969' : 'var(--border-subtle)'}`,
                      }}
                    >
                      {stageDeals.map((deal, index) => (
                        <Draggable key={deal.id} draggableId={deal.id} index={index}>
                          {(provided) => (
                            <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
                              <DealCard deal={deal} onClick={setSelectedDeal} />
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                      {stageDeals.length === 0 && (
                        <p className="text-xs text-center py-8" style={{ color: 'var(--text-muted)' }}>Drop deals here</p>
                      )}
                    </div>
                  )}
                </Droppable>
              </div>
            );
          })}
        </div>

        {/* Won/Lost Drop Zones */}
        <div className="mt-4 grid grid-cols-2 gap-4">
          <Droppable droppableId="won">
            {(provided, snapshot) => (
              <div ref={provided.innerRef} {...provided.droppableProps}
                className="rounded-2xl p-4 text-center border-2 border-dashed transition-all"
                style={{ borderColor: snapshot.isDraggingOver ? '#22C55E' : 'var(--border-subtle)', backgroundColor: snapshot.isDraggingOver ? 'rgba(34,197,94,0.08)' : 'transparent' }}>
                <span className="text-sm font-medium" style={{ color: snapshot.isDraggingOver ? '#22C55E' : 'var(--text-muted)' }}>🏆 Won</span>
                {provided.placeholder}
              </div>
            )}
          </Droppable>
          <Droppable droppableId="lost">
            {(provided, snapshot) => (
              <div ref={provided.innerRef} {...provided.droppableProps}
                className="rounded-2xl p-4 text-center border-2 border-dashed transition-all"
                style={{ borderColor: snapshot.isDraggingOver ? '#EF4444' : 'var(--border-subtle)', backgroundColor: snapshot.isDraggingOver ? 'rgba(239,68,68,0.08)' : 'transparent' }}>
                <span className="text-sm font-medium" style={{ color: snapshot.isDraggingOver ? '#EF4444' : 'var(--text-muted)' }}>❌ Lost</span>
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </div>
      </DragDropContext>

      {/* Won/Lost zones inside the same DragDropContext aren't possible here; moved inside the main context */}
      

      {/* Deal Detail Slide-Over */}
      <AnimatePresence>
        {selectedDeal && <DealDetailPanel deal={selectedDeal} onClose={() => setSelectedDeal(null)} />}
      </AnimatePresence>
    </div>
  );
}
