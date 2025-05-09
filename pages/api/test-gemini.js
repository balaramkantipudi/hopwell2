// pages/api/test-gemini.js
import https from 'https';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Check for Gemini API key
    const geminiApiKey = process.env.GEMINI_API_KEY;
    
    if (!geminiApiKey) {
      return res.status(500).json({ 
        error: 'Missing Gemini API key',
        message: 'Please add GEMINI_API_KEY to environment variables'
      });
    }
    
    // We'll test direct API access to diagnose issues
    try {
      // Prepare the request data
      const requestData = JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: "What's the capital of France?"
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.7
        }
      });

      // Log all available environment variables for Gemini
      const apiVersion = process.env.GEMINI_API_VERSION || 'v1';
      const modelName = process.env.GEMINI_MODEL || 'gemini-1.5-pro';
      
      // Build the URL
      const url = `https://generativelanguage.googleapis.com/${apiVersion}/models/${modelName}:generateContent?key=${geminiApiKey}`;
      
      // Log information for debugging (but mask most of API key)
      const maskedKey = geminiApiKey.substring(0, 5) + '...' + geminiApiKey.substring(geminiApiKey.length - 3);
      
      const diagnosticInfo = {
        apiVersion,
        modelName,
        apiKeyPrefix: maskedKey,
        url: url.replace(geminiApiKey, '[API_KEY]')
      };
      
      console.log('Making API request with:', diagnosticInfo);
      
      // Make the request using a Promise
      const makeRequest = () => {
        return new Promise((resolve, reject) => {
          const options = {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Content-Length': Buffer.byteLength(requestData)
            }
          };
          
          const req = https.request(url, options, (res) => {
            let data = '';
            
            res.on('data', (chunk) => {
              data += chunk;
            });
            
            res.on('end', () => {
              if (res.statusCode === 200) {
                try {
                  const jsonData = JSON.parse(data);
                  resolve({
                    statusCode: res.statusCode,
                    data: jsonData
                  });
                } catch (error) {
                  reject({
                    statusCode: res.statusCode,
                    error: 'Failed to parse response',
                    data,
                    message: error.message
                  });
                }
              } else {
                reject({
                  statusCode: res.statusCode,
                  data: data,
                  message: `API responded with status code ${res.statusCode}`
                });
              }
            });
          });
          
          req.on('error', (error) => {
            reject({
              error: 'Request failed',
              message: error.message
            });
          });
          
          req.write(requestData);
          req.end();
        });
      };
      
      try {
        // Make the request
        const response = await makeRequest();
        
        // Extract the response text
        const responseText = response.data.candidates[0].content.parts[0].text;
        
        // Return success with diagnostic information
        return res.status(200).json({
          status: 'success',
          message: 'Gemini API is working properly',
          diagnosticInfo,
          testResponse: responseText
        });
      } catch (requestError) {
        // Return the specific request error
        return res.status(500).json({
          error: 'API request failed',
          diagnosticInfo,
          details: requestError
        });
      }
    } catch (geminiError) {
      // Return specific Gemini API error
      return res.status(500).json({
        error: 'Gemini API error',
        message: geminiError.message,
        stack: geminiError.stack
      });
    }
  } catch (error) {
    // Return general error
    return res.status(500).json({
      error: 'General error',
      message: error.message,
      stack: error.stack
    });
  }
}