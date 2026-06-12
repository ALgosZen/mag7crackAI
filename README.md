# FAANG Interview Prep SaaS

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
*   **`server.ts`:** An Express backend that implements full-stack routing, proxies Gemini API credentials safely away from the client browser, serves built static application bundles, and persists mock transaction history and session logs.
*   **`src/lib/gemini.ts`:** Coordinates structural payload preparation with the `@google/genai` SDK. Implements specialized JSON-Schema prompts that analyze speech-to-text transcripts and execute multi-modal evaluation on optional base64 webcam frames.

### Front-End Interface Modules (`src/components/`, `src/App.tsx`)
*   **`src/App.tsx`:** The root application orchestrator. Seamlessly controls global views and handles authentication state synchronizations.
*   **`BehavioralMock.tsx`:** Hosts the video and voice behavioral mock interview cockpit, manages the media capture stream, handles the browser speech synthesis hooks, and logs diagnostic outputs.
*   **`CodingMock.tsx`:** Houses the programming and system layout editor, triggering evaluations against specific problem specs.
*   **`Dashboard.tsx`:** Coordinates user profiling metrics, tracks historic attempts, and triggers mock session navigation.
*   **`SessionDetails.tsx`:** Displays a granular report overview of any completed mock interview session, showing the detailed STAR metric ratings and AI improvement feedback.
*   **`AdminSettings.tsx` & `LandingPage.tsx`:** Provides restricted system controls for administrators and orchestrates responsive profile login workflows on landing.

---

## 🛠️ Diagnostics & Quality Assurance

To verify that the application and its modules compile successfully under production settings, you can run:

```bash
# Validates TypeScript types and syntax integrity
npm run lint

# Automatically bundles the front-end and packages the server-side architecture
npm run build
```
