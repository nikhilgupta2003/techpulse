import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;

export const summarizeBlog = async (content: string) => {
  if (!apiKey) {
    throw new Error("Gemini API key is not configured.");
  }

  const ai = new GoogleGenAI({ apiKey });
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Please summarize the following blog post in a concise and engaging way. Use bullet points for key takeaways.
      
      Blog Content:
      ${content}`,
      config: {
        systemInstruction: "You are a helpful assistant that summarizes technical blog posts for busy readers.",
      },
    });

    return response.text;
  } catch (error) {
    console.error("Gemini Summarization Error:", error);
    throw error;
  }
};
