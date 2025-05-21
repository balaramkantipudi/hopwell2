// pages/purchase-credits.js
import { useState } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import Layout from "@/components/Layout";
import { useAuth } from "@/components/AuthContext";
import { supabase } from "@/libs/supabase";

export default function PurchaseCredits() {
  const { user } = useAuth();
  const router = useRouter();
  const [selectedOption, setSelectedOption] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const creditOptions = [
    { id: 1, amount: 5, price: 9.99, popular: false },
    { id: 2, amount: 10, price: 14.99, popular: true },
    { id: 3, amount: 20, price: 24.99, popular: false }
  ];

  const handlePurchase = async () => {
    if (!user) {
      router.push("/auth/signin?redirect=purchase-credits");
      return;
    }

    setIsProcessing(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const selectedPackage = creditOptions.find(option => option.id === selectedOption);
      
      // This is where you would integrate with a payment processor in a real application
      // For now, we'll simulate a successful purchase and add credits directly
      
      // Fetch current user credits
      const { data: userData, error: fetchError } = await supabase
        .from('profiles')
        .select('credits')
        .eq('id', user.id)
        .single();
        
      if (fetchError) throw fetchError;
      
      const currentCredits = userData?.credits || 0;
      
      // Update the user's credits
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ credits: currentCredits + selectedPackage.amount })
        .eq('id', user.id);
        
      if (updateError) throw updateError;
      
      // Show success message
      setSuccessMessage(`Successfully purchased ${selectedPackage.amount} credits!`);
      
      // Redirect to trip planner after a delay
      setTimeout(() => {
        router.push('/trip-planner');
      }, 2000);
      
    } catch (error) {
      console.error('Error processing purchase:', error);
      setErrorMessage("There was an error processing your purchase. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Layout>
      <Head>
        <title>Purchase Credits | Hopwell</title>
      </Head>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-indigo-900">Purchase Travel Credits</h1>
            <p className="mt-2 text-gray-600">Credits let you generate custom travel itineraries for your adventures</p>
          </div>

          {errorMessage && (
            <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg">
              {errorMessage}
            </div>
          )}

          {successMessage && (
            <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-lg">
              {successMessage}
            </div>
          )}

          <div className="bg-white shadow-lg rounded-lg overflow-hidden">
            <div className="p-6 md:p-8">
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold mb-4">Select a Credit Package</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {creditOptions.map((option) => (
                      <div key={option.id} className="relative">
                        {option.popular && (
                          <div className="absolute -top-2 -right-2 bg-indigo-500 text-white text-xs px-2 py-1 rounded-full">
                            Best Value
                          </div>
                        )}
                        <input
                          type="radio"
                          id={`option-${option.id}`}
                          name="creditOption"
                          checked={selectedOption === option.id}
                          onChange={() => setSelectedOption(option.id)}
                          className="sr-only"
                        />
                        <label
                          htmlFor={`option-${option.id}`}
                          className={`block p-4 border-2 rounded-lg cursor-pointer transition h-full flex flex-col ${
                            selectedOption === option.id
                              ? 'border-indigo-500 bg-indigo-50'
                              : 'border-gray-200 hover:border-indigo-300'
                          }`}
                        >
                          <span className="text-2xl font-bold text-indigo-700 mb-2">{option.amount} Credits</span>
                          <span className="text-xl font-medium">${option.price}</span>
                          <span className="text-gray-500 text-sm mt-1">${(option.price / option.amount).toFixed(2)} per credit</span>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-medium mb-2">What you can do with credits:</h3>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-500 mr-2 flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span>Generate personalized travel itineraries for any destination</span>
                    </li>
                    <li className="flex items-start">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-500 mr-2 flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span>Get customized recommendations for activities, restaurants, and accommodations</span>
                    </li>
                    <li className="flex items-start">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-500 mr-2 flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span>Save and print detailed itineraries for your trips</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-6 flex justify-between items-center">
              <p className="text-gray-600">
                Selected: <span className="font-medium">{creditOptions.find(option => option.id === selectedOption)?.amount} Credits</span>
              </p>
              <button
                onClick={handlePurchase}
                disabled={isProcessing}
                className={`px-6 py-3 rounded-lg font-medium flex items-center ${
                  isProcessing ? 'bg-gray-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                }`}
              >
                {isProcessing ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </>
                ) : (
                  `Purchase for $${creditOptions.find(option => option.id === selectedOption)?.price}`
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}