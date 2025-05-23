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
  const getYourGuideCode = process.env.NEXT_PUBLIC_GETYOURGUIDE_PARTNER_ID || 'YOUR_GETYOURGUIDE_AFFILIATE_ID';
  const viatorCode = process.env.NEXT_PUBLIC_VIATOR_PID || 'YOUR_VIATOR_AFFILIATE_ID';
  
  // Format dates for URLs if provided
  const formattedCheckIn = checkIn ? new Date(checkIn).toISOString().split('T')[0] : '';
  const formattedCheckOut = checkOut ? new Date(checkOut).toISOString().split('T')[0] : '';
  
  // Prepare destination for URL (encode spaces and special characters)
  const encodedDestination = encodeURIComponent(destination || '');
  const encodedOrigin = encodeURIComponent(checkIn || ''); // Assuming checkIn can be origin for flights
  const encodedDest = encodeURIComponent(checkOut || ''); // Assuming checkOut can be dest for flights

  // Build links based on type
  switch(type.toLowerCase()) {
    case 'hotel':
      // Generate Expedia hotel affiliate link
      return `https://www.expedia.com/Hotel-Search?destination=${encodedDestination}&startDate=${formattedCheckIn}&endDate=${formattedCheckOut}&adults=${travelers || 1}&AFFCID=${expediaCode}`;
    case 'booking.com':
      // Generate Booking.com hotel affiliate link
      return `https://www.booking.com/searchresults.html?city=${encodedDestination}&aid=${bookingComCode}&checkin=${formattedCheckIn}&checkout=${formattedCheckOut}&group_adults=${travelers || 1}`;
    case 'hotels.com':
      // Generate Hotels.com affiliate link
      // Note: Hotels.com uses destination ID which is hard to get dynamically. Using a general search link.
      return `https://www.hotels.com/search.do?q-destination=${encodedDestination}&q-check-in=${formattedCheckIn}&q-check-out=${formattedCheckOut}&q-rooms=1&q-room-0-adults=${travelers || 1}&affiliateCode=${hotelsComCode}`;
    case 'luxury':
    case 'ultraluxury':
    case 'private-jet':
      // Generate Villiers Jets affiliate link
      return `https://www.villiersjets.com/?id=${villiersCode}`;
    case 'flight': // Generic flight, can point to a meta-search or preferred provider
    case 'skyscanner':
      // Generate Skyscanner affiliate link (example, needs origin/dest codes)
      // Assuming destination is the arrival city and origin is passed in checkIn for flights
      return `https://www.skyscanner.com/transport/flights/${encodedOrigin}/${encodedDest}/?adults=${travelers || 1}&partnerid=YOUR_SKYSCANNER_PARTNER_ID`; // Replace with actual partner ID
    case 'kiwi':
      // Generate Kiwi affiliate link
      return `https://www.kiwi.com/deep?from=${encodedOrigin}&to=${encodedDest}&affilid=YOUR_KIWI_AFFILIATE_ID&adults=${travelers || 1}`; // Replace with actual affiliate ID
    case 'activity':
    case 'getyourguide':
      // Generate GetYourGuide affiliate link
      return `https://www.getyourguide.com/${encodedDestination}-l${destination.cityCode || ''}/s/?partner_id=${getYourGuideCode}`; // Assuming cityCode is available or general search
    case 'viator':
      // Generate Viator affiliate link
      return `https://www.viator.com/tours/${encodedDestination}/search?pid=${viatorCode}`;
    default:
      // Default to Expedia general link
      return `https://www.expedia.com/?destination=${encodedDestination}&AFFCID=${expediaCode}`;
  }
};

export const injectAffiliateLinksToItineraryJSON = (itineraryJSON, tripDetails = {}) => {
  if (!itineraryJSON) return null;

  const { destination, startDate, endDate, groupCount = 1 } = tripDetails;

  // Inject links into accommodations
  if (itineraryJSON.accommodations && Array.isArray(itineraryJSON.accommodations)) {
    itineraryJSON.accommodations = itineraryJSON.accommodations.map(hotel => {
      const hotelNameForSearch = hotel.name || destination;
      const checkInDate = hotel.checkIn || startDate;
      const checkOutDate = hotel.checkOut || endDate;
      return {
        ...hotel,
        affiliateLinks: {
          expedia: generateAffiliateLink('hotel', hotelNameForSearch, checkInDate, checkOutDate, groupCount),
          bookingCom: generateAffiliateLink('booking.com', hotelNameForSearch, checkInDate, checkOutDate, groupCount),
          hotelsCom: generateAffiliateLink('hotels.com', hotelNameForSearch, checkInDate, checkOutDate, groupCount),
        }
      };
    });
  }

  // Inject links into transportation
  if (itineraryJSON.transportation && Array.isArray(itineraryJSON.transportation)) {
    itineraryJSON.transportation = itineraryJSON.transportation.map(transport => {
      if (transport.type && transport.type.toLowerCase().includes('flight')) {
        const origin = transport.from && transport.from.name ? transport.from.name.split(',')[0] : tripDetails.origin || 'city'; // Fallback to trip origin or generic
        const dest = transport.to && transport.to.name ? transport.to.name.split(',')[0] : destination; // Fallback to trip destination
        const departureDate = transport.departureTime || startDate;
        
        return {
          ...transport,
          affiliateLinks: {
            // Assuming generateAffiliateLink for 'flight' can use origin/dest passed in checkIn/checkOut params
            skyscanner: generateAffiliateLink('skyscanner', dest, origin, dest, groupCount), // Needs IATA codes ideally
            kiwi: generateAffiliateLink('kiwi', dest, origin, dest, groupCount), // Needs IATA codes ideally
          }
        };
      }
      // Add other transport types (train, car rental) here if needed
      return transport;
    });
  }

  // Inject links into activities
  if (itineraryJSON.itinerary && Array.isArray(itineraryJSON.itinerary)) {
    itineraryJSON.itinerary = itineraryJSON.itinerary.map(day => {
      if (day.activities && Array.isArray(day.activities)) {
        day.activities = day.activities.map(activity => {
          const activityDestination = activity.location && activity.location.name ? activity.location.name : destination;
          // For activities, cityCode might be useful if available in activity.location
          const cityCode = activity.location && activity.location.cityCode ? activity.location.cityCode : ''; 
          return {
            ...activity,
            affiliateLinks: {
              getYourGuide: generateAffiliateLink('getyourguide', activityDestination, cityCode), // Pass cityCode as 'checkIn' for now
              viator: generateAffiliateLink('viator', activityDestination)
            }
          };
        });
      }
      return day;
    });
  }
  
  // Optionally, add a luxury travel option if not present
  // This part is tricky with JSON, might be better to add it as a separate object if desired.
  // For now, focusing on injecting into existing structures.

  return itineraryJSON;
};

// Function to process the itinerary and add affiliate links (OLD TEXT-BASED, KEEPING FOR REFERENCE OR OTHER USES)
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