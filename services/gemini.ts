
import { GoogleGenAI, Type } from "@google/genai";
import { Language, Recommendation } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Provides agriculture-related recommendations based on user language and context.
 * Using gemini-3-pro-preview for higher quality reasoning in complex text tasks.
 */
export async function getRecommendations(language: Language, context: string = "general crop management"): Promise<Recommendation[]> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: `Suggest 3 agriculture-related loans, govt schemes, or farming laws for a farmer in India. Use the language code: ${language}. Context: ${context}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              description: { type: Type.STRING },
              type: { type: Type.STRING, enum: ['LOAN', 'SCHEME', 'LAW'] },
              link: { type: Type.STRING }
            },
            required: ["title", "description", "type", "link"]
          }
        }
      }
    });
    // Safely extract and parse the JSON response text.
    const text = response.text?.trim() || "[]";
    return JSON.parse(text);
  } catch (error) {
    console.error("Gemini Recommendations Error:", error);
    return [];
  }
}

/**
 * Translates a given text into the target language.
 */
export async function translateText(text: string, targetLanguage: Language): Promise<string> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Translate the following text to ${targetLanguage}: "${text}". Return only the translated text.`,
    });
    return response.text?.trim() || text;
  } catch (error) {
    console.error("Translation error:", error);
    return text;
  }
}

/**
 * Processes natural language voice commands and maps them to app actions.
 */
export async function processVoiceCommand(command: string, language: Language): Promise<{ action: string; feedback: string }> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `The user said: "${command}" in ${language}. Interpret this as a command for a farming app. 
      Possible actions: "NAVIGATE_MARKET", "NAVIGATE_INVENTORY", "NAVIGATE_LOANS", "ADD_CROP", "UNKNOWN".
      Return a JSON object with 'action' and a friendly 'feedback' message in ${language}.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            action: { type: Type.STRING },
            feedback: { type: Type.STRING }
          },
          required: ["action", "feedback"]
        }
      }
    });
    const text = response.text?.trim() || '{"action": "UNKNOWN", "feedback": "Sorry, I encountered an error."}';
    return JSON.parse(text);
  } catch (error) {
    console.error("Voice Command Error:", error);
    return { action: "UNKNOWN", feedback: "I didn't quite catch that." };
  }
}