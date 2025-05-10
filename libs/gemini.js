// libs/gemini.js
import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * Generate a travel itinerary using Google's Gemini API
 * @param {Object} data - Travel preferences data
 * @returns {Promise<string>} - The generated itinerary text
 */
export async function generateItinerary(data) {
  // Initialize the Gemini API client
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  
  // Use a more capable model
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
  
  // Calculate trip duration
  const startDate = new Date(data.startDate);
  const endDate = new Date(data.endDate);
  const tripDuration = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) || 1;

  // Create a detailed prompt with trip preferences
  const prompt = `As an expert travel planner, create a detailed ${tripDuration}-day trip itinerary for a traveler with the following preferences:

TRAVELER PREFERENCES:
- Destination: ${data.destination}
- Origin: ${data.origin}
- Transportation: ${data.transportMode || 'Not specified'}
- Travel Dates: ${startDate.toLocaleDateString()} to ${endDate.toLocaleDateString()} (${tripDuration} days)
- Accommodation Style: ${data.hotelStyle || 'Not specified'}
- Cuisine Preferences: ${data.cuisine || 'Not specified'}
- Trip Theme: ${data.theme || 'Not specified'}
- Group Type: ${data.groupType || 'Not specified'} (${data.groupCount || 1} people)
- Budget: $${data.budget || 'Flexible'}
- Priority: ${data.priority || 'Not specified'}

Please create a comprehensive day-by-day itinerary including:
1. A summary of the trip at the beginning
2. Detailed day-by-day plans with morning, afternoon, and evening activities
3. Recommended accommodations with price estimates and affiliate booking links (use placeholder links for now)
4. Transportation options and costs
5. Restaurant recommendations for each day
6. Estimated budget breakdown (accommodations, food, activities, transportation)

Format the itinerary in a well-structured, easy-to-read format with day headings, time blocks, and sections for different components.`;

  try {
    // Call Gemini API
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const itinerary = response.text();
    
    return itinerary;
  } catch (error) {
    console.error('Gemini API Error:', error);
    throw new Error('Failed to generate itinerary: ' + error.message);
  }
}

// pages/api/generateItinerary.js
import { generateItinerary } from '@/libs/gemini';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const data = req.body;
    
    // Validate required fields
    if (!data.destination || !data.startDate || !data.endDate) {
      return res.status(400).json({ error: 'Missing required trip information' });
    }

    // Generate itinerary
    const itineraryText = await generateItinerary(data);
    
    // Return the generated itinerary
    return res.status(200).json({ text: itineraryText });
    
  } catch (error) {
    console.error('Itinerary generation error:', error);
    return res.status(500).json({ error: 'Failed to generate itinerary' });
  }
}