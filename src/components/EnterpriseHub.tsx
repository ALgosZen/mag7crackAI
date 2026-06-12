// src/components/EnterpriseHub.tsx
/**
 * EnterpriseHub Component
 * Allows candidate teams, recruitment coordinators, and ambitious directors to manage custom
 * team pipelines, upload and screen applicant resumes with server-side Gemini, and unlock corporate billing.
 */
import React, { useState, useEffect } from "react";
import { User, SubscriptionTier } from "../types.js";
import PayPalButtonSim from "./PayPalButtonSim.tsx";
import { Shield, Sparkles, Building, Briefcase, FileText, BarChart3, Users, Loader2, Play, CheckCircle } from "lucide-react";
import Markdown from "react-markdown";
import { apiFetch } from "../api.ts";

interface EnterpriseHubProps {
  user: User;
  onTierChange: (tier: SubscriptionTier) => void;
}

interface MockCandidate {
  name: string;
  role: string;
  pipelineStage: string;
  avgScore: number;
  status: "Passed" | "Evaluating" | "Needs Review";
}

const INITIAL_MOCK_CANDIDATES: MockCandidate[] = [
  { name: "Alice Chen (SWE-II)", role: "Software Engineer", pipelineStage: "Coding Algo", avgScore: 92, status: "Passed" },
  { name: "Marcus Brody (L6 PM)", role: "Product Manager", pipelineStage: "System Design", avgScore: 88, status: "Needs Review" },
  { name: "Sofia Rodriguez (DS)", role: "Data Scientist", pipelineStage: "Behavioral STAR", avgScore: 95, status: "Passed" },
  { name: "Vikram Malhotra (SWE)", role: "Software Engineer", pipelineStage: "System Design", avgScore: 71, status: "Evaluating" }
];

