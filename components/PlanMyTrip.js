// import { useRouter } from 'next/router';

// function PlanMyTrip() {
//   const router = useRouter();

//   const handleClick = () => {
//     router.push('/auth/signin');
//   };

//   return (
//     <section id="planmytrip" className="bg-yellow-50 py-16">
//       <div className="container mx-auto px-8">
//         <h2 className="text-3xl font-bold text-center mb-12">Plan Your Perfect Trip</h2>
        
//         <div className="max-w-3xl mx-auto bg-white rounded-lg p-8 shadow-md">
//           <p className="text-lg mb-6">
//             Ready to embark on your next adventure? Tell us your preferences and let HOPWELL create 
//             a personalized travel plan just for you.
//           </p>
          
//           <div className="space-y-4 mb-8">
//             <div className="p-4 bg-indigo-50 rounded-lg flex items-start">
//               <div className="mr-3 mt-1 text-indigo-700">
//                 <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
//                   <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
//                 </svg>
//               </div>
//               <p>Personalized itineraries based on your interests, budget, and travel style</p>
//             </div>
            
//             <div className="p-4 bg-indigo-50 rounded-lg flex items-start">
//               <div className="mr-3 mt-1 text-indigo-700">
//                 <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
//                   <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
//                 </svg>
//               </div>
//               <p>Curated hotel and restaurant recommendations that match your preferences</p>
//             </div>
            
//             <div className="p-4 bg-indigo-50 rounded-lg flex items-start">
//               <div className="mr-3 mt-1 text-indigo-700">
//                 <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
//                   <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
//                 </svg>
//               </div>
//               <p>Efficient planning to maximize your time and avoid missing hidden gems</p>
//             </div>
//           </div>
          
//           <div className="text-center">
//             <button 
//               onClick={handleClick}
//               className="btn btn-lg bg-indigo-900 text-white hover:bg-indigo-800"
//             >
//               Start Planning Your Trip
//             </button>
//           </div>
//         </div>
//       </div>
//     </section>
//   );
// }

// export default PlanMyTrip;





// components/PlanMyTrip.js
import { useRouter } from 'next/router';

function PlanMyTrip() {
  const router = useRouter();

  return (
    <section id="planmytrip" className="bg-yellow-50 py-12">
      <div className="container mx-auto px-8 text-center">
        <h2 className="text-3xl font-bold mb-6">Plan Your Perfect Trip</h2>
        <p className="max-w-2xl mx-auto mb-8">
          Tell us your preferences and let us create a personalized 
          travel plan just for you. We'll handle the details so you can 
          focus on enjoying your journey.
        </p>
        
        <button 
          onClick={() => router.push('/auth/signin')}
          className="btn btn-lg bg-indigo-900 text-white"
        >
          Start Planning
        </button>
      </div>
    </section>
  );
}

export default PlanMyTrip;