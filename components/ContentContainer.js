import TravelOptionCard from "./TravelOptionCard";

const ContentContainer = () => {
  return (
    <div className="container flex mx-auto px-4 py-8 grid grid-cols-1 sm:grid-cols-4 gap-1">
      <TravelOptionCard
        title="Take a virtual tour of our cabin"
        description="Explore now"
        imageUrl="image3.png"
        buttonText="Explore now"
      />
      <TravelOptionCard
        title="Explore our destinations"
        description="Find great fares"
        imageUrl="image2.png"
        buttonText="Find great fares"
      />
      <TravelOptionCard
        title="Explore our destinations"
        description="Find great fares"
        imageUrl="image3.png"
        buttonText="Find great fares"
      />
      <TravelOptionCard
        title="Explore our destinations"
        description="Find great fares"
        imageUrl="image4.png"
        buttonText="Find great fares"
      />
      {/* ... more cards */}
    </div>
  );
};

export default ContentContainer;
