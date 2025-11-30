import { NextRequest, NextResponse } from "next/server";
import { sendEmail } from "@/lib/resend";
import { adminReplyEmail } from "@/emails/adminReply";

export async function POST(request: NextRequest) {
  try {
    const { email, name, messagePreview } = await request.json();

    if (!email || !name) {
      return NextResponse.json(
        { error: "Email and name are required" },
        { status: 400 }
      );
    }

    const emailTemplate = adminReplyEmail(
      name,
      messagePreview,
      process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001"
    );
    await sendEmail({
      to: email,
      subject: emailTemplate.subject,
      html: emailTemplate.html,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error sending notification email:", error);
    return NextResponse.json(
      { error: "Failed to send notification email" },
      { status: 500 }
    );
  }
}
