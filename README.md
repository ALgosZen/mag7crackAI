# FAANG Interview Prep SaaS

## 🛠️ Recent Fixes & Improvements (Android & Full-Stack)

The following critical stability and connectivity fixes have been applied to ensure the platform runs seamlessly on both web and Android Emulator environments:

1.  **Android Emulator Connectivity**: Fixed the "Synchronization Failure" by redirecting API calls to `http://10.0.2.2:3000` when running on Android.
2.  **Protocol & Security Fix**: Switched the Android application scheme to `http` in `capacitor.config.ts` to eliminate "Mixed Content" blocks and enabled `usesCleartextTraffic` in the Android Manifest.
3.  **Cloud Database Migration**: Successfully migrated from in-memory mock data to a persistent **Supabase (PostgreSQL)** database using Prisma ORM.
4.  **AI Model Stabilization**: Corrected the Gemini AI integration to use `gemini-2.5-flash`, the verified working model for this environment, and implemented a centralized provider pattern.
5.  **Cross-Origin Support (CORS)**: Implemented CORS middleware in the Express backend (`server.ts`) to allow the Android WebView to securely communicate with the local server.
6.  **Mobile UI Accessibility**: Fixed a responsive layout bug where the "Sign Out" button was hidden on mobile devices. It is now fully visible and functional in the header.
7.  **Environment Security**: Optimized `.gitignore` to prevent sensitive `.env` files and heavy Android build artifacts from being committed to version control.

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
