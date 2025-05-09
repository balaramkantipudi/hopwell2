



// // pages/api/recommend-place.js
// import https from 'https';

// // Fallback destinations if API fails
// const fallbackDestinations = [
//   {
//     location: 'Reykjavik, Iceland',
//     caption: 'Land of fire and ice with stunning natural landscapes.',
//     fullText: 'Reykjavik, the capital of Iceland, is a gateway to breathtaking natural wonders including glaciers, hot springs, and the Northern Lights. The city itself combines colorful architecture with a vibrant cultural scene and is known for its geothermal swimming pools. It\'s one of the cleanest, greenest, and safest cities in the world.'
//   },
//   {
//     location: 'Kyoto, Japan',
//     caption: 'Ancient temples and beautiful gardens in Japan\'s cultural capital.',
//     fullText: 'Kyoto served as Japan\'s capital for over a thousand years and is home to more than 1,600 Buddhist temples and 400 Shinto shrines. The city is known for its classical Buddhist temples, gardens, imperial palaces, and traditional wooden houses. Kyoto is especially beautiful during cherry blossom season in spring and the fall foliage season.'
//   },
//   {
//     location: 'Marrakech, Morocco',
//     caption: 'Bustling ancient city with vibrant markets and stunning architecture.',
//     fullText: 'Marrakech is a major city in Morocco known for its vibrant medina, a walled medieval city dating back to the Berber Empire. The medina is a UNESCO World Heritage site filled with mazelike alleys where thriving souks (marketplaces) sell traditional textiles, pottery, and jewelry. The city is also famous for its palaces, gardens, and the minaret of Koutoubia Mosque, a symbol of Marrakech.'
//   },
//   {
//     location: 'Santorini, Greece',
//     caption: 'Stunning island with white-washed buildings and breathtaking Mediterranean views.',
//     fullText: 'Santorini is a volcanic island in the Cyclades group of the Greek islands. It is famous for its dramatic views, stunning sunsets, white-washed houses with blue domes, and the submerged caldera. The islands beauty, along with its wineries and unique beaches with red, black, or white volcanic sand, makes it one of Greece\'s most popular tourist destinations.'
//   },
//   {
//     location: 'Bora Bora, French Polynesia',
//     caption: 'Turquoise lagoons, overwater bungalows, and a dormant volcano at its center.',
//     fullText: 'Bora Bora is a small island northwest of Tahiti in French Polynesia. Surrounded by sand-fringed motus (islets) and a turquoise lagoon protected by a coral reef, its a major international luxury tourist destination. The island is dominated by Mount Otemanu, a dormant volcano rising to 727 meters. Bora Bora is famous for its overwater bungalows, pristine beaches, and extraordinary marine life.'
//   }
// ];

// async function callGeminiAPI(prompt, apiKey) {
//   // Create a simple prompt
//   const requestData = JSON.stringify({
//     contents: [
//       {
//         parts: [
//           {
//             text: `You are a world-class travel expert. Based on this request: "${prompt}", recommend ONE specific travel destination.
                  
//                   Provide your response in this exact JSON format:
//                   {
//                     "location": "City, Country",
//                     "caption": "A brief 1-2 sentence description",
//                     "fullText": "A 3-5 sentence detailed description with interesting facts"
//                   }`
//           }
//         ]
//       }
//     ],
//     generationConfig: {
//       temperature: 0.7,
//       maxOutputTokens: 1024
//     }
//   });

//   // API endpoint - using v1 and gemini-1.5-pro as defaults
//   const apiVersion = process.env.GEMINI_API_VERSION || 'v1';
//   const modelName = process.env.GEMINI_MODEL || 'gemini-1.5-pro';
//   const url = `https://generativelanguage.googleapis.com/${apiVersion}/models/${modelName}:generateContent?key=${apiKey}`;

//   return new Promise((resolve, reject) => {
//     const options = {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json'
//       }
//     };

//     // Make the request
//     const req = https.request(url, options, (res) => {
//       let data = '';

//       // Collect data
//       res.on('data', (chunk) => {
//         data += chunk;
//       });

//       // Process complete response
//       res.on('end', () => {
//         if (res.statusCode === 200) {
//           try {
//             const response = JSON.parse(data);
            
//             // Extract the text from the response
//             const generatedText = response.candidates[0].content.parts[0].text;
            
