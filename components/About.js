// function About() {
//   const paragraphStyle1 = {
//     marginBottom: "15px", // Adjust as needed
//   };

//   const paragraphStyle2 = {
//     marginBottom: "15px", // Adjust as needed
//   };

//   return (
//     <section
//       id="about"
//       className="bg-yellow-50 flex flex-col lg:flex-row items-center justify-center gap-16 lg:gap-2 px-10 py-8 lg:py-20"
//     >
//       <div className="flex flex-col gap-12 lg:gap-12 items-center justify-center text-center lg:text-left lg:items-start">
//         <h2 className="text-3xl font-bold">About Us</h2>
//         <p className="text-base" style={paragraphStyle1}>
//           Discover the Joy of Hassle-Free Travel Planning with Hopwell
//         </p>
//         <p className="text-base">
//           Welcome to Hopwell, the AI-powered travel companion revolutionizing
//           the way adventurers and leisure seekers craft their perfect getaway.
//           Our innovative platform is designed to transform your travel
//           aspirations into a meticulously tailored experience that resonates
//           with your personal preferences.
//         </p>
//         <p className="text-base" style={paragraphStyle2}>
//           Gone are the days of travel anxiety and the overwhelming task of
//           sifting through endless options. Our user-friendly interface offers a
//           seamless process that presents you with choices that feel custom-made,
//           because they are. Whether you're a thrill-seeker longing for
//           adventure, a culture enthusiast eager to soak in new experiences, or a
//           tranquility chaser looking to unwind, we've got you covered.
//         </p>
//         <p className="text-2xl font-bold">
//           Welcome to the future of travel with Hopwell.
//         </p>
//       </div>
//     </section>
//   );
// }

// export default About;

// components/About.js
function About() {
  return (
    <section
      id="about"
      className="max-w-7xl mx-auto bg-yellow-50 py-16 px-8"
    >
      <h2 className="text-3xl font-bold text-center mb-8">Travel Made Simple</h2>
      <p className="text-lg text-center max-w-3xl mx-auto mb-12">We solve the common problems that make travel stressful</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
          <h3 className="flex items-center text-xl font-semibold mb-4">
            <span className="mr-2">😰</span> Travel Anxiety
          </h3>
          <p>
            Worried about planning the perfect trip? Our AI-powered system takes care of all the details
            so you can focus on enjoying your journey.
          </p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
          <h3 className="flex items-center text-xl font-semibold mb-4">
            <span className="mr-2">🏨</span> Finding Quality Hotels
          </h3>
          <p>
            We partner with the best accommodation providers to ensure your stay matches your preferences and budget.
          </p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
          <h3 className="flex items-center text-xl font-semibold mb-4">
            <span className="mr-2">🍽️</span> Restaurant Selection
          </h3>
          <p>
            Never waste time searching for good food again. We recommend restaurants based on your cuisine 
            preferences and dietary needs.
          </p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
          <h3 className="flex items-center text-xl font-semibold mb-4">
            <span className="mr-2">⏱️</span> Wasted Time
          </h3>
          <p>
            Our optimized itineraries ensure you make the most of every moment, avoiding crowds and
            maximizing experiences.
          </p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
          <h3 className="flex items-center text-xl font-semibold mb-4">
            <span className="mr-2">💸</span> Budget Surprises
          </h3>
          <p>
            Get accurate cost estimates upfront so you can travel with confidence and avoid unexpected expenses.
          </p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
          <h3 className="flex items-center text-xl font-semibold mb-4">
            <span className="mr-2">🌧️</span> Weather Issues
          </h3>
          <p>
            We integrate weather forecasts into your itinerary, with backup plans already in place
            for rainy or unsuitable conditions.
          </p>
        </div>
      </div>
    </section>
  );
}

export default About;
