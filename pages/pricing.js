// pages/pricing.js
import { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useAuth } from '@/components/AuthContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import UserCreditStatus from '@/components/UserCreditStatus';

// Define the credit packages
const creditPackages = [
  {
    id: 'basic',
    name: 'Basic',
    credits: 5,
    price: 9.99,
    description: 'Perfect for a single trip',
    features: [
      '5 AI Itinerary Credits',
      'Full destination details',
      'Customized recommendations',
      'Booking assistance',
    ],
    popular: false,
    priceId: 'price_basic', // Your Stripe price ID for this package
  },
  {
    id: 'standard',
    name: 'Explorer',
    credits: 15,
    price: 19.99,
    description: 'Our most popular plan',
    features: [
      '15 AI Itinerary Credits',
      'Full destination details',
      'Customized recommendations',
      'Booking assistance',
      'Priority support',
    ],
    popular: true,
    priceId: 'price_explorer', // Your Stripe price ID for this package
  },
  {
    id: 'premium',
    name: 'Voyager',
    credits: 50,
    price: 49.99,
    description: 'For frequent travelers',
    features: [
      '50 AI Itinerary Credits',
      'Full destination details',
      'Customized recommendations',
      'Booking assistance',
      'Priority support',
      'Extra destination insights',
      'Weather forecasting',
    ],
    popular: false,
    priceId: 'price_voyager', // Your Stripe price ID for this package
  },
];

export default function Pricing() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [processingPackage, setProcessingPackage] = useState(null);
  
  const handlePurchase = async (packageId) => {
    if (!user) {
      router.push('/auth/signin?redirect=/pricing');
      return;
    }
    
    setProcessingPackage(packageId);
    
    try {
      const selectedPackage = creditPackages.find(pkg => pkg.id === packageId);
      
      if (!selectedPackage) {
        throw new Error('Package not found');
      }
      
      // Create a checkout session
      const response = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId: selectedPackage.priceId,
          successUrl: `${window.location.origin}/dashboard?purchase=success`,
          cancelUrl: `${window.location.origin}/pricing?canceled=true`,
        }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create checkout session');
      }
      
      const { url } = await response.json();
      
      // Redirect to Stripe checkout
      window.location.href = url;
      
    } catch (error) {
      console.error('Purchase error:', error);
      alert(`Error: ${error.message}`);
    } finally {
      setProcessingPackage(null);
    }
  };
  
  return (
    <>
      <Head>
        <title>Pricing | HOPWELL</title>
      </Head>
      
      <Header />
      
      <main className="bg-yellow-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h1 className="text-4xl font-bold text-indigo-900 mb-4">Get More Travel Credits</h1>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Unlock more itineraries with our flexible credit packages. Each credit lets you generate one complete AI-powered travel plan.
            </p>
          </div>
          
          {/* User's current credits (if logged in) */}
          {user && !loading && (
            <div className="max-w-md mx-auto mb-16">
              <UserCreditStatus />
            </div>
          )}
          
          {/* Pricing Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {creditPackages.map((pkg) => (
              <div 
                key={pkg.id}
                className={`relative bg-white rounded-lg shadow-lg overflow-hidden transition-transform hover:transform hover:scale-105 ${pkg.popular ? 'border-2 border-indigo-500 md:scale-105' : ''}`}
              >
                {pkg.popular && (
                  <div className="absolute top-0 inset-x-0 transform translate-y-px">
                    <div className="flex justify-center transform -translate-y-1/2">
                      <span className="inline-flex rounded-full bg-indigo-600 px-4 py-1 text-sm font-semibold tracking-wider uppercase text-white">
                        Most Popular
                      </span>
                    </div>
                  </div>
                )}
                
                <div className="p-6">
                  <h3 className="text-2xl font-bold text-center text-indigo-900 mb-2">{pkg.name}</h3>
                  <p className="text-center text-gray-500 mb-6">{pkg.description}</p>
                  
                  <div className="flex justify-center items-baseline mb-8">
                    <span className="text-5xl font-extrabold text-indigo-900">${pkg.price}</span>
                    <span className="ml-1 text-xl text-gray-500">/one-time</span>
                  </div>
                  
                  <div className="text-center mb-6">
                    <span className="inline-flex items-center px-4 py-2 rounded-full bg-indigo-100 text-indigo-800 text-lg font-medium">
                      {pkg.credits} Credits
                    </span>
                  </div>
                  
                  <ul className="space-y-4 mb-10">
                    {pkg.features.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <svg className="flex-shrink-0 h-6 w-6 text-green-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="ml-3 text-base text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <button
                    onClick={() => handlePurchase(pkg.id)}
                    disabled={processingPackage === pkg.id}
                    className={`w-full rounded-lg py-3 px-4 font-medium text-white shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-opacity-75 ${
                      pkg.popular 
                        ? 'bg-indigo-600 hover:bg-indigo-700' 
                        : 'bg-indigo-500 hover:bg-indigo-600'
                    } ${processingPackage === pkg.id ? 'opacity-75 cursor-not-allowed' : ''}`}
                  >
                    {processingPackage === pkg.id ? (
                      <div className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing...
                      </div>
                    ) : (
                      <>Purchase Now</>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          {/* FAQ Section */}
          <div className="max-w-3xl mx-auto mt-20">
            <h2 className="text-3xl font-bold text-center text-indigo-900 mb-8">Frequently Asked Questions</h2>
            
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-indigo-900 mb-2">What can I do with travel credits?</h3>
                <p className="text-gray-700">Each credit allows you to generate one complete AI-powered travel itinerary with detailed recommendations for accommodations, activities, restaurants, and more.</p>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-indigo-900 mb-2">Do credits expire?</h3>
                <p className="text-gray-700">No, your purchased credits never expire. Use them whenever you're planning your next adventure!</p>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-indigo-900 mb-2">Can I share my credits with friends?</h3>
                <p className="text-gray-700">Credits are linked to your account and cannot be transferred. However, you can generate itineraries and share them with friends.</p>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-indigo-900 mb-2">What payment methods do you accept?</h3>
                <p className="text-gray-700">We accept all major credit cards, debit cards, and digital wallets through our secure payment processor, Stripe.</p>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </>
  );
}