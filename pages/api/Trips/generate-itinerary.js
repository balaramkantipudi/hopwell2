// pages/api/trips/generate-itinerary.js
import connectMongo from '@/libs/mongoose';
import Trip from '@/models/Trip';
import User from '@/models/User';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { GoogleGenerativeAI } from '@google/generative-ai';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const session = await getServerSession(req, res, authOptions);
    
    if (!session) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    await connectMongo();
    
    const { tripId } = req.body;
    
    if (!tripId) {
      return res.status(400).json({ error: 'Trip ID is required' });
    }

    // Find the trip
    const trip = await Trip.findOne({ 
      _id: tripId,
      userId: session.user.id
    });

    if (!trip) {
      return res.status(404).json({ error: 'Trip not found' });
    }

    // Initialize Gemini
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

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
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // In your itinerary generation API (pages/api/trips/generate-itinerary.js)
// Add a function to generate affiliate links:

const generateAffiliateLinks = (data) => {
    // Hotels affiliate links
    if (data.accommodations && data.accommodations.length > 0) {
      data.accommodations = data.accommodations.map(hotel => {
        // Generate Booking.com affiliate link
        const bookingUrl = `https://www.booking.com/hotel/search.html?city=${encodeURIComponent(data.destination)}&aid=YOUR_BOOKING_AFFILIATE_ID`;
        
        // Generate Expedia affiliate link
        const expediaUrl = `https://www.expedia.com/Hotel-Search?destination=${encodeURIComponent(data.destination)}&AFFCID=YOUR_EXPEDIA_AFFILIATE_ID`;
        
        return {
          ...hotel,
          bookingLinks: {
            booking: bookingUrl,
            expedia: expediaUrl
          }
        };
      });
    }
    
    // Flight affiliate links
    if (data.transportation && data.transportation.length > 0) {
      data.transportation = data.transportation.map(transport => {
        if (transport.type === 'flight') {
          // Generate Skyscanner affiliate link
          const skyscannerUrl = `https://www.skyscanner.com/transport/flights/${transport.from.code}/${transport.to.code}/?partner=YOUR_SKYSCANNER_AFFILIATE_ID`;
          
          // Generate Kiwi affiliate link
          const kiwiUrl = `https://www.kiwi.com/deep?from=${transport.from.code}&to=${transport.to.code}&affilid=YOUR_KIWI_AFFILIATE_ID`;
          
          return {
            ...transport,
            bookingLinks: {
              skyscanner: skyscannerUrl,
              kiwi: kiwiUrl
            }
          };
        }
        return transport;
      });
    }
    
    // Activity affiliate links
    if (data.itinerary && data.itinerary.length > 0) {
      data.itinerary = data.itinerary.map(day => {
        if (day.activities && day.activities.length > 0) {
          day.activities = day.activities.map(activity => {
            // Generate GetYourGuide affiliate link
            const getYourGuideUrl = `https://www.getyourguide.com/${data.destination}-l${activity.location.cityCode}/s/?partner_id=YOUR_GETYOURGUIDE_AFFILIATE_ID`;
            
            // Generate Viator affiliate link
            const viatorUrl = `https://www.viator.com/tours/${data.destination}/search?pid=YOUR_VIATOR_AFFILIATE_ID`;
            
            return {
              ...activity,
              bookingLinks: {
                getYourGuide: getYourGuideUrl,
                viator: viatorUrl
              }
            };
          });
        }
        return day;
      });
    }
    
    return data;
  };
  
  // Then use this function before sending the response:
  // After generating the itinerary with AI
  const enhancedItinerary = generateAffiliateLinks(itineraryData);
  
  // Update the trip with affiliate-enhanced itinerary
  trip.itinerary = enhancedItinerary.itinerary;
  trip.accommodations = enhancedItinerary.accommodations;
  trip.transportation = enhancedItinerary.transportation;
  
    try {
      // Extract JSON from response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No valid JSON found in response');
      }
      
      const itineraryData = JSON.parse(jsonMatch[0]);
      
      // Update trip with generated itinerary
      trip.itinerary = itineraryData.itinerary;
      trip.accommodations = itineraryData.accommodations;
      trip.transportation = itineraryData.transportation;
      trip.totalCost = itineraryData.totalCost;
      trip.status = 'generated';
      
      await trip.save();
      
      return res.status(200).json({
        success: true,
        message: 'Itinerary generated successfully',
        trip: trip
      });
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError);
      return res.status(500).json({ 
        error: 'Failed to parse AI response',
        rawResponse: text
      });
    }
  } catch (error) {
    console.error('Generate itinerary error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
}