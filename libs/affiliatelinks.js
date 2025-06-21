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
  const getYourGuideCode = process.env.NEXT_PUBLIC_GETYOURGUIDE_PARTNER_ID || 'YOUR_GETYOURGUIDE_DEFAULT_ID'; // Fallback added
  const viatorCode = process.env.NEXT_PUBLIC_VIATOR_PID || 'YOUR_VIATOR_DEFAULT_ID'; // Fallback added
  const skyscannerPartnerId = process.env.NEXT_PUBLIC_SKYSCANNER_PARTNER_ID || 'YOUR_SKYSCANNER_DEFAULT_PARTNER_ID'; // Env var for Skyscanner
  const kiwiAffiliateId = process.env.NEXT_PUBLIC_KIWI_AFFILIATE_ID || 'YOUR_KIWI_DEFAULT_AFFILIATE_ID'; // Env var for Kiwi

  let formattedCheckIn = '';
  let formattedCheckOut = '';

  try {
    if (checkIn && (type.toLowerCase() === 'hotel' || type.toLowerCase() === 'booking.com' || type.toLowerCase() === 'hotels.com')) {
      formattedCheckIn = new Date(checkIn).toISOString().split('T')[0];
    }
  } catch (error) {
    console.warn(`Failed to parse checkIn date: '${checkIn}'`, error);
    // formattedCheckIn remains ''
  }

  try {
    if (checkOut && (type.toLowerCase() === 'hotel' || type.toLowerCase() === 'booking.com' || type.toLowerCase() === 'hotels.com')) {
      formattedCheckOut = new Date(checkOut).toISOString().split('T')[0];
    }
  } catch (error) {
    console.warn(`Failed to parse checkOut date: '${checkOut}'`, error);
    // formattedCheckOut remains ''
  }
  
  // Prepare destination for URL (encode spaces and special characters)
  const encodedDestination = encodeURIComponent(destination || '');

  // Build links based on type
  switch(type.toLowerCase()) {
    case 'hotel':
    case 'booking.com':
    case 'hotels.com':
      // Common logic for hotel types
      const hotelUrlMap = {
        'hotel': `https://www.expedia.com/Hotel-Search?destination=${encodedDestination}&startDate=${formattedCheckIn}&endDate=${formattedCheckOut}&adults=${travelers || 1}&AFFCID=${expediaCode}`,
        'booking.com': `https://www.booking.com/searchresults.html?city=${encodedDestination}&aid=${bookingComCode}&checkin=${formattedCheckIn}&checkout=${formattedCheckOut}&group_adults=${travelers || 1}`,
        'hotels.com': `https://www.hotels.com/search.do?q-destination=${encodedDestination}&q-check-in=${formattedCheckIn}&q-check-out=${formattedCheckOut}&q-rooms=1&q-room-0-adults=${travelers || 1}&affiliateCode=${hotelsComCode}`
      };
      return hotelUrlMap[type.toLowerCase()];

    case 'luxury':
    case 'ultraluxury':
    case 'private-jet':
      return `https://www.villiersjets.com/?id=${villiersCode}`;

    case 'flight': // Generic flight, can point to a meta-search or preferred provider
    case 'skyscanner':
      // For flights, 'checkIn' is origin, 'checkOut' is destination
      const encodedFlightOriginSkyscanner = encodeURIComponent(checkIn || '');
      const encodedFlightDestSkyscanner = encodeURIComponent(checkOut || '');
      // 'destination' (the main function param) can be a fallback if checkOut is not provided, or ignored.
      // Using encodedFlightDestSkyscanner which is derived from checkOut, which is what injectAffiliateLinksToItineraryJSON passes as flight destination.
      return `https://www.skyscanner.com/transport/flights/${encodedFlightOriginSkyscanner}/${encodedFlightDestSkyscanner}/?adults=${travelers || 1}&partnerid=${skyscannerPartnerId}`;

    case 'kiwi':
      // For flights, 'checkIn' is origin, 'checkOut' is destination
      const encodedFlightOriginKiwi = encodeURIComponent(checkIn || '');
      const encodedFlightDestKiwi = encodeURIComponent(checkOut || '');
      return `https://www.kiwi.com/deep?from=${encodedFlightOriginKiwi}&to=${encodedFlightDestKiwi}&affilid=${kiwiAffiliateId}&adults=${travelers || 1}`;

    case 'activity': // Generic activity, can point to a general provider search
    case 'getyourguide':
      // For GetYourGuide, 'checkIn' is cityCode
      const cityCodeForLink = checkIn || ''; // checkIn parameter holds the cityCode for GetYourGuide
      // 'destination' is the main activity destination name
      return `https://www.getyourguide.com/${encodedDestination}-l${cityCodeForLink}/s/?partner_id=${getYourGuideCode}`;

    case 'viator':
      // 'destination' is the main activity destination name
      return `https://www.viator.com/tours/${encodedDestination}/search?pid=${viatorCode}`;
    default:
      // Default to Expedia general link
      return `https://www.expedia.com/?destination=${encodedDestination}&AFFCID=${expediaCode}`;
  }
};

