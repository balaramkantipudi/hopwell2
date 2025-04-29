import { useState } from "react";

const SearchContainer = () => {
  // State for the form inputs
  const [tripType, setTripType] = useState("return");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [departureDate, setDepartureDate] = useState("");
  const [returnDate, setReturnDate] = useState("");

  // The handleSubmit function would be used to process the form data
  const handleSubmit = (event) => {
    event.preventDefault();
    // Process the flight search here
  };

  return (
    <div
      className="relative flex flex-grow items-center justify-center bg-cover bg-no-repeat bg-center"
      style={{
        backgroundImage:
          "linear-gradient(rgba(255, 255, 255, 1) 0%, rgba(255, 255, 255, 0) 25%), url('image7.png')",
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center",
      }}
    >
      {/* Search Box */}
      <div className="relative z-10 w-3/5 bg-white p-8 rounded-lg shadow-lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Trip Type Radio Buttons */}
          <div className="flex space-x-4">
            <label className="flex items-center">
              <input
                type="radio"
                value="return"
                checked={tripType === "return"}
                onChange={() => setTripType("return")}
                className="form-radio"
              />
              <span className="ml-2">Return</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                value="oneWay"
                checked={tripType === "oneWay"}
                onChange={() => setTripType("oneWay")}
                className="form-radio"
              />
              <span className="ml-2">One way</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                value="multiCity"
                checked={tripType === "multiCity"}
                onChange={() => setTripType("multiCity")}
                className="form-radio"
              />
              <span className="ml-2">Multi-city</span>
            </label>
          </div>

          {/* Flight Search Inputs */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <input
              type="text"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              placeholder="From"
              className="form-input px-4 py-2 border rounded"
            />
            <input
              type="text"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              placeholder="To"
              className="form-input px-4 py-2 border rounded"
            />
            <input
              type="date"
              value={departureDate}
              onChange={(e) => setDepartureDate(e.target.value)}
              className="form-input px-4 py-2 border rounded"
            />
            <input
              type="date"
              value={returnDate}
              onChange={(e) => setReturnDate(e.target.value)}
              className="form-input px-4 py-2 border rounded"
            />
          </div>

          {/* Search Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded"
            >
              Search Trips
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SearchContainer;
