import React, { useState } from "react";
import { User as UserIcon, Mail, Fingerprint, Sparkles, CheckCircle, Loader2 } from "lucide-react";

interface SignupFormProps {
  onComplete: (data: { name: string; email: string; useFaceId: boolean }) => void;
  isLoading?: boolean;
}

export default function SignupForm({ onComplete, isLoading }: SignupFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [useFaceId, setUseFaceId] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onComplete({ name, email, useFaceId });
  };

  return (
    <div className="max-w-md w-full mx-auto bg-white p-8 rounded-3xl border border-zinc-200 shadow-xl space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center space-y-2">
        <div className="bg-emerald-100 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto text-emerald-600 mb-4">
          <Sparkles className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black text-zinc-900">Complete Profile</h2>
        <p className="text-sm text-zinc-500">Just a few more details to set up your FAANG prep cockpit.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-4">
          <div className="relative">
            <UserIcon className="absolute left-4 top-3.5 w-5 h-5 text-zinc-400" />
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="First Name"
              required
              className="w-full pl-12 pr-4 py-3.5 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none text-zinc-900 font-medium"
            />
          </div>

          <div className="space-y-1.5">
            <div className="relative">
              <Mail className="absolute left-4 top-3.5 w-5 h-5 text-zinc-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email Address (Optional)"
                className="w-full pl-12 pr-4 py-3.5 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none text-zinc-900 font-medium"
              />
            </div>
            <p className="text-[10px] text-zinc-400 pl-1">Optional: Used for important app notifications.</p>
          </div>
        </div>

        {/* Face ID / Biometrics Toggle */}
        <div className="bg-zinc-50 border border-zinc-200 p-4 rounded-2xl flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-zinc-900 p-2 rounded-lg text-white">
              <Fingerprint className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-zinc-900">Enable Biometrics</p>
              <p className="text-[10px] text-zinc-500">Secure access with Face ID</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setUseFaceId(!useFaceId)}
            className={`w-12 h-6 rounded-full transition-colors relative ${
              useFaceId ? "bg-purple-600" : "bg-zinc-300"
            }`}
          >
            <div
              className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                useFaceId ? "translate-x-7" : "translate-x-1"
              }`}
            />
          </button>
        </div>

        <button
          disabled={isLoading}
          type="submit"
          className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-4 rounded-xl flex items-center justify-center space-x-2 transition-all disabled:opacity-50 shadow-lg shadow-purple-200"
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              <span>Initialize Workspace</span>
              <CheckCircle className="w-4 h-4" />
            </>
          )}
        </button>
      </form>
    </div>
  );
}
