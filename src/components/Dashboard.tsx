// src/components/Dashboard.tsx
/**
 * Dashboard Component
 * Renders the central cockpit stats panels, active session logs list, and triggers
 * new coding, system design, or behavioral interview assessments.
 */


import React, { useState } from "react";
import { InterviewSession, RoleTarget, InterviewType } from "../types.js";
import { 
  Plus, History, BarChart3, Award, Calendar, ChevronRight, 
  Code, Users, BrainCircuit, Rocket, Flame, RotateCcw, HelpCircle, CheckCircle
} from "lucide-react";

interface DashboardProps {
  sessions: InterviewSession[];
  onStartSession: (role: RoleTarget, type: InterviewType) => void;
  onClearSessions: () => void;
  onSelectSession: (sessionId: string) => void;
}

export default function Dashboard({ 
  sessions, 
  onStartSession, 
  onClearSessions, 
  onSelectSession 
}: DashboardProps) {
  const [role, setRole] = useState<RoleTarget>("SWE");
  const [type, setType] = useState<InterviewType>("CODING");

  // Calculate statistics
  const totalSessions = sessions.length;
  const averageScore = totalSessions > 0 
    ? Math.round(sessions.reduce((acc, s) => acc + s.score, 0) / totalSessions) 
    : 0;
  
  const bestScore = totalSessions > 0
    ? Math.max(...sessions.map(s => s.score))
    : 0;

  // Track readiness tier description
  let readinessStatus = "No Sessions Completed";
  let statusColor = "text-zinc-400";
  let statusBg = "bg-zinc-50 border-zinc-200";
  if (averageScore >= 85) {
    readinessStatus = "FAANG Certified - Ready to Launch";
    statusColor = "text-emerald-700";
    statusBg = "bg-emerald-50 border-emerald-100";
  } else if (averageScore >= 70) {
    readinessStatus = "Strong Progress - Target Edge Cases";
    statusColor = "text-amber-700";
    statusBg = "bg-amber-50 border-amber-100";
  } else if (totalSessions > 0) {
    readinessStatus = "Understudy Level - Practice Core Concepts";
    statusColor = "text-rose-700";
    statusBg = "bg-rose-50 border-rose-100";
  }

  return (
    <div className="space-y-8" id="dashboard-container">
      {/* Welcome & Launchpad Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Core Quick Simulator Setup Launchpad */}
        <div className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-sm flex flex-col justify-between" id="quick-launcher">
          <div>
            <h2 className="text-lg font-bold text-zinc-900 flex items-center space-x-2">
              <Rocket className="w-5 h-5 text-purple-600" />
              <span>Instant Mock Simulator</span>
            </h2>
            <p className="text-xs text-zinc-500 mt-1.5 leading-relaxed">
              Launch a live simulation immediately. Choose your path and our server-side LLM evaluator will evaluate you code/speech based on high-standard FAANG criteria.
            </p>

            <div className="space-y-4 mt-6">
              {/* Target Role Selector */}
              <div>
                <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">
                  Target Engineering Role
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(["SWE", "PM", "DATA_SCIENCE"] as RoleTarget[]).map((r) => {
                    const active = r === role;
                    return (
                      <button
                        key={r}
                        id={`btn-role-${r.toLowerCase()}`}
                        type="button"
                        onClick={() => setRole(r)}
                        className={`py-2 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                          active
                            ? "bg-purple-600 border-purple-600 text-white font-bold shadow-xs"
                            : "bg-white border-zinc-200 text-zinc-600 hover:bg-zinc-50"
                        }`}
                      >
                        {r === "SWE" ? "SWE" : r === "PM" ? "PM" : "DS"}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Assessment Type Selector */}
              <div>
                <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">
                  Interview Assessment Format
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(["CODING", "BEHAVIORAL"] as InterviewType[]).map((t) => {
                    const active = t === type;
                    return (
                      <button
                        key={t}
                        id={`btn-type-${t.toLowerCase()}`}
                        type="button"
                        onClick={() => setType(t)}
                        className={`py-2 px-3 text-xs font-semibold rounded-lg border flex items-center justify-center space-x-2 transition-all cursor-pointer ${
                          active
                            ? "bg-indigo-600 border-indigo-600 text-white font-bold shadow-xs"
                            : "bg-white border-zinc-200 text-zinc-600 hover:bg-zinc-50"
                        }`}
                      >
                        {t === "CODING" ? (
                          <Code className="w-3.5 h-3.5" />
                        ) : (
                          <Users className="w-3.5 h-3.5" />
                        )}
                        <span>{t === "CODING" ? "Coding Algo" : "Behavioral"}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          <button
            id="btn-launch-simulation"
            type="button"
            onClick={() => onStartSession(role, type)}
            className="w-full mt-6 bg-gradient-to-r from-purple-700 to-indigo-600 hover:from-purple-800 hover:to-indigo-700 text-white font-bold py-3 px-4 rounded-xl shadow-md flex items-center justify-center space-x-2 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Generate Mock Challenge</span>
          </button>
        </div>

        {/* Dynamic Interview Readiness Visualizer */}
        <div className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-sm flex flex-col justify-between" id="readiness-metrics">
          <div>
            <h2 className="text-lg font-bold text-zinc-900 flex items-center space-x-2">
              <BarChart3 className="w-5 h-5 text-indigo-600" />
              <span>Readiness Diagnostic</span>
            </h2>
            <p className="text-xs text-zinc-500 mt-1.5 leading-relaxed">
              Your dynamically integrated assessment index calculated across all historic simulation runs.
            </p>
          </div>

          <div className="flex flex-col items-center justify-center py-4">
            <div className="relative flex items-center justify-center">
              {/* Score Circular Progression Indicator */}
              <svg className="w-32 h-32 transform -rotate-90">
                <circle
                  cx="64"
                  cy="64"
                  r="54"
                  stroke="#f4f4f5"
                  strokeWidth="10"
                  fill="transparent"
                />
                <circle
                  cx="64"
                  cy="64"
                  r="54"
                  stroke="url(#purpleGrad)"
                  strokeWidth="10"
                  fill="transparent"
                  strokeDasharray={`${(2 * Math.PI * 54).toFixed(1)}`}
                  strokeDashoffset={`${(2 * Math.PI * 54 * (1 - (averageScore || 0) / 100)).toFixed(1)}`}
                  strokeLinecap="round"
                  className="transition-all duration-1000 ease-out"
                />
                <defs>
                  <linearGradient id="purpleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#818cf8" />
                    <stop offset="100%" stopColor="#a855f7" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute text-center">
                <span className="text-3xl font-extrabold text-zinc-800">{averageScore}%</span>
                <span className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-0.5">Index</span>
              </div>
            </div>

            <div className={`mt-5 px-3 py-1.5 rounded-full border text-xs font-bold text-center ${statusBg} ${statusColor}`}>
              {readinessStatus}
            </div>
          </div>

          <div className="text-[11px] text-zinc-400 text-center">
            * Score of 85%+ represents average threshold for leading tech hires.
          </div>
        </div>

        {/* KPI Stats Panel Overview */}
        <div className="space-y-4" id="stats-overview">
          
          <div className="bg-white rounded-2xl border border-zinc-200 p-5 shadow-sm flex items-center justify-between">
            <div className="space-y-1">
              <span className="block text-xs font-bold text-zinc-400 uppercase tracking-widest">Total Practiced</span>
              <span className="block text-3xl font-extrabold text-zinc-900">{totalSessions} Sessions</span>
            </div>
            <div className="bg-zinc-100 p-3 rounded-xl border border-zinc-200 text-zinc-800">
              <Flame className="w-6 h-6 text-orange-500" />
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-zinc-200 p-5 shadow-sm flex items-center justify-between">
            <div className="space-y-1">
              <span className="block text-xs font-bold text-zinc-400 uppercase tracking-widest">Highest Grade</span>
              <span className="block text-3xl font-extrabold text-zinc-900">{bestScore || "N/A"}{bestScore > 0 ? "%" : ""}</span>
            </div>
            <div className="bg-zinc-100 p-3 rounded-xl border border-zinc-200 text-zinc-800">
              <Award className="w-6 h-6 text-purple-600" />
            </div>
          </div>

          <div className="bg-gradient-to-tr from-zinc-900 to-zinc-800 rounded-2xl border border-zinc-800 p-5 shadow-sm text-white flex flex-col justify-between h-[106px]">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Platform Status</span>
              <span className="bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[10px] px-2 py-0.5 rounded-full font-semibold">PRO ACCESS</span>
            </div>
            <span className="text-sm font-semibold text-zinc-200">Unlimited Server-Side AI Evaluations Active</span>
          </div>

        </div>
      </div>

      {/* Historical Attempts List */}
      <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm" id="history-panel">
        <div className="px-6 py-5 border-b border-zinc-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h3 className="text-base font-extrabold text-zinc-900 flex items-center space-x-2">
              <History className="w-5 h-5 text-purple-600" />
              <span>Simulation History & Assessment Records</span>
            </h3>
            <p className="text-xs text-zinc-500 mt-1">Review feedback, scoring logs, and complexity benchmarks generated by AI.</p>
          </div>

          {sessions.length > 0 && (
            <button
              id="btn-clear-history"
              type="button"
              onClick={onClearSessions}
              className="px-3.5 py-1.5 text-xs font-semibold text-zinc-600 hover:text-rose-600 bg-zinc-50 hover:bg-rose-50 border border-zinc-200 hover:border-rose-150 rounded-lg flex items-center space-x-1.5 transition-all cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Sessions</span>
            </button>
          )}
        </div>

        {sessions.length === 0 ? (
          <div className="py-16 px-6 text-center select-none" id="empty-history-state">
            <div className="w-16 h-16 bg-zinc-50 border border-zinc-100 rounded-full flex items-center justify-center mx-auto text-zinc-400 font-bold text-lg mb-4">
              ?
            </div>
            <h4 className="text-sm font-bold text-zinc-700">No mock run reports on record</h4>
            <p className="text-xs text-zinc-400 mt-1 max-w-sm mx-auto">
              Choose your parameters above and click "Generate Mock Challenge" to start an interactive, graded session.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-zinc-200" id="session-history-list">
            {sessions.map((session) => {
              const score = session.score;
              let scoreColor = "text-rose-600 bg-rose-50 border-rose-100";
              if (score >= 85) {
                scoreColor = "text-emerald-700 bg-emerald-50 border-emerald-100";
              } else if (score >= 70) {
                scoreColor = "text-amber-700 bg-amber-50 border-amber-100";
              }

              return (
                <li key={session.id} id={`history-item-${session.id}`}>
                  <div
                    onClick={() => onSelectSession(session.id)}
                    className="px-6 py-4.5 hover:bg-zinc-50 transition-colors cursor-pointer flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-4">
                      {/* Format Icon */}
                      <div className="bg-zinc-100 p-2.5 rounded-xl border border-zinc-200 text-zinc-600">
                        {session.type === "CODING" ? (
                          <BrainCircuit className="w-5 h-5 text-purple-600" />
                        ) : (
                          <Users className="w-5 h-5 text-indigo-600" />
                        )}
                      </div>

                      {/* Content Overview */}
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-sm text-zinc-950">
                            {session.type === "CODING" ? "Coding Assessment Round" : "Behavioral Round"}
                          </span>
                          <span className="px-2 py-0.5 text-[10px] uppercase font-bold text-zinc-500 bg-zinc-100 border border-zinc-200 rounded-sm">
                            {session.roleTarget} Path
                          </span>
                        </div>
                        
                        {/* Timestamp helper */}
                        <div className="flex items-center space-x-1.5 text-[11px] text-zinc-400 mt-1">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>
                            {new Date(session.createdAt).toLocaleDateString(undefined, {
                              month: "short",
                              day: "numeric",
                              year: "numeric"
                            })}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Score Badge & Action */}
                    <div className="flex items-center space-x-4">
                      <div className="text-right hidden sm:block">
                        <span className={`inline-flex items-center px-3 py-1 text-xs font-bold rounded-lg border ${scoreColor}`}>
                          {score > 0 ? `${score}% Grade` : "In Progress"}
                        </span>
                      </div>
                      <ChevronRight className="w-5 h-5 text-zinc-400" />
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}

// © 2026 Mag7Crack.ai SaaS Core. All rights preserved.

