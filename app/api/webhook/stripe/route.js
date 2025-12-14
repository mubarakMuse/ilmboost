import configFile from "@/config";
import { findCheckoutSession } from "@/libs/stripe";
import { createClient } from "@supabase/supabase-js";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";

// This is where we receive Stripe webhook events
// It used to update the user data, send emails, etc...
// By default, it'll store the user in the database
// See more: https://shipfa.st/docs/features/payments
export async function POST(req) {
  // Check for required environment variables
  if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) {
    console.error("Missing required Stripe environment variables");
    return NextResponse.json(
      { error: "Server configuration error" },
      { status: 500 }
    );
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2023-08-16",
  });
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  const body = await req.text();
  const signature = (await headers()).get("stripe-signature");

  let eventType;
  let event;

  // Create a private supabase client using the secret service_role API key
  // Disable realtime to reduce Edge Runtime warnings
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: { persistSession: false },
      realtime: { disabled: true }
    }
  );

  // verify Stripe event is legit
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error(`Webhook signature verification failed. ${err.message}`);
    return NextResponse.json({ error: err.message }, { status: 400 });
  }

  eventType = event.type;

  try {
    switch (eventType) {
      case "checkout.session.completed": {
        // First payment is successful and a subscription is created
        // ✅ Grant access to the product and update membership
        const stripeObject = event.data.object;

        let session;
        try {
          session = await findCheckoutSession(stripeObject.id);
        } catch (error) {
          console.error("Error fetching checkout session:", error);
          // Try to continue with data from stripeObject
          session = null;
        }

        const customerId = session?.customer || stripeObject.customer;
        const priceId = session?.line_items?.data[0]?.price.id || stripeObject.display_items?.[0]?.price?.id;
        const subscriptionId = session?.subscription || stripeObject.subscription;
        const clientReferenceId = stripeObject.client_reference_id; // userId or email
        
        if (!priceId) {
          console.error("No priceId found in session or stripeObject");
          break;
        }
        
        const plan = configFile.stripe.plans.find((p) => p.priceId === priceId);

        if (!plan) {
          console.error("Plan not found for priceId:", priceId);
          break;
        }

        // Determine membership tier from plan
        const membershipTier = plan.name === "Yearly" ? "yearly" : plan.name === "Monthly" ? "monthly" : "paid";

        let customerEmail = stripeObject.customer_email;
        if (customerId) {
          try {
            const customer = await stripe.customers.retrieve(customerId);
            customerEmail = customer.email || customerEmail;
          } catch (error) {
            console.error("Error retrieving customer:", error);
            // Continue with email from stripeObject
          }
        }

        // Find user by ID (if clientReferenceId is UUID) or by email
        let user = null;
        
        // Check if clientReferenceId is a UUID (userId)
        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(clientReferenceId);
        
        if (isUUID) {
          // Find by user ID
          const { data: profile } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", clientReferenceId)
            .single();
          user = profile;
        } else {
          // Find by email
          const { data: profile } = await supabase
            .from("profiles")
            .select("*")
            .eq("email", clientReferenceId || customerEmail)
            .single();
          user = profile;
        }

        if (!user) {
          console.error("User not found for:", clientReferenceId || customerEmail);
          break;
        }

        // Update user membership and Stripe info
        // Only update Stripe fields if columns exist
        const updateData = {
          membership: membershipTier,
          updated_at: new Date().toISOString()
        };
        
        // Only add Stripe fields if they exist (check by trying to update)
        // If columns don't exist, we'll update without them
        if (customerId) updateData.stripe_customer_id = customerId;
        if (priceId) updateData.stripe_price_id = priceId;
        if (subscriptionId) updateData.stripe_subscription_id = subscriptionId;
        
        const { error } = await supabase
          .from("profiles")
          .update(updateData)
          .eq("id", user.id);

        if (error) {
          console.error("Failed to update profile:", error);
          // If it's a column error, try updating without Stripe fields
          if (error.code === 'PGRST204' || error.message?.includes('column')) {
            console.log("Stripe columns may not exist, updating membership only");
            const { error: membershipError } = await supabase
              .from("profiles")
              .update({
                membership: membershipTier,
                updated_at: new Date().toISOString()
              })
              .eq("id", user.id);
            
            if (membershipError) {
              console.error("Failed to update membership:", membershipError);
              throw membershipError;
            }
          } else {
            throw error;
          }
        }

        console.log(`Membership updated to ${membershipTier} for user ${user.id}`);

        break;
      }

      case "checkout.session.expired": {
        // User didn't complete the transaction
        // You don't need to do anything here, by you can send an email to the user to remind him to complete the transaction, for instance
        break;
      }

      case "customer.subscription.updated": {
        // The customer might have changed the plan (higher or lower plan, cancel soon etc...)
        // You don't need to do anything here, because Stripe will let us know when the subscription is canceled for good (at the end of the billing cycle) in the "customer.subscription.deleted" event
        // You can update the user data to show a "Cancel soon" badge for instance
        break;
      }

      case "customer.subscription.deleted": {
        // The customer subscription stopped
        // ❌ Revoke access - set membership back to free
        const stripeObject = event.data.object;
        const subscription = await stripe.subscriptions.retrieve(
          stripeObject.id
        );

        await supabase
          .from("profiles")
          .update({ 
            membership: 'free',
            stripe_subscription_id: null,
            updated_at: new Date().toISOString()
          })
          .eq("stripe_customer_id", subscription.customer);
        
        console.log(`Subscription cancelled for customer ${subscription.customer}`);
        break;
      }

      case "invoice.paid": {
        // Customer just paid an invoice (recurring payment for subscription)
        // ✅ Ensure membership is still active
        const stripeObject = event.data.object;
        const priceId = stripeObject.lines.data[0].price.id;
        const customerId = stripeObject.customer;

        // Find profile by Stripe customer ID
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("stripe_customer_id", customerId)
          .single();

        if (!profile) {
          console.error("Profile not found for customer:", customerId);
          break;
        }

        // Determine membership tier from priceId
        const plan = configFile.stripe.plans.find((p) => p.priceId === priceId);
        if (!plan) break;

        const membershipTier = plan.name === "Yearly" ? "yearly" : plan.name === "Monthly" ? "monthly" : "paid";

        // Update membership to ensure it's still active
        await supabase
          .from("profiles")
          .update({ 
            membership: membershipTier,
            updated_at: new Date().toISOString()
          })
          .eq("stripe_customer_id", customerId);

        console.log(`Recurring payment processed for customer ${customerId}`);
        break;
      }

      case "invoice.payment_failed":
        // A payment failed (for instance the customer does not have a valid payment method)
        // ❌ Revoke access to the product
        // ⏳ OR wait for the customer to pay (more friendly):
        //      - Stripe will automatically email the customer (Smart Retries)
        //      - We will receive a "customer.subscription.deleted" when all retries were made and the subscription has expired

        break;

      default:
      // Unhandled event type
    }
  } catch (e) {
    console.error("stripe error: ", e.message);
  }

  return NextResponse.json({});
}