//             // Try to extract JSON from the text
//             let jsonMatch = generatedText.match(/\{[\s\S]*\}/);
//             if (jsonMatch) {
//               try {
//                 // Parse the JSON
//                 const destination = JSON.parse(jsonMatch[0]);
                
//                 // Add source info
//                 destination.source = 'gemini-api';
                
//                 resolve(destination);
//               } catch (parseError) {
//                 reject({
//                   error: 'JSON parsing error',
//                   message: parseError.message
//                 });
//               }
//             } else {
//               reject({
//                 error: 'No JSON found in response',
//                 response: generatedText
//               });
//             }
//           } catch (error) {
//             reject({
//               error: 'Response parsing error',
//               message: error.message
//             });
//           }
//         } else {
//           reject({
//             error: `API request failed with status ${res.statusCode}`,
//             status: res.statusCode,
//             data: data
//           });
//         }
//       });
//     });

//     // Handle request errors
//     req.on('error', (error) => {
//       reject({
//         error: 'Request error',
//         message: error.message
//       });
//     });

//     // Send the request
//     req.write(requestData);
//     req.end();
//   });
// }

// export default async function handler(req, res) {
//   console.log('Recommendation request received:', req.body);
  
//   if (req.method !== 'POST') {
//     return res.status(405).json({ error: 'Method not allowed' });
//   }

//   const { prompt, useFallback } = req.body;

//   // If no prompt, return error
//   if (!prompt) {
//     return res.status(400).json({ error: 'Prompt is required' });
//   }
  
//   // If explicitly asked to use fallback, return a fallback destination
//   if (useFallback === true) {
//     const fallbackDestination = fallbackDestinations[Math.floor(Math.random() * fallbackDestinations.length)];
//     fallbackDestination.source = 'fallback';
//     return res.status(200).json(fallbackDestination);
//   }

//   // Check for API key
//   const apiKey = process.env.GEMINI_API_KEY;
//   if (!apiKey) {
//     console.log('No API key found. Using fallback destination.');
//     const fallbackDestination = fallbackDestinations[Math.floor(Math.random() * fallbackDestinations.length)];
//     fallbackDestination.source = 'fallback';
//     fallbackDestination.reason = 'No API key configured';
//     return res.status(200).json(fallbackDestination);
//   }

//   // Try to get a destination from the API
//   try {
//     console.log('Calling Gemini API...');
//     const destination = await callGeminiAPI(prompt, apiKey);
    
//     console.log('API call successful. Destination:', destination);
//     return res.status(200).json(destination);
    
//   } catch (error) {
//     // Log the error
//     console.error('API error:', error);
    
//     // Return a fallback destination with error info
//     const fallbackDestination = fallbackDestinations[Math.floor(Math.random() * fallbackDestinations.length)];
//     fallbackDestination.source = 'fallback';
//     fallbackDestination.reason = error.error || 'API call failed';
//     fallbackDestination.details = error.message || '';
    
//     return res.status(200).json(fallbackDestination);
//   }
// }


// pages/api/recommend-place.js
import https from 'https';

