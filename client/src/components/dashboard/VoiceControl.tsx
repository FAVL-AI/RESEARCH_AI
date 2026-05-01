"use client";

import { useState, useEffect } from "react";
import { Mic, MicOff } from "lucide-react";

export const VoiceControl = ({ onCommand }: { onCommand: (cmd: string) => void }) => {
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);

  useEffect(() => {
    if (typeof window !== "undefined" && ("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      const recog = new SpeechRecognition();
      recog.continuous = false;
      recog.interimResults = false;
      recog.lang = "en-US";

      recog.onresult = (event: any) => {
        const command = event.results[0][0].transcript;
        onCommand(command);
        setIsListening(false);
      };

      recog.onerror = () => setIsListening(false);
      recog.onend = () => setIsListening(false);

      setRecognition(recog);
    }
  }, [onCommand]);

  const toggleListening = () => {
    if (isListening) {
      recognition?.stop();
    } else {
      recognition?.start();
      setIsListening(true);
    }
  };

  return (
    <button 
      onClick={toggleListening}
      className={`p-2 rounded-full transition-all ${isListening ? "bg-red-500/20 text-red-500 animate-pulse" : "hover:bg-black/10 dark:bg-white/10 text-black/60 dark:text-white/40"}`}
    >
      {isListening ? <MicOff size={18} /> : <Mic size={18} />}
    </button>
  );
};
