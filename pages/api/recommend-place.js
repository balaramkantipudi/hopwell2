// pages/api/recommend-place.js
import { Configuration, OpenAIApi } from 'openai';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { prompt } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }
    
    // Initialize OpenAI API
    const configuration = new Configuration({
      apiKey: process.env.OPENAI_API_KEY,
    });
    const openai = new OpenAIApi(configuration);
    
    // Create a complete prompt for the OpenAI API
    const completePrompt = `
      You are a world-class travel expert with extensive knowledge of destinations worldwide.
      Based on this request: "${prompt}", recommend ONE specific travel destination.
      
      Provide your response in this exact JSON format:
      {
        "location": "City, Country",
        "caption": "A brief 1-2 sentence description",
        "fullText": "A 3-5 sentence detailed description with interesting facts"
      }

      The response must be a valid JSON object that can be parsed. Do not include any explanations or text outside of the JSON.
    `;
    
    // Call the OpenAI API
    const completion = await openai.createCompletion({
      model: "text-davinci-003",
      prompt: completePrompt,
      max_tokens: 400,
      temperature: 0.7,
    });
    
    let responseText = completion.data.choices[0].text.trim();
    
    // Clean response to ensure it's valid JSON
    if (responseText.startsWith("```json")) {
      responseText = responseText.replace(/```json\n|```/g, "");
    } else if (responseText.startsWith("```")) {
      responseText = responseText.replace(/```\n|```/g, "");
    }
    
    try {
      // Parse and validate JSON
      const destination = JSON.parse(responseText);
      
      // Ensure required fields exist
      if (!destination.location || !destination.caption || !destination.fullText) {
        throw new Error('Response missing required fields');
      }
      
      // Add a delay to show the spinning animation
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      return res.status(200).json(destination);
      
    } catch (parseError) {
      console.error('Error parsing OpenAI response:', parseError);
      console.error('Raw response:', responseText);
      
      return res.status(500).json({ 
        error: 'Failed to parse AI response',
        details: parseError.message
      });
    }
    
  } catch (error) {
    console.error('Error generating recommendation:', error);
    return res.status(500).json({ 
      error: 'Failed to generate recommendation',
      details: error.message
    });
  }
}