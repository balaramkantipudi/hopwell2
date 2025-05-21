"use strict";(()=>{var e={};e.id=6491,e.ids=[6491],e.modules={2885:e=>{e.exports=require("@supabase/supabase-js")},145:e=>{e.exports=require("next/dist/compiled/next-server/pages-api.runtime.prod.js")},1445:(e,r,t)=>{t.r(r),t.d(r,{config:()=>l,default:()=>u,routeModule:()=>d});var o={};t.r(o),t.d(o,{default:()=>handler});var n=t(1802),a=t(7153),i=t(6249),s=t(4768);async function handler(e,r){if("POST"!==e.method)return r.status(405).json({error:"Method not allowed"});try{let{data:{session:t},error:o}=await s.O.auth.getSession();if(console.log("Auth check result:",t?"Session found":"No session found"),o&&console.log("Auth error:",o.message),!t)return console.log("No active session found - authentication failed"),r.status(401).json({error:"Not authenticated",message:"Please log in to generate an itinerary"});let n=e.body;if(!n||!n.destination)return r.status(400).json({error:"Missing destination information"});let a=function(e){let r=e.destination,t=e.origin||"your location",o=e.transportMode||"preferred transportation";return`
TRIP TO ${r.toUpperCase()}
===============================

TRIP SUMMARY
-----------
A journey from ${t} to ${r} by ${o}.

DAILY ITINERARY
--------------

DAY 1: ARRIVAL
-------------
- Arrive in ${r}
- Check into your accommodation
- Explore the local area
- Dinner at a popular restaurant

DAY 2: EXPLORATION
----------------
- Visit the top attractions in ${r}
- Try local cuisine for lunch
- Shopping or cultural activities in the afternoon
- Evening entertainment

DAY 3: DEPARTURE
--------------
- Morning activities
- Last-minute shopping for souvenirs
- Prepare for departure
- Return journey

Enjoy your trip to ${r}!
`}(n);return r.status(200).json({text:a})}catch(e){return console.error("API error:",e),r.status(500).json({error:"Failed to generate itinerary",message:e.message})}}let u=(0,i.l)(o,"default"),l=(0,i.l)(o,"config"),d=new n.PagesAPIRouteModule({definition:{kind:a.x.PAGES_API,page:"/api/direct-itinerary",pathname:"/api/direct-itinerary",bundlePath:"",filename:""},userland:o})}};var r=require("../../webpack-api-runtime.js");r.C(e);var __webpack_exec__=e=>r(r.s=e),t=r.X(0,[4222,4768],()=>__webpack_exec__(1445));module.exports=t})();