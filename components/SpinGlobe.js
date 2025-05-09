// components/SpinGlobe.js
import { useState, useRef } from 'react';
import { useRouter } from 'next/router';

const presets = [
  ['❄️ Cold', 'Where is somewhere really cold with unique attractions?'],
  ['🗿 Ancient', 'Tell me about somewhere rich in ancient history'],
  ['🗽 Metropolitan', 'Show me a fascinating large city with diverse attractions'],
  ['🌿 Green', 'Take me somewhere with beautiful nature and greenery'],
  ['🏔️ Remote', 'Where is one of the most remote places on earth?'],
  ['🌌 Surreal', 'What is a surreal destination with unique landscapes?'],
];

const SpinGlobe = () => {
  const router = useRouter();
  const [currentLocation, setCurrentLocation] = useState('');
  const [currentCaption, setCurrentCaption] = useState('');
  const [fullText, setFullText] = useState('');
  const [isSpinning, setIsSpinning] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [source, setSource] = useState('');
  const [errorInfo, setErrorInfo] = useState(null);
  const [showTestButtons, setShowTestButtons] = useState(false);
  const mapRef = useRef(null);

  const renderMap = (location) => {
    if (!location) return;
    
    try {
      // Simple Google Maps embed URL that works without an API key
      const mapUrl = `https://maps.google.com/maps?q=${encodeURIComponent(location)}&t=&z=5&ie=UTF8&iwloc=&output=embed`;
      
      if (mapRef.current) {
        mapRef.current.src = mapUrl;
      }
    } catch (err) {
      console.error('Error rendering map:', err);
    }
  };

  const fetchDestination = async (prompt, useFallback = false) => {
    setIsSpinning(true);
    setIsLoading(true);
    setErrorInfo(null);
    setSource('');
    
    try {
      const response = await fetch('/api/recommend-place', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          prompt, 
          useFallback 
        }),
      });
      
      // Get the raw response as text
      const responseText = await response.text();
      
      // Try to parse as JSON
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (err) {
        console.error('JSON parsing error:', err);
        throw new Error(`Invalid response from server: ${responseText.substring(0, 100)}...`);
      }
      
      // Check if the response was successful
      if (!response.ok) {
        throw new Error(data.error || 'Failed to get destination');
      }
      
      // Make sure the data contains the required fields
      if (!data.location || !data.caption || !data.fullText) {
        throw new Error('Invalid destination data received');
      }
      
      // Update the state with the destination data
      setCurrentLocation(data.location);
      setCurrentCaption(data.caption);
      setFullText(data.fullText);
      setSource(data.source || 'unknown');
      
      // If there was a fallback reason, save it
      if (data.reason) {
        setErrorInfo({
          reason: data.reason,
          details: data.details || ''
        });
      }
      
      // Render the map
      renderMap(data.location);
      
    } catch (error) {
      console.error('Error fetching destination:', error);
      setErrorInfo({
        reason: 'Error fetching destination',
        details: error.message
      });
    } finally {
      setIsSpinning(false);
      setIsLoading(false);
    }
  };

  return (
    <section id="globe" className="py-16 bg-white">
      <div className="container mx-auto px-8">
        <h2 className="text-3xl font-bold text-center mb-8 text-indigo-900">Feeling Spontaneous?</h2>
        <p className="text-lg text-center mb-8 max-w-2xl mx-auto">
          Spin the globe and discover your next adventure destination!
        </p>
        
        <div className="grid md:grid-cols-2 gap-8 items-center max-w-6xl mx-auto">
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
                  onClick={() => fetchDestination(preset[1])}
                  disabled={isLoading}
                >
                  {preset[0]}
                </button>
              ))}
            </div>
            
            <button 
              onClick={() => fetchDestination(presets[Math.floor(Math.random() * presets.length)][1])}
              className="btn btn-primary bg-indigo-900 text-white"
              disabled={isLoading}
            >
              {isLoading ? 'Searching...' : 'Spin the Globe'}
            </button>
            
            {/* Toggle test buttons */}
            {/* <button 
              onClick={() => setShowTestButtons(!showTestButtons)} 
              className="mt-4 text-xs text-gray-500 underline"
            >
              {showTestButtons ? 'Hide Test Options' : 'Show Test Options'}
            </button> */}
            
            {/* {showTestButtons && (
              <div className="flex gap-2 mt-2">
                <button 
                  onClick={() => fetchDestination('Give me a random destination', false)}
                  className="btn btn-xs bg-green-100 text-green-800"
                  disabled={isLoading}
                >
                  Test API
                </button>
                <button 
                  onClick={() => fetchDestination('', true)}
                  className="btn btn-xs bg-blue-100 text-blue-800"
                  disabled={isLoading}
                >
                  Test Fallback
                </button>
              </div>
            )} */}
            
            {/* Source indicator */}
            {/* {source && (
              <div className={`mt-4 px-3 py-1 rounded-full text-xs font-medium ${
                source === 'gemini-api' 
                  ? 'bg-green-100 text-green-800 border border-green-300' 
                  : 'bg-blue-100 text-blue-800 border border-blue-300'
              }`}>
                {source === 'gemini-api' ? '🤖 AI Generated' : '📚 From Library'}
              </div>
            )} */}
            
            {/* Error information */}
            {errorInfo && (
              <div className="mt-4 text-amber-600 text-xs p-2 bg-amber-50 rounded border border-amber-200">
                <p><span className="font-semibold">Note:</span> {errorInfo.reason}</p>
                {errorInfo.details && (
                  <details className="mt-1">
                    <summary className="cursor-pointer">Details</summary>
                    <p className="mt-1 text-amber-700">{errorInfo.details}</p>
                  </details>
                )}
              </div>
            )}
          </div>
          
          <div className="h-96 bg-gray-100 rounded-lg overflow-hidden flex flex-col">
            {currentLocation ? (
              <>
                <iframe
                  ref={mapRef}
                  className="w-full flex-grow border-0"
                  loading="lazy"
                  allowFullScreen
                  src=""
                  title="Google Map"
                ></iframe>
                <div className="bg-indigo-900 text-white p-4">
                  <p className="text-sm">{currentCaption}</p>
                  <a 
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(currentLocation)}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-xs text-indigo-200 hover:text-white underline mt-1 block"
                  >
                    View on Google Maps
                  </a>
                </div>
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <p className="text-gray-500">Spin the globe to discover a destination</p>
              </div>
            )}
          </div>
        </div>
        
        {fullText && (
          <div className="mt-8 p-6 bg-gray-50 rounded-lg max-w-3xl mx-auto">
            <h3 className="font-bold text-xl mb-4">About this destination</h3>
            <p>{fullText}</p>
          </div>
        )}
        
        <div className="text-center mt-12">
          <p className="mb-6">
            Ready to plan your next adventure to one of these destinations?
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