// Fallback destinations if API fails
const fallbackDestinations = {
  'cold': [
    {
      location: 'Reykjavik, Iceland',
      caption: 'Land of fire and ice with stunning natural landscapes.',
      fullText: 'Reykjavik, the capital of Iceland, is a gateway to breathtaking natural wonders including glaciers, hot springs, and the Northern Lights. The city itself combines colorful architecture with a vibrant cultural scene and is known for its geothermal swimming pools. It\'s one of the cleanest, greenest, and safest cities in the world.'
    },
    {
      location: 'Tromsø, Norway',
      caption: 'Arctic gateway with Northern Lights and midnight sun experiences.',
      fullText: 'Tromsø lies 350km north of the Arctic Circle and offers incredible natural phenomena like the Northern Lights in winter and the Midnight Sun in summer. Despite its remote location, Tromsø has a lively cultural scene, historic wooden architecture, and serves as a base for Arctic adventures including dog sledding and whale watching.'
    },
    {
      location: 'Yellowknife, Canada',
      caption: 'The aurora viewing capital of North America with winter temperatures dropping to -40°C.',
      fullText: 'Yellowknife, the capital of Canada\'s Northwest Territories, is one of the best places on Earth to view the Northern Lights due to its location under the auroral oval. In winter, temperatures can plummet to -40°C, creating a true arctic experience with activities like ice fishing, snowmobiling, and dog sledding. The city sits on the shores of Great Slave Lake, the deepest lake in North America, which freezes solid enough in winter to drive vehicles across it.'
    }
  ],
  'ancient': [
    {
      location: 'Petra, Jordan',
      caption: 'Ancient rock-carved city and one of the New Seven Wonders of the World.',
      fullText: 'Petra is a historical and archaeological city in Jordan famous for its rock-cut architecture and water conduit system. Established around 312 BCE as the capital city of the Nabataeans, it is a symbol of Jordan and its most-visited tourist attraction. The "Lost City" was carved into vibrant red, white, and pink sandstone cliff faces, creating tombs and temples with intricate facades.'
    },
    {
      location: 'Machu Picchu, Peru',
      caption: 'Mystical Incan citadel perched high in the Andes Mountains.',
      fullText: 'Machu Picchu is a 15th-century Inca citadel situated on a mountain ridge 2,430 meters above sea level in Peru. Built in the classical Inca style with polished dry-stone walls, it was probably the most amazing urban creation of the Inca Empire at its height. Its three primary structures are the Inti Watana, the Temple of the Sun, and the Room of the Three Windows. The site was largely forgotten by the outside world until it was brought to international attention in 1911 by American explorer Hiram Bingham.'
    },
    {
      location: 'Angkor Wat, Cambodia',
      caption: 'Massive temple complex built in the 12th century, the largest religious monument in the world.',
      fullText: 'Angkor Wat is a temple complex in Cambodia and is the largest religious monument in the world, spanning over 400 acres. Originally constructed as a Hindu temple for the Khmer Empire, it gradually transformed into a Buddhist temple by the end of the 12th century. The temple is admired for its grandeur and harmony of architecture, extensive bas-reliefs, and numerous devatas (guardian spirits) adorning its walls. It is Cambodia\'s best-preserved temple and a symbol of the country, appearing on its national flag.'
    }
  ],
  'metropolitan': [
    {
      location: 'Tokyo, Japan',
      caption: 'Ultramodern metropolis blending traditional culture with cutting-edge technology.',
      fullText: 'Tokyo, Japan\'s busy capital, mixes the ultramodern and the traditional, from neon-lit skyscrapers to historic temples. The city is known for its vibrant food scene and its trendsetting culture. Despite being one of the most populous cities in the world, Tokyo is remarkably clean, efficient, and safe with an incredible public transportation system.'
    },
    {
      location: 'Singapore',
      caption: 'Ultramodern city-state with spectacular architecture and cultural diversity.',
      fullText: 'Singapore is a global financial center with a tropical climate and multicultural population. Its colonial core centers on the Padang, a cricket field since the 1830s and now flanked by grand buildings including City Hall. In contrast, Singapore\'s futuristic buildings like Marina Bay Sands and Gardens by the Bay with its iconic Supertrees showcase the city\'s innovative spirit and commitment to being a "City in a Garden."'
    },
    {
      location: 'Medellin, Colombia',
      caption: 'Transformed from one of the world\'s most dangerous cities to an innovative urban center with a year-round spring climate.',
      fullText: 'Medellin has undergone a remarkable transformation from being one of the most dangerous cities in the world in the 1990s to an award-winning example of urban innovation. Known as the "City of Eternal Spring" for its pleasant climate, Medellin features a pioneering public transportation system including cable cars that connect once-isolated hillside neighborhoods to the city center. The city boasts beautiful public spaces, botanic gardens, and a thriving arts scene, exemplified by the works of its famous son, Fernando Botero, whose sculptures are displayed throughout the city.'
    }
  ],
  'green': [
    {
      location: 'Monteverde Cloud Forest, Costa Rica',
      caption: 'Misty cloud forest with incredible biodiversity and sustainability initiatives.',
      fullText: 'The Monteverde Cloud Forest Reserve in Costa Rica is a mystical landscape where clouds hover directly among the trees and vegetation. This unique ecosystem supports an incredible biodiversity with over 100 mammal species, 400 bird species, and 2,500 plant species, including 420 different orchids. The reserve is a pioneer in ecotourism and conservation, with numerous sustainability initiatives protecting this delicate environment while educating visitors. Suspended bridges allow you to walk through the canopy of the forest for a truly immersive experience in one of the world\'s most magical green spaces.'
    },
    {
      location: 'Daintree Rainforest, Australia',
      caption: 'World\'s oldest tropical rainforest with unique wildlife found nowhere else on Earth.',
      fullText: 'The Daintree Rainforest in Queensland, Australia, is the oldest continuously surviving tropical rainforest in the world, estimated to be around 180 million years old. This ancient ecosystem is home to an extraordinary array of plants and animals, including 30% of Australia\'s frog species, 65% of its butterfly species, and 20% of its bird species. Many of these species are found nowhere else on Earth. The rainforest meets the Great Barrier Reef at Cape Tribulation, creating a unique junction of two UNESCO World Heritage Sites. The local indigenous Kuku Yalanji people have lived in harmony with this environment for thousands of years and offer cultural tours sharing their deep connection to the land.'
    },
    {
      location: 'Yakushima, Japan',
      caption: 'Ancient cedar forest with moss-covered trees that inspired Studio Ghibli\'s "Princess Mononoke".',
      fullText: 'Yakushima is a small island off the southern coast of Japan known for its remarkable ancient cedar forests, some trees being over 1,000 years old. The island\'s lush, moss-covered landscape inspired the magical forest in Studio Ghibli\'s animated film "Princess Mononoke." UNESCO designated Yakushima as Japan\'s first World Heritage Site due to its unique ecosystem and biodiversity. The island receives abundant rainfall, creating a mystical atmosphere with streams and waterfalls cascading through the verdant terrain. Hiking trails allow visitors to explore this ethereal landscape and encounter the island\'s famous Yakushima macaques and deer that roam freely through the ancient forest.'
    }
  ],
  'remote': [
    {
      location: 'Ittoqqortoormiit, Greenland',
      caption: 'One of the most remote towns on Earth, accessible only by helicopter and boat during certain seasons.',
      fullText: 'Ittoqqortoormiit (also spelled Illoqqortoormiut) is one of the most isolated settlements in Greenland, located on the east coast at the entrance to the world\'s largest fjord system. Home to around 350 people, this colorful Arctic community is surrounded by the world\'s largest national park and can only be reached by helicopter or boat when ice conditions permit. The settlement experiences extreme seasonal variations, with months of 24-hour darkness in winter and midnight sun in summer. Residents primarily engage in hunting and fishing using traditional methods, and visitors can experience authentic Inuit culture while witnessing amazing Arctic wildlife including polar bears, musk oxen, and narwhals.'
    },
    {
      location: 'Tristan da Cunha',
      caption: 'The most remote inhabited archipelago in the world, located in the South Atlantic Ocean.',
      fullText: 'Tristan da Cunha holds the title of the most remote inhabited archipelago in the world, sitting 1,500 miles from the nearest continent and 1,200 miles from the nearest inhabited land (St. Helena). This British Overseas Territory in the South Atlantic Ocean is home to fewer than 300 residents, all living in the settlement of Edinburgh of the Seven Seas. The island is actually an active volcano, with the last major eruption in 1961 forcing the temporary evacuation of the entire population to England. Reaching Tristan requires a six-day boat journey from Cape Town, South Africa, and the island has no airstrip, making visits rare and typically limited to scientific expeditions or specialized cruises.'
    },
    {
      location: 'Supai, Arizona, USA',
      caption: 'The only place in the US where mail is still delivered by mule, located at the bottom of the Grand Canyon.',
      fullText: 'The village of Supai is the capital of the Havasupai Tribe and is located at the bottom of the Grand Canyon, making it the most remote community in the contiguous United States. With no roads leading to the village, it\'s accessible only by an 8-mile hike, horseback, or helicopter. Supai is famous for being the only place in the United States where mail is still delivered by mule train. Despite its isolation, the area attracts visitors who make the journey to see the spectacular turquoise-blue Havasu Falls and other waterfalls near the village. The Havasupai people ("people of the blue-green water") have lived in the area for over 800 years and maintain their traditional way of life while also managing tourism to their sacred lands.'
    }
  ],
  'surreal': [
    {
      location: 'Salar de Uyuni, Bolivia',
      caption: 'World\'s largest salt flat creating stunning mirror effects when covered with water.',
      fullText: 'Salar de Uyuni in Bolivia is the worlds largest salt flat, spanning over 10,000 square kilometers at a high elevation in the Andes. When covered with a thin layer of water, it creates a perfect reflective surface that mirrors the sky, creating an otherworldly landscape where its impossible to tell where earth ends and sky begins. The area also features colorful mineral-laden lakes, steaming geysers, and unique wildlife including flamingos.'
    },
    {
      location: 'Socotra Island, Yemen',
      caption: 'Alien-like landscape with bizarre dragon blood trees and bottle trees found nowhere else on Earth.',
      fullText: 'Socotra Island, part of Yemen but geographically isolated in the Arabian Sea, hosts one of the world\'s most alien-looking landscapes. About one-third of its plant life exists nowhere else on the planet, evolved through millions of years of isolation. The iconic Dragon Blood Tree with its distinctive umbrella shape dominates the landscape, alongside the equally bizarre Bottle Tree with its bulbous trunk and sparse branches. These otherworldly plants give the island an extraterrestrial appearance, often earning it nicknames like "the most alien place on Earth." Despite civil conflict on the mainland, Socotra remains a UNESCO World Heritage site, preserving its unique biodiversity and surreal scenery for adventurous travelers.'
    },
    {
      location: 'Pamukkale, Turkey',
      caption: 'Cascading white travertine pools filled with mineral-rich thermal waters resembling a cotton castle.',
      fullText: 'Pamukkale, meaning "cotton castle" in Turkish, features terraced pools of brilliant white travertine filled with mineral-rich thermal waters. These natural formations were created over thousands of years as calcium-laden springs cascaded down the hillside, creating a surreal landscape that appears like frozen waterfalls or snow despite the warm temperature. Adjacent to the terraces is Hierapolis, an ancient Greco-Roman city with well-preserved ruins including a massive theater. Visitors can walk barefoot through the shallow, warm pools while taking in panoramic views of the surrounding landscape, creating an experience that feels both otherworldly and therapeutic at the same time.'
    }
  ]
};

