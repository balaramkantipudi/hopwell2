// pages/api/auth/[...nextauth].js
// This is a temporary stub during migration to Supabase Auth
export const authOptions = {
  providers: [],
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/auth/signin",
    signUp: "/auth/signup",
    error: "/auth/error",
  },
}

export default function handler(req, res) {
  return res.status(200).json({ message: 'Migrating to Supabase Auth' })
}