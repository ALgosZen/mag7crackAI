// src/components/CodingMock.tsx
import React, { useState, useEffect, useRef } from "react";
import { InterviewSession } from "../types.js";
import { PRESET_PROBLEMS } from "../lib/presetData.js";
import { 
  ArrowLeft, Code, Play, CheckCircle2,
  Terminal, RefreshCw, Cpu, Clock, Lightbulb, Mic, BarChart3, AlertCircle
} from "lucide-react";
import { apiFetch } from "../api.ts";

interface CodingMockProps {
  session: InterviewSession;
  onBack: () => void;
  onSubmitResults: (results: any) => Promise<void>;
}

export default function CodingMock({ session, onBack, onSubmitResults }: CodingMockProps) {
  const dynamicChallenge = session.challenge;
  
  const [code, setCode] = useState(dynamicChallenge?.starterCode || PRESET_PROBLEMS[0].starterCode);
  const [language, setLanguage] = useState("python");
  const [isLoading, setIsLoading] = useState(false);
  const [currentLoaderMessage, setCurrentLoaderMessage] = useState("");
  const [evaluation, setEvaluation] = useState<any>(null);

  // --- FAANG Timer Logic ---
  const [timeLeft, setTimeTaken] = useState(2700); // 45 minutes
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTimeTaken((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  // --- AI Hint Logic ---
  const [hints, setHints] = useState<string[]>([]);
  const [isGettingHint, setIsGettingHint] = useState(false);

  const getAiHint = async () => {
    if (hints.length >= 3) return alert("Maximum hints reached for this session.");
    try {
      setIsGettingHint(true);
      const res = await apiFetch(`/api/sessions/${session.id}/hint`, {
        method: "POST",
        body: JSON.stringify({
          problemTitle: displayTitle,
          problemDescription: displayDescription,
          userCode: code
        })
      });
      const data = await res.json();
      setHints([...hints, data.hint]);
    } finally {
      setIsGettingHint(false);
    }
  };

  // --- Voice Dictation Logic ---
  const [isListening, setIsListening] = useState(false);
  const startVoiceLogic = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return alert("Speech recognition not supported in this browser.");

    const recognition = new SpeechRecognition();
    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setCode(prev => `# AI Voice Logic: ${transcript}\n${prev}`);
      setIsListening(false);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.start();
  };

  const displayTitle = dynamicChallenge?.title || PRESET_PROBLEMS[0].title;
  const displayDescription = dynamicChallenge?.description || PRESET_PROBLEMS[0].description;
  const displayDifficulty = dynamicChallenge?.difficulty || "Medium";

  const executeSubmission = async () => {
    setIsLoading(true);
    if (timerRef.current) clearInterval(timerRef.current);

    try {
      const response = await apiFetch(`/api/sessions/${session.id}/submit-coding`, {
        method: "POST",
        body: JSON.stringify({
          problemId: dynamicChallenge?.id || "manual",
          problemTitle: displayTitle,
          problemDescription: displayDescription,
          userCode: code,
          language,
          hintsUsed: hints.length,
          timeTaken: 2700 - timeLeft
        })
      });

      if (!response.ok) throw new Error("Evaluation failed.");
      const data = await response.json();
      setEvaluation(data);
      await onSubmitResults(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6" id="coding-mock-workspace">
      {/* Dynamic Header with Timer */}
      <div className="flex flex-col sm:flex-row justify-between items-center bg-white p-4 rounded-xl border border-zinc-200 shadow-sm gap-4">
        <button onClick={onBack} className="flex items-center space-x-2 text-xs font-bold text-zinc-600 hover:text-zinc-900 bg-zinc-100 hover:bg-zinc-200 px-3.5 py-2 rounded-lg cursor-pointer">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Exit Cockpit</span>
        </button>

        <div className={`flex items-center space-x-3 px-4 py-2 rounded-full border-2 ${timeLeft < 300 ? "bg-rose-50 border-rose-200 text-rose-600 animate-pulse" : "bg-zinc-900 border-zinc-800 text-white"}`}>
          <Clock className="w-4 h-4" />
          <span className="font-mono font-black text-lg">{formatTime(timeLeft)}</span>
          <span className="text-[10px] uppercase font-bold tracking-widest opacity-70">FAANG Pressure Timer</span>
        </div>

        <div className="flex items-center space-x-2">
           <button onClick={startVoiceLogic} className={`p-2 rounded-lg border transition-all ${isListening ? "bg-rose-500 text-white border-rose-600 animate-bounce" : "bg-white border-zinc-200 text-zinc-600 hover:bg-zinc-50"}`} title="Dictate Logic">
            <Mic className="w-4 h-4" />
          </button>
          <button onClick={getAiHint} disabled={isGettingHint} className="flex items-center space-x-2 bg-amber-50 border border-amber-200 text-amber-700 px-4 py-2 rounded-lg text-xs font-bold hover:bg-amber-100 transition-all cursor-pointer">
            {isGettingHint ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Lightbulb className="w-3.5 h-3.5" />}
            <span>Get Nudge (-5%)</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm flex flex-col p-6 space-y-4">
            <div className="flex items-center justify-between">
               <div className="flex items-center space-x-3">
                <h1 className="text-xl font-extrabold text-zinc-950">{displayTitle}</h1>
                <span className="px-2.5 py-0.5 text-[10px] uppercase font-bold text-zinc-700 rounded-md border bg-purple-50 border-purple-200">{displayDifficulty}</span>
              </div>
            </div>
            <div className="text-zinc-700 text-sm leading-relaxed whitespace-pre-wrap bg-zinc-50 p-4.5 rounded-xl border border-zinc-100 font-sans">
              {displayDescription}
            </div>
          </div>

          {hints.length > 0 && (
            <div className="bg-amber-50 border border-amber-100 rounded-2xl p-5 space-y-3">
              <h4 className="text-xs font-black text-amber-800 uppercase flex items-center space-x-2">
                <Lightbulb className="w-4 h-4" />
                <span>Interviewer Nudges</span>
              </h4>
              <div className="space-y-2">
                {hints.map((h, i) => (
                  <p key={i} className="text-xs text-amber-700 leading-relaxed italic border-l-2 border-amber-300 pl-3">"{h}"</p>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col space-y-6">
          <div className="bg-zinc-950 rounded-2xl border border-zinc-800 shadow-lg overflow-hidden flex flex-col">
            <div className="bg-zinc-900 px-4 py-3 border-b border-zinc-800 flex justify-between items-center text-xs text-zinc-400">
              <div className="flex items-center space-x-2">
                <Code className="w-4 h-4 text-purple-400" />
                <span className="font-semibold font-mono text-zinc-200">sandbox_workspace.py</span>
              </div>
              {isListening && <span className="text-rose-500 font-bold animate-pulse">● Listening...</span>}
            </div>
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              spellCheck={false}
              rows={16}
              className="w-full bg-zinc-950 text-emerald-400 font-mono text-xs p-4 focus:outline-none resize-none leading-relaxed select-text"
            />
            <div className="bg-zinc-900 p-4 border-t border-zinc-800 flex justify-between items-center">
              <div className="flex items-center space-x-2 text-zinc-500 text-xs font-medium">
                <AlertCircle className="w-4 h-4" />
                <span>{hints.length > 0 ? `${hints.length} hints used` : "No hints used yet"}</span>
              </div>
              <button
                onClick={executeSubmission}
                disabled={isLoading}
                className="bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold py-2.5 px-6 rounded-lg flex items-center space-x-2 transition-all cursor-pointer shadow-lg shadow-purple-900/20"
              >
                {isLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
                <span>Final Submission</span>
              </button>
            </div>
          </div>

          {evaluation && !isLoading && (
            <div className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-sm space-y-6 animate-in fade-in slide-in-from-bottom-2">
              <div className="flex justify-between items-center pb-4 border-b border-zinc-100">
                 <div className="flex items-center space-x-3">
                  <div className="bg-emerald-100 p-2 rounded-lg">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-zinc-950">Leveling Result</h3>
                    <p className="text-[10px] text-zinc-400 uppercase font-bold tracking-widest">{evaluation.level}</p>
                  </div>
                </div>
                <div className="bg-purple-50 px-5 py-2.5 rounded-xl border border-purple-100 text-center">
                   <span className="block text-[9px] font-black text-purple-500 uppercase tracking-widest leading-none mb-1">Final Score</span>
                   <span className="text-3xl font-black text-purple-700">{evaluation.session.score}%</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-zinc-50 p-4 rounded-xl border border-zinc-150 text-center">
                  <span className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Complexity</span>
                  <span className="font-mono text-base font-extrabold text-zinc-800">{evaluation.submission.timeComplexity}</span>
                </div>
                <div className="bg-zinc-50 p-4 rounded-xl border border-zinc-150 text-center">
                  <span className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Experience</span>
                  <span className="font-sans text-sm font-black text-indigo-600 uppercase">{evaluation.level.split(' ')[0]}</span>
                </div>
              </div>
              <div className="prose prose-zinc max-w-none text-zinc-700 text-sm leading-relaxed whitespace-pre-wrap bg-gradient-to-b from-purple-50/10 to-zinc-50/20 p-5 rounded-2xl border border-zinc-150 font-sans">
                {evaluation.submission.aiFeedback}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
