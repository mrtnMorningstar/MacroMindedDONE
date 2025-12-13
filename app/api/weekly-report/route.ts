import { NextResponse } from "next/server";
import { db } from "@/lib/firebase/config";
import { collection, getDocs, query, where, orderBy } from "firebase/firestore";
import { sendEmail } from "@/lib/resend";

export async function GET(request: Request) {
  try {
    // Optional: Add authentication check for security
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;
    
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      // Allow manual triggers without auth, but require auth for cron
      const url = new URL(request.url);
      if (!url.searchParams.has("manual")) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    const usersSnap = await getDocs(collection(db, "users"));
    const results = [];

    for (const userDoc of usersSnap.docs) {
      const userData = userDoc.data();
      const userId = userDoc.id;

      if (!userData.email) {
        console.log(`Skipping user ${userId} - no email`);
        continue;
      }

      try {
        // Fetch user's progress logs
        let progressQuery;
        try {
          progressQuery = query(
            collection(db, "progress"),
            where("userId", "==", userId),
            orderBy("date", "desc")
          );
        } catch (error: any) {
          // If index error, use fallback query
          if (error.code === "failed-precondition") {
            progressQuery = query(
              collection(db, "progress"),
              where("userId", "==", userId)
            );
          } else {
            throw error;
          }
        }

        const logsSnap = await getDocs(progressQuery);
        const logs = logsSnap.docs.map((d) => d.data());

        // Sort by date if orderBy wasn't applied
        if (logs.length > 1) {
          const firstDate = logs[0].date?.toDate ? logs[0].date.toDate() : new Date(logs[0].date || logs[0].createdAt?.toDate ? logs[0].createdAt.toDate() : logs[0].createdAt || 0);
          const secondDate = logs[1].date?.toDate ? logs[1].date.toDate() : new Date(logs[1].date || logs[1].createdAt?.toDate ? logs[1].createdAt.toDate() : logs[1].createdAt || 0);
          
          if (firstDate.getTime() < secondDate.getTime()) {
            logs.sort((a, b) => {
              const dateA = a.date?.toDate ? a.date.toDate() : new Date(a.date || a.createdAt?.toDate ? a.createdAt.toDate() : a.createdAt || 0);
              const dateB = b.date?.toDate ? b.date.toDate() : new Date(b.date || b.createdAt?.toDate ? b.createdAt.toDate() : b.createdAt || 0);
              return dateB.getTime() - dateA.getTime(); // Most recent first
            });
          }
        }

        const report = generateWeeklySummary(logs, userData.displayName || userData.name || "there");

        await sendEmail({
          from: "MacroMinded AI <support@macrominded.net>",
          to: userData.email,
          subject: "Your Weekly MacroMinded Progress Report",
          html: generateEmailHTML(report, userData.displayName || userData.name),
        });

        results.push({ userId, email: userData.email, status: "sent" });
      } catch (error: any) {
        console.error(`Error processing user ${userId}:`, error);
        results.push({ userId, email: userData.email, status: "error", error: error.message });
      }
    }

    return NextResponse.json({
      success: true,
      processed: results.length,
      results,
    });
  } catch (error: any) {
    console.error("Error in weekly report:", error);
    return NextResponse.json(
      { error: "Failed to send weekly reports", details: error.message },
      { status: 500 }
    );
  }
}

