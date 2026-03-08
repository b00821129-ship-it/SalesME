import { useState, useEffect, useRef } from 'react';
import { Sparkles, AlertTriangle, CheckCircle, MessageSquare, Loader2, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';

export default function AICoach({ prospectTranscript, repTranscript, isCallActive, callLog, isSupported = true }) {
  const [auditResult, setAuditResult] = useState(null);
  const [isAuditing, setIsAuditing] = useState(false);
  const [liveTip, setLiveTip] = useState(null);
  const [isGettingTip, setIsGettingTip] = useState(false);
  const lastTipTranscriptRef = useRef('');
  const tipDebounceRef = useRef(null);

  // Objection detection from prospect transcript (Channel A)
  const objections = [
    { trigger: 'not interested', response: "I completely understand. Before we go, may I ask — is it the timing, or is it that you've already found a solution? Sometimes a quick 2-minute overview can save hours of research later." },
    { trigger: 'too expensive', response: "I hear you on budget concerns. Many of our best clients felt the same initially. What if I showed you how this actually pays for itself within 60 days? Would that change the picture?" },
    { trigger: 'no time', response: "Totally respect your time. That's exactly why I'll keep this to 90 seconds. If you don't see value, I'll never call again. Fair?" },
    { trigger: 'call back later', response: "Absolutely, I'd love to. What's the best day and time this week? I want to make sure I'm respecting your calendar." },
    { trigger: 'already have', response: "Great that you're already being proactive! Most of our clients switched because they found gaps they didn't know existed. Would you be open to a quick comparison?" },
    { trigger: 'send me an email', response: "Happy to — and I will right after this call. But I've found that a quick 2-minute call saves more time than a back-and-forth email chain. Can I share the key point right now?" },
  ];

  // Check prospect transcript for objections
  const checkObjection = () => {
    if (!prospectTranscript) return null;
    const lower = prospectTranscript.toLowerCase();
    for (const obj of objections) {
      if (lower.includes(obj.trigger)) return obj;
    }
    return null;
  };

  const detectedObjection = checkObjection();

  // Live AI coaching: trigger when repTranscript grows by ~20 words during an active call
  useEffect(() => {
    if (!isCallActive || !repTranscript) return;
    const wordCount = repTranscript.trim().split(/\s+/).length;
    const lastWordCount = lastTipTranscriptRef.current.trim().split(/\s+/).length;
    if (wordCount - lastWordCount < 20) return;

    clearTimeout(tipDebounceRef.current);
    tipDebounceRef.current = setTimeout(async () => {
      lastTipTranscriptRef.current = repTranscript;
      setIsGettingTip(true);
      const tip = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a live sales coach listening in on a call. Based on what the rep just said, give ONE short, actionable coaching tip (max 2 sentences). Be direct and specific.\n\nRep transcript so far:\n"${repTranscript}"`,
      });
      setLiveTip(tip);
      setIsGettingTip(false);
    }, 1500);

    return () => clearTimeout(tipDebounceRef.current);
  }, [repTranscript, isCallActive]);

  // Reset live tip when call ends
  useEffect(() => {
    if (!isCallActive) {
      setLiveTip(null);
      lastTipTranscriptRef.current = '';
    }
  }, [isCallActive]);

  const handleAuditCall = async () => {
    if (!callLog && !repTranscript && !prospectTranscript) return;
    setIsAuditing(true);
    const fullTranscript = `
REP: ${repTranscript || callLog?.transcript_rep || 'No transcript available'}
PROSPECT: ${prospectTranscript || callLog?.transcript_prospect || 'No transcript available'}
    `.trim();

    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `Analyze this sales call transcript and provide coaching feedback:\n\n${fullTranscript}`,
      response_json_schema: {
        type: "object",
        properties: {
          summary: { type: "string" },
          did_well: { type: "array", items: { type: "string" } },
          to_improve: { type: "array", items: { type: "string" } }
        }
      }
    });
    setAuditResult(result);
    setIsAuditing(false);
  };

  return (
    <div className="rounded-2xl p-5 theme-transition h-full flex flex-col" style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--border-subtle)' }}>
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'rgba(131,162,219,0.15)' }}>
          <Sparkles className="w-4 h-4" style={{ color: '#83A2DB' }} />
        </div>
        <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>SalesME Coach</h3>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto">
        {/* Live Objection Detection */}
        <AnimatePresence>
          {isCallActive && detectedObjection && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="rounded-xl p-4"
              style={{ backgroundColor: 'rgba(206,105,105,0.08)', border: '1px solid rgba(206,105,105,0.2)' }}
            >
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-4 h-4" style={{ color: '#CE6969' }} />
                <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#CE6969' }}>Objection Detected</span>
              </div>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--text-primary)' }}>
                {detectedObjection.response}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Live AI Coaching Tip */}
        <AnimatePresence>
          {isCallActive && (isGettingTip || liveTip) && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="rounded-xl p-4"
              style={{ backgroundColor: 'rgba(131,162,219,0.08)', border: '1px solid rgba(131,162,219,0.25)' }}
            >
              <div className="flex items-center gap-2 mb-2">
                {isGettingTip ? (
                  <Loader2 className="w-4 h-4 animate-spin" style={{ color: '#83A2DB' }} />
                ) : (
                  <Zap className="w-4 h-4" style={{ color: '#83A2DB' }} />
                )}
                <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#83A2DB' }}>
                  {isGettingTip ? 'Coach is thinking…' : 'Live Coaching Tip'}
                </span>
              </div>
              {liveTip && !isGettingTip && (
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-primary)' }}>{liveTip}</p>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Transcript Preview */}
        {isCallActive && (
          <div className="space-y-3">
            <div className="rounded-xl p-3" style={{ backgroundColor: 'var(--bg-surface-hover)' }}>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
                <p className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Your mic (live transcript)</p>
              </div>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                {repTranscript || <span className="italic" style={{ color: 'var(--text-muted)' }}>Speak — your words will appear here…</span>}
              </p>
            </div>
          </div>
        )}

        {/* Idle State */}
        {!isCallActive && !auditResult && (
          <div className="text-center py-8">
            <MessageSquare className="w-10 h-10 mx-auto mb-3" style={{ color: 'var(--text-muted)' }} />
            {!isSupported ? (
              <p className="text-sm" style={{ color: '#CE6969' }}>
                Speech recognition not supported in this browser. Use Chrome or Edge.
              </p>
            ) : (
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                Start a call to activate live coaching & transcription
              </p>
            )}
          </div>
        )}

        {/* Audit Results */}
        <AnimatePresence>
          {auditResult && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
              <div className="rounded-xl p-4" style={{ backgroundColor: 'var(--bg-surface-hover)' }}>
                <h4 className="text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Summary</h4>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{auditResult.summary}</p>
              </div>
              <div className="rounded-xl p-4" style={{ backgroundColor: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.15)' }}>
                <h4 className="text-sm font-semibold mb-2 text-green-600">What You Did Well</h4>
                {auditResult.did_well?.map((item, i) => (
                  <div key={i} className="flex items-start gap-2 mb-1">
                    <CheckCircle className="w-3 h-3 mt-1 text-green-500 shrink-0" />
                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{item}</p>
                  </div>
                ))}
              </div>
              <div className="rounded-xl p-4" style={{ backgroundColor: 'rgba(206,105,105,0.06)', border: '1px solid rgba(206,105,105,0.15)' }}>
                <h4 className="text-sm font-semibold mb-2" style={{ color: '#CE6969' }}>What To Improve</h4>
                {auditResult.to_improve?.map((item, i) => (
                  <div key={i} className="flex items-start gap-2 mb-1">
                    <AlertTriangle className="w-3 h-3 mt-1 shrink-0" style={{ color: '#CE6969' }} />
                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{item}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Audit Button */}
      {!isCallActive && (
        <Button
          onClick={handleAuditCall}
          disabled={isAuditing}
          className="mt-4 w-full rounded-xl text-white"
          style={{ backgroundColor: '#83A2DB' }}
        >
          {isAuditing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
          Audit Last Call
        </Button>
      )}
    </div>
  );
}
