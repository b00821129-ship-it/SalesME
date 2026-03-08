import { useState } from 'react';
import { Phone, PhoneOff, Mic, MicOff, ExternalLink, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { createPageUrl } from '@/utils';

export default function DialerPanel({ contact, isCallActive, onStartCall, onEndCall, callDuration, disposition, onDisposition }) {
  const [muted, setMuted] = useState(false);

  const formatDuration = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const dispositions = [
    { key: 'NA', label: 'NA', desc: 'No Answer' },
    { key: 'HU', label: 'HU', desc: 'Hung Up' },
    { key: 'CB', label: 'CB', desc: 'Callback' },
    { key: 'BKD', label: 'BKD', desc: 'Booked' },
  ];

  return (
    <div className="rounded-2xl p-6 theme-transition" style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--border-subtle)' }}>
      {/* Contact Info */}
      <div className="text-center mb-6">
        <div className="w-16 h-16 rounded-full mx-auto mb-3 flex items-center justify-center text-xl font-bold text-white" style={{ backgroundColor: '#CE6969' }}>
          {contact?.contact_name?.[0] || contact?.company_name?.[0] || '?'}
        </div>
        <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
          {contact?.contact_name || contact?.company_name || 'No Contact Selected'}
        </h2>
        {contact?.phone ? (
          <a
            href={`tel:${contact.phone}`}
            className="text-sm flex items-center justify-center gap-1 hover:underline"
            style={{ color: '#83A2DB' }}
          >
            {contact.phone}
            <ExternalLink className="w-3 h-3" />
          </a>
        ) : (
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>—</p>
        )}
        {contact?.company_name && contact?.contact_name && (
          <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>{contact.company_name}</p>
        )}
      </div>

      {/* Timer */}
      <AnimatePresence>
        {isCallActive && (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
            className="text-center mb-6">
            <div className="flex items-center justify-center gap-2 mb-1">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs font-medium text-green-500">LIVE</span>
            </div>
            <p className="text-3xl font-mono font-bold" style={{ color: 'var(--text-primary)' }}>
              {formatDuration(callDuration)}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Call Controls */}
      <div className="flex items-center justify-center gap-4 mb-6">
        {isCallActive && (
          <Button variant="outline" size="icon" className="rounded-full w-12 h-12"
            onClick={() => setMuted(!muted)}
            style={{ borderColor: muted ? '#CE6969' : 'var(--border-color)' }}>
            {muted ? <MicOff className="w-5 h-5" style={{ color: '#CE6969' }} /> : <Mic className="w-5 h-5" style={{ color: 'var(--text-secondary)' }} />}
          </Button>
        )}

        {!isCallActive ? (
          <div className="flex flex-col items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                if (contact?.phone) {
                  window.location.href = `tel:${contact.phone}`;
                }
                onStartCall();
              }}
              disabled={!contact}
              className="w-16 h-16 rounded-full flex items-center justify-center text-white shadow-lg disabled:opacity-40"
              style={{ backgroundColor: '#CE6969' }}
            >
              <Phone className="w-6 h-6" />
            </motion.button>
            {contact?.phone && (
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Calls {contact.phone}</p>
            )}
          </div>
        ) : (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onEndCall}
            className="w-16 h-16 rounded-full flex items-center justify-center text-white shadow-lg bg-red-600"
          >
            <PhoneOff className="w-6 h-6" />
          </motion.button>
        )}
      </div>

      {/* Disposition Tags */}
      <div>
        <p className="text-xs font-medium uppercase tracking-wider mb-3 text-center" style={{ color: 'var(--text-muted)' }}>
          Disposition
        </p>
        <div className="grid grid-cols-4 gap-2 mb-4">
          {dispositions.map(d => (
            <button
              key={d.key}
              onClick={() => onDisposition(d.key)}
              className="py-2 px-3 rounded-xl text-sm font-semibold transition-all duration-200"
              style={{
                backgroundColor: disposition === d.key ? '#CE6969' : 'var(--bg-surface-hover)',
                color: disposition === d.key ? '#fff' : 'var(--text-secondary)',
              }}
            >
              {d.label}
            </button>
          ))}
        </div>

        {/* Scripts & Objections Button */}
        <a href={createPageUrl('ScriptsObjections')} className="block">
          <button
            className="w-full py-2.5 px-4 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all duration-200 hover:opacity-80"
            style={{ backgroundColor: 'rgba(131,162,219,0.12)', color: '#83A2DB', border: '1px solid rgba(131,162,219,0.25)' }}
          >
            <BookOpen className="w-4 h-4" />
            Scripts & Objections
          </button>
        </a>
      </div>
    </div>
  );
}
