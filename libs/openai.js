// libs/openai.js
import OpenAI from 'openai';

// Initialize the OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Generate a travel itinerary using OpenAI
 * @param {Object} data - Travel preferences data
 * @returns {Promise<string>} - The generated itinerary text
 */
export async function generateItinerary(data) {
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
3. Recommended accommodations with price estimates and affiliate booking links
4. Transportation options and costs
5. Restaurant recommendations for each day
6. Estimated budget breakdown (accommodations, food, activities, transportation)

Format the itinerary in a well-structured, easy-to-read format with day headings, time blocks, and sections for different components.`;

  try {
    // Call OpenAI API
    const response = await openai.chat.completions.create({
      model: "gpt-4", // Use GPT-4 for more detailed planning
      messages: [
        {
          role: "system",
          content: "You are an expert travel planner who creates detailed, personalized travel itineraries."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 4000, // Adjust based on expected response length
    });

    // Extract the generated text
    const itinerary = response.choices[0].message.content;
    return itinerary;

  } catch (error) {
    console.error('OpenAI API Error:', error);
    throw new Error('Failed to generate itinerary: ' + error.message);
  }
}

// pages/api/generateItinerary.js
import { generateItinerary } from '@/libs/openai';

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