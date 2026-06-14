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
import ProWorkspace from "./components/ProWorkspace.tsx";
import EnterpriseHub from "./components/EnterpriseHub.tsx";
import AdminSettings from "./components/AdminSettings.tsx";
import PhoneLogin from "./components/Auth/PhoneLogin.tsx";
import SignupForm from "./components/Auth/SignupForm.tsx";
import { User, InterviewSession, SubscriptionTier, RoleTarget, InterviewType } from "./types.js";
import { CircleAlert, HelpCircle } from "lucide-react";
import { apiFetch } from "./api.ts";
import { onIdTokenChanged, User as FirebaseUser } from "firebase/auth";
import { auth } from "./lib/firebase";

type RouteView = "DASHBOARD" | "CODING" | "BEHAVIORAL" | "DETAILS" | "PRO_WORKSPACE" | "ENTERPRISE_HUB" | "ADMIN_SETTINGS";
type AuthStep = "LOGIN" | "SIGNUP" | "AUTHENTICATED";

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [authStep, setAuthStep] = useState<AuthStep>("LOGIN");
  const [idToken, setIdToken] = useState<string | null>(null);

  const [sessions, setSessions] = useState<InterviewSession[]>([]);
  const [currentView, setCurrentView] = useState<RouteView>("DASHBOARD");
  const [activeSession, setActiveSession] = useState<InterviewSession | null>(null);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);

  const [isSyncing, setIsSyncing] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // 1. Firebase Auth Observer
  useEffect(() => {
    const unsubscribe = onIdTokenChanged(auth, async (fUser) => {
      if (fUser) {
        const token = await fUser.getIdToken();
        setFirebaseUser(fUser);
        setIdToken(token);
        // If we have a firebase user but no app user, we might need signup
        await syncWorkspaceData(token, fUser.uid);
      } else {
        setFirebaseUser(null);
        setIdToken(null);
        setUser(null);
        setAuthStep("LOGIN");
        setIsSyncing(false);
      }
    });
    return () => unsubscribe();
  }, []);

  // 2. Initial State Syncing
  const syncWorkspaceData = async (token?: string, forceUid?: string) => {
    const activeToken = token || idToken;
    const activeUid = forceUid || firebaseUser?.uid;
    if (!activeToken) return;

    try {
      setIsSyncing(true);
      const headers: any = { Authorization: `Bearer ${activeToken}` };
      if (activeUid) {
        headers['x-firebase-uid'] = activeUid;
      }

      const uRes = await apiFetch("/api/auth/me", { headers });

      if (uRes.status === 404) {
        // User authenticated via Firebase but not in our DB yet
        setAuthStep("SIGNUP");
        setIsSyncing(false);
        return;
      }

      if (!uRes.ok) throw new Error("Could not sync user profile telemetry.");

      const uJson = await uRes.json();
      setUser(uJson);
      setAuthStep("AUTHENTICATED");

      const sRes = await apiFetch("/api/sessions", { headers });
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

  const handleLogout = async () => {
    await auth.signOut();
  };

  const handleSignupComplete = async (data: { name: string; email: string; useFaceId: boolean }) => {
    if (!idToken || !firebaseUser) return;
    try {
      setIsSyncing(true);
      const res = await apiFetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${idToken}`
        },
        body: JSON.stringify({
          name: data.name,
          email: data.email || null,
          firebaseUid: firebaseUser.uid
        })
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to register profile.");
      }
      const activeUser = await res.json();
      setUser(activeUser);
      setAuthStep("AUTHENTICATED");
      await syncWorkspaceData(idToken);
    } catch (err) {
      console.error(err);
      alert("Error initializing workspace profile.");
    } finally {
      setIsSyncing(false);
    }
  };

  // 3. Event Handlers (Updated to include Token)
  const handleTierChange = async (tier: SubscriptionTier) => {
    try {
      const res = await apiFetch("/api/auth/tier", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${idToken}`
        },
        body: JSON.stringify({ tier })
      });
      if (!res.ok) throw new Error("Failed to patch subscription tier.");
      const updatedUser = await res.json();
      setUser(updatedUser);
    } catch (err) {
      console.error(err);
    }
  };

  const handleStartSession = async (roleTarget: RoleTarget, type: InterviewType) => {
    try {
      setIsSyncing(true);
      const res = await apiFetch("/api/sessions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${idToken}`
        },
        body: JSON.stringify({ roleTarget, type })
      });
      if (!res.ok) throw new Error("Failed to initialize challenge.");
      const newSession: InterviewSession = await res.json();
      setSessions((prev) => [newSession, ...prev]);
      setActiveSession(newSession);
      setCurrentView(type === "CODING" ? "CODING" : "BEHAVIORAL");
    } catch (err) {
      console.error(err);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleClearSessions = async () => {
    if (!window.confirm("Clear all logs?")) return;
    try {
      setIsSyncing(true);
      const res = await apiFetch("/api/sessions/clear", {
        method: "POST",
        headers: { "Authorization": `Bearer ${idToken}` }
      });
      if (!res.ok) throw new Error("Failed to clear.");
      setSessions([]);
      setCurrentView("DASHBOARD");
    } catch (err) {
      console.error(err);
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

  // 4. Conditional Rendering based on Auth Step
  if (isSyncing) {
    return (
      <div className="min-h-screen bg-zinc-50 flex flex-col items-center justify-center p-6" id="app-root-loader">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-semibold text-zinc-500 mt-4">Initializing FAANG Prep Environment...</p>
      </div>
    );
  }

  if (authStep === "LOGIN") {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-6 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-purple-100 via-zinc-50 to-indigo-50">
        <PhoneLogin onAuthenticated={() => setAuthStep("SIGNUP")} />
      </div>
    );
  }

  if (authStep === "SIGNUP") {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-6">
        <SignupForm onComplete={handleSignupComplete} isLoading={isSyncing} />
      </div>
    );
  }

  if (errorMessage && !user) {
    return (
      <div className="min-h-screen bg-zinc-50 flex flex-col items-center justify-center p-6" id="app-root-error">
        <div className="bg-white p-6 rounded-2xl border border-zinc-200 max-w-md text-center shadow-lg space-y-4">
          <CircleAlert className="w-12 h-12 text-rose-500 mx-auto" />
          <h2 className="text-lg font-bold text-zinc-950">Synchronization Failure</h2>
          <p className="text-xs text-zinc-500 leading-relaxed">{errorMessage}</p>
          <button onClick={() => syncWorkspaceData()} className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2.5 rounded-lg text-xs transition-colors cursor-pointer">
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
        user={authStep === "AUTHENTICATED" ? user : null}
        currentView={currentView}
        onTierChange={handleTierChange} 
        onLogout={handleLogout}
        onLoginClick={() => {
          // This button won't be visible in authStep !== AUTHENTICATED
        }}
        onViewChange={(view) => {
          setCurrentView(view);
        }}
      />

      {/* Primary Section */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {authStep === "AUTHENTICATED" && (
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

