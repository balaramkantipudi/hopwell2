// pages/api/savetrip.js - Simplified version
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
    const { tripData, itinerary, title } = req.body;
    
    if (!tripData || !itinerary) {
      return res.status(400).json({ error: 'Missing required data: tripData and itinerary are required.' });
    }

    if (!tripData.destination) {
      return res.status(400).json({ error: 'Missing required field: tripData.destination' });
    }

    // Insert into trips table with simplified structure
    const { data, error } = await supabase
      .from('trips')
      .insert([
        {
          user_id: userId,
          title: title || `Trip to ${tripData.destination}`,
          destination: tripData.destination,
          origin: tripData.origin || null,
          start_date: tripData.startDate || null,
          end_date: tripData.endDate || null,
          itinerary_text: itinerary,
          preferences: tripData, // Store all preferences as a JSON object
          status: 'saved',
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