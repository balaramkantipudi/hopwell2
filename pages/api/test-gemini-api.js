// pages/api/test-gemini.js
import { GoogleGenerativeAI } from '@google/generative-ai';

export default async function handler(req, res) {
  // Set headers for proper response
  res.setHeader('Content-Type', 'application/json');
  
  try {
    console.log('Testing Gemini API connection...');
    
    // Check for Gemini API key
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing API key',
        message: 'The GEMINI_API_KEY environment variable is not set'
      });
    }

    // Log the API key format (first 4 chars only) for debugging
    console.log('API key format:', apiKey.substring(0, 4) + '...');

    // Initialize the Gemini AI
    const genAI = new GoogleGenerativeAI(apiKey);
    
    // List available models to ensure we're using a valid one
    console.log('Listing available models...');
    try {
      const modelList = await genAI.listModels();
      console.log('Available models:', modelList);
    } catch (listError) {
      console.log('Could not list models:', listError.message);
    }
    
    // Try alternative model names
    const modelAttempts = [
      'gemini-pro',
      'gemini-1.0-pro',
      'gemini-1.5-pro',
      'gemini-1.5-flash'
    ];
    
    let responseText = null;
    let modelUsed = null;
    
    // Try each model until one works
    for (const modelName of modelAttempts) {
      try {
        console.log(`Attempting to use model: ${modelName}`);
        
        // Get the model
        const model = genAI.getGenerativeModel({ model: modelName });
        
        // Create a simple test prompt
        const prompt = "What's the capital of France? Keep your answer to one word only.";
        
        // Generate content
        console.log('Sending test prompt to Gemini API...');
        const result = await model.generateContent(prompt);
        const response = await result.response;
        responseText = response.text();
        modelUsed = modelName;
        
        console.log('Received response from Gemini API:', responseText);
        
        // If we got a response, break the loop
        if (responseText) break;
      } catch (modelError) {
        console.log(`Error with model ${modelName}:`, modelError.message);
      }
    }
    
    // If we got a response, return success
    if (responseText) {
      return res.status(200).json({
        success: true,
        message: 'Gemini API is working correctly',
        response: responseText,
        modelUsed: modelUsed
      });
    } else {
      // If none of the model attempts worked
      throw new Error('All model attempts failed');
    }
    
  } catch (error) {
    console.error('Gemini API test failed:', error);
    
    // Return detailed error information
    return res.status(500).json({
      success: false,
      error: 'Gemini API test failed',
      message: error.message,
      stack: error.stack,
      details: 'Check your API key and network connection, or try using a different Gemini model version'
    });
  }
}