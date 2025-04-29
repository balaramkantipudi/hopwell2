import React, { useState } from 'react';
import { useRouter } from 'next/router';

const TripPlannerForm = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    destination: '',
    origin: '',
    transportMode: '',
    startDate: '',
    endDate: '',
    hotelStyle: '',
    cuisine: '',
    theme: '',
    groupType: '',
    groupCount: 1,
    budget: '',
    priority: ''
  });

  const router = useRouter();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const nextStep = () => {
    setStep(step + 1);
  };

  const prevStep = () => {
    setStep(step - 1);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // This would send the data to your backend
    console.log('Form submitted:', formData);
    // Show success message and reset form
    setStep(5);
    
    // After a delay, you could redirect to results page
    setTimeout(() => {
      // router.push('/trip-results');
    }, 3000);
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-6 text-primary-600">Where are you going?</h2>
            
            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-2">Destination</label>
              <input
                type="text"
                name="destination"
                value={formData.destination}
                onChange={handleChange}
                placeholder="City, Country or 'Not Sure'"
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-2">Origin</label>
              <input
                type="text"
                name="origin"
                value={formData.origin}
                onChange={handleChange}
                placeholder="Where are you starting from?"
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-2">Transportation Method</label>
              <select
                name="transportMode"
                value={formData.transportMode}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Select transportation</option>
                <option value="air">Airways</option>
                <option value="train">Train</option>
                <option value="bus">Bus</option>
                <option value="drive">Drive</option>
              </select>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-gray-700 font-medium mb-2">Start Date</label>
                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-2">End Date</label>
                <input
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
            
            <div className="flex justify-end">
              <button
                onClick={nextStep}
                className="bg-indigo-900 text-white py-3 px-6 rounded-lg hover:bg-indigo-800 transition duration-300"
              >
                Next
              </button>
            </div>
          </div>
        );
        
      case 2:
        return (
          <div className="p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-6 text-primary-600">What's your style?</h2>
            
            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-2">Accommodation Preference</label>
              <select
                name="hotelStyle"
                value={formData.hotelStyle}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Select your preference</option>
                <option value="ultraLuxury">Ultra Luxury</option>
                <option value="luxury">Luxury</option>
                <option value="comfortable">Comfortable</option>
                <option value="budget">Budget</option>
                <option value="experience">Unique Experience</option>
              </select>
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-2">Cuisine Preferences</label>
              <input
                type="text"
                name="cuisine"
                value={formData.cuisine}
                onChange={handleChange}
                placeholder="What cuisines do you enjoy?"
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            
            <div className="mb-6">
              <label className="block text-gray-700 font-medium mb-2">Trip Theme</label>
              <select
                name="theme"
                value={formData.theme}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
            </div>
            
            <div className="flex justify-between">
              <button
                onClick={prevStep}
                className="border border-gray-300 bg-white text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-100 transition duration-300"
              >
                Back
              </button>
              <button
                onClick={nextStep}
                className="bg-indigo-900 text-white py-3 px-6 rounded-lg hover:bg-indigo-800 transition duration-300"
              >
                Next
              </button>
            </div>
          </div>
        );
        
      case 3:
        return (
          <div className="p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-6 text-primary-600">Tell us about your group</h2>
            
            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-2">Group Type</label>
              <select
                name="groupType"
                value={formData.groupType}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Select group type</option>
                <option value="couple">Couple</option>
                <option value="family">Family</option>
                <option value="friends">Friends</option>
                <option value="work">Work Team</option>
                <option value="solo">Solo</option>
              </select>
            </div>
            
            <div className="mb-6">
              <label className="block text-gray-700 font-medium mb-2">Number of People</label>
              <input
                type="number"
                name="groupCount"
                value={formData.groupCount}
                onChange={handleChange}
                min="1"
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            
            <div className="flex justify-between">
              <button
                onClick={prevStep}
                className="border border-gray-300 bg-white text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-100 transition duration-300"
              >
                Back
              </button>
              <button
                onClick={nextStep}
                className="bg-indigo-900 text-white py-3 px-6 rounded-lg hover:bg-indigo-800 transition duration-300"
              >
                Next
              </button>
            </div>
          </div>
        );
        
      case 4:
        return (
          <div className="p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-6 text-primary-600">Budget & Priorities</h2>
            
            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-2">Budget per Person (USD)</label>
              <input
                type="number"
                name="budget"
                value={formData.budget}
                onChange={handleChange}
                placeholder="Enter amount in USD"
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            
            <div className="mb-6">
              <label className="block text-gray-700 font-medium mb-2">Top Priority</label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Select your top priority</option>
                <option value="budget">Budget</option>
                <option value="time">Time</option>
                <option value="distance">Distance</option>
                <option value="experience">Experience</option>
                <option value="safety">Safety</option>
              </select>
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
        
      case 5:
        return (
          <div className="p-6 bg-white rounded-lg shadow-md text-center">
            <div className="text-green-600 text-6xl mb-4">✓</div>
            <h2 className="text-2xl font-bold mb-4">Your trip is being created!</h2>
            <p className="mb-6">Our AI is generating your personalized itinerary. This will take just a moment.</p>
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
    <div className="max-w-2xl mx-auto my-8 px-4">
      {step < 5 && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-gray-500">Step {step} of 4</span>
            <div className="w-2/3 h-2 bg-gray-200 rounded-full">
              <div 
                className="h-2 bg-indigo-600 rounded-full" 
                style={{ width: `${(step / 4) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>
      )}
      
      {renderStep()}
    </div>
  );
};

export default TripPlannerForm;