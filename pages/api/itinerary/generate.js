// pages/api/Trips/generate-itinerary.js
import { supabase } from '@/libs/supabase'
import { GoogleGenerativeAI } from '@google/generative-ai'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get user from Supabase session
    const { data: { session }, error: authError } = await supabase.auth.getSession();
    
    if (authError || !session) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    
    const userId = session.user.id;
    const { tripId } = req.body;
    
    if (!tripId) {
      return res.status(400).json({ error: 'Trip ID is required' });
    }

    // Find the trip in Supabase
    const { data: trip, error: tripError } = await supabase
      .from('trips')
      .select('*')
      .eq('id', tripId)
      .eq('user_id', userId)
      .single();

    if (tripError || !trip) {
      return res.status(404).json({ error: 'Trip not found' });
    }

    if (!trip.destination) {
      return res.status(400).json({ error: 'Trip destination is missing, cannot generate itinerary' });
    }

    // Fetch/Initialize Credits
    let { data: userCredits, error: creditFetchError } = await supabase
        .from('user_credits')
        .select('*')
        .eq('user_id', userId)
        .single();

    if (creditFetchError && creditFetchError.code === 'PGRST116') { // Record not found, new user for credits
        const { data: newCredits, error: creditInsertError } = await supabase
            .from('user_credits')
            .insert([{ user_id: userId, credits_remaining: 30, total_credits_used: 0 }])
            .select()
            .single();
        if (creditInsertError) {
            console.error('Error initializing user credits:', creditInsertError);
            return res.status(500).json({ error: 'Failed to initialize user credits.' });
        }
        userCredits = newCredits;
    } else if (creditFetchError) {
        console.error('Error fetching user credits:', creditFetchError);
        return res.status(500).json({ error: 'Failed to fetch user credits.' });
    }

    if (!userCredits) { // Should be caught by PGRST116, but as a safeguard
         console.error('User credits record still not found after check/insert for user:', userId);
         return res.status(500).json({ error: 'Could not establish user credit record.' });
    }

    // Check Credits
    if (userCredits.credits_remaining <= 0) {
        return res.status(403).json({ error: 'No credits remaining. Please purchase more to generate new itineraries.' });
    }

    // Initialize Gemini (rest of your code remains the same)
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
    let itineraryData;
    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      itineraryData = JSON.parse(text);
    } catch (error) {
      console.error('Gemini API error or JSON parsing error:', error);
      // Check if the error is due to JSON parsing
      if (error instanceof SyntaxError) {
        return res.status(500).json({ error: 'Failed to parse AI response.' });
      }
      // Fallback to local itinerary generation for other errors
      itineraryData = generateLocalItinerary(tripInfo, tripDuration);
    }
    
// Add a function to generate affiliate links:

