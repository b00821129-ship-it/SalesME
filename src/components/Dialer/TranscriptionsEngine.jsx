import { useEffect, useRef, useCallback } from 'react';

/**
 * Single-channel transcription of the rep's microphone.
 * The Web Speech API only reliably supports one recognition instance per tab.
 * For prospect audio, a separate call recording service (Twilio, etc.) is needed.
 */
export function useTranscription({ onRepText, isActive }) {
  const recRef = useRef(null);
  const activeRef = useRef(isActive);

  useEffect(() => { activeRef.current = isActive; }, [isActive]);

  const start = useCallback(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const rec = new SpeechRecognition();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = 'en-US';
    recRef.current = rec;

    rec.onresult = (e) => {
      let interim = '';
      let final = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript;
        if (e.results[i].isFinal) final += t + ' ';
        else interim += t;
      }
      if (final || interim) onRepText(final || interim, !!final);
    };

    rec.onerror = (e) => {
      if (e.error === 'no-speech') return;
      console.warn('SpeechRecognition error:', e.error);
    };

    rec.onend = () => {
      if (activeRef.current) {
        try { rec.start(); } catch (_) {}
      }
    };

    try { rec.start(); } catch (_) {}
  }, [onRepText]);

  useEffect(() => {
    if (isActive) {
      start();
    } else {
      activeRef.current = false;
      try { recRef.current?.stop(); } catch (_) {}
      recRef.current = null;
    }
    return () => {
      activeRef.current = false;
      try { recRef.current?.stop(); } catch (_) {}
    };
  }, [isActive]);

  const isSupported = !!(window.SpeechRecognition || window.webkitSpeechRecognition);
  return { isSupported };
}
