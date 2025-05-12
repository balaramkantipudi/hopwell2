// pages/api/direct-itinerary.js
import { supabase } from '@/libs/supabase';
import { GoogleGenerativeAI } from '@google/generative-ai';

export default async function handler(req, res) {
  // Set Content-Type header
  res.setHeader('Content-Type', 'application/json');
  
  // Only accept POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    // First, check if user is authenticated
    const { data: { session }, error: authError } = await supabase.auth.getSession();
    
    if (authError) {
      console.error('Auth error:', authError);
      return res.status(401).json({ error: 'Authentication error', message: authError.message });
    }
    
    if (!session || !session.user) {
      console.log('No active session found');
      return res.status(401).json({ error: 'Not authenticated' });
    }
    
    const userId = session.user.id;
    console.log('Authenticated user:', userId);
    
    // Get form data from request body
    const data = req.body;
    
    // Ensure destination is provided
    if (!data.destination) {
      return res.status(400).json({ 
        error: 'Missing destination',
        message: 'Destination is required to generate an itinerary' 
      });
    }
    
    // Check if user has credits directly from the database
    let { data: userCredits, error: creditError } = await supabase
      .from('user_credits')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    // Handle the case where the user doesn't have a credits record yet
    if (creditError) {
      // If no record exists, create one with default credits
      if (creditError.code === 'PGRST116') { // Record not found
        console.log('Creating new credit record for user:', userId);
        const { data: newCredits, error: insertError } = await supabase
          .from('user_credits')
          .insert([
            { 
              user_id: userId,
              credits_remaining: 5, // Start with 5 free credits
              total_credits_used: 0
            }
          ])
          .select();
          
        if (insertError) {
          console.error('Failed to create credit record:', insertError);
          return res.status(500).json({ 
            error: 'Could not initialize credits',
            message: insertError.message
          });
        }
        
        userCredits = newCredits[0]; // Get the first record from the array
        console.log('Created credits:', userCredits);
      } else {
        console.error('Error fetching credits:', creditError);
        return res.status(500).json({ 
          error: 'Could not check credits',
          message: creditError.message
        });
      }
    }
    
    // Check if user has enough credits
    if (!userCredits || userCredits.credits_remaining <= 0) {
      return res.status(403).json({
        error: 'No credits remaining',
        message: 'You have used all your credits. Please purchase more to generate new itineraries.'
      });
    }
    
    console.log('User has credits remaining:', userCredits.credits_remaining);
    
    // Get API key from environment variables
    const apiKey = process.env.GEMINI_API_KEY;
    
    let itineraryText;
    let source = 'local';
    
    // Generate the itinerary (rest of the generation logic)
    if (apiKey) {
      try {
        // Initialize the Gemini AI
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
        
        // Calculate trip duration
        let tripDuration = '3';
        if (data.startDate && data.endDate) {
          const start = new Date(data.startDate);
          const end = new Date(data.endDate);
          tripDuration = Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24))).toString();
        }
        
        // Create prompt
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
        
        // Generate the itinerary
        const result = await model.generateContent(prompt);
        const response = await result.response;
        itineraryText = response.text();
        source = 'gemini';
        
      } catch (geminiError) {
        console.error('Gemini API error:', geminiError);
        // Fall back to local generation if API fails
        itineraryText = generateLocalItinerary(data);
      }
    } else {
      // No API key, use local generation
      itineraryText = generateLocalItinerary(data);
    }
    
    // Now deduct a credit from the user
    console.log('Deducting credit from user:', userId);
    const { error: updateError } = await supabase
      .from('user_credits')
      .update({ 
        credits_remaining: userCredits.credits_remaining - 1,
        total_credits_used: (userCredits.total_credits_used || 0) + 1
      })
      .eq('user_id', userId);
    
    if (updateError) {
      console.error('Error updating credits:', updateError);
      // Continue anyway since we've already generated the itinerary
    }
    
    return res.status(200).json({ 
      text: itineraryText, 
      source,
      credits: {
        remaining: userCredits.credits_remaining - 1,
        used: true
      }
    });
    
  } catch (error) {
    console.error('Server error:', error);
    
    // Return error with appropriate status code
    return res.status(500).json({ 
      error: 'Failed to generate itinerary', 
      message: error.message 
    });
  }
}

// Local generation function
function generateLocalItinerary(data) {
  console.log('Using local generation for', data.destination);
  
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