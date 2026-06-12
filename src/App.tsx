// src/App.tsx
/**
 * Root Application Orchestrator
 * Coordinates state management, handles mock backend authentication, loads custom user session contexts,
 * and handles main view switching between the Dashboard, Coding environment, Behavioral panel, and detail records.
 */


import React, { useEffect, useState } from "react";
import Header from "./components/Header.tsx";
import Dashboard from "./components/Dashboard.tsx";
import CodingMock from "./components/CodingMock.tsx";
import BehavioralMock from "./components/BehavioralMock.tsx";
import SessionDetails from "./components/SessionDetails.tsx";
import LandingPage from "./components/LandingPage.tsx";
import ProWorkspace from "./components/ProWorkspace.tsx";
import EnterpriseHub from "./components/EnterpriseHub.tsx";
import AdminSettings from "./components/AdminSettings.tsx";
import { User, InterviewSession, SubscriptionTier, RoleTarget, InterviewType } from "./types.js";
import { CircleAlert, HelpCircle } from "lucide-react";
import { apiFetch } from "./api.ts";

type RouteView = "DASHBOARD" | "CODING" | "BEHAVIORAL" | "DETAILS" | "PRO_WORKSPACE" | "ENTERPRISE_HUB" | "ADMIN_SETTINGS";

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [sessions, setSessions] = useState<InterviewSession[]>([]);
  const [currentView, setCurrentView] = useState<RouteView>("DASHBOARD");
  const [activeSession, setActiveSession] = useState<InterviewSession | null>(null);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);

  const [isSyncing, setIsSyncing] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(true); // set true by default so it synchronizes automatically if valid, but user can log out

  // 1. Initial State Syncing
  const syncWorkspaceData = async () => {
    try {
      setIsSyncing(true);
      // Fetch authenticated profile info
      const uRes = await apiFetch("/api/auth/me");
      if (!uRes.ok) throw new Error("Could not sync user profile telemetry.");
      const uJson = await uRes.json();
      setUser(uJson);

      // Fetch historic sessions list
      const sRes = await apiFetch("/api/sessions");
      if (!sRes.ok) throw new Error("Could not list historic interview sessions.");
      const sJson = await sRes.json();
      setSessions(sJson);
    } catch (err) {
      console.error("Workspace initial synchronization failed:", err);
      setErrorMessage(err instanceof Error ? err.message : String(err));
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    syncWorkspaceData();
  }, []);

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUser(null);
    setCurrentView("DASHBOARD");
  };

  const handleLogin = async (candidateName: string, candidateEmail: string) => {
    try {
      setIsSyncing(true);
      const res = await apiFetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: candidateName, email: candidateEmail })
      });
      if (!res.ok) throw new Error("Could not authenticate session via full-stack route.");
      const activeUser = await res.json();
      setUser(activeUser);
      setIsLoggedIn(true);
      setCurrentView("DASHBOARD");
      // Resynchronize states
      await syncWorkspaceData();
    } catch (err) {
      console.error("Local login fallback:", err);
      setUser({
        id: "usr_" + Math.random().toString(36).substr(2, 6),
        name: candidateName,
        email: candidateEmail,
        subscriptionTier: candidateEmail.includes("meta") || candidateEmail.includes("free") ? "FREE" : "PRO",
        createdAt: new Date().toISOString()
      });
      setIsLoggedIn(true);
      setCurrentView("DASHBOARD");
    } finally {
      setIsSyncing(false);
    }
  };

  // 2. Event Handlers
  const handleTierChange = async (tier: SubscriptionTier) => {
    try {
      const res = await apiFetch("/api/auth/tier", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tier })
      });
      if (!res.ok) throw new Error("Failed to patch subscription tier.");
      const updatedUser = await res.json();
      setUser(updatedUser);
    } catch (err) {
      console.error(err);
      alert("Failed to update access subscription tier state.");
    }
  };

  const handleStartSession = async (roleTarget: RoleTarget, type: InterviewType) => {
    try {
      setIsSyncing(true);
      const res = await apiFetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roleTarget, type })
      });
      if (!res.ok) throw new Error("Failed to initialize remote mock session challenge.");
      const newSession: InterviewSession = await res.json();
      
      // Update local state list
      setSessions((prev) => [newSession, ...prev]);
      setActiveSession(newSession);
      
      // Transition to respective simulator
      if (type === "CODING") {
        setCurrentView("CODING");
      } else {
        setCurrentView("BEHAVIORAL");
      }
    } catch (err) {
      console.error(err);
      alert("Error starting new mock session.");
    } finally {
      setIsSyncing(false);
    }
  };

  const handleClearSessions = async () => {
    if (!window.confirm("Are you sure you want to completely clear your historical assessment archive? This cannot be undone.")) {
      return;
    }
    try {
      setIsSyncing(true);
      const res = await apiFetch("/api/sessions/clear", { method: "POST" });
      if (!res.ok) throw new Error("Failed to post clear request.");
      setSessions([]);
      setCurrentView("DASHBOARD");
      setActiveSession(null);
      setSelectedSessionId(null);
    } catch (err) {
      console.error(err);
      alert("Error clearing historical logs.");
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSelectSession = (sessionId: string) => {
    setSelectedSessionId(sessionId);
    setCurrentView("DETAILS");
  };

    // Called when active workspace submit processes and receives grading score
  const handleRefreshActiveSession = async () => {
    // Re-sync all entries to pull in latest scores
    await syncWorkspaceData();
  };

  if (isSyncing && !user && isLoggedIn) {
    return (
      <div className="min-h-screen bg-zinc-50 flex flex-col items-center justify-center p-6" id="app-root-loader">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-semibold text-zinc-500 mt-4">Bundling FAANG Mock Interview Workspace...</p>
      </div>
    );
  }

  if (isLoggedIn && (errorMessage || !user)) {
    return (
      <div className="min-h-screen bg-zinc-50 flex flex-col items-center justify-center p-6" id="app-root-error">
        <div className="bg-white p-6 rounded-2xl border border-zinc-200 max-w-md text-center shadow-lg space-y-4">
          <CircleAlert className="w-12 h-12 text-rose-500 mx-auto" />
          <h2 className="text-lg font-bold text-zinc-950">Synchronization Failure</h2>
          <p className="text-xs text-zinc-500 leading-relaxed">
            {errorMessage || "Workspace could not authenticate with local Express services. Please verify port 3000 ingress settings is running."}
          </p>
          <button
            onClick={() => {
              setErrorMessage(null);
              syncWorkspaceData();
            }}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2.5 rounded-lg text-xs transition-colors cursor-pointer"
          >
            Retry Sync
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col text-zinc-900 selection:bg-purple-100" id="app-root-container">
      {/* Header cockpit */}
      <Header 
        user={isLoggedIn ? user : null} 
        currentView={currentView}
        onTierChange={handleTierChange} 
        onLogout={handleLogout}
        onLoginClick={() => {
          const authSec = document.getElementById("auth-card");
          if (authSec) {
            authSec.scrollIntoView({ behavior: "smooth" });
          }
        }}
        onViewChange={(view) => {
          setCurrentView(view);
        }}
      />

      {/* Primary Section */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {!isLoggedIn ? (
          <LandingPage onLogin={handleLogin} />
          ) : (
          <>
            {currentView === "DASHBOARD" && (
              <Dashboard 
                sessions={sessions} 
                onStartSession={handleStartSession}
                onClearSessions={handleClearSessions}
                onSelectSession={handleSelectSession}
              />
            )}

            {currentView === "CODING" && activeSession && (
              <CodingMock 
                session={activeSession}
                onBack={async () => {
                  setCurrentView("DASHBOARD");
                  await handleRefreshActiveSession();
                }}
                onSubmitResults={async () => {
                  await handleRefreshActiveSession();
                }}
              />
            )}

            {currentView === "BEHAVIORAL" && activeSession && (
              <BehavioralMock 
                session={activeSession}
                onBack={async () => {
                  setCurrentView("DASHBOARD");
                  await handleRefreshActiveSession();
                }}
                onSubmitResults={async () => {
                  await handleRefreshActiveSession();
                }}
              />
            )}

            {currentView === "DETAILS" && selectedSessionId && (
              <SessionDetails 
                sessionId={selectedSessionId}
                onBack={async () => {
                  setCurrentView("DASHBOARD");
                  await handleRefreshActiveSession();
                }}
              />
            )}

            {currentView === "PRO_WORKSPACE" && user && (
              <ProWorkspace 
                user={user}
                onTierChange={async (tier) => {
                  await handleTierChange(tier);
                }}
              />
            )}

            {currentView === "ENTERPRISE_HUB" && user && (
              <EnterpriseHub 
                user={user}
                onTierChange={async (tier) => {
                  await handleTierChange(tier);
                }}
              />
            )}

            {currentView === "ADMIN_SETTINGS" && user && user.email.toLowerCase().includes("admin") && (
              <AdminSettings />
            )}
          </>
        )}

      </main>

      {/* Clean Aesthetic Footer */}
      <footer className="border-t border-zinc-200 bg-white py-6" id="app-footer">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-zinc-400">
          <p>© 2026 Mag7Crack.ai SaaS Core. All rights preserved.</p>
          <div className="flex space-x-4 items-center">
            <span className="font-mono text-[10px] bg-zinc-100 border border-zinc-200 text-zinc-500 px-2.5 py-0.5 rounded-sm">VITE 6.2 + REACT 19 + EXPRESS 4</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

// © 2026 Mag7Crack.ai SaaS Core. All rights preserved.

