// pages/api/Trips/generate-itinerary.js
import { supabase } from '@/libs/supabase'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { injectAffiliateLinksToItineraryJSON } from '@/libs/affiliatelinks';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get user from Supabase session
    let session, authError;
    try {
      const sessionResult = await supabase.auth.getSession();
      session = sessionResult.data.session;
      authError = sessionResult.error;
      if (authError) throw authError;
      if (!session) throw new Error('Not authenticated');
    } catch (error) {
      console.error('Supabase auth error:', error);
      return res.status(401).json({ error: 'Not authenticated' });
    }
    
    const userId = session.user.id;
    const { tripId } = req.body;
    
    if (!tripId) {
      return res.status(400).json({ error: 'Trip ID is required' });
    }

    // Find the trip in Supabase
    let trip;
    try {
      const { data: tripData, error: tripError } = await supabase
        .from('trips')
        .select('*')
        .eq('id', tripId)
        .eq('user_id', userId)
        .single();
      if (tripError) throw tripError;
      if (!tripData) throw new Error('Trip not found');
      trip = tripData;
    } catch (error) {
      console.error('Supabase error fetching trip:', error.message);
      return res.status(500).json({ error: `Database error: ${error.message || 'Failed to fetch trip details.'}` });
    }

    // Initialize Gemini
    let model;
    try {
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    } catch (error) {
        console.error('Gemini API initialization error:', error.message, error.stack);
        return res.status(500).json({ error: "AI provider setup failed." });
    }

    // Format trip data for Gemini
    const tripInfo = {
      destination: trip.destination,
      origin: trip.origin,
      transportMode: trip.transportMode,
      startDate: trip.startDate,
      endDate: trip.endDate,
      hotelStyle: trip.hotelStyle,
      cuisine: trip.cuisine,
      theme: trip.theme,
      groupType: trip.groupType,
      groupCount: trip.groupCount,
      budget: trip.budget,
      priority: trip.priority,
    };

    // Calculate trip duration in days
    const startDate = new Date(trip.startDate);
    const endDate = new Date(trip.endDate);
    const tripDuration = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));

    // Create prompt for Gemini
    const prompt = `
      Create a detailed travel itinerary with the following preferences:
      - Destination: ${tripInfo.destination}
      - Origin: ${tripInfo.origin}
      - Mode of Transport: ${tripInfo.transportMode}
      - Trip Duration: ${tripDuration} days (from ${startDate.toLocaleDateString()} to ${endDate.toLocaleDateString()})
      - Accommodation Style: ${tripInfo.hotelStyle}
      - Cuisine Preferences: ${tripInfo.cuisine}
      - Trip Theme: ${tripInfo.theme}
      - Group Type: ${tripInfo.groupType} (${tripInfo.groupCount} people)
      - Budget per Person: $${tripInfo.budget}
      - Priority: ${tripInfo.priority}

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
    
  // Inject affiliate links
  const tripDetailsForAffiliates = {
    destination: trip.destination,
    origin: trip.origin, // Pass origin
    startDate: trip.startDate,
    endDate: trip.endDate,
    groupCount: trip.groupCount
  };
  const enhancedItinerary = injectAffiliateLinksToItineraryJSON(itineraryJSON, tripDetailsForAffiliates);
  
  let updatedTrip;
  try {
    const { data, error: updateError } = await supabase
        .from('trips')
        .update({
          itinerary: enhancedItinerary.itinerary,
          accommodations: enhancedItinerary.accommodations,
          transportation: enhancedItinerary.transportation,
          total_cost: enhancedItinerary.totalCost,
          status: 'generated',
          updated_at: new Date().toISOString()
        })
        .eq('id', tripId)
        .select(); // Ensure select() is called to get the updated record
      if (updateError) throw updateError;
      if (!data || data.length === 0) throw new Error('Failed to retrieve updated trip data.');
      updatedTrip = data[0];
  } catch (error) {
    console.error('Supabase error updating trip:', error.message);
    return res.status(500).json({ error: `Database error: ${error.message || 'Failed to update trip.'}` });
  }
    
    return res.status(200).json({
      success: true,
      message: 'Itinerary generated successfully',
      trip: updatedTrip
    });
  } catch (error) {
    console.error('Generate itinerary error - Unhandled:', error.message, error.stack);
    return res.status(500).json({ error: 'An unexpected server error occurred.' });
  }
}