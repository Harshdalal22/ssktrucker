import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const analyzeRouteAndCosts = async (
  pickup: string,
  drop: string,
  distanceKm: number,
  truckType: string
): Promise<string> => {
  if (!apiKey) return "AI Analysis unavailable: API Key missing.";

  try {
    const prompt = `
      Act as a logistics expert for a trucking platform.
      Analyze a trip from "${pickup}" to "${drop}" with a distance of ${distanceKm}km using a ${truckType}.
      
      Provide a concise 3-sentence summary covering:
      1. Expected traffic or terrain challenges (highway vs city).
      2. Hidden costs to consider (tolls, wait times).
      3. A recommended competitive price range per km.
      
      Do not use markdown formatting. Keep it plain text.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    return response.text || "Analysis could not be generated.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "AI analysis failed. Please verify network connection.";
  }
};
