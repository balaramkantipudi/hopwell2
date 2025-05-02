// // components/SpinGlobe.js
// import { useState, useRef } from 'react';
// import { useRouter } from 'next/router';

// const presets = [
//   ['❄️ Cold', 'Where is somewhere really cold?'],
//   ['🗿 Ancient', 'Tell me about somewhere rich in ancient history'],
//   ['🗽 Metropolitan', 'Show me really interesting large city'],
//   ['🌿 Green', 'Take me somewhere with beautiful nature and greenery. What makes it special?'],
//   ['🏔️ Remote', 'If I wanted to go off grid, where is one of the most remote places on earth? How would I get there?'],
//   ['🌌 Surreal', 'Think of a totally surreal location, where is it? What makes it so surreal?'],
// ];

// const SpinGlobe = () => {
//   const router = useRouter();
//   const [currentLocation, setCurrentLocation] = useState('');
//   const [currentCaption, setCurrentCaption] = useState('');
//   const [fullText, setFullText] = useState('');
//   const [isSpinning, setIsSpinning] = useState(false);
//   const [isLoading, setIsLoading] = useState(false);
//   const [error, setError] = useState('');
//   const mapRef = useRef(null);

//   const renderMap = (location) => {
//     if (!location) return;
    
//     const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
//     const mapUrl = `https://www.google.com/maps/embed/v1/place?key=${API_KEY}&q=${encodeURIComponent(location)}`;
    
//     if (mapRef.current) {
//       mapRef.current.src = mapUrl;
//     }
//   };

//   const handlePresetClick = async (preset) => {
//     setIsSpinning(true);
//     setIsLoading(true);
//     setError('');
    
//     try {
//       const response = await fetch('/api/recommend-place', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({ prompt: preset[1] }),
//       });
      
//       if (!response.ok) {
//         const errorData = await response.json();
//         throw new Error(errorData.error || 'Failed to get recommendation');
//       }
      
//       const data = await response.json();
      
//       setCurrentLocation(data.location);
//       setCurrentCaption(data.caption);
//       setFullText(data.fullText);
//       renderMap(data.location);
//     } catch (err) {
//       setError(err.message || 'Something went wrong');
//       console.error('Error:', err);
//     } finally {
//       setIsSpinning(false);
//       setIsLoading(false);
//     }
//   };

//   return (
//     <section id="globe" className="py-16 bg-white">
//       <div className="container mx-auto px-8">
//         <h2 className="text-3xl font-bold text-center mb-8 text-indigo-900">Feeling Spontaneous?</h2>
//         <p className="text-lg text-center mb-8 max-w-2xl mx-auto">
//           Spin the globe and discover your next adventure destination!
//         </p>
        
//         <div className="grid md:grid-cols-2 gap-8 items-center max-w-6xl mx-auto">
//           <div className="flex flex-col items-center">
//             <div className={`w-64 h-64 rounded-full overflow-hidden relative mb-6 border-4 border-indigo-900 ${isSpinning ? 'animate-spin' : ''}`}>
//               <div className="absolute inset-0 bg-indigo-900 opacity-10"></div>
//               <img 
//                 src="/globe.png" 
//                 alt="Globe" 
//                 className="w-full h-full object-cover"
//                 onError={(e) => {
//                   e.target.onerror = null;
//                   e.target.src = "https://via.placeholder.com/400x400?text=Globe";
//                 }}
//               />
//             </div>
            
//             <div className="grid grid-cols-3 gap-2 mb-6">
//               {presets.map((preset, index) => (
//                 <button
//                   key={index}
//                   className="btn btn-sm bg-indigo-100 text-indigo-900 hover:bg-indigo-200"
//                   onClick={() => handlePresetClick(preset)}
//                   disabled={isLoading}
//                 >
//                   {preset[0]}
//                 </button>
//               ))}
//             </div>
            
//             <button 
//               onClick={() => handlePresetClick(presets[Math.floor(Math.random() * presets.length)])}
//               className="btn btn-primary bg-indigo-900 text-white"
//               disabled={isLoading}
//             >
//               {isLoading ? 'Searching...' : 'Spin the Globe'}
//             </button>
            
//             {error && (
//               <div className="mt-4 text-red-500 text-sm">
//                 {error}
//               </div>
//             )}
//           </div>
          
//           <div className="h-96 bg-gray-100 rounded-lg overflow-hidden flex flex-col">
//             {currentLocation ? (
//               <>
//                 <iframe
//                   ref={mapRef}
//                   className="w-full flex-grow border-0"
//                   loading="lazy"
//                   allowFullScreen
//                   src=""
//                   title="Google Map"
//                 ></iframe>
//                 <div className="bg-indigo-900 text-white p-4">
//                   <p className="text-sm">{currentCaption}</p>
//                   <a 
//                     href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(currentLocation)}`} 
//                     target="_blank" 
//                     rel="noopener noreferrer"
//                     className="text-xs text-indigo-200 hover:text-white underline mt-1 block"
//                   >
//                     View on Google Maps
//                   </a>
//                 </div>
//               </>
//             ) : (
//               <div className="w-full h-full flex items-center justify-center">
//                 <p className="text-gray-500">Spin the globe to discover a destination</p>
//               </div>
//             )}
//           </div>
//         </div>
        
