// pages/api/auth/forgot-password.js
import { supabase } from '@/libs/supabase'
import crypto from 'crypto'
import { sendEmail } from '@/libs/mailgun'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Check if user exists
    const { data: user, error: userError } = await supabase.auth.admin.getUserByEmail(email);

    // Don't reveal that the user doesn't exist
    if (userError) {
      return res.status(200).json({ message: 'If an account with that email exists, password reset instructions have been sent' });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour

    // Save to password_reset_tokens table
    const { error: tokenError } = await supabase
      .from('password_reset_tokens')
      .insert([{
        user_id: user.id,
        email: email,
        token: resetToken,
        expires_at: resetTokenExpiry.toISOString()
      }]);

    if (tokenError) {
      console.error('Token storage error:', tokenError);
      return res.status(500).json({ error: 'Server error' });
    }

    // Send email
    const resetUrl = `${process.env.NEXTAUTH_URL}/auth/reset-password?token=${resetToken}`;
    
    await sendEmail(
      email,
      'Reset your HOPWELL password',
      `You requested a password reset. Please go to this link to reset your password: ${resetUrl}`,
      `
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #312e81; margin-bottom: 20px;">Reset Your HOPWELL Password</h2>
          <p>You requested a password reset. Please click the button below to reset your password:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background-color: #312e81; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">Reset Password</a>
          </div>
          <p>If you didn't request a password reset, you can safely ignore this email.</p>
          <p>The link will expire in 1 hour.</p>
        </div>
      `
    );

    return res.status(200).json({ message: 'Password reset instructions sent' });
  } catch (error) {
    console.error('Password reset error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
}