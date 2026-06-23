// src/types.ts
/**
 * Shared Type Definitions
 * Configures the TypeScript types, interfaces, roles, subscription parameters,
 * and structures used across front-end widgets and the backend Express routers.
 */


export type SubscriptionTier = 'FREE' | 'PRO' | 'ENTERPRISE';
export type RoleTarget = 'SWE' | 'PM' | 'DATA_SCIENCE';
export type InterviewType = 'CODING' | 'SYSTEM_DESIGN' | 'BEHAVIORAL';

export interface User {
  id: string;
  firebaseUid?: string;
  email: string;
  name: string;
  subscriptionTier: SubscriptionTier;
  createdAt: string;
}

export interface InterviewSession {
  id: string;
  userId: string;
  roleTarget: RoleTarget;
  type: InterviewType;
  score: number;
  createdAt: string;
  challenge?: MockChallenge; // Dynamic challenge data
}

export interface MockChallenge {
  id: string;
  roleTarget: RoleTarget;
  type: InterviewType;
  title: string;
  description: string;
  starterCode?: string;
  difficulty?: string;
  category?: string;
}

export interface CodingSubmission {
  id: string;
  sessionId: string;
  userId: string;
  problemId: string;
  userCode: string;
  timeComplexity: string;
  spaceComplexity: string;
  aiFeedback: string;
  createdAt: string;
}

export interface BehavioralResponse {
  id: string;
  sessionId: string;
  userId: string;
  questionText: string;
  audioTranscript: string;
  gradingMetrics: {
    situationTask: number; // 0-10
    action: number; // 0-10
    result: number; // 0-10
    communication: number; // 0-10
    confidenceScore?: number; // 0-10 (New body language score!)
  };
  aiFeedback: string;
  createdAt: string;
  faceImage?: string; // Optional camera frame base64
}

export interface PresetProblem {
  id: string;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  description: string;
  starterCode: string;
}

export interface PresetBehavioralQuestion {
  id: string;
  category: string;
  questionText: string;
}

// © 2026 Mag7Crack.ai SaaS Core. All rights preserved.

