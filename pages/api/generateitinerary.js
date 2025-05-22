/*
// pages/api/generateItinerary.js
import { GoogleGenerativeAI } from '@google/generative-ai';

// Main handler function
export default async function handler(req, res) {
  // Set proper headers
  res.setHeader('Content-Type', 'application/json');
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  console.log('generateItinerary API called');
  
  try {
    const data = req.body;
    
    // Log the incoming data
    console.log('Request data received:', {
      destination: data.destination || 'not provided',
      startDate: data.startDate || 'not provided',
      endDate: data.endDate || 'not provided',
      transportMode: data.transportMode || 'not provided',
      theme: data.theme || 'not provided'
    });
    
    // Validate essential fields
    if (!data.destination) {
      return res.status(400).json({ 
        error: 'Missing destination',
        message: 'A destination is required to generate an itinerary' 
      });
    }
    
    // First, fallback to the reliable local generation
    const localItinerary = generateLocalItinerary(data);
    
    // Attempt to use Gemini API (but don't block the response)
    try {
      console.log('Attempting to generate with Gemini API...');
      const apiKey = process.env.GEMINI_API_KEY;
      
      if (!apiKey) {
        console.log('No Gemini API key found, using local generation');
        return res.status(200).json({ 
          text: localItinerary,
          source: 'local'
        });
      }
      
      // Return the local itinerary first for speed
      res.status(200).json({ 
        text: localItinerary,
        source: 'local'
      });
      
      // Try to generate with Gemini API after response is sent
      // This is for future improvements once the API is working
      generateWithGemini(data, apiKey).catch(geminiError => {
        console.error('Background Gemini generation failed:', geminiError.message);
      });
      
      return;
      
    } catch (geminiError) {
      // Log the error but proceed with local generation
      console.error('Gemini API error:', geminiError.message);
      console.log('Using local generation only');
      
      return res.status(200).json({ 
        text: localItinerary,
        source: 'local'
      });
    }
    
  } catch (error) {
    console.error('Server error:', error);
    
    // Even in case of severe error, try to return something usable
    try {
      const emergencyItinerary = `
EMERGENCY FALLBACK ITINERARY
============================

We encountered an error generating your detailed itinerary, but here's a simple plan for your trip to ${req.body?.destination || 'your destination'}:

Day 1: Arrival and Exploration
- Arrive and check into your hotel
- Explore the immediate area around your accommodation
- Have dinner at a nearby restaurant

Day 2: Main Attractions
- Visit the top attractions in the area
- Try local cuisine for lunch and dinner
- Take photos of notable landmarks

Day 3: Departure
- Final sightseeing in the morning
- Shopping for souvenirs
- Departure

Please try again later for a more detailed itinerary.
      `;
      
      return res.status(200).json({ 
        text: emergencyItinerary,
        source: 'emergency',
        error: error.message
      });
      
    } catch (emergencyError) {
      // Last resort - return the error directly
      return res.status(500).json({ 
        error: 'Failed to generate itinerary',
        message: error.message 
      });
    }
  }
}

// Function to generate itinerary with Gemini API (for future use)
async function generateWithGemini(data, apiKey) {
  console.log('Initializing Gemini...');
  
  // Initialize the Gemini AI
  const genAI = new GoogleGenerativeAI(apiKey);
  
  // Try multiple model versions
  const modelAttempts = [
    'gemini-pro',
    'gemini-1.0-pro',
    'gemini-1.5-pro',
    'gemini-1.5-flash'
  ];
  
  let responseText = null;
  
  // Try each model until one works
  for (const modelName of modelAttempts) {
    try {
      console.log(`Attempting to use model: ${modelName}`);
      
      // Get the model
      const model = genAI.getGenerativeModel({ model: modelName });
      
      // Format dates for the prompt
      const startDate = data.startDate ? new Date(data.startDate).toLocaleDateString() : 'upcoming';
      const endDate = data.endDate ? new Date(data.endDate).toLocaleDateString() : 'end of trip';
      
      // Calculate trip duration if dates are provided
      let tripDuration = '3';
      if (data.startDate && data.endDate) {
        const start = new Date(data.startDate);
        const end = new Date(data.endDate);
        tripDuration = Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24))).toString();
      }
      
      // Create a detailed prompt
      const prompt = `
Generate a detailed travel itinerary for a ${tripDuration}-day trip to ${data.destination} from ${data.origin || 'the traveler\'s origin'}.

Trip details:
- Destination: ${data.destination}
- Origin: ${data.origin || 'Not specified'}
- Dates: ${startDate} to ${endDate}
- Transportation: ${data.transportMode || 'Not specified'}
- Accommodation style: ${data.hotelStyle || 'Standard comfortable accommodation'}
- Cuisine interests: ${data.cuisine || 'Local cuisine'}
- Trip theme: ${data.theme || 'General sightseeing'}
- Group type: ${data.groupType || 'Travelers'} (${data.groupCount || '2'} people)
- Budget level: ${data.budget ? '$' + data.budget : 'Moderate budget'}
- Priority focus: ${data.priority || 'Balanced experience'}

Please create a comprehensive itinerary that includes:
1. A summary of the trip
2. Day-by-day breakdown with morning, afternoon, and evening activities
3. Recommended accommodations with approximate prices
4. Dining recommendations that match cuisine preferences
5. Transportation options within the destination
6. Estimated budget breakdown
7. Practical travel tips

Format the response with clear section headers using uppercase and divider lines (=== or ---).
Be specific with actual attraction names, realistic restaurants, and genuine hotel options in ${data.destination}.
      `;
      
      console.log('Sending request to Gemini API...');
      
      // Generate content with Gemini
      const result = await model.generateContent(prompt);
      const response = await result.response;
      responseText = response.text();
      
      console.log('Received response from Gemini API:', responseText.substring(0, 100) + '...');
      
      // If we got a reasonable response
      if (responseText && responseText.length > 100) break;
      
    } catch (modelError) {
      console.log(`Error with model ${modelName}:`, modelError.message);
    }
  }
  
  // If none of the models worked
  if (!responseText) {
    throw new Error('All Gemini model attempts failed');
  }
  
  return responseText;
}

// Function to generate a local itinerary without external APIs
function generateLocalItinerary(data) {
  console.log('Generating local itinerary...');
  
  // Extract data with defaults
  const destination = data.destination;
  const origin = data.origin || 'your origin';
  const startDate = data.startDate ? new Date(data.startDate) : new Date();
  const endDate = data.endDate ? new Date(data.endDate) : new Date(startDate.getTime() + 3*24*60*60*1000);
  const tripDuration = Math.max(1, Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)));
  const hotelStyle = data.hotelStyle || 'comfortable';
  const transportMode = data.transportMode || 'your preferred transportation';
  const theme = data.theme || 'sightseeing';
  const cuisine = data.cuisine || 'local cuisine';
  const groupType = data.groupType || 'travelers';
  const groupCount = data.groupCount || 2;
  const budget = data.budget || 1000;
  
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
  
  // Generate the itinerary text
  let itinerary = `
TRIP TO ${destination.toUpperCase()} - ${tripDuration} DAY ITINERARY
===============================================================

TRIP SUMMARY
-----------
A ${tripDuration}-day journey to ${destination} from ${origin}, focusing on ${theme} experiences with ${hotelStyle} accommodations. 
This trip is designed for ${groupCount} ${groupType} traveling from ${formatDate(startDate)} to ${formatDate(endDate)}.

ACCOMMODATIONS
-------------
Based on your preference for "${hotelStyle}" accommodations:
${hotelStyle === 'ultraLuxury' || hotelStyle === 'luxury' ? 
  `- Recommended: Luxury hotels in the city center or premium resorts
- Price range: $${hotelPricePerNight}-${hotelPricePerNight + 200} per night
- Total accommodation cost: Approximately $${hotelPricePerNight * tripDuration} for the full stay` 
  : 
  hotelStyle === 'budget' ?
  `- Recommended: Budget-friendly hotels, hostels or guesthouses
- Price range: $${hotelPricePerNight}-${hotelPricePerNight + 50} per night
- Total accommodation cost: Approximately $${hotelPricePerNight * tripDuration} for the full stay`
  :
  `- Recommended: Mid-range hotels or comfortable guesthouses
- Price range: $${hotelPricePerNight}-${hotelPricePerNight + 100} per night
- Total accommodation cost: Approximately $${hotelPricePerNight * tripDuration} for the full stay`
}

DAILY ITINERARY
--------------

`;

  // Generate day-by-day itinerary
  for (let day = 1; day <= tripDuration; day++) {
    const currentDate = new Date(startDate);
    currentDate.setDate(startDate.getDate() + day - 1);
    
    // Determine the day's theme
    let dayTitle;
    if (day === 1) {
      dayTitle = "ARRIVAL & ORIENTATION";
    } else if (day === tripDuration) {
      dayTitle = "FINAL EXPLORATION & DEPARTURE";
    } else if (day === 2) {
      dayTitle = "MAIN ATTRACTIONS";
    } else {
      dayTitle = `DAY ${day} EXPLORATION`;
    }
    
    itinerary += `DAY ${day}: ${dayTitle} (${formatDate(currentDate)})
${'-'.repeat(dayTitle.length + 8)}

Morning:
${day === 1 ? 
  `- Arrive in ${destination} ${transportMode === 'air' ? 'by air' : `via ${transportMode}`}
- Transfer to your ${hotelStyle} accommodation
- Check in and refresh after your journey` 
  : 
  day === tripDuration ?
  `- Enjoy a final breakfast at your accommodation
- Pack and prepare for departure
- Check out (store luggage if needed)`
  :
  `- Breakfast at your accommodation
- Visit ${day === 2 ? 'the top attraction in ' + destination : 'a popular local site'}
- Take a ${day % 2 === 0 ? 'guided tour' : 'self-guided walk'} of the area`
}

Afternoon:
${day === 1 ? 
  `- Take an orientation walk around your neighborhood
- Visit a local café to experience the culture
- Get acquainted with the local transportation options` 
  : 
  day === tripDuration ?
  `- Last-minute souvenir shopping
- Visit any missed attractions if time allows
- Prepare for departure`
  :
  `- Enjoy lunch featuring ${cuisine}
- Explore ${day % 2 === 0 ? 'museums or cultural sites' : 'local markets or parks'}
- Take photos at scenic viewpoints`
}

Evening:
${day === 1 ? 
  `- Welcome dinner at a restaurant serving ${cuisine}
- Early night to recover from travel
- Plan your activities for the next day` 
  : 
  day === tripDuration ?
  `- Final dinner in ${destination}
- Transfer to ${transportMode === 'air' ? 'the airport' : 'your departure point'}
- Departure from ${destination}`
  :
  `- Dinner at a ${day % 2 === 0 ? 'highly-rated' : 'local favorite'} restaurant
- ${day % 2 === 0 ? 'Attend a cultural performance or event' : 'Relaxing evening stroll'}
- Return to accommodation`
}

`;
  }
  
  // Add budget and tips sections
  const foodCostPerDay = budget > 200 ? 80 : budget > 100 ? 50 : 30;
  const activityCostPerDay = budget > 200 ? 60 : budget > 100 ? 40 : 20;
  const transportCostPerDay = budget > 200 ? 40 : budget > 100 ? 25 : 15;
  const miscCostPerDay = budget > 200 ? 30 : budget > 100 ? 20 : 10;
  
  const totalAccommodationCost = hotelPricePerNight * tripDuration;
  const totalFoodCost = foodCostPerDay * tripDuration;
  const totalActivityCost = activityCostPerDay * tripDuration;
  const totalTransportCost = transportCostPerDay * tripDuration;
  const totalMiscCost = miscCostPerDay * tripDuration;
  const totalCost = totalAccommodationCost + totalFoodCost + totalActivityCost + totalTransportCost + totalMiscCost;
  
  itinerary += `
BUDGET ESTIMATION
----------------
- Accommodation: $${totalAccommodationCost} ($${hotelPricePerNight} per night × ${tripDuration} nights)
- Food & Dining: $${totalFoodCost} ($${foodCostPerDay} per day × ${tripDuration} days)
- Activities & Attractions: $${totalActivityCost} ($${activityCostPerDay} per day × ${tripDuration} days)
- Local Transportation: $${totalTransportCost} ($${transportCostPerDay} per day × ${tripDuration} days)
- Miscellaneous & Shopping: $${totalMiscCost} ($${miscCostPerDay} per day × ${tripDuration} days)

TOTAL ESTIMATED COST: $${totalCost} for ${groupCount} ${groupType}
${groupCount > 1 ? `PER PERSON COST: $${Math.round(totalCost / groupCount)}` : ''}

TRAVEL TIPS FOR ${destination.toUpperCase()}
${'-'.repeat(13 + destination.length)}
- Best time to visit: Research seasonal weather before your trip
- Local transportation: Look for day passes to save money
- Language: Learn a few basic phrases in the local language
- Currency: Check exchange rates and have some local currency on hand
- Safety: Keep valuables secure and be aware of your surroundings
- Local customs: Research and respect local traditions and etiquette
- Weather: Pack appropriate clothing for the season

This itinerary is a framework that can be adjusted based on your specific interests and preferences.
Enjoy your trip to ${destination}!
`;

  return itinerary;
}
*/