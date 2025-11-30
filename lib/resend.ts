import { Resend } from "resend";

if (!process.env.RESEND_API_KEY) {
  throw new Error("RESEND_API_KEY is not set in environment variables");
}

export const resend = new Resend(process.env.RESEND_API_KEY);

export interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

export async function sendEmail({ to, subject, html, from = "MacroMinded <onboarding@resend.dev>" }: SendEmailParams) {
  try {
    const result = await resend.emails.send({
      from,
      to,
      subject,
      html,
    });
    return { success: true, id: result.data?.id };
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
}

