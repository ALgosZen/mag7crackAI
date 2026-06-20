import { PrismaClient } from "@prisma/client";
import { getGemini } from "./gemini.js";
import { Type } from "@google/genai";

const prisma = new PrismaClient();

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Automatically generates unique, high-quality interview challenges using Gemini 2.5 Flash
 * and populates the mock_challenges table in Supabase.
 * Implements a robust retry mechanism for 503 Service Unavailable and 429 Rate Limit errors.
 */
export async function runChallengeAutoGenerator() {
  const isEnabled = process.env.AUTO_GENERATE_CHALLENGES === "true";
  if (!isEnabled) return;

  const count = parseInt(process.env.CHALLENGES_PER_DAY || "3");
  console.log(`[AutoGenerator] Starting daily generation cycle for ${count} unique challenges...`);

  const roles = ["SWE", "PM", "DATA_SCIENCE"];
  const types = ["CODING", "BEHAVIORAL"];

  try {
    const ai = getGemini();

    for (let i = 0; i < count; i++) {
      const role = roles[Math.floor(Math.random() * roles.length)];
      const type = types[Math.floor(Math.random() * types.length)];

      let responseText = "";
      let retries = 5; // Increased retries
      let delay = 10000; // Start with 10 seconds for high demand

      while (retries > 0) {
        try {
          console.log(`[AutoGenerator] Attempting to generate ${type} challenge for ${role}...`);

          const systemInstruction = `
            You are an expert Principal Interviewer at a FAANG company.
            Generate a unique, high-quality ${type} interview challenge for a ${role} role.
            The challenge must be professional, challenging, and include all necessary metadata.

            Rules:
            - For CODING: Provide a clear title, detailed description, difficulty (Easy/Medium/Hard), category, valid Python starter code, and the IDEAL optimal Python solution.
            - For BEHAVIORAL: Provide a title, description of the STAR situation, difficulty, category, and an IDEAL high-scoring STAR response example.
            - Ensure the title is extremely descriptive and unique.

            You MUST respond with a structured JSON object.
          `;

          const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Generate one new unique ${type} interview challenge for a ${role}.`,
            config: {
              systemInstruction,
              responseMimeType: "application/json",
              responseSchema: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  description: { type: Type.STRING },
                  starterCode: { type: Type.STRING, nullable: true },
                  idealSolution: { type: Type.STRING },
                  difficulty: { type: Type.STRING },
                  category: { type: Type.STRING }
                },
                required: ["title", "description", "difficulty", "category", "idealSolution"]
              }
            }
          });

          responseText = response.text;
          break; // Success!

        } catch (err: any) {
          const isRetryable =
            err.status === 503 ||
            err.status === 429 ||
            (err.message && (err.message.includes("503") || err.message.includes("429") || err.message.includes("high demand") || err.message.includes("UNAVAILABLE")));

          if (isRetryable) {
            console.warn(`[AutoGenerator] Gemini is busy or rate-limited. Retrying in ${delay / 1000}s... (${retries} retries left)`);
            await sleep(delay);
            retries--;
            delay *= 2; // Exponential backoff
          } else {
            console.error(`[AutoGenerator] Unrecoverable error during attempt:`, err);
            throw err;
          }
        }
      }

      if (!responseText) {
        console.error(`[AutoGenerator] Failed to generate challenge after multiple retries. Skipping this one.`);
        continue;
      }

      try {
        const data = JSON.parse(responseText);

        const exists = await prisma.mockChallenge.findUnique({
          where: { title: data.title }
        });

        if (exists) {
          console.log(`[AutoGenerator] Skipping duplicate title found in database: "${data.title}"`);
          continue;
        }

        await prisma.mockChallenge.create({
          data: {
            roleTarget: role as any,
            type: type as any,
            title: data.title,
            description: data.description,
            starterCode: data.starterCode || null,
            idealSolution: data.idealSolution,
            difficulty: data.difficulty,
            category: data.category
          }
        });

        console.log(`[AutoGenerator] Successfully added: "${data.title}"`);
      } catch (parseErr) {
        console.error(`[AutoGenerator] Failed to parse or save AI response:`, parseErr);
      }
    }

    console.log(`[AutoGenerator] Cycle complete.`);
  } catch (error) {
    console.error("[AutoGenerator] Fatal error in generation cycle:", error);
  }
}
