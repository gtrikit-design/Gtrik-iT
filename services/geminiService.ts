
import { GoogleGenAI, Type, Schema } from "@google/genai";
import { MetadataSettings, GeneratedMetadata, Platform } from "../types";

const getAIClient = (apiKey: string) => {
  if (!apiKey) {
    throw new Error("API Key is missing. Please add your API Key in the Profile menu.");
  }
  return new GoogleGenAI({ apiKey });
};

// Helper function to retry API calls on 429 errors
const callWithRetry = async <T>(fn: () => Promise<T>, retries = 3, initialDelay = 2000): Promise<T> => {
  let lastError: any;
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;
      // Check for rate limit error codes (429) or standard Google API error structures
      const isRateLimit = 
        error.status === 429 || 
        error.code === 429 || 
        (error.message && error.message.includes('429')) ||
        (error.error && error.error.code === 429);

      if (isRateLimit && i < retries - 1) {
        const waitTime = initialDelay * Math.pow(2, i); // Exponential backoff: 2s, 4s, 8s
        console.warn(`Rate limit hit. Retrying in ${waitTime}ms... (Attempt ${i + 1}/${retries})`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
        continue;
      }
      throw error;
    }
  }
  throw lastError;
};

const prepareDataPart = (fileData: string, isEPS: boolean) => {
  if (isEPS) {
    const base64Content = fileData.split(',')[1];
    const textContent = atob(base64Content);
    const truncatedText = textContent.substring(0, 30000); 
    return { text: `[EPS FILE CONTENT START]\n${truncatedText}\n[EPS FILE CONTENT END]` };
  } else {
    // Extract the real mime type (e.g., image/png) to preserve transparency info for the AI
    const match = fileData.match(/^data:(image\/[a-zA-Z+]+);base64,/);
    const mimeType = match ? match[1] : 'image/jpeg';
    const cleanBase64 = fileData.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, "");
    
    return { inlineData: { mimeType: mimeType, data: cleanBase64 } };
  }
};

const getPlatformInstructions = (platform: Platform): string => {
  switch (platform) {
    case Platform.AdobeStock:
      return `
        PLATFORM SPECIFIC: Adobe Stock.
        - **CRITICAL: Keyword Order Matters.** The most relevant keywords MUST be first.
        - Title: Concise, "Subject + Action/Context". Keep it between 5-15 words. 
        - Avoid "A photo of" or "Vector of".
        - Do not include camera specs.
        - Keywords: Max 49. Single words preferred.
      `;
    case Platform.Shutterstock:
      return `
        PLATFORM SPECIFIC: Shutterstock.
        - Title (Description): Must be descriptive and written as a sentence. Min 5 words.
        - Avoid "A photo of".
        - Include specific details about the subject, action, and location.
        - Keywords: Can include synonyms and conceptual terms. Max 50.
      `;
    case Platform.Freepik:
      return `
        PLATFORM SPECIFIC: Freepik.
        - Style: Commercial, trendy, modern.
        - Keywords: Focus on design utility (e.g., "banner", "template", "poster") if applicable.
        - Max 50 keywords.
      `;
    case Platform.Vecteezy:
      return `
        PLATFORM SPECIFIC: Vecteezy.
        - Title: Descriptive but concise.
        - Description: Should describe the visual composition.
        - Focus on technical keywords for vectors (e.g., "vector", "illustration", "flat design").
      `;
    case Platform.Depositphotos:
    case Platform.RF123:
    case Platform.Dreamstime:
      return `
        PLATFORM SPECIFIC: ${platform}.
        - Standard microstock requirements. 
        - Clear, search-friendly English.
        - Dreamstime: Title min 5 words, Description min 5 words.
      `;
    case Platform.General:
    default:
      return `
        PLATFORM: General/Multi-upload.
        - Create a balanced metadata set suitable for all major agencies.
        - Max 50 keywords.
      `;
  }
};

