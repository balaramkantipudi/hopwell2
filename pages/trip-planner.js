import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import Head from 'next/head';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import TripPlannerForm from '@/components/TripPlannerForm'; // Rename your existing TripPlanner component

export default function TripPlannerPage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push('/?auth=open');
    }
  }, [status, router]);

  // Show loading if checking authentication
  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-16 h-16 border-4 border-indigo-900 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // If authenticated, show the trip planner
  return (
    <>
      <Head>
        <title>Plan Your Trip | HOPWELL</title>
      </Head>
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow bg-yellow-50">
          {status === "authenticated" && <TripPlannerForm />}
        </main>
        <Footer />
      </div>
    </>
  );
}