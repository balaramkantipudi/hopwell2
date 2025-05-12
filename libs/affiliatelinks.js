// Add to libs/affiliateLinks.js or create a new file

/**
 * Add accommodation booking links to itinerary
 * @param {string} itineraryText - Original itinerary text
 * @param {object} destination - Destination information
 * @returns {string} - Itinerary with booking links
 */
 export function addAccommodationLinks(itineraryText, destination) {
    // If no itinerary or destination, return original
    if (!itineraryText || !destination) return itineraryText;
    
    // Create affiliate links
    const bookingLink = `https://www.booking.com/searchresults.html?ss=${encodeURIComponent(destination)}&aid=YOUR_BOOKING_AFFILIATE_ID`;
    const expediaLink = `https://www.expedia.com/Hotel-Search?destination=${encodeURIComponent(destination)}&AFFCID=YOUR_EXPEDIA_AFFILIATE_ID`;
    
    // Find the accommodations section
    const accommRegex = /ACCOMMODATIONS?[\s\n\r]*([-=]+)?[\s\n\r]+([\s\S]+?)(?=\n[A-Z\s]+([-=]+)?[\s\n\r]+|$)/i;
    const accommMatch = itineraryText.match(accommRegex);
    
    // If no accommodations section found, add at the end
    if (!accommMatch) {
      return itineraryText + `\n\n## ACCOMMODATION BOOKING OPTIONS\n\nBook your stay with our trusted partners:\n- [Search hotels on Booking.com](${bookingLink})\n- [Find deals on Expedia](${expediaLink})\n`;
    }
    
    // Extract and modify the accommodations section
    const sectionStart = accommMatch.index;
    const sectionEnd = sectionStart + accommMatch[0].length;
    const beforeSection = itineraryText.substring(0, sectionEnd);
    const afterSection = itineraryText.substring(sectionEnd);
    
    // Add booking links after the accommodations section
    const bookingLinksText = `\n\n**Book Your Stay:**\n- [Search hotels on Booking.com](${bookingLink})\n- [Find deals on Expedia](${expediaLink})\n`;
    
    return beforeSection + bookingLinksText + afterSection;
  }
  
  /**
   * Process and enhance the full itinerary before displaying
   * @param {string} itineraryText - Original itinerary from API
   * @param {object} tripData - Trip form data
   * @returns {string} - Enhanced itinerary with all links and formatting
   */
  export function processItinerary(itineraryText, tripData) {
    if (!itineraryText || !tripData) return itineraryText;
    
    let processedText = itineraryText;
    
    // Add accommodation booking links
    processedText = addAccommodationLinks(processedText, tripData.destination);
    
    // Add Google Maps links
    if (tripData.destination) {
      const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(tripData.destination)}`;
      
      // Add a Maps link near the top of the itinerary
      const summaryRegex = /(TRIP SUMMARY[\s\n\r]*[-=]+[\s\n\r]+[\s\S]+?)(?=\n[A-Z\s]+([-=]+)?[\s\n\r]+)/i;
      const summaryMatch = processedText.match(summaryRegex);
      
      if (summaryMatch) {
        const summaryText = summaryMatch[1];
        const enhancedSummary = summaryText + `\n\n**Explore the destination:** [View on Google Maps](${mapsUrl})\n`;
        processedText = processedText.replace(summaryText, enhancedSummary);
      }
    }
    
    // If transportation is air/flight, add flight booking links
    if (tripData.transportMode === 'air' && tripData.origin && tripData.destination) {
      const flightLinks = `\n\n## FLIGHT BOOKING OPTIONS\n\nFind the best deals on flights:\n- [Search on Skyscanner](https://www.skyscanner.com/transport/flights/${encodeURIComponent(tripData.origin)}/${encodeURIComponent(tripData.destination)}/?adultsv2=${tripData.groupCount || 1})\n- [Compare prices on Kayak](https://www.kayak.com/flights/${encodeURIComponent(tripData.origin)}-${encodeURIComponent(tripData.destination)})\n`;
      
      // Add flight links near the end of the itinerary
      processedText += flightLinks;
    }
    
    return processedText;
  }