"use server";

import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export async function askGemini(message) {
  try {
    const result = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: message, // ✅ STRING
    });

    return result.text;
  } catch (error) {
    console.error("Gemini error:", error);
    return "Something went wrong with AI.";
  }
}