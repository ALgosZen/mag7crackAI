// src/components/AdminSettings.tsx
/**
 * AdminSettings Component
 * Displays the restricted secure administrator panel. Enables tuning pricing fees,
 * custom sandbox client IDs, and monitors real-time database transactions logs.
 */
import React, { useState, useEffect } from "react";
import { Sparkles, Shield, Key, DollarSign, Settings2, RefreshCw, Layers2, FileCheck, CheckCircle } from "lucide-react";
import { apiFetch } from "../api.ts";

interface AdminSettingsPayload {
  proFee: number;
  enterpriseFee: number;
  paypalClientId: string;
  paypalClientSecret: string;
  paypalEnv: string;
  currencyCode: string;
}

interface PaypalTransaction {
  id: string;
  userEmail: string;
  userName: string;
  tierPurchased: string;
  amount: number;
  currency: string;
  paypalOrderId: string;
  paypalPayerEmail: string;
  status: string;
  createdAt: string;
}

export default function AdminSettings() {
  const [proFee, setProFee] = useState<number>(29.99);
  const [enterpriseFee, setEnterpriseFee] = useState<number>(199.99);
  const [clientKey, setClientKey] = useState("");
  const [secretKey, setSecretKey] = useState("");
  const [paypalEnv, setPaypalEnv] = useState("sandbox");
  const [currencyCode, setCurrencyCode] = useState("USD");

  const [transactions, setTransactions] = useState<PaypalTransaction[]>([]);
  const [isUpdating, setIsUpdating] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [revealSecret, setRevealSecret] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAdminData = async () => {
    try {
      setIsLoading(true);
      // Fetch settings
      const sRes = await apiFetch("/api/admin/settings");
      if (sRes.ok) {
        const body: AdminSettingsPayload = await sRes.json();
        setProFee(body.proFee);
        setEnterpriseFee(body.enterpriseFee);
        setClientKey(body.paypalClientId);
        setSecretKey(body.paypalClientSecret);
        setPaypalEnv(body.paypalEnv);
        setCurrencyCode(body.currencyCode || "USD");
      }

      // Fetch transactions
      const tRes = await apiFetch("/api/admin/transactions");
      if (tRes.ok) {
        const tList: PaypalTransaction[] = await tRes.json();
        setTransactions(tList);
      }
    } catch (err) {
      console.error("Failed to load admin parameters:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsUpdating(true);
      setSuccessMsg(null);

      const response = await apiFetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          proFee,
          enterpriseFee,
          paypalClientId: clientKey,
          paypalClientSecret: secretKey,
          paypalEnv,
          currencyCode
        })
      });

      if (!response.ok) {
        throw new Error("Could not update administrator parameters on the server.");
      }

      setSuccessMsg("Global SAAS pricing and PayPal credentials updated successfully!");
      setTimeout(() => setSuccessMsg(null), 4000);
      await fetchAdminData();

    } catch (err) {
      console.error(err);
      alert("Error updating settings.");
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="py-12 text-center space-y-4" id="admin-loader">
        <div className="w-10 h-10 border-4 border-zinc-700 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-zinc-500 font-mono">Synchronizing checkout gateways...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in" id="admin-settings-container">
      
      {/* Page Title */}
      <div className="space-y-1.5 pb-2 border-b border-zinc-200">
        <h2 className="text-lg font-black text-zinc-950 flex items-center">
          <Settings2 className="w-5 h-5 mr-2 text-zinc-700" />
          <span>SaaS System Administration Control Panel</span>
        </h2>
        <p className="text-xs text-zinc-500">Configure real-time subscription fees, secure client key credentials, and review historical validation checkout receipt ledgers.</p>
      </div>

      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-250 p-4 rounded-xl text-emerald-800 text-xs flex items-center space-x-2.5 shadow-xs">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-semibold">{successMsg}</span>
        </div>
      )}

      {/* Divide sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Side 2 columns: Pricing Settings Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSaveSettings} className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-sm space-y-6">
            
            <div className="space-y-4 pb-4 border-b border-zinc-100">
              <h3 className="font-extrabold text-sm text-zinc-900 flex items-center">
                <DollarSign className="w-4 h-4 text-zinc-650 mr-1.5" />
                <span>Adjust SaaS Tier Subscription Pricing</span>
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1.5">
                    Pro License Cost (${currencyCode})
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-3.5 text-xs text-zinc-400 font-bold">$</span>
                    <input
                      id="inp-pro-fee"
                      type="number"
                      step="0.01"
                      required
                      value={proFee}
                      onChange={(e) => setProFee(parseFloat(e.target.value) || 0)}
                      className="w-full text-xs p-3.5 pl-7 border border-zinc-200 rounded-lg focus:outline-hidden focus:border-zinc-500 bg-zinc-50 font-bold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1.5">
                    Enterprise License Cost (${currencyCode})
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-3.5 text-xs text-zinc-400 font-bold">$</span>
                    <input
                      id="inp-enterprise-fee"
                      type="number"
                      step="0.01"
                      required
                      value={enterpriseFee}
                      onChange={(e) => setEnterpriseFee(parseFloat(e.target.value) || 0)}
                      className="w-full text-xs p-3.5 pl-7 border border-zinc-200 rounded-lg focus:outline-hidden focus:border-zinc-500 bg-zinc-50 font-bold"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Paypal variables */}
            <div className="space-y-4">
              <h3 className="font-extrabold text-sm text-zinc-900 flex items-center">
                <Key className="w-4 h-4 text-zinc-650 mr-1.5" />
                <span>PayPal Smart Payment Gateway Context</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1.5">
                    PayPal Client Mode
                  </label>
                  <select
                    value={paypalEnv}
                    onChange={(e) => setPaypalEnv(e.target.value)}
                    className="w-full text-xs p-3 border border-zinc-200 rounded-lg focus:outline-hidden bg-zinc-50 font-medium"
                  >
                    <option value="sandbox">🟡 Sandbox (Simulated Checks Active)</option>
                    <option value="production">🟢 Production (Live Merchant Ingestion)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1.5">
                    Settlement Currency
                  </label>
                  <select
                    value={currencyCode}
                    onChange={(e) => setCurrencyCode(e.target.value)}
                    className="w-full text-xs p-3 border border-zinc-200 rounded-lg focus:outline-hidden bg-zinc-50 font-medium"
                  >
                    <option value="USD">USD ($) United States Dollar</option>
                    <option value="EUR">EUR (€) Euro Area</option>
                    <option value="GBP">GBP (£) Pound Sterling</option>
                  </select>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <div>
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5">
                    PayPal Sandbox Client ID
                  </label>
                  <input
                    id="inp-paypal-client"
                    type="text"
                    required
                    value={clientKey}
                    onChange={(e) => setClientKey(e.target.value)}
                    className="w-full text-xs p-3 border border-zinc-200 rounded-lg focus:outline-hidden focus:border-zinc-500 bg-zinc-50 font-mono"
                    placeholder="sb-paypal-sandbox-client-id-here"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                      PayPal Client Secret
                    </label>
                    <button
                      type="button"
                      onClick={() => setRevealSecret(!revealSecret)}
                      className="text-[10px] font-semibold text-indigo-600 hover:text-indigo-850 cursor-pointer"
                    >
                      {revealSecret ? "Hide Secret" : "Reveal Secret"}
                    </button>
                  </div>
                  <input
                    id="inp-paypal-secret"
                    type={revealSecret ? "text" : "password"}
                    required
                    value={secretKey}
                    onChange={(e) => setSecretKey(e.target.value)}
                    className="w-full text-xs p-3 border border-zinc-200 rounded-lg focus:outline-hidden focus:border-zinc-500 bg-zinc-50 font-mono"
                    placeholder="sb-paypal-sandbox-secret-id-here"
                  />
                </div>
              </div>

            </div>

            <button
              id="btn-save-admin-params"
              type="submit"
              disabled={isUpdating}
              className="w-full bg-zinc-900 hover:bg-zinc-950 text-white font-bold py-3.5 rounded-xl text-xs transition-colors cursor-pointer flex items-center justify-center space-x-2"
            >
              {isUpdating ? (
                <span>Persisting Gateway configurations...</span>
              ) : (
                <>
                  <FileCheck className="w-4 h-4 text-emerald-450" />
                  <span>Persist Global Administration Parameters</span>
                </>
              )}
            </button>

          </form>
        </div>

        {/* Right Side 1 column: Audit log metrics */}
        <div className="space-y-4">
          <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-6 space-y-4">
            
            <div className="space-y-1 pb-3 border-b border-zinc-200">
              <h3 className="font-extrabold text-xs uppercase tracking-wider text-zinc-500 flex items-center">
                <Layers2 className="w-4 h-4 mr-1 text-purple-600" />
                <span>Historical PayPal Audits</span>
              </h3>
              <p className="text-[10px] text-zinc-400">Review receipts authorized and upgrades enabled.</p>
            </div>

            {transactions.length === 0 ? (
              <div className="py-6 text-center text-xs text-zinc-400 italic">
                No active receipts captured inside this terminal.
              </div>
            ) : (
              <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
                {transactions.map((tx) => (
                  <div key={tx.id} className="bg-white border border-zinc-150 p-3 rounded-xl space-y-2 text-[11px] leading-relaxed relative">
                    <span className="absolute top-2.5 right-2.5 text-[9px] bg-emerald-50 text-emerald-700 font-bold border border-emerald-100 px-1.5 py-0.2 rounded-sm uppercase">
                      {tx.status}
                    </span>
                    <div className="space-y-1">
                      <div className="font-bold text-zinc-900">{tx.userName}</div>
                      <div className="text-zinc-500 text-[10px] font-mono select-all" title={tx.userEmail}>
                        {tx.userEmail}
                      </div>
                    </div>
                    <div className="border-t border-zinc-100 pt-1.5 flex justify-between items-center text-[10px] text-zinc-500">
                      <span>Purchased: <strong className="text-zinc-700">{tx.tierPurchased}</strong></span>
                      <strong className="text-zinc-950 font-mono">${tx.amount.toFixed(2)}</strong>
                    </div>
                    <div className="text-[9px] text-zinc-400 font-mono">
                      Ref: {tx.paypalOrderId}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <button
              id="btn-refresh-admin-ledgers"
              type="button"
              onClick={fetchAdminData}
              className="w-full text-center text-[11px] text-zinc-500 hover:text-zinc-800 flex items-center justify-center space-x-1.5 py-1.5 cursor-pointer border border-dashed border-zinc-200 hover:border-zinc-300 rounded-lg transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Force Reload Ledger Records</span>
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}

// © 2026 Mag7Crack.ai SaaS Core. All rights preserved.