const generateAffiliateLinks = (data) => {
    const bookingAffiliateId = process.env.BOOKING_AFFILIATE_ID || 'YOUR_DEFAULT_BOOKING_ID';
    const expediaAffiliateId = process.env.EXPEDIA_AFFILIATE_ID || 'YOUR_DEFAULT_EXPEDIA_ID';
    const skyscannerAffiliateId = process.env.SKYSCANNER_AFFILIATE_ID || 'YOUR_DEFAULT_SKYSCANNER_ID';
    const kiwiAffiliateId = process.env.KIWI_AFFILIATE_ID || 'YOUR_DEFAULT_KIWI_ID';
    const getYourGuideAffiliateId = process.env.GETYOURGUIDE_AFFILIATE_ID || 'YOUR_DEFAULT_GETYOURGUIDE_ID';
    const viatorAffiliateId = process.env.VIATOR_AFFILIATE_ID || 'YOUR_DEFAULT_VIATOR_ID';

    // Hotels affiliate links
    if (data.accommodations && data.accommodations.length > 0) {
      data.accommodations = data.accommodations.map(hotel => {
        const bookingUrl = `https://www.booking.com/hotel/search.html?city=${encodeURIComponent(data.destination)}&aid=${bookingAffiliateId}`;
        const expediaUrl = `https://www.expedia.com/Hotel-Search?destination=${encodeURIComponent(data.destination)}&AFFCID=${expediaAffiliateId}`;
        
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
        if (transport.type === 'flight' && transport.from && transport.to && transport.from.code && transport.to.code) {
          const skyscannerUrl = `https://www.skyscanner.com/transport/flights/${transport.from.code}/${transport.to.code}/?partner=${skyscannerAffiliateId}`;
          const kiwiUrl = `https://www.kiwi.com/deep?from=${transport.from.code}&to=${transport.to.code}&affilid=${kiwiAffiliateId}`;
          
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
            let getYourGuideUrl = `https://www.getyourguide.com/s/?q=${encodeURIComponent(data.destination)}&partner_id=${getYourGuideAffiliateId}`;
            if (activity.location && activity.location.cityCode) {
                 getYourGuideUrl = `https://www.getyourguide.com/${data.destination}-l${activity.location.cityCode}/s/?partner_id=${getYourGuideAffiliateId}`;
            }
            const viatorUrl = `https://www.viator.com/tours/${data.destination}/search?pid=${viatorAffiliateId}`;
            
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

  // Deduct Credit
  const { error: creditUpdateError } = await supabase
      .from('user_credits')
      .update({ 
          credits_remaining: userCredits.credits_remaining - 1,
          total_credits_used: (userCredits.total_credits_used || 0) + 1,
          last_used_at: new Date().toISOString()
      })
      .eq('user_id', userId);

  if (creditUpdateError) {
      console.error('Failed to deduct credit for user:', userId, creditUpdateError);
      // Decide if this is a hard failure. For now, log and continue as itinerary is generated.
      // Potentially, you might want to return an error or retry.
  }
  
  const { data: updatedTrip, error: updateError } = await supabase
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
      .select();
    
    if (updateError) {
      return res.status(500).json({ error: 'Failed to update trip' });
    }
    
    return res.status(200).json({
      success: true,
      message: 'Itinerary generated successfully',
      trip: updatedTrip[0]
    });
  }catch (error) {
    console.error('Generate itinerary error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
}

// Function to generate a local itinerary without external APIs
function generateLocalItinerary(tripInfo, tripDuration) {
  console.log('Generating local itinerary...');
  
  // Extract data with defaults
  const destination = tripInfo.destination;
  const origin = tripInfo.origin || 'your origin';
  const startDate = tripInfo.startDate ? new Date(tripInfo.startDate) : new Date();
  const endDate = tripInfo.endDate ? new Date(tripInfo.endDate) : new Date(startDate.getTime() + 3*24*60*60*1000);
  // const tripDuration = Math.max(1, Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)));
  const hotelStyle = tripInfo.hotelStyle || 'comfortable';
  const transportMode = tripInfo.transportMode || 'your preferred transportation';
  const theme = tripInfo.theme || 'sightseeing';
  const cuisine = tripInfo.cuisine || 'local cuisine';
  const groupType = tripInfo.groupType || 'travelers';
  const groupCount = tripInfo.groupCount || 2;
  const budget = tripInfo.budget || 1000;
  
  // Format dates
  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };
  
  // Hotel price based on style
  let hotelPricePerNight;
  switch (hotelStyle) {
    case 'ultraLuxury':
      hotelPricePerNight = 500;
      break;
    case 'luxury':
      hotelPricePerNight = 300;
      break;
    case 'comfortable':
      hotelPricePerNight = 150;
      break;
    case 'budget':
      hotelPricePerNight = 80;
      break;
    case 'experience':
      hotelPricePerNight = 200;
      break;
    default:
      hotelPricePerNight = 150;
  }

  const accommodations = [{
    name: `Recommended ${hotelStyle} hotel in ${destination}`,
    location: { name: destination, address: `${destination} city center` },
    checkIn: startDate.toISOString().split('T')[0],
    checkOut: endDate.toISOString().split('T')[0],
    pricePerNight: hotelPricePerNight,
    totalPrice: hotelPricePerNight * tripDuration,
    roomType: "Standard Room",
    amenities: ["WiFi", "Air Conditioning"],
    rating: hotelStyle === 'luxury' || hotelStyle === 'ultraLuxury' ? 4.5 : (hotelStyle === 'budget' ? 3.5 : 4.0)
  }];

  const itineraryDays = [];
  for (let day = 1; day <= tripDuration; day++) {
    const currentDate = new Date(startDate);
    currentDate.setDate(startDate.getDate() + day - 1);
    
    let dayTitle;
    if (day === 1) dayTitle = "ARRIVAL & ORIENTATION";
    else if (day === tripDuration) dayTitle = "FINAL EXPLORATION & DEPARTURE";
    else if (day === 2) dayTitle = "MAIN ATTRACTIONS";
    else dayTitle = `DAY ${day} EXPLORATION`;

    itineraryDays.push({
      date: currentDate.toISOString().split('T')[0],
      activities: [
        { time: "09:00", title: `${day === 1 ? 'Arrive and Check-in' : (day === tripDuration ? 'Breakfast and Check-out' : 'Morning Activity')}`, description: "Details for morning activity", location: { name: destination }, duration: 180, type: "activity", cost: 20 },
        { time: "13:00", title: "Lunch", description: `Enjoy ${cuisine} cuisine`, location: { name: destination }, duration: 60, type: "meal", cost: 30 },
        { time: "15:00", title: `${day === 1 ? 'Orientation Walk' : (day === tripDuration ? 'Last minute shopping' : 'Afternoon Exploration')}`, description: "Details for afternoon activity", location: { name: destination }, duration: 180, type: "activity", cost: 25 },
        { time: "19:00", title: "Dinner", description: `Dinner at a local restaurant`, location: { name: destination }, duration: 90, type: "meal", cost: 40 }
      ]
    });
  }

  const transportation = [{
    type: transportMode,
    from: { name: origin },
    to: { name: destination },
    departureTime: startDate.toISOString(),
    arrivalTime: startDate.toISOString(), // Assuming same day arrival for simplicity
    provider: "Local transport",
    price: 50 // Placeholder
  }];

  const foodCostPerDay = budget > 200 ? 80 : budget > 100 ? 50 : 30;
  const activityCostPerDay = budget > 200 ? 60 : budget > 100 ? 40 : 20;
  const transportCostEstimate = 50; // Placeholder, as it's complex to estimate daily
  
  const totalAccommodationCost = hotelPricePerNight * tripDuration;
  const totalFoodCost = foodCostPerDay * tripDuration;
  const totalActivityCost = activityCostPerDay * tripDuration;
  const totalEstimatedCost = totalAccommodationCost + totalFoodCost + totalActivityCost + transportCostEstimate;
  
  return {
    itinerary: itineraryDays,
    accommodations: accommodations,
    transportation: transportation,
    totalCost: totalEstimatedCost,
    // Adding some extra fields that might be in the Gemini response, with defaults
    destination: destination, 
    tripDuration: tripDuration,
    budget: budget,
    theme: theme
  };
}
