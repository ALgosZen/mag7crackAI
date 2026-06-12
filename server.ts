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
import { evaluateCodingSubmission, evaluateBehavioralResponse, evaluateSystemDesign, evaluateResumeAndGrade } from "./src/lib/gemini.js";
import { InterviewSession, CodingSubmission, BehavioralResponse } from "./src/types.js";

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

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
// 1. Durably Mock database storage in memory
// ==========================================
let adminSettings = {
  proFee: 29.99,
  enterpriseFee: 199.99,
  paypalClientId: process.env.PAYPAL_CLIENT_ID || "sb-paypal-sandbox-client-id-here",
  paypalClientSecret: process.env.PAYPAL_CLIENT_SECRET || "sb-paypal-sandbox-secret-id-here",
  paypalEnv: process.env.PAYPAL_ENV || "sandbox",
  currencyCode: "USD"
};

let paypalTransactions: Array<{
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
}> = [
  {
    id: "tx_9a8df13b",
    userEmail: "alphabizu@gmail.com",
    userName: "Jane Doe",
    tierPurchased: "PRO",
    amount: 29.99,
    currency: "USD",
    paypalOrderId: "PAYID-MOCKORD9812401",
    paypalPayerEmail: "buyer-jane@faangprep.ai",
    status: "COMPLETED",
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString()
  }
];

let currentMockUser = {
  id: "user_f9a81",
  name: "Jane Doe",
  email: "alphabizu@gmail.com",
  subscriptionTier: "PRO" as "FREE" | "PRO" | "ENTERPRISE",
  createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days ago
};

let sessions: InterviewSession[] = [
  {
    id: "session_s1",
    userId: "user_f9a81",
    roleTarget: "SWE",
    type: "CODING",
    score: 84,
    createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString() // 12 days ago
  },
  {
    id: "session_s2",
    userId: "user_f9a81",
    roleTarget: "SWE",
    type: "BEHAVIORAL",
    score: 91,
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days ago
  },
  {
    id: "session_s3",
    userId: "user_f9a81",
    roleTarget: "PM",
    type: "BEHAVIORAL",
    score: 74,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() // 3 days ago
  }
];

let codingSubmissions: CodingSubmission[] = [
  {
    id: "sub_1",
    sessionId: "session_s1",
    userId: "user_f9a81",
    problemId: "problem_1",
    userCode: `def hasCycle(head):\n    slow = head\n    fast = head\n    while fast and fast.next:\n        slow = slow.next\n        fast = fast.next.next\n        if slow == fast:\n            return True\n    return False`,
    timeComplexity: "O(N)",
    spaceComplexity: "O(1)",
    aiFeedback: "### Executive Summary\nExcellent implementation! You successfully used Floyd's Tortoise and Hare cycle-finding algorithm.\n\n### Key Highlights\n- **Efficiency:** The code is optimally efficient with complete linear linear traversal.\n- **Readability:** Naming choices for node traversals are standard and highly professional.",
    createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString()
  }
];

let behavioralResponses: BehavioralResponse[] = [
  {
    id: "bh_1",
    sessionId: "session_s2",
    userId: "user_f9a81",
    questionText: "Tell me about a time you handled conflict within your development team.",
    audioTranscript: "During our latest release sprint, two senior devs disagreed heavily on whether we should push our database migrations immediately or delay them for further staging assessment. I set up a brief collaborative design review session where each mapped out the respective latency or regression risks. By structuring a objective pros and cons framework, we agreed to stage a parallel migration with rollback toggles, which mitigated risks and led to a flawless deployment on schedule.",
    gradingMetrics: {
      situationTask: 9,
      action: 9,
      result: 9,
      communication: 10
    },
    aiFeedback: "### Comprehensive Interview Assessment\n\n- **Situation/Task critique:** High marks for structuring. You framed the conflict context clearly and defined the immediate goals.\n- **Action critique:** Highlighted proactive leadership by mediating a technical review meeting rather than imposing raw authority.\n- **Result critique:** Excellent mentions of concrete rollback safeguards.",
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  }
];

// ==========================================
// 2. Full-Stack REST API endpoints
// ==========================================

// Get ongoing session profiling & statistics
app.get("/api/auth/me", (req, res) => {
  res.json(currentMockUser);
});

// Update active mock user session profile
app.post("/api/auth/login", (req, res) => {
  const { name, email } = req.body;
  if (!name || !email) {
    return res.status(400).json({ error: "Missing name or email." });
  }
  currentMockUser = {
    id: "user_" + Math.random().toString(36).substr(2, 6),
    name,
    email,
    subscriptionTier: email.includes("meta") || email.includes("free") ? "FREE" : "PRO",
    createdAt: new Date().toISOString()
  };
  res.json(currentMockUser);
});

