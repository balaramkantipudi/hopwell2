// pages/api/saveTrip.js
import { supabase } from '@/libs/supabase';

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
    const { tripData, itinerary } = req.body;
    
    if (!tripData || !itinerary) {
      return res.status(400).json({ error: 'Missing required data' });
    }

    // Calculate trip duration
    const startDate = new Date(tripData.startDate);
    const endDate = new Date(tripData.endDate);
    
    // Save the trip to Supabase
    const { data, error } = await supabase
      .from('trips')
      .insert([
        {
          user_id: userId,
          title: `Trip to ${tripData.destination}`,
          destination: tripData.destination,
          origin: tripData.origin,
          transport_mode: tripData.transportMode,
          start_date: startDate.toISOString(),
          end_date: endDate.toISOString(),
          hotel_style: tripData.hotelStyle,
          cuisine: tripData.cuisine,
          theme: tripData.theme,
          group_type: tripData.groupType,
          group_count: tripData.groupCount || 1,
          budget: tripData.budget,
          priority: tripData.priority,
          itinerary_text: itinerary,
          status: 'generated',
          created_at: new Date().toISOString()
        }
      ])
      .select();

    if (error) {
      console.error('Error saving trip:', error);
      return res.status(500).json({ error: 'Failed to save trip' });
    }

    return res.status(200).json({ 
      success: true, 
      message: 'Trip saved successfully', 
      tripId: data[0].id 
    });
    
  } catch (error) {
    console.error('Save trip error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
}