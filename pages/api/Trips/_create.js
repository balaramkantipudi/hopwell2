// pages/api/Trips/create.js
import { supabase } from '@/libs/supabase'; // Assuming supabase client is here

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // 1. Authenticate User (using JWT from Authorization header)
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.error('[API /Trips/create] Auth header missing or malformed');
    return res.status(401).json({ error: 'Authorization header missing or malformed' });
  }
  const jwt = authHeader.split(' ')[1];
  if (!jwt) {
    console.error('[API /Trips/create] JWT not found in auth header');
    return res.status(401).json({ error: 'Token not found in Authorization header' });
  }

  let userId;
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser(jwt);
    if (userError) {
      console.error('[API /Trips/create] Supabase user auth error:', userError.message);
      throw userError;
    }
    if (!user) {
      console.error('[API /Trips/create] Supabase user not found for JWT');
      throw new Error('Invalid or expired token');
    }
    userId = user.id;
  } catch (error) {
    console.error('[API /Trips/create] Authentication failed:', error.message);
    return res.status(401).json({ error: error.message || 'Authentication failed' });
  }

  // 2. Get Trip Data from Request Body
  const {
    destination,
    startDate,
    endDate,
    budget,
    interests, // This is the array of interests
    groupType,
    groupCount,
    origin,
    transportMode,
    hotelStyle,
    cuisine,
    // theme, // Original theme from req.body, if any, will be overridden by interests for DB theme column
    priority
  } = req.body;

  // 3. Basic Validation (optional here, can also be done client-side)
  if (!destination) {
    return res.status(400).json({ error: 'Destination is required' });
  }
  // Add other validations as necessary

  // Convert interests array to a comma-separated string for the 'theme' column
  const themeStringFromInterests = (Array.isArray(interests) && interests.length > 0 ? interests.join(', ') : '');

  // 4. Insert New Trip into Supabase
  try {
    const newTripData = {
      user_id: userId,
      destination,
      start_date: startDate,
      end_date: endDate,
      budget,
      // DO NOT include a direct 'interests: interests,' line here
      group_type: groupType,
      group_count: groupCount,
      origin,
      transport_mode: transportMode,
      hotel_style: hotelStyle,
      cuisine,
      theme: themeStringFromInterests, // Save the string to the 'theme' column
      priority,
      status: 'DRAFT',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      // Itinerary, accommodations, transportation, total_cost will be filled later
    };

    console.log('[API /Trips/create] Inserting new trip data:', JSON.stringify(newTripData, null, 2));

    const { data: newTrip, error: insertError } = await supabase
      .from('trips')
      .insert(newTripData)
      .select('id') // Select only the id of the newly created row
      .single(); // Expect a single row to be returned

    if (insertError) {
      console.error('[API /Trips/create] Supabase insert error:', insertError.message);
      throw insertError;
    }

    if (!newTrip || !newTrip.id) {
      console.error('[API /Trips/create] Failed to create trip or retrieve ID.');
      throw new Error('Failed to create trip or retrieve ID.');
    }

    console.log('[API /Trips/create] Successfully created trip with ID:', newTrip.id);
    // 5. Return the new Trip ID
    return res.status(201).json({ tripId: newTrip.id });

  } catch (error) {
    console.error('[API /Trips/create] Error creating trip:', error.message, error.stack);
    return res.status(500).json({ error: 'Failed to create trip', details: error.message });
  }
}
