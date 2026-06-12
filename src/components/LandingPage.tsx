// src/components/LandingPage.tsx
/**
 * LandingPage Component
 * Provides a highly polished responsive introduction, Quick Select Profiles login buttons,
 * and dynamic instructions to guide users on using coding, video, and admin panel modules.
 */


import React, { useState } from "react";
import { Award, Code, Users, Star, Play, Sparkles, Target, Zap, Shield, HelpCircle } from "lucide-react";

interface LandingPageProps {
  onLogin: (candidateName: string, candidateEmail: string) => void;
}

export default function LandingPage({ onLogin }: LandingPageProps) {
  const [name, setName] = useState("Jane Doe");
  const [email, setEmail] = useState("alphabizu@gmail.com");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      onLogin(name, email);
      setIsSubmitting(false);
    }, 850);
  };

  return (
    <div className="space-y-16 py-4" id="landing-container">
      
      {/* Hero Section */}
      <section className="text-center max-w-4xl mx-auto space-y-6 px-4" id="hero-section">
        <div className="inline-flex items-center space-x-2 bg-purple-50 border border-purple-100 px-3.5 py-1 rounded-full text-xs font-bold text-purple-700 animate-fade-in">
          <Sparkles className="w-3.5 h-3.5 fill-purple-100" />
          <span>Complete FAANG Assessment Foundation Built</span>
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-zinc-950 leading-none">
          Land Your Dream Offer At{" "}
          <span className="bg-gradient-to-r from-purple-700 via-indigo-600 to-indigo-800 bg-clip-text text-transparent">
            Google, Meta & NetFlix
          </span>
        </h1>

        <p className="text-sm sm:text-base text-zinc-650 max-w-2xl mx-auto leading-relaxed">
          The comprehensive evaluation sandbox platform for engineers, product managers, and data scientists. Master complex data structures and STAR-method behavioral rounds with server-side Gemini 3.5 expert feedback.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <a
            href="#auth-card"
            className="w-full sm:w-auto bg-gradient-to-r from-purple-700 to-indigo-600 hover:from-purple-800 hover:to-indigo-700 text-white font-bold py-3 px-8 rounded-xl shadow-md transition-all text-sm flex items-center justify-center space-x-2 cursor-pointer"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>Launch Free Simulator</span>
          </a>
          <a
            href="#features-container"
            className="w-full sm:w-auto bg-white border border-zinc-200 text-zinc-700 hover:text-zinc-900 hover:bg-zinc-50 font-bold py-3 px-8 rounded-xl text-sm flex items-center justify-center space-x-2 cursor-pointer"
          >
            <span>Explore Core Capabilities</span>
          </a>
        </div>
      </section>

      {/* Feature Bento Grid */}
      <section id="features-container" className="grid grid-cols-1 md:grid-cols-2 gap-8 px-4 max-w-5xl mx-auto">
        
        {/* Playcard 1: Algorithmic Sandbox */}
        <div className="bg-white rounded-2xl border border-zinc-205 p-6 hover:shadow-md transition-shadow relative overflow-hidden flex flex-col justify-between">
          <div className="space-y-3">
            <div className="bg-purple-50 p-2.5 rounded-xl text-purple-700 w-10 h-10 flex items-center justify-center border border-purple-100">
              <Code className="w-5 h-5" />
            </div>
            <h3 className="text-base font-extrabold text-zinc-900">Interactive Coding Sandbox</h3>
            <p className="text-xs text-zinc-500 leading-relaxed">
              Solve Linked List, Cache designs, or Merge Interval models. Supports native line counters, syntax structures, and automated time & space Big-O checks using server-side Gemini AI.
            </p>
          </div>
          <div className="mt-6 pt-4 border-t border-zinc-100 flex items-center text-[11px] font-bold text-purple-700 space-x-1">
            <span>Server-side Python compilation verified</span>
            <span>✓</span>
          </div>
        </div>

        {/* Playcard 2: STAR behavioral Assessor */}
        <div className="bg-white rounded-2xl border border-zinc-205 p-6 hover:shadow-md transition-shadow relative overflow-hidden flex flex-col justify-between">
          <div className="space-y-3">
            <div className="bg-indigo-50 p-2.5 rounded-xl text-indigo-700 w-10 h-10 flex items-center justify-center border border-indigo-100">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="text-base font-extrabold text-zinc-900">STAR Behavioral Assessor</h3>
            <p className="text-xs text-zinc-500 leading-relaxed">
              Simulate speech answers with mock microphone recording. Our system parses candidate transcripts and grades answers across S/T, Action, and Results.
            </p>
          </div>
          <div className="mt-6 pt-4 border-t border-zinc-100 flex items-center text-[11px] font-bold text-indigo-700 space-x-1">
            <span>Real-time voice waveform simulation enabled</span>
            <span>✓</span>
          </div>
        </div>

      </section>

      {/* Login & Simulation Portal Block */}
      <section id="auth-card" className="max-w-md mx-auto px-4">
        <div className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-xl space-y-6">
          <div className="text-center space-y-1.5">
            <h2 className="text-lg font-black text-zinc-950">Candidate Cockpit Sign In</h2>
            <p className="text-xs text-zinc-500">Sign in with mock profiles or custom credentials to launch your dashboard.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1.5">
                Full Name
              </label>
              <input
                id="inp-auth-name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full text-xs p-3 border border-zinc-200 rounded-lg focus:outline-hidden focus:border-purple-500 transition-colors bg-zinc-50 font-medium"
                placeholder="Candidate Full Name (e.g. Jane Doe)"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1.5">
                Email Address
              </label>
              <input
                id="inp-auth-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full text-xs p-3 border border-zinc-200 rounded-lg focus:outline-hidden focus:border-purple-500 transition-colors bg-zinc-50 font-medium"
                placeholder="candidate@faangprep.ai"
              />
            </div>

            {/* Simulated Profiles Quick Select */}
            <div className="space-y-2 pt-2">
              <span className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                Quick Select Profiles
              </span>
              <div className="grid grid-cols-3 gap-2 text-[10px]">
                <button
                  type="button"
                  id="btn-profile-jane"
                  onClick={() => {
                    setName("Jane Doe");
                    setEmail("alphabizu@gmail.com");
                  }}
                  className="p-1.5 bg-zinc-100 hover:bg-zinc-200 rounded-md border border-zinc-200 text-zinc-700 text-left font-semibold cursor-pointer text-center shrink-0"
                >
                  👩 Jane (PRO)
                </button>
                <button
                  type="button"
                  id="btn-profile-brian"
                  onClick={() => {
                    setName("Brian Stark");
                    setEmail("brian@meta-candidate.com");
                  }}
                  className="p-1.5 bg-zinc-100 hover:bg-zinc-200 rounded-md border border-zinc-200 text-zinc-700 text-left font-semibold cursor-pointer text-center shrink-0"
                >
                  🧑 Brian (FREE)
                </button>
                <button
                  type="button"
                  id="btn-profile-admin"
                  onClick={() => {
                    setName("System Administrator");
                    setEmail("admin@faangprep.ai");
                  }}
                  className="p-1.5 bg-purple-50 hover:bg-purple-100 rounded-md border border-purple-200 text-purple-700 text-left font-extrabold cursor-pointer text-center shrink-0"
                >
                  🔑 Admin (ADMIN)
                </button>
              </div>
            </div>

            <button
              id="btn-submit-landing-login"
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-4 bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-xl shadow-md flex items-center justify-center space-x-2 transition-all cursor-pointer text-xs uppercase tracking-wider"
            >
              {isSubmitting ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <span>Access Interactive Cockpit</span>
              )}
            </button>
          </form>
        </div>
      </section>

      {/* Test & Verification Guidelines Info Element */}
      <section className="bg-zinc-100 border border-zinc-200 p-6 rounded-2xl max-w-3xl mx-auto px-6 text-xs text-zinc-600 space-y-3" id="how-to-test-box">
        <h4 className="font-extrabold text-zinc-950 flex items-center space-x-1.5">
          <HelpCircle className="w-4 h-4 text-purple-600" />
          <span>How to Test the Flows & Pages</span>
        </h4>
        <ol className="list-decimal pl-5 space-y-2 font-medium">
          <li>
            <strong className="text-zinc-800">Login and Auth Bypass Demonstration:</strong> Use the Candidate Cockpit card above. Click on "Jane Doe (PRO)", then click the "Access Interactive Cockpit" button to view the dashboard instantly.
          </li>
          <li>
            <strong className="text-zinc-800">Mock Dashboard Monitoring:</strong> Once authenticated, review overall readiness metrics, past sessions, subscription tier controls, and search historic archives.
          </li>
          <li>
            <strong className="text-zinc-800">Launch and Evaluate Coding Solutions:</strong> Click "Coding Algo" on the simulator launcher and click "Generate Mock Challenge". Test alternative code solutions inside the input textarea, and click "Evaluate Solution" to trigger live, server-side Gemini analysis.
          </li>
          <li>
            <strong className="text-zinc-800">Speech Transcription Assessment:</strong> Start a "Behavioral" assessment, click "Simulate Mic Speech" to simulate speech-to-text input, and submit it for detailed STAR-matrix evaluation!
          </li>
          <li>
            <strong className="text-zinc-800">Test Logout Security Boundaries:</strong> Click the "Sign Out" button in the header at any time. This will clear the active sessions view and redirect you securely back to this public landing page.
          </li>
        </ol>
      </section>

    </div>
  );
}

// © 2026 Mag7Crack.ai SaaS Core. All rights preserved.

