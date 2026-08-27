import React, { useState, useEffect, useRef } from 'react';
import { Mic, Captions } from 'lucide-react';

export default function LiveCaptions({ isEnabled, username = 'You' }) {
  const [captionText, setCaptionText] = useState('');
  const [isRecognizing, setIsRecognizing] = useState(false);
  const recognitionRef = useRef(null);
  const timeoutRef = useRef(null);

  useEffect(() => {
    if (!isEnabled) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {}
      }
      setCaptionText('');
      setIsRecognizing(false);
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn("Speech Recognition not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsRecognizing(true);
    };

    recognition.onresult = (event) => {
      let currentText = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        currentText += event.results[i][0].transcript;
      }

      setCaptionText(currentText);

      // Auto-clear after 4 seconds of silence
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        setCaptionText('');
      }, 4000);
    };

    recognition.onerror = (e) => {
      console.warn("Speech recognition error:", e.error);
    };

    recognition.onend = () => {
      // Restart if still enabled
      if (isEnabled) {
        try {
          recognition.start();
        } catch (e) {}
      }
    };

    try {
      recognition.start();
      recognitionRef.current = recognition;
    } catch (e) {
      console.warn("Speech recognition start failed:", e.message);
    }

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {}
      }
    };
  }, [isEnabled]);

  if (!isEnabled || !captionText) return null;

  return (
    <div className="absolute bottom-20 left-1/2 -translate-x-1/2 max-w-2xl px-6 py-3 bg-slate-900/85 backdrop-blur-xl border border-white/20 rounded-2xl text-white shadow-2xl z-35 animate-in fade-in slide-in-from-bottom-3 duration-150 flex items-center gap-3 select-none">
      <div className="p-1.5 rounded-lg bg-blue-600 text-white shrink-0 shadow-xs">
        <Captions className="w-4 h-4" />
      </div>
      <div className="leading-snug">
        <span className="font-bold text-blue-400 text-xs mr-2">{username}:</span>
        <span className="text-xs font-medium text-slate-100">{captionText}</span>
      </div>
    </div>
  );
}
