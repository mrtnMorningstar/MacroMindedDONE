export function planReadyEmail(name: string, appUrl: string = "http://localhost:3001") {
  return {
    subject: "🎉 Your Meal Plan is Ready! - MacroMinded",
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
              font-family: 'Inter', Arial, sans-serif; 
              line-height: 1.6; 
              color: #ffffff; 
              background: #000000; 
            }
            .email-container { max-width: 600px; margin: 0 auto; background: #000000; }
            .header { 
              background: linear-gradient(135deg, #FF2E2E 0%, #CC0000 100%); 
              padding: 40px 20px; 
              text-align: center;
              border-radius: 8px 8px 0 0;
            }
            .header h1 { margin: 0; color: #ffffff; font-size: 32px; font-weight: 700; }
            .content { background: #111111; padding: 40px 30px; border-radius: 0 0 8px 8px; }
            .content h2 { color: #ffffff; font-size: 24px; font-weight: 600; margin-bottom: 16px; }
            .content p { color: #e5e5e5; font-size: 16px; margin-bottom: 16px; }
            .button { 
              display: inline-block; 
              padding: 14px 32px; 
              background: #FF2E2E; 
              color: #ffffff !important; 
              text-decoration: none; 
              border-radius: 6px; 
              margin: 24px 0; 
              font-weight: 600;
            }
            .info-box {
              background: #1a1a1a;
              border-left: 4px solid #FF2E2E;
              padding: 20px;
              margin: 24px 0;
              border-radius: 4px;
            }
            .footer { padding: 30px 20px; text-align: center; background: #000000; }
            .footer p { color: #888888; font-size: 12px; }
            .highlight { color: #FF2E2E; font-weight: 600; }
          </style>
        </head>
        <body>
          <div class="email-container">
            <div class="header">
              <h1>MacroMinded</h1>
            </div>
            <div class="content">
              <h2>🎉 Your Plan is Ready!</h2>
              <p>Hi ${name},</p>
              <p>Great news! Your personalized meal plan has been created and is now ready for you.</p>
              <div class="info-box">
                <p style="margin: 0; color: #ffffff; font-weight: 600;">Your custom meal plan is waiting in your dashboard!</p>
              </div>
              <p>This plan has been specifically tailored to your goals, preferences, and dietary requirements.</p>
              <a href="${appUrl}/dashboard" class="button">View Your Plan</a>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} MacroMinded. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `,
  };
}