export const injectAffiliateLinksToItineraryJSON = (itineraryJSON, tripDetails = {}) => {
  if (!itineraryJSON) return null;

  const { destination, startDate, endDate, groupCount = 1, origin: tripOrigin } = tripDetails; // Ensure tripOrigin is destructured
  console.log('injectAffiliateLinksToItineraryJSON called with itineraryJSON:', JSON.stringify(itineraryJSON, null, 2), 'and tripDetails:', JSON.stringify(tripDetails, null, 2));

  // Inject links into accommodations
  if (itineraryJSON.accommodations && Array.isArray(itineraryJSON.accommodations)) {
    console.log('Processing accommodations for affiliate links. TripDetails:', JSON.stringify(tripDetails, null, 2));
    itineraryJSON.accommodations = itineraryJSON.accommodations.map(hotel => {
      console.log('[ACCOMMODATION] hotel object from AI:', JSON.stringify(hotel, null, 2));
      const hotelNameForSearch = hotel.name || destination;
      const checkInDate = hotel.checkIn || startDate;
      const checkOutDate = hotel.checkOut || endDate;

      console.log(`[ACCOMMODATION] Params for generateAffiliateLink (Expedia): type="hotel", destination="${hotelNameForSearch}", checkIn="${checkInDate}", checkOut="${checkOutDate}", travelers="${groupCount}"`);
      console.log(`[ACCOMMODATION] Params for generateAffiliateLink (Booking.com): type="booking.com", destination="${hotelNameForSearch}", checkIn="${checkInDate}", checkOut="${checkOutDate}", travelers="${groupCount}"`);
      console.log(`[ACCOMMODATION] Params for generateAffiliateLink (Hotels.com): type="hotels.com", destination="${hotelNameForSearch}", checkIn="${checkInDate}", checkOut="${checkOutDate}", travelers="${groupCount}"`);

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
    console.log('Processing transportation for affiliate links. TripDetails:', JSON.stringify(tripDetails, null, 2));
    itineraryJSON.transportation = itineraryJSON.transportation.map(transport => {
      if (transport.type && transport.type.toLowerCase().includes('flight')) {
        console.log('[FLIGHT] transport object from AI:', JSON.stringify(transport, null, 2));
        const origin_for_link = transport.from && transport.from.name ? transport.from.name.split(',')[0] : tripOrigin || 'city';
        const dest_for_link = transport.to && transport.to.name ? transport.to.name.split(',')[0] : destination;
        // const departureDate = transport.departureTime || startDate; // Not directly used in these logs but good for context

        console.log(`[FLIGHT] Params for generateAffiliateLink (Skyscanner): type="skyscanner", destination_for_link="${dest_for_link}", origin_for_link="${origin_for_link}", travelers="${groupCount}"`);
        console.log(`[FLIGHT] Params for generateAffiliateLink (Kiwi): type="kiwi", destination_for_link="${dest_for_link}", origin_for_link="${origin_for_link}", travelers="${groupCount}"`);

        return {
          ...transport,
          affiliateLinks: {
            skyscanner: generateAffiliateLink('skyscanner', dest_for_link, origin_for_link, dest_for_link, groupCount),
            kiwi: generateAffiliateLink('kiwi', dest_for_link, origin_for_link, dest_for_link, groupCount),
          }
        };
      }
      // Add other transport types (train, car rental) here if needed
      return transport;
    });
  }

  // Inject links into activities
  if (itineraryJSON.itinerary && Array.isArray(itineraryJSON.itinerary)) {
    console.log('Processing itinerary activities for affiliate links. TripDetails:', JSON.stringify(tripDetails, null, 2));
    itineraryJSON.itinerary = itineraryJSON.itinerary.map(day => {
      if (day.activities && Array.isArray(day.activities)) {
        day.activities = day.activities.map(activity => {
          console.log('[ACTIVITY] activity object from AI:', JSON.stringify(activity, null, 2));
          const activityDestination = activity.location && activity.location.name ? activity.location.name : destination;
          const cityCode = activity.location && activity.location.cityCode ? activity.location.cityCode : '';

          console.log(`[ACTIVITY] Params for generateAffiliateLink (GetYourGuide): type="getyourguide", destination="${activityDestination}", cityCode_param="${cityCode}"`);
          console.log(`[ACTIVITY] Params for generateAffiliateLink (Viator): type="viator", destination="${activityDestination}"`);

          return {
            ...activity,
            affiliateLinks: {
              getYourGuide: generateAffiliateLink('getyourguide', activityDestination, cityCode),
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