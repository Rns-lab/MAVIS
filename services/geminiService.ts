import { GoogleGenAI } from "@google/genai";
import { LOVABLE_PROMPT_DIRECTORY } from '../constants';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const getSystemInstruction = (): string => {
  return `
You are a world-class prompt engineer. Your task is to take a user's plain text prompt and improve it for clarity, detail, and effectiveness for a large language model. 
If the prompt mentions creating features for a 'Lovable app', you MUST use the provided 'Lovable Prompt Directory' as your knowledge base to create a highly specific and relevant prompt.
After enhancing the prompt, you MUST format the final, improved prompt into the following strict XML format. 
Do not include any other text, explanation, or markdown formatting outside of the XML structure. Your entire response must be only the XML.

XML Format:
<prompt>
  <title>[A concise, descriptive title for the prompt]</title>
  <description>[A brief, one-sentence description of the prompt's goal]</description>
  <context>[Provide any necessary background or context for the prompt. If using the Lovable directory, mention which section it relates to.]</context>
  <body><![CDATA[The full, enhanced, multi-line prompt text goes here. Be detailed and specific.]]></body>
</prompt>

---
Lovable Prompt Directory:
${LOVABLE_PROMPT_DIRECTORY}
---
`;
};


export const enhanceAndTranslatePrompt = async (userPrompt: string, modelType: 'flash' | 'pro'): Promise<string> => {
  const model = modelType === 'pro' ? 'gemini-2.5-pro' : 'gemini-2.5-flash';
  const config = modelType === 'pro' ? { thinkingConfig: { thinkingBudget: 32768 } } : {};
  const systemInstruction = getSystemInstruction();

  try {
    const response = await ai.models.generateContent({
        model,
        contents: userPrompt,
        config: {
            ...config,
            systemInstruction
        }
    });

    const text = response.text;
    if (!text) {
        throw new Error('Received an empty response from the API.');
    }
    
    const xmlMatch = text.match(/<prompt>[\s\S]*<\/prompt>/);
    if (xmlMatch) {
      return xmlMatch[0];
    }

    throw new Error('Failed to generate a valid XML response.');

  } catch (error) {
    console.error("Gemini API Error:", error);
    if (error instanceof Error) {
        return Promise.reject(new Error(`Failed to communicate with Gemini API: ${error.message}`));
    }
    return Promise.reject(new Error("An unknown error occurred while calling the Gemini API."));
  }
};

export const getConfirmationMessage = async (userEdits: string): Promise<string> => {
    const systemInstruction = `You are a helpful assistant. A user has provided a list of edits for an XML document. Your task is to summarize these edits clearly and concisely, then ask for confirmation. Frame the response as if you are confirming your understanding before proceeding. Keep your summary brief.`;
    const prompt = `Here are the user's requested edits: "${userEdits}". \n\nPlease summarize these changes and ask for confirmation. For example: "Okay, so you want me to change the title and add a section about authentication. Is that correct?"`;
    
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: { systemInstruction }
        });
        const text = response.text;
        if (!text) {
            throw new Error('Received an empty response from the API.');
        }
        return text;
    } catch (error) {
        console.error("Gemini API Error (getConfirmationMessage):", error);
        throw new Error('Failed to get confirmation message.');
    }
};

export const refineXml = async (originalXml: string, userEdits: string): Promise<string> => {
    const systemInstruction = `You are a world-class prompt engineer acting as an XML document editor. You will be given an existing XML document and a set of instructions from the user on how to modify it.
    Your task is to apply the user's edits to the original XML and output only the new, complete, and valid XML document.
    Do not add any explanations, comments, or text outside of the final XML structure. Your entire response must be the revised XML.`;
    const prompt = `
        Original XML:
        \`\`\`xml
        ${originalXml}
        \`\`\`

        User's requested edits:
        "${userEdits}"

        Please provide the new, updated XML document based on these edits.
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: prompt,
            config: { systemInstruction, thinkingConfig: { thinkingBudget: 32768 } }
        });

        const text = response.text;
        if (!text) {
            throw new Error('Received an empty response from the API.');
        }
        
        const xmlMatch = text.match(/<prompt>[\s\S]*<\/prompt>/);
        if (xmlMatch) {
          return xmlMatch[0];
        }

        throw new Error('Failed to generate a valid revised XML response.');

    } catch (error) {
        console.error("Gemini API Error (refineXml):", error);
        throw new Error('Failed to refine XML.');
    }
};


export const getStartupIdeas = async (): Promise<string> => {
    const prompt = `
        Analyze the content of the website problemhunt.pro and generate a list of 5 unique startup or project ideas based on the problems listed there.
        Format your response as a numbered list, with each idea on a new line. Do not include any other text, titles, or explanation before or after the list.
        Each idea should be a concise phrase.
        Example:
        1. AI-powered meal planner for dietary restrictions
        2. A platform for local skill-sharing workshops
        3. Subscription box for eco-friendly cleaning products
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                tools: [{ googleSearch: {} }],
            },
        });

        const text = response.text;
        if (!text) {
            throw new Error('Received an empty response from the API when fetching ideas.');
        }

        return text;

    } catch (error) {
        console.error("Gemini API Error (getStartupIdeas):", error);
        if (error instanceof Error) {
            return Promise.reject(new Error(`Failed to get startup ideas: ${error.message}`));
        }
        return Promise.reject(new Error("An unknown error occurred while fetching startup ideas."));
    }
};