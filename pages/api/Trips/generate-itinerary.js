// pages/api/Trips/generate-itinerary.js
import { supabase } from '@/libs/supabase'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { injectAffiliateLinksToItineraryJSON } from '@/libs/affiliatelinks';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // JWT-based authentication
    let user;
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        console.error('Authorization header missing or malformed');
        return res.status(401).json({ error: 'Authorization header missing or malformed' });
      }
      const jwt = authHeader.split(' ')[1];
      if (!jwt) {
        console.error('Token not found in Authorization header');
        return res.status(401).json({ error: 'Token not found in Authorization header' });
      }

      const { data: userData, error: userError } = await supabase.auth.getUser(jwt);

      if (userError) {
        console.error('Supabase user auth error (getUser):', userError.message);
        throw new Error(userError.message || 'Failed to authenticate user from token');
      }
      if (!userData || !userData.user) {
        console.error('Invalid or expired token: No user data returned.');
        throw new Error('Invalid or expired token');
      }
      user = userData.user;
    } catch (error) {
      console.error('JWT Authentication error:', error.message);
      return res.status(401).json({ error: error.message || 'Invalid or expired token' });
    }
    
    const userId = user.id; // Retain for potential logging or future credit use

    // 1. Change Request Body Expectation & Basic Validation
    const {
      destination,
      startDate: startDateString, // Renaming to avoid conflict with Date object
      endDate: endDateString,     // Renaming to avoid conflict with Date object
      budget,
      interests, // Expected as an array
      groupType,
      groupCount,
      origin,
      transportMode,
      hotelStyle,
      cuisine,
      // theme, // This will be derived from interests
      priority
    } = req.body;

    if (!destination) {
      return res.status(400).json({ error: 'Destination is required' });
    }
    if (!startDateString || !endDateString) {
      return res.status(400).json({ error: 'Start date and end date are required' });
    }
    // Add more validations as needed

    // 2. Remove Database Fetch (already done by removing the block)

    // Initialize Gemini
    let model;
    try {
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    } catch (error) {
        console.error('Gemini API initialization error:', error.message, error.stack);
        return res.status(500).json({ error: "AI provider setup failed." });
    }

    // 3. Construct tripInfo from req.body
    const themeStringFromInterests = (Array.isArray(interests) && interests.length > 0 ? interests.join(', ') : '');

    const tripInfo = {
      destination,
      origin,
      transportMode,
      startDate: startDateString,
      endDate: endDateString,
      hotelStyle,
      cuisine,
      theme: themeStringFromInterests, // Use processed interests for theme
      groupType,
      groupCount,
      budget,
      priority,
    };

    // 5. Calculate tripDuration from req.body
    const startDateObj = new Date(startDateString);
    const endDateObj = new Date(endDateString);
    const tripDuration = Math.ceil((endDateObj - startDateObj) / (1000 * 60 * 60 * 24));
    if (isNaN(tripDuration) || tripDuration < 0) {
        return res.status(400).json({ error: 'Invalid start or end date, resulting in invalid trip duration.' });
    }

    // Create prompt for Gemini
    const prompt = `
      Create a detailed travel itinerary with the following preferences:
      - Destination: ${tripInfo.destination}
      - Origin: ${tripInfo.origin || 'Not specified'}
      - Mode of Transport: ${tripInfo.transportMode || 'Any'}
      - Trip Duration: ${tripDuration} days (from ${startDateObj.toLocaleDateString()} to ${endDateObj.toLocaleDateString()})
      - Accommodation Style: ${tripInfo.hotelStyle || 'Any'}
      - Cuisine Preferences: ${tripInfo.cuisine || 'Any'}
      - Trip Theme: ${tripInfo.theme || 'General'}
      - Group Type: ${tripInfo.groupType || 'Any'} (${tripInfo.groupCount || 1} people)
      - Budget per Person: $${tripInfo.budget || 'Moderate'}
      - Priority: ${tripInfo.priority || 'Balanced'}

      Please provide:
      1. A day-by-day itinerary with specific activities, times, and locations
      2. Recommended accommodations with prices
      3. Transportation options between locations with estimated costs
      4. Restaurant recommendations for each day
      5. Estimated total cost breakdown

      Format your response as a structured JSON object with the following format:
      {
        "itinerary": [
          {
            "date": "YYYY-MM-DD",
            "activities": [
              {
                "time": "HH:MM",
                "title": "Activity name",
                "description": "Brief description",
                "location": {
                  "name": "Location name",
                  "address": "Address"
                },
                "duration": minutes,
                "type": "activity type",
                "cost": cost in USD
              }
            ]
          }
        ],
        "accommodations": [
          {
            "name": "Accommodation name",
            "location": {
              "name": "Location name",
              "address": "Address"
            },
            "checkIn": "YYYY-MM-DD",
            "checkOut": "YYYY-MM-DD",
            "pricePerNight": price in USD,
            "totalPrice": total price in USD,
            "roomType": "Room type",
            "amenities": ["amenity1", "amenity2"],
            "rating": rating out of 5
          }
        ],
        "transportation": [
          {
            "type": "transportation type",
            "from": {
              "name": "Origin name"
            },
            "to": {
              "name": "Destination name"
            },
            "departureTime": "YYYY-MM-DDTHH:MM:SS",
            "arrivalTime": "YYYY-MM-DDTHH:MM:SS",
            "provider": "Provider name",
            "price": price in USD
          }
        ],
        "totalCost": total cost in USD
      }
    `;

    // Generate content using Gemini
    let text;
    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      if (!response || typeof response.text !== 'function') {
        // Log the entire response object if it's not as expected
        console.error('Unexpected response structure from AI provider:', response);
        throw new Error('Unexpected response structure from AI provider.');
      }
      text = response.text();
    } catch (error) {
      console.error('Gemini API request error:', error.message, error.stack);
      // Check if the error has a more specific message or status code from the API
      const errorMessage = error.response && error.response.data && error.response.data.error ? error.response.data.error.message : error.message;
      return res.status(502).json({ error: `AI provider request failed. Please try again later. Details: ${errorMessage}` });
    }

    let itineraryJSON;
    try {
      // Clean the text response by removing ```json and ```
      const cleanedText = text.replace(/^```json\s*|```\s*$/g, '');
      itineraryJSON = JSON.parse(cleanedText);
    } catch (parseError) {
      console.error('Failed to parse itinerary data from AI provider. Raw output for parsing error:', text); // Log raw text on parsing error
      return res.status(500).json({ error: 'Failed to parse itinerary data from AI provider. Raw output logged.' });
    }
    
    // 4. Construct tripDetailsForAffiliates from req.body
  const tripDetailsForAffiliates = {
    destination,
    origin,
    startDate: startDateString,
    endDate: endDateString,
    groupCount
  };
  console.log('[generate-itinerary] Passing to injectAffiliateLinksToItineraryJSON - itineraryJSON (first 200 chars):', JSON.stringify(itineraryJSON).substring(0, 200));
  console.log('[generate-itinerary] Passing to injectAffiliateLinksToItineraryJSON - tripDetailsForAffiliates:', JSON.stringify(tripDetailsForAffiliates, null, 2));
  const enhancedItinerary = injectAffiliateLinksToItineraryJSON(itineraryJSON, tripDetailsForAffiliates);
  
    // 6. Remove Database Update (already done by removing the block)

    // 7. Modify Return Value
    return res.status(200).json({
      success: true,
      message: 'Itinerary generated successfully',
      itineraryData: enhancedItinerary // Return the generated itinerary directly
    });
  } catch (error) {
    // Log specific user ID if available from auth, for better tracking
    console.error(`Generate itinerary error for user ${userId || 'Unknown'}:`, error.message, error.stack);
    return res.status(500).json({ error: 'An unexpected server error occurred.' });
  }
}