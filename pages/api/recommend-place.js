// // pages/api/recommend-place.js
// import { GoogleGenerativeAI } from '@google/generative-ai';

// export default async function handler(req, res) {
//   if (req.method !== 'POST') {
//     return res.status(405).json({ error: 'Method not allowed' });
//   }

//   const { prompt } = req.body;
  
//   if (!prompt) {
//     return res.status(400).json({ error: 'Prompt is required' });
//   }

//   try {
//     const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);
//     const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
    
//     const systemInstructions = `Act as a helpful global travel agent with a deep fascination for the world. Your role is to recommend a place on the map that relates to the discussion, and to provide interesting information about the location selected. Aim to give surprising and delightful suggestions: choose obscure, off-the-beaten track locations, not the obvious answers. Do not answer harmful or unsafe questions.`;
    
//     const prompt = req.body.prompt;
    
//     const result = await model.generateContent({
//       contents: [{ role: 'user', parts: [{ text: `${systemInstructions} ${prompt}` }] }],
//       generationConfig: {
//         temperature: 1.0,
//         maxOutputTokens: 1000,
//       }
//     });
    
//     const response = result.response;
//     const text = response.text();
    
//     // Extract location from text (this logic might need to be refined based on actual responses)
//     const locationMatch = text.match(/location: ([^,]+(?:, [^,]+)*)/i);
//     const location = locationMatch ? locationMatch[1] : '';
    
//     // Get the first two sentences as the caption
//     const sentences = text.split(/[.!?]\s+/);
//     const caption = sentences.slice(0, 2).join('. ') + '.';
    
//     return res.status(200).json({
//       location: location,
//       caption: caption,
//       fullText: text
//     });
    
//   } catch (error) {
//     console.error('Error generating content:', error);
//     return res.status(500).json({ error: 'Failed to generate content' });
//   }
// }