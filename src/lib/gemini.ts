// src/lib/gemini.ts
/**
 * Server-Side Gemini API Client Wrapper
 * Integrates directly with the `@google/genai` model endpoint. Formats schemas and system instructions
 * to run robust multi-modal evaluations on camera shots, coding workspaces, STAR behavioral transcripts, and resumes.
 */


import { GoogleGenAI, Type } from "@google/genai";

let aiInstance: GoogleGenAI | null = null;

/**
 * Returns a lazily-initialized instance of GoogleGenAI.
 * Throws a diagnostic error if GEMINI_API_KEY is missing.
 */
export function getGemini(): GoogleGenAI {
  if (!aiInstance) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error("GEMINI_API_KEY environment variable is required. Please set it in Settings > Secrets.");
    }
    aiInstance = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiInstance;
}

interface CodingEvaluationResult {
  timeComplexity: string;
  spaceComplexity: string;
  aiFeedback: string;
  score: number;
}

/**
 * Evaluates python/javascript/c++ code inputs against a problem prompt using Gemini.
 */
export async function evaluateCodingSubmission(
  problemTitle: string,
  problemDescription: string,
  userCode: string,
  language: string = "python"
): Promise<CodingEvaluationResult> {
  try {
    const ai = getGemini();
    const systemInstruction = `
      You are a Principal Software Engineer conducting a mock coding interview for a top FAANG company.
      Analyze the candidate's code submission based on absolute accuracy, edge-case coverage, code elegance, and optimal Big-O complexity.
      You MUST respond with a structured JSON object containing:
      - timeComplexity: string representing Big-O (e.g. "O(N log N)")
      - spaceComplexity: string representing Big-O (e.g. "O(N)")
      - score: integer out of 100 representing readiness level (0-100)
      - aiFeedback: structured Markdown analyzing correctness, potential bugs, edge cases, and code enhancement suggestions. Ensure the feedback is extremely thorough and professional.
    `;

    const prompt = `
      Problem Title: ${problemTitle}
      Problem Description:
      ${problemDescription}

      Candidate Programming Language: ${language}
      Candidate Code Submission:
      \`\`\`${language}
      ${userCode}
      \`\`\`
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            timeComplexity: {
              type: Type.STRING,
              description: "Big-O notation of time complexity."
            },
            spaceComplexity: {
              type: Type.STRING,
              description: "Big-O notation of space complexity."
            },
            score: {
              type: Type.INTEGER,
              description: "Interview score out of 100."
            },
            aiFeedback: {
              type: Type.STRING,
              description: "Comprehensive review of the code in structured Markdown formats."
            }
          },
          required: ["timeComplexity", "spaceComplexity", "score", "aiFeedback"]
        }
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error("Received an empty response from Gemini content generation.");
    }

    const parsed = JSON.parse(text);
    return {
      timeComplexity: parsed.timeComplexity || "O(Unknown)",
      spaceComplexity: parsed.spaceComplexity || "O(Unknown)",
      aiFeedback: parsed.aiFeedback || "Failed to analyze code.",
      score: Math.min(Math.max(Number(parsed.score) || 70, 0), 100)
    };
  } catch (err) {
    console.error("Gemini Coding evaluation failed:", err);
    return {
      timeComplexity: "N/A",
      spaceComplexity: "N/A",
      aiFeedback: `### Evaluation Interrupted\n\nThere was an issue contacting the Gemini AI model.\n\n**Error details:** ${err instanceof Error ? err.message : String(err)}\n\nPlease ensure your API key compiles successfully in the Secrets configuration.`,
      score: 0
    };
  }
}

interface BehavioralEvaluationResult {
  gradingMetrics: {
    situationTask: number;
    action: number;
    result: number;
    communication: number;
    confidenceScore?: number;
  };
  aiFeedback: string;
  score: number;
}

/**
 * Assesses a behavioral transcript answering questions according to the STAR framework benchmarks.
 * Optionally evaluates a captured camera frame for body language, facial expressions, and confidence scoring.
 */
