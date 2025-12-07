import { NextResponse } from "next/server";
import { collection, getDocs } from "firebase/firestore";
import OpenAI from "openai";
import { getDb } from "@/lib/firebase-admin";

// Initialize OpenAI only if API key is available (lazy to avoid module load errors)
let openai: OpenAI | null = null;
try {
  if (process.env.OPENAI_API_KEY) {
    openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
} catch (error) {
  console.warn("OpenAI initialization failed:", error);
  openai = null;
}

export async function GET() {
  try {
    // Get Firebase db (lazy initialization) with error handling
    let db;
    try {
      db = getDb();
    } catch (dbError: any) {
      console.error("Error getting Firebase db:", dbError);
      return NextResponse.json({
        stats: {
          totalUsers: 0,
          totalPayments: 0,
          totalRevenue: 0,
          deliveredPlans: 0,
          pendingPlans: 0,
        },
        summary: "Firebase database initialization failed. Please check your environment variables and server logs.",
      }, { status: 200 });
    }
    
    // Validate db is initialized
    if (!db) {
      console.error("Firebase db is not initialized. Check environment variables.");
      return NextResponse.json({
        stats: {
          totalUsers: 0,
          totalPayments: 0,
          totalRevenue: 0,
          deliveredPlans: 0,
          pendingPlans: 0,
        },
        summary: "Firebase database is not initialized. Please check your environment variables (NEXT_PUBLIC_FIREBASE_API_KEY, NEXT_PUBLIC_FIREBASE_PROJECT_ID, etc.).",
      }, { status: 200 });
    }

    // Fetch data with error handling
    let users: any[] = [];
    let payments: any[] = [];
    let plans: any[] = [];

    try {
      const usersSnap = await getDocs(collection(db, "users"));
      users = usersSnap.docs.map((d) => d.data());
    } catch (err: any) {
      console.error("Error fetching users:", err);
    }

    try {
      const paymentsSnap = await getDocs(collection(db, "payments"));
      payments = paymentsSnap.docs.map((d) => d.data());
    } catch (err: any) {
      console.error("Error fetching payments:", err);
    }

    try {
      const plansSnap = await getDocs(collection(db, "plans"));
      plans = plansSnap.docs.map((d) => d.data());
    } catch (err: any) {
      console.error("Error fetching plans:", err);
    }

    // Calculate stats with safe defaults
    const totalUsers = users.length || 0;
    const totalPayments = payments.length || 0;
    const totalRevenue = payments.reduce((sum, p) => {
      const amount = typeof p.amount === 'number' ? p.amount : parseFloat(p.amount || '0') || 0;
      return sum + amount;
    }, 0);
    const deliveredPlans = plans.filter((p) => (p.status || '').toLowerCase() === "delivered").length;
    const pendingPlans = plans.filter((p) => (p.status || '').toLowerCase() === "pending").length;

    // Generate AI insights if OpenAI is configured
    let summary = `Current Performance Summary:\n\n• Total Users: ${totalUsers}\n• Total Payments: ${totalPayments}\n• Revenue: $${totalRevenue.toFixed(2)}\n• Delivered Plans: ${deliveredPlans}\n• Pending Plans: ${pendingPlans}\n\n${pendingPlans > 0 ? `⚠️ Action: ${pendingPlans} plan${pendingPlans > 1 ? 's are' : ' is'} pending delivery. Consider prioritizing these to improve customer satisfaction.` : '✅ All plans are delivered. Great job maintaining service quality!'}\n\n${totalRevenue > 0 && totalUsers > 0 ? `💡 Insight: Average revenue per user is $${(totalRevenue / totalUsers).toFixed(2)}. Consider upselling strategies to increase this value.` : '💡 Focus on user acquisition to grow revenue.'}`;
    
    if (openai && process.env.OPENAI_API_KEY) {
      try {
        const prompt = `
          You are an analytics expert for a meal planning service. Given this business data:

          - Total Users: ${totalUsers}
          - Total Payments: ${totalPayments}
          - Total Revenue: $${totalRevenue.toFixed(2)}
          - Delivered Plans: ${deliveredPlans}
          - Pending Plans: ${pendingPlans}

          Generate a concise, actionable insight summary (max 120 words) that:
          1. Explains the current performance
          2. Highlights key trends
          3. Provides one specific, actionable suggestion for improvement

          Be professional, data-driven, and focus on actionable insights.
        `;

        const response = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [{ role: "user", content: prompt }],
          temperature: 0.7,
          max_tokens: 200,
        });

        const aiSummary = response.choices[0].message?.content;
        if (aiSummary) {
          summary = aiSummary;
        }
      } catch (aiError: any) {
        console.error("OpenAI API error:", aiError);
        // Fallback to basic summary (already set above)
      }
    }

    return NextResponse.json({
      stats: { totalUsers, totalPayments, totalRevenue, deliveredPlans, pendingPlans },
      summary,
    });
  } catch (err: any) {
    console.error("Insights API error:", err);
    // Return a safe response even on error
    return NextResponse.json({
      stats: {
        totalUsers: 0,
        totalPayments: 0,
        totalRevenue: 0,
        deliveredPlans: 0,
        pendingPlans: 0,
      },
      summary: "Unable to fetch insights at this time. Please check the server logs for details.",
      error: err.message || "Unknown error",
    }, { status: 200 }); // Return 200 with error info instead of 500
  }
}

