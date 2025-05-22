// pages/api/restaurants/[cuisine].js
import { Client } from "@googlemaps/google-maps-services-js";

export default async function handler(req, res) {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) {
    console.error("Server configuration error: Google Places API key is missing.");
    return res.status(500).json({ error: "Server configuration error: Google Places API key is missing." });
  }

  const { cuisine, city } = req.query;
  if (!cuisine || !city) {
    return res.status(400).json({ error: "Missing required query parameters: cuisine and city." });
  }

  const client = new Client({});

  try {
    const { data } = await client.textSearch({
      params: {
        query: `${cuisine} restaurants in ${city}`,
        key: apiKey,
      },
      timeout: 5000, // Optional timeout for the request
    });

    // The client library's response structure might be different from axios
    // data.results is usually where the places are.
    if (data.status === 'OK') {
      res.status(200).json(data);
    } else {
      // Handle Google API specific errors (e.g., ZERO_RESULTS, OVER_QUERY_LIMIT)
      console.error("Google Places API returned status:", data.status, data.error_message || "");
      res.status(500).json({ 
        error: `Failed to fetch restaurants from Google Places API. Status: ${data.status}`,
        details: data.error_message || data.results // Sometimes results might contain debug info
      });
    }
  } catch (error) {
    // This catches network errors or errors from the client library itself
    if (error.response) {
      // Error from Google Maps API (e.g. invalid API key, network issues on their end)
      console.error("Failed to fetch restaurants - Google API Error:", {
        status: error.response.status,
        data: error.response.data,
      });
      res.status(error.response.status || 500).json({ 
        error: "Failed to fetch restaurants from Google Places API.",
        details: error.response.data 
      });
    } else if (error.isAxiosError) {
        // This block might not be directly applicable if not using axios via the client,
        // but the client library might have a similar way to identify its specific errors.
        // For now, treating as a generic error.
        console.error("Failed to fetch restaurants - Client Library or Network Error:", error.message);
        res.status(500).json({ error: "Failed to fetch restaurants: Client library or network error." });
    }
    else {
      // Something else happened
      console.error("Failed to fetch restaurants - Unexpected error:", error);
      res.status(500).json({ error: "Failed to fetch restaurants: An unexpected error occurred." });
    }
  }
}
