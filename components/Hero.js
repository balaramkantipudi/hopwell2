
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
            onClick={() => router.push('/auth/signin')} 
            className="btn btn-lg bg-white text-indigo-900 hover:bg-gray-100"
          >
            Start Planning
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