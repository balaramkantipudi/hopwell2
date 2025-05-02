// pages/api/auth/verify-token.js
import connectMongo from '@/libs/mongoose';
import User from '@/models/User';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ error: 'Token is required' });
    }

    await connectMongo();

    // Find the user with this token and ensure it's not expired
    const user = await User.findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ error: 'Invalid or expired token' });
    }

    return res.status(200).json({ valid: true });
  } catch (error) {
    console.error('Token verification error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
}