async function callGeminiAPI(prompt, apiKey) {
  console.log(`Attempting API call with prompt: "${prompt}"`);
  
  // Create a comprehensive prompt with instructions to return JSON
  const requestData = JSON.stringify({
    contents: [
      {
        parts: [
          {
            text: `You are a world-class travel expert with extensive knowledge of destinations worldwide.
                  Based on this request: "${prompt}", recommend ONE specific travel destination that would
                  be interesting and perhaps surprising - not just the typical tourist destination.
                  
                  Provide your response in this exact JSON format:
                  {
                    "location": "City, Country",
                    "caption": "A brief 1-2 sentence description that captures what makes this place special",
                    "fullText": "A 3-5 sentence detailed description with interesting facts that would make someone want to visit"
                  }
                  
                  The response must be a valid JSON object. Do not include any text outside the JSON.`
          }
        ]
      }
    ],
    generationConfig: {
      temperature: 1.2, // Higher temperature for more variety
      maxOutputTokens: 1024
    }
  });

  // Build the API URL
  const apiVersion = process.env.GEMINI_API_VERSION || 'v1';
  const modelName = process.env.GEMINI_MODEL || 'gemini-1.5-pro';
  const url = `https://generativelanguage.googleapis.com/${apiVersion}/models/${modelName}:generateContent?key=${apiKey}`;
  
  console.log(`Using model: ${modelName}`);

  return new Promise((resolve, reject) => {
    // Make the request
    const req = https.request(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    }, (res) => {
      let data = '';

      // Collect data
      res.on('data', (chunk) => {
        data += chunk;
      });

      // Process response
      res.on('end', () => {
        if (res.statusCode === 200) {
          try {
            const response = JSON.parse(data);
            
            // Check for content filtering
            if (response.promptFeedback?.blockReason) {
              reject({
                error: 'Content filtered',
                message: `Content blocked: ${response.promptFeedback.blockReason}`
              });
              return;
            }
            
            // Check for valid response structure
            if (!response.candidates || response.candidates.length === 0) {
              reject({
                error: 'Empty response',
                message: 'API returned no candidates',
                response
              });
              return;
            }
            
            // Extract the text from the response
            const generatedText = response.candidates[0].content.parts[0].text;
            
            // Try to extract JSON from the text
            let jsonMatch = generatedText.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
              try {
                // Parse the JSON
                const destination = JSON.parse(jsonMatch[0]);
                
                // Validate required fields
                if (!destination.location || !destination.caption || !destination.fullText) {
                  reject({
                    error: 'Invalid response format',
                    message: 'Missing required fields in the response',
                    destination
                  });
                  return;
                }
                
                // Add source info
                destination.source = 'gemini-api';
                console.log('Successfully generated destination:', destination);
                resolve(destination);
              } catch (parseError) {
                reject({
                  error: 'JSON parsing error',
                  message: parseError.message,
                  text: jsonMatch[0]
                });
              }
            } else {
              reject({
                error: 'No JSON found in response',
                message: 'Could not find a valid JSON object in the response',
                text: generatedText
              });
            }
          } catch (error) {
            reject({
              error: 'Response parsing error',
              message: error.message,
              data
            });
          }
        } else {
          // Handle non-200 status codes
          let errorMessage = `API request failed with status ${res.statusCode}`;
          try {
            const errorData = JSON.parse(data);
            errorMessage = errorData.error?.message || errorMessage;
          } catch (e) {
            // If we can't parse the error as JSON, use the raw data
            errorMessage = data || errorMessage;
          }
          
          reject({
            error: 'API error',
            status: res.statusCode,
            message: errorMessage
          });
        }
      });
    });

    // Handle request errors
    req.on('error', (error) => {
      reject({
        error: 'Request error',
        message: error.message
      });
    });

    // Send the request
    req.write(requestData);
    req.end();
  });
}

// Get a category based on the prompt
function getCategoryFromPrompt(prompt) {
  const promptLower = prompt.toLowerCase();
  
  if (promptLower.includes('cold')) {
    return 'cold';
  } else if (promptLower.includes('ancient') || promptLower.includes('history')) {
    return 'ancient';
  } else if (promptLower.includes('city') || promptLower.includes('metropolitan')) {
    return 'metropolitan';
  } else if (promptLower.includes('green') || promptLower.includes('nature')) {
    return 'green';
  } else if (promptLower.includes('remote')) {
    return 'remote';
  } else if (promptLower.includes('surreal') || promptLower.includes('unique')) {
    return 'surreal';
  }
  
  // Default to surreal if no match
  return 'surreal';
}

// Get a random fallback destination that's different from the last one
const lastDestinations = {};

function getRandomFallbackDestination(category, attempt = 0) {
  if (attempt > 5) {
    // After 5 attempts, just return any destination to avoid infinite loops
    return fallbackDestinations[category][0];
  }
  
  const destinations = fallbackDestinations[category];
  const lastLocation = lastDestinations[category];
  
  // Get a random destination
  const randomIndex = Math.floor(Math.random() * destinations.length);
  const destination = destinations[randomIndex];
  
  // If this is the same as the last one and we have more than one option, try again
  if (destination.location === lastLocation && destinations.length > 1) {
    return getRandomFallbackDestination(category, attempt + 1);
  }
  
  // Store this as the last destination for this category
  lastDestinations[category] = destination.location;
  
  return destination;
}