export const generateMetadata = async (
  fileData: string, 
  settings: MetadataSettings,
  platform: Platform,
  isEPS: boolean,
  apiKey: string
): Promise<GeneratedMetadata> => {
  
  // YIELD TO EVENT LOOP to prevent UI freeze during heavy batch processing
  await new Promise(resolve => setTimeout(resolve, 0));

  const ai = getAIClient(apiKey);
  const dataPart = prepareDataPart(fileData, isEPS);

  // Construct specific instructions based on settings
  let backgroundInstruction = "";
  if (settings.transparentBackground) {
    backgroundInstruction = `
      CRITICAL INSTRUCTION: This image has a transparent background. 
      1. The Title MUST explicitly include the phrase "Transparent Background" or "Isolated".
      2. Do NOT describe the background as black, dark, or white, even if the preview looks that way.
    `;
  }

  let silhouetteInstruction = "";
  if (settings.silhouette) {
    silhouetteInstruction = `
      CRITICAL INSTRUCTION: This is a silhouette image/vector.
      1. The Title MUST explicitly include the word "Silhouette".
      2. Ensure keywords include "silhouette", "shadow", "black", "shape".
    `;
  }

  const platformSpecifics = getPlatformInstructions(platform);

  const prompt = `
    You are an expert stock photography contributor assistant for ${platform}.
    ${isEPS ? "Analyze the provided EPS file content (PostScript code). Extract relevant keywords and description." : "Analyze the provided image."}
    Generate metadata optimized for search engine visibility and sales on this specific platform.

    ${platformSpecifics}

    Constraints:
    - Title length: Between ${settings.minTitleWords} and ${settings.maxTitleWords} words.
    - Description length: Between ${settings.minDescWords} and ${settings.maxDescWords} words.
    - **CRITICAL CONSTRAINT**: The generated Description MUST be strictly under 200 characters in length (total characters, not words). Override the word count constraint if necessary to meet this character limit. Be concise.
    - Number of Keywords: Between ${settings.minKeywords} and ${settings.maxKeywords}.
    
    Settings:
    - Single Word Keywords: ${settings.singleWordKeywords ? "Prefer single words" : "Allow phrases"}.
    - Custom Prompt: ${settings.customPrompt}.
    - Prohibited Words Filter: ${settings.prohibitedWords}.
    
    ${backgroundInstruction}
    ${silhouetteInstruction}

    Output must be strict JSON.
  `;

  const responseSchema: Schema = {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING, description: "SEO optimized title for the image" },
      description: { type: Type.STRING, description: "Detailed description for the image, under 200 characters" },
      keywords: { 
        type: Type.ARRAY, 
        items: { type: Type.STRING },
        description: "List of relevant keywords, sorted by relevance"
      }
    },
    required: ["title", "description", "keywords"]
  };

  return callWithRetry(async () => {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          dataPart,
          { text: prompt }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        temperature: 0.3,
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as GeneratedMetadata;
    } else {
      throw new Error("No response text generated");
    }
  });
};

export const generateImagePrompt = async (
  fileData: string,
  isEPS: boolean,
  apiKey: string
): Promise<string> => {
  
  // YIELD TO EVENT LOOP to prevent UI freeze during heavy batch processing
  await new Promise(resolve => setTimeout(resolve, 0));

  const ai = getAIClient(apiKey);
  const dataPart = prepareDataPart(fileData, isEPS);

  const prompt = `
    Act as an expert Prompt Engineer.
    Analyze this image/file and reverse-engineer the original text-to-image prompt that could have generated it.
    Provide a highly detailed, descriptive prompt including subject, style, lighting, camera angle, and artistic influences.
    Do not include introductions like "Here is the prompt". Just output the prompt text directly.
  `;

  return callWithRetry(async () => {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          dataPart,
          { text: prompt }
        ]
      },
      config: {
        temperature: 0.7,
      }
    });

    return response.text || "Failed to generate prompt.";
  });
};