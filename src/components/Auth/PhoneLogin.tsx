import React, { useState, useEffect } from "react";
import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult
} from "firebase/auth";
import { auth } from "../../lib/firebase";
import { Phone, ArrowRight, ShieldCheck, Loader2 } from "lucide-react";

interface PhoneLoginProps {
  onAuthenticated: (token: string) => void;
}

export default function PhoneLogin({ onAuthenticated }: PhoneLoginProps) {
  const isDev = import.meta.env.VITE_APP_MODE === "DEV";
  const [phoneNumber, setPhoneNumber] = useState(isDev ? import.meta.env.VITE_TEST_PHONE_NUMBER : "");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"PHONE" | "OTP">("PHONE");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);

  useEffect(() => {
    (window as any).recaptchaVerifier = new RecaptchaVerifier(auth, "recaptcha-container", {
      size: "invisible",
    });
  }, []);

  // Auto-populate OTP if in DEV mode when switching to OTP step
  useEffect(() => {
    if (step === "OTP" && isDev) {
      setOtp(import.meta.env.VITE_TEST_OTP);
    }
  }, [step, isDev]);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const appVerifier = (window as any).recaptchaVerifier;

      // Remove any spaces or dashes
      const cleanNumber = phoneNumber.replace(/[\s-]/g, "");

      // Ensure phone number starts with + and has a country code
      // If it doesn't start with +, we prepent it.
      // We also check if it's at least 10 digits (minimum for most countries including country code)
      const formattedNumber = cleanNumber.startsWith("+") ? cleanNumber : `+${cleanNumber}`;

      if (formattedNumber.length < 8) {
        throw new Error("Phone number is too short. Please include country code (e.g. +1 for US).");
      }

      console.log("Sending OTP to:", formattedNumber);
      const result = await signInWithPhoneNumber(auth, formattedNumber, appVerifier);
      setConfirmationResult(result);
      setStep("OTP");
    } catch (err: any) {
      console.error("Firebase Auth Error:", err);
      let friendlyMessage = err.message;
      if (err.code === "auth/invalid-phone-number") {
        friendlyMessage = "Invalid phone number format. Please use +[CountryCode][Number] (e.g., +15550420101)";
      }
      setError(friendlyMessage || "Failed to send SMS. Check phone format.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      if (!confirmationResult) throw new Error("No pending confirmation.");
      const result = await confirmationResult.confirm(otp);
      const token = await result.user.getIdToken();
      onAuthenticated(token);
    } catch (err: any) {
      console.error(err);
      setError("Invalid code. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md w-full mx-auto bg-white p-8 rounded-3xl border border-zinc-200 shadow-xl space-y-6">
      <div className="text-center space-y-2">
        <div className="bg-purple-100 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto text-purple-600 mb-4">
          <Phone className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black text-zinc-900">
          {step === "PHONE" ? "Phone Authentication" : "Verify OTP"}
        </h2>
        <p className="text-sm text-zinc-500">
          {step === "PHONE"
            ? "Enter your mobile number to receive a secure login code via SMS."
            : `We've sent a 6-digit code to ${phoneNumber}`}
        </p>
      </div>

      <form onSubmit={step === "PHONE" ? handleSendOtp : handleVerifyOtp} className="space-y-4">
        {step === "PHONE" ? (
          <div className="space-y-1">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-zinc-900 font-bold">
                <span className="text-sm">+</span>
              </div>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => {
                  // Allow only numbers and the plus sign
                  const val = e.target.value.replace(/[^\d+]/g, "");
                  setPhoneNumber(val);
                }}
                placeholder="1 555 000 0000"
                required
                className={`w-full pl-8 pr-4 py-3.5 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none ${
                  isDev && phoneNumber === import.meta.env.VITE_TEST_PHONE_NUMBER
                    ? "text-zinc-400 font-light"
                    : "text-zinc-900 font-medium"
                }`}
              />
            </div>
            <p className="text-[10px] text-zinc-400 pl-1">Include country code (e.g. 1 for USA, 44 for UK)</p>
          </div>
        ) : (
          <input
            type="text"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            placeholder="Enter 6-digit code"
            required
            maxLength={6}
            className={`w-full px-4 py-3.5 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none text-center text-2xl tracking-[0.5em] ${
              isDev && otp === import.meta.env.VITE_TEST_OTP
                ? "text-zinc-400 font-light"
                : "text-zinc-900 font-black"
            }`}
          />
        )}

        {error && (
          <div className="bg-rose-50 text-rose-600 p-3 rounded-lg text-xs font-bold text-center">
            {error}
          </div>
        )}

        <button
          disabled={isLoading}
          type="submit"
          className="w-full bg-zinc-900 hover:bg-black text-white font-bold py-4 rounded-xl flex items-center justify-center space-x-2 transition-all disabled:opacity-50"
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              <span>{step === "PHONE" ? "Send Code" : "Verify & Continue"}</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      {step === "OTP" && (
        <button
          onClick={() => setStep("PHONE")}
          className="w-full text-center text-xs font-bold text-zinc-400 hover:text-zinc-600 transition-colors"
        >
          Change Phone Number
        </button>
      )}

      <div id="recaptcha-container"></div>

      <div className="flex items-center justify-center space-x-2 text-[10px] text-zinc-400 uppercase tracking-widest font-bold pt-4">
        <ShieldCheck className="w-3 h-3" />
        <span>Secure Firebase Handshake</span>
      </div>
    </div>
  );
}
