"use server";

import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export async function askGemini(contents) {
  try {
    const result = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents,
    });

    return result.text || "No response from AI";
  } catch (error) {
    console.error("Gemini error:", error);
    return "Something went wrong with AI.";
  }
}