# FAANG Interview Prep SaaS

## 🛠️ Recent Fixes & Improvements (Android & Full-Stack)

The following critical stability, connectivity, and authentication fixes have been applied:

1.  **Cross-Platform Payment & Entitlement Bridge**: Implemented a "Buy Once, Access Anywhere" architecture using **Stripe**, **PayPal**, and **RevenueCat**. Web purchases instantly grant entitlements to the mobile app via RevenueCat's REST API, linked by **Firebase UID**.
2.  **Intelligent Challenge Caching**: Implemented a **Supabase-backed cache** for AI-generated challenges. The system now searches for valid cached questions first, reducing Gemini API costs and delivering sub-second challenge loading for users.
3.  **Pro Navigation & Header Refactor**: Completely refactored the navigation header to be fully responsive and visible on Vercel and mobile devices. Added direct access to the **Pro Workspace** and **Enterprise Hub** for authenticated users.
4.  **Persistence-Aware Auth Guard**: Fixed the "Auth Flickering" bug by implementing a strict synchronization guard that prevents the login screen from appearing for returning users with cached Firebase sessions.
5.  **Smart API Routing**: Upgraded `api.ts` to intelligently detect environment contexts, automatically switching between local emulator IPs (`10.0.2.2`), Vercel production URLs, and relative web paths.
6.  **Unified Native Authentication Bridge**: Implemented a secure auth handshake combining **Firebase Auth** (Phone SMS/OTP) and **Supabase**. Firebase handles initial identity verification, while the Supabase client dynamically inherits trust via JWT injection for database security (RLS).
7.  **Advanced UID Tracking**: Upgraded the architecture to identify users via **Firebase UID** in the database. This ensures persistent profile matching even when optional fields (like email) are not provided.
8.  **Development Mode Shortcuts**: Added a `VITE_APP_MODE="DEV"` toggle that auto-prepopulates test phone numbers and OTPs with a "faded" UI style to distinguish from manual entry.
9.  **Vercel Optimized Build**: Migrated Vite/Rollup dependencies to `devDependencies` and implemented dynamic imports for the dev-server to fix deployment module errors (`@rollup/rollup-linux-x64-gnu`).
10. **Environment Security**: Optimized `.gitignore` to prevent sensitive `.env` files and heavy Android build artifacts from being committed to version control.

---

A comprehensive, full-stack platform built for Software Engineering (SWE), Product Management (PM), and Data Science candidates preparing for rigorous technical, systems design, and behavioral FAANG interviews.

This platform integrates modern diagnostic modules, fully functional full-stack workflows, real-time AI assessments powered by server-side Gemini models, and simulated webcam gaze/expression analysis.

---

## 🚀 Key Features

### 1. 🎥 Intelligent Video & Voice Behavioral Cockpit
*   **Active Webcam Composure (Video Mode):** Connects to the user's camera feed to analyze posture, facial expressions, micro-behaviors, confidence levels, and eye contact. The webcam capture is analyzed server-side with Gemini Vision to provide actionable visual coaching feedback.
*   **Speech Voice Synthesis:** Features integrated **Text-to-Speech (TTS)** that speaks interview questions aloud in interactive voices and reads back deep-dive evaluation report summaries to mimic live, face-to-face panels.
*   **Visual STAR Radar Heatmap:** Generates a custom **SVG Radar Chart** showing competency across Situation, Task, Action, and Result facets, providing instant visual feedback on behavioral performance.
*   **Classic STAR Methodology Grading**: Assesses situational transcripts against explicit **STAR framework** metrics, assigning granular score integers from `0 to 10`.

### 2. 💻 Pro Technical Coding Simulator
*   **FAANG Pressure Timer**: Features a **45-minute countdown clock** that pulses red when time is running out, simulating the high-stress environment of a live technical screen.
*   **Interactive AI Hint System (Nudges)**: Includes a "Get Nudge" feature where the AI provides subtle logic hints. To maintain interview integrity, each hint results in a **5% score penalty**.
*   **Hands-Free Voice Logic**: Integrated **Speech-to-Text** allows candidates to dictate their logic aloud; the AI automatically inserts these thoughts as comments into the editor.
*   **Predictive Leveling (L3/L4/L5)**: Automatically assesses code complexity and efficiency to predict the candidate's equivalent corporate level (Junior, Mid, or Senior).
*   **Detailed Actionable Feedback**: Automatically communicates with the backend Gemini-powered agent to evaluate architectural patterns, algorithmic efficiency (Time/Space Complexity), and edge-case handling.

### 3. 📊 Candidate Progress Dashboard
*   **Readiness Index Tracking**: Aggregates grades across code, behavioral transcripts, and system designs to showcase comprehensive progress indices.
*   **Historic Diagnostics Log**: Maintains records of all completed and pending sessions, overall score progress, and specific milestones stored in Supabase.
*   **Daily Challenge Auto-Generator**: A background system that automatically populates the database with fresh, unique coding and behavioral challenges every 24 hours using Gemini.

### 4. 🎛️ Restricted Admin Control Deck
*   **Secure Access**: The Admin Panel is exclusively accessible to validated system administrators.
*   **Workspace Parameter Management**: Allows adjusting standard pricing coefficients, editing interactive platform prompts, and monitoring real-time backend ledger logs.

---

## 📁 Architecture & Module Breakdown

### Back-End Components (`server.ts`, `src/lib/gemini.ts`)
*   **`server.ts`**: An Express backend that implements full-stack routing, proxies Gemini API credentials, and handles **Stripe/PayPal webhooks** for RevenueCat entitlement synchronization.
*   **`autoGenerator.ts`**: Coordinates a daily background cycle to generate unique technical and behavioral content to keep the platform fresh and reduce real-time AI generation costs.
*   **`revenuecat.ts`**: Manages server-to-server communication with the RevenueCat REST API to sync web purchases to mobile users.
*   **`src/lib/gemini.ts`**: Integrates with the `@google/genai` SDK using the `gemini-2.5-flash` model for multi-modal evaluations and logic nudges.

### Front-End Interface Modules (`src/components/`, `src/App.tsx`)
*   **`src/App.tsx`**: The root application orchestrator. Controls global views and handles **Firebase Auth** state synchronizations with persistence-aware loading guards.
*   **`BehavioralMock.tsx`**: Hosts the video and voice behavioral mock interview cockpit with integrated STAR Radar visualizations.
*   **`CodingMock.tsx`**: Houses the programming editor with the FAANG Pressure Timer, AI Hint system, and Voice Dictation hooks.
*   **`api.ts`**: Centralized fetch management that automatically maps to the correct backend endpoint based on device context (Emulator, Web, or Production Mobile).

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
