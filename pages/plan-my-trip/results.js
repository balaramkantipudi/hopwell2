import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import Link from "next/link";
import Footer from "@/components/Footer";
import { supabase } from "@/libs/supabase";
import TripHeader from "@/components/TripHeader";
import { useAuth } from "@/components/AuthContext";
import { processItinerary } from "@/libs/affiliatelinks"; // Import the utility function

export default function ResultsPage() {
  const [itineraryData, setItineraryData] = useState("");
  const [tripData, setTripData] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [tripTitle, setTripTitle] = useState("");
  const router = useRouter();
  const { user } = useAuth();

  // Add to useEffect in plan-my-trip/results.js
  useEffect(() => {
    const fetchItinerary = async () => {
      try {
        // Get the itinerary text from localStorage
        const storedItinerary = localStorage.getItem("itineraryAndBudget");
        
        // Get the form data from localStorage
        const storedFormData = localStorage.getItem("tripFormData");
        
        if (storedItinerary) {
          if (storedFormData) {
            try {
              const formData = JSON.parse(storedFormData);
              setTripData(formData);
              
              // Process the itinerary with our helper function
              const processedItinerary = processItinerary(storedItinerary, formData);
              setItineraryData(processedItinerary);
              
              // Extract destination from the itinerary for the title
              const destinationMatch = storedItinerary.match(/TRIP TO ([^-\n]+)/i);
              const defaultTitle = destinationMatch 
                ? `Trip to ${destinationMatch[1].trim()}` 
                : "My Travel Itinerary";
              
              setTripTitle(defaultTitle);
            } catch (error) {
              console.error("Error parsing form data:", error);
              setItineraryData(storedItinerary);
            }
          } else {
            setItineraryData(storedItinerary);
            
            // Extract destination for title without form data
            const destinationMatch = storedItinerary.match(/TRIP TO ([^-\n]+)/i);
            const defaultTitle = destinationMatch 
              ? `Trip to ${destinationMatch[1].trim()}` 
              : "My Travel Itinerary";
            
            setTripTitle(defaultTitle);
          }
        }
      } catch (error) {
        console.error("Error loading itinerary:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchItinerary();
  }, []);

  // Updated formatItinerary function for results page
  const formatItinerary = (text) => {
    if (!text) return [];
    
    // Process markdown with proper styling
    return text.split('\n').map((line, index) => {
      // Major section header (ALL CAPS with === or ---)
      if (line.match(/^[A-Z\s\d]{3,}$/) || line.match(/^#+\s+[A-Z\s\d]{3,}$/)) {
        return (
          <h2 key={index} className="text-2xl font-bold text-indigo-900 mt-8 mb-4">
            {line.replace(/^#+\s+/, "")}
          </h2>
        );
      }
      // Section divider line (=== or ---)
      else if (line.match(/^[=\-]{3,}$/)) {
        return <hr key={index} className="border-t border-gray-300 my-2" />;
      }
      // Subsection header (mixed case, usually ends with :)
      else if (line.match(/^##\s+.+/) || (line.match(/^[A-Z][a-z]/) && line.match(/:/))) {
        return (
          <h3 key={index} className="text-xl font-semibold text-indigo-800 mt-6 mb-2">
            {line.replace(/^##\s+/, "")}
          </h3>
        );
      }
      // Bold text (** or __)
      else if (line.match(/\*\*.+\*\*/) || line.match(/__.*__/)) {
        return (
          <p key={index} className="mb-2">
            {line.split(/(\*\*.*?\*\*|__.*?__)/g).map((part, i) => {
              if (part.startsWith('**') && part.endsWith('**')) {
                return <strong key={i}>{part.slice(2, -2)}</strong>;
              } else if (part.startsWith('__') && part.endsWith('__')) {
                return <strong key={i}>{part.slice(2, -2)}</strong>;
              }
              return part;
            })}
          </p>
        );
      }
      // Bullet point (- or *)
      else if (line.trim().startsWith('-') || line.trim().startsWith('*')) {
        const bulletContent = line.trim().substring(1).trim();
        
        // Check if the bullet content contains a link [text](url)
        if (bulletContent.match(/\[.*?\]\(.*?\)/)) {
          return (
            <p key={index} className="ml-6 mb-2 flex items-start">
              <span className="inline-block w-2 h-2 mt-2 rounded-full bg-indigo-600 mr-2 flex-shrink-0"></span>
              <span>
                {bulletContent.split(/(\[.*?\]\(.*?\))/g).map((part, i) => {
                  const linkMatch = part.match(/\[(.*?)\]\((.*?)\)/);
                  if (linkMatch) {
                    return <a key={i} href={linkMatch[2]} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">{linkMatch[1]}</a>;
                  }
                  return part;
                })}
              </span>
            </p>
          );
        }
        
        return (
          <p key={index} className="ml-6 mb-2 flex items-start">
            <span className="inline-block w-2 h-2 mt-2 rounded-full bg-indigo-600 mr-2 flex-shrink-0"></span>
            <span>{bulletContent}</span>
          </p>
        );
      }
      // Links [text](url)
      else if (line.match(/\[.*?\]\(.*?\)/)) {
        return (
          <p key={index} className="mb-2">
            {line.split(/(\[.*?\]\(.*?\))/g).map((part, i) => {
              const linkMatch = part.match(/\[(.*?)\]\((.*?)\)/);
              if (linkMatch) {
                return <a key={i} href={linkMatch[2]} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">{linkMatch[1]}</a>;
              }
              return part;
            })}
          </p>
        );
      }
      // Empty line
      else if (line.trim() === '') {
        return <div key={index} className="h-2"></div>;
      }
      // Regular paragraph
      else {
        return <p key={index} className="mb-2">{line}</p>;
      }
    });
  };

  // Corrected saveTrip function for the results page
  const saveTrip = async () => {
    if (!user) {
      alert("Please sign in to save your trip");
      router.push("/auth/signin");
      return;
    }

    setIsSaving(true);
    setSaveError("");

    try {
      // Get form data from localStorage if it exists
      let formData = {};
      try {
        const storedFormData = localStorage.getItem("tripFormData");
        if (storedFormData) {
          formData = JSON.parse(storedFormData);
        }
      } catch (e) {
        console.error("Error parsing stored form data:", e);
      }

      // Call the savetrip API endpoint
      const response = await fetch('/api/savetrip', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tripData: formData,
          itinerary: itineraryData,
          title: tripTitle
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save trip');
      }

      const result = await response.json();
      console.log('Save success:', result);

      setSaveSuccess(true);
      
      // Wait a short time then redirect to my-trips page
      setTimeout(() => {
        router.push("/my-trips");
      }, 2000);
    } catch (error) {
      console.error("Error saving trip:", error);
      setSaveError(error.message || "Failed to save trip. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  // Function to print the itinerary
  const printItinerary = () => {
    window.print();
  };

  return (
    <>
      <Head>
        <title>Your Travel Itinerary | Hopwell</title>
        <style type="text/css" media="print">
          {`
          @media print {
            header, footer, .no-print {
              display: none !important;
            }
            body {
              font-size: 12pt;
              color: #000;
              background-color: #fff;
            }
            .print-container {
              margin: 0;
              padding: 0;
            }
            h1 {
              font-size: 18pt;
              margin-bottom: 20pt;
            }
            h3 {
              font-size: 14pt;
              margin-top: 15pt;
              margin-bottom: 10pt;
            }
          }
          `}
        </style>
      </Head>

      <div className="bg-yellow-50 min-h-screen">
        <main className="print-container max-w-4xl mx-auto px-4 py-8">
          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-900"></div>
            </div>
          ) : (
            <>
              <div className="bg-white shadow-lg rounded-lg overflow-hidden">
                {/* Itinerary Header */}
                <div className="bg-indigo-900 text-white p-6">
                  <div className="flex justify-between items-center">
                    <h1 className="text-2xl md:text-3xl font-bold">{tripTitle}</h1>
                    
                    <div className="no-print">
                      <input
                        type="text"
                        value={tripTitle}
                        onChange={(e) => setTripTitle(e.target.value)}
                        className="px-3 py-2 bg-indigo-800 text-white rounded border border-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="Trip Title"
                      />
                    </div>
                  </div>
                  
                  <div className="mt-2 flex flex-wrap gap-4 items-center text-sm">
                    {tripData.destination && (
                      <div>
                        <span className="font-semibold">Destination:</span> {tripData.destination}
                      </div>
                    )}
                    {tripData.startDate && tripData.endDate && (
                      <div>
                        <span className="font-semibold">Dates:</span> {new Date(tripData.startDate).toLocaleDateString()} - {new Date(tripData.endDate).toLocaleDateString()}
                      </div>
                    )}
                    {tripData.groupCount && (
                      <div>
                        <span className="font-semibold">Travelers:</span> {tripData.groupCount || 1} {tripData.groupType ? tripData.groupType : 'people'}
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Itinerary Content */}
                <div className="p-6 md:p-8">
                  <div className="prose max-w-none">
                    {formatItinerary(itineraryData)}
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="border-t border-gray-200 bg-gray-50 p-4 no-print">
                  <div className="flex flex-wrap justify-between items-center">
                    <div className="flex space-x-4">
                      <Link href="/trip-planner" className="text-indigo-600 hover:text-indigo-800">
                        ← Create another trip
                      </Link>
                    </div>
                    
                    <div className="flex space-x-4">
                      {saveSuccess ? (
                        <div className="text-green-600 font-medium flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          Trip Saved!
                        </div>
                      ) : saveError ? (
                        <div className="text-red-600 font-medium">{saveError}</div>
                      ) : (
                        <button 
                          onClick={saveTrip}
                          disabled={isSaving}
                          className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 flex items-center"
                        >
                          {isSaving ? (
                            <>
                              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Saving...
                            </>
                          ) : (
                            <>
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M7.707 10.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V6h1a2 2 0 012 2v7a2 2 0 01-2 2H8a2 2 0 01-2-2v-7a2 2 0 012-2h1v5.586l-1.293-1.293z" />
                              </svg>
                              Save Trip
                            </>
                          )}
                        </button>
                      )}
                      
                      <button 
                        onClick={printItinerary}
                        className="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300 flex items-center"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M5 4v3H4a2 2 0 00-2 2v3a2 2 0 002 2h1v2a2 2 0 002 2h6a2 2 0 002-2v-2h1a2 2 0 002-2V9a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H7a2 2 0 00-2 2zm8 0H7v3h6V4zm0 8H7v4h6v-4z" clipRule="evenodd" />
                        </svg>
                        Print
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Additional Tips Section - Now with Affiliate Links */}
              <div className="mt-8 bg-white shadow-lg rounded-lg p-6 no-print">
                <h2 className="text-xl font-bold text-indigo-900 mb-4">Ready for Your Adventure?</h2>
                <p className="mb-4">This itinerary is just the beginning of your journey. Here are some next steps:</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                  <div className="flex items-start">
                    <div className="bg-indigo-100 p-2 rounded-full mr-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold">Book Your Accommodations</h3>
                      <p className="text-sm text-gray-600">
                        <a 
                          href={`https://www.expedia.com/Hotel-Search?destination=${encodeURIComponent(tripData.destination || '')}&startDate=${tripData.startDate || ''}&endDate=${tripData.endDate || ''}&adults=${tripData.groupCount || 1}&AFFCID=${process.env.NEXT_PUBLIC_EXPEDIA_AFFILIATE_CODE || 'ruMM23K'}`}
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-indigo-600 hover:underline"
                        >
                          Secure your stay early
                        </a> for the best prices and availability.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="bg-indigo-100 p-2 rounded-full mr-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold">Arrange Transportation</h3>
                      <p className="text-sm text-gray-600">
                        <a 
                          href={`https://www.skyscanner.com/transport/flights/${tripData.destination ? encodeURIComponent(tripData.destination) : ''}?adults=${tripData.groupCount || 1}&affiliateId=${process.env.NEXT_PUBLIC_SKYSCANNER_AFFILIATE_CODE || 'default'}`}
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-indigo-600 hover:underline"
                        >
                          Book flights
                        </a> or check out 
                        <a 
                          href={`https://www.villiersjets.com/?id=${process.env.NEXT_PUBLIC_VILLIERS_AFFILIATE_CODE || '10982'}`}
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-indigo-600 hover:underline ml-1"
                        >
                          premium private jet options
                        </a> for the ultimate travel experience.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="bg-indigo-100 p-2 rounded-full mr-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold">Check Travel Requirements</h3>
                      <p className="text-sm text-gray-600">Research visa requirements, travel insurance, and health guidelines.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="bg-indigo-100 p-2 rounded-full mr-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold">Share Your Plans</h3>
                      <p className="text-sm text-gray-600">Send your itinerary to fellow travelers and emergency contacts.</p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 text-center">
                  <Link href="/my-trips" className="text-indigo-600 hover:text-indigo-800 font-medium">
                    View All Saved Trips →
                  </Link>
                </div>
              </div>
            </>
          )}
        </main>
        
        <Footer />
      </div>
    </>
  );
}

ResultsPage.getLayout = function getLayout(page) {
  return page;
};