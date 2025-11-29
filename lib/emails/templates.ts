export const emailTemplates = {
  welcome: (name: string) => ({
    subject: "Welcome to MacroMinded!",
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #fff; background: #000; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #FF2E2E; padding: 20px; text-align: center; }
            .content { background: #111; padding: 30px; }
            .button { display: inline-block; padding: 12px 24px; background: #FF2E2E; color: #fff; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0; color: #fff;">MacroMinded</h1>
            </div>
            <div class="content">
              <h2>Welcome, ${name}!</h2>
              <p>Thank you for joining MacroMinded. We're excited to help you achieve your nutrition goals.</p>
              <p>Your journey to better nutrition starts now. Real plans. Real results.</p>
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" class="button">Go to Dashboard</a>
            </div>
          </div>
        </body>
      </html>
    `,
  }),

  paymentConfirmation: (name: string, amount: number, planName: string) => ({
    subject: "Payment Confirmation - MacroMinded",
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #fff; background: #000; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #FF2E2E; padding: 20px; text-align: center; }
            .content { background: #111; padding: 30px; }
            .button { display: inline-block; padding: 12px 24px; background: #FF2E2E; color: #fff; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0; color: #fff;">MacroMinded</h1>
            </div>
            <div class="content">
              <h2>Payment Confirmed</h2>
              <p>Hi ${name},</p>
              <p>Thank you for your purchase!</p>
              <p><strong>Plan:</strong> ${planName}</p>
              <p><strong>Amount:</strong> $${amount}</p>
              <p>Your meal plan is being prepared. You'll receive it soon!</p>
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" class="button">View Dashboard</a>
            </div>
          </div>
        </body>
      </html>
    `,
  }),

  planReady: (name: string) => ({
    subject: "Your Meal Plan is Ready! - MacroMinded",
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #fff; background: #000; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #FF2E2E; padding: 20px; text-align: center; }
            .content { background: #111; padding: 30px; }
            .button { display: inline-block; padding: 12px 24px; background: #FF2E2E; color: #fff; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0; color: #fff;">MacroMinded</h1>
            </div>
            <div class="content">
              <h2>Your Plan is Ready!</h2>
              <p>Hi ${name},</p>
              <p>Great news! Your personalized meal plan has been created and is ready for you.</p>
              <p>Log in to your dashboard to view and download your plan.</p>
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" class="button">View Your Plan</a>
            </div>
          </div>
        </body>
      </html>
    `,
  }),

  adminReply: (name: string) => ({
    subject: "New Message from MacroMinded Support",
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #fff; background: #000; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #FF2E2E; padding: 20px; text-align: center; }
            .content { background: #111; padding: 30px; }
            .button { display: inline-block; padding: 12px 24px; background: #FF2E2E; color: #fff; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0; color: #fff;">MacroMinded</h1>
            </div>
            <div class="content">
              <h2>New Message</h2>
              <p>Hi ${name},</p>
              <p>You have a new message from our support team. Log in to view and reply.</p>
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" class="button">View Messages</a>
            </div>
          </div>
        </body>
      </html>
    `,
  }),
};

