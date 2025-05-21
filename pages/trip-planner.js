// pages/trip-planner.js
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import TripHeader from "@/components/TripHeader"; // Import the TripHeader
import Footer from "@/components/Footer";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useAuth } from "@/components/AuthContext";
import { checkUserCredits } from '../libs/CreditSystem';
import { supabase } from "@/libs/supabase";

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
  const [userCredits, setUserCredits] = useState(0);
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

  // Fetch user credits when component mounts
  useEffect(() => {
    if (user) {
      fetchUserCredits();
    }
  }, [user]);

  const fetchUserCredits = async () => {
    try {
      const creditCheck = await checkUserCredits(user.id, 0);
      setUserCredits(creditCheck.currentCredits);
      
      // Fetch the last reset date to calculate next reset
      const { data, error } = await supabase
        .from('user_credits')
        .select('last_credit_reset')
        .eq('user_id', user.id)
        .single();
        
      if (error) throw error;
      
      // Calculate next reset date
      const lastReset = data?.last_credit_reset ? new Date(data.last_credit_reset) : new Date();
      const nextReset = new Date(lastReset);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!user) {
      // Redirect to sign in if not logged in
      router.push("/auth/signin?redirect=trip-planner");
      return;
    }
    
    // Check if user has enough credits
    if (userCredits < 1) {
      setResponseError("You don't have enough credits to generate an itinerary.");
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
      
      // Call the generate-itinerary API
      const response = await fetch("/api/generate-itinerary", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Failed to generate itinerary");
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
      setResponseError(error.message || "Failed to generate itinerary. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Plan Your Trip | Hopwell</title>
      </Head>

      {/* Use the TripHeader component */}
      <TripHeader />
      
      <div className="bg-gray-50 min-h-screen py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Plan Your Dream Trip</h1>
              <p className="mt-2 text-gray-600">Tell us about your travel preferences and we'll create a personalized itinerary</p>
            </div>
            
            {/* Monthly Credit Information */}
            {creditCheckDone && (
              <div className="mb-6 text-center">
                <div className="inline-flex items-center px-4 py-2 rounded-full bg-indigo-50 text-indigo-700">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  You get <span className="font-bold mx-1">30</span> free credits each month. Next reset: {nextResetDate}
                </div>
              </div>
            )}
            
            {responseError && (
              <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg">
                {responseError}
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
                <div className="text-sm text-gray-500">
                  {userCredits > 0 ? (
                    <span>This will use 1 credit from your monthly allowance</span>
                  ) : (
                    <span className="text-red-500">You need at least 1 credit to generate an itinerary</span>
                  )}
                </div>
                <button
                  type="submit"
                  disabled={isLoading || userCredits < 1}
                  className={`px-6 py-3 rounded-lg font-medium flex items-center ${
                    isLoading || userCredits < 1 ? 'bg-gray-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 text-white'
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
            </form>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}