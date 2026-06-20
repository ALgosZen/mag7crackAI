/**
 * Server Entrypoint
 * This server runs Express and handles all fullstack routes for authentication session syncing,
 * Stripe/PayPal cross-platform checkouts, RevenueCat entitlement synchronization,
 * and multi-modal behavioral and coding evaluations.
 */
import express from "express";
import path from "path";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";
import Stripe from "stripe";
import { evaluateCodingSubmission, evaluateBehavioralResponse, evaluateSystemDesign, evaluateResumeAndGrade } from "./src/lib/gemini.js";
import { runChallengeAutoGenerator } from "./src/lib/autoGenerator.js";
import { grantRevenueCatEntitlement, revokeRevenueCatEntitlement } from "./src/lib/revenuecat.js";

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const prisma = new PrismaClient();

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2025-02-24-preview",
});

// Handle Prisma connection for serverless environments
if (process.env.VERCEL) {
  prisma.$connect().catch((err) => console.error("Prisma connection error:", err));
}

// --- Schedule Auto-Generator ---
const setupScheduler = () => {
  if (process.env.AUTO_GENERATE_CHALLENGES === "true") {
    console.log("[Scheduler] Auto-Generator is enabled.");
    runChallengeAutoGenerator();
    setInterval(() => {
      runChallengeAutoGenerator();
    }, 24 * 60 * 60 * 1000);
  }
};
setupScheduler();