export default async function handler(req, res) {
  console.log('Recommendation request received:', req.body);
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { prompt, useFallback } = req.body;

  // If no prompt, return error
  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }
  
  // Get the category for this prompt
  const category = getCategoryFromPrompt(prompt);
  console.log(`Identified category: ${category}`);
  
  // If explicitly asked to use fallback, return a fallback destination
  if (useFallback === true) {
    const fallbackDestination = getRandomFallbackDestination(category);
    fallbackDestination.source = 'fallback';
    console.log('Using fallback destination (requested):', fallbackDestination.location);
    return res.status(200).json(fallbackDestination);
  }

  // Check for API key
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.log('No API key found. Using fallback destination.');
    const fallbackDestination = getRandomFallbackDestination(category);
    fallbackDestination.source = 'fallback';
    fallbackDestination.reason = 'No API key configured';
    return res.status(200).json(fallbackDestination);
  }

  // Try to get a destination from the API
  try {
    console.log('Calling Gemini API...');
    const destination = await callGeminiAPI(prompt, apiKey);
    
    console.log('API call successful:', destination.location);
    return res.status(200).json(destination);
    
  } catch (error) {
    // Log the error
    console.error('API error:', error);
    
    // Return a fallback destination with error info
    const fallbackDestination = getRandomFallbackDestination(category);
    fallbackDestination.source = 'fallback';
    fallbackDestination.reason = error.error || 'API call failed';
    fallbackDestination.details = error.message || '';
    
    console.log('Using fallback destination due to error:', fallbackDestination.location);
    return res.status(200).json(fallbackDestination);
  }
}