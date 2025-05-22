// Updated pages/api/generate-itinerary.js with proper auth handling
import { supabase } from '@/libs/supabase';
import { checkUserCredits, deductCredits } from '@/libs/creditSystem';

export default async function handler(req, res) {
  // Only accept POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get the authorization header
    const authHeader = req.headers.authorization;
    let session = null;
    
    // Try multiple ways to get the session
    if (authHeader && authHeader.startsWith('Bearer ')) {
      // If we have a bearer token, use it
      const token = authHeader.substring(7);
      const { data, error } = await supabase.auth.getUser(token);
      if (!error && data.user) {
        session = { user: data.user };
      }
    } else {
      // Try to get session from cookies/storage
      const { data: { session: cookieSession }, error } = await supabase.auth.getSession();
      if (!error && cookieSession) {
        session = cookieSession;
      }
    }
    
    // If no session found, try getting user from request headers
    if (!session) {
      // Check if we have user info in custom headers (set by client)
      const userId = req.headers['x-user-id'];
      if (userId) {
        // Verify this user exists in our system
        const { data: userData, error: userError } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', userId)
          .single();
          
        if (!userError && userData) {
          session = { user: { id: userId } };
        }
      }
    }
    
    if (!session || !session.user) {
      console.log('No valid session found');
      return res.status(401).json({ 
        error: 'Not authenticated',
        details: 'Please sign in to generate an itinerary'
      });
    }
    
    const userId = session.user.id;
    console.log('Authenticated user:', userId);
    
    // Get form data from request body
    const { 
      destination, 
      startDate, 
      endDate, 
      budget, 
      interests, 
      groupType, 
      groupCount 
    } = req.body;
    
    // Validate essential fields
    if (!destination) {
      return res.status(400).json({ error: 'Destination is required' });
    }

    // Check if user has enough credits (1 credit per itinerary)
    const creditCheck = await checkUserCredits(userId, 1);
    
    if (creditCheck.error) {
      return res.status(500).json({ 
        error: 'Failed to check credits',
        details: creditCheck.error
      });
    }
    
    if (!creditCheck.hasEnoughCredits) {
      return res.status(403).json({ 
        error: 'Not enough credits to generate itinerary', 
        currentCredits: creditCheck.currentCredits,
        required: 1
      });
    }

    // Generate a simple itinerary (for testing)
    const generatedText = generateSimpleItinerary(destination, startDate, endDate, budget, interests, groupType, groupCount);

    // Deduct a credit from the user
    const deductResult = await deductCredits(userId, 1);
    
    if (!deductResult.success) {
      console.error('Failed to deduct credit:', deductResult.error);
      // Continue anyway since we've generated the itinerary
    }

    // Return the generated itinerary and updated credit count
    return res.status(200).json({ 
      itinerary: generatedText,
      creditsRemaining: deductResult.newCreditBalance || (creditCheck.currentCredits - 1)
    });
    
  } catch (error) {
    console.error('Error generating itinerary:', error);
    return res.status(500).json({ 
      error: 'Failed to generate itinerary',
      details: error.message
    });
  }
}

// Simple itinerary generator for testing
function generateSimpleItinerary(destination, startDate, endDate, budget, interests, groupType, groupCount) {
  const formatDate = (dateStr) => {
    if (!dateStr) return 'Flexible dates';
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const tripDuration = startDate && endDate 
    ? Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24))
    : 3;

  const interestsList = Array.isArray(interests) && interests.length > 0
    ? interests.join(', ')
    : 'general sightseeing';

  return `# TRIP TO ${destination.toUpperCase()} - CUSTOM ITINERARY

## TRIP SUMMARY
===================
Welcome to your personalized ${tripDuration}-day journey to ${destination}! This itinerary has been crafted based on your preferences for ${budget} travel with interests in ${interestsList}.

**Travel Details:**
- Destination: ${destination}
- Dates: ${formatDate(startDate)} to ${formatDate(endDate)}
- Group: ${groupCount} ${groupType}${groupCount > 1 ? 's' : ''}
- Budget Level: ${budget}
- Interests: ${interestsList}

## ACCOMMODATIONS
===================
Based on your ${budget} budget preference:

${budget === 'luxury' ? `
**Luxury Accommodations:**
- Premium hotel in central location
- Expected cost: $300-500 per night
- Amenities: Spa, fine dining, concierge service
` : budget === 'budget' ? `
**Budget-Friendly Options:**
- Clean, well-located hostels or guesthouses
- Expected cost: $50-100 per night
- Amenities: Free WiFi, breakfast included
` : `
**Mid-Range Accommodations:**
- Comfortable hotel with good amenities
- Expected cost: $150-250 per night
- Amenities: Restaurant, fitness center, room service
`}

## DAILY ITINERARY
===================

${Array.from({ length: tripDuration }, (_, index) => {
  const dayNum = index + 1;
  const isFirstDay = dayNum === 1;
  const isLastDay = dayNum === tripDuration;
  
  return `
