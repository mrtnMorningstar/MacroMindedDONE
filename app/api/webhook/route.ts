import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { doc, setDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/config";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2024-11-20.acacia",
});

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
      // Save payment to Firestore
      await setDoc(doc(db, "payments", session.id), {
        userId,
        amount: session.amount_total ? session.amount_total / 100 : 0,
        currency: session.currency,
        status: "completed",
        planId: session.metadata?.planId || "unknown",
        createdAt: new Date().toISOString(),
      });

      // Update user document
      await updateDoc(doc(db, "users", userId), {
        hasActivePlan: true,
        lastPaymentDate: new Date().toISOString(),
      });
    }
  }

  return NextResponse.json({ received: true });
}