// WEBHOOKS MUST USE RAW BODY
app.post("/api/webhooks/stripe", express.raw({ type: "application/json" }), async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig!, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err: any) {
    console.error(`Webhook Error: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle subscription events
  switch (event.type) {
    case "checkout.session.completed":
      const session = event.data.object as Stripe.Checkout.Session;
      const firebaseUid = session.metadata?.firebaseUid;
      const tier = session.metadata?.tier;

      if (firebaseUid && tier) {
        // 1. Update our database
        await prisma.user.update({
          where: { firebaseUid },
          data: { subscriptionTier: tier as any }
        });

        // 2. Sync to RevenueCat for mobile app access
        await grantRevenueCatEntitlement(firebaseUid, tier.toLowerCase());
        console.log(`[Stripe Webhook] Unlocked ${tier} for ${firebaseUid}`);
      }
      break;

    case "customer.subscription.deleted":
      const subscription = event.data.object as Stripe.Subscription;
      // You'd need to find the user by Stripe Customer ID here
      // For brevity, we assume you've mapped stripeCustomerId in your schema
      break;
  }

  res.json({ received: true });
});

// Regular JSON parsing for other routes
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

/**
 * Auth Middleware
 */
const authenticate = async (req: any, res: any, next: any) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }
  const idToken = authHeader.split('Bearer ')[1];
  req.userToken = idToken;
  next();
};
app.use(authenticate);

// Enable CORS
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization, x-firebase-uid");
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// ==========================================
// 1. Checkout Endpoints
// ==========================================

// Create Stripe Checkout Session (Web)
app.post("/api/checkout/stripe/create-session", async (req: any, res) => {
  const { tier, firebaseUid } = req.body;
  if (!tier || !firebaseUid) return res.status(400).json({ error: "Missing parameters" });

  const priceId = tier === "PRO" ? process.env.STRIPE_PRO_PRICE_ID : process.env.STRIPE_ENTERPRISE_PRICE_ID;

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      mode: "subscription",
      success_url: `${process.env.VITE_BACKEND_URL || 'http://localhost:3000'}/dashboard?success=true`,
      cancel_url: `${process.env.VITE_BACKEND_URL || 'http://localhost:3000'}/upgrade?canceled=true`,
      metadata: {
        firebaseUid,
        tier
      },
    });
    res.json({ url: session.url });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// PayPal Checkout (Refactored to include RevenueCat sync)
app.post("/api/paypal/checkout", async (req, res) => {
  const { orderId, payerEmail, tier, firebaseUid } = req.body;

  if (!tier || !firebaseUid) {
    return res.status(400).json({ error: "Missing required checkout parameters." });
  }

  try {
    // 1. Update Database
    const updatedUser = await prisma.user.update({
      where: { firebaseUid },
      data: { subscriptionTier: tier.toUpperCase() as any }
    });

    // 2. Sync to RevenueCat for Mobile Access
    const rcSuccess = await grantRevenueCatEntitlement(firebaseUid, tier.toLowerCase());

    res.json({
      success: true,
      user: updatedUser,
      revenueCatSynced: rcSuccess
    });
  } catch (error) {
    console.error("PayPal processing error:", error);
    res.status(500).json({ error: "Failed to process payment." });
  }
});

// ==========================================
// 2. Existing API endpoints
// ==========================================

app.get("/api/auth/me", async (req: any, res) => {
  if (!req.userToken) return res.status(401).json({ error: "Missing token" });
  try {
    const firebaseUid = req.headers['x-firebase-uid'];
    let user;
    if (firebaseUid) {
      user = await prisma.user.findUnique({ where: { firebaseUid: String(firebaseUid) } });
    } else {
      user = await prisma.user.findFirst({ orderBy: { createdAt: 'desc' } });
    }
    if (!user) return res.status(404).json({ error: "Profile not initialized" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch user profile" });
  }
});

app.post("/api/auth/login", async (req, res) => {
  const { name, email, firebaseUid } = req.body;
  if (!firebaseUid) return res.status(400).json({ error: "Missing firebaseUid." });
  const activeName = name || "New Candidate";
  try {
    const user = await prisma.user.upsert({
      where: { firebaseUid },
      update: { name: activeName, email: email || null },
      create: {
        firebaseUid,
        name: activeName,
        email: email || null,
        subscriptionTier: (email && (email.includes("meta") || email.includes("free"))) ? "FREE" : "PRO"
      }
    });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: "Authentication failed" });
  }
});

app.post("/api/auth/tier", async (req, res) => {
  const { tier } = req.body;
  const firebaseUid = req.headers['x-firebase-uid'];
  if (!firebaseUid) return res.status(401).json({ error: "Unauthorized" });

  if (tier === "FREE" || tier === "PRO" || tier === "ENTERPRISE") {
    try {
      const updatedUser = await prisma.user.update({
        where: { firebaseUid },
        data: { subscriptionTier: tier }
      });
      // Sync to RC even for manual tier changes in DEV
      await grantRevenueCatEntitlement(firebaseUid, tier.toLowerCase());
      return res.json(updatedUser);
    } catch (error) {
      return res.status(500).json({ error: "Failed to update tier" });
    }
  }
  res.status(400).json({ error: "Invalid tier" });
});

app.get("/api/sessions", async (req: any, res) => {
  try {
    const firebaseUid = req.headers['x-firebase-uid'];
    let user = firebaseUid ? await prisma.user.findUnique({ where: { firebaseUid: String(firebaseUid) } }) : null;
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

app.post("/api/sessions", async (req: any, res) => {
  const { roleTarget, type } = req.body;
  const firebaseUid = req.headers['x-firebase-uid'];
  try {
    const user = await prisma.user.findUnique({ where: { firebaseUid: String(firebaseUid) } });
    if (!user) return res.status(404).json({ error: "User not found" });
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    let challenge = await prisma.mockChallenge.findFirst({
      where: { roleTarget, type, createdAt: { gte: threeMonthsAgo } },
      orderBy: { createdAt: 'desc' }
    });
    const newSession = await prisma.interviewSession.create({
      data: {
        userId: user.id,
        roleTarget,
        type,
        challengeId: challenge?.id || null,
        score: 0
      },
      include: {
        challenge: true
      }
    });
    res.status(201).json(newSession);
  } catch (error) {
    res.status(500).json({ error: "Failed to create session" });
  }
});

app.post("/api/sessions/:id/submit-coding", async (req, res) => {
  const { id: sessionId } = req.params;
  const { problemId, problemTitle, problemDescription, userCode, language, hintsUsed, timeTaken } = req.body;
  try {
    const session = await prisma.interviewSession.findUnique({
      where: { id: sessionId },
      include: { challenge: true }
    });

    if (!session) return res.status(404).json({ error: "Session not found." });

    // Provide the ideal solution to the AI evaluator for much higher precision grading
    const evaluation = await evaluateCodingSubmission(
      problemTitle,
      problemDescription,
      userCode,
      language,
      session.challenge?.idealSolution || undefined
    );
    const hintPenalty = (hintsUsed || 0) * 5;
    let finalScore = Math.max(0, evaluation.score - hintPenalty);
    let level = "L3 (Junior)";
    if (finalScore >= 90) level = "L5 (Senior)"; else if (finalScore >= 75) level = "L4 (Mid)";
    const submission = await prisma.codingSubmission.create({
      data: {
        sessionId,
        problemId,
        userCode,
        timeComplexity: evaluation.timeComplexity,
        spaceComplexity: evaluation.spaceComplexity,
        aiFeedback: `${evaluation.aiFeedback}\n\n### Leveling\n**Assessment:** ${level}`
      }
    });
    const updatedSession = await prisma.interviewSession.update({
      where: { id: sessionId },
      data: { score: finalScore }
    });
    res.json({ submission, session: updatedSession, level });
  } catch (error) {
    res.status(500).json({ error: "Evaluation failed" });
  }
});

