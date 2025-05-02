// components/Features.js
import { useRouter } from 'next/router';

function Features() {
  const router = useRouter();
  
  return (
    <section className="py-16 bg-indigo-900 text-white">
      <div className="container mx-auto px-8">
        <h2 className="text-3xl font-bold text-center mb-4">How HOPWELL Works</h2>
        <p className="text-lg text-center mb-12 max-w-3xl mx-auto text-indigo-100">
          Smart travel planning powered by AI
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          <div className="bg-indigo-800 bg-opacity-40 p-6 rounded-lg text-center">
            <div className="text-4xl mb-4">📝</div>
            <h3 className="text-xl font-semibold mb-3">Share Your Preferences</h3>
            <p className="text-indigo-100">Tell us about your travel style, budget, and interests so we can create a personalized experience.</p>
          </div>
          
          <div className="bg-indigo-800 bg-opacity-40 p-6 rounded-lg text-center">
            <div className="text-4xl mb-4">🤖</div>
            <h3 className="text-xl font-semibold mb-3">AI Planning</h3>
            <p className="text-indigo-100">Our advanced AI creates custom itineraries based on your preferences and real-time data.</p>
          </div>
          
          <div className="bg-indigo-800 bg-opacity-40 p-6 rounded-lg text-center">
            <div className="text-4xl mb-4">📱</div>
            <h3 className="text-xl font-semibold mb-3">Easy Booking</h3>
            <p className="text-indigo-100">Book your entire trip with just a few clicks, with all reservations in one place.</p>
          </div>
          
          <div className="bg-indigo-800 bg-opacity-40 p-6 rounded-lg text-center">
            <div className="text-4xl mb-4">✨</div>
            <h3 className="text-xl font-semibold mb-3">Luxury Options</h3>
            <p className="text-indigo-100">Experience premium travel with our curated luxury accommodations and exclusive experiences.</p>
          </div>
          
          <div className="bg-indigo-800 bg-opacity-40 p-6 rounded-lg text-center">
            <div className="text-4xl mb-4">🗺️</div>
            <h3 className="text-xl font-semibold mb-3">Complete Itineraries</h3>
            <p className="text-indigo-100">Receive detailed day-by-day plans with all the information you need for a stress-free trip.</p>
          </div>
          
          <div className="bg-indigo-800 bg-opacity-40 p-6 rounded-lg text-center">
            <div className="text-4xl mb-4">🔄</div>
            <h3 className="text-xl font-semibold mb-3">Easy Adjustments</h3>
            <p className="text-indigo-100">Make changes to your itinerary anytime, with instant updates and new recommendations.</p>
          </div>
        </div>
        
        <div className="text-center mt-12">
          <button 
            onClick={() => router.push('/auth/signin')} 
            className="btn btn-lg bg-white text-indigo-900 hover:bg-gray-100"
          >
            Start Planning
          </button>
        </div>
      </div>
    </section>
  );
}

export default Features;