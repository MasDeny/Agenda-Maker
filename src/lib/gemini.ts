import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export interface AgendaItem {
  time: string;
  topic: string;
  duration: string;
  stakeholders: string[];
  description: string;
}

export interface MeetingAgenda {
  title: string;
  stakeholders: string[];
  items: AgendaItem[];
  summary: string;
}

export async function generateAgendaFromDoc(fileData: string, mimeType: string): Promise<MeetingAgenda> {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: [
      {
        parts: [
          {
            inlineData: {
              data: fileData,
              mimeType: mimeType,
            },
          },
          {
            text: "Analyze the attached document and create a structured meeting agenda. Identify the key stakeholders, the topics to cover, and suggest a time allocation for each topic. Format the output as a JSON object matching the provided schema.",
          },
        ],
      },
    ],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          stakeholders: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
          summary: { type: Type.STRING },
          items: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                time: { type: Type.STRING, description: "Start time or sequence (e.g. 09:00 AM or Item 1)" },
                topic: { type: Type.STRING },
                duration: { type: Type.STRING, description: "Estimated duration (e.g. 15 mins)" },
                stakeholders: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
                description: { type: Type.STRING },
              },
              required: ["time", "topic", "duration", "stakeholders", "description"],
            },
          },
        },
        required: ["title", "stakeholders", "items", "summary"],
      },
    },
  });

  try {
    return JSON.parse(response.text || "{}") as MeetingAgenda;
  } catch (e) {
    console.error("Failed to parse agenda JSON", e);
    throw new Error("Failed to generate a valid agenda structure.");
  }
}