function generateWeeklySummary(logs: any[], userName: string = "there") {
  if (!logs || logs.length === 0) {
    return `Hi ${userName},\n\nNo data logged this week. Start tracking your progress to receive personalized insights!\n\nKeep pushing forward! 💪`;
  }

  // Get last 7 entries (most recent first, so reverse for chronological)
  const recent = logs.slice(0, 7).reverse();

  // Filter entries with valid data
  const validLogs = recent.filter(
    (log) => log.weight || log.calories || log.steps
  );

  if (validLogs.length === 0) {
    return `Hi ${userName},\n\nYou have entries, but they're missing key metrics. Try logging weight, calories, or steps to see insights!\n\nKeep going! 💪`;
  }

  // Calculate averages
  const weights = validLogs.filter((l) => l.weight).map((l) => l.weight);
  const calories = validLogs.filter((l) => l.calories).map((l) => l.calories);
  const steps = validLogs.filter((l) => l.steps).map((l) => l.steps);

  const avgWeight =
    weights.length > 0
      ? (weights.reduce((a, b) => a + b, 0) / weights.length).toFixed(1)
      : null;
  const avgCalories =
    calories.length > 0
      ? Math.round(calories.reduce((a, b) => a + b, 0) / calories.length)
      : null;
  const avgSteps =
    steps.length > 0
      ? Math.round(steps.reduce((a, b) => a + b, 0) / steps.length)
      : null;

  // Build message
  let message = `Hi ${userName},\n\nThis week's summary:\n\n`;

  if (avgWeight) {
    message += `📊 Average weight: ${avgWeight} kg\n`;
  }
  if (avgCalories) {
    message += `🔥 Average intake: ${avgCalories.toLocaleString()} kcal\n`;
  }
  if (avgSteps) {
    message += `🚶 Average activity: ${avgSteps.toLocaleString()} steps\n`;
  }

  message += `\n`;

  // Add insights
  if (avgSteps && avgSteps > 9000) {
    message += `🔥 Your activity levels are excellent — you're hitting your movement goals consistently!\n\n`;
  } else if (avgSteps && avgSteps < 5000) {
    message += `💪 Consider increasing your daily steps to boost your activity levels.\n\n`;
  }

  if (avgCalories && avgCalories > 2700) {
    message += `⚠️ Calorie intake is a bit high; consider adjusting portion sizes or increasing activity.\n\n`;
  } else if (avgCalories && avgCalories < 1500) {
    message += `⚠️ Your calorie intake seems low; make sure you're fueling your body adequately.\n\n`;
  }

  // Weight trend
  if (weights.length >= 2) {
    const firstWeight = weights[0];
    const lastWeight = weights[weights.length - 1];
    const weightChange = lastWeight - firstWeight;

    if (weightChange < -0.5) {
      message += `✅ Noticeable progress! You're trending downwards nicely. Keep it up!\n\n`;
    } else if (weightChange > 0.5) {
      message += `📈 Weight has increased; review your calorie balance and activity levels.\n\n`;
    } else {
      message += `📊 Weight is stable — maintain consistency to see changes.\n\n`;
    }
  }

  // Compliance
  const complianceEntries = validLogs.filter(
    (l) => l.compliancePercent !== null && l.compliancePercent !== undefined
  );
  if (complianceEntries.length > 0) {
    const avgCompliance =
      complianceEntries.reduce((a, b) => a + (b.compliancePercent || 0), 0) /
      complianceEntries.length;
    if (avgCompliance >= 80) {
      message += `🎯 Excellent compliance — you're staying on track!\n\n`;
    } else if (avgCompliance >= 60) {
      message += `📊 Good compliance — keep working on consistency.\n\n`;
    }
  }

  message += `Keep pushing — you're doing amazing! 💪\n\n- MacroMinded AI`;

  return message;
}

function generateEmailHTML(report: string, userName: string = "there") {
  // Convert newlines to <br> and format the report
  const formattedReport = report
    .split("\n")
    .map((line) => {
      if (line.trim() === "") return "<br>";
      if (line.startsWith("Hi ") || line.startsWith("📊") || line.startsWith("🔥") || line.startsWith("🚶")) {
        return `<p style="margin: 8px 0; color: #333; font-family: sans-serif;">${line}</p>`;
      }
      if (line.startsWith("✅") || line.startsWith("🎯")) {
        return `<p style="margin: 8px 0; color: #00AA00; font-family: sans-serif; font-weight: 600;">${line}</p>`;
      }
      if (line.startsWith("⚠️")) {
        return `<p style="margin: 8px 0; color: #FF8800; font-family: sans-serif; font-weight: 600;">${line}</p>`;
      }
      return `<p style="margin: 8px 0; color: #333; font-family: sans-serif;">${line}</p>`;
    })
    .join("");

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; background-color: #f5f5f5; font-family: sans-serif;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 40px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #FF2E2E; font-size: 28px; margin: 0; font-weight: bold;">
              Your Weekly AI Report
            </h1>
            <p style="color: #666; font-size: 14px; margin-top: 10px;">
              MacroMinded Progress Summary
            </p>
          </div>
          
          <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; border-left: 4px solid #FF2E2E;">
            ${formattedReport}
          </div>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
            <p style="font-size: 12px; color: #777; text-align: center; margin: 0;">
              Sent automatically by MacroMinded AI<br>
              <a href="${process.env.NEXT_PUBLIC_APP_URL || "https://macrominded.net"}/dashboard" style="color: #FF2E2E; text-decoration: none;">
                View your dashboard →
              </a>
            </p>
          </div>
        </div>
      </body>
    </html>
  `;
}

