// pages/api/simple-test.js
// A simple endpoint to test basic functionality without authentication

export default async function handler(req, res) {
    // Set CORS headers for testing
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }
  
    try {
      const { method } = req;
      
      switch (method) {
        case 'GET':
          return res.status(200).json({
            success: true,
            message: 'API is working!',
            timestamp: new Date().toISOString(),
            method: 'GET'
          });
          
        case 'POST':
          const { testData } = req.body;
          
          return res.status(200).json({
            success: true,
            message: 'POST request received!',
            received: testData,
            timestamp: new Date().toISOString(),
            method: 'POST'
          });
          
        default:
          return res.status(405).json({
            success: false,
            error: `Method ${method} not allowed`
          });
      }
    } catch (error) {
      console.error('Simple test API error:', error);
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }