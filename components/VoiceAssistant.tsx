
import React, { useState, useCallback, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Icons, TRANSLATIONS } from '../constants';
import { processVoiceCommand } from '../services/gemini';

const VoiceAssistant: React.FC = () => {
  const { language } = useApp();
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [feedback, setFeedback] = useState('');

  const speak = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language === 'hi' ? 'hi-IN' : language === 'pa' ? 'pa-IN' : 'en-US';
    window.speechSynthesis.speak(utterance);
  };

  const startListening = () => {
    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice recognition not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = language === 'hi' ? 'hi-IN' : language === 'pa' ? 'pa-IN' : 'en-US';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onresult = async (event: any) => {
      const text = event.results[0][0].transcript;
      setTranscript(text);
      const result = await processVoiceCommand(text, language);
      setFeedback(result.feedback);
      speak(result.feedback);
      // Here you could handle navigation or actions based on result.action
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);

    recognition.start();
  };

  return (
    <div className="fixed bottom-24 right-6 z-50">
      {isListening && (
        <div className="absolute bottom-16 right-0 bg-white p-4 rounded-xl shadow-2xl border border-green-100 w-64 animate-bounce">
          <p className="text-xs text-gray-500 mb-1">Listening...</p>
          <p className="text-sm font-medium">{transcript || "..."}</p>
        </div>
      )}
      {feedback && !isListening && (
        <div className="absolute bottom-16 right-0 bg-green-50 p-4 rounded-xl shadow-xl border border-green-200 w-64">
          <p className="text-sm text-green-800">{feedback}</p>
          <button onClick={() => setFeedback('')} className="mt-2 text-xs text-green-600 underline">Close</button>
        </div>
      )}
      <button
        onClick={startListening}
        className={`p-5 rounded-full shadow-2xl transition-all ${isListening ? 'bg-red-500 scale-110' : 'bg-green-600 active:scale-95'}`}
      >
        <div className="text-white">
          <Icons.Mic />
        </div>
      </button>
    </div>
  );
};

export default VoiceAssistant;
