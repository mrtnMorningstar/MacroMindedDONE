import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";

export async function POST(request: NextRequest) {
  try {
    const { planId, userId, coupon } = await request.json();

    if (!planId || !userId) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

    // Validate coupon if provided
    let couponId = null;
    if (coupon) {
      try {
        // Try to retrieve the coupon to validate it
        const couponObj = await stripe.coupons.retrieve(coupon);
        if (couponObj.valid) {
          couponId = coupon;
        }
      } catch (error) {
        // Coupon doesn't exist or is invalid, continue without it
        console.log("Invalid coupon code:", coupon);
      }
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price: planId,
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/questionnaire?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/plans`,
      client_reference_id: userId,
      ...(couponId && { discounts: [{ coupon: couponId }] }),
      metadata: {
        userId,
        planId: planId,
      },
      allow_promotion_codes: true, // Allow Stripe promotion codes
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error("Checkout error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create checkout session" },
      { status: 500 }
    );
  }
}

