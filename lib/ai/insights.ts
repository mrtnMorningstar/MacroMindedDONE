// lib/ai/insights.ts

export interface UserProgress {
  weight?: number;
  compliancePercent?: number;
  date?: any;
  [key: string]: any;
}

export interface PlanData {
  goal?: "lose" | "gain" | "maintain";
  [key: string]: any;
}

export function generateUserInsights({
  progress,
  plan,
}: {
  progress: UserProgress[];
  plan?: PlanData | null;
}) {
  if (!progress || progress.length === 0) {
    return {
      summary: "No progress data yet. Once you start logging, we'll provide insights here.",
      recommendations: ["Track your meals daily", "Log your weight every few days"],
      compliance: "0",
      avgWeight: "0",
    };
  }

  const latest = progress[progress.length - 1];
  const avgWeight =
    progress.reduce((a, b) => a + (b.weight || 0), 0) / progress.length;
  const compliance =
    progress.reduce((a, b) => a + (b.compliancePercent || 0), 0) /
    progress.length;

  const trend =
    progress.length >= 2
      ? latest.weight < progress[0].weight
        ? "down"
        : "up"
      : "stable";

  const summary =
    trend === "down"
      ? `You're trending down in weight — steady progress toward your goal.`
      : trend === "up"
      ? `Weight has increased slightly; if this isn't intentional, review your calorie intake.`
      : `Weight trend is stable; maintain consistency to stay on target.`;

  const recommendations: string[] = [];

  if (compliance < 60)
    recommendations.push("Aim to log consistently — adherence is key to results.");
  if (plan?.goal === "lose")
    recommendations.push("Maintain a calorie deficit and hit protein targets.");
  if (plan?.goal === "gain")
    recommendations.push("Increase carbs and track strength improvements.");
  if (plan?.goal === "maintain")
    recommendations.push("Focus on balance and portion control.");

  return {
    summary,
    recommendations,
    compliance: compliance.toFixed(1),
    avgWeight: avgWeight.toFixed(1),
  };
}

