import { NextRequest, NextResponse } from "next/server";
import { resend } from "@/lib/resend/config";

export async function POST(request: NextRequest) {
  try {
    const { name, email, message } = await request.json();

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Send email via Resend
    await resend.emails.send({
      from: "MacroMinded <onboarding@resend.dev>",
      to: process.env.ADMIN_EMAIL || "admin@macrominded.com",
      replyTo: email,
      subject: `New Contact Form Message from ${name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #FF2E2E;">New Contact Form Message</h2>
          <p><strong>From:</strong> ${name} (${email})</p>
          <p><strong>Message:</strong></p>
          <p style="background: #111; padding: 15px; border-radius: 5px; color: #fff;">
            ${message.replace(/\n/g, "<br>")}
          </p>
        </div>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Contact form error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to send message" },
      { status: 500 }
    );
  }
}

