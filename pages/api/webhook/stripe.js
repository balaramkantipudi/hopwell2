// pages/api/webhook/stripe.js - Simplified for credit purchases
import Stripe from "stripe";
import { buffer } from "micro";
import { supabase } from '@/libs/supabase';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const config = {
  api: {
    bodyParser: false,
  },
};

// Map Stripe price IDs to credit amounts
const creditPackages = {
  'price_basic': 5,     // 5 credits
  'price_explorer': 15, // 15 credits
  'price_voyager': 50,  // 50 credits
  // Replace with your actual Stripe price IDs
};

export default async function handler(req, res) {
  const { method } = req;

  switch (method) {
    case "POST": {
      const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
      const buf = await buffer(req);
      let data;
      let eventType;

      if (webhookSecret) {
        let event;
        const signature = req.headers["stripe-signature"];

        // verify Stripe event is legit
        try {
          event = stripe.webhooks.constructEvent(buf, signature, webhookSecret);
        } catch (err) {
          console.error(`Webhook signature verification failed. ${err.message}`);
          return res.status(400).send();
        }
        data = event.data;
        eventType = event.type;
      } else {
        data = req.body.data;
        eventType = req.body.type;
      }

      try {
        switch (eventType) {
          case "checkout.session.completed": {
            // Extract the Stripe session data
            const session = await stripe.checkout.sessions.retrieve(data.object.id, {
              expand: ['line_items']
            });

            const customerId = session?.customer;
            const userId = session?.client_reference_id;
            
            // No client reference ID means we can't identify the user
            if (!userId) {
              console.error("No client reference ID found in session");
              break;
            }

            // Get the price ID from the line items
            const lineItems = session?.line_items?.data;
            if (!lineItems || lineItems.length === 0) {
              console.error("No line items found in session");
              break;
            }
            
            const priceId = lineItems[0].price.id;
            
            // Check if this is a credit package purchase
            const creditAmount = creditPackages[priceId];
            
            if (creditAmount) {
              console.log(`Adding ${creditAmount} credits to user ${userId}`);
              
              // First, get the user's current credits
              let { data: userCredits, error: creditError } = await supabase
                .from('user_credits')
                .select('*')
                .eq('user_id', userId)
                .single();
              
              if (creditError) {
                // If no record exists, create one
                if (creditError.code === 'PGRST116') { // Record not found
                  const { data: newUser, error: insertError } = await supabase
                    .from('user_credits')
                    .insert([
                      { 
                        user_id: userId,
                        credits_remaining: creditAmount, // Start with the purchased amount
                        total_credits_used: 0
                      }
                    ])
                    .select()
                    .single();
                    
                  if (insertError) {
                    console.error(`Could not create user credits: ${insertError.message}`);
                    break;
                  }
                  
                  userCredits = newUser;
                } else {
                  console.error(`Could not fetch user credits: ${creditError.message}`);
                  break;
                }
              } else {
                // Update existing credits
                const { error: updateError } = await supabase
                  .from('user_credits')
                  .update({ 
                    credits_remaining: userCredits.credits_remaining + creditAmount
                  })
                  .eq('user_id', userId);
                
                if (updateError) {
                  console.error(`Could not update credits: ${updateError.message}`);
                  break;
                }
              }
              
              // Record the purchase in Supabase
              const { error: purchaseError } = await supabase
                .from('credit_purchases')
                .insert([
                  {
                    user_id: userId,
                    stripe_customer_id: customerId,
                    stripe_session_id: session.id,
                    price_id: priceId,
                    credits_purchased: creditAmount,
                    amount_paid: session.amount_total / 100, // Convert from cents to dollars
                    status: 'completed',
                    created_at: new Date().toISOString()
                  }
                ]);
              
              if (purchaseError) {
                console.error(`Error recording purchase: ${purchaseError.message}`);
              }
              
              console.log(`Credits added successfully to user ${userId}`);
            }

            break;
          }
          
          // You can handle other Stripe webhook events here
        }
      } catch (e) {
        console.error("stripe error: ", e.message);
      }

      return res.status(200).send();
    }
    default:
      return res.status(200).send();
  }
}