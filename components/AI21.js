import React, { useState } from "react";
import { fetchAI21Response } from "../libs/ai21";

export default function AI21Component() {
  // State variables for each input field
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [luxuryLevel, setLuxuryLevel] = useState("");
  const [response, setResponse] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Construct the prompt based on user inputs
    const prompt = `Plan a ${luxuryLevel} trip itinerary where the departure is from ${departure} and the destination is ${destination} from ${startDate} to ${endDate}. Provide a budget for the trip, and return your response in one paragraph.`;
    const aiResponse = await fetchAI21Response(prompt);
    setResponse(aiResponse);
  };

  return (
    <div className="max-w-md mx-auto my-10 p-5 border rounded-lg shadow-lg">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="text"
          value={origin}
          onChange={(e) => setOrigin(e.target.value)}
          placeholder="Origin (City)"
          className="px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="text"
          value={destination}
          onChange={(e) => setDestination(e.target.value)}
          placeholder="Destination (City)"
          className="px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          placeholder="Start Date"
          className="px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          placeholder="End Date"
          className="px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <select
          value={luxuryLevel}
          onChange={(e) => setLuxuryLevel(e.target.value)}
          className="px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Select Luxury Level</option>
          <option value="On Budget">On Budget</option>
          <option value="Family Vacation">Family Vacation</option>
          <option value="Luxurious">Luxurious</option>
        </select>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
        >
          Submit
        </button>
      </form>
      {response && <p className="mt-4 text-white">{response}</p>}
    </div>
  );
}
