// pages/api/test-credits.js
import { supabase } from '@/libs/supabase';
import { checkUserCredits, deductCredits, addCredits } from '@/libs/creditSystem';

export default async function handler(req, res) {
  // Check authentication
  const { data: { session }, error: authError } = await supabase.auth.getSession();
  
  if (authError || !session) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  
  const userId = session.user.id;
  
  try {
    switch (req.method) {
      case 'GET':
        // Get current credit status
        const creditCheck = await checkUserCredits(userId, 0);
        return res.status(200).json({
          success: true,
          credits: creditCheck.currentCredits,
          hasEnoughCredits: creditCheck.hasEnoughCredits,
          resetDate: creditCheck.resetDate
        });
        
      case 'POST':
        const { action, amount = 1 } = req.body;
        
        if (action === 'deduct') {
          // Test deducting credits
          const result = await deductCredits(userId, amount);
          return res.status(200).json(result);
        } else if (action === 'add') {
          // Test adding credits
          const result = await addCredits(userId, amount);
          return res.status(200).json(result);
        } else {
          return res.status(400).json({ error: 'Invalid action. Use "deduct" or "add"' });
        }
        
      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Test credits API error:', error);
    return res.status(500).json({ error: error.message });
  }
}