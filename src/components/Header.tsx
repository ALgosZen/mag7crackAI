// src/components/Header.tsx
/**
 * Header Component
 * Renders the responsive main navigation bar including the Mag7Crack.ai application logo,
 * current login profile badge, subscription tier management options, and log out functionality.
 */


import React from "react";
import { User, SubscriptionTier } from "../types.js";
import { Shield, Sparkles, Award, User as UserIcon, LogOut, LogIn } from "lucide-react";

interface HeaderProps {
  user: User | null;
  currentView: string;
  onTierChange: (tier: SubscriptionTier) => void;
  onLogout: () => void;
  onLoginClick: () => void;
  onViewChange: (view: "DASHBOARD" | "PRO_WORKSPACE" | "ENTERPRISE_HUB" | "ADMIN_SETTINGS") => void;
}

export default function Header({ user, currentView, onTierChange, onLogout, onLoginClick, onViewChange }: HeaderProps) {
  return (
    <header className="border-b border-zinc-200 bg-white sticky top-0 z-40 shadow-xs" id="nav-header">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo Brand */}
          <div className="flex items-center space-x-3 shrink-0">
            <div className="bg-gradient-to-tr from-purple-600 to-indigo-600 p-2 rounded-lg text-white shadow-md">
              <Award className="h-6 w-6" />
            </div>
            <div>
              <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-purple-700 via-indigo-600 to-indigo-800 bg-clip-text text-transparent">
                Mag7Crack.ai
              </span>
              <span className="ml-1.5 px-2 py-0.5 text-[10px] font-semibold text-indigo-700 bg-indigo-50 border border-indigo-100 rounded-full uppercase tracking-wider hidden sm:inline-block">
                SaaS Foundation
              </span>
            </div>
          </div>

          {/* Middle Navigation Tabs (Only if logged in) */}
          {user && (
            <nav className="hidden md:flex space-x-1" id="header-nav-tabs">
              <button
                id="tab-dashboard"
                type="button"
                onClick={() => onViewChange("DASHBOARD")}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                  currentView === "DASHBOARD" || currentView === "CODING" || currentView === "BEHAVIORAL" || currentView === "DETAILS"
                    ? "bg-zinc-100 text-zinc-950 font-black border border-zinc-200"
                    : "text-zinc-500 hover:text-zinc-800 hover:bg-zinc-50"
                }`}
              >
                Dashboard
              </button>
              {user.email.toLowerCase().includes("admin") && (
                <button
                  id="tab-admin-settings"
                  type="button"
                  onClick={() => onViewChange("ADMIN_SETTINGS")}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                    currentView === "ADMIN_SETTINGS"
                      ? "bg-zinc-200 text-zinc-950 font-black border border-zinc-300"
                      : "text-zinc-500 hover:text-zinc-805 hover:bg-zinc-50"
                  }`}
                >
                  Admin Panel
                </button>
              )}
            </nav>
          )}

          {/* User Status / Subscription Controls */}
          <div className="flex items-center space-x-2 shrink-0">
            {user ? (
              <>
                {/* Subscription Tier Controller */}
                <div className="flex items-center space-x-0.5 bg-zinc-100 p-0.5 rounded-lg border border-zinc-200 scale-90 sm:scale-100 origin-right">
                  {(["FREE", "PRO", "ENTERPRISE"] as SubscriptionTier[]).map((t) => {
                    const isActive = user.subscriptionTier === t;
                    return (
                      <button
                        key={t}
                        id={`btn-tier-${t.toLowerCase()}`}
                        type="button"
                        onClick={() => onTierChange(t)}
                        className={`px-1.5 sm:px-2.5 py-1 text-[10px] sm:text-[11px] font-semibold rounded-md transition-all duration-200 cursor-pointer ${
                          isActive
                            ? "bg-white text-zinc-900 shadow-xs border border-zinc-200 font-bold"
                            : "text-zinc-500 hover:text-zinc-800 hover:bg-zinc-50"
                        }`}
                      >
                        {t}
                      </button>
                    );
                  })}
                </div>

                {/* Logout Trigger button */}
                <button
                  id="btn-header-logout"
                  type="button"
                  onClick={onLogout}
                  className="p-1.5 sm:px-3 sm:py-1.5 text-xs font-bold text-zinc-650 hover:text-rose-600 bg-zinc-50 hover:bg-rose-50 border border-zinc-250 hover:border-rose-200 rounded-lg flex items-center transition-colors cursor-pointer"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
                  <span className="hidden sm:inline ml-1.5">Sign Out</span>
                </button>
              </>
            ) : null}
          </div>
        </div>
      </div>
    </header>
  );
}

// © 2026 Mag7Crack.ai SaaS Core. All rights preserved.

