import Footer from "@/components/Footer";
import Header from "@/components/Header";
import React, { useState, useEffect } from "react";

const ResultsPage = () => {
  const [travelData, setTravelData] = useState({
    restaurants: [],
    hotels: [],
    flights: [],
    populationStats: {},
    itineraryAndBudget: {},
  });

  useEffect(() => {
    const storedData = localStorage.getItem("itineraryAndBudget");
    if (storedData) {
      // Ensure storedData is parsed as JSON only if it's a string
      console.log("Stored Data:", storedData);
      try {
        // const parsedData = JSON.parse(storedData);
        // console.log("Parsed Data:", parsedData);
        setTravelData((currentState) => ({
          ...currentState,
          itineraryAndBudget: storedData,
        }));
      } catch (error) {
        console.error("Parsing error: ", error);
        // Handle the error or set a default state
      }
    }
  }, []);

  //   // Split the string into an array of lines
  //   const lines = itineraryString.split("\n").filter((line) => line);

  return (
    <div>
      <Header />
      <div className="max-w-4xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-semibold mb-4 text-gray-300">
          Travel Plan Results
        </h1>
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Itinerary and Budget</h2>
          <div className="text-sm">
            {typeof travelData.itineraryAndBudget === "string" &&
              travelData.itineraryAndBudget.trim() !== "" &&
              travelData.itineraryAndBudget
                .split("\n")
                .map((line, index) => <p key={index}>{line}</p>)}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ResultsPage;