export async function evaluateBehavioralResponse(
  questionText: string,
  audioTranscript: string,
  faceImage?: string
): Promise<BehavioralEvaluationResult> {
  try {
    const ai = getGemini();
    const systemInstruction = `
      You are an expert HR Interviewer conducting a mock behavioral round for a FAANG company.
      Evaluate the candidate's response transcript using the STAR (Situation, Task, Action, Result) methodology.
      Additionally, if a photo of their face/webcam feed is provided, analyze their body language, facial expressions, and overall confidence (smile, eye contact, posture, nervousness).
      Provide granular score grading (0-10 integer representing level of completeness) across five metrics:
      - situationTask: Clear presentation of the context/conflict, challenge, and goals.
      - action: Specific steps taken by the candidate.
      - result: Data-driven outcomes, achievements, lessons learned, and metrics.
      - communication: Language clarity, impact, brevity, and alignment with leadership principles.
      - confidenceScore: Candidate's confidence level, body language, facial expressions, eye contact, warmth, and posture. If no face image is provided, default to a neutral grade (e.g., 7 or 8) based solely on verbal confidence in the transcript, and note that video mode was not enabled.

      You MUST respond with a structured JSON object containing:
      - situationTaskScore: integer 0-10
      - actionScore: integer 0-10
      - resultScore: integer 0-10
      - communicationScore: integer 0-10
      - confidenceScore: integer 0-10 representing facial expression, posture, and gaze/verbal confidence.
      - score: overall integer score out of 100 (0-100)
      - aiFeedback: structured Markdown providing actionable analysis of what they did well, and exactly how they can improve the STAR details. If a face image is provided, include a dedicated, robust section titled "### 🎥 Body Language, Expressions & Confidence Critique" analyzing their visual cues (gaze, posture, facial expression, micro-behaviors) and provide actionable coaching metrics to look more confident and polished on the mock camera feed.
    `;

    const promptMessage = `
      Interviewer Behavioral Question: "${questionText}"
      Candidate Transcript Answer: "${audioTranscript}"
      Video Mode Active: ${faceImage ? "Yes (Webcam Frame attached for facial and body language analysis)" : "No"}
    `;

    const parts: any[] = [{ text: promptMessage }];

    if (faceImage) {
      // Strip base64 headers if present
      const base64Data = faceImage.includes(",") ? faceImage.split(",")[1] : faceImage;
      parts.unshift({
        inlineData: {
          mimeType: "image/jpeg",
          data: base64Data
        }
      });
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: { parts },
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            situationTaskScore: { type: Type.INTEGER, description: "Situation & Task grading from 0 to 10." },
            actionScore: { type: Type.INTEGER, description: "Action grading from 0 to 10." },
            resultScore: { type: Type.INTEGER, description: "Result grading from 0 to 10." },
            communicationScore: { type: Type.INTEGER, description: "Communication elegance from 0 to 10." },
            confidenceScore: { type: Type.INTEGER, description: "Confidence, facial expression/body posture alignment score from 0 to 10." },
            score: { type: Type.INTEGER, description: "Estimated overall mock interview score out of 100." },
            aiFeedback: { type: Type.STRING, description: "Comprehensive STAR formatted evaluation markdown." }
          },
          required: ["situationTaskScore", "actionScore", "resultScore", "communicationScore", "confidenceScore", "score", "aiFeedback"]
        }
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error("Empty response from Gemini behavioral content generation.");
    }

    const parsed = JSON.parse(text);
    return {
      gradingMetrics: {
        situationTask: Math.min(Math.max(Number(parsed.situationTaskScore) || 5, 0), 10),
        action: Math.min(Math.max(Number(parsed.actionScore) || 5, 0), 10),
        result: Math.min(Math.max(Number(parsed.resultScore) || 5, 0), 10),
        communication: Math.min(Math.max(Number(parsed.communicationScore) || 5, 0), 10),
        confidenceScore: Math.min(Math.max(Number(parsed.confidenceScore) || 7, 0), 10)
      },
      aiFeedback: parsed.aiFeedback || "Could not analyze behavioral transcript.",
      score: Math.min(Math.max(Number(parsed.score) || 70, 0), 100)
    };
  } catch (err) {
    console.error("Gemini Behavioral evaluation failed:", err);
    return {
      gradingMetrics: { situationTask: 0, action: 0, result: 0, communication: 0, confidenceScore: 0 },
      aiFeedback: `### Assessment Interrupted\n\nThere was an issue contacting the Gemini AI model.\n\n**Error details:** ${err instanceof Error ? err.message : String(err)}\n\nPlease check your Secrets panel configuration.`,
      score: 0
    };
  }
}

