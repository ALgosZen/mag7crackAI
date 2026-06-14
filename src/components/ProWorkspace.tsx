// src/components/ProWorkspace.tsx
/**
 * ProWorkspace Component
 * Coordinates the premium interactive system design mock panel, problem prompt choices,
 * text drafting boxes, and evaluations handled by Gemini APIs.
 */
import React, { useState, useEffect } from "react";
import { User, SubscriptionTier } from "../types.js";
import PayPalButtonSim from "./PayPalButtonSim.tsx";
import { Sparkles, Shield, Rocket, HelpCircle, Code, Server, MessageSquare, ArrowRight, Loader2, Play } from "lucide-react";
import Markdown from "react-markdown";
import { apiFetch } from "../api.ts";

interface ProWorkspaceProps {
  user: User;
  onTierChange: (tier: SubscriptionTier) => void;
}

interface PresetSystemDesignProblem {
  id: string;
  title: string;
  prompt: string;
  requirements: string[];
}

const PRESET_SYSTEM_DESIGNS: PresetSystemDesignProblem[] = [
  {
    id: "sd_netflix",
    title: "Design Netflix Video Streaming Pipeline",
    prompt: "Design a globally available video streaming service that scales to 100M+ active users, supports dynamic bitrates (ABR), minimizes latency, and stores large multi-resolution chunks cost-effectively.",
    requirements: [
      "Dynamic adaptive bitrate delivery algorithms (HLS/DASH)",
      "Global CDN caching layer invalidation guidelines",
      "Video transcoding and packaging microservices",
      "Metadata lookups database choice"
    ]
  },
  {
    id: "sd_uber",
    title: "Design Uber Geo-Spatial Matcher",
    prompt: "Design a real-time ride-matching system matching passengers with nearby drivers. Must handle concurrent location telemetry updates (tens of thousands of writes/sec) and execute query matches within 100ms.",
    requirements: [
      "Geo-sharding setup (e.g., Uber H3 Hexagons or Google S2 Core)",
      "High-throughput ingest queue design",
      "Stale state driver cleanup heuristics",
      "NoSQL vs Relational database query constraints"
    ]
  },
  {
    id: "sd_messenger",
    title: "Design Whatsapp Real-time Messaging System",
    prompt: "Design a chat application serving 2 billion users. Messages must arrive in less than 50ms, be fully encrypted, support reliable delivery acknowledgements, and store transient status feeds safely.",
    requirements: [
      "Persistent connection state storage (WebSocket / TCP gateways)",
      "Offline queues for disconnected clients",
      "Distributed ID generation algorithm for message sorting",
      "End-to-End Key verification synchronization keys"
    ]
  }
];

