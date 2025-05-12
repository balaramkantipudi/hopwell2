// components/AdvancedMap.js
import { useEffect, useRef, useState } from 'react';

// This component requires you to add a Google Maps API key
// Add the following script tag to your _document.js:
// <script src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`} />

export default function AdvancedMap({ 
  locations = [], // Array of locations or a single location string
  height = "400px",
  zoom = 10,
  apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(null);
  
  // Convert a single location string to an array for consistent processing
  const locationArray = Array.isArray(locations) ? locations : [locations].filter(Boolean);

  useEffect(() => {
    // Don't proceed if no locations are provided
    if (locationArray.length === 0) return;
    
    // Don't initialize if Google Maps API is not loaded
    if (!window.google?.maps) {
      setError('Google Maps API not loaded. Please add your API key.');
      return;
    }
    
    // Initialize the map if it hasn't been initialized yet
    if (!mapInstanceRef.current && mapContainerRef.current) {
      try {
        // Create a new map instance
        const map = new window.google.maps.Map(mapContainerRef.current, {
          zoom: zoom,
          mapTypeControl: true,
          streetViewControl: true,
          fullscreenControl: true,
          zoomControl: true,
        });
        
        mapInstanceRef.current = map;
        setIsLoaded(true);
        
      } catch (err) {
        console.error('Error initializing map:', err);
        setError('Could not initialize map. Please try again later.');
        return;
      }
    }
    
    // If we have a map instance, add markers for all locations
    if (mapInstanceRef.current) {
      // Clear existing markers
      markersRef.current.forEach(marker => marker.setMap(null));
      markersRef.current = [];
      
      const geocoder = new window.google.maps.Geocoder();
      const bounds = new window.google.maps.LatLngBounds();
      
      // Process each location
      locationArray.forEach((location, index) => {
        if (!location) return;
        
        geocoder.geocode({ address: location }, (results, status) => {
          if (status === 'OK' && results[0]) {
            const position = results[0].geometry.location;
            
            // Create a marker
            const marker = new window.google.maps.Marker({
              position,
              map: mapInstanceRef.current,
              title: location,
              label: locationArray.length > 1 ? (index + 1).toString() : null,
              animation: window.google.maps.Animation.DROP
            });
            
            // Create an info window
            const infoWindow = new window.google.maps.InfoWindow({
              content: `<div style="padding: 8px; max-width: 200px;">
                <h3 style="font-weight: bold; margin-bottom: 5px;">${location}</h3>
                <p style="margin: 0;">Stop ${index + 1} on your itinerary</p>
              </div>`
            });
            
            // Add click listener to show info window
            marker.addListener('click', () => {
              infoWindow.open(mapInstanceRef.current, marker);
            });
            
            // Add marker to our ref array for cleanup
            markersRef.current.push(marker);
            
            // Extend bounds to include this location
            bounds.extend(position);
            
            // If this is the last location, fit the map to show all markers
            if (index === locationArray.length - 1) {
              mapInstanceRef.current.fitBounds(bounds);
              
              // If there's only one location, set the zoom level
              if (locationArray.length === 1) {
                mapInstanceRef.current.setZoom(zoom);
              }
            }
          } else {
            console.error(`Geocoding failed for "${location}": ${status}`);
          }
        });
      });
    }
    
  }, [locationArray, zoom]);

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

  if (locationArray.length === 0) {
    return (
      <div 
        className="flex items-center justify-center bg-gray-100 text-gray-500 rounded-lg"
        style={{ height }}
      >
        <p>No locations specified</p>
      </div>
    );
  }

  return (
    <div className="relative w-full rounded-lg overflow-hidden" style={{ height }}>
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-600"></div>
        </div>
      )}
      
      {/* The map container */}
      <div 
        ref={mapContainerRef} 
        className="w-full h-full"
        aria-label={`Map showing ${locationArray.join(', ')}`}
      ></div>
      
      {/* Optional: Location list */}
      {locationArray.length > 1 && (
        <div className="absolute bottom-0 left-0 right-0 bg-white bg-opacity-90 p-2 z-20">
          <h3 className="font-bold text-sm">Itinerary Stops:</h3>
          <div className="flex flex-wrap gap-1 text-xs">
            {locationArray.map((location, index) => (
              <span key={index} className="bg-indigo-100 text-indigo-800 py-1 px-2 rounded-full">
                {index + 1}. {location}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}