/**
 * Evaluates high-level system design architecture blueprints using Gemini.
 */
export async function evaluateSystemDesign(
  topic: string,
  promptDescription: string,
  userInput: string
): Promise<{ feedback: string }> {
  try {
    const ai = getGemini();
    const systemInstruction = `
      You are a Principal Software Architect conducting a senior system design interview at a top-tier tech firm.
      Analyze the candidate's architecture proposal for "${topic}".
      Provide a comprehensive, senior-level review formatted in structured Markdown with:
      - **Architectural Score**: Grade their design (e.g. 8.5/10) with quick rationale.
      - **Scale & Performance Critique**: Assess how their databases, load balancing, sharding schemas, and CDNs will fare under heavy scale.
      - **Pros / Strengths**: Highlight parts they designed well.
      - **Single Points of Failure & Blindspots**: Address key architectural problems, bottlenecks, stale cache states, or data consistency risks.
      - **Recommended Optimal Reference Design**: Briefly layout how you would design this at scale.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `
        Design Challenge: ${topic}
        Challenge Prompt Details: ${promptDescription}
        Candidate Architectural Design Proposal:
        ---
        ${userInput}
        ---
      `,
      config: {
        systemInstruction,
      }
    });

    return {
      feedback: response.text || "### Analysis Error\nNo feedback generated."
    };
  } catch (err) {
    console.error("Gemini System Design evaluation handled error:", err);
    return {
      feedback: `### ⚠️ System Design Review Interrupted\nThere was an issue contacting the Gemini API model to generate your architectural critique.\n\n**Diagnostic Message:** ${err instanceof Error ? err.message : String(err)}\n\nPlease verify that your \`GEMINI_API_KEY\` is configured in the Secrets manager.`
    };
  }
}

/**
 * Screens and scores candidate resumes against target tech company benchmarks using Gemini.
 */
export async function evaluateResumeAndGrade(
  targetCompany: string,
  resumeContent: string
): Promise<{ feedback: string }> {
  try {
    const ai = getGemini();
    const systemInstruction = `
      You are an expert Principal Recruiting Partner who handles hiring pipelines for ${targetCompany}.
      Screen the pasted resume content against typical Senior Software Engineer, Product Manager, or Data Scientist hiring guide specifications at ${targetCompany}.
      Provide a highly professional evaluation in Markdown containing:
      - **FAANG Suitability Score**: Pick a percentage (e.g. 78%) based on depth.
      - **Hiring Decision Outline**: Strongly Support / Support / Borderline / Reject.
      - **Keyword & Metrics Check**: Check if they included quantifiable action outcomes (STAR method, e.g. "Increased conversion by 12%").
      - **Actionable Optimization tips**: List 3 key items they should rewrite to pass screening algorithms.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `
        Target Corporate Candidate Pipeline: ${targetCompany}
        Pasted Resume Input Text:
        ---
        ${resumeContent}
        ---
      `,
      config: {
        systemInstruction,
      }
    });

    return {
      feedback: response.text || "### Screening Error\nNo appraisal reports generated."
    };
  } catch (err) {
    console.error("Gemini Resume evaluation handled error:", err);
    return {
      feedback: `### ⚠️ Resume Appraisal Suspended\nCould not secure remote screening metrics relative to Gemini model pipelines.\n\n**Details:** ${err instanceof Error ? err.message : String(err)}\n\nPlease declare your \`GEMINI_API_KEY\` parameter properly in the secrets tab.`
    };
  }
}

// © 2026 Mag7Crack.ai SaaS Core. All rights preserved.



