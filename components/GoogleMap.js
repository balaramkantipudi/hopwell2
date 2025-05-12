// components/GoogleMap.js
import { useEffect, useRef, useState } from 'react';

export default function GoogleMap({ location, height = "300px", zoom = 10 }) {
  const mapRef = useRef(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Don't proceed if no location is provided
    if (!location) return;
    
    try {
      // Simple Google Maps embed URL that works without an API key
      const mapUrl = `https://maps.google.com/maps?q=${encodeURIComponent(location)}&t=&z=${zoom}&ie=UTF8&iwloc=&output=embed`;
      
      if (mapRef.current) {
        mapRef.current.src = mapUrl;
        setIsLoaded(true);
      }
    } catch (err) {
      console.error('Error rendering map:', err);
      setError('Could not load map. Please try again later.');
    }
  }, [location, zoom]);

  if (error) {
    return (
      <div 
        className="flex items-center justify-center bg-gray-100 text-gray-500 rounded-lg"
        style={{ height }}
      >
        <p>{error}</p>
      </div>
    );
  }

  if (!location) {
    return (
      <div 
        className="flex items-center justify-center bg-gray-100 text-gray-500 rounded-lg"
        style={{ height }}
      >
        <p>No location specified</p>
      </div>
    );
  }

  return (
    <div className="w-full rounded-lg overflow-hidden" style={{ height }}>
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-600"></div>
        </div>
      )}
      <iframe
        ref={mapRef}
        className="w-full h-full border-0"
        loading="lazy"
        allowFullScreen
        src=""
        title={`Map of ${location}`}
      ></iframe>
    </div>
  );
}