### DAY ${dayNum}: ${isFirstDay ? 'ARRIVAL' : isLastDay ? 'DEPARTURE' : 'EXPLORATION'}
${'-'.repeat(30)}

**Morning:**
${isFirstDay ? `- Arrive in ${destination}
- Check into accommodation
- Get oriented with the local area` : isLastDay ? `- Final breakfast
- Pack and check out
- Last-minute shopping` : `- Breakfast at local café
- Visit main attractions
- Explore cultural sites`}

**Afternoon:**
${isFirstDay ? `- Light lunch at nearby restaurant
- Rest and recover from travel
- Explore immediate neighborhood` : isLastDay ? `- Lunch at recommended restaurant
- Visit any missed attractions
- Prepare for departure` : `- Lunch featuring local cuisine
- ${interests.includes('Shopping') ? 'Shopping at local markets' : 'Continue sightseeing'}
- ${interests.includes('Nature & Outdoors') ? 'Outdoor activities or parks' : 'Museum or cultural sites'}`}

**Evening:**
${isFirstDay ? `- Welcome dinner (${budget === 'luxury' ? 'Fine dining restaurant' : budget === 'budget' ? 'Local eatery' : 'Popular restaurant'})
- Early rest to adjust to local time` : isLastDay ? `- Farewell dinner
- Departure from ${destination}` : `- Dinner and evening entertainment
- ${interests.includes('Nightlife & Entertainment') ? 'Experience local nightlife' : 'Relaxing evening stroll'}`}
`;
}).join('')}

## BUDGET ESTIMATION
===================
**Per Person Costs (${groupCount} ${groupType}${groupCount > 1 ? 's' : ''}):**

${budget === 'luxury' ? `
- Accommodation: $400 × ${tripDuration} nights = $${400 * tripDuration}
- Meals: $100 × ${tripDuration} days = $${100 * tripDuration}
- Activities: $80 × ${tripDuration} days = $${80 * tripDuration}
- Transportation: $60 × ${tripDuration} days = $${60 * tripDuration}
- Miscellaneous: $50 × ${tripDuration} days = $${50 * tripDuration}

**TOTAL PER PERSON: $${(400 + 100 + 80 + 60 + 50) * tripDuration}**
` : budget === 'budget' ? `
- Accommodation: $75 × ${tripDuration} nights = $${75 * tripDuration}
- Meals: $40 × ${tripDuration} days = $${40 * tripDuration}
- Activities: $25 × ${tripDuration} days = $${25 * tripDuration}
- Transportation: $20 × ${tripDuration} days = $${20 * tripDuration}
- Miscellaneous: $15 × ${tripDuration} days = $${15 * tripDuration}

**TOTAL PER PERSON: $${(75 + 40 + 25 + 20 + 15) * tripDuration}**
` : `
- Accommodation: $200 × ${tripDuration} nights = $${200 * tripDuration}
- Meals: $60 × ${tripDuration} days = $${60 * tripDuration}
- Activities: $45 × ${tripDuration} days = $${45 * tripDuration}
- Transportation: $35 × ${tripDuration} days = $${35 * tripDuration}
- Miscellaneous: $25 × ${tripDuration} days = $${25 * tripDuration}

**TOTAL PER PERSON: $${(200 + 60 + 45 + 35 + 25) * tripDuration}**
`}

## TRAVEL TIPS FOR ${destination.toUpperCase()}
===================
- **Best Time to Visit:** Research seasonal weather patterns
- **Local Currency:** Check current exchange rates
- **Language:** Learn basic phrases in the local language
- **Cultural Customs:** Respect local traditions and dress codes
- **Transportation:** Consider getting a local transit pass
- **Safety:** Keep valuables secure and stay aware of surroundings
- **Health:** Check if any vaccinations are required
- **Documentation:** Ensure passport validity and visa requirements

${interests.includes('Food & Dining') ? `
## FOOD RECOMMENDATIONS
===================
- Try local specialties and traditional dishes
- Visit local markets for authentic ingredients
- Book reservations at highly-rated restaurants
- Consider food tours for culinary experiences
` : ''}

${interests.includes('Culture & History') ? `
## CULTURAL HIGHLIGHTS
===================
- Visit museums and historical sites
- Attend local cultural performances
- Explore architectural landmarks
- Learn about local traditions and festivals
` : ''}

Enjoy your ${tripDuration}-day adventure in ${destination}! 🌟
`;
}