app.post("/api/sessions/:id/hint", async (req, res) => {
  const { problemTitle, userCode } = req.body;
  try {
    const ai = getGemini();
    const result = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Candidate is stuck on ${problemTitle}. Code: ${userCode}. Provide a subtle hint.`
    });
    res.json({ hint: result.text });
  } catch (error) {
    res.status(500).json({ error: "Hint failed" });
  }
});

app.post("/api/sessions/:id/submit-behavioral", async (req, res) => {
  const { id: sessionId } = req.params;
  const { questionText, audioTranscript, faceImage } = req.body;
  try {
    const session = await prisma.interviewSession.findUnique({
      where: { id: sessionId },
      include: { challenge: true }
    });

    if (!session) return res.status(404).json({ error: "Session not found." });

    const evaluation = await evaluateBehavioralResponse(
      questionText,
      audioTranscript,
      faceImage,
      session.challenge?.idealSolution || undefined
    );

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
    res.json({ response, session: updatedSession });
  } catch (error) {
    res.status(500).json({ error: "Behavioral failed" });
  }
});

app.get("/api/sessions/:id/details", async (req, res) => {
  const { id: sessionId } = req.params;
  try {
    const session = await prisma.interviewSession.findUnique({
      where: { id: sessionId },
      include: { codingSubmissions: true, behavioralResponses: true }
    });
    if (!session) return res.status(404).json({ error: "Not found" });
    res.json({ session, codingSubmissions: session.codingSubmissions, behavioralResponses: session.behavioralResponses });
  } catch (error) {
    res.status(500).json({ error: "Fetch failed" });
  }
});

app.post("/api/sessions/clear", async (req: any, res) => {
  try {
    await prisma.interviewSession.deleteMany({});
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Clear failed" });
  }
});

app.get("/api/cron/generate-challenges", async (req, res) => {
  if (process.env.VERCEL && !req.headers['x-vercel-cron']) return res.status(401).send();
  await runChallengeAutoGenerator();
  res.json({ success: true });
});

// --- VITE MIDDLEWARE ---
async function startServer() {
  if (process.env.NODE_ENV !== "production" && !process.env.VERCEL) {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({ server: { middlewareMode: true }, appType: "spa" });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get(/^(?!\/api).+/, (req, res) => res.sendFile(path.join(distPath, "index.html")));
  }
  if (!process.env.VERCEL) app.listen(PORT, "0.0.0.0", () => console.log(`[Fullstack Server ready] on ${PORT}`));
}
startServer();
export default app;
