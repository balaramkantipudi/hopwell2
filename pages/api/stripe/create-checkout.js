// pages/api/stripe/create-checkout.js
import { supabase } from '../../../libs/supabase'  // Use relative path
import { createCheckout } from "@/libs/stripe";

export default async function handler(req, res) {
  // Get Supabase session
  const { data: { session }, error: authError } = await supabase.auth.getSession();

  if (authError || !session) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  const { method, body } = req;
  const userId = session.user.id;

  switch (method) {
    case "POST": {
      if (!body.priceId) {
        return res.status(404).send({ error: "Need a Price ID for Stripe" });
      } else if (!body.successUrl || !body.cancelUrl) {
        return res.status(404).send({ error: "Need valid success/failure URL to return to" });
      }

      try {
        // Get user profile from Supabase
        const { data: user, error: userError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();

        if (userError) {
          return res.status(404).json({ error: "User doesn't exist" });
        }

        const { coupon, successUrl, cancelUrl } = body;

        const stripeSessionURL = await createCheckout({
          successUrl,
          cancelUrl,
          clientReferenceID: userId,
          priceId: body.priceId,
          coupon,
        });

        return res.status(200).json({ url: stripeSessionURL });
      } catch (e) {
        console.error(e);
        return res.status(500).json({ error: e?.message });
      }
    }

    default:
      res.status(404).json({ error: "Unknown request type" });
  }
}