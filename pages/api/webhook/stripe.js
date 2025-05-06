// pages/api/webhook/stripe.js
import Stripe from "stripe";
import { buffer } from "micro";
import { supabase } from '../../../libs/supabase'  // Use relative path
import { sendEmail } from "@/libs/mailgun";
import configFile from "@/config";
import { findCheckoutSession } from "@/libs/stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const config = {
  api: {
    bodyParser: false,
  },
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
          console.error(
            `Webhook signature verification failed. ${err.message}`
          );
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
            // First payment is successful and the subscription is created
            const session = await findCheckoutSession(data.object.id);

            const customerId = session?.customer;
            const priceId = session?.line_items?.data[0]?.price.id;
            const userId = data.object.client_reference_id;
            const plan = configFile.stripe.plans.find(
              (p) => p.priceId === priceId
            );

            if (!plan) break;

            const customer = await stripe.customers.retrieve(customerId);

            // Update the user in Supabase
            if (userId) {
              // Update user metadata
              await supabase
                .from('profiles')
                .update({
                  stripe_customer_id: customerId,
                  stripe_price_id: priceId,
                  updated_at: new Date().toISOString()
                })
                .eq('id', userId);
              
            } else if (customer.email) {
              // Try to find user by email
              const { data: userByEmail } = await supabase
                .from('profiles')
                .select('id')
                .eq('email', customer.email)
                .single();

              if (userByEmail) {
                await supabase
                  .from('profiles')
                  .update({
                    stripe_customer_id: customerId,
                    stripe_price_id: priceId,
                    updated_at: new Date().toISOString()
                  })
                  .eq('id', userByEmail.id);
              }
            }

            break;
          }
          
          // Handle other Stripe webhook events...
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