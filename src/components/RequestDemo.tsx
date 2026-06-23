import React, { useEffect } from "react";
import { ArrowLeft, Calendar, Video, ShieldCheck, Sparkles } from "lucide-react";

interface RequestDemoProps {
  onBack: () => void;
}

export default function RequestDemo({ onBack }: RequestDemoProps) {
  useEffect(() => {
    // Load Calendly script dynamically
    const script = document.createElement("script");
    script.src = "https://assets.calendly.com/assets/external/widget.js";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500" id="request-demo-container">
      {/* Navigation Header */}
      <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-zinc-200 shadow-sm">
        <button
          onClick={onBack}
          className="flex items-center space-x-2 text-xs font-bold text-zinc-600 hover:text-zinc-900 bg-zinc-100 hover:bg-zinc-200 px-3.5 py-2 rounded-lg cursor-pointer transition-all"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Landing</span>
        </button>
        <div className="flex items-center space-x-2 text-purple-600">
          <Sparkles className="w-4 h-4 fill-purple-100" />
          <span className="text-[10px] font-black uppercase tracking-widest">Priority Enterprise Access</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        {/* Left Side: Value Proposition */}
        <div className="space-y-8 py-6">
          <div className="space-y-4">
            <h1 className="text-4xl font-black text-zinc-950 tracking-tight leading-none">
              See the Future of <br />
              <span className="bg-gradient-to-r from-purple-700 via-indigo-600 to-indigo-800 bg-clip-text text-transparent">
                Technical Hiring
              </span>
            </h1>
            <p className="text-zinc-500 text-sm leading-relaxed max-w-md">
              Schedule a 15-minute walkthrough of the Mag7Crack.ai Enterprise Hub.
              Discover how our server-side Gemini 2.5 Flash evaluations can transform your engineering recruitment pipeline.
            </p>
          </div>

          <div className="space-y-6">
            <div className="flex items-start space-x-4">
              <div className="bg-purple-50 p-2.5 rounded-xl border border-purple-100">
                <Video className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-zinc-900">Live Platform Tour</h4>
                <p className="text-xs text-zinc-500 mt-1">Direct walkthrough of AI coding sandboxes, behavioral STAR grading, and resume screening logic.</p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="bg-indigo-50 p-2.5 rounded-xl border border-indigo-100">
                <ShieldCheck className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-zinc-900">Custom Deployment Strategy</h4>
                <p className="text-xs text-zinc-500 mt-1">Discuss Supabase data persistence, private LLM prompts, and team seats for your organization.</p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="bg-emerald-50 p-2.5 rounded-xl border border-emerald-100">
                <Calendar className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-zinc-900">Q&A with Engineering Leads</h4>
                <p className="text-xs text-zinc-500 mt-1">Technical deep-dive into our Big-O complexity analysis and facial composure tracking algorithms.</p>
              </div>
            </div>
          </div>

          <div className="bg-zinc-950 p-6 rounded-2xl border border-zinc-800 shadow-xl text-white relative overflow-hidden">
            <div className="relative z-10">
              <p className="text-xs text-zinc-400 font-medium italic">
                "Mag7Crack helped our recruitment team cut initial screening time by 40% while identifying higher-signal candidates through consistent AI grading."
              </p>
              <div className="mt-4 flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-500"></div>
                <div>
                  <p className="text-[10px] font-bold">Director of Talent Acquisition</p>
                  <p className="text-[8px] text-zinc-500 uppercase tracking-widest font-black">Fortune 500 Tech Lead</p>
                </div>
              </div>
            </div>
            <div className="absolute -right-4 -bottom-4 opacity-10">
              <Sparkles className="w-24 h-24 text-white" />
            </div>
          </div>
        </div>

        {/* Right Side: Calendly Embed */}
        <div className="bg-white rounded-3xl border border-zinc-200 shadow-2xl overflow-hidden min-h-[600px] relative">
          <div className="absolute inset-0 flex items-center justify-center -z-10">
            <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
          {/* Replace 'YOUR_CALENDLY_LINK' with your actual Calendly link */}
          <div
            className="calendly-inline-widget w-full h-full"
            data-url="https://calendly.com/sureshmallela/15min?hide_event_type_details=1&hide_gdpr_banner=1"
            style={{ minWidth: '320px', height: '600px' }}
          ></div>
        </div>
      </div>

      <footer className="py-8 text-center border-t border-zinc-100">
        <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">
          Secure Multi-Seat Corporate Licensing Available
        </p>
      </footer>
    </div>
  );
}
