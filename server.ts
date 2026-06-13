/**
 * Server Entrypoint
 * This server runs Express and handles all fullstack routes for authentication session syncing,
 * admin configuration presets, PayPal simulation processing, and multi-modal behavioral,
 * system design, and coding answers evaluation through server-side Gemini.
 */
import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";
import { evaluateCodingSubmission, evaluateBehavioralResponse, evaluateSystemDesign, evaluateResumeAndGrade } from "./src/lib/gemini.js";

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3000;
const prisma = new PrismaClient();

// Optional: In a production app, use firebase-admin to verify tokens
// import admin from 'firebase-admin';
// admin.initializeApp();

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

/**
 * Auth Middleware
 * Extracts the Firebase ID Token and identifies the user.
 * For this demo/foundation, we parse the token to get the phone/uid.
 */
const authenticate = async (req: any, res: any, next: any) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(); // Allow unauthenticated for now, or block based on route
  }

  const idToken = authHeader.split('Bearer ')[1];
  try {
    // In production: const decodedToken = await admin.auth().verifyIdToken(idToken);
    // For now, we'll simulate verification or use the provided token
    // We'll store the token on the request for Prisma logic
    req.userToken = idToken;
    next();
  } catch (error) {
    console.error("Token verification failed:", error);
    res.status(401).json({ error: "Invalid token" });
  }
};

app.use(authenticate);

// Enable CORS for Android emulator access
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// ==========================================
// 1. Admin Settings (Keep in memory or move to DB if needed)
// ==========================================
let adminSettings = {
  proFee: 29.99,
  enterpriseFee: 199.99,
  paypalClientId: process.env.PAYPAL_CLIENT_ID || "sb-paypal-sandbox-client-id-here",
  paypalClientSecret: process.env.PAYPAL_CLIENT_SECRET || "sb-paypal-sandbox-secret-id-here",
  paypalEnv: process.env.PAYPAL_ENV || "sandbox",
  currencyCode: "USD"
};

// ==========================================
// 2. Full-Stack REST API endpoints
// ==========================================

// Get ongoing session profiling & statistics
app.get("/api/auth/me", async (req: any, res) => {
  if (!req.userToken) return res.status(401).json({ error: "Missing token" });

  try {
    // In production, you would decode the token and get the UID.
    // For this build, we'll try to find the user by a header field or just the most recent
    // if we don't have full decoding yet.
    // Let's assume we can get a identifier from the token or the request body.
    const firebaseUid = req.headers['x-firebase-uid']; // A simple way to pass it for now if not decoding

    let user;
    if (firebaseUid) {
      user = await prisma.user.findUnique({ where: { firebaseUid } });
    } else {
      user = await prisma.user.findFirst({ orderBy: { createdAt: 'desc' } });
    }

    if (!user) return res.status(404).json({ error: "Profile not initialized" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch user profile" });
  }
});

// Update active mock user session profile
app.post("/api/auth/login", async (req, res) => {
  const { name, email, firebaseUid } = req.body;
  if (!name || !firebaseUid) {
    return res.status(400).json({ error: "Missing name or firebaseUid." });
  }

  try {
    const user = await prisma.user.upsert({
      where: { firebaseUid },
      update: { name, email: email || null },
      create: {
        firebaseUid,
        name,
        email: email || null,
        subscriptionTier: (email && (email.includes("meta") || email.includes("free"))) ? "FREE" : "PRO"
      }
    });
    res.json(user);
  } catch (error) {
    console.error("Auth error:", error);
    res.status(500).json({ error: "Authentication failed" });
  }
});

// Update current subscribed tier
app.post("/api/auth/tier", async (req, res) => {
  const { tier } = req.body;
  if (tier === "FREE" || tier === "PRO" || tier === "ENTERPRISE") {
    try {
      const user = await prisma.user.findFirst({ orderBy: { createdAt: 'desc' } });
      if (!user) return res.status(404).json({ error: "User not found" });

      const updatedUser = await prisma.user.update({
        where: { id: user.id },
        data: { subscriptionTier: tier }
      });
      return res.json(updatedUser);
    } catch (error) {
      return res.status(500).json({ error: "Failed to update tier" });
    }
  }
  res.status(400).json({ error: "Invalid subscription tier parameter." });
});

// Admin Configuration retrieval
app.get("/api/admin/settings", (req, res) => {
  res.json(adminSettings);
});

// Admin Configuration persist update
app.post("/api/admin/settings", (req, res) => {
  const { proFee, enterpriseFee, paypalClientId, paypalClientSecret, paypalEnv, currencyCode } = req.body;
  
  if (proFee !== undefined) adminSettings.proFee = parseFloat(proFee) || 0;
  if (enterpriseFee !== undefined) adminSettings.enterpriseFee = parseFloat(enterpriseFee) || 0;
  if (paypalClientId !== undefined) adminSettings.paypalClientId = String(paypalClientId).trim();
  if (paypalClientSecret !== undefined) adminSettings.paypalClientSecret = String(paypalClientSecret).trim();
  if (paypalEnv !== undefined) adminSettings.paypalEnv = String(paypalEnv).trim();
  if (currencyCode !== undefined) adminSettings.currencyCode = String(currencyCode).trim();

  res.json({ success: true, settings: adminSettings });
});

// List all historic sessions
app.get("/api/sessions", async (req: any, res) => {
  try {
    const firebaseUid = req.headers['x-firebase-uid'];
    let user;
    if (firebaseUid) {
      user = await prisma.user.findUnique({ where: { firebaseUid } });
    } else {
      user = await prisma.user.findFirst({ orderBy: { createdAt: 'desc' } });
    }

    if (!user) return res.json([]);

    const sessions = await prisma.interviewSession.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' }
    });
    res.json(sessions);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch sessions" });
  }
});

