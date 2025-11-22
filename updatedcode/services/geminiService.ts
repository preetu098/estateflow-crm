import { GoogleGenAI, Type } from "@google/genai";
import { Lead } from "../types";

const GEMINI_API_KEY = process.env.API_KEY || ''; // Ensure this is set in your environment
const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

export interface AIAnalysisResult {
  score: number;
  summary: string;
  suggestedAction: string;
}

export const analyzeLeadWithAI = async (lead: Lead): Promise<AIAnalysisResult | null> => {
  if (!GEMINI_API_KEY) {
    console.warn("Gemini API Key is missing.");
    return null;
  }

  const prompt = `
    You are an expert Real Estate CRM assistant. Analyze the following lead data and remarks history to determine:
    1. A lead quality score (0-100), where 100 is "Ready to Buy" and 0 is "Junk/Lost".
    2. A concise summary of the lead's status and intent (max 2 sentences).
    3. A suggested next action for the sales agent.

    Lead Data:
    - Name: ${lead.name}
    - Project: ${lead.project}
    - Current Stage: ${lead.stage}
    - Call Count: ${lead.callCount}
    - Remarks History: ${JSON.stringify(lead.remarksHistory.map(r => `${r.timestamp}: ${r.text}`))}
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.NUMBER, description: "Lead score between 0 and 100" },
            summary: { type: Type.STRING, description: "Short summary of the lead situation" },
            suggestedAction: { type: Type.STRING, description: "Recommended next step for the agent" }
          },
          required: ["score", "summary", "suggestedAction"]
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as AIAnalysisResult;
    }
    return null;
  } catch (error) {
    console.error("Error analyzing lead with AI:", error);
    return null;
  }
};
