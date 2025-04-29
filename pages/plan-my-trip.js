// import React from "react";
// import PlanMyTrip from "../components/PlanMyTrip"; // Ensure the path is correct

// const PlanMyTripPage = () => {
//   return (
//     <div>
//       <PlanMyTrip />
//     </div>
//   );
// };

// export default PlanMyTripPage;
import React from 'react';
import { useRouter } from 'next/router';

const PlanMyTrip = () => {
  const router = useRouter();

  return (
    <section id="planmytrip" className="py-16 bg-white">
      <div className="container mx-auto px-8">
        <h2 className="text-3xl font-bold text-center mb-12">Plan Your Perfect Trip</h2>
        
        <div className="max-w-3xl mx-auto bg-yellow-50 rounded-lg p-8 shadow-md">
          <p className="text-lg mb-6">
            Ready to embark on your next adventure? Let HOPWELL help you create a personalized 
            travel plan tailored to your preferences and budget.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8">
            <button 
              onClick={() => router.push('/login')}
              className="btn bg-indigo-900 text-white hover:bg-indigo-800"
            >
              Start Planning
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PlanMyTrip;