// Create a new mock interview session
app.post("/api/sessions", async (req, res) => {
  const { roleTarget, type } = req.body;
  
  if (!roleTarget || !type) {
    return res.status(400).json({ error: "Missing required roleTarget or type parameters." });
  }

  try {
    const user = await prisma.user.findFirst({ orderBy: { createdAt: 'desc' } });
    if (!user) return res.status(404).json({ error: "User not found" });

    const newSession = await prisma.interviewSession.create({
      data: {
        userId: user.id,
        roleTarget,
        type,
        score: 0
      }
    });
    res.status(201).json(newSession);
  } catch (error) {
    res.status(500).json({ error: "Failed to create session" });
  }
});

// Submit code for immediate review using Server-side Gemini API
app.post("/api/sessions/:id/submit-coding", async (req, res) => {
  const { id: sessionId } = req.params;
  const { problemId, problemTitle, problemDescription, userCode, language } = req.body;

  if (!problemId || !userCode) {
    return res.status(400).json({ error: "Missing problem info or userCode parameter." });
  }

  try {
    const session = await prisma.interviewSession.findUnique({ where: { id: sessionId } });
    if (!session) {
      return res.status(404).json({ error: "Target interview session was not found." });
    }

    const evaluation = await evaluateCodingSubmission(
      problemTitle || "Coding Problem",
      problemDescription || "No description provided.",
      userCode,
      language || "python"
    );

    const submission = await prisma.codingSubmission.create({
      data: {
        sessionId,
        problemId,
        userCode,
        timeComplexity: evaluation.timeComplexity,
        spaceComplexity: evaluation.spaceComplexity,
        aiFeedback: evaluation.aiFeedback
      }
    });

    const updatedSession = await prisma.interviewSession.update({
      where: { id: sessionId },
      data: { score: evaluation.score }
    });

    res.json({
      submission,
      session: updatedSession
    });
  } catch (error) {
    console.error("Express routing code submit handled crash:", error);
    res.status(500).json({ error: "Failed to evaluate code with Gemini." });
  }
});

// Submit behavioral response for STAR review using Server-side Gemini API
app.post("/api/sessions/:id/submit-behavioral", async (req, res) => {
  const { id: sessionId } = req.params;
  const { questionText, audioTranscript, faceImage } = req.body;

  if (!questionText || !audioTranscript) {
    return res.status(400).json({ error: "Missing questionText or audioTranscript." });
  }

  try {
    const session = await prisma.interviewSession.findUnique({ where: { id: sessionId } });
    if (!session) {
      return res.status(404).json({ error: "Target interview session outline was not found." });
    }

    const evaluation = await evaluateBehavioralResponse(questionText, audioTranscript, faceImage);

    const response = await prisma.behavioralResponse.create({
      data: {
        sessionId,
        questionText,
        audioTranscript,
        gradingMetrics: JSON.stringify(evaluation.gradingMetrics),
        aiFeedback: evaluation.aiFeedback
      }
    });

    const updatedSession = await prisma.interviewSession.update({
      where: { id: sessionId },
      data: { score: evaluation.score }
    });

    res.json({
      response,
      session: updatedSession
    });
  } catch (error) {
    console.error("Express routing behavioral submit handled crash:", error);
    res.status(500).json({ error: "Failed to evaluate behavioral transcript." });
  }
});

// Submit Pro System Design architecture for Gemini analysis
app.post("/api/sessions/pro-system-design/evaluate", async (req, res) => {
  const { topic, prompt, userInput } = req.body;

  if (!topic || !userInput) {
    return res.status(400).json({ error: "Missing topic or architectural userInput payload." });
  }

  try {
    const assessment = await evaluateSystemDesign(topic, prompt || "", userInput);
    res.json(assessment);
  } catch (err) {
    console.error("System Design route crashed:", err);
    res.status(500).json({ error: "Failed to process system design feedback via server-side Gemini Model." });
  }
});

// Submit Enterprise resume blueprint for Gemini analysis against FAANG benchmark metrics
app.post("/api/sessions/enterprise-resume/evaluate", async (req, res) => {
  const { targetCompany, resumeContent } = req.body;

  if (!targetCompany || !resumeContent) {
    return res.status(400).json({ error: "Missing targetCompany or resumeContent payload parameters." });
  }

  try {
    const analysis = await evaluateResumeAndGrade(targetCompany, resumeContent);
    res.json(analysis);
  } catch (err) {
    console.error("Resume screening route crashed:", err);
    res.status(500).json({ error: "Failed to process resume screening via Gemini." });
  }
});

// Get specific details of a session (including submissions or answers)
app.get("/api/sessions/:id/details", async (req, res) => {
  const { id: sessionId } = req.params;
  try {
    const session = await prisma.interviewSession.findUnique({
      where: { id: sessionId },
      include: {
        codingSubmissions: true,
        behavioralResponses: true
      }
    });

    if (!session) {
      return res.status(404).json({ error: "Session not found." });
    }

    res.json({
      session,
      codingSubmissions: session.codingSubmissions,
      behavioralResponses: session.behavioralResponses
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch session details" });
  }
});

// Clear all sessions (for easy reset / demo testing)
app.post("/api/sessions/clear", async (req, res) => {
  try {
    await prisma.interviewSession.deleteMany({});
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to clear sessions" });
  }
});


// ==========================================
// 3. Vite Middleware integration
// ==========================================
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Production serve static compiled assets
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Fullstack Server ready] bound to host 0.0.0.0 on port ${PORT}`);
  });
}

startServer();

// © 2026 Mag7Crack.ai SaaS Core. All rights preserved.
