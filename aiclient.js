import OpenAI from 'openai';

function createAIClient() {
  return new OpenAI({
    apiKey: process.env.LLM_API_KEY,
    baseURL: process.env.LLM_API_URL || 'http://localhost:11434/v1',
  });
}

// Usage in your CLI:
const ai = createAIClient();

export async function chat(message) {
    
    const response = await ai.responses.create({
        model: process.env.LLM_MODEL,
        input: message,
    });

   return response.output_text

}
