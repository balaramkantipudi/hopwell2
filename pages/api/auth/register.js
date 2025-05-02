// pages/api/auth/register.js
import connectMongo from '@/libs/mongoose';
import User from '@/models/User';
import bcrypt from 'bcrypt';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await connectMongo();

    const { name, email, password } = req.body;

    // Validate input
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    // Remove password from response
    const userResponse = {
      id: user._id,
      name: user.name,
      email: user.email,
    };

    return res.status(201).json(userResponse);
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
}