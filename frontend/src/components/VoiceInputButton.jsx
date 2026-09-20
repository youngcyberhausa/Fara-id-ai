import { useState, useRef, useEffect } from "react";

const LOCALE_MAP = {
  en: "en-US",
  ha: "ha-NG",
  ar: "ar-SA",
  fr: "fr-FR",
  sw: "sw-KE",
  yo: "yo-NG",
  ig: "ig-NG",
};

function getSpeechRecognition() {
  if (typeof window === "undefined") return null;
  return window.SpeechRecognition || window.webkitSpeechRecognition || null;
}

export function parseSpokenNumber(text) {
  if (!text) return null;
  const cleaned = text.replace(/,/g, "").match(/-?\d+(\.\d+)?/);
  return cleaned ? Number(cleaned[0]) : null;
}

export default function VoiceInputButton({ lang = "en", onResult, mode = "text" }) {
  const [listening, setListening] = useState(false);
  const [supported, setSupported] = useState(true);
  const recognitionRef = useRef(null);

  useEffect(() => {
    setSupported(!!getSpeechRecognition());
  }, []);

  function start() {
    const SpeechRecognition = getSpeechRecognition();
    if (!SpeechRecognition) {
      setSupported(false);
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = LOCALE_MAP[lang] || "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setListening(true);
    recognition.onerror = () => setListening(false);
    recognition.onend = () => setListening(false);
    recognition.onresult = (event) => {
      const transcript = event.results?.[0]?.[0]?.transcript || "";
      if (!transcript) return;
      if (mode === "number") {
        const num = parseSpokenNumber(transcript);
        if (num !== null) onResult(num, transcript);
      } else {
        onResult(transcript, transcript);
      }
    };

    recognitionRef.current = recognition;
    recognition.start();
  }

  function stop() {
    recognitionRef.current?.stop();
    setListening(false);
  }

  if (!supported) return null;

  return (
    <button
      type="button"
      onClick={listening ? stop : start}
      aria-label={listening ? "Stop voice input" : "Start voice input"}
      className={`shrink-0 w-9 h-9 rounded-full flex items-center justify-center transition ${
        listening
          ? "bg-red-500 text-white animate-pulse"
          : "bg-gray-900 text-white hover:bg-gray-800"
      }`}
    >
      {listening ? (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <rect x="6" y="6" width="12" height="12" rx="1.5" />
        </svg>
      ) : (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
          <path d="M19 10v1a7 7 0 0 1-14 0v-1" />
          <line x1="12" y1="18" x2="12" y2="22" />
          <line x1="8" y1="22" x2="16" y2="22" />
        </svg>
      )}
    </button>
  );
}
