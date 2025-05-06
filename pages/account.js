// pages/account.js (simplified version)
import { useAuth } from '@/components/SupabaseAuthProvider';
import { useRouter } from 'next/router';

export default function Account() {
  const { user, loading } = useAuth();
  const router = useRouter();

  if (loading) return <div>Loading...</div>;
  if (!user) {
    router.push('/auth/signin');
    return null;
  }

  return (
    <div>
      <h1>My Account</h1>
      <p>Email: {user.email}</p>
    </div>
  );
}