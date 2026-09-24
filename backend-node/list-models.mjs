import { env } from './src/config/env.js';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(env.ai.geminiApiKey);
const models = await genAI.listModels();
console.log('Các model có sẵn:');
for await (const m of models) {
  if (m.supportedGenerationMethods?.includes('generateContent')) {
    console.log('-', m.name);
  }
}
