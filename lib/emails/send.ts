import { resend } from "@/lib/resend/config";
import { emailTemplates } from "./templates";

export async function sendWelcomeEmail(email: string, name: string) {
  try {
    const template = emailTemplates.welcome(name);
    await resend.emails.send({
      from: "MacroMinded <onboarding@resend.dev>",
      to: email,
      subject: template.subject,
      html: template.html,
    });
  } catch (error) {
    console.error("Error sending welcome email:", error);
  }
}

export async function sendPaymentConfirmationEmail(
  email: string,
  name: string,
  amount: number,
  planName: string
) {
  try {
    const template = emailTemplates.paymentConfirmation(name, amount, planName);
    await resend.emails.send({
      from: "MacroMinded <onboarding@resend.dev>",
      to: email,
      subject: template.subject,
      html: template.html,
    });
  } catch (error) {
    console.error("Error sending payment confirmation email:", error);
  }
}

export async function sendPlanReadyEmail(email: string, name: string) {
  try {
    const template = emailTemplates.planReady(name);
    await resend.emails.send({
      from: "MacroMinded <onboarding@resend.dev>",
      to: email,
      subject: template.subject,
      html: template.html,
    });
  } catch (error) {
    console.error("Error sending plan ready email:", error);
  }
}

export async function sendAdminReplyEmail(
  email: string, 
  name: string, 
  messagePreview?: string
) {
  try {
    const template = emailTemplates.adminReply(name, messagePreview);
    await resend.emails.send({
      from: "MacroMinded <onboarding@resend.dev>",
      to: email,
      subject: template.subject,
      html: template.html,
    });
  } catch (error) {
    console.error("Error sending admin reply email:", error);
  }
}

