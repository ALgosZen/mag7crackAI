# FAANG Interview Prep SaaS

## 🛠️ Recent Fixes & Improvements (Android & Full-Stack)

The following critical stability, connectivity, and authentication fixes have been applied:

1.  **Unified Native Authentication Bridge**: Implemented a secure auth handshake combining **Firebase Auth** (Phone SMS/OTP) and **Supabase**. Firebase handles initial identity verification, while the Supabase client dynamically inherits trust via JWT injection for database security (RLS).
2.  **Advanced UID Tracking**: Upgraded the architecture to identify users via **Firebase UID** in the database. This ensures persistent profile matching even when optional fields (like email) are not provided.
3.  **Development Mode Shortcuts**: Added a `VITE_APP_MODE="DEV"` toggle that auto-prepopulates test phone numbers and OTPs. Includes a specialized "faded" UI style for auto-filled credentials to distinguish them from manual entry.
4.  **Lightweight Onboarding UI**: Implemented a streamlined **Profile Initialization** form requesting only **First Name** and making the **Email Address optional** (intended for notifications).
5.  **Robust Phone Validation**: Enhanced the SMS login logic to automatically clean input, handle country codes (+), and prevent "Phone Number Too Short" errors with better UX feedback.
6.  **Android Emulator Connectivity**: Fixed the "Synchronization Failure" by redirecting API calls to `http://10.0.2.2:3000` when running on Android.
7.  **Protocol & Security Fix**: Switched the Android application scheme to `http` in `capacitor.config.ts` to eliminate "Mixed Content" blocks and enabled `usesCleartextTraffic` in the Android Manifest.
8.  **Cloud Database Migration**: Successfully migrated from in-memory mock data to a persistent **Supabase (PostgreSQL)** database using Prisma ORM.
9.  **AI Model Stabilization**: Corrected the Gemini AI integration to use `gemini-2.5-flash`, the verified working model for this environment.
10. **Environment Security**: Optimized `.gitignore` to prevent sensitive `.env` files and heavy Android build artifacts from being committed to version control.

---

A comprehensive, full-stack platform built for Software Engineering (SWE), Product Management (PM), and Data Science candidates preparing for rigorous technical, systems design, and behavioral FAANG interviews.

This platform integrates modern diagnostic modules, fully functional full-stack workflows, real-time AI assessments powered by server-side Gemini models, and simulated webcam gaze/expression analysis.

---

## 🚀 Key Features

### 1. 🎥 Intelligent Video & Voice Behavioral Cockpit
*   **Active Webcam Composure (Video Mode):** Connects to the user's camera feed to analyze posture, facial expressions, micro-behaviors, confidence levels, and eye contact. The webcam capture is analyzed server-side with Gemini Vision to provide actionable visual coaching feedback.
*   **Speech Voice Synthesis:** Features integrated **Text-to-Speech (TTS)** that speaks interview questions aloud in interactive voices and reads back deep-dive evaluation report summaries to mimic live, face-to-face panels.
*   **Classic STAR Methodology Grading:** Assesses situational transcripts against explicit **STAR framework** metrics (*Situation, Task, Action, Result, and Communication*), assigning score integers from `0 to 10` on each facet alongside a complete aggregate mock grade from `0 to 100`.

### 2. 💻 Tech and Systems Design Playground
*   **Interactive Code Workspace:** Provides dynamic question selections, and a responsive playground for drafting system structure, algorithmic, or object-oriented designs.
*   **Detailed Actionable Feedback:** Automatically communicates with the backend Gemini-powered agent to evaluate architectural patterns, algorithmic efficiency (Time/Space Complexity), edge-case handling, and software best practices.

### 3. 📊 Candidate Progress Dashboard
*   **Readiness Index Tracking:** Aggregates grades across code, behavioral transcripts, and system designs to showcase comprehensive progress indices.
*   **Historic Diagnostics Log:** Maintains records of all completed and pending sessions, overall score progress, and specific milestones.

### 4. 🎛️ Restricted Admin Control Deck
*   **Secure Access:** The Admin Panel is exclusively accessible to validated system administrators (users logged in with an email containing `admin`).
*   **Workspace Parameter Management:** Allows adjusting standard pricing coefficients, editing interactive platform prompts, and monitoring real-time backend ledger logs and mock transaction logs.

---

## 📁 Architecture & Module Breakdown

### Back-End Components (`server.ts`, `src/lib/gemini.ts`)
*   **`server.ts`:** An Express backend that implements full-stack routing, proxies Gemini API credentials safely away from the client browser, serves built static application bundles, and persists data to **Supabase** via Prisma.
*   **`src/lib/gemini.ts`:** Coordinates structural payload preparation with the `@google/genai` SDK. Implements specialized JSON-Schema prompts that analyze speech-to-text transcripts and execute multi-modal evaluation on optional base64 webcam frames using the `gemini-2.5-flash` model.

### Front-End Interface Modules (`src/components/`, `src/App.tsx`)
*   **`src/App.tsx`:** The root application orchestrator. Seamlessly controls global views and handles authentication state synchronizations.
*   **`BehavioralMock.tsx`:** Hosts the video and voice behavioral mock interview cockpit, manages the media capture stream, handles the browser speech synthesis hooks, and logs diagnostic outputs.
*   **`CodingMock.tsx`:** Houses the programming and system layout editor, triggering evaluations against specific problem specs.
*   **`Dashboard.tsx`:** Coordinates user profiling metrics, tracks historic attempts, and triggers mock session navigation.
*   **`SessionDetails.tsx`:** Displays a granular report overview of any completed mock interview session, showing the detailed STAR metric ratings and AI improvement feedback.
*   **`AdminSettings.tsx` & `LandingPage.tsx` & `api.ts`:** Provides restricted system controls, login workflows, and centralized API fetch management with emulator support.

---

## 🛠️ Diagnostics & Quality Assurance

To verify that the application and its modules compile successfully under production settings, you can run:

```bash
# Validates TypeScript types and syntax integrity
npm run lint

# Automatically bundles the front-end and packages the server-side architecture
npm run build
```

© 2026 Mag7Crack.ai SaaS Core. All rights preserved.
