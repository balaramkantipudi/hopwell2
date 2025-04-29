// pages/api/restaurants/[cuisine].js
import axios from "axios";

export default async function handler(req, res) {
  const { cuisine, city } = req.query;
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  const endpoint = `https://maps.googleapis.com/maps/api/place/textsearch/json`;
  const params = new URLSearchParams({
    query: `${cuisine} restaurants in ${city}`,
    key: apiKey,
  });

  try {
    const { data } = await axios.get(`${endpoint}?${params}`);
    res.status(200).json(data);
  } catch (error) {
    console.error("Failed to fetch restaurants:", error);
    res.status(500).json({ error: "Failed to fetch restaurants" });
  }
}
