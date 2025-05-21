"use strict";(()=>{var t={};t.id=3838,t.ids=[3838],t.modules={2885:t=>{t.exports=require("@supabase/supabase-js")},145:t=>{t.exports=require("next/dist/compiled/next-server/pages-api.runtime.prod.js")},3023:t=>{t.exports=import("@google/generative-ai")},7310:(t,e,r)=>{r.a(t,async(t,i)=>{try{r.r(e),r.d(e,{config:()=>p,default:()=>c,routeModule:()=>m});var a=r(1802),o=r(7153),n=r(6249),s=r(3729),d=t([s]);s=(d.then?(await d)():d)[0];let c=(0,n.l)(s,"default"),p=(0,n.l)(s,"config"),m=new a.PagesAPIRouteModule({definition:{kind:o.x.PAGES_API,page:"/api/Trips/generate-itinerary",pathname:"/api/Trips/generate-itinerary",bundlePath:"",filename:""},userland:s});i()}catch(t){i(t)}})},3729:(t,e,r)=>{r.a(t,async(t,i)=>{try{r.r(e),r.d(e,{default:()=>handler});var a=r(4768),o=r(3023),n=t([o]);async function handler(t,e){if("POST"!==t.method)return e.status(405).json({error:"Method not allowed"});try{var r;let{data:{session:i},error:n}=await a.O.auth.getSession();if(n||!i)return e.status(401).json({error:"Not authenticated"});let s=i.user.id,{tripId:d}=t.body;if(!d)return e.status(400).json({error:"Trip ID is required"});let{data:c,error:p}=await a.O.from("trips").select("*").eq("id",d).eq("user_id",s).single();if(p||!c)return e.status(404).json({error:"Trip not found"});let m=new o.GoogleGenerativeAI(process.env.GEMINI_API_KEY),u=m.getGenerativeModel({model:"gemini-pro"}),l={destination:c.destination,origin:c.origin,transportMode:c.transportMode,startDate:c.startDate,endDate:c.endDate,hotelStyle:c.hotelStyle,cuisine:c.cuisine,theme:c.theme,groupType:c.groupType,groupCount:c.groupCount,budget:c.budget,priority:c.priority},y=new Date(c.startDate),g=new Date(c.endDate),h=`
      Create a detailed travel itinerary with the following preferences:
      - Destination: ${l.destination}
      - Origin: ${l.origin}
      - Mode of Transport: ${l.transportMode}
      - Trip Duration: ${Math.ceil((g-y)/864e5)} days (from ${y.toLocaleDateString()} to ${g.toLocaleDateString()})
      - Accommodation Style: ${l.hotelStyle}
      - Cuisine Preferences: ${l.cuisine}
      - Trip Theme: ${l.theme}
      - Group Type: ${l.groupType} (${l.groupCount} people)
      - Budget per Person: $${l.budget}
      - Priority: ${l.priority}

      Please provide:
      1. A day-by-day itinerary with specific activities, times, and locations
      2. Recommended accommodations with prices
      3. Transportation options between locations with estimated costs
      4. Restaurant recommendations for each day
      5. Estimated total cost breakdown

      Format your response as a structured JSON object with the following format:
      {
        "itinerary": [
          {
            "date": "YYYY-MM-DD",
            "activities": [
              {
                "time": "HH:MM",
                "title": "Activity name",
                "description": "Brief description",
                "location": {
                  "name": "Location name",
                  "address": "Address"
                },
                "duration": minutes,
                "type": "activity type",
                "cost": cost in USD
              }
            ]
          }
        ],
        "accommodations": [
          {
            "name": "Accommodation name",
            "location": {
              "name": "Location name",
              "address": "Address"
            },
            "checkIn": "YYYY-MM-DD",
            "checkOut": "YYYY-MM-DD",
            "pricePerNight": price in USD,
            "totalPrice": total price in USD,
            "roomType": "Room type",
            "amenities": ["amenity1", "amenity2"],
            "rating": rating out of 5
          }
        ],
        "transportation": [
          {
            "type": "transportation type",
            "from": {
              "name": "Origin name"
            },
            "to": {
              "name": "Destination name"
            },
            "departureTime": "YYYY-MM-DDTHH:MM:SS",
            "arrivalTime": "YYYY-MM-DDTHH:MM:SS",
            "provider": "Provider name",
            "price": price in USD
          }
        ],
        "totalCost": total cost in USD
      }
    `,w=await u.generateContent(h),D=await w.response;D.text(),(r=itineraryData).accommodations&&r.accommodations.length>0&&(r.accommodations=r.accommodations.map(t=>{let e=`https://www.booking.com/hotel/search.html?city=${encodeURIComponent(r.destination)}&aid=YOUR_BOOKING_AFFILIATE_ID`,i=`https://www.expedia.com/Hotel-Search?destination=${encodeURIComponent(r.destination)}&AFFCID=YOUR_EXPEDIA_AFFILIATE_ID`;return{...t,bookingLinks:{booking:e,expedia:i}}})),r.transportation&&r.transportation.length>0&&(r.transportation=r.transportation.map(t=>{if("flight"===t.type){let e=`https://www.skyscanner.com/transport/flights/${t.from.code}/${t.to.code}/?partner=YOUR_SKYSCANNER_AFFILIATE_ID`,r=`https://www.kiwi.com/deep?from=${t.from.code}&to=${t.to.code}&affilid=YOUR_KIWI_AFFILIATE_ID`;return{...t,bookingLinks:{skyscanner:e,kiwi:r}}}return t})),r.itinerary&&r.itinerary.length>0&&(r.itinerary=r.itinerary.map(t=>(t.activities&&t.activities.length>0&&(t.activities=t.activities.map(t=>{let e=`https://www.getyourguide.com/${r.destination}-l${t.location.cityCode}/s/?partner_id=YOUR_GETYOURGUIDE_AFFILIATE_ID`,i=`https://www.viator.com/tours/${r.destination}/search?pid=YOUR_VIATOR_AFFILIATE_ID`;return{...t,bookingLinks:{getYourGuide:e,viator:i}}})),t)));let{data:f,error:I}=await a.O.from("trips").update({itinerary:itineraryData.itinerary,accommodations:itineraryData.accommodations,transportation:itineraryData.transportation,total_cost:itineraryData.totalCost,status:"generated",updated_at:new Date().toISOString()}).eq("id",d).select();if(I)return e.status(500).json({error:"Failed to update trip"});return e.status(200).json({success:!0,message:"Itinerary generated successfully",trip:f[0]})}catch(t){return console.error("Generate itinerary error:",t),e.status(500).json({error:"Server error"})}}o=(n.then?(await n)():n)[0],i()}catch(t){i(t)}})}};var e=require("../../../webpack-api-runtime.js");e.C(t);var __webpack_exec__=t=>e(e.s=t),r=e.X(0,[4222,4768],()=>__webpack_exec__(7310));module.exports=r})();