// Update current subscribed tier
app.post("/api/auth/tier", (req, res) => {
  const { tier } = req.body;
  if (tier === "FREE" || tier === "PRO" || tier === "ENTERPRISE") {
    currentMockUser.subscriptionTier = tier;
    return res.json(currentMockUser);
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

// List PayPal transactions
app.get("/api/admin/transactions", (req, res) => {
  res.json(paypalTransactions);
});

// Handle PayPal payment checkout webhook / execution callback
app.post("/api/paypal/checkout", (req, res) => {
  const { orderId, payerEmail, tier, amount } = req.body;

  if (!tier || !payerEmail) {
    return res.status(400).json({ error: "Missing required checkout parameters tier or payerEmail." });
  }

  // Upgrade user's subscription tier
  const matchedTier = String(tier).toUpperCase() as "FREE" | "PRO" | "ENTERPRISE";
  if (matchedTier === "PRO" || matchedTier === "ENTERPRISE") {
    currentMockUser.subscriptionTier = matchedTier;
  }

  const transactionRecord = {
    id: `tx_${Math.random().toString(36).substr(2, 9)}`,
    userEmail: currentMockUser.email,
    userName: currentMockUser.name,
    tierPurchased: tier,
    amount: parseFloat(amount) || (tier === "PRO" ? adminSettings.proFee : adminSettings.enterpriseFee),
    currency: adminSettings.currencyCode,
    paypalOrderId: orderId || `PAYID-SIM-${Math.random().toString(36).substr(2, 8).toUpperCase()}`,
    paypalPayerEmail: payerEmail,
    status: "COMPLETED",
    createdAt: new Date().toISOString()
  };

  paypalTransactions.unshift(transactionRecord);

  res.json({
    success: true,
    user: currentMockUser,
    transaction: transactionRecord
  });
});

// List all historic sessions
app.get("/api/sessions", (req, res) => {
  res.json(sessions);
});

// Create a new mock interview session
app.post("/api/sessions", (req, res) => {
  const { roleTarget, type } = req.body;
  
  if (!roleTarget || !type) {
    return res.status(400).json({ error: "Missing required roleTarget or type parameters." });
  }

  const newSession: InterviewSession = {
    id: `session_s${Date.now()}`,
    userId: currentMockUser.id,
    roleTarget,
    type,
    score: 0,
    createdAt: new Date().toISOString()
  };

  sessions.unshift(newSession);
  res.status(201).json(newSession);
});

// Submit code for immediate review using Server-side Gemini API
app.post("/api/sessions/:id/submit-coding", async (req, res) => {
  const { id: sessionId } = req.params;
  const { problemId, problemTitle, problemDescription, userCode, language } = req.body;

  if (!problemId || !userCode) {
    return res.status(400).json({ error: "Missing problem info or userCode parameter." });
  }

  const session = sessions.find(s => s.id === sessionId);
  if (!session) {
    return res.status(404).json({ error: "Target interview session was not found." });
  }

  try {
    // Call server-side gemini evaluation from library helper
    const evaluation = await evaluateCodingSubmission(
      problemTitle || "Coding Problem",
      problemDescription || "No description provided.",
      userCode,
      language || "python"
    );

    // Save coding submission
    const newSubmission: CodingSubmission = {
      id: `sub_${Date.now()}`,
      sessionId,
      userId: currentMockUser.id,
      problemId,
      userCode,
      timeComplexity: evaluation.timeComplexity,
      spaceComplexity: evaluation.spaceComplexity,
      aiFeedback: evaluation.aiFeedback,
      createdAt: new Date().toISOString()
    };

    codingSubmissions.unshift(newSubmission);

    // Update parent interview session score with calculated result
    session.score = evaluation.score;

    res.json({
      submission: newSubmission,
      session
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

  const session = sessions.find(s => s.id === sessionId);
  if (!session) {
    return res.status(404).json({ error: "Target interview session outline was not found." });
  }

  try {
    // Call server-side gemini evaluation with optional camera face image
    const evaluation = await evaluateBehavioralResponse(questionText, audioTranscript, faceImage);

    const newResponse: BehavioralResponse = {
      id: `bh_${Date.now()}`,
      sessionId,
      userId: currentMockUser.id,
      questionText,
      audioTranscript,
      gradingMetrics: evaluation.gradingMetrics,
      aiFeedback: evaluation.aiFeedback,
      createdAt: new Date().toISOString(),
      faceImage: faceImage || undefined
    };

    behavioralResponses.unshift(newResponse);

    // Update parent interview session score
    session.score = evaluation.score;

    res.json({
      response: newResponse,
      session
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
app.get("/api/sessions/:id/details", (req, res) => {
  const { id: sessionId } = req.params;
  const session = sessions.find(s => s.id === sessionId);
  if (!session) {
    return res.status(404).json({ error: "Session not found." });
  }

  const codings = codingSubmissions.filter(c => c.sessionId === sessionId);
  const behaviors = behavioralResponses.filter(b => b.sessionId === sessionId);

  res.json({
    session,
    codingSubmissions: codings,
    behavioralResponses: behaviors
  });
});

// Clear all sessions (for easy reset / demo testing)
app.post("/api/sessions/clear", (req, res) => {
  sessions = [];
  codingSubmissions = [];
  behavioralResponses = [];
  res.json({ success: true });
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

