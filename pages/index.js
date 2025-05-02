import Header from "@/components/Header";
import Hero from "@/components/Hero";
import About from "@/components/About";
import Features from "@/components/Features"; 
//import PlanMyTrip from "@/components/PlanMyTrip";
import SpinGlobe from "@/components/SpinGlobe";
//import CTA from "@/components/CTA";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        
        <Features />
        <About />
        <SpinGlobe />
      </main>
      <Footer />
    </>
  );
}

// export default function Home() {
//   return (
//     <div>
//       <h1>Hello World</h1>
//     </div>
//   );
// }