// import Image from "next/image";
// import { useSession, getSession } from "next-auth/react";
// import { useRouter } from "next/router";

// const CTA = () => {
//   const { data: session, status } = useSession();
//   const loading = status === "loading";
//   const router = useRouter();
//   const handleStartPlan = () => {
//     if (!loading && !session) {
//       router.push("/api/auth/signin");
//     } else {
//       router.push("/plan-my-trip");
//     }
//   };
//   return (
//     <section className="relative hero overflow-hidden min-h-screen">
//       <Image
//         src="/image1.png" // Provide the correct image URL
//         alt="Background"
//         className="object-cover w-full"
//         fill
//       />
//       <div className="relative hero-overlay bg-neutral bg-opacity-70"></div>
//       <div className="relative hero-content text-center text-neutral-content p-8">
//         <div className="flex flex-col items-center max-w-xl p-8 md:p-0">
//           <h2 className="font-bold text-3xl md:text-5xl tracking-tight mb-8 md:mb-12 text-gray-300">
//             We Plan, You Explore
//           </h2>
//           <p className="text-lg opacity-80 mb-12 md:mb-16 text-gray-300">
//             Travel Smart, Enjoy more
//           </p>

//           <button
//             className="btn btn-primary btn-wide text-gray-300"
//             onClick={handleStartPlan}
//           >
//             Start my trip
//           </button>
//         </div>
//       </div>
//     </section>
//   );
// };

// export default CTA;



import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import Image from "next/image";

const CTA = ({ setIsAuthModalOpen }) => {
  const router = useRouter();
  const { status } = useSession();

  const handlePlanTrip = () => {
    if (status === "authenticated") {
      router.push('/trip-planner');
    } else {
      // If this CTA is used in the landing page where the auth modal is already defined
      if (setIsAuthModalOpen) {
        setIsAuthModalOpen(true);
      } else {
        // Redirect to home with a query parameter to open the modal
        router.push('/?auth=open');
      }
    }
  };

  return (
    <section className="relative hero overflow-hidden min-h-screen">
      <Image
        src="/image1.png"
        alt="Background"
        className="object-cover w-full"
        fill
        priority
      />
      <div className="relative hero-overlay bg-neutral bg-opacity-70"></div>
      <div className="relative hero-content text-center text-neutral-content p-8">
        <div className="flex flex-col items-center max-w-xl p-8 md:p-0">
          <h2 className="font-bold text-3xl md:text-5xl tracking-tight mb-8 md:mb-12">
            We Plan, You Explore
          </h2>
          <p className="text-lg opacity-80 mb-12 md:mb-16">
            Travel Smart, Enjoy more
          </p>

          <button 
            onClick={handlePlanTrip}
            className="btn btn-primary btn-wide bg-indigo-900 hover:bg-indigo-800 border-none"
          >
            Start my trip
          </button>
        </div>
      </div>
    </section>
  );
};

export default CTA;