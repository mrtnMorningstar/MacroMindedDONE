const baseStyles = `
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; 
      line-height: 1.6; 
      color: #ffffff; 
      background: #000000; 
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }
    .email-container { 
      max-width: 600px; 
      margin: 0 auto; 
      background: #000000;
    }
    .header { 
      background: linear-gradient(135deg, #FF2E2E 0%, #CC0000 100%); 
      padding: 40px 20px; 
      text-align: center;
      border-radius: 8px 8px 0 0;
    }
    .header h1 { 
      margin: 0; 
      color: #ffffff; 
      font-size: 32px;
      font-weight: 700;
      letter-spacing: -0.5px;
    }
    .header .tagline {
      margin-top: 8px;
      color: #ffffff;
      font-size: 14px;
      font-weight: 500;
      opacity: 0.95;
    }
    .content { 
      background: #111111; 
      padding: 40px 30px; 
      border-radius: 0 0 8px 8px;
    }
    .content h2 {
      color: #ffffff;
      font-size: 24px;
      font-weight: 600;
      margin-bottom: 16px;
    }
    .content p {
      color: #e5e5e5;
      font-size: 16px;
      margin-bottom: 16px;
      line-height: 1.7;
    }
    .button { 
      display: inline-block; 
      padding: 14px 32px; 
      background: #FF2E2E; 
      color: #ffffff !important; 
      text-decoration: none; 
      border-radius: 6px; 
      margin: 24px 0; 
      font-weight: 600;
      font-size: 16px;
      transition: background 0.2s;
      text-align: center;
    }
    .button:hover {
      background: #CC0000;
    }
    .footer {
      padding: 30px 20px;
      text-align: center;
      background: #000000;
    }
    .footer p {
      color: #888888;
      font-size: 12px;
      margin-bottom: 8px;
    }
    .footer a {
      color: #FF2E2E;
      text-decoration: none;
    }
    .highlight {
      color: #FF2E2E;
      font-weight: 600;
    }
    .divider {
      height: 1px;
      background: #222222;
      margin: 24px 0;
    }
  </style>
`;

