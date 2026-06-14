import { PrismaClient } from "@prisma/client";
import { getGemini } from "./gemini.js";
import { Type } from "@google/genai";

const prisma = new PrismaClient();

/**
 * Automatically generates unique, high-quality interview challenges using Gemini 2.5 Flash
 * and populates the mock_challenges table in Supabase.
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
      // Randomly pick a role and type to diversify the library
      const role = roles[Math.floor(Math.random() * roles.length)];
      const type = types[Math.floor(Math.random() * types.length)];

      console.log(`[AutoGenerator] Generating ${type} challenge for ${role}...`);

      const systemInstruction = `
        You are an expert Principal Interviewer at a FAANG company.
        Generate a unique, high-quality ${type} interview challenge for a ${role} role.
        The challenge must be professional, challenging, and include all necessary metadata.

        Rules:
        - For CODING: Provide a clear title, detailed description, difficulty (Easy/Medium/Hard), category, and valid Python starter code.
        - For BEHAVIORAL: Provide a title, description of the STAR situation, difficulty, and category. Starter code should be null.
        - Ensure the title is unique and doesn't repeat common patterns.

        You MUST respond with a structured JSON object.
      `;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: "Generate one new unique interview challenge.",
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              description: { type: Type.STRING },
              starterCode: { type: Type.STRING, nullable: true },
              difficulty: { type: Type.STRING },
              category: { type: Type.STRING }
            },
            required: ["title", "description", "difficulty", "category"]
          }
        }
      });

      const data = JSON.parse(response.text);

      // Save to Supabase
      await prisma.mockChallenge.create({
        data: {
          roleTarget: role as any,
          type: type as any,
          title: data.title,
          description: data.description,
          starterCode: data.starterCode || null,
          difficulty: data.difficulty,
          category: data.category
        }
      });

      console.log(`[AutoGenerator] Successfully added: "${data.title}"`);
    }

    console.log(`[AutoGenerator] Cycle complete.`);
  } catch (error) {
    console.error("[AutoGenerator] Error during generation:", error);
  }
}
