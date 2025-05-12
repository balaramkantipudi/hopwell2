"use strict";(()=>{var t={};t.id=3838,t.ids=[3838],t.modules={145:t=>{t.exports=require("next/dist/compiled/next-server/pages-api.runtime.prod.js")},3023:t=>{t.exports=import("@google/generative-ai")},7310:(t,e,i)=>{i.a(t,async(t,r)=>{try{i.r(e),i.d(e,{config:()=>p,default:()=>d,routeModule:()=>m});var a=i(1802),o=i(7153),n=i(6249),s=i(3729),c=t([s]);s=(c.then?(await c)():c)[0];let d=(0,n.l)(s,"default"),p=(0,n.l)(s,"config"),m=new a.PagesAPIRouteModule({definition:{kind:o.x.PAGES_API,page:"/api/Trips/generate-itinerary",pathname:"/api/Trips/generate-itinerary",bundlePath:"",filename:""},userland:s});r()}catch(t){r(t)}})},6548:(t,e,i)=>{i.d(e,{O:()=>a});let r=require("@supabase/supabase-js"),a=(0,r.createClient)("https://qlcenpzwdvvtcnblixyp.supabase.co","eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFsY2VucHp3ZHZ2dGNuYmxpeHlwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYzOTY4MTMsImV4cCI6MjA2MTk3MjgxM30.B332OjGROnVxsSKra9T_Uh6fQvVdhOH21z7731pc1Kk")},3729:(t,e,i)=>{i.a(t,async(t,r)=>{try{i.r(e),i.d(e,{default:()=>handler});var a=i(6548),o=i(3023),n=t([o]);async function handler(t,e){if("POST"!==t.method)return e.status(405).json({error:"Method not allowed"});try{var i;let{data:{session:r},error:n}=await a.O.auth.getSession();if(n||!r)return e.status(401).json({error:"Not authenticated"});let s=r.user.id,{tripId:c}=t.body;if(!c)return e.status(400).json({error:"Trip ID is required"});let{data:d,error:p}=await a.O.from("trips").select("*").eq("id",c).eq("user_id",s).single();if(p||!d)return e.status(404).json({error:"Trip not found"});let m=new o.GoogleGenerativeAI(process.env.GEMINI_API_KEY),u=m.getGenerativeModel({model:"gemini-pro"}),l={destination:d.destination,origin:d.origin,transportMode:d.transportMode,startDate:d.startDate,endDate:d.endDate,hotelStyle:d.hotelStyle,cuisine:d.cuisine,theme:d.theme,groupType:d.groupType,groupCount:d.groupCount,budget:d.budget,priority:d.priority},y=new Date(d.startDate),g=new Date(d.endDate),h=`
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
    `,I=await u.generateContent(h),w=await I.response;w.text(),(i=itineraryData).accommodations&&i.accommodations.length>0&&(i.accommodations=i.accommodations.map(t=>{let e=`https://www.booking.com/hotel/search.html?city=${encodeURIComponent(i.destination)}&aid=YOUR_BOOKING_AFFILIATE_ID`,r=`https://www.expedia.com/Hotel-Search?destination=${encodeURIComponent(i.destination)}&AFFCID=YOUR_EXPEDIA_AFFILIATE_ID`;return{...t,bookingLinks:{booking:e,expedia:r}}})),i.transportation&&i.transportation.length>0&&(i.transportation=i.transportation.map(t=>{if("flight"===t.type){let e=`https://www.skyscanner.com/transport/flights/${t.from.code}/${t.to.code}/?partner=YOUR_SKYSCANNER_AFFILIATE_ID`,i=`https://www.kiwi.com/deep?from=${t.from.code}&to=${t.to.code}&affilid=YOUR_KIWI_AFFILIATE_ID`;return{...t,bookingLinks:{skyscanner:e,kiwi:i}}}return t})),i.itinerary&&i.itinerary.length>0&&(i.itinerary=i.itinerary.map(t=>(t.activities&&t.activities.length>0&&(t.activities=t.activities.map(t=>{let e=`https://www.getyourguide.com/${i.destination}-l${t.location.cityCode}/s/?partner_id=YOUR_GETYOURGUIDE_AFFILIATE_ID`,r=`https://www.viator.com/tours/${i.destination}/search?pid=YOUR_VIATOR_AFFILIATE_ID`;return{...t,bookingLinks:{getYourGuide:e,viator:r}}})),t)));let{data:D,error:f}=await a.O.from("trips").update({itinerary:itineraryData.itinerary,accommodations:itineraryData.accommodations,transportation:itineraryData.transportation,total_cost:itineraryData.totalCost,status:"generated",updated_at:new Date().toISOString()}).eq("id",c).select();if(f)return e.status(500).json({error:"Failed to update trip"});return e.status(200).json({success:!0,message:"Itinerary generated successfully",trip:D[0]})}catch(t){return console.error("Generate itinerary error:",t),e.status(500).json({error:"Server error"})}}o=(n.then?(await n)():n)[0],r()}catch(t){r(t)}})}};var e=require("../../../webpack-api-runtime.js");e.C(t);var __webpack_exec__=t=>e(e.s=t),i=e.X(0,[4222],()=>__webpack_exec__(7310));module.exports=i})();