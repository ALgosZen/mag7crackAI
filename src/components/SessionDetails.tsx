// src/components/SessionDetails.tsx
/**
 * SessionDetails Component
 * Loads and displays the deep-dive diagnostic logs for any historic session,
 * presenting granular coding Big-O performance values and behavioral STAR score charts.
 */


import React, { useEffect, useState } from "react";
import { InterviewSession, CodingSubmission, BehavioralResponse } from "../types.js";
import { 
  ArrowLeft, Calendar, Award, Code, Users, BrainCircuit, 
  Trash2, BarChart3, Clock, HelpCircle, CheckSquare, Sparkles 
} from "lucide-react";
import { apiFetch } from "../api.ts";

interface SessionDetailsProps {
  sessionId: string;
  onBack: () => void;
}

export default function SessionDetails({ sessionId, onBack }: SessionDetailsProps) {
  const [data, setData] = useState<{
    session: InterviewSession;
    codingSubmissions: CodingSubmission[];
    behavioralResponses: BehavioralResponse[];
  } | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        setIsLoading(true);
        const res = await apiFetch(`/api/sessions/${sessionId}/details`);
        if (!res.ok) throw new Error("Could not find interview session records on the server.");
        const json = await res.json();
        setData(json);
      } catch (err) {
        console.error(err);
        setError(err instanceof Error ? err.message : "An error occurred.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDetails();
  }, [sessionId]);

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl border border-zinc-200 p-12 text-center shadow-xs" id="details-loader">
        <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-sm font-semibold text-zinc-500">Retrieving full-stack assessment archives...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-white rounded-2xl border border-zinc-200 p-8 text-center shadow-xs" id="details-error">
        <h4 className="text-sm font-extrabold text-rose-600">Error Loading Archive</h4>
        <p className="text-xs text-zinc-400 mt-2">{error || "Failed to parse database record."}</p>
        <button
          onClick={onBack}
          className="mt-4 px-4 py-2 bg-zinc-100 text-zinc-700 rounded-lg text-xs font-bold hover:bg-zinc-200 transition-colors"
        >
          Return to Cockpit
        </button>
      </div>
    );
  }

  const { session, codingSubmissions, behavioralResponses } = data;
  const score = session.score;

  let scoreColor = "text-rose-600 bg-rose-50 border-rose-100";
  if (score >= 85) {
    scoreColor = "text-emerald-700 bg-emerald-50 border-emerald-100";
  } else if (score >= 70) {
    scoreColor = "text-amber-700 bg-amber-50 border-amber-100";
  }

  return (
    <div className="space-y-6" id="session-details-workspace">
      {/* Session Title cockpit */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-5 rounded-xl border border-zinc-200 shadow-xs gap-4">
        <div className="flex items-center space-x-3">
          <button
            id="btn-back-to-dashboard"
            type="button"
            onClick={onBack}
            className="p-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-600 rounded-lg transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-sm text-zinc-800">
                {session.type === "CODING" ? "Coding Algorithm Assessment" : "Behavioral Interview Round"}
              </span>
              <span className="px-2 py-0.5 text-[9px] font-bold text-zinc-500 uppercase bg-zinc-100 border border-zinc-200 rounded-sm">
                {session.roleTarget} Path
              </span>
            </div>
            <div className="text-[11px] text-zinc-400 mt-1 flex items-center space-x-1">
              <Calendar className="w-3.5 h-3.5" />
              <span>Conducted: {new Date(session.createdAt).toLocaleDateString(undefined, {
                month: "long",
                day: "numeric",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit"
              })}</span>
            </div>
          </div>
        </div>

        {/* Diagnostic Score Card badge */}
        <div className={`px-4 py-2 border rounded-xl flex items-center justify-between text-right ${scoreColor}`}>
          <div className="pr-3">
            <span className="block text-[9px] font-bold uppercase tracking-widest text-zinc-400">Archived Grade</span>
            <span className="text-xl font-black">{score}%</span>
          </div>
          <Award className="w-5 h-5 opacity-80" />
        </div>
      </div>

      {/* Main Details content container */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Left column: Parameters Summary */}
        <div className="space-y-6 lg:col-span-1" id="details-metadata-cards">
          
          <div className="bg-white rounded-2xl border border-zinc-200 p-5 shadow-xs space-y-4">
            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest block">Parameters</h3>
            
            <div className="space-y-3 text-xs">
              <div className="flex justify-between border-b border-zinc-100 pb-2">
                <span className="text-zinc-500">Verification Engine</span>
                <span className="font-bold text-zinc-800">Gemini 3.5 LLM</span>
              </div>
              <div className="flex justify-between border-b border-zinc-100 pb-2">
                <span className="text-zinc-500">Grading System</span>
                <span className="font-bold text-zinc-800">FAANG Scoring (ABAC)</span>
              </div>
              <div className="flex justify-between border-b border-zinc-100 pb-2">
                <span className="text-zinc-500">Record Reference</span>
                <span className="font-mono text-zinc-800 font-bold">{session.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Status</span>
                <span className="text-emerald-700 font-bold flex items-center gap-1">
                  <CheckSquare className="w-3.5 h-3.5" />
                  <span>Assessed</span>
                </span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-tr from-zinc-950 to-zinc-900 border border-zinc-900 rounded-2xl p-5 shadow-xs text-white">
            <h4 className="text-xs font-bold text-purple-400 uppercase tracking-widest mb-2 flex items-center gap-1.5 font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Diagnostic Insight</span>
            </h4>
            <p className="text-xs text-zinc-300 leading-relaxed font-sans">
              This report has been permanently preserved in your server-side database. Use the critique blocks on the right-hand container to optimize edge-cases and structural gaps in your replies.
            </p>
          </div>

        </div>

        {/* Right column: Content Submission & AI Feedback */}
        <div className="lg:col-span-2 space-y-6" id="details-submissions-column">
          
          {/* Coding Assessment Specific view: */}
          {session.type === "CODING" && (
            <div className="space-y-6">
              {codingSubmissions.length === 0 ? (
                <div className="bg-white rounded-2xl border border-zinc-200 p-8 text-center shadow-xs">
                  <p className="text-xs text-zinc-500">No coding algorithm submissions were logged during this session.</p>
                </div>
              ) : (
                codingSubmissions.map((sub) => (
                  <div key={sub.id} className="space-y-6">
                    {/* Complexity Benchmarking parameters */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-zinc-50 border border-zinc-200 p-4 rounded-xl text-center shadow-xs">
                        <span className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1 font-bold">Time Complexity</span>
                        <span className="font-mono text-base font-extrabold text-zinc-800">{sub.timeComplexity}</span>
                      </div>
                      <div className="bg-zinc-50 border border-zinc-200 p-4 rounded-xl text-center shadow-xs">
                        <span className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1 font-bold">Space Complexity</span>
                        <span className="font-mono text-base font-extrabold text-zinc-800">{sub.spaceComplexity}</span>
                      </div>
                    </div>

                    {/* Preserved Code AST viewer */}
                    <div className="bg-zinc-950 rounded-2xl border border-zinc-850 overflow-hidden shadow-md flex flex-col">
                      <div className="bg-zinc-900 px-4 py-2.5 border-b border-zinc-850 flex items-center space-x-2 text-xs text-zinc-400">
                        <Code className="w-4 h-4 text-purple-400" />
                        <span className="font-semibold font-mono tracking-wide">preserved_workspace.py</span>
                      </div>
                      <pre className="p-4 overflow-x-auto text-emerald-400 font-mono text-xs leading-relaxed select-text">
                        <code>{sub.userCode}</code>
                      </pre>
                    </div>

                    {/* Preserved AI Critique markdown report */}
                    <div className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-sm space-y-4">
                      <h4 className="text-sm font-extrabold text-zinc-950 flex items-center space-x-2">
                        <BarChart3 className="w-5 h-5 text-purple-600" />
                        <span>Preserved AI Critique Breakdown</span>
                      </h4>
                      <div className="prose prose-zinc text-zinc-700 text-sm leading-relaxed whitespace-pre-wrap bg-gradient-to-b from-purple-50/10 to-zinc-50/20 p-5 rounded-2xl border border-zinc-150 font-sans">
                        {sub.aiFeedback}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Behavioral Assessment Specific view: */}
          {session.type === "BEHAVIORAL" && (
            <div className="space-y-6">
              {behavioralResponses.length === 0 ? (
                <div className="bg-white rounded-2xl border border-zinc-200 p-8 text-center shadow-xs">
                  <p className="text-xs text-zinc-500">No behavioral transcript replies were captured in this session.</p>
                </div>
              ) : (
                behavioralResponses.map((beh) => {
                  let parsedMetrics = { situationTask: 8, action: 8, result: 8, communication: 8 };
                  try {
                    if (typeof beh.gradingMetrics === "string") {
                      parsedMetrics = JSON.parse(beh.gradingMetrics);
                    } else if (beh.gradingMetrics) {
                      parsedMetrics = beh.gradingMetrics;
                    }
                  } catch (e) {
                    console.error("Failed to parse archived metrics:", e);
                  }

                  return (
                    <div key={beh.id} className="space-y-6">
                      
                      {/* Interactive STAR metrics indicators */}
                      <div className="bg-zinc-50 border border-zinc-200 p-5 rounded-2xl shadow-xs space-y-3.5">
                        <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Achieved STAR Metrics</span>
                        <div className="grid grid-cols-2 gap-4 mt-1">
                          <div className="space-y-1">
                            <div className="flex justify-between text-xs font-bold text-zinc-700">
                              <span>S/T: Context Details</span>
                              <span>{parsedMetrics.situationTask}/10</span>
                            </div>
                            <div className="bg-zinc-250 h-1.5 rounded-full overflow-hidden">
                              <div className="bg-indigo-600 h-1.5 rounded-full" style={{ width: `${parsedMetrics.situationTask * 10}%` }}></div>
                            </div>
                          </div>

                          <div className="space-y-1">
                            <div className="flex justify-between text-xs font-bold text-zinc-700">
                              <span>A: Actions Mediated</span>
                              <span>{parsedMetrics.action}/10</span>
                            </div>
                            <div className="bg-zinc-250 h-1.5 rounded-full overflow-hidden">
                              <div className="bg-indigo-600 h-1.5 rounded-full" style={{ width: `${parsedMetrics.action * 10}%` }}></div>
                            </div>
                          </div>

                          <div className="space-y-1">
                            <div className="flex justify-between text-xs font-bold text-zinc-700">
                              <span>R: Concrete Metrics</span>
                              <span>{parsedMetrics.result}/10</span>
                            </div>
                            <div className="bg-zinc-250 h-1.5 rounded-full overflow-hidden">
                              <div className="bg-indigo-600 h-1.5 rounded-full" style={{ width: `${parsedMetrics.result * 10}%` }}></div>
                            </div>
                          </div>

                          <div className="space-y-1">
                            <div className="flex justify-between text-xs font-bold text-zinc-700">
                              <span>C: Delivery & Clarity</span>
                              <span>{parsedMetrics.communication}/10</span>
                            </div>
                            <div className="bg-zinc-250 h-1.5 rounded-full overflow-hidden">
                              <div className="bg-indigo-600 h-1.5 rounded-full" style={{ width: `${parsedMetrics.communication * 10}%` }}></div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Archived transcript review */}
                      <div className="bg-white rounded-2xl border border-zinc-200 p-5 shadow-xs space-y-2.5">
                        <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Preserved Voice Transcript</span>
                        <blockquote className="text-xs text-zinc-500 italic border-l-4 border-indigo-200 pl-4 py-1 leading-relaxed whitespace-pre-wrap select-text">
                          "{beh.audioTranscript}"
                        </blockquote>
                      </div>

                      {/* Preserved AI Critique markdown report */}
                      <div className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-sm space-y-4">
                        <h4 className="text-sm font-extrabold text-zinc-950 flex items-center space-x-2">
                          <BarChart3 className="w-5 h-5 text-purple-600" />
                          <span>Preserved STAR Assessment report</span>
                        </h4>
                        <div className="prose prose-zinc text-zinc-700 text-sm leading-relaxed whitespace-pre-wrap bg-gradient-to-b from-purple-50/10 to-zinc-50/20 p-5 rounded-2xl border border-zinc-150 font-sans">
                          {beh.aiFeedback}
                        </div>
                      </div>

                    </div>
                  );
                })
              )}
            </div>
          )}

        </div>

      </div>
    </div>
  );
}

// © 2026 Mag7Crack.ai SaaS Core. All rights preserved.

