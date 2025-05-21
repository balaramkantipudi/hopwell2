// Add to libs/affiliateLinks.js or create a new file

/**
 * Add accommodation booking links to itinerary
 * @param {string} itineraryText - Original itinerary text
 * @param {object} destination - Destination information
 * @returns {string} - Itinerary with booking links
 */
 // 1. First, we'll create a utility function to generate affiliate links
// Add this to a new file: libs/affiliateUtils.js

export const generateAffiliateLink = (type, destination, checkIn, checkOut, travelers) => {
  // Get affiliate codes from environment variables
  const expediaCode = process.env.NEXT_PUBLIC_EXPEDIA_AFFILIATE_CODE || 'ru9V7RK';
  const hotelsComCode = process.env.NEXT_PUBLIC_HOTELS_AFFILIATE_CODE || 'UPtAKAG';
  const villiersCode = process.env.NEXT_PUBLIC_VILLIERS_AFFILIATE_CODE || '10093';
  const bookingComCode = process.env.NEXT_PUBLIC_BOOKING_AFFILIATE_CODE || '1942385';
  
  // Format dates for URLs if provided
  const formattedCheckIn = checkIn ? new Date(checkIn).toISOString().split('T')[0] : '';
  const formattedCheckOut = checkOut ? new Date(checkOut).toISOString().split('T')[0] : '';
  
  // Prepare destination for URL (encode spaces and special characters)
  const encodedDestination = encodeURIComponent(destination || '');
  
  // Build links based on type
  switch(type.toLowerCase()) {
    case 'hotel':
    case 'hotels':
      // Generate Expedia hotel affiliate link
      return `https://www.expedia.com/Hotel-Search?destination=${encodedDestination}&startDate=${formattedCheckIn}&endDate=${formattedCheckOut}&adults=${travelers || 1}&AFFCID=${expediaCode}`;
      
    case 'hotels.com':
      // Generate Hotels.com affiliate link
      return `https://www.hotels.com/search.do?destination-id=${encodedDestination}&q-check-in=${formattedCheckIn}&q-check-out=${formattedCheckOut}&q-rooms=1&q-room-0-adults=${travelers || 1}&affiliateCode=${hotelsComCode}`;
      
    case 'luxury':
    case 'ultraluxury':
    case 'private-jet':
      // Generate Villiers Jets affiliate link
      return `https://www.villiersjets.com/?id=${villiersCode}`;
      
    case 'hotels':
    case 'hotel':
      // Generate Skyscanner affiliate link
      return `https://www.booking.com/transport/flights/${encodedDestination}?adults=${travelers || 1}&affiliateId=${bookingComCode}`;
      
    default:
      // Default to Expedia
      return `https://www.expedia.com/?AFFCID=${expediaCode}`;
  }
};

// Function to process the itinerary and add affiliate links
export const processItinerary = (itineraryText, formData) => {
  if (!itineraryText) return '';
  
  // Extract trip information from formData
  const { 
    destination, 
    startDate, 
    endDate, 
    groupCount = 1
  } = formData || {};
  
  // Replace hotel and accommodation suggestions with affiliate links
  let processedText = itineraryText;
  
  // Replace hotel mentions with affiliate links
  const hotelRegex = /\b(hotel|accommodation|stay at|resort|lodge|inn)\b\s+([^.\n,]+)/gi;
  processedText = processedText.replace(hotelRegex, (match, type, hotel) => {
    const hotelLink = generateAffiliateLink('hotel', 
      `${hotel.trim()} ${destination || ''}`, 
      startDate, 
      endDate, 
      groupCount);
    
    return `${type} [${hotel.trim()}](${hotelLink})`;
  });
  
  // Replace flight mentions with affiliate links
  const flightRegex = /\b(flights?|air travel|fly|airlines)\b\s+(to|from|between)\s+([^.\n,]+)/gi;
  processedText = processedText.replace(flightRegex, (match, type, preposition, location) => {
    const flightLink = generateAffiliateLink('flight', 
      destination || location.trim(), 
      startDate, 
      null, 
      groupCount);
    
    return `${type} ${preposition} [${location.trim()}](${flightLink})`;
  });
  
  // Add a premium travel option somewhere in the itinerary
  if (!processedText.includes('villiersjets')) {
    const luxuryLink = generateAffiliateLink('ultraluxury');
    processedText += `\n\n**Premium Travel Option**: For the ultimate luxury experience, consider [private jet charter services](${luxuryLink}) for your journey.`;
  }
  
  return processedText;
};