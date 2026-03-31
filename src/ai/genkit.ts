import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || '';

if (!GEMINI_API_KEY) {
  console.warn('WARNING: GEMINI_API_KEY is not set in environment variables. AI features will use fallback logic.');
}

export const ai = genkit({
  plugins: [googleAI({ apiKey: GEMINI_API_KEY || 'unconfigured' })],
  model: 'googleai/gemini-1.5-flash',
});