export default function EnterpriseHub({ user, onTierChange }: EnterpriseHubProps) {
  const [enterprisePrice, setEnterprisePrice] = useState<number>(199.99);
  const [isLoadingSettings, setIsLoadingSettings] = useState(false);

  // Enterprise Interactive States
  const [resumeText, setResumeText] = useState("");
  const [targetCompany, setTargetCompany] = useState<"Google" | "Meta" | "Netflix">("Google");
  const [isScannng, setIsScanning] = useState(false);
  const [scannerResult, setScannerResult] = useState<string | null>(null);

  // Dynamic pricing load
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setIsLoadingSettings(true);
        const res = await apiFetch("/api/admin/settings");
        if (res.ok) {
          const data = await res.json();
          if (data.enterpriseFee) {
            setEnterprisePrice(data.enterpriseFee);
          }
        }
      } catch (err) {
        console.error("Could not fetch admin price for Enterprise Hub:", err);
      } finally {
        setIsLoadingSettings(false);
      }
    };
    fetchSettings();
  }, [user.subscriptionTier]);

  const handlePaymentSuccess = async (orderId: string, payerEmail: string) => {
    console.log("Enterprise PayPal upgrade success Order ID:", orderId);
    await onTierChange("ENTERPRISE");
  };

  const handleScanResume = async () => {
    if (!resumeText.trim()) {
      alert("Please paste your draft resume text to scan.");
      return;
    }

    try {
      setIsScanning(true);
      setScannerResult(null);

      const res = await apiFetch("/api/sessions/enterprise-resume/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetCompany,
          resumeContent: resumeText
        })
      });

      if (!res.ok) {
        throw new Error("Resume screening compiler failed.");
      }

      const json = await res.json();
      setScannerResult(json.feedback);

    } catch (err) {
      console.error(err);
      setScannerResult(`### ⚠️ AI Screening Suspended
There was an issue launching the resume screening system relative to our Gemini models.
Please verify your Gemini key settings relative to this instance and try again.`);
    } finally {
      setIsScanning(false);
    }
  };

  // 1. RENDER PAYWALL IF USER IS NOT ENTERPRISE
  if (user.subscriptionTier !== "ENTERPRISE") {
    return (
      <div className="max-w-4xl mx-auto space-y-12 py-4" id="enterprise-paywall-view">
        
        {/* Banner header info */}
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <div className="inline-flex items-center space-x-1.5 bg-[#e0e7ff] text-indigo-800 px-3.5 py-1 rounded-full text-xs font-bold border border-indigo-200">
            <Building className="w-3.5 h-3.5" />
            <span>Corporate Collaboration Suites Unlocked</span>
          </div>

          <h1 className="text-3xl font-extrabold text-zinc-950 tracking-tight">
            Upgrade to Mag7Crack <span className="bg-gradient-to-r from-indigo-700 via-indigo-600 to-purple-800 bg-clip-text text-transparent">ENTERPRISE Tier</span>
          </h1>

          <p className="text-xs sm:text-sm text-zinc-500 leading-relaxed">
            The ultimate professional dashboard built for team administrators, recruitment coordinators, and ambitious directors who manage pipelines of engineering applicants.
          </p>
        </div>

        {/* Feature side boards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center max-w-3xl mx-auto">
          
          <div className="space-y-4">
            <h3 className="font-extrabold text-zinc-900 text-sm">Included in corporate ENTERPRISE:</h3>
            <ul className="space-y-3.5 text-xs text-zinc-650 font-medium">
              <li className="flex items-start space-x-2.5">
                <span className="p-0.5 bg-indigo-50 text-indigo-700 rounded-sm font-bold text-[10px]">✓</span>
                <span><strong>AI Resume screening matching algorithm</strong>: Instantly score resume match matrices against real FAANG hiring guidelines.</span>
              </li>
              <li className="flex items-start space-x-2.5">
                <span className="p-0.5 bg-indigo-50 text-indigo-700 rounded-sm font-bold text-[10px]">✓</span>
                <span><strong>Team Pipeline Analytics Monitor</strong>: View mock metrics, check score trajectories, and track pipelines.</span>
              </li>
              <li className="flex items-start space-x-2.5">
                <span className="p-0.5 bg-indigo-50 text-indigo-700 rounded-sm font-bold text-[10px]">✓</span>
                <span><strong>Enterprise Billing Settings Panel</strong>: Generate dynamic invoices, authorize custom VAT/HST records.</span>
              </li>
              <li className="flex items-start space-x-2.5">
                <span className="p-0.5 bg-indigo-50 text-indigo-700 rounded-sm font-bold text-[10px]">✓</span>
                <span><strong>Dedicated Technical Architecture Reviews</strong>: Access high-priority processing queues.</span>
              </li>
            </ul>
          </div>

          {/* PayPal Checkout box */}
          <div className="bg-white rounded-2xl border border-indigo-100 p-6 shadow-xl space-y-6 text-center">
            <div className="space-y-1.5">
              <span className="text-[10px] uppercase font-bold tracking-widest text-[#001c64]">Enterprise License Fee</span>
              <div className="text-3xl font-black text-zinc-950">
                ${isLoadingSettings ? "..." : enterprisePrice.toFixed(2)}{" "}
                <span className="text-xs font-semibold text-zinc-400">USD</span>
              </div>
              <p className="text-[11px] text-zinc-500">Corporate seat containing global sandbox privileges for mock candidates.</p>
            </div>

            <div className="border-t border-zinc-100 pt-4">
              <PayPalButtonSim 
                amount={enterprisePrice} 
                tierSymbol="ENTERPRISE" 
                onSuccess={handlePaymentSuccess} 
              />
            </div>

            <p className="text-[10px] text-zinc-400">
              Transaction compiled via secure server-side triggers immediately.
            </p>
          </div>

        </div>

      </div>
    );
  }

  // 2. RENDER FULLY UNLOCKED ENTERPRISE HUB
  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in" id="enterprise-hub-container">
      
      {/* Banner */}
      <div className="bg-gradient-to-r from-indigo-900 to-indigo-950 border border-indigo-800 p-6 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4 shadow-md text-white text-center md:text-left">
        <div className="space-y-1">
          <div className="flex items-center justify-center md:justify-start space-x-1.5">
            <Shield className="w-5 h-5 text-indigo-400 fill-indigo-950" />
            <h2 className="text-sm font-extrabold uppercase tracking-widest text-indigo-200">Mag7Crack Enterprise Workspace</h2>
          </div>
          <p className="text-xs text-indigo-300">Evaluate professional resumes, score candidacy benchmarks, and oversee mock candidate performance pipelines.</p>
        </div>
        <div className="bg-indigo-800 text-white border border-indigo-700 px-4 py-1.5 rounded-lg text-xs font-bold shrink-0">
          Corporate Tier Multi-Seat Master Active
        </div>
      </div>

      {/* Grid split */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Left Side: Matcher */}
        <div className="bg-white border border-zinc-200 rounded-2xl p-6 space-y-5 shadow-xs">
          <div className="space-y-1 pb-3 border-b border-zinc-100 flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-sm text-zinc-9000 flex items-center">
                <FileText className="w-4 h-4 text-indigo-650 mr-1.5" />
                <span>AI Resume Matcher & Score Evaluator</span>
              </h3>
              <p className="text-[11px] text-zinc-400">Analyze STAR formatting elements, career trajectories, and project benchmarks.</p>
            </div>
            
            {/* Pick company */}
            <select
              value={targetCompany}
              onChange={(e) => setTargetCompany(e.target.value as any)}
              className="text-xs p-1.5 border border-zinc-250 bg-zinc-50 rounded-md font-bold text-zinc-800"
            >
              <option value="Google">🎯 Google</option>
              <option value="Meta">🎯 Meta</option>
              <option value="Netflix">🎯 Netflix</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
              Resume Text Content
            </label>
            <textarea
              id="txa-resume"
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              placeholder="Paste raw text of a candidate's resume here (e.g., Experience: Senior SWE at Amazon. Led migration to DynamoDB saving 30% of costs... Skills: React, Python, Distributed Systems...)"
              className="w-full h-56 p-4 border border-zinc-200 rounded-xl font-mono text-[11px] focus:outline-hidden focus:border-indigo-500 bg-zinc-50 leading-relaxed"
            />
          </div>

          <div className="flex justify-between items-center bg-indigo-50/50 p-2.5 rounded-xl border border-indigo-100 text-[10px] text-indigo-700">
            <span>Server-side high-throughput Gemini 3.5 evaluating active</span>
            <button
              id="btn-scan-resume"
              type="button"
              onClick={handleScanResume}
              disabled={isScannng}
              className="bg-indigo-700 hover:bg-indigo-800 text-white font-bold py-1.5 px-3 rounded-lg text-xs cursor-pointer flex items-center space-x-1 transition-colors"
            >
              {isScannng ? (
                <>
                  <Loader2 className="w-3 h-3 animate-spin" />
                  <span>Scanning...</span>
                </>
              ) : (
                <>
                  <Play className="w-3 h-3 fill-white" />
                  <span>Scan Resume Suitability</span>
                </>
              )}
            </button>
          </div>

          {/* Scanner Report Output */}
          {scannerResult && (
            <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-xl space-y-2 mt-4 animate-fade-in" id="enterprise-resume-report-panel">
              <h4 className="text-xs font-bold text-zinc-950 uppercase tracking-wide flex items-center">
                <CheckCircle className="w-4 h-4 text-indigo-600 mr-1.5" />
                <span>Screening Score Sheet & Suggestions</span>
              </h4>
              <div className="markdown-body text-[11px] text-zinc-700 space-y-2 leading-relaxed border-t border-zinc-200 pt-3 prose prose-sm max-w-none">
                <Markdown>{scannerResult}</Markdown>
              </div>
            </div>
          )}

        </div>

        {/* Right Side: Candidate score Pipeline */}
        <div className="space-y-6">
          <div className="bg-white border border-zinc-200 rounded-2xl p-6 space-y-4 shadow-xs">
            <div className="space-y-1 pb-3 border-b border-zinc-100">
              <h3 className="font-extrabold text-sm text-zinc-900 flex items-center">
                <Users className="w-4 h-4 text-indigo-650 mr-1.5" />
                <span>Candidate Pipeline Monitor (Mock)</span>
              </h3>
              <p className="text-[11px] text-zinc-400">Oversee recruitment progression across active pipelines in real-time.</p>
            </div>

            {/* Candidate List Map */}
            <div className="overflow-x-auto text-[11px]">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-zinc-150 text-zinc-400 uppercase tracking-wider text-[9px] font-extrabold">
                    <th className="pb-2.5">Candidate Name</th>
                    <th className="pb-2.5">Active Stage</th>
                    <th className="pb-2.5 text-center">Avg Score</th>
                    <th className="pb-2.5 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 text-zinc-700">
                  {INITIAL_MOCK_CANDIDATES.map((cand, idx) => (
                    <tr key={idx} className="hover:bg-zinc-50/50">
                      <td className="py-3 font-semibold text-zinc-900">{cand.name}</td>
                      <td className="py-3">{cand.pipelineStage}</td>
                      <td className="py-3 text-center font-mono font-bold text-indigo-700 text-xs">
                        {cand.avgScore}%
                      </td>
                      <td className="py-3 text-right">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-black border ${
                          cand.status === "Passed" 
                            ? "bg-emerald-50 text-emerald-700 border-emerald-100" 
                            : cand.status === "Evaluating" 
                            ? "bg-yellow-50 text-yellow-700 border-yellow-100" 
                            : "bg-amber-50 text-amber-700 border-amber-100"
                        }`}>
                          {cand.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="pt-2">
              <div className="bg-indigo-50 border border-indigo-100 p-3.5 rounded-xl text-[10px] text-indigo-900 space-y-1.5 leading-relaxed">
                <p className="font-extrabold flex items-center">
                  <BarChart3 className="w-3.5 h-3.5 mr-1" />
                  <span>Pipeline Diagnostic Health</span>
                </p>
                <p>Team assessment success rate matches <strong>86.5% goal</strong>. Pipeline tracking variables are secured by Express persistence parameters instantly.</p>
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}

// © 2026 Mag7Crack.ai SaaS Core. All rights preserved.

