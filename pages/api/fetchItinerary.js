// pages/api/fetchItinerary.js
import { fetchAI21Response } from "@/libs/ai21";

export default async function handler(req, res) {
  if (req.method === "POST") {
    try {
      const data = req.body; // Assuming the request body contains the data needed for AI21
      const responseText = await fetchAI21Response(data);
      res.status(200).json({ text: responseText });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else {
    // Handle any other HTTP method
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
