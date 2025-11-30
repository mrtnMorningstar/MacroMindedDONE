import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { createPayment, updateUserData, getUserData } from "@/lib/firebaseUtils";
import { sendEmail } from "@/lib/resend";
import { paymentConfirmationEmail } from "@/emails/paymentConfirmation";

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || "";

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "No signature" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: any) {
    console.error("Webhook signature verification failed:", err.message);
    return NextResponse.json({ error: err.message }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const userId = session.metadata?.userId || session.client_reference_id;

    if (userId) {
      const amount = session.amount_total ? session.amount_total / 100 : 0;
      const planId = session.metadata?.planId || "unknown";
      
      // Get plan name from planId
      const planNames: Record<string, string> = {
        [process.env.NEXT_PUBLIC_STRIPE_BASIC_PRICE_ID || ""]: "Basic",
        [process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID || ""]: "Pro",
        [process.env.NEXT_PUBLIC_STRIPE_ELITE_PRICE_ID || ""]: "Elite",
      };
      const planType = planNames[planId] || "Basic";

      // Save payment to Firestore using utility
      await createPayment({
        userId,
        planType,
        amount,
        stripeSessionId: session.id,
      });

      // Update user document
      await updateUserData(userId, {
        planType,
        planStatus: "Pending",
      });

      // Get user data for email
      const userData = await getUserData(userId);
      if (userData) {
        const userEmail = userData.email || session.customer_email;
        const userName = userData.name || "User";

        // Send payment confirmation email
        if (userEmail) {
          try {
            const emailTemplate = paymentConfirmationEmail(
              userName,
              planType,
              amount,
              process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001"
            );
            await sendEmail({
              to: userEmail,
              subject: emailTemplate.subject,
              html: emailTemplate.html,
            });
          } catch (emailError) {
            console.error("Error sending payment confirmation email:", emailError);
            // Don't fail webhook if email fails
          }
        }
      }
    }
  }

  return NextResponse.json({ received: true });
}