//         {fullText && (
//           <div className="mt-8 p-6 bg-gray-50 rounded-lg max-w-3xl mx-auto">
//             <h3 className="font-bold text-xl mb-4">About this destination</h3>
//             <p>{fullText}</p>
//           </div>
//         )}
        
//         <div className="text-center mt-12">
//           <p className="mb-6">
//             Ready to plan your next adventure to one of these destinations?
//           </p>
//           <button 
//             onClick={() => router.push('/auth/signin')}
//             className="btn btn-primary bg-indigo-900"
//           >
//             Start Planning
//           </button>
//         </div>
//       </div>
//     </section>
//   );
// };

// export default SpinGlobe;

// components/SpinGlobe.js
import { useState, useRef } from 'react';
import { useRouter } from 'next/router';

const presets = [
  ['❄️ Cold', 'Where is somewhere really cold?'],
  ['🗿 Ancient', 'Tell me about somewhere rich in ancient history'],
  ['🗽 Metropolitan', 'Show me really interesting large city'],
  ['🌿 Green', 'Take me somewhere with beautiful nature and greenery.'],
  ['🏔️ Remote', 'Where is one of the most remote places on earth?'],
  ['🌌 Surreal', 'Show me a totally surreal location.'],
];

// Temporary mock destinations until we integrate the AI API
const mockDestinations = [
  { location: 'Yakutsk, Russia', caption: 'One of the coldest inhabited places on Earth.' },
  { location: 'Machu Picchu, Peru', caption: 'Ancient Incan citadel set high in the Andes Mountains.' },
  { location: 'Tokyo, Japan', caption: 'One of the world\'s most populous metropolitan areas.' },
  { location: 'Daintree Rainforest, Australia', caption: 'The world\'s oldest tropical rainforest.' },
  { location: 'Tristan da Cunha', caption: 'The most remote inhabited archipelago in the world.' },
  { location: 'Socotra Island, Yemen', caption: 'An island with alien-like landscapes and unique plant species.' }
];

const SpinGlobe = () => {
  const router = useRouter();
  const [currentLocation, setCurrentLocation] = useState('');
  const [currentCaption, setCurrentCaption] = useState('');
  const [isSpinning, setIsSpinning] = useState(false);
  const mapRef = useRef(null);

  const spinGlobe = (preset) => {
    setIsSpinning(true);
    
    setTimeout(() => {
      // Select a random destination from our mock list
      const index = Math.floor(Math.random() * mockDestinations.length);
      const destination = mockDestinations[index];
      
      setCurrentLocation(destination.location);
      setCurrentCaption(destination.caption);
      setIsSpinning(false);
    }, 1500);
  };

  return (
    <section id="globe" className="py-16 bg-white">
      <div className="container mx-auto px-8">
        <h2 className="text-3xl font-bold text-center mb-8 text-indigo-900">Feeling Spontaneous?</h2>
        <p className="text-lg text-center mb-8 max-w-2xl mx-auto">
          Spin the globe and discover your next adventure destination!
        </p>
        
        <div className="flex flex-col items-center">
          <div className={`w-64 h-64 rounded-full overflow-hidden relative mb-6 border-4 border-indigo-900 ${isSpinning ? 'animate-spin' : ''}`}>
            <div className="absolute inset-0 bg-indigo-900 opacity-10"></div>
            <img 
              src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/22/Earth_Western_Hemisphere_transparent_background.png/800px-Earth_Western_Hemisphere_transparent_background.png" 
              alt="Globe" 
              className="w-full h-full object-cover"
            />
          </div>
          
          <div className="grid grid-cols-3 gap-2 mb-6">
            {presets.map((preset, index) => (
              <button
                key={index}
                className="btn btn-sm bg-indigo-100 text-indigo-900 hover:bg-indigo-200"
                onClick={() => spinGlobe(preset)}
                disabled={isSpinning}
              >
                {preset[0]}
              </button>
            ))}
          </div>
          
          <button 
            onClick={() => spinGlobe(presets[Math.floor(Math.random() * presets.length)])}
            className="btn btn-primary bg-indigo-900 text-white"
            disabled={isSpinning}
          >
            {isSpinning ? 'Spinning...' : 'Spin the Globe'}
          </button>
          
          {currentLocation && !isSpinning && (
            <div className="mt-8 max-w-xl bg-yellow-50 p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-bold mb-2">{currentLocation}</h3>
              <p>{currentCaption}</p>
              <div className="mt-4">
                <a 
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(currentLocation)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-sm btn-outline"
                >
                  View on Maps
                </a>
              </div>
            </div>
          )}
        </div>
        
        <div className="text-center mt-12">
          <p className="mb-6">
            Ready to plan your next adventure?
          </p>
          <button 
            onClick={() => router.push('/auth/signin')}
            className="btn btn-primary bg-indigo-900"
          >
            Start Planning
          </button>
        </div>
      </div>
    </section>
  );
};

export default SpinGlobe;