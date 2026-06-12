// src/components/PayPalButtonSim.tsx
/**
 * PayPalButtonSim Component
 * Simulates a pop-up secure PayPal portal with logging support,
 * coordinating mock credential logins and review checkpoints for PRO and ENTERPRISE tiers.
 */
import React, { useState } from "react";
import { Sparkles, Shield, Mail, Lock, CreditCard, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { apiFetch } from "../api.ts";

interface PayPalButtonSimProps {
  amount: number;
  tierSymbol: "PRO" | "ENTERPRISE";
  onSuccess: (orderId: string, payerEmail: string) => void;
}

export default function PayPalButtonSim({ amount, tierSymbol, onSuccess }: PayPalButtonSimProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<"LOGIN" | "REVIEW" | "PROCESSING" | "SUCCESS">("LOGIN");
  const [email, setEmail] = useState("buyer-sandbox@faangprep.ai");
  const [password, setPassword] = useState("12345678");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes("@")) {
      setErrorMsg("Please enter a valid PayPal test account email.");
      return;
    }
    if (password.length < 4) {
      setErrorMsg("Password is too short.");
      return;
    }
    setErrorMsg(null);
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setStep("REVIEW");
    }, 800);
  };

  const handlePaymentConfirm = () => {
    setStep("PROCESSING");
    setTimeout(async () => {
      try {
        const orderId = "PAYID-" + Math.random().toString(36).substr(2, 9).toUpperCase();
        
        const response = await apiFetch("/api/paypal/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            orderId,
            payerEmail: email,
            tier: tierSymbol,
            amount: amount,
          }),
        });

        if (!response.ok) {
          throw new Error("Could not authorize payment on backend server.");
        }

        setStep("SUCCESS");
        setTimeout(() => {
          setIsOpen(false);
          onSuccess(orderId, email);
          // reset for future
          setStep("LOGIN");
        }, 1500);

      } catch (err) {
        console.error(err);
        setErrorMsg("Failed to register payment on our server. Please try again.");
        setStep("REVIEW");
      }
    }, 1500);
  };

  return (
    <div className="w-full max-w-sm mx-auto space-y-3" id="paypal-button-container">
      {/* Visual Golden PayPal Button */}
      <button
        type="button"
        id={`btn-paypal-initiate-${tierSymbol.toLowerCase()}`}
        onClick={() => setIsOpen(true)}
        className="w-full bg-[#FFC439] hover:bg-[#F2B522] text-[#111111] font-bold py-3 px-4 rounded-xl shadow-xs transition-transform hover:scale-[1.01] flex items-center justify-center space-x-1.5 cursor-pointer relative"
      >
        <span className="italic font-extrabold text-[#003087]">Pay</span>
        <span className="italic font-extrabold text-[#0079C1]">Pal</span>
        <span className="text-xs font-semibold text-zinc-800 ml-1.5 font-sans">Checkout</span>
      </button>

      {/* Visual Debit Card Button */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="w-full bg-[#001C64] hover:bg-[#00154B] text-white font-semibold py-3 px-4 rounded-xl shadow-sm transition-transform hover:scale-[1.01] flex items-center justify-center space-x-2 cursor-pointer text-xs uppercase tracking-wider"
      >
        <CreditCard className="w-4 h-4 text-sky-400" />
        <span>Debit or Credit Card</span>
      </button>

      {/* Styled Interactive PayPal Portal Overlay Modal */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade-in"
          id="paypal-secured-modal"
        >
          <div className="bg-white w-full max-w-md rounded-2xl overflow-hidden shadow-2xl border border-zinc-100 flex flex-col max-h-[90vh]">
            
            {/* Header branding */}
            <div className="bg-[#003087] px-6 py-4 flex justify-between items-center text-white shrink-0">
              <div className="flex items-center space-x-1.5">
                <span className="italic font-black text-lg tracking-tight">Pay</span>
                <span className="italic font-black text-lg tracking-tight text-sky-300">Pal</span>
                <span className="text-[10px] bg-sky-900 border border-sky-700 text-sky-300 font-bold px-2 py-0.2 rounded-sm ml-2 uppercase tracking-wide">
                  Sandbox Secure
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-white/85 hover:text-white font-bold text-sm bg-white/10 hover:bg-white/20 w-7 h-7 rounded-full flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            {/* Merchant info bar */}
            <div className="bg-zinc-50 border-b border-zinc-100 px-6 py-3 flex justify-between items-center text-xs text-zinc-500 shrink-0">
              <span>Merchant: <strong>FAANGPrep.ai Core</strong></span>
              <span className="text-zinc-800 font-bold">Total: ${amount.toFixed(2)} USD</span>
            </div>

            {/* Main scrollable body */}
            <div className="p-6 overflow-y-auto flex-1">
              
              {/* Error Alert inside PayPal */}
              {errorMsg && (
                <div className="mb-4 bg-rose-50 border border-rose-100 text-rose-700 p-3 rounded-xl flex items-start space-x-2 text-xs">
                  <AlertCircle className="w-4 h-4 text-rose-600 mt-0.5 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* STEP 1: LOGIN */}
              {step === "LOGIN" && (
                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  <div className="text-center space-y-1 mb-2">
                    <h3 className="text-sm font-bold text-zinc-700">Log in with your Sandbox Account</h3>
                    <p className="text-[11px] text-zinc-400">Enter a simulated or personal PayPal developer credential.</p>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5">
                      Email Address (Sandbox Profile)
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 w-4 h-4 text-zinc-400" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full text-xs p-3 pl-10 border border-zinc-200 rounded-lg focus:outline-hidden focus:border-blue-500 bg-zinc-50"
                        placeholder="buyer@paypal-test.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5">
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 w-4 h-4 text-zinc-400" />
                      <input
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full text-xs p-3 pl-10 border border-zinc-200 rounded-lg focus:outline-hidden focus:border-blue-500 bg-zinc-50"
                        placeholder="••••••••"
                      />
                    </div>
                  </div>

                  <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl text-[11px] text-blue-700 leading-relaxed space-y-1">
                    <p className="font-bold">💡 Sandbox Environment Auth Enabled</p>
                    <p>Enter any email/password to mock the credit authorization flow. No real funds will be charged.</p>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-[#0079C1] hover:bg-[#005C93] text-white font-bold py-3 rounded-xl transition-colors cursor-pointer text-xs flex items-center justify-center space-x-2"
                  >
                    {isSubmitting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <span>Log In to Authorize Payment</span>
                    )}
                  </button>
                </form>
              )}

              {/* STEP 2: REVIEW */}
              {step === "REVIEW" && (
                <div className="space-y-5">
                  <div className="text-center space-y-1">
                    <h3 className="text-sm font-extrabold text-zinc-800">Review Your Payment Details</h3>
                    <p className="text-[11px] text-zinc-400">Funding source secured via virtual sandbox balance.</p>
                  </div>

                  <div className="border border-zinc-150 rounded-xl divide-y divide-zinc-100 overflow-hidden text-xs">
                    <div className="p-3.5 bg-zinc-50 flex justify-between">
                      <span className="text-zinc-500">Upgrade Plan:</span>
                      <strong className="text-zinc-800 uppercase flex items-center">
                        {tierSymbol === "PRO" ? (
                          <Sparkles className="w-3.5 h-3.5 text-purple-600 mr-1 fill-purple-100" />
                        ) : (
                          <Shield className="w-3.5 h-3.5 text-indigo-700 mr-1 fill-indigo-100" />
                        )}
                        FAANGPrep.ai {tierSymbol}
                      </strong>
                    </div>
                    <div className="p-3.5 flex justify-between">
                      <span className="text-zinc-500">PayPal Account:</span>
                      <span className="text-zinc-800 font-medium">{email}</span>
                    </div>
                    <div className="p-3.5 flex justify-between">
                      <span className="text-zinc-500">Funding Source:</span>
                      <span className="text-zinc-800 font-medium">PayPal Balance (Checking ****829)</span>
                    </div>
                    <div className="p-3.5 bg-yellow-50/50 flex justify-between">
                      <span className="text-zinc-500 font-semibold">Total Amount:</span>
                      <strong className="text-zinc-900">${amount.toFixed(2)} USD</strong>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setStep("LOGIN")}
                      className="flex-1 border border-zinc-200 hover:bg-zinc-50 text-zinc-700 font-bold py-2.5 rounded-lg text-xs cursor-pointer"
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      onClick={handlePaymentConfirm}
                      className="flex-1 bg-[#83b41a] hover:bg-[#729c15] text-white font-bold py-2.5 rounded-lg text-xs cursor-pointer shadow-xs"
                    >
                      Pay Now (${amount.toFixed(2)})
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: PROCESSING */}
              {step === "PROCESSING" && (
                <div className="py-8 text-center space-y-4">
                  <div className="w-12 h-12 border-4 border-[#003087] border-t-transparent rounded-full animate-spin mx-auto"></div>
                  <div className="space-y-1">
                    <h3 className="text-sm font-extrabold text-zinc-800">Processing PayPal Authorization...</h3>
                    <p className="text-[11px] text-zinc-400">Verifying tokens and recording secure ledger receipt.</p>
                  </div>
                </div>
              )}

              {/* STEP 4: SUCCESS */}
              {step === "SUCCESS" && (
                <div className="py-8 text-center space-y-4 animate-fade-in">
                  <div className="inline-flex items-center justify-center w-14 h-14 bg-emerald-50 rounded-full text-emerald-600 border border-emerald-100">
                    <CheckCircle className="w-10 h-10 fill-emerald-100" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-sm font-extrabold text-zinc-900">Payment Successfully Completed!</h3>
                    <p className="text-[11px] text-zinc-400">Redirecting to your unlocked premium sandbox...</p>
                  </div>
                </div>
              )}

            </div>

            {/* Footer lock metadata */}
            <div className="bg-zinc-150 px-6 py-3 shrink-0 flex items-center justify-center space-x-1.5 text-[10px] text-zinc-450 border-t border-zinc-100 bg-zinc-50 font-sans">
              <span className="text-[#003087] font-semibold">🔒 Secure Connection:</span>
              <span>128-bit Encryption SSL Active</span>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}

// © 2026 Mag7Crack.ai SaaS Core. All rights preserved.

