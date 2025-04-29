// import Image from "next/image";
// import { useSession, getSession } from "next-auth/react";
// import { useRouter } from "next/router";

// const imageNames = [
//   "image1.png",
//   "image2.png",
//   "image3.png",
//   "image4.png",
//   "image5.png",
//   "image6.png",
//   "image7.png",
//   "image8.png",
//   "image9.png",
// ];

// const Hero = () => {
//   const { data: session, status } = useSession();
//   const loading = status === "loading";
//   const router = useRouter();
//   const handleStartPlan = () => {
//     if (!loading && !session) {
//       router.push("/api/auth/signin");
//     } else {
//       router.push("/plan-my-trip-ai");
//     }
//   };
//   return (
//     <section className="w-full mx-auto bg-yellow-50 flex flex-col lg:flex-row items-center justify-center gap-16 lg:gap-2 px-8 py-8 lg:py-20">
//       <div className="flex flex-col gap-10 lg:gap-14 items-center justify-center text-center lg:text-left lg:items-start">
//         <h1 className="font-bold text-4xl lg:text-6xl tracking-tight md:-mb-4">
//           Seamless Travel planning for every Wanderlust
//         </h1>
//         <p className="text-lg opacity-80 leading-relaxed">
//           Create a perfect plan for your next journey based on your preferences.
//         </p>
//         <button
//           className="btn btn-primary btn-wide bg-indigo-900 hover:bg-indigo-900"
//           onClick={handleStartPlan}
//         >
//           Start my plan
//         </button>
//       </div>

//       <div className="masonry-grid lg:flex-row">
//         {imageNames.map((imageName, index) => (
//           <div key={index} className="masonry-item">
//             <Image
//               src={`/${imageName}`}
//               alt={`Image ${index}`}
//               layout="responsive"
//               width={300} // Adjust the width as needed
//               height={200} // Adjust the height as needed
//             />
//           </div>
//         ))}
//       </div>
//     </section>
//   );
// };

// export default Hero;

import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import Image from "next/image";

const Hero = ({ setIsAuthModalOpen }) => {
  const router = useRouter();
  const { status } = useSession();

  const handlePlanTrip = () => {
    if (status === "authenticated") {
      router.push('/trip-planner');
    } else {
      setIsAuthModalOpen(true);
    }
  };

  return (
    <section className="w-full mx-auto bg-yellow-50 flex flex-col lg:flex-row items-center justify-center gap-16 lg:gap-2 px-8 py-8 lg:py-20">
      <div className="flex flex-col gap-10 lg:gap-14 items-center justify-center text-center lg:text-left lg:items-start">
        <h1 className="font-bold text-4xl lg:text-6xl tracking-tight md:-mb-4">
          Seamless Travel planning for every Wanderlust
        </h1>
        <p className="text-lg opacity-80 leading-relaxed">
          Create a perfect plan for your next journey based on your preferences.
        </p>
        <button 
          onClick={handlePlanTrip}
          className="btn btn-primary btn-wide bg-indigo-900 hover:bg-indigo-800 border-none"
        >
          Start my plan
        </button>
      </div>

      <div className="masonry-grid lg:flex-row">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
          <div key={num} className="masonry-item">
            <Image
              src={`/image${num}.png`}
              alt={`Travel image ${num}`}
              width={300}
              height={200}
              className="rounded-lg shadow-md"
            />
          </div>
        ))}
      </div>
    </section>
  );
};

export default Hero;