import { GoogleGenerativeAI } from '@google/generative-ai';

// Environment configuration
const GOOGLE_AI_API_KEY = process.env.GOOGLE_AI_API_KEY || '';
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.0-flash-exp';

if (!GOOGLE_AI_API_KEY) {
  throw new Error('Missing GOOGLE_AI_API_KEY environment variable');
}

// Initialize Gemini AI client
const genAI = new GoogleGenerativeAI(GOOGLE_AI_API_KEY);

// Get the generative model
export const getGeminiModel = () => {
  return genAI.getGenerativeModel({
    model: GEMINI_MODEL,
    generationConfig: {
      temperature: 0.7,
      topP: 0.95,
      topK: 40,
      maxOutputTokens: 2048,
    },
    safetySettings: [
      {
        category: 'HARM_CATEGORY_HARASSMENT',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE',
      },
      {
        category: 'HARM_CATEGORY_HATE_SPEECH',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE',
      },
      {
        category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE',
      },
      {
        category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE',
      },
    ],
  });
};

// Chat model for conversational AI
export const getChatModel = () => {
  return genAI.getGenerativeModel({
    model: GEMINI_MODEL,
    generationConfig: {
      temperature: 0.9,
      topP: 1,
      topK: 40,
      maxOutputTokens: 1024,
    },
  });
};

// Structured model for data extraction (lower temperature for consistency)
export const getStructuredModel = () => {
  return genAI.getGenerativeModel({
    model: GEMINI_MODEL,
    generationConfig: {
      temperature: 0.2,
      topP: 0.8,
      topK: 20,
      maxOutputTokens: 2048,
    },
  });
};

export default genAI;
