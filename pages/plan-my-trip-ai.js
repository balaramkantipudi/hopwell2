import React from "react";
import AI21 from "../components/AI21";
import Header from "../components/Header";
import Footer from "@/components/Footer";
import TravelPlanner from "@/components/TravelPlanner";

const PlanMyTripAIPage = () => {
  return (
    <div>
      <Header />
      {/* <AI21 /> */}
      <TravelPlanner />
      <Footer />
    </div>
  );
};

export default PlanMyTripAIPage;
