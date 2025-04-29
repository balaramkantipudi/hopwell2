import { fetchAI21Response } from "@/libs/ai21";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
// Assuming getCuisineRestaurants, getHotels, getFlights, getPopulationStats, and generateItineraryAndBudget are defined and imported

function TravelPlanner() {
  const [inputData, setInputData] = useState({
    origin: "",
    location: "",
    transport: "",
    cuisine: "",
    startDate: "",
    endDate: "",
    hotelStyle: "",
    theme: "",
    adult_num: "",
    budget: "",
  });
  const [travelData, setTravelData] = useState({
    restaurants: [],
    hotels: [],
    flights: [],
    populationStats: {},
    itineraryAndBudget: {},
    // structure based on your API responses
  });
  const router = useRouter();
  //   useEffect(() => {
  //     const fetchData = async () => {
  //       if (inputData.location) {
  //         // const restaurants = async (cuisine, city) => {
  //         //   const response = await fetch(
  //         //     `/api/restaurants/${cuisine}?city=${encodeURIComponent(city)}`
  //         //   );
  //         //   const data = await response.json();
  //         //   return data;
  //         // };
  //         // const hotels = await getHotels(
  //         //   inputData.location,
  //         //   "YOUR_AFFILIATE_CODE"
  //         // );
  //         // const flights = await getFlights(
  //         //   inputData.fromLocation,
  //         //   inputData.location,
  //         //   inputData.dates
  //         // );

  //         const data = {
  //           //   restaurants,
  //           //   hotels,
  //           //   flights,
  //           ...inputData,
  //         };
  //         const itineraryAndBudget = await fetchAI21Response(
  //           JSON.stringify(data)
  //         );
  //         console.log(itineraryAndBudget);
  //         setTravelData({
  //           //   restaurants,
  //           //   hotels,
  //           //   flights,
  //           //   populationStats,
  //           itineraryAndBudget,
  //         });
  //       }
  //     };

  //     fetchData();
  //   }, [inputData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setInputData({
      ...inputData,
      [name]: value,
    });
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    // Perform your API calls and update travelData as needed
    // For demonstration, assume fetchData updates travelData appropriately
    const res = await fetch("/api/fetchItinerary", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(inputData),
    });
    console.log("inputData:", JSON.stringify(inputData));

    if (res.ok) {
      const resjson = await res.json();
      console.log("resjson['text']", resjson["text"]);
      setTravelData((currentState) => ({
        ...currentState,
        itineraryAndBudget: resjson["text"],
      }));
      //   console.log("travelData:", travelData);
      //   const travelData = {
      //     itineraryAndBudget: resjson["text"],
      //   };
      localStorage.setItem("itineraryAndBudget", resjson["text"]);
      router.push("/plan-my-trip/results");
      // Do something with the itinerary text
    } else {
      // Handle errors
      console.error("Failed to fetch AI21 data:", res.statusText);
    }
    // try {
    //   const itineraryAndBudget = await fetchAI21Response(
    //     JSON.stringify(inputData)
    //   );
    //   console.log(itineraryAndBudget);

    //   // Assuming itineraryAndBudget is part of the response you need to keep
    //   const travelData = {
    //     ...inputData,
    //     itineraryAndBudget,
    //   };

    //   // Here you might want to update some state with the fetched data or navigate to another page
    //   localStorage.setItem("travelData", JSON.stringify(travelData));
    //   router.push("/plan-my-trip/results");
    // } catch (error) {
    //   console.error("Failed to fetch AI21 data:", error);
    //   // Handle errors, e.g., show an error message to the user
    // }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-semibold mb-4 text-white">Travel Planner</h1>
      <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
        <form onSubmit={handleSearch}>
          {/* Origin */}
          <div className="mb-4">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="origin"
            >
              Origin
            </label>
            <input
              type="text"
              name="origin"
              value={inputData.origin}
              onChange={handleInputChange}
              placeholder="Enter origin city"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline bg-white"
            />
          </div>

          {/* Destination Location */}
          <div className="mb-4">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="location"
            >
              Destination
            </label>
            <input
              type="text"
              name="location"
              value={inputData.location}
              onChange={handleInputChange}
              placeholder="Enter destination city"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline bg-white"
            />
          </div>

          {/* Transport */}
          <div className="mb-4">
            <label
              className="block text-gray-700 text-sm font-bold mb-2 "
              htmlFor="transport"
            >
              Transport
            </label>
            <select
              name="transport"
              value={inputData.transport}
              onChange={handleInputChange}
              className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline bg-white"
            >
              <option value="">Select transport</option>
              <option value="car">Car</option>
              <option value="flight">Flight</option>
            </select>
          </div>

          {/* Cuisine */}
          <div className="mb-4">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="cuisine"
            >
              Cuisine
            </label>
            <select
              name="cuisine"
              value={inputData.cuisine}
              onChange={handleInputChange}
              className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline bg-white"
            >
              <option value="">Select cuisine</option>
              <option value="Italian">Italian</option>
              <option value="Japanese">Japanese</option>
              <option value="Chinese">Chinese</option>
              <option value="French">French</option>
              <option value="American">American</option>
              <option value="Mexican">Mexican</option>
              <option value="Indian">Indian</option>
              <option value="Thai">Thai</option>
              {/* Add more cuisines as necessary */}
            </select>
          </div>

          {/* Start Date */}
          <div className="mb-4">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="startDate"
            >
              Start Date
            </label>
            <input
              type="date"
              name="startDate"
              value={inputData.startDate}
              onChange={handleInputChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline bg-white"
            />
          </div>

          {/* End Date */}
          <div className="mb-4">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="endDate"
            >
              End Date
            </label>
            <input
              type="date"
              name="endDate"
              value={inputData.endDate}
              onChange={handleInputChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline bg-white"
            />
          </div>

          {/* Hotel Style */}
          <div className="mb-4">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="hotelStyle"
            >
              Hotel Style
            </label>
            <select
              name="hotelStyle"
              value={inputData.hotelStyle}
              onChange={handleInputChange}
              className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline bg-white"
            >
              <option value="">Select hotel style</option>
              <option value="Ultra luxury">Ultra luxury</option>
              <option value="luxury">Luxury</option>
              <option value="comfortable">Comfortable</option>
              <option value="budget">Budget</option>
              <option value="Experience">Experience</option>
            </select>
          </div>

          {/* Theme */}
          <div className="mb-4">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="theme"
            >
              Theme
            </label>
            <select
              name="theme"
              value={inputData.theme}
              onChange={handleInputChange}
              className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline bg-white"
            >
              <option value="">Select theme</option>
              <option value="Relaxation & Vibe">Relaxation & Vibe</option>
              <option value="indoor and outdoor adventure">
                Indoor and outdoor adventure
              </option>
              <option value="Free & Downtown sight seeing">
                Free & Downtown sight seeing
              </option>
              <option value="religious">Religious</option>
              <option value="sports, races, games">Sports, races, games</option>
              <option value="Historic sight seeing">
                Historic sight seeing
              </option>
              <option value="Unique & should not miss">
                Unique & should not miss
              </option>
              <option value="trekking, hiking, water falls">
                Trekking, hiking, water falls
              </option>
              <option value="Honeymoon">Honeymoon</option>
              <option value="Camping, nature stay">Camping, nature stay</option>
              <option value="night life,pubs, concerts">
                Night life, pubs, concerts
              </option>
              <option value="photo shoot">Photo shoot</option>
            </select>
          </div>

          {/* Adult Number */}
          <div className="mb-4">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="adult_num"
            >
              Number of Adults
            </label>
            <input
              type="number"
              name="adult_num"
              min="1"
              value={inputData.adult_num}
              onChange={handleInputChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline bg-white"
            />
          </div>

          {/* Budget */}
          <div className="mb-4">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="budget"
            >
              Budget ($)
            </label>
            <input
              type="number"
              name="budget"
              value={inputData.budget}
              onChange={handleInputChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline bg-white"
            />
          </div>
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Search
          </button>
        </form>
      </div>
    </div>
  );
}

export default TravelPlanner;
