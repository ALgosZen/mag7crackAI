// src/components/Header.tsx
/**
 * Header Component
 * Renders the responsive main navigation bar including the Mag7Crack.ai application logo,
 * current login profile badge, subscription tier management options, and log out functionality.
 */

import React from "react";
import { User, SubscriptionTier } from "../types.js";
import { Award, LogOut } from "lucide-react";

interface HeaderProps {
  user: User | null;
  currentView: string;
  onTierChange: (tier: SubscriptionTier) => void;
  onLogout: () => void;
  onViewChange: (view: "DASHBOARD" | "PRO_WORKSPACE" | "ENTERPRISE_HUB" | "ADMIN_SETTINGS" | "REQUEST_DEMO") => void;
}

export default function Header({ user, currentView, onTierChange, onLogout, onViewChange }: HeaderProps) {
  const isDev = import.meta.env.VITE_APP_MODE === "DEV";

  return (
    <header className="border-b-2 border-zinc-200 bg-white/95 backdrop-blur-md sticky top-0 z-50 shadow-md" id="nav-header">
      <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 gap-2">

          {/* Logo Brand */}
          <button
            onClick={() => onViewChange("DASHBOARD")}
            className="flex items-center space-x-2 shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
          >
            <div className="bg-gradient-to-tr from-purple-600 to-indigo-600 p-1.5 rounded-lg text-white shadow-sm">
              <Award className="h-5 w-5" />
            </div>
            <div className="flex flex-col text-left">
              <span className="font-black text-sm sm:text-lg tracking-tight text-zinc-900 leading-none">
                Mag7Crack.ai
              </span>
              {isDev && (
                <span className="mt-0.5 text-[8px] font-black text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded-full uppercase w-fit">
                  BETA
                </span>
              )}
            </div>
          </button>

          {/* Middle Navigation Tabs (Scrollable on Mobile) */}
          {user && (
            <nav className="flex-1 flex items-center justify-center space-x-1 overflow-x-auto no-scrollbar py-1" id="header-nav-tabs">
              <button
                id="tab-dashboard"
                onClick={() => onViewChange("DASHBOARD")}
                className={`px-2 py-1.5 text-[10px] sm:text-xs font-bold rounded-lg transition-all whitespace-nowrap cursor-pointer ${
                  currentView === "DASHBOARD" || currentView === "CODING" || currentView === "BEHAVIORAL" || currentView === "DETAILS"
                    ? "bg-zinc-900 text-white shadow-sm"
                    : "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900"
                }`}
              >
                Dashboard
              </button>

              <button
                id="tab-pro-workspace"
                onClick={() => onViewChange("PRO_WORKSPACE")}
                className={`px-2 py-1.5 text-[10px] sm:text-xs font-bold rounded-lg transition-all whitespace-nowrap cursor-pointer ${
                  currentView === "PRO_WORKSPACE"
                    ? "bg-zinc-900 text-white shadow-sm"
                    : "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900"
                }`}
              >
                Pro
              </button>

              <button
                id="tab-enterprise-hub"
                onClick={() => onViewChange("ENTERPRISE_HUB")}
                className={`px-2 py-1.5 text-[10px] sm:text-xs font-bold rounded-lg transition-all whitespace-nowrap cursor-pointer ${
                  currentView === "ENTERPRISE_HUB"
                    ? "bg-zinc-900 text-white shadow-sm"
                    : "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900"
                }`}
              >
                Enterprise
              </button>

              <button
                id="tab-request-demo"
                onClick={() => onViewChange("REQUEST_DEMO")}
                className={`px-2 py-1.5 text-[10px] sm:text-xs font-bold rounded-lg transition-all whitespace-nowrap cursor-pointer ${
                  currentView === "REQUEST_DEMO"
                    ? "bg-zinc-900 text-white shadow-sm"
                    : "text-indigo-600 hover:bg-indigo-50"
                }`}
              >
                Demo
              </button>

              {user.email && user.email.toLowerCase().includes("admin") && (
                <button
                  id="tab-admin-settings"
                  onClick={() => onViewChange("ADMIN_SETTINGS")}
                  className={`px-2 py-1.5 text-[10px] sm:text-xs font-bold rounded-lg transition-all whitespace-nowrap cursor-pointer ${
                    currentView === "ADMIN_SETTINGS"
                      ? "bg-purple-600 text-white shadow-sm"
                      : "text-zinc-500 hover:bg-purple-50 hover:text-purple-700"
                  }`}
                >
                  Admin
                </button>
              )}
            </nav>
          )}

          {/* User Status / Subscription Controls */}
          <div className="flex items-center space-x-1 sm:space-x-2 shrink-0">
            {user ? (
              <>
                {/* Compact Tier Switcher */}
                <div className="hidden xs:flex items-center space-x-0.5 bg-zinc-100 p-0.5 rounded-lg border border-zinc-200">
                  {(["FREE", "PRO", "ENTERPRISE"] as SubscriptionTier[]).map((t) => {
                    const isActive = user.subscriptionTier === t;
                    return (
                      <button
                        key={t}
                        id={`btn-tier-${t.toLowerCase()}`}
                        onClick={() => onTierChange(t)}
                        className={`px-1.5 py-1 text-[9px] font-black rounded-md transition-all cursor-pointer ${
                          isActive
                            ? "bg-white text-zinc-900 shadow-xs border border-zinc-200"
                            : "text-zinc-400 hover:text-zinc-600"
                        }`}
                      >
                        {t === "ENTERPRISE" ? "ENT" : t}
                      </button>
                    );
                  })}
                </div>

                {/* Logout Trigger button */}
                <button
                  id="btn-header-logout"
                  onClick={onLogout}
                  className="p-2 sm:px-3 sm:py-2 text-[10px] font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg flex items-center transition-all cursor-pointer shadow-sm"
                  title="Sign Out"
                >
                  <LogOut className="w-3.5 h-3.5 sm:mr-1.5" />
                  <span className="hidden sm:inline">Sign Out</span>
                </button>
              </>
            ) : null}
          </div>
        </div>
      </div>
    </header>
  );
}
