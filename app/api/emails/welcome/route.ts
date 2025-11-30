import { NextRequest, NextResponse } from "next/server";
import { sendEmail } from "@/lib/resend";
import { welcomeEmail } from "@/emails/welcomeEmail";

export async function POST(request: NextRequest) {
  try {
    const { email, name } = await request.json();

    if (!email || !name) {
      return NextResponse.json(
        { error: "Email and name are required" },
        { status: 400 }
      );
    }

    const emailTemplate = welcomeEmail(name, process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001");
    await sendEmail({
      to: email,
      subject: emailTemplate.subject,
      html: emailTemplate.html,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error sending welcome email:", error);
    return NextResponse.json(
      { error: "Failed to send welcome email" },
      { status: 500 }
    );
  }
}

