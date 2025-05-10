// pages/api/direct-itinerary.js
// A simplified, direct version of the itinerary generator that uses only the working model
import { GoogleGenerativeAI } from '@google/generative-ai';

export default async function handler(req, res) {
  console.log('Direct itinerary API called');
  
  // Set Content-Type header
  res.setHeader('Content-Type', 'application/json');
  
  // Only accept POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    // Get form data from request body
    const data = req.body;
    console.log('Form data received:', {
      destination: data.destination || '(missing)',
      startDate: data.startDate || '(missing)',
      endDate: data.endDate || '(missing)'
    });
    
    // Ensure destination is provided
    if (!data.destination) {
      return res.status(400).json({ 
        error: 'Missing destination',
        message: 'Destination is required to generate an itinerary' 
      });
    }
    
    // Get API key from environment variables
    const apiKey = process.env.GEMINI_API_KEY;
    console.log('API key available:', !!apiKey);
    
    if (!apiKey) {
      // Use local generation if no API key
      const localItinerary = generateBasicItinerary(data);
      return res.status(200).json({ text: localItinerary, source: 'local' });
    }
    
    // Initialize the Gemini AI with the known working model
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
    
    console.log('Creating prompt for Gemini API...');
    
    // Calculate trip duration
    let tripDuration = '3';
    if (data.startDate && data.endDate) {
      const start = new Date(data.startDate);
      const end = new Date(data.endDate);
      tripDuration = Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24))).toString();
    }
    
    // Create a prompt for the AI
    const prompt = `Create a detailed ${tripDuration}-day travel itinerary to ${data.destination}.
    
TRIP DETAILS:
- Destination: ${data.destination}
- Origin: ${data.origin || 'Not specified'}
- Start Date: ${data.startDate || 'Not specified'} 
- End Date: ${data.endDate || 'Not specified'}
- Transportation: ${data.transportMode || 'Not specified'}
- Accommodation Preference: ${data.hotelStyle || 'Standard'}
- Cuisine Interests: ${data.cuisine || 'Not specified'}
- Trip Theme: ${data.theme || 'General sightseeing'}
- Group Type: ${data.groupType || 'Travelers'} (${data.groupCount || '2'} people)
- Budget: ${data.budget ? '$' + data.budget : 'Moderate'}

Format the itinerary with these sections:
1. TRIP SUMMARY
2. ACCOMMODATIONS (with price estimates)
3. DAILY ITINERARY (day-by-day with morning, afternoon, evening activities)
4. BUDGET ESTIMATION (breakdown of costs)
5. TRAVEL TIPS

Use clear headers with ALL CAPS and divider lines (===== or -----).
Be specific with real attraction names, restaurant recommendations, and hotel options.
    `;
    
    console.log('Sending request to Gemini...');
    
    // Generate the itinerary with Gemini
    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      console.log('Received response from Gemini, length:', text.length);
      console.log('First 100 chars:', text.substring(0, 100));
      
      if (text && text.length > 100) {
        return res.status(200).json({ text: text, source: 'gemini' });
      } else {
        throw new Error('Received too short or empty response from Gemini');
      }
      
    } catch (geminiError) {
      console.error('Gemini API error:', geminiError);
      
      // Fall back to local generation
      const localItinerary = generateBasicItinerary(data);
      return res.status(200).json({ 
        text: localItinerary, 
        source: 'local', 
        error: geminiError.message 
      });
    }
    
  } catch (error) {
    console.error('Server error:', error);
    
    // Emergency fallback
    try {
      const emergencyItinerary = `
BASIC ITINERARY FOR ${req.body?.destination?.toUpperCase() || 'YOUR DESTINATION'}
======================================================

DAY 1: ARRIVAL
- Arrive at your destination
- Check into your accommodation
- Explore the immediate area
- Have dinner at a local restaurant

DAY 2: MAIN ATTRACTIONS
- Visit the top attractions in the city
- Try local cuisine for lunch
- Explore museums or historical sites
- Enjoy an evening meal at a recommended restaurant

DAY 3: DEPARTURE
- Last-minute sightseeing
- Souvenir shopping
- Departure
      `;
      
      return res.status(200).json({ 
        text: emergencyItinerary, 
        source: 'emergency',
        error: error.message
      });
      
    } catch (emergencyError) {
      return res.status(500).json({ 
        error: 'Failed to generate itinerary', 
        message: error.message 
      });
    }
  }
}

