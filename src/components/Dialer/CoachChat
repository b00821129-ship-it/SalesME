import { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { Sparkles, Send, Loader2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import ReactMarkdown from 'react-markdown';
import { motion, AnimatePresence } from 'framer-motion';

export default function CoachChat({ repTranscript, interimTranscript, lastFinalSentence, isCallActive, callLog }) {
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const bottomRef = useRef(null);
  const lastSentenceRef = useRef('');

  // Initialize conversation once
  useEffect(() => {
    const init = async () => {
      setIsInitializing(true);
      const conv = await base44.agents.createConversation({
        agent_name: 'sales_coach',
        metadata: { name: 'Live Call Session' }
      });
      setConversation(conv);
      setMessages(conv.messages || []);
      setIsInitializing(false);
    };
    init();
  }, []);

  // Subscribe to conversation updates
  useEffect(() => {
    if (!conversation?.id) return;
    const unsub = base44.agents.subscribeToConversation(conversation.id, (data) => {
      setMessages(data.messages || []);
    });
    return unsub;
  }, [conversation?.id]);

  // Trigger AI after every final sentence — give best next phrase to say
  useEffect(() => {
    if (!isCallActive || !lastFinalSentence || !conversation) return;
    if (lastFinalSentence === lastSentenceRef.current) return;
    lastSentenceRef.current = lastFinalSentence;

    const trigger = async () => {
      setIsLoading(true);
      await base44.agents.addMessage(conversation, {
        role: 'user',
        content: `Rep just said: "${lastFinalSentence}"\n\nGive me the single BEST phrase to say next. Be direct — just give the exact words, no explanation.`
      });
      setIsLoading(false);
    };
    trigger();
  }, [lastFinalSentence, isCallActive, conversation]);

  // Auto scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || !conversation || isLoading) return;
    const text = input.trim();
    setInput('');
    setIsLoading(true);
    await base44.agents.addMessage(conversation, { role: 'user', content: text });
    setIsLoading(false);
  };

  const handleAudit = async () => {
    if (!conversation) return;
    setIsLoading(true);
    const transcript = repTranscript || callLog?.transcript_rep || 'No transcript available';
    await base44.agents.addMessage(conversation, {
      role: 'user',
      content: `DEEP DATA-DRIVEN CALL AUDIT REQUEST

Transcript from last call:
"${transcript}"

You have access to patterns from millions of real B2B sales calls. Perform a rigorous, data-driven audit:

1. **Performance Score** — Rate this call /100 with a breakdown by category (Opening, Discovery, Objection Handling, Closing, Tonality)

2. **What Worked** — Specific lines/moments that statistically outperform average reps, with data (e.g. "Using 'What's your biggest challenge with X?' at this point increases engagement 38%")

3. **Critical Gaps** — Exact moments where top performers do something different. Quote the transcript and show the alternative with data-backed reasoning.

4. **Word-for-Word Rewrites** — Take the 2-3 weakest lines and rewrite them exactly as a top 1% rep would say them, with the stat on why it works better.

5. **#1 Priority Fix** — The single highest-leverage change that would most improve close rate on calls like this.

Be brutally specific. Reference real conversion data. No generic advice.`
    });
    setIsLoading(false);
  };

  const resetSession = async () => {
    setIsLoading(true);
    const conv = await base44.agents.createConversation({
      agent_name: 'sales_coach',
      metadata: { name: 'Live Call Session' }
    });
    setConversation(conv);
    setMessages([]);
    lastSentenceRef.current = '';
    setIsLoading(false);
  };

  const visibleMessages = messages.filter(m => m.role !== 'system' && m.content);

  return (
    <div className="rounded-2xl theme-transition h-full flex flex-col" style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--border-subtle)' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'rgba(131,162,219,0.15)' }}>
            <Sparkles className="w-4 h-4" style={{ color: '#83A2DB' }} />
          </div>
          <div>
            <h3 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>SalesME Coach</h3>
            <p className="text-xs" style={{ color: isCallActive ? '#22c55e' : 'var(--text-muted)' }}>
              {isCallActive ? '● Listening live…' : 'Ready to coach'}
            </p>
          </div>
        </div>
        <button onClick={resetSession} title="New session" className="p-1.5 rounded-lg hover:opacity-70 transition-opacity">
          <RefreshCw className="w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} />
        </button>
      </div>

      {/* Live Transcript Strip */}
      {isCallActive && (repTranscript || interimTranscript) && (
        <div className="px-4 py-2 border-b" style={{ borderColor: 'var(--border-subtle)', backgroundColor: 'rgba(131,162,219,0.06)' }}>
          <p className="text-xs font-medium mb-0.5" style={{ color: '#83A2DB' }}>● You're saying</p>
          <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            <span style={{ color: 'var(--text-primary)' }}>{repTranscript}</span>
            {interimTranscript && <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>{interimTranscript}</span>}
          </p>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3" style={{ minHeight: 0 }}>
        {isInitializing && (
          <div className="flex justify-center py-8">
            <Loader2 className="w-5 h-5 animate-spin" style={{ color: 'var(--text-muted)' }} />
          </div>
        )}

        {!isInitializing && visibleMessages.length === 0 && (
          <div className="text-center py-8">
            <Sparkles className="w-8 h-8 mx-auto mb-3 opacity-30" style={{ color: '#83A2DB' }} />
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              {isCallActive ? 'Listening to your call…' : 'Ask me anything or start a call for live coaching'}
            </p>
          </div>
        )}

        <AnimatePresence>
          {visibleMessages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className="max-w-[85%] rounded-2xl px-4 py-2.5 text-sm"
                style={{
                  backgroundColor: msg.role === 'user' ? '#CE6969' : 'var(--bg-surface-hover)',
                  color: msg.role === 'user' ? '#fff' : 'var(--text-primary)',
                }}
              >
                {msg.role === 'user' ? (
                  <p className="leading-relaxed">{msg.content}</p>
                ) : (
                  <ReactMarkdown className="prose prose-sm max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0 leading-relaxed">
                    {msg.content}
                  </ReactMarkdown>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {isLoading && (
          <div className="flex justify-start">
            <div className="rounded-2xl px-4 py-3" style={{ backgroundColor: 'var(--bg-surface-hover)' }}>
              <Loader2 className="w-4 h-4 animate-spin" style={{ color: 'var(--text-muted)' }} />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-4 py-3 border-t space-y-2" style={{ borderColor: 'var(--border-subtle)' }}>
        {!isCallActive && (repTranscript || callLog) && (
          <Button
            onClick={handleAudit}
            disabled={isLoading}
            size="sm"
            className="w-full rounded-xl text-white text-xs"
            style={{ backgroundColor: '#83A2DB' }}
          >
            <Sparkles className="w-3.5 h-3.5 mr-1.5" />
            Audit Last Call
          </Button>
        )}
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && sendMessage()}
            placeholder="Ask your coach…"
            className="rounded-xl text-sm flex-1"
            style={{ backgroundColor: 'var(--bg-surface-hover)', border: 'none' }}
            disabled={isLoading || isInitializing}
          />
          <Button
            onClick={sendMessage}
            disabled={isLoading || !input.trim() || isInitializing}
            size="icon"
            className="rounded-xl text-white shrink-0"
            style={{ backgroundColor: '#CE6969' }}
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
