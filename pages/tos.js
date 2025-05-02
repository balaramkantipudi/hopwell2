// pages/tos.js
import Link from "next/link";
import Head from "next/head";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function TermsOfService() {
  return (
    <>
      <Head>
        <title>Terms of Service | HOPWELL</title>
      </Head>
      <Header />
      <main className="bg-yellow-50 py-16">
        <div className="max-w-4xl mx-auto px-8">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h1 className="text-3xl font-bold text-indigo-900 mb-8">Terms of Service</h1>
            <div className="prose prose-indigo max-w-none">
              <p className="text-sm text-gray-500 mb-8">Last Updated: {new Date().toLocaleDateString()}</p>
              
              <h2 className="text-xl font-semibold mt-8 mb-4">1. Introduction</h2>
              <p>Welcome to HOPWELL ("we," "our," or "us"). By accessing or using our website, mobile application, or any services offered by HOPWELL (collectively, the "Services"), you agree to be bound by these Terms of Service ("Terms").</p>
              
              <h2 className="text-xl font-semibold mt-8 mb-4">2. Services Overview</h2>
              <p>HOPWELL is an AI-powered travel planning platform that creates personalized travel itineraries based on user preferences. Our Services include but are not limited to: personalized travel recommendations, itinerary generation, hotel and activity suggestions, and other travel-related services.</p>
              
              <h2 className="text-xl font-semibold mt-8 mb-4">3. User Accounts</h2>
              <p>To access certain features of our Services, you may need to create an account. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You agree to provide accurate and complete information when creating your account and to update your information to keep it accurate and current.</p>
              
              <h2 className="text-xl font-semibold mt-8 mb-4">4. User Content</h2>
              <p>By submitting travel preferences, reviews, or other content to our Services, you grant us a worldwide, non-exclusive, royalty-free license to use, reproduce, modify, and display such content for the purpose of providing and improving our Services.</p>
              
              <h2 className="text-xl font-semibold mt-8 mb-4">5. Travel Bookings</h2>
              <p>HOPWELL may provide links to third-party travel providers for booking accommodations, activities, or transportation. Any transactions you enter into with these third parties are solely between you and the third party. We are not responsible for any issues arising from your interactions with these third parties.</p>
              
              <h2 className="text-xl font-semibold mt-8 mb-4">6. Travel Information</h2>
              <p>While we strive to provide accurate and up-to-date information, we cannot guarantee the accuracy of all travel information, including prices, availability, and details about destinations, accommodations, and activities. It is your responsibility to verify this information before making travel arrangements.</p>
              
              <h2 className="text-xl font-semibold mt-8 mb-4">7. Limitation of Liability</h2>
              <p>To the maximum extent permitted by law, HOPWELL shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues, whether incurred directly or indirectly, or any loss of data, use, goodwill, or other intangible losses resulting from your use of our Services.</p>
              
              <h2 className="text-xl font-semibold mt-8 mb-4">8. Changes to Terms</h2>
              <p>We may update these Terms from time to time. If we make material changes, we will notify you via email or through a notice on our Services. Your continued use of the Services after such changes constitutes your acceptance of the new Terms.</p>
              
              <h2 className="text-xl font-semibold mt-8 mb-4">9. Governing Law</h2>
              <p>These Terms shall be governed by the laws of the United States without regard to its conflict of law provisions.</p>
              
              <h2 className="text-xl font-semibold mt-8 mb-4">10. Contact Us</h2>
              <p>If you have any questions about these Terms, please contact us at support@hopwell.ai.</p>
            </div>
            
            <div className="mt-8">
              <Link href="/" className="text-indigo-600 hover:text-indigo-800">
                ← Back to home
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}