export default function ProWorkspace({ user, onTierChange }: ProWorkspaceProps) {
  const [proPrice, setProPrice] = useState<number>(29.99);
  const [isLoadingSettings, setIsLoadingSettings] = useState(false);

  // Pro Workspace Interactive State
  const [selectedTopic, setSelectedTopic] = useState<PresetSystemDesignProblem>(PRESET_SYSTEM_DESIGNS[0]);
  const [architectureInput, setArchitectureInput] = useState("");
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluationResult, setEvaluationResult] = useState<string | null>(null);

  // Load Admin Pricing Fees Dynamically!
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setIsLoadingSettings(true);
        const res = await apiFetch("/api/admin/settings");
        if (res.ok) {
          const data = await res.json();
          if (data.proFee) {
            setProPrice(data.proFee);
          }
        }
      } catch (err) {
        console.error("Could not fetch admin price for Pro tab:", err);
      } finally {
        setIsLoadingSettings(false);
      }
    };
    fetchSettings();
  }, [user.subscriptionTier]);

  // Handle successful PayPal Upgrade
  const handlePaymentSuccess = async (orderId: string, payerEmail: string) => {
    console.log("PayPal completed successfully, Order ID:", orderId, "Payer Email:", payerEmail);
    // Instant update
    await onTierChange("PRO");
  };

  const handleRunAiAnalysis = async () => {
    if (!architectureInput.trim()) {
      alert("Please outline or write your proposed modular architecture details first.");
      return;
    }

    try {
      setIsEvaluating(true);
      setEvaluationResult(null);

      // Call express routing with a dynamic request designed to query Gemini API 
      // We will create a specialized server route, or proxy-submit it. Let's create an express endpoint!
      const res = await apiFetch("/api/sessions/pro-system-design/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: selectedTopic.title,
          prompt: selectedTopic.prompt,
          userInput: architectureInput
        })
      });

      if (!res.ok) {
        throw new Error("System Design compilation failure from host.");
      }

      const json = await res.json();
      setEvaluationResult(json.feedback);

    } catch (err) {
      console.error(err);
      setEvaluationResult(`### ⚠️ AI Processing Error
Failed to compile system architecture schema via Gemini. Please verify Gemini API key variables are configured, and try resubmitting.`);
    } finally {
      setIsEvaluating(false);
    }
  };

  // 1. RENDER PAYWALL IF USER IS FREE
  if (user.subscriptionTier === "FREE") {
    return (
      <div className="max-w-4xl mx-auto space-y-12 py-4" id="pro-paywall-view">
        {/* Paywall Header Indicator */}
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <div className="inline-flex items-center space-x-1.5 bg-purple-50 text-purple-700 px-3.5 py-1 rounded-full text-xs font-bold border border-purple-100">
            <Sparkles className="w-3.5 h-3.5 fill-purple-100 animate-pulse" />
            <span>Premium Interactive Training Unlocked</span>
          </div>

          <h1 className="text-3xl font-extrabold text-zinc-950 tracking-tight">
            Unlock Mag7Crack <span className="bg-gradient-to-r from-purple-700 to-indigo-600 bg-clip-text text-transparent">PRO Tier</span> Cockpit
          </h1>

          <p className="text-xs sm:text-sm text-zinc-500 leading-relaxed">
            Unleash advanced system design board architectures, interactive custom coding sandboxes, and unlimited evaluation queries to prepare you for senior roles.
          </p>
        </div>

        {/* Comparison Board Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center max-w-3xl mx-auto">
          
          {/* Features Checklist */}
          <div className="space-y-4">
            <h3 className="font-extrabold text-zinc-900 text-sm">Everything included in PRO:</h3>
            <ul className="space-y-3.5 text-xs text-zinc-650 font-medium">
              <li className="flex items-start space-x-2.5">
                <span className="p-0.5 bg-purple-50 text-purple-700 rounded-sm font-bold text-[10px]">✓</span>
                <span><strong>Unlimited Advanced Algorithmic Sandboxes</strong>: Access premium FAANG interview tracks.</span>
              </li>
              <li className="flex items-start space-x-2.5">
                <span className="p-0.5 bg-purple-50 text-purple-700 rounded-sm font-bold text-[10px]">✓</span>
                <span><strong>Interactive System Design Suite</strong>: Design real-time architectures with complete Gemini grading analytics.</span>
              </li>
              <li className="flex items-start space-x-2.5">
                <span className="p-0.5 bg-purple-50 text-purple-700 rounded-sm font-bold text-[10px]">✓</span>
                <span><strong>Priority Prompt Pipelines</strong>: Guaranteed execution speeds on all server-side coding compilations.</span>
              </li>
              <li className="flex items-start space-x-2.5">
                <span className="p-0.5 bg-purple-50 text-purple-700 rounded-sm font-bold text-[10px]">✓</span>
                <span><strong>Comprehensive PDF Export</strong>: Save structured mock interview transcripts with STAR grading sheets.</span>
              </li>
            </ul>
          </div>

          {/* Golden Checkout Block */}
          <div className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-xl space-y-6 text-center">
            <div className="space-y-1.5">
              <span className="text-[10px] uppercase font-bold tracking-widest text-[#003087]">One-Time Upgrade Fee</span>
              <div className="text-3xl font-black text-zinc-950">
                ${isLoadingSettings ? "..." : proPrice.toFixed(2)}{" "}
                <span className="text-xs font-semibold text-zinc-400">USD</span>
              </div>
              <p className="text-[11px] text-zinc-500">Includes secure checkout, instant activation, and life-long dashboard persistence.</p>
            </div>

            <div className="border-t border-zinc-100 pt-4">
              <PayPalButtonSim 
                amount={proPrice} 
                tierSymbol="PRO" 
                firebaseUid={user.firebaseUid || ""}
                onSuccess={handlePaymentSuccess}
              />
            </div>

            <p className="text-[10px] text-zinc-400">
              Payments serviced securely via Sandbox authorization logs. Instant routing validation enabled upon payment release.
            </p>
          </div>

        </div>

      </div>
    );
  }

  // 2. RENDER ACTIVE PRO WORKSPACE IF NOT FREE
  return (
    <div className="max-w-6xl mx-auto space-y-8" id="pro-workspace-container">
      
      {/* Banner info */}
      <div className="bg-white border border-purple-100 p-6 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4 shadow-xs">
        <div className="space-y-1 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start space-x-1">
            <Sparkles className="w-4 h-4 text-purple-600 fill-purple-100" />
            <h2 className="text-sm font-black text-zinc-900 uppercase tracking-wider">Premium PRO Interview Board Active</h2>
          </div>
          <p className="text-xs text-zinc-500">Develop robust high-availability microservices and acquire expert design evaluations on-demand.</p>
        </div>
        <div className="flex items-center space-x-1.5 text-xs font-bold text-premium text-purple-700 bg-purple-50 px-3 py-1 rounded-full border border-purple-100 shrink-0">
          <span>Active License: PRO Cockpit Edition</span>
          <span>✓</span>
        </div>
      </div>

      {/* Main Board Grid split columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Side: Problem Selectors */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Classic System Architecture Challenges</h3>
          <div className="space-y-3">
            {PRESET_SYSTEM_DESIGNS.map((design) => {
              const isActive = design.id === selectedTopic.id;
              return (
                <button
                  key={design.id}
                  id={`btn-sdTopic-${design.id}`}
                  onClick={() => {
                    setSelectedTopic(design);
                    setEvaluationResult(null);
                  }}
                  className={`w-full p-4 rounded-xl text-left border transition-all cursor-pointer block ${
                    isActive 
                      ? "bg-purple-50/50 border-purple-300 shadow-xs" 
                      : "bg-white border-zinc-200 hover:border-zinc-300"
                  }`}
                >
                  <div className="font-bold text-xs text-zinc-900">{design.title}</div>
                  <p className="text-[11px] text-zinc-500 line-clamp-2 mt-1.5 leading-relaxed">{design.prompt}</p>
                </button>
              );
            })}
          </div>

          {/* Static Guide Info for system design */}
          <div className="bg-zinc-100 border border-zinc-200 rounded-xl p-4 text-[11px] text-zinc-500 leading-normal space-y-2.5">
            <h4 className="font-extrabold text-zinc-800 flex items-center">
              <Server className="w-3.5 h-3.5 mr-1 text-purple-600" />
              <span>System Design Best Practices</span>
            </h4>
            <p>Your solution should clearly describe the physical API layout, database sharding strategies, replication options, asynchronous messaging triggers, and caching levels.</p>
          </div>
        </div>

        {/* Right Side 2 cols: Workspace and evaluations */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-zinc-200 p-6 space-y-4 shadow-sm">
            
            {/* Active Topic Specs */}
            <div className="space-y-2 pb-4 border-b border-zinc-100">
              <h2 className="text-base font-extrabold text-zinc-900">{selectedTopic.title}</h2>
              <p className="text-xs text-zinc-500 leading-relaxed bg-zinc-50 p-3 rounded-lg border border-zinc-150">
                {selectedTopic.prompt}
              </p>
              <div>
                <span className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Required coverage points:</span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedTopic.requirements.map((req, idx) => (
                    <span key={idx} className="bg-zinc-100 text-[10px] text-zinc-600 px-2.5 py-1 rounded-md border border-zinc-200 font-medium">
                      • {req}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Input area */}
            <div className="space-y-2">
              <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                Outline your Architectural Proposal
              </label>
              <textarea
                id="txa-sd-solution"
                value={architectureInput}
                onChange={(e) => setArchitectureInput(e.target.value)}
                placeholder="--- Core Architecture Design Proposal ---
1. API GAteway / Load Balancing Layer:
2. Database Schema and Sharding Strategy:
3. Caching and Invalidation Pipeline:
4. Storage, Async Work queues and cdns:"
                className="w-full h-64 p-4 border border-zinc-200 rounded-xl font-mono text-xs focus:outline-hidden focus:border-purple-500 bg-zinc-50 leading-relaxed"
              />
            </div>

            {/* Action buttons */}
            <div className="flex justify-between items-center gap-4">
              <span className="text-[10px] text-zinc-400 font-bold font-mono">⚡ POWERED BY SERVER-SIDE GEMINI</span>
              <button
                id="btn-sd-evaluate"
                type="button"
                onClick={handleRunAiAnalysis}
                disabled={isEvaluating}
                className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2.5 px-6 rounded-xl text-xs flex items-center space-x-1.5 transition-all shadow-xs cursor-pointer"
              >
                {isEvaluating ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Evaluating System Proposal...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-white" />
                    <span>Compile & Evaluate Architecture</span>
                  </>
                )}
              </button>
            </div>

          </div>

          {/* Analysis Result display */}
          {evaluationResult && (
            <div className="bg-white rounded-2xl border border-zinc-200 p-6 space-y-4 shadow-md animate-fade-in" id="pro-sd-analysis-panel">
              <h3 className="text-xs font-black text-zinc-900 uppercase tracking-wider flex items-center space-x-1.5">
                <MessageSquare className="w-4 h-4 text-purple-600" />
                <span>FAANG Architecture Analysis Report</span>
              </h3>
              <div className="markdown-body text-xs text-zinc-700 space-y-3 leading-relaxed border-t border-zinc-100 pt-4 prose prose-zinc prose-sm max-w-none">
                <Markdown>{evaluationResult}</Markdown>
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}

// © 2026 Mag7Crack.ai SaaS Core. All rights preserved.

