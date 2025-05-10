import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import AuthLayout from '@/components/AuthLayout';

export default function TripPlanner() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [formData, setFormData] = useState({
    destination: '',
    origin: '',
    transportMode: 'air', // Default to air travel
    startDate: null,
    endDate: null,
    hotelStyle: '',
    cuisine: '',
    theme: '',
    groupType: '',
    groupCount: 1
    // Removed budget and priority
  });
  
  // Form validation
  const [errors, setErrors] = useState({});
  
  // Set minimum dates
  const today = new Date();
  const [minEndDate, setMinEndDate] = useState(today);
  
  // Update min end date when start date changes
  useEffect(() => {
    if (formData.startDate) {
      // Set minimum end date to be the selected start date
      setMinEndDate(formData.startDate);
      
      // If current end date is before new start date, update it
      if (formData.endDate && formData.endDate < formData.startDate) {
        setFormData({
          ...formData,
          endDate: formData.startDate
        });
      }
    }
  }, [formData.startDate]);
  
  // Auto-set group count based on group type
  useEffect(() => {
    if (formData.groupType === 'solo') {
      setFormData({
        ...formData,
        groupCount: 1
      });
    } else if (formData.groupType === 'couple') {
      setFormData({
        ...formData,
        groupCount: 2
      });
    }
  }, [formData.groupType]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear validation error when field is updated
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null
      });
    }
  };
  
  // Handle date changes from DatePicker
  const handleDateChange = (name, date) => {
    setFormData({
      ...formData,
      [name]: date
    });
    
    // Clear validation error when field is updated
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null
      });
    }
  };

  const validateStep = (stepNumber) => {
    const newErrors = {};
    
    switch (stepNumber) {
      case 1:
        if (!formData.destination.trim()) newErrors.destination = 'Destination is required';
        if (!formData.origin.trim()) newErrors.origin = 'Origin is required';
        if (!formData.transportMode) newErrors.transportMode = 'Please select a transportation method';
        if (!formData.startDate) newErrors.startDate = 'Start date is required';
        if (!formData.endDate) newErrors.endDate = 'End date is required';
        break;
      case 2:
        if (!formData.hotelStyle) newErrors.hotelStyle = 'Please select accommodation preference';
        if (!formData.theme) newErrors.theme = 'Please select a trip theme';
        if (!formData.groupType) newErrors.groupType = 'Please select a group type';
        if (formData.groupType !== 'solo' && formData.groupType !== 'couple' && (!formData.groupCount || formData.groupCount < 1)) {
          newErrors.groupCount = 'Please enter a valid number of people';
        }
        break;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(step)) {
      setStep(step + 1);
    }
  };

  const prevStep = () => {
    setStep(step - 1);
  };
  
  // Save form data to localStorage
  const saveFormDataToStorage = () => {
    // Convert dates to ISO strings for storage
    const dataToStore = {
      ...formData,
      startDate: formData.startDate ? formData.startDate.toISOString() : null,
      endDate: formData.endDate ? formData.endDate.toISOString() : null
    };
    localStorage.setItem('tripFormData', JSON.stringify(dataToStore));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep(step)) return;
    
    setStep(3); // Show loading state (now step 3 because we removed step 4)
    setIsGenerating(true);
    
    // Save form data to localStorage first
    saveFormDataToStorage();
    
    try {
      // Format dates for API
      const dataToSend = {
        ...formData,
        startDate: formData.startDate ? formData.startDate.toISOString() : null,
        endDate: formData.endDate ? formData.endDate.toISOString() : null,
        // Add default values for required API parameters that were removed from the form
        budget: '1000', // Default budget value
        priority: 'experience' // Default priority value
      };
      
      // Send data to our API endpoint
      const res = await fetch('/api/direct-itinerary', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSend),
      });
      
      // Parse response as text first to debug any issues
      const responseText = await res.text();
      
      // Try to parse as JSON
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (error) {
        console.error('Failed to parse response as JSON:', responseText);
        throw new Error('Invalid response from server. Please try again.');
      }
      
      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate itinerary');
      }
      
      if (!data.text) {
        throw new Error('No itinerary text received from API');
      }
      
      // Store the generated itinerary in localStorage
      localStorage.setItem('itineraryAndBudget', data.text);
      
      // Wait a moment to show the loading screen, then redirect to results
      setTimeout(() => {
        router.push('/plan-my-trip/results');
      }, 2000);
      
    } catch (error) {
      console.error('Itinerary generation error:', error);
      setStep(2); // Go back to the previous step to allow retry
      setIsGenerating(false);
      
      // Show an error alert with more details
      alert(`Failed to generate itinerary: ${error.message}. Please try again.`);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-6 text-indigo-900">Where are you going?</h2>
            
            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-2">Destination <span className="text-red-500">*</span></label>
              <input
                type="text"
                name="destination"
                value={formData.destination}
                onChange={handleChange}
                placeholder="City, Country"
                className={`w-full p-3 border ${errors.destination ? 'border-red-500' : 'border-gray-300'} bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500`}
              />
              {errors.destination && <p className="text-red-500 text-sm mt-1">{errors.destination}</p>}
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-2">Origin <span className="text-red-500">*</span></label>
              <input
                type="text"
                name="origin"
                value={formData.origin}
                onChange={handleChange}
                placeholder="Where are you starting from?"
                className={`w-full p-3 border ${errors.origin ? 'border-red-500' : 'border-gray-300'} bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500`}
              />
              {errors.origin && <p className="text-red-500 text-sm mt-1">{errors.origin}</p>}
            </div>
            
            <div className="mb-4">
              <div className="flex items-center justify-between mb-1">
                <label className="block text-gray-700 font-medium">Transportation Method <span className="text-red-500">*</span></label>
                <div className="flex items-center space-x-4">
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      name="transportMode"
                      value="air"
                      checked={formData.transportMode === 'air'}
                      onChange={handleChange}
                      className="hidden"
                    />
                    <span className={`px-3 py-1 rounded-full text-sm font-medium cursor-pointer transition-colors ${formData.transportMode === 'air' ? 'bg-indigo-100 text-indigo-700 ring-2 ring-indigo-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                      Airways
                    </span>
                  </label>
                  
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      name="transportMode"
                      value="drive"
                      checked={formData.transportMode === 'drive'}
                      onChange={handleChange}
                      className="hidden"
                    />
                    <span className={`px-3 py-1 rounded-full text-sm font-medium cursor-pointer transition-colors ${formData.transportMode === 'drive' ? 'bg-indigo-100 text-indigo-700 ring-2 ring-indigo-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                      Drive
                    </span>
                  </label>
                  
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      name="transportMode"
                      value="public"
                      checked={formData.transportMode === 'public'}
                      onChange={handleChange}
                      className="hidden"
                    />
                    <span className={`px-3 py-1 rounded-full text-sm font-medium cursor-pointer transition-colors ${formData.transportMode === 'public' ? 'bg-indigo-100 text-indigo-700 ring-2 ring-indigo-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                      Public
                    </span>
                  </label>
                </div>
              </div>
              {errors.transportMode && <p className="text-red-500 text-sm mt-1">{errors.transportMode}</p>}
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-gray-700 font-medium mb-2">Start Date <span className="text-red-500">*</span></label>
                <DatePicker
                  selected={formData.startDate}
                  onChange={(date) => handleDateChange('startDate', date)}
                  minDate={today}
                  placeholderText="Select start date"
                  dateFormat="MMMM d, yyyy"
                  className={`w-full p-3 border ${errors.startDate ? 'border-red-500' : 'border-gray-300'} bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                />
                {errors.startDate && <p className="text-red-500 text-sm mt-1">{errors.startDate}</p>}
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-2">End Date <span className="text-red-500">*</span></label>
                <DatePicker
                  selected={formData.endDate}
                  onChange={(date) => handleDateChange('endDate', date)}
                  minDate={formData.startDate || today}
                  placeholderText="Select end date"
                  dateFormat="MMMM d, yyyy"
                  className={`w-full p-3 border ${errors.endDate ? 'border-red-500' : 'border-gray-300'} bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                  disabled={!formData.startDate}
                />
                {errors.endDate && <p className="text-red-500 text-sm mt-1">{errors.endDate}</p>}
                {!formData.startDate && !errors.endDate && (
                  <p className="text-gray-500 text-sm mt-1">Please select a start date first</p>
                )}
              </div>
            </div>
            
            <div className="flex justify-end">
              <button
                onClick={nextStep}
                className="bg-indigo-600 text-white py-3 px-6 rounded-lg hover:bg-indigo-700 transition duration-300"
              >
                Next
              </button>
            </div>
          </div>
        );
        
      case 2:
        return (
          <div className="p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-6 text-indigo-900">Trip Details & Preferences</h2>
            
            {/* Trip Style Section */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-4 text-indigo-700 border-b pb-2">Trip Style</h3>
              
              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2">Accommodation Preference <span className="text-red-500">*</span></label>
                <select
                  name="hotelStyle"
                  value={formData.hotelStyle}
                  onChange={handleChange}
                  className={`w-full p-3 border ${errors.hotelStyle ? 'border-red-500' : 'border-gray-300'} bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                >
                  <option value="">Select your preference</option>
                  <option value="ultraLuxury">Ultra Luxury</option>
                  <option value="luxury">Luxury</option>
                  <option value="comfortable">Comfortable</option>
                  <option value="budget">Budget</option>
                  <option value="experience">Unique Experience</option>
                </select>
                {errors.hotelStyle && <p className="text-red-500 text-sm mt-1">{errors.hotelStyle}</p>}
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2">Cuisine Preferences</label>
                <input
                  type="text"
                  name="cuisine"
                  value={formData.cuisine}
                  onChange={handleChange}
                  placeholder="What cuisines do you enjoy?"
                  className="w-full p-3 border border-gray-300 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2">Trip Theme <span className="text-red-500">*</span></label>
                <select
                  name="theme"
                  value={formData.theme}
                  onChange={handleChange}
                  className={`w-full p-3 border ${errors.theme ? 'border-red-500' : 'border-gray-300'} bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                >
                  <option value="">Select a theme</option>
                  <option value="relaxation">Relaxation & Vibe</option>
                  <option value="adventure">Indoor & Outdoor Adventure</option>
                  <option value="sightseeing">Downtown Sightseeing</option>
                  <option value="religious">Religious</option>
                  <option value="sports">Sports & Games</option>
                  <option value="historic">Historic Sightseeing</option>
                  <option value="unique">Unique & Must-See</option>
                  <option value="nature">Trekking & Nature</option>
                  <option value="honeymoon">Honeymoon</option>
                  <option value="camping">Camping & Nature Stay</option>
                  <option value="nightlife">Nightlife & Concerts</option>
                  <option value="photoshoot">Photo Shoot</option>
                </select>
                {errors.theme && <p className="text-red-500 text-sm mt-1">{errors.theme}</p>}
              </div>
            </div>
            
            {/* Group Information Section */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-4 text-indigo-700 border-b pb-2">Group Information</h3>
              
              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2">Group Type <span className="text-red-500">*</span></label>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                  {['solo', 'couple', 'family', 'friends', 'work'].map((type) => (
                    <label key={type} className="inline-flex items-center">
                      <input
                        type="radio"
                        name="groupType"
                        value={type}
                        checked={formData.groupType === type}
                        onChange={handleChange}
                        className="hidden"
                      />
                      <span className={`w-full text-center px-3 py-2 rounded-md text-sm font-medium cursor-pointer transition-colors ${formData.groupType === type ? 'bg-indigo-100 text-indigo-700 ring-2 ring-indigo-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </span>
                    </label>
                  ))}
                </div>
                {errors.groupType && <p className="text-red-500 text-sm mt-1">{errors.groupType}</p>}
              </div>
              
              {/* Conditionally show group count field only for group types other than solo and couple */}
              {formData.groupType && formData.groupType !== 'solo' && formData.groupType !== 'couple' && (
                <div className="mb-4">
                  <label className="block text-gray-700 font-medium mb-2">Number of People <span className="text-red-500">*</span></label>
                  <input
                    type="number"
                    name="groupCount"
                    value={formData.groupCount}
                    onChange={handleChange}
                    min="1"
                    className={`w-full p-3 border ${errors.groupCount ? 'border-red-500' : 'border-gray-300'} bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                  />
                  {errors.groupCount && <p className="text-red-500 text-sm mt-1">{errors.groupCount}</p>}
                </div>
              )}
              
              {/* Display selected number of people */}
              {formData.groupType && (
                <div className="mb-4 p-4 bg-indigo-50 rounded-lg">
                  <p className="text-indigo-700">
                    <span className="font-semibold">Selected group:</span> {formData.groupType === 'solo' ? 'Solo traveler (1 person)' : 
                                                       formData.groupType === 'couple' ? 'Couple (2 people)' : 
                                                       `${formData.groupType} (${formData.groupCount} people)`}
                  </p>
                </div>
              )}
            </div>
            
            <div className="flex justify-between">
              <button
                onClick={prevStep}
                className="border border-gray-300 bg-white text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-100 transition duration-300"
              >
                Back
              </button>
              <button
                onClick={handleSubmit}
                className="bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition duration-300"
              >
                Create My Trip
              </button>
            </div>
          </div>
        );
        
      case 3: // Now just the loading screen
        return (
          <div className="p-6 bg-white rounded-lg shadow-md text-center">
            <div className="text-green-600 text-6xl mb-4">✓</div>
            <h2 className="text-2xl font-bold mb-4">Your trip is being created!</h2>
            <p className="mb-6">Our AI is generating your personalized itinerary. This may take up to a minute.</p>
            <div className="w-full h-4 bg-gray-200 rounded-full mb-6">
              <div className="h-4 bg-indigo-600 rounded-full animate-pulse w-3/4"></div>
            </div>
            <p className="text-gray-500">We're finding the best options based on your preferences.</p>
          </div>
        );
        
      default:
        return null;
    }
  };

  return (
    <>
      <Head>
        <title>Plan Your Trip | Hopwell</title>
      </Head>
      
      <div className="min-h-screen bg-yellow-50 py-12">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-indigo-900">Plan Your Perfect Trip</h1>
            <p className="mt-2 text-gray-600">Tell us about your preferences, and we'll create a personalized itinerary</p>
          </div>
          
          {/* {step < 3 && (
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-gray-500">Step {step} of 2</span>
                <div className="w-2/3 h-2 bg-gray-200 rounded-full">
                  <div 
                    className="h-2 bg-indigo-600 rounded-full" 
                    style={{ width: `${(step / 2) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          )} */}
          
          {renderStep()}
        </div>
      </div>
    </>
  );
}

TripPlanner.getLayout = function getLayout(page) {
  return <AuthLayout>{page}</AuthLayout>;
};
























// // pages/trip-planner.js (Updated to use direct-itinerary API)
// import { useState } from 'react';
// import { useRouter } from 'next/router';
// import Head from 'next/head';
// import AuthLayout from '@/components/AuthLayout';

// export default function TripPlanner() {
//   const router = useRouter();
//   const [step, setStep] = useState(1);
//   const [isGenerating, setIsGenerating] = useState(false);
//   const [formData, setFormData] = useState({
//     destination: '',
//     origin: '',
//     transportMode: '',
//     startDate: '',
//     endDate: '',
//     hotelStyle: '',
//     cuisine: '',
//     theme: '',
//     groupType: '',
//     groupCount: 1,
//     budget: '',
//     priority: ''
//   });

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData({
//       ...formData,
//       [name]: value
//     });
//   };

//   const nextStep = () => {
//     setStep(step + 1);
//   };

//   const prevStep = () => {
//     setStep(step - 1);
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setStep(5); // Show the loading screen
//     setIsGenerating(true);
    
//     // Save form data to localStorage
//     const dataToStore = {
//       ...formData,
//       startDate: formData.startDate,
//       endDate: formData.endDate
//     };
//     localStorage.setItem('tripFormData', JSON.stringify(dataToStore));
    
//     try {
//       console.log("Submitting form data to direct-itinerary API...");
      
//       // Use the direct-itinerary API that we know works
//       const res = await fetch('/api/direct-itinerary', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify(formData),
//       });
      
//       console.log("API Response status:", res.status);
      
//       // Get response as text
//       const responseText = await res.text();
//       console.log("Received response length:", responseText.length);
      
//       // Parse JSON response
//       let data;
//       try {
//         data = JSON.parse(responseText);
//       } catch (error) {
//         console.error('Failed to parse JSON:', responseText.substring(0, 200));
//         throw new Error('Invalid response format from server');
//       }
      
//       // Check if response has the expected structure
//       if (!data || !data.text) {
//         throw new Error('Missing itinerary text in response');
//       }
      
//       // Store the itinerary text in localStorage
//       localStorage.setItem('itineraryAndBudget', data.text);
//       console.log('Successfully stored itinerary in localStorage');
      
//       // Navigate to results page
//       setTimeout(() => {
//         router.push('/plan-my-trip/results');
//       }, 1000);
      
//     } catch (error) {
//       console.error('Error generating itinerary:', error);
      
//       // Try fallback generation directly in the browser
//       try {
//         console.log('Using fallback generation directly in browser');
        
//         // Simple fallback generation
//         const fallbackItinerary = `
// FALLBACK ITINERARY FOR ${formData.destination.toUpperCase()}
// ========================================

// We encountered a temporary issue creating your detailed itinerary, but here's a basic plan for your trip to ${formData.destination}:

// DAY 1: ARRIVAL
// -------------
// - Arrive in ${formData.destination}
// - Check into your accommodation
// - Explore the immediate area around your hotel
// - Have dinner at a local restaurant to experience the cuisine

// DAY 2: EXPLORATION
// ----------------
// - Visit the main attractions in ${formData.destination}
// - Enjoy lunch at a recommended local spot
// - Explore markets or museums in the afternoon
// - Dinner featuring local specialties

// ${formData.endDate && formData.startDate ? 
//   `DAY 3 TO DAY ${Math.ceil((new Date(formData.endDate) - new Date(formData.startDate)) / (1000 * 60 * 60 * 24))}: CONTINUED EXPLORATION
// ----------------------------------------
// - Mix of cultural sites, natural attractions, and local experiences
// - Try different restaurants and cuisines
// - Consider day trips to nearby destinations
// - Allow some free time for shopping or relaxation` 
//   : 
//   `ADDITIONAL DAYS:
// --------------
// - Continue exploring at your own pace
// - Mix cultural visits with relaxation time
// - Try various local restaurants
// - Consider day trips to nearby attractions`
// }

// ESTIMATED BUDGET:
// ---------------
// - Accommodation: $100-300 per night depending on your preferences
// - Meals: $30-80 per person per day
// - Activities: $20-50 per person per day
// - Local transportation: $10-30 per day

// Please try again later for a more detailed itinerary. Enjoy your trip to ${formData.destination}!
//         `;
        
//         localStorage.setItem('itineraryAndBudget', fallbackItinerary);
        
//         setTimeout(() => {
//           router.push('/plan-my-trip/results');
//         }, 1000);
//       } catch (fallbackError) {
//         console.error('Fallback generation failed:', fallbackError);
//         setStep(4); // Go back to the previous step
//         setIsGenerating(false);
//         alert(`Failed to generate itinerary. Please try again.`);
//       }
//     }
//   };

//   const renderStep = () => {
//     switch (step) {
//       case 1:
//         return (
//           <div className="p-6 bg-white rounded-lg shadow-md">
//             <h2 className="text-2xl font-bold mb-6 text-indigo-900">Where are you going?</h2>
            
//             <div className="mb-4">
//               <label className="block text-gray-700 font-medium mb-2">Destination <span className="text-red-500">*</span></label>
//               <input
//                 type="text"
//                 name="destination"
//                 value={formData.destination}
//                 onChange={handleChange}
//                 placeholder="City, Country (e.g., Paris, France)"
//                 className="w-full p-3 border border-gray-300 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
//                 required
//               />
//             </div>
            
//             <div className="mb-4">
//               <label className="block text-gray-700 font-medium mb-2">Origin</label>
//               <input
//                 type="text"
//                 name="origin"
//                 value={formData.origin}
//                 onChange={handleChange}
//                 placeholder="Where are you starting from?"
//                 className="w-full p-3 border border-gray-300 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
//               />
//             </div>
            
//             <div className="mb-4">
//               <label className="block text-gray-700 font-medium mb-2">Transportation Method</label>
//               <select
//                 name="transportMode"
//                 value={formData.transportMode}
//                 onChange={handleChange}
//                 className="w-full p-3 border border-gray-300 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
//               >
//                 <option value="">Select transportation</option>
//                 <option value="air">Airways</option>
//                 <option value="train">Train</option>
//                 <option value="bus">Bus</option>
//                 <option value="drive">Drive</option>
//                 <option value="cruise">Cruise</option>
//               </select>
//             </div>
            
//             <div className="grid grid-cols-2 gap-4 mb-6">
//               <div>
//                 <label className="block text-gray-700 font-medium mb-2">Start Date</label>
//                 <input
//                   type="date"
//                   name="startDate"
//                   value={formData.startDate}
//                   onChange={handleChange}
//                   className="w-full p-3 border border-gray-300 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
//                 />
//               </div>
//               <div>
//                 <label className="block text-gray-700 font-medium mb-2">End Date</label>
//                 <input
//                   type="date"
//                   name="endDate"
//                   value={formData.endDate}
//                   onChange={handleChange}
//                   className="w-full p-3 border border-gray-300 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
//                 />
//               </div>
//             </div>
            
//             <div className="flex justify-end">
//               <button
//                 onClick={nextStep}
//                 disabled={!formData.destination}
//                 className={`py-3 px-6 rounded-lg transition duration-300 ${
//                   !formData.destination 
//                     ? 'bg-gray-400 text-white cursor-not-allowed' 
//                     : 'bg-indigo-600 text-white hover:bg-indigo-700'
//                 }`}
//               >
//                 Next
//               </button>
//             </div>
//           </div>
//         );
        
//       case 2:
//         return (
//           <div className="p-6 bg-white rounded-lg shadow-md">
//             <h2 className="text-2xl font-bold mb-6 text-indigo-900">What's your style?</h2>
            
//             <div className="mb-4">
//               <label className="block text-gray-700 font-medium mb-2">Accommodation Preference</label>
//               <select
//                 name="hotelStyle"
//                 value={formData.hotelStyle}
//                 onChange={handleChange}
//                 className="w-full p-3 border border-gray-300 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
//               >
//                 <option value="">Select your preference</option>
//                 <option value="ultraLuxury">Ultra Luxury</option>
//                 <option value="luxury">Luxury</option>
//                 <option value="comfortable">Comfortable</option>
//                 <option value="budget">Budget</option>
//                 <option value="experience">Unique Experience</option>
//               </select>
//             </div>
            
//             <div className="mb-4">
//               <label className="block text-gray-700 font-medium mb-2">Cuisine Preferences</label>
//               <input
//                 type="text"
//                 name="cuisine"
//                 value={formData.cuisine}
//                 onChange={handleChange}
//                 placeholder="What cuisines do you enjoy?"
//                 className="w-full p-3 border border-gray-300 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
//               />
//             </div>
            
//             <div className="mb-6">
//               <label className="block text-gray-700 font-medium mb-2">Trip Theme</label>
//               <select
//                 name="theme"
//                 value={formData.theme}
//                 onChange={handleChange}
//                 className="w-full p-3 border border-gray-300 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
//               >
//                 <option value="">Select a theme</option>
//                 <option value="relaxation">Relaxation & Vibe</option>
//                 <option value="adventure">Indoor & Outdoor Adventure</option>
//                 <option value="sightseeing">Downtown Sightseeing</option>
//                 <option value="religious">Religious</option>
//                 <option value="sports">Sports & Games</option>
//                 <option value="historic">Historic Sightseeing</option>
//                 <option value="unique">Unique & Must-See</option>
//                 <option value="nature">Trekking & Nature</option>
//                 <option value="honeymoon">Honeymoon</option>
//                 <option value="camping">Camping & Nature Stay</option>
//                 <option value="nightlife">Nightlife & Concerts</option>
//                 <option value="photoshoot">Photo Shoot</option>
//               </select>
//             </div>
            
//             <div className="flex justify-between">
//               <button
//                 onClick={prevStep}
//                 className="border border-gray-300 bg-white text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-100 transition duration-300"
//               >
//                 Back
//               </button>
//               <button
//                 onClick={nextStep}
//                 className="bg-indigo-600 text-white py-3 px-6 rounded-lg hover:bg-indigo-700 transition duration-300"
//               >
//                 Next
//               </button>
//             </div>
//           </div>
//         );
        
//       case 3:
//         return (
//           <div className="p-6 bg-white rounded-lg shadow-md">
//             <h2 className="text-2xl font-bold mb-6 text-indigo-900">Tell us about your group</h2>
            
//             <div className="mb-4">
//               <label className="block text-gray-700 font-medium mb-2">Group Type</label>
//               <select
//                 name="groupType"
//                 value={formData.groupType}
//                 onChange={handleChange}
//                 className="w-full p-3 border border-gray-300 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
//               >
//                 <option value="">Select group type</option>
//                 <option value="couple">Couple</option>
//                 <option value="family">Family</option>
//                 <option value="friends">Friends</option>
//                 <option value="work">Work Team</option>
//                 <option value="solo">Solo</option>
//               </select>
//             </div>
            
//             <div className="mb-6">
//               <label className="block text-gray-700 font-medium mb-2">Number of People</label>
//               <input
//                 type="number"
//                 name="groupCount"
//                 value={formData.groupCount}
//                 onChange={handleChange}
//                 min="1"
//                 className="w-full p-3 border border-gray-300 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
//               />
//             </div>
            
//             <div className="flex justify-between">
//               <button
//                 onClick={prevStep}
//                 className="border border-gray-300 bg-white text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-100 transition duration-300"
//               >
//                 Back
//               </button>
//               <button
//                 onClick={nextStep}
//                 className="bg-indigo-600 text-white py-3 px-6 rounded-lg hover:bg-indigo-700 transition duration-300"
//               >
//                 Next
//               </button>
//             </div>
//           </div>
//         );
        
//       case 4:
//         return (
//           <div className="p-6 bg-white rounded-lg shadow-md">
//             <h2 className="text-2xl font-bold mb-6 text-indigo-900">Budget & Priorities</h2>
            
//             <div className="mb-4">
//               <label className="block text-gray-700 font-medium mb-2">Budget per Person (USD)</label>
//               <input
//                 type="number"
//                 name="budget"
//                 value={formData.budget}
//                 onChange={handleChange}
//                 placeholder="Enter amount in USD"
//                 className="w-full p-3 border border-gray-300 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
//               />
//             </div>
            
//             <div className="mb-6">
//               <label className="block text-gray-700 font-medium mb-2">Top Priority</label>
//               <select
//                 name="priority"
//                 value={formData.priority}
//                 onChange={handleChange}
//                 className="w-full p-3 border border-gray-300 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
//               >
//                 <option value="">Select your top priority</option>
//                 <option value="budget">Budget</option>
//                 <option value="time">Time</option>
//                 <option value="distance">Distance</option>
//                 <option value="experience">Experience</option>
//                 <option value="safety">Safety</option>
//               </select>
//             </div>
            
//             <div className="flex justify-between">
//               <button
//                 onClick={prevStep}
//                 className="border border-gray-300 bg-white text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-100 transition duration-300"
//               >
//                 Back
//               </button>
//               <button
//                 onClick={handleSubmit}
//                 className="bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition duration-300"
//               >
//                 Create My Trip
//               </button>
//             </div>
//           </div>
//         );
        
//       case 5:
//         return (
//           <div className="p-6 bg-white rounded-lg shadow-md text-center">
//             <div className="text-green-600 text-6xl mb-4">✓</div>
//             <h2 className="text-2xl font-bold mb-4">Your trip is being created!</h2>
//             <p className="mb-6">Our AI is generating your personalized itinerary. This will take just a moment.</p>
//             <div className="w-full h-4 bg-gray-200 rounded-full mb-6">
//               <div className="h-4 bg-indigo-600 rounded-full animate-pulse w-3/4"></div>
//             </div>
//             <p className="text-gray-500">We're finding the best options based on your preferences.</p>
//           </div>
//         );
        
//       default:
//         return null;
//     }
//   };

//   return (
//     <>
//       <Head>
//         <title>Plan Your Trip | Hopwell</title>
//       </Head>
      
//       <div className="min-h-screen bg-yellow-50 py-12">
//         <div className="max-w-4xl mx-auto px-4">
//           <div className="text-center mb-8">
//             <h1 className="text-3xl font-bold text-indigo-900">Plan Your Perfect Trip</h1>
//             <p className="mt-2 text-gray-600">Tell us about your preferences, and we'll create a personalized itinerary</p>
//           </div>
          
//           {renderStep()}
//         </div>
//       </div>
//     </>
//   );
// }

// TripPlanner.getLayout = function getLayout(page) {
//   return <AuthLayout>{page}</AuthLayout>;
// };