import { useState, useEffect, useRef, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import DialerPanel from '../components/dialer/DialerPanel';
import CoachChat from '../components/dialer/CoachChat';
import { useTranscription } from '../components/dialer/TranscriptionEngine';
import { Search, ChevronRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { motion } from 'framer-motion';

export default function Dialer() {
  const queryClient = useQueryClient();
  const { data: leads = [] } = useQuery({ queryKey: ['leads'], queryFn: () => base44.entities.Lead.list() });
  const { data: deals = [] } = useQuery({ queryKey: ['deals'], queryFn: () => base44.entities.Deal.list() });

  const [selectedContact, setSelectedContact] = useState(null);
  const [isCallActive, setIsCallActive] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [disposition, setDisposition] = useState(null);
  const [repTranscript, setRepTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [lastFinalSentence, setLastFinalSentence] = useState('');
  const [search, setSearch] = useState('');
  const [lastCallLog, setLastCallLog] = useState(null);
  const timerRef = useRef(null);

  const repFinalRef = useRef('');

  const handleRepText = useCallback((text, isFinal) => {
    if (isFinal) {
      repFinalRef.current += text;
      setRepTranscript(repFinalRef.current);
      setInterimTranscript('');
      setLastFinalSentence(text.trim());
    } else {
      setInterimTranscript(text);
    }
  }, []);

  const { isSupported } = useTranscription({
    isActive: isCallActive,
    onRepText: handleRepText,
  });

  // Merge leads + deals into contact list
  const contacts = [
    ...leads.map(l => ({ ...l, _type: 'lead' })),
    ...deals.map(d => ({ ...d, contact_name: d.contact_name || d.title, _type: 'deal' })),
  ].filter(c => {
    const q = search.toLowerCase();
    return (c.contact_name || '').toLowerCase().includes(q) || (c.company_name || '').toLowerCase().includes(q) || (c.phone || '').toLowerCase().includes(q);
  });

  const createCallLog = useMutation({
    mutationFn: (data) => base44.entities.CallLog.create(data),
    onSuccess: (data) => {
      setLastCallLog(data);
      queryClient.invalidateQueries({ queryKey: ['callLogs'] });
    }
  });

  const startCall = () => {
    if (!selectedContact) return;
    repFinalRef.current = '';
    setIsCallActive(true);
    setCallDuration(0);
    setDisposition(null);
    setRepTranscript('');
    timerRef.current = setInterval(() => setCallDuration(prev => prev + 1), 1000);
  };

  const endCall = () => {
    setIsCallActive(false);
    clearInterval(timerRef.current);
    createCallLog.mutate({
      contact_name: selectedContact.contact_name || selectedContact.company_name,
      phone_number: selectedContact.phone,
      duration_seconds: callDuration,
      disposition: disposition,
      transcript_rep: repTranscript,
      transcript_prospect: '',
      deal_id: selectedContact._type === 'deal' ? selectedContact.id : undefined,
      lead_id: selectedContact._type === 'lead' ? selectedContact.id : undefined,
    });
  };

  useEffect(() => { return () => clearInterval(timerRef.current); }, []);

  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>Dialer</h1>
      <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>Dual-channel AI-powered calling</p>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Contact List */}
        <div className="lg:col-span-3">
          <div className="rounded-2xl p-4 theme-transition" style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--border-subtle)' }}>
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} />
              <Input
                placeholder="Search contacts..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-9 rounded-xl text-sm"
                style={{ backgroundColor: 'var(--bg-surface-hover)', border: 'none' }}
              />
            </div>
            <div className="space-y-1 max-h-[65vh] overflow-y-auto">
              {contacts.map(c => (
                <motion.button
                  key={`${c._type}-${c.id}`}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedContact(c)}
                  className="w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all"
                  style={{
                    backgroundColor: selectedContact?.id === c.id && selectedContact?._type === c._type ? 'rgba(206,105,105,0.08)' : 'transparent',
                  }}
                >
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                    style={{ backgroundColor: c._type === 'deal' ? '#83A2DB' : '#CE6969' }}>
                    {(c.contact_name || c.company_name || '?')[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                      {c.contact_name || c.company_name}
                    </p>
                    <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>{c.phone || 'No phone'}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 shrink-0" style={{ color: 'var(--text-muted)' }} />
                </motion.button>
              ))}
              {contacts.length === 0 && (
                <p className="text-center py-8 text-sm" style={{ color: 'var(--text-muted)' }}>No contacts found</p>
              )}
            </div>
          </div>
        </div>

        {/* Dialer Panel */}
        <div className="lg:col-span-4">
          <DialerPanel
            contact={selectedContact}
            isCallActive={isCallActive}
            onStartCall={startCall}
            onEndCall={endCall}
            callDuration={callDuration}
            disposition={disposition}
            onDisposition={setDisposition}
          />
        </div>

        {/* AI Coach */}
        <div className="lg:col-span-5">
          <CoachChat
            repTranscript={repTranscript}
            interimTranscript={interimTranscript}
            lastFinalSentence={lastFinalSentence}
            isCallActive={isCallActive}
            callLog={lastCallLog}
          />
        </div>
      </div>
    </div>
  );
}
