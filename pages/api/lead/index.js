// pages/api/lead/index.js
import { supabase } from '../../../libs/supabase'  // Use relative path

export default async function handler(req, res) {
  const { method, body } = req;

  switch (method) {
    case "POST": {
      if (!body.email) {
        return res.status(404).send({ error: "Need an email" });
      }

      try {
        // Store lead in Supabase
        const { error } = await supabase
          .from('leads')
          .upsert([
            { 
              email: body.email,
              created_at: new Date().toISOString() 
            }
          ], 
          { 
            onConflict: 'email',
            ignoreDuplicates: true
          });

        if (error) {
          throw error;
        }

        return res.status(200).json({});
      } catch (e) {
        console.error(e);
        return res.status(500).json({ error: e?.message });
      }
    }

    default:
      res.status(404).json({ error: "Unknown request type" });
  }
}