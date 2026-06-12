// src/components/CodingMock.tsx
/**
 * CodingMock Component
 * Implements the technical coding/algorithms and systems design editor playground,
 * submitting code constructs to server-side Gemini endpoints for comprehensive Big-O evaluations.
 */


import React, { useState } from "react";
import { InterviewSession, PresetProblem } from "../types.js";
import { PRESET_PROBLEMS } from "../lib/presetData.js";
import { 
  ArrowLeft, Code, Play, CheckCircle2, ChevronRight, 
  Terminal, AlertTriangle, HelpCircle, RefreshCw, Cpu 
} from "lucide-react";
import { apiFetch } from "../api.ts";

interface CodingMockProps {
  session: InterviewSession;
  onBack: () => void;
  onSubmitResults: (results: {
    problemId: string;
    problemTitle: string;
    problemDescription: string;
    userCode: string;
    timeComplexity: string;
    spaceComplexity: string;
    aiFeedback: string;
    score: number;
  }) => Promise<void>;
}

export default function CodingMock({ session, onBack, onSubmitResults }: CodingMockProps) {
  const [problemIndex, setProblemIndex] = useState(0);
  const selectedProblem = PRESET_PROBLEMS[problemIndex] || PRESET_PROBLEMS[0];
  
  const [code, setCode] = useState(selectedProblem.starterCode);
  const [language, setLanguage] = useState("python");
  const [isLoading, setIsLoading] = useState(false);
  const [currentLoaderMessage, setCurrentLoaderMessage] = useState("");
  
  // feedback display
  const [evaluation, setEvaluation] = useState<{
    timeComplexity: string;
    spaceComplexity: string;
    aiFeedback: string;
    score: number;
  } | null>(null);

  const loaderMessages = [
    "Establishing full-stack sandboxed evaluation...",
    "Compiling code AST and lexical structure...",
    "Spinning up Gemini 3.5 AI Senior Interviewer...",
    "Assessing algorithmic complexity invariants...",
    "Validating edge-case inputs (null values, long arrays)...",
    "Writing comprehensive markdown assessment reports..."
  ];

  const handleProblemChange = (index: number) => {
    setProblemIndex(index);
    setCode(PRESET_PROBLEMS[index].starterCode);
    setEvaluation(null);
  };

  const executeSubmission = async () => {
    setIsLoading(true);
    let messageIndex = 0;
    setCurrentLoaderMessage(loaderMessages[0]);

    // Simple ticker effect for interactive reassurance
    const ticker = setInterval(() => {
      messageIndex = (messageIndex + 1) % loaderMessages.length;
      setCurrentLoaderMessage(loaderMessages[messageIndex]);
    }, 2800);

    try {
      // Call express full-stack endpoint
      const response = await apiFetch(`/api/sessions/${session.id}/submit-coding`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          problemId: selectedProblem.id,
          problemTitle: selectedProblem.title,
          problemDescription: selectedProblem.description,
          userCode: code,
          language
        })
      });

      if (!response.ok) {
        throw new Error("Evaluation request failed to construct.");
      }

      const data = await response.json();
      
      const evalResult = {
        timeComplexity: data.submission.timeComplexity,
        spaceComplexity: data.submission.spaceComplexity,
        aiFeedback: data.submission.aiFeedback,
        score: data.session.score
      };

      setEvaluation(evalResult);

      // notify parent component state
      await onSubmitResults({
        problemId: selectedProblem.id,
        problemTitle: selectedProblem.title,
        problemDescription: selectedProblem.description,
        userCode: code,
        timeComplexity: evalResult.timeComplexity,
        spaceComplexity: evalResult.spaceComplexity,
        aiFeedback: evalResult.aiFeedback,
        score: evalResult.score
      });

    } catch (err) {
      console.error(err);
      setEvaluation({
        timeComplexity: "N/A",
        spaceComplexity: "N/A",
        aiFeedback: `### Setup Blocked\n\nThere was an issue processing your workspace solution.\n\n**Details:** ${err instanceof Error ? err.message : String(err)}\n\nPlease double check server status.`,
        score: 0
      });
    } finally {
      clearInterval(ticker);
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6" id="coding-mock-workspace">
      {/* Back to cockpit Header */}
      <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-zinc-200">
        <button
          id="btn-back-to-dashboard"
          type="button"
          onClick={onBack}
          className="flex items-center space-x-2 text-xs font-bold text-zinc-600 hover:text-zinc-900 bg-zinc-100 hover:bg-zinc-200 px-3.5 py-2 rounded-lg cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Exit Cockpit</span>
        </button>

        <div className="text-right">
          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block">Session ID</span>
          <span className="text-xs font-mono font-bold text-zinc-700">{session.id}</span>
        </div>
      </div>

      {/* Workspace Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        
        {/* Left Hand: Selector + Problem Info */}
        <div className="bg-white rounded-2xl border border-zinc-200 shadow-xs flex flex-col" id="problem-prompt-card">
          <div className="p-5 border-b border-zinc-200">
            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-3">Choose Your Prompt</h3>
            <div className="flex space-x-2 overflow-x-auto pb-1">
              {PRESET_PROBLEMS.map((prob, i) => {
                const isActive = prob.id === selectedProblem.id;
                let diffBadge = "bg-green-50 text-green-700 border-green-200";
                if (prob.difficulty === "Medium") diffBadge = "bg-amber-50 text-amber-700 border-amber-200";
                if (prob.difficulty === "Hard") diffBadge = "bg-rose-50 text-rose-700 border-rose-200";

                return (
                  <button
                    key={prob.id}
                    id={`btn-prob-select-${i}`}
                    type="button"
                    onClick={() => handleProblemChange(i)}
                    className={`px-4 py-2 text-xs font-bold rounded-lg border transition-all shrink-0 cursor-pointer ${
                      isActive
                        ? "bg-purple-600 border-purple-600 text-white shadow-xs"
                        : "bg-zinc-50 border-zinc-200 text-zinc-600 hover:bg-zinc-100"
                    }`}
                  >
                    {prob.title}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="p-6 space-y-4">
            <div className="flex items-center space-x-3">
              <h1 className="text-xl font-extrabold text-zinc-950">{selectedProblem.title}</h1>
              <span className={`px-2.5 py-0.5 text-[10px] uppercase font-bold text-zinc-700 rounded-md border ${
                selectedProblem.difficulty === "Easy" ? "bg-green-50 border-green-200" :
                selectedProblem.difficulty === "Medium" ? "bg-amber-50 border-amber-200" : "bg-rose-50 border-rose-200"
              }`}>
                {selectedProblem.difficulty}
              </span>
            </div>

            {/* Render Prompt Description */}
            <div className="text-zinc-700 text-sm leading-relaxed whitespace-pre-wrap font-sans prose prose-zinc bg-zinc-50 p-4.5 rounded-xl border border-zinc-100">
              {selectedProblem.description}
            </div>
          </div>
        </div>

        {/* Right Hand: Code Editor & Exec Box */}
        <div className="flex flex-col space-y-6" id="code-editor-card">
          <div className="bg-zinc-950 rounded-2xl border border-zinc-800 shadow-lg overflow-hidden flex flex-col">
            
            {/* Editor Header Details */}
            <div className="bg-zinc-900 px-4 py-3 border-b border-zinc-800 flex justify-between items-center text-xs text-zinc-400">
              <div className="flex items-center space-x-2">
                <Code className="w-4 h-4 text-purple-400" />
                <span className="font-semibold font-mono text-zinc-200">sandbox_workspace.py</span>
              </div>
              <div className="flex items-center space-x-3">
                <span className="bg-zinc-800 px-2 py-1 rounded-sm text-[10px] font-bold text-zinc-300">python3</span>
              </div>
            </div>

            {/* Raw Code Editor Text Sheet */}
            <div className="relative flex">
              {/* Fake line numbers */}
              <div className="bg-zinc-900 border-r border-zinc-800 text-zinc-600 px-3 py-4 select-none font-mono text-xs text-right space-y-0.5 w-10">
                {Array.from({ length: 15 }).map((_, i) => (
                  <div key={i}>{i + 1}</div>
                ))}
              </div>
              
              <textarea
                id="workspace-code-textarea"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                spellCheck={false}
                rows={15}
                className="w-full bg-zinc-950 text-emerald-400 font-mono text-xs p-4 focus:outline-hidden resize-y leading-relaxed tab-size-4 select-text"
              />
            </div>

            {/* Run Operations Block */}
            <div className="bg-zinc-900 p-4 border-t border-zinc-800 flex justify-between items-center">
              <div className="flex items-center space-x-2 text-zinc-500 text-xs">
                <Terminal className="w-4 h-4" />
                <span>Compiler: Ready</span>
              </div>

              <button
                id="btn-evaluate-solution"
                type="button"
                disabled={isLoading}
                onClick={executeSubmission}
                className="bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold py-2.5 px-5 rounded-lg flex items-center space-x-2 transition-all cursor-pointer disabled:opacity-40"
              >
                {isLoading ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Play className="w-3.5 h-3.5" />
                )}
                <span>Evaluate Solution</span>
              </button>
            </div>

          </div>

          {/* Prompt Assessment Loading state */}
          {isLoading && (
            <div className="bg-purple-50 rounded-2xl border border-purple-100 p-6 flex items-center space-x-4 animate-pulse shadow-xs" id="loader-box">
              <div className="bg-purple-600 p-3 rounded-xl text-white">
                <Cpu className="w-6 h-6 animate-spin" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-purple-900">Conducting Technical Evaluation</h4>
                <p className="text-xs text-purple-600 mt-1 max-w-md font-medium">{currentLoaderMessage}</p>
              </div>
            </div>
          )}

          {/* Loaded Feedback Screen */}
          {evaluation && !isLoading && (
            <div className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-sm space-y-6" id="feedback-display">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-zinc-100">
                <div>
                  <h3 className="text-base font-extrabold text-zinc-950 flex items-center space-x-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    <span>Gemini AI Evaluation Complete</span>
                  </h3>
                  <p className="text-xs text-zinc-500 mt-0.5">Comprehensive assessment structured results.</p>
                </div>

                <div className="bg-purple-50 px-4 py-2 rounded-xl border border-purple-100 text-center">
                  <span className="block text-[9px] font-bold text-purple-500 uppercase tracking-widest leading-none">Diagnostic Score</span>
                  <span className="text-2xl font-black text-purple-700">{evaluation.score}/100</span>
                </div>
              </div>

              {/* Big-O Analysis Summary Card */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-zinc-50 p-4 rounded-xl border border-zinc-150 text-center">
                  <span className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Time Complexity</span>
                  <span className="font-mono text-base font-extrabold text-zinc-800">{evaluation.timeComplexity}</span>
                </div>
                <div className="bg-zinc-50 p-4 rounded-xl border border-zinc-150 text-center">
                  <span className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Space Complexity</span>
                  <span className="font-mono text-base font-extrabold text-zinc-800">{evaluation.spaceComplexity}</span>
                </div>
              </div>

              {/* Render AI Feedback Markdown Block */}
              <div className="prose prose-zinc max-w-none text-zinc-700 text-sm leading-relaxed whitespace-pre-wrap space-y-2 bg-gradient-to-b from-purple-50/10 to-zinc-50/20 p-5 rounded-2xl border border-zinc-150 font-sans">
                {evaluation.aiFeedback}
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}

// © 2026 Mag7Crack.ai SaaS Core. All rights preserved.

