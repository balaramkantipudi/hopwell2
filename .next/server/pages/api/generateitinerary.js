"use strict";(()=>{var e={};e.id=8712,e.ids=[8712],e.modules={145:e=>{e.exports=require("next/dist/compiled/next-server/pages-api.runtime.prod.js")},3023:e=>{e.exports=import("@google/generative-ai")},5111:(e,t,a)=>{a.a(e,async(e,r)=>{try{a.r(t),a.d(t,{config:()=>d,default:()=>c,routeModule:()=>u});var o=a(1802),n=a(7153),i=a(6249),s=a(3623),l=e([s]);s=(l.then?(await l)():l)[0];let c=(0,i.l)(s,"default"),d=(0,i.l)(s,"config"),u=new o.PagesAPIRouteModule({definition:{kind:n.x.PAGES_API,page:"/api/generateitinerary",pathname:"/api/generateitinerary",bundlePath:"",filename:""},userland:s});r()}catch(e){r(e)}})},3623:(e,t,a)=>{a.a(e,async(e,r)=>{try{a.r(t),a.d(t,{default:()=>handler});var o=a(3023),n=e([o]);async function handler(e,t){if(t.setHeader("Content-Type","application/json"),"POST"!==e.method)return t.status(405).json({error:"Method not allowed"});console.log("generateItinerary API called");try{let a=e.body;if(console.log("Request data received:",{destination:a.destination||"not provided",startDate:a.startDate||"not provided",endDate:a.endDate||"not provided",transportMode:a.transportMode||"not provided",theme:a.theme||"not provided"}),!a.destination)return t.status(400).json({error:"Missing destination",message:"A destination is required to generate an itinerary"});let r=function(e){let t;console.log("Generating local itinerary...");let a=e.destination,r=e.origin||"your origin",o=e.startDate?new Date(e.startDate):new Date,n=new Date(e.endDate?e.endDate:o.getTime()+2592e5),i=Math.max(1,Math.ceil((n-o)/864e5)),s=e.hotelStyle||"comfortable",l=e.transportMode||"your preferred transportation",c=e.theme||"sightseeing",d=e.cuisine||"local cuisine",u=e.groupType||"travelers",p=e.groupCount||2,g=e.budget||1e3,formatDate=e=>e.toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric",year:"numeric"});switch(s){case"ultraLuxury":t=500;break;case"luxury":t=300;break;case"comfortable":default:t=150;break;case"budget":t=80;break;case"experience":t=200}let m=`
TRIP TO ${a.toUpperCase()} - ${i} DAY ITINERARY
===============================================================

TRIP SUMMARY
-----------
A ${i}-day journey to ${a} from ${r}, focusing on ${c} experiences with ${s} accommodations. 
This trip is designed for ${p} ${u} traveling from ${formatDate(o)} to ${formatDate(n)}.

ACCOMMODATIONS
-------------
Based on your preference for "${s}" accommodations:
${"ultraLuxury"===s||"luxury"===s?`- Recommended: Luxury hotels in the city center or premium resorts
- Price range: $${t}-${t+200} per night
- Total accommodation cost: Approximately $${t*i} for the full stay`:"budget"===s?`- Recommended: Budget-friendly hotels, hostels or guesthouses
- Price range: $${t}-${t+50} per night
- Total accommodation cost: Approximately $${t*i} for the full stay`:`- Recommended: Mid-range hotels or comfortable guesthouses
- Price range: $${t}-${t+100} per night
- Total accommodation cost: Approximately $${t*i} for the full stay`}

DAILY ITINERARY
--------------

`;for(let e=1;e<=i;e++){let t;let r=new Date(o);r.setDate(o.getDate()+e-1),t=1===e?"ARRIVAL & ORIENTATION":e===i?"FINAL EXPLORATION & DEPARTURE":2===e?"MAIN ATTRACTIONS":`DAY ${e} EXPLORATION`,m+=`DAY ${e}: ${t} (${formatDate(r)})
${"-".repeat(t.length+8)}

Morning:
${1===e?`- Arrive in ${a} ${"air"===l?"by air":`via ${l}`}
- Transfer to your ${s} accommodation
- Check in and refresh after your journey`:e===i?`- Enjoy a final breakfast at your accommodation
- Pack and prepare for departure
- Check out (store luggage if needed)`:`- Breakfast at your accommodation
- Visit ${2===e?"the top attraction in "+a:"a popular local site"}
- Take a ${e%2==0?"guided tour":"self-guided walk"} of the area`}

Afternoon:
${1===e?`- Take an orientation walk around your neighborhood
- Visit a local caf\xe9 to experience the culture
- Get acquainted with the local transportation options`:e===i?`- Last-minute souvenir shopping
- Visit any missed attractions if time allows
- Prepare for departure`:`- Enjoy lunch featuring ${d}
- Explore ${e%2==0?"museums or cultural sites":"local markets or parks"}
- Take photos at scenic viewpoints`}

Evening:
${1===e?`- Welcome dinner at a restaurant serving ${d}
- Early night to recover from travel
- Plan your activities for the next day`:e===i?`- Final dinner in ${a}
- Transfer to ${"air"===l?"the airport":"your departure point"}
- Departure from ${a}`:`- Dinner at a ${e%2==0?"highly-rated":"local favorite"} restaurant
- ${e%2==0?"Attend a cultural performance or event":"Relaxing evening stroll"}
- Return to accommodation`}

`}let h=g>200?80:g>100?50:30,y=g>200?60:g>100?40:20,$=g>200?40:g>100?25:15,f=g>200?30:g>100?20:10,A=t*i,D=h*i,v=y*i,T=$*i,w=f*i,x=A+D+v+T+w;return m+=`
BUDGET ESTIMATION
----------------
- Accommodation: $${A} ($${t} per night \xd7 ${i} nights)
- Food & Dining: $${D} ($${h} per day \xd7 ${i} days)
- Activities & Attractions: $${v} ($${y} per day \xd7 ${i} days)
- Local Transportation: $${T} ($${$} per day \xd7 ${i} days)
- Miscellaneous & Shopping: $${w} ($${f} per day \xd7 ${i} days)

TOTAL ESTIMATED COST: $${x} for ${p} ${u}
${p>1?`PER PERSON COST: $${Math.round(x/p)}`:""}

TRAVEL TIPS FOR ${a.toUpperCase()}
${"-".repeat(13+a.length)}
- Best time to visit: Research seasonal weather before your trip
- Local transportation: Look for day passes to save money
- Language: Learn a few basic phrases in the local language
- Currency: Check exchange rates and have some local currency on hand
- Safety: Keep valuables secure and be aware of your surroundings
- Local customs: Research and respect local traditions and etiquette
- Weather: Pack appropriate clothing for the season

This itinerary is a framework that can be adjusted based on your specific interests and preferences.
Enjoy your trip to ${a}!
`}(a);try{console.log("Attempting to generate with Gemini API...");let e=process.env.GEMINI_API_KEY;if(!e)return console.log("No Gemini API key found, using local generation"),t.status(200).json({text:r,source:"local"});t.status(200).json({text:r,source:"local"}),generateWithGemini(a,e).catch(e=>{console.error("Background Gemini generation failed:",e.message)});return}catch(e){return console.error("Gemini API error:",e.message),console.log("Using local generation only"),t.status(200).json({text:r,source:"local"})}}catch(a){console.error("Server error:",a);try{let r=`
EMERGENCY FALLBACK ITINERARY
============================

We encountered an error generating your detailed itinerary, but here's a simple plan for your trip to ${e.body?.destination||"your destination"}:

Day 1: Arrival and Exploration
- Arrive and check into your hotel
- Explore the immediate area around your accommodation
- Have dinner at a nearby restaurant

Day 2: Main Attractions
- Visit the top attractions in the area
- Try local cuisine for lunch and dinner
- Take photos of notable landmarks

Day 3: Departure
- Final sightseeing in the morning
- Shopping for souvenirs
- Departure

Please try again later for a more detailed itinerary.
      `;return t.status(200).json({text:r,source:"emergency",error:a.message})}catch(e){return t.status(500).json({error:"Failed to generate itinerary",message:a.message})}}}async function generateWithGemini(e,t){console.log("Initializing Gemini...");let a=new o.GoogleGenerativeAI(t),r=null;for(let t of["gemini-pro","gemini-1.0-pro","gemini-1.5-pro","gemini-1.5-flash"])try{console.log(`Attempting to use model: ${t}`);let o=a.getGenerativeModel({model:t}),n=e.startDate?new Date(e.startDate).toLocaleDateString():"upcoming",i=e.endDate?new Date(e.endDate).toLocaleDateString():"end of trip",s="3";if(e.startDate&&e.endDate){let t=new Date(e.startDate),a=new Date(e.endDate);s=Math.max(1,Math.ceil((a-t)/864e5)).toString()}let l=`
Generate a detailed travel itinerary for a ${s}-day trip to ${e.destination} from ${e.origin||"the traveler's origin"}.

Trip details:
- Destination: ${e.destination}
- Origin: ${e.origin||"Not specified"}
- Dates: ${n} to ${i}
- Transportation: ${e.transportMode||"Not specified"}
- Accommodation style: ${e.hotelStyle||"Standard comfortable accommodation"}
- Cuisine interests: ${e.cuisine||"Local cuisine"}
- Trip theme: ${e.theme||"General sightseeing"}
- Group type: ${e.groupType||"Travelers"} (${e.groupCount||"2"} people)
- Budget level: ${e.budget?"$"+e.budget:"Moderate budget"}
- Priority focus: ${e.priority||"Balanced experience"}

Please create a comprehensive itinerary that includes:
1. A summary of the trip
2. Day-by-day breakdown with morning, afternoon, and evening activities
3. Recommended accommodations with approximate prices
4. Dining recommendations that match cuisine preferences
5. Transportation options within the destination
6. Estimated budget breakdown
7. Practical travel tips

Format the response with clear section headers using uppercase and divider lines (=== or ---).
Be specific with actual attraction names, realistic restaurants, and genuine hotel options in ${e.destination}.
      `;console.log("Sending request to Gemini API...");let c=await o.generateContent(l),d=await c.response;if(r=d.text(),console.log("Received response from Gemini API:",r.substring(0,100)+"..."),r&&r.length>100)break}catch(e){console.log(`Error with model ${t}:`,e.message)}if(!r)throw Error("All Gemini model attempts failed");return r}o=(n.then?(await n)():n)[0],r()}catch(e){r(e)}})}};var t=require("../../webpack-api-runtime.js");t.C(e);var __webpack_exec__=e=>t(t.s=e),a=t.X(0,[4222],()=>__webpack_exec__(5111));module.exports=a})();