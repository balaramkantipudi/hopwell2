// pages/api/generate-itinerary.js
import { supabase } from '@/libs/supabase';
import { checkUserCredits, deductCredits } from '@/libs/creditSystem';

export default async function handler(req, res) {
  // Only accept POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Get the user's session
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  
  if (sessionError || !session) {
    console.error('Authentication error:', sessionError);
    return res.status(401).json({ error: 'Not authenticated. Please try again' });
  }

  try {
    const { destination, startDate, endDate, budget, interests, groupType, groupCount } = req.body;
    
    // Validate required fields
    if (!destination) {
      return res.status(400).json({ error: 'Destination is required' });
    }

    // Check if user has enough credits (1 credit per itinerary)
    const creditCheck = await checkUserCredits(session.user.id, 1);
    
    if (!creditCheck.hasEnoughCredits) {
      return res.status(403).json({ 
        error: 'Not enough credits to generate itinerary', 
        currentCredits: creditCheck.currentCredits 
      });
    }

    // Prepare the prompt for the AI
    const prompt = `Create a detailed travel itinerary for a trip to ${destination}.
      Trip dates: ${startDate ? new Date(startDate).toLocaleDateString() : 'Flexible'} to ${endDate ? new Date(endDate).toLocaleDateString() : 'Flexible'}
      Budget: ${budget || 'Moderate'}
      Group: ${groupCount || 1} ${groupType || 'people'}
      Interests: ${interests ? Array.isArray(interests) ? interests.join(', ') : interests : 'General sightseeing'}
      
      Include daily activities, restaurant recommendations, and accommodation suggestions.
      Format the response with clear headings for each day and sections for activities, dining, and accommodation.
      Also include a section with estimated budget breakdown.`;

    // DEVELOPMENT MODE - for testing, you can bypass the actual API call
    // and just return mock data to avoid using up actual API credits
    const isDevelopment = process.env.NODE_ENV === 'development';
    
    let generatedText = '';
    
    if (isDevelopment && process.env.MOCK_ITINERARY === 'true') {
      // Mock itinerary for development testing
      generatedText = `
# ${destination.toUpperCase()} ITINERARY

## DAY 1 - ARRIVAL AND ORIENTATION

### Morning
- Arrive at airport and check in to your hotel [Hotel Example](https://example.com)
- Have breakfast at a local café

### Afternoon
- Take a walking tour of the city center
- Visit the main historical sites

### Evening
- Dinner at a popular local restaurant
- Early night to recover from travel

## DAY 2 - MAIN ATTRACTIONS

### Morning
- Visit the most famous museum
- Explore the old town area

### Afternoon
- Lunch at a traditional restaurant
- Visit the landmark park and gardens

### Evening
- Fine dining experience
- Optional night entertainment

## BUDGET BREAKDOWN

- Accommodation: $XXX
- Food: $XXX
- Transportation: $XXX
- Activities: $XXX
- Miscellaneous: $XXX

## TRAVEL TIPS

- Remember to pack appropriate clothes for the weather
- Local currency information
- Transportation options from the airport
      `;
    } else {
      // Make API call to your AI service (Gemini, etc.)
      const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
      
      if (!apiKey) {
        return res.status(500).json({ error: 'API key not configured' });
      }

      // Call the AI API
      const response = await fetch('https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt
                }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 8192,
          }
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('AI API error:', errorData);
        throw new Error(`AI API error: ${errorData.error?.message || 'Unknown error'}`);
      }

      const data = await response.json();
      
      // Extract the generated text from the response
      if (data.candidates && data.candidates[0]?.content?.parts) {
        generatedText = data.candidates[0].content.parts[0].text;
      } else {
        throw new Error('Unexpected response format from AI API');
      }
    }

    // Process the text to add a title and clean up formatting
    const formattedItinerary = `# TRIP TO ${destination.toUpperCase()} - CUSTOM ITINERARY\n\n${generatedText}`;

    // Deduct credits from the user's account
    const deductResult = await deductCredits(session.user.id, 1);

    // Return the generated itinerary
    return res.status(200).json({ 
      itinerary: formattedItinerary,
      creditsRemaining: deductResult.newCreditBalance
    });
  } catch (error) {
    console.error('Error generating itinerary:', error);
    return res.status(500).json({ error: `Failed to generate itinerary: ${error.message}` });
  }
}