export const emailTemplates = {
  welcome: (name: string) => ({
    subject: "Welcome to MacroMinded! 🎉",
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          ${baseStyles}
        </head>
        <body>
          <div class="email-container">
            <div class="header">
              <h1>MacroMinded</h1>
              <div class="tagline">Real Plans. Real Results.</div>
            </div>
            <div class="content">
              <h2>Welcome, ${name}! 👋</h2>
              <p>Thank you for joining <span class="highlight">MacroMinded</span>. We&apos;re thrilled to have you on board and excited to help you achieve your nutrition goals.</p>
              <p>Your journey to better nutrition starts now. Whether you&apos;re looking to lose weight, gain muscle, or maintain your current physique, we&apos;re here to support you every step of the way.</p>
              <div class="divider"></div>
              <p style="font-size: 14px; color: #aaaaaa;">Next steps:</p>
              <ul style="color: #e5e5e5; font-size: 16px; margin-left: 20px; margin-bottom: 24px;">
                <li>Choose a meal plan that fits your goals</li>
                <li>Complete your onboarding questionnaire</li>
                <li>Receive your personalized meal plan</li>
              </ul>
              <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'}/dashboard" class="button">Go to Dashboard</a>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} MacroMinded. All rights reserved.</p>
              <p><a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'}/contact">Contact Support</a></p>
            </div>
          </div>
        </body>
      </html>
    `,
  }),

  paymentConfirmation: (name: string, amount: number, planName: string) => ({
    subject: "Payment Confirmed ✅ - MacroMinded",
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          ${baseStyles}
        </head>
        <body>
          <div class="email-container">
            <div class="header">
              <h1>MacroMinded</h1>
              <div class="tagline">Real Plans. Real Results.</div>
            </div>
            <div class="content">
              <h2>Payment Confirmed! ✅</h2>
              <p>Hi ${name},</p>
              <p>Thank you for your purchase! Your payment has been successfully processed.</p>
              <div style="background: #1a1a1a; border-left: 4px solid #FF2E2E; padding: 20px; margin: 24px 0; border-radius: 4px;">
                <p style="margin-bottom: 8px;"><strong style="color: #FF2E2E;">Plan:</strong> <span style="color: #ffffff;">${planName}</span></p>
                <p style="margin-bottom: 8px;"><strong style="color: #FF2E2E;">Amount:</strong> <span style="color: #ffffff;">$${amount.toFixed(2)}</span></p>
                <p style="margin: 0;"><strong style="color: #FF2E2E;">Status:</strong> <span style="color: #4ade80;">Completed</span></p>
              </div>
              <p>Your personalized meal plan is now being created by our nutrition expert. You&apos;ll receive a notification as soon as it&apos;s ready!</p>
              <div class="divider"></div>
              <p style="font-size: 14px; color: #aaaaaa;">What happens next?</p>
              <ul style="color: #e5e5e5; font-size: 16px; margin-left: 20px; margin-bottom: 24px;">
                <li>Complete your onboarding questionnaire (if you haven&apos;t already)</li>
                <li>Our expert will create your custom meal plan</li>
                <li>You&apos;ll receive an email when your plan is ready</li>
              </ul>
              <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'}/dashboard" class="button">View Dashboard</a>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} MacroMinded. All rights reserved.</p>
              <p><a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'}/contact">Contact Support</a></p>
            </div>
          </div>
        </body>
      </html>
    `,
  }),

  planReady: (name: string) => ({
    subject: "🎉 Your Meal Plan is Ready! - MacroMinded",
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          ${baseStyles}
        </head>
        <body>
          <div class="email-container">
            <div class="header">
              <h1>MacroMinded</h1>
              <div class="tagline">Real Plans. Real Results.</div>
            </div>
            <div class="content">
              <h2>🎉 Your Plan is Ready!</h2>
              <p>Hi ${name},</p>
              <p>Great news! Your personalized meal plan has been created by our nutrition expert and is now ready for you.</p>
              <div style="background: #1a1a1a; border-left: 4px solid #FF2E2E; padding: 20px; margin: 24px 0; border-radius: 4px;">
                <p style="margin: 0; color: #ffffff; font-weight: 600;">Your custom meal plan is waiting in your dashboard!</p>
              </div>
              <p>This plan has been specifically tailored to your goals, preferences, and dietary requirements. You can now:</p>
              <ul style="color: #e5e5e5; font-size: 16px; margin-left: 20px; margin-bottom: 24px;">
                <li>View your complete meal plan</li>
                <li>Download it for offline access</li>
                <li>Start your nutrition journey today</li>
              </ul>
              <div class="divider"></div>
              <p style="font-size: 14px; color: #aaaaaa;">Remember: Consistency is key! Stick to your plan and track your progress.</p>
              <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'}/dashboard" class="button">View Your Plan</a>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} MacroMinded. All rights reserved.</p>
              <p><a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'}/contact">Need Help? Contact Support</a></p>
            </div>
          </div>
        </body>
      </html>
    `,
  }),

  adminReply: (name: string, messagePreview?: string) => ({
    subject: "💬 New Message from MacroMinded Support",
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          ${baseStyles}
        </head>
        <body>
          <div class="email-container">
            <div class="header">
              <h1>MacroMinded</h1>
              <div class="tagline">Real Plans. Real Results.</div>
            </div>
            <div class="content">
              <h2>💬 New Message from Support</h2>
              <p>Hi ${name},</p>
              <p>You have a new message from our <span class="highlight">MacroMinded support team</span>. We&apos;re here to help with any questions or concerns you may have.</p>
              ${messagePreview ? `
                <div style="background: #1a1a1a; border-left: 4px solid #FF2E2E; padding: 20px; margin: 24px 0; border-radius: 4px;">
                  <p style="margin: 0; color: #e5e5e5; font-style: italic;">&ldquo;${messagePreview}&rdquo;</p>
                </div>
              ` : ''}
              <p>Log in to your dashboard to view the full message and reply directly to our team.</p>
              <div class="divider"></div>
              <p style="font-size: 14px; color: #aaaaaa;">We typically respond within 24 hours. If you have urgent questions, feel free to reach out!</p>
              <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'}/dashboard" class="button">View Messages</a>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} MacroMinded. All rights reserved.</p>
              <p><a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'}/contact">Contact Support</a></p>
            </div>
          </div>
        </body>
      </html>
    `,
  }),
};

