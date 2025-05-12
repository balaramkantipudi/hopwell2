"use strict";(()=>{var e={};e.id=6491,e.ids=[6491],e.modules={145:e=>{e.exports=require("next/dist/compiled/next-server/pages-api.runtime.prod.js")},3023:e=>{e.exports=import("@google/generative-ai")},6056:(e,t,r)=>{r.a(e,async(e,a)=>{try{r.r(t),r.d(t,{config:()=>d,default:()=>l,routeModule:()=>u});var o=r(1802),i=r(7153),n=r(6249),s=r(564),c=e([s]);s=(c.then?(await c)():c)[0];let l=(0,n.l)(s,"default"),d=(0,n.l)(s,"config"),u=new o.PagesAPIRouteModule({definition:{kind:i.x.PAGES_API,page:"/api/direct-itinerary",pathname:"/api/direct-itinerary",bundlePath:"",filename:""},userland:s});a()}catch(e){a(e)}})},6548:(e,t,r)=>{r.d(t,{O:()=>o});let a=require("@supabase/supabase-js"),o=(0,a.createClient)("https://qlcenpzwdvvtcnblixyp.supabase.co","eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFsY2VucHp3ZHZ2dGNuYmxpeHlwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYzOTY4MTMsImV4cCI6MjA2MTk3MjgxM30.B332OjGROnVxsSKra9T_Uh6fQvVdhOH21z7731pc1Kk")},564:(e,t,r)=>{r.a(e,async(e,a)=>{try{r.r(t),r.d(t,{default:()=>handler});var o=r(6548),i=r(3023),n=e([i]);async function handler(e,t){if(t.setHeader("Content-Type","application/json"),"POST"!==e.method)return t.status(405).json({error:"Method not allowed"});try{let r;let{data:{session:a},error:n}=await o.O.auth.getSession();if(n)return console.error("Auth error:",n),t.status(401).json({error:"Authentication error",message:n.message});if(!a||!a.user)return console.log("No active session found"),t.status(401).json({error:"Not authenticated"});let s=a.user.id;console.log("Authenticated user:",s);let c=e.body;if(!c.destination)return t.status(400).json({error:"Missing destination",message:"Destination is required to generate an itinerary"});let{data:l,error:d}=await o.O.from("user_credits").select("*").eq("user_id",s).single();if(d){if("PGRST116"!==d.code)return console.error("Error fetching credits:",d),t.status(500).json({error:"Could not check credits",message:d.message});{console.log("Creating new credit record for user:",s);let{data:e,error:r}=await o.O.from("user_credits").insert([{user_id:s,credits_remaining:5,total_credits_used:0}]).select();if(r)return console.error("Failed to create credit record:",r),t.status(500).json({error:"Could not initialize credits",message:r.message});l=e[0],console.log("Created credits:",l)}}if(!l||l.credits_remaining<=0)return t.status(403).json({error:"No credits remaining",message:"You have used all your credits. Please purchase more to generate new itineraries."});console.log("User has credits remaining:",l.credits_remaining);let u=process.env.GEMINI_API_KEY,g="local";if(u)try{let e=new i.GoogleGenerativeAI(u),t=e.getGenerativeModel({model:"gemini-1.5-pro"}),a="3";if(c.startDate&&c.endDate){let e=new Date(c.startDate),t=new Date(c.endDate);a=Math.max(1,Math.ceil((t-e)/864e5)).toString()}let o=`Create a detailed ${a}-day travel itinerary to ${c.destination}.
        
TRIP DETAILS:
- Destination: ${c.destination}
- Origin: ${c.origin||"Not specified"}
- Start Date: ${c.startDate||"Not specified"} 
- End Date: ${c.endDate||"Not specified"}
- Transportation: ${c.transportMode||"Not specified"}
- Accommodation Preference: ${c.hotelStyle||"Standard"}
- Cuisine Interests: ${c.cuisine||"Not specified"}
- Trip Theme: ${c.theme||"General sightseeing"}
- Group Type: ${c.groupType||"Travelers"} (${c.groupCount||"2"} people)
- Budget: ${c.budget?"$"+c.budget:"Moderate"}

Format the itinerary with these sections:
1. TRIP SUMMARY
2. ACCOMMODATIONS (with price estimates)
3. DAILY ITINERARY (day-by-day with morning, afternoon, evening activities)
4. BUDGET ESTIMATION (breakdown of costs)
5. TRAVEL TIPS

Use clear headers with ALL CAPS and divider lines (===== or -----).
Be specific with real attraction names, restaurant recommendations, and hotel options.
`,n=await t.generateContent(o),s=await n.response;r=s.text(),g="gemini"}catch(e){console.error("Gemini API error:",e),r=generateLocalItinerary(c)}else r=generateLocalItinerary(c);console.log("Deducting credit from user:",s);let{error:m}=await o.O.from("user_credits").update({credits_remaining:l.credits_remaining-1,total_credits_used:(l.total_credits_used||0)+1}).eq("user_id",s);return m&&console.error("Error updating credits:",m),t.status(200).json({text:r,source:g,credits:{remaining:l.credits_remaining-1,used:!0}})}catch(e){return console.error("Server error:",e),t.status(500).json({error:"Failed to generate itinerary",message:e.message})}}function generateLocalItinerary(e){console.log("Using local generation for",e.destination);let t=e.destination,r=e.origin||"your origin",a=e.startDate?new Date(e.startDate):new Date,o=new Date(e.endDate?e.endDate:a.getTime()+2592e5),i=Math.max(1,Math.ceil((o-a)/864e5)),n=e.hotelStyle||"comfortable",s=e.theme||"sightseeing",c=e.cuisine||"local cuisine",l=e.groupType||"travelers",d=e.groupCount||2,formatDate=e=>e.toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric",year:"numeric"}),u=`
TRIP TO ${t.toUpperCase()} - ${i} DAY ITINERARY
================================================================

TRIP SUMMARY
-----------
A ${i}-day journey to ${t} from ${r}, focusing on ${s} experiences.
Travel dates: ${formatDate(a)} to ${formatDate(o)}
Group: ${d} ${l}

ACCOMMODATIONS
------------
`;switch(n){case"ultraLuxury":case"luxury":u+=`Recommended: Luxury hotels or high-end resorts
Price range: $300-500 per night
Total accommodation cost: Approximately $${400*i} for ${i} nights`;break;case"budget":u+=`Recommended: Budget-friendly hotels, hostels, or guesthouses
Price range: $60-120 per night
Total accommodation cost: Approximately $${90*i} for ${i} nights`;break;case"experience":u+=`Recommended: Unique accommodations like boutique hotels or themed stays
Price range: $150-300 per night
Total accommodation cost: Approximately $${225*i} for ${i} nights`;break;default:u+=`Recommended: Mid-range hotels or comfortable guesthouses
Price range: $120-200 per night
Total accommodation cost: Approximately $${160*i} for ${i} nights`}u+=`

DAILY ITINERARY
--------------
`;for(let e=1;e<=i;e++){let r=new Date(a);if(r.setDate(a.getDate()+e-1),1===e)u+=`
DAY 1: ARRIVAL (${formatDate(r)})
------------------------------
Morning:
- Arrive in ${t}
- Transfer to your accommodation
- Check in and freshen up

Afternoon:
- Orientation walk around your neighborhood
- Visit a local caf\xe9 for a light meal
- Get familiar with local transportation options

Evening:
- Welcome dinner featuring ${c}
- Early night to recover from travel
- Plan details for the next day
`;else if(e===i)u+=`
DAY ${e}: DEPARTURE (${formatDate(r)})
--------------------------------
Morning:
- Breakfast at your accommodation
- Pack and prepare for departure
- Check out (store luggage if needed)

Afternoon:
- Last-minute shopping for souvenirs
- Visit any remaining must-see attractions
- Grab lunch at a local favorite

Evening:
- Final dinner in ${t}
- Return to collect luggage if stored
- Departure from ${t}
`;else{let t=2===e?"MAIN ATTRACTIONS":3===e?"LOCAL EXPERIENCES":`EXPLORATION DAY ${e}`;u+=`
DAY ${e}: ${t} (${formatDate(r)})
----------------------------------
Morning:
- Breakfast at your accommodation
- Visit ${2===e?"the top attractions":"local sites"}
- ${e%2==0?"Take a guided tour":"Explore on your own"}

Afternoon:
- Lunch featuring ${c}
- ${e%2==0?"Museum or cultural site visit":"Shopping or park visit"}
- Leisure time or optional activities

Evening:
- Dinner at a ${e%2==0?"recommended restaurant":"local favorite"}
- ${e%2==0?"Cultural event or performance":"Evening stroll or relaxation"}
- Return to accommodation
`}}let g=("luxury"===n||"ultraLuxury"===n?400:"budget"===n?90:"experience"===n?225:160)*i,m=60*i,p=40*i,h=25*i,f=20*i,$=g+m+p+h+f;return u+=`
BUDGET ESTIMATION
---------------
- Accommodation: $${g} (${i} nights)
- Food & Dining: $${m} ($60 per day)
- Activities & Attractions: $${p} ($40 per day)
- Local Transportation: $${h} ($25 per day)
- Miscellaneous & Shopping: $${f} ($20 per day)

TOTAL ESTIMATED COST: $${$} for ${d} ${l}
${d>1?`PER PERSON COST: $${Math.round($/d)}`:""}

TRAVEL TIPS
---------
- Currency: Check exchange rates before your trip
- Weather: Research seasonal conditions for your travel dates
- Local customs: Learn about cultural norms and etiquette
- Transportation: Consider getting a travel pass for public transport
- Language: Learn a few basic phrases in the local language
- Safety: Keep valuables secure and be aware of your surroundings

Enjoy your trip to ${t}!
`}i=(n.then?(await n)():n)[0],a()}catch(e){a(e)}})}};var t=require("../../webpack-api-runtime.js");t.C(e);var __webpack_exec__=e=>t(t.s=e),r=t.X(0,[4222],()=>__webpack_exec__(6056));module.exports=r})();