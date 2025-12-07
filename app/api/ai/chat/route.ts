import { NextResponse } from "next/server";
import { getDb } from "@/lib/firebase-admin";
import { collection, query, where, getDocs, getDoc, doc } from "firebase/firestore";
import { generateUserInsights } from "@/lib/ai/insights";

// Note: Using firebase/firestore (not firebase-admin) because getDb() returns a Firestore instance

export async function POST(req: Request) {
  try {
    const { userId, prompt } = await req.json();

    if (!userId || !prompt) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const db = getDb();
    if (!db) {
      return NextResponse.json({ error: "Database not available" }, { status: 500 });
    }

    // Fetch progress data
    const progressQ = query(collection(db, "progress"), where("userId", "==", userId));
    const progSnap = await getDocs(progressQ);
    const progress = progSnap.docs.map((d) => d.data());

    // Fetch latest plan
    let plan = null;
    try {
      const planSnap = await getDocs(collection(db, "plans", userId, "versions"));
      plan = planSnap.docs[0]?.data() || null;
    } catch (error) {
      // Plan subcollection might not exist, that's okay
      console.warn("Could not fetch plan:", error);
    }

    // Fetch user metadata for goal
    let userData = null;
    try {
      const userSnap = await getDoc(doc(db, "users", userId));
      if (userSnap.exists()) {
        userData = userSnap.data();
      }
    } catch (error) {
      console.warn("Could not fetch user data:", error);
    }

    // Merge plan data with user data for goal
    const planWithGoal = plan || userData;

    // Generate insights
    const insights = generateUserInsights({ progress, plan: planWithGoal });

    let responseText = `Here's what I can tell from your data:\n${insights.summary}\n\nRecommendations:\n- ${insights.recommendations.join("\n- ")}`;

    // Optional: upgrade with OpenAI for richer responses
    if (process.env.OPENAI_API_KEY) {
      try {
        const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          },
          body: JSON.stringify({
            model: "gpt-4o-mini",
            messages: [
              { role: "system", content: "You are a friendly nutrition assistant for MacroMinded. Provide helpful, encouraging advice based on the user's progress data." },
              { role: "user", content: `${prompt}\n\nContext:\n${responseText}` },
            ],
            temperature: 0.7,
            max_tokens: 300,
          }),
        });

        if (openaiRes.ok) {
          const aiData = await openaiRes.json();
          const aiResponse = aiData.choices?.[0]?.message?.content;
          if (aiResponse) {
            responseText = aiResponse;
          }
        }
      } catch (openaiError) {
        console.error("OpenAI API error:", openaiError);
        // Fall back to rule-based response
      }
    }

    return NextResponse.json({ text: responseText });
  } catch (error: any) {
    console.error("Error in /api/ai/chat:", error);
    return NextResponse.json(
      { error: "Failed to generate AI response", text: "I'm having trouble processing that right now. Please try again later." },
      { status: 500 }
    );
  }
}