// Fallback function to generate a basic itinerary locally
function generateBasicItinerary(data) {
  console.log('Generating basic itinerary locally...');
  
  // Extract data with defaults
  const destination = data.destination;
  const origin = data.origin || 'your origin';
  const startDate = data.startDate ? new Date(data.startDate) : new Date();
  const endDate = data.endDate ? new Date(data.endDate) : new Date(startDate.getTime() + 3*24*60*60*1000);
  const tripDuration = Math.max(1, Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)));
  const hotelStyle = data.hotelStyle || 'comfortable';
  const theme = data.theme || 'sightseeing';
  const cuisine = data.cuisine || 'local cuisine';
  const groupType = data.groupType || 'travelers';
  const groupCount = data.groupCount || 2;
  
  // Format dates for display
  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };
  
  // Generate itinerary text
  let itinerary = `
TRIP TO ${destination.toUpperCase()} - ${tripDuration} DAY ITINERARY
================================================================

TRIP SUMMARY
-----------
A ${tripDuration}-day journey to ${destination} from ${origin}, focusing on ${theme} experiences.
Travel dates: ${formatDate(startDate)} to ${formatDate(endDate)}
Group: ${groupCount} ${groupType}

ACCOMMODATIONS
------------
`;

  // Add accommodation recommendations based on style
  switch (hotelStyle) {
    case 'ultraLuxury':
    case 'luxury':
      itinerary += `Recommended: Luxury hotels or high-end resorts
Price range: $300-500 per night
Total accommodation cost: Approximately $${400 * tripDuration} for ${tripDuration} nights`;
      break;
    case 'budget':
      itinerary += `Recommended: Budget-friendly hotels, hostels, or guesthouses
Price range: $60-120 per night
Total accommodation cost: Approximately $${90 * tripDuration} for ${tripDuration} nights`;
      break;
    case 'experience':
      itinerary += `Recommended: Unique accommodations like boutique hotels or themed stays
Price range: $150-300 per night
Total accommodation cost: Approximately $${225 * tripDuration} for ${tripDuration} nights`;
      break;
    default: // comfortable or not specified
      itinerary += `Recommended: Mid-range hotels or comfortable guesthouses
Price range: $120-200 per night
Total accommodation cost: Approximately $${160 * tripDuration} for ${tripDuration} nights`;
  }

  itinerary += `

DAILY ITINERARY
--------------
`;

  // Generate day-by-day itinerary
  for (let day = 1; day <= tripDuration; day++) {
    const currentDate = new Date(startDate);
    currentDate.setDate(startDate.getDate() + day - 1);
    
    if (day === 1) {
      itinerary += `
DAY 1: ARRIVAL (${formatDate(currentDate)})
------------------------------
Morning:
- Arrive in ${destination}
- Transfer to your accommodation
- Check in and freshen up

Afternoon:
- Orientation walk around your neighborhood
- Visit a local café for a light meal
- Get familiar with local transportation options

Evening:
- Welcome dinner featuring ${cuisine}
- Early night to recover from travel
- Plan details for the next day
`;
    } else if (day === tripDuration) {
      itinerary += `
DAY ${day}: DEPARTURE (${formatDate(currentDate)})
--------------------------------
Morning:
- Breakfast at your accommodation
- Pack and prepare for departure
- Check out (store luggage if needed)

Afternoon:
- Last-minute shopping for souvenirs
- Visit any remaining must-see attractions
- Grab lunch at a local favorite

Evening:
- Final dinner in ${destination}
- Return to collect luggage if stored
- Departure from ${destination}
`;
    } else {
      // For middle days
      const dayTheme = day === 2 ? "MAIN ATTRACTIONS" : 
                       day === 3 ? "LOCAL EXPERIENCES" :
                       `EXPLORATION DAY ${day}`;
                       
      itinerary += `
DAY ${day}: ${dayTheme} (${formatDate(currentDate)})
----------------------------------
Morning:
- Breakfast at your accommodation
- Visit ${day === 2 ? 'the top attractions' : 'local sites'}
- ${day % 2 === 0 ? 'Take a guided tour' : 'Explore on your own'}

Afternoon:
- Lunch featuring ${cuisine}
- ${day % 2 === 0 ? 'Museum or cultural site visit' : 'Shopping or park visit'}
- Leisure time or optional activities

Evening:
- Dinner at a ${day % 2 === 0 ? 'recommended restaurant' : 'local favorite'}
- ${day % 2 === 0 ? 'Cultural event or performance' : 'Evening stroll or relaxation'}
- Return to accommodation
`;
    }
  }

  // Add budget section
  const accommodationCost = hotelStyle === 'luxury' || hotelStyle === 'ultraLuxury' ? 400 :
                            hotelStyle === 'budget' ? 90 :
                            hotelStyle === 'experience' ? 225 : 160;
  
  const totalAccommodation = accommodationCost * tripDuration;
  const totalFood = 60 * tripDuration; // $60 per day
  const totalActivities = 40 * tripDuration; // $40 per day
  const totalTransport = 25 * tripDuration; // $25 per day
  const totalMisc = 20 * tripDuration; // $20 per day
  const totalCost = totalAccommodation + totalFood + totalActivities + totalTransport + totalMisc;
  
  itinerary += `
BUDGET ESTIMATION
---------------
- Accommodation: $${totalAccommodation} (${tripDuration} nights)
- Food & Dining: $${totalFood} ($60 per day)
- Activities & Attractions: $${totalActivities} ($40 per day)
- Local Transportation: $${totalTransport} ($25 per day)
- Miscellaneous & Shopping: $${totalMisc} ($20 per day)

TOTAL ESTIMATED COST: $${totalCost} for ${groupCount} ${groupType}
${groupCount > 1 ? `PER PERSON COST: $${Math.round(totalCost / groupCount)}` : ''}

TRAVEL TIPS
---------
- Currency: Check exchange rates before your trip
- Weather: Research seasonal conditions for your travel dates
- Local customs: Learn about cultural norms and etiquette
- Transportation: Consider getting a travel pass for public transport
- Language: Learn a few basic phrases in the local language
- Safety: Keep valuables secure and be aware of your surroundings

Enjoy your trip to ${destination}!
`;

  return itinerary;
}