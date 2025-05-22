// pages/trip-planner.js
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import TripHeader from "@/components/TripHeader";
import Footer from "@/components/Footer";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useAuth } from "@/components/AuthContext";
import { supabase } from "@/libs/supabase";
import Link from "next/link";

const interests = [
  "Beaches & Relaxation",
  "Culture & History",
  "Food & Dining",
  "Nature & Outdoors",
  "Adventure & Sports",
  "Nightlife & Entertainment",
  "Shopping",
  "Arts & Museums",
  "Family Friendly",
  "Local Experiences"
];

export default function TripPlanner() {
  const { user } = useAuth();
  const router = useRouter();
  const [userCredits, setUserCredits] = useState(null);
  const [nextResetDate, setNextResetDate] = useState('');
  const [creditCheckDone, setCreditCheckDone] = useState(false);
  
  const [formData, setFormData] = useState({
    destination: "",
    startDate: null,
    endDate: null,
    budget: "moderate",
    interests: [],
    groupType: "solo",
    groupCount: 1
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [responseError, setResponseError] = useState("");

  // Redirect if not authenticated
  useEffect(() => {
    if (!user) {
      router.push('/auth/signin?redirect=trip-planner');
      return;
    }
  }, [user, router]);

  // Fetch user credits when component mounts
  useEffect(() => {
    if (user) {
      fetchUserCredits();
    }
  }, [user]);

  const fetchUserCredits = async () => {
    try {
      // Fetch credits from the database
      const { data, error } = await supabase
        .from('user_credits')
        .select('*')
        .eq('user_id', user.id)
        .single();
        
      if (error) {
        // If no record exists, initialize one
        if (error.code === 'PGRST116') {
          await initializeUserCredits();
          return;
        }
        throw error;
      }
      
      // Check if credits need to be reset (monthly)
      const lastReset = data.last_credit_reset ? new Date(data.last_credit_reset) : null;
      const now = new Date();
      
      if (!lastReset || 
          lastReset.getMonth() !== now.getMonth() || 
          lastReset.getFullYear() !== now.getFullYear()) {
        
        // Reset credits for new month
        const { error: resetError } = await supabase
          .from('user_credits')
          .update({
            credits_remaining: 30,
            last_credit_reset: now.toISOString()
          })
          .eq('user_id', user.id);
          
        if (resetError) {
          console.error('Error resetting credits:', resetError);
        }
        
        setUserCredits(30);
      } else {
        setUserCredits(data.credits_remaining || 0);
      }
      
      // Calculate next reset date
      const resetDate = lastReset || now;
      const nextReset = new Date(resetDate);
      nextReset.setMonth(nextReset.getMonth() + 1);
      nextReset.setDate(1);
      setNextResetDate(nextReset.toLocaleDateString());
      
      setCreditCheckDone(true);
    } catch (error) {
      console.error('Error fetching user credits:', error);
      setUserCredits(0);
      setCreditCheckDone(true);
    }
  };

  const initializeUserCredits = async () => {
    try {
      const response = await fetch('/api/credits/initialize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to initialize credits');
      }
      
      const result = await response.json();
      
      if (result.success) {
        setUserCredits(result.credits.credits_remaining);
        
        // Calculate next reset date
        const resetDate = new Date(result.credits.reset_date);
        const nextReset = new Date(resetDate);
        nextReset.setMonth(nextReset.getMonth() + 1);
        nextReset.setDate(1);
        setNextResetDate(nextReset.toLocaleDateString());
      }
      
      setCreditCheckDone(true);
    } catch (error) {
      console.error('Error initializing credits:', error);
      setUserCredits(0);
      setCreditCheckDone(true);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.destination.trim()) {
      newErrors.destination = "Destination is required";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDateChange = (dateType, date) => {
    setFormData((prev) => ({
      ...prev,
      [dateType]: date
    }));
  };

  const handleInterestChange = (interest) => {
    setFormData((prev) => {
      const newInterests = [...prev.interests];
      
      if (newInterests.includes(interest)) {
        return {
          ...prev,
          interests: newInterests.filter(item => item !== interest)
        };
      } else {
        return {
          ...prev,
          interests: [...newInterests, interest]
        };
      }
    });
  };

  // Updated handleSubmit function for trip-planner.js
// Replace the existing handleSubmit function with this one

const handleSubmit = async (e) => {
  e.preventDefault();
  
  // Check if user has enough credits
  if (userCredits < 1) {
    setResponseError("You don't have enough credits to generate an itinerary. You'll get 30 new credits next month.");
    return;
  }
  
  if (!validateForm()) {
    return;
  }
  
  setIsLoading(true);
  setResponseError("");
  
  try {
    // Save form data to localStorage
    localStorage.setItem("tripFormData", JSON.stringify(formData));
    
    // Get the current session for authentication
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.access_token) {
      throw new Error('Authentication required. Please sign in again.');
    }
    
    // Call the generate-itinerary API with proper authentication
    const response = await fetch("/api/generate-itinerary", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${session.access_token}`,
        "x-user-id": session.user.id
      },
      body: JSON.stringify(formData)
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      // Handle specific error cases
      if (response.status === 401) {
        throw new Error('Authentication expired. Please sign in again.');
      } else if (response.status === 403) {
        throw new Error(data.error || 'Not enough credits to generate itinerary');
      } else {
        throw new Error(data.error || `Request failed: ${response.status}`);
      }
    }
    
    // Update the local credit count
    if (data.creditsRemaining !== undefined) {
      setUserCredits(data.creditsRemaining);
    } else {
      // Fallback if server doesn't return the new balance
      setUserCredits(prev => Math.max(0, prev - 1));
    }
    
    // Store the generated itinerary in localStorage
    localStorage.setItem("itineraryAndBudget", data.itinerary);
    
    // Redirect to the results page
    router.push("/plan-my-trip/results");
    
  } catch (error) {
    console.error("Error generating itinerary:", error);
    
    // Handle authentication errors specifically
    if (error.message.includes('Authentication') || error.message.includes('sign in')) {
      setResponseError("Authentication required. Please sign in again.");
      setTimeout(() => {
        router.push('/auth/signin?redirect=trip-planner');
      }, 2000);
    } else {
      setResponseError(error.message || "Failed to generate itinerary. Please try again.");
    }
  } finally {
    setIsLoading(false);
  }
};

  // Show loading if not authenticated yet
  if (!user) {
    return (
      <div className="min-h-screen bg-yellow-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-900"></div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Plan Your Trip | Hopwell</title>
      </Head>

      <TripHeader />
      
      <div className="bg-gray-50 min-h-screen py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Plan Your Dream Trip</h1>
              <p className="mt-2 text-gray-600">Tell us about your travel preferences and we'll create a personalized itinerary</p>
            </div>
            
            {/* Credit Information */}
            {creditCheckDone && (
              <div className="mb-6 bg-white rounded-lg p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className={`w-4 h-4 rounded-full mr-3 ${
                      userCredits > 5 ? 'bg-green-500' : 
                      userCredits > 0 ? 'bg-yellow-500' : 
                      'bg-red-500'
                    }`}></div>
                    <span className="text-gray-700">
                      You have <span className="font-bold text-indigo-600">{userCredits}</span> credits remaining
                    </span>
                  </div>
                  <div className="text-sm text-gray-500">
                    Resets: {nextResetDate}
                  </div>
                </div>
                {userCredits < 5 && (
                  <div className="mt-2 text-sm text-amber-600">
                    {userCredits === 0 ? 
                      "You're out of credits! You'll get 30 new credits on your next reset date." :
                      "Running low on credits! Each itinerary uses 1 credit."
                    }
                  </div>
                )}
              </div>
            )}
            
            {responseError && (
              <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg border border-red-200">
                <div className="flex">
                  <svg className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <span>{responseError}</span>
                </div>
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="bg-white shadow-lg rounded-lg overflow-hidden">
              <div className="p-6 md:p-8">
                <div className="space-y-6">
                  {/* Destination */}
                  <div>
                    <label htmlFor="destination" className="block text-gray-700 font-medium mb-2">Where do you want to go?</label>
                    <input
                      type="text"
                      id="destination"
                      name="destination"
                      value={formData.destination}
                      onChange={handleChange}
                      placeholder="City, Country, or Region"
                      className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none transition
                       bg-white text-gray-900 ${errors.destination ? 'border-red-500' : 'border-gray-300'}`}
                    />
                    {errors.destination && (
                      <p className="mt-1 text-red-500 text-sm">{errors.destination}</p>
                    )}
                  </div>
                  
                  {/* Date Range */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="startDate" className="block text-gray-700 font-medium mb-2">Start Date</label>
                      <DatePicker
                        id="startDate"
                        selected={formData.startDate}
                        onChange={(date) => handleDateChange("startDate", date)}
                        selectsStart
                        startDate={formData.startDate}
                        endDate={formData.endDate}
                        minDate={new Date()}
                        placeholderText="Select start date"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none transition bg-white text-gray-900"
                      />
                    </div>
                    <div>
                      <label htmlFor="endDate" className="block text-gray-700 font-medium mb-2">End Date</label>
                      <DatePicker
                        id="endDate"
                        selected={formData.endDate}
                        onChange={(date) => handleDateChange("endDate", date)}
                        selectsEnd
                        startDate={formData.startDate}
                        endDate={formData.endDate}
                        minDate={formData.startDate || new Date()}
                        placeholderText="Select end date"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none transition bg-white text-gray-900"
                      />
                    </div>
                  </div>
                  
                  {/* Budget */}
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">Budget</label>
                    <div className="grid grid-cols-3 gap-4">
                      {['budget', 'moderate', 'luxury'].map((option) => (
                        <div key={option} className="relative">
                          <input
                            type="radio"
                            id={option}
                            name="budget"
                            value={option}
                            checked={formData.budget === option}
                            onChange={handleChange}
                            className="sr-only"
                          />
                          <label
                            htmlFor={option}
                            className={`block p-3 text-center border rounded-lg cursor-pointer transition ${
                              formData.budget === option ? 'bg-indigo-50 border-indigo-500 text-indigo-700' : 'border-gray-300 hover:border-indigo-300'
                            }`}
                          >
                            {option.charAt(0).toUpperCase() + option.slice(1)}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Interests */}
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">Interests (Select all that apply)</label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {interests.map((interest) => (
                        <div key={interest} className="relative">
                          <input
                            type="checkbox"
                            id={interest}
                            name="interests"
                            value={interest}
                            checked={formData.interests.includes(interest)}
                            onChange={() => handleInterestChange(interest)}
                            className="sr-only"
                          />
                          <label
                            htmlFor={interest}
                            className={`block p-3 text-center border rounded-lg cursor-pointer text-sm transition ${
                              formData.interests.includes(interest) ? 'bg-indigo-50 border-indigo-500 text-indigo-700' : 'border-gray-300 hover:border-indigo-300'
                            }`}
                          >
                            {interest}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Group */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="groupType" className="block text-gray-700 font-medium mb-2">Traveling As</label>
                      <select
                        id="groupType"
                        name="groupType"
                        value={formData.groupType}
                        onChange={handleChange}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none transition bg-white text-gray-900"
                      >
                        <option value="solo">Solo Traveler</option>
                        <option value="couple">Couple</option>
                        <option value="family">Family</option>
                        <option value="friends">Friends</option>
                        <option value="business">Business</option>
                      </select>
                    </div>
                    <div>
                      <label htmlFor="groupCount" className="block text-gray-700 font-medium mb-2">Number of Travelers</label>
                      <input
                        type="number"
                        id="groupCount"
                        name="groupCount"
                        value={formData.groupCount}
                        onChange={handleChange}
                        min="1"
                        max="20"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none transition bg-white text-gray-900"
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 p-6 flex justify-between items-center">
                <div className="text-sm text-gray-600">
                  {userCredits > 0 ? (
                    <span>This will use 1 credit from your monthly allowance</span>
                  ) : (
                    <span className="text-red-600 font-medium">You need at least 1 credit to generate an itinerary</span>
                  )}
                </div>
                <div className="flex space-x-3">
                  {userCredits < 1 && (
                    <Link 
                      href="/pricing"
                      className="px-4 py-2 text-indigo-600 border border-indigo-600 rounded-lg hover:bg-indigo-50 transition"
                    >
                      Get Credits
                    </Link>
                  )}
                  <button
                    type="submit"
                    disabled={isLoading || userCredits < 1}
                    className={`px-6 py-3 rounded-lg font-medium flex items-center ${
                      isLoading || userCredits < 1 ? 'bg-gray-400 cursor-not-allowed text-white' : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                    }`}
                  >
                    {isLoading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Generating...
                      </>
                    ) : (
                      'Create My Itinerary'
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}