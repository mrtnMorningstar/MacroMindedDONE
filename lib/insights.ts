// lib/insights.ts

/**
 * Calculate the current streak of consecutive days with logged entries
 * @param logs Array of progress entries with date/timestamp fields
 * @returns Number of consecutive days logged
 */
export const calculateStreak = (logs: any[]) => {
  if (!logs || logs.length === 0) return 0;

  // Sort logs by date (most recent first)
  const sortedLogs = [...logs].sort((a, b) => {
    const dateA = a.date?.toDate ? a.date.toDate() : new Date(a.date || a.createdAt?.toDate ? a.createdAt.toDate() : a.createdAt || 0);
    const dateB = b.date?.toDate ? b.date.toDate() : new Date(b.date || b.createdAt?.toDate ? b.createdAt.toDate() : b.createdAt || 0);
    return dateB.getTime() - dateA.getTime(); // Most recent first
  });

  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Check if there's an entry today or yesterday
  const mostRecentDate = sortedLogs[0]?.date?.toDate 
    ? sortedLogs[0].date.toDate() 
    : new Date(sortedLogs[0]?.date || sortedLogs[0]?.createdAt?.toDate ? sortedLogs[0].createdAt.toDate() : sortedLogs[0]?.createdAt || 0);
  
  mostRecentDate.setHours(0, 0, 0, 0);
  const daysDiff = Math.floor((today.getTime() - mostRecentDate.getTime()) / (1000 * 60 * 60 * 24));

  // If the most recent entry is more than 2 days ago, streak is broken
  if (daysDiff > 1) return 0;

  // Start counting from the most recent entry
  streak = 1;
  
  // Count backwards through sorted logs
  for (let i = 1; i < sortedLogs.length; i++) {
    const prevDate = sortedLogs[i - 1].date?.toDate 
      ? sortedLogs[i - 1].date.toDate() 
      : new Date(sortedLogs[i - 1]?.date || sortedLogs[i - 1]?.createdAt?.toDate ? sortedLogs[i - 1].createdAt.toDate() : sortedLogs[i - 1]?.createdAt || 0);
    
    const currDate = sortedLogs[i].date?.toDate 
      ? sortedLogs[i].date.toDate() 
      : new Date(sortedLogs[i]?.date || sortedLogs[i]?.createdAt?.toDate ? sortedLogs[i].createdAt.toDate() : sortedLogs[i]?.createdAt || 0);
    
    prevDate.setHours(0, 0, 0, 0);
    currDate.setHours(0, 0, 0, 0);
    
    const diff = Math.floor((prevDate.getTime() - currDate.getTime()) / (1000 * 60 * 60 * 24));
    
    // If entries are consecutive days (within 1 day difference), increment streak
    if (diff === 1) {
      streak++;
    } else {
      // Streak is broken
      break;
    }
  }

  return streak;
};

/**
 * Calculate progress percentage towards a weight goal
 * @param goal Goal object with startWeight, targetWeight
 * @param logs Array of progress entries with weight field
 * @returns Progress percentage (0-100)
 */
export const calculateGoalProgress = (goal: any, logs: any[]) => {
  if (!goal || !logs || logs.length === 0) return 0;

  // Get the most recent weight entry
  const sortedLogs = [...logs].sort((a, b) => {
    const dateA = a.date?.toDate ? a.date.toDate() : new Date(a.date || a.createdAt?.toDate ? a.createdAt.toDate() : a.createdAt || 0);
    const dateB = b.date?.toDate ? b.date.toDate() : new Date(b.date || b.createdAt?.toDate ? b.createdAt.toDate() : b.createdAt || 0);
    return dateB.getTime() - dateA.getTime(); // Most recent first
  });

  const currentWeight = sortedLogs.find(entry => entry.weight)?.weight;
  
  if (!currentWeight || !goal.startWeight || !goal.targetWeight) return 0;

  const delta = Math.abs(goal.startWeight - goal.targetWeight);
  if (delta === 0) return 100; // Already at goal

  // Determine direction (losing or gaining weight)
  const isLosing = goal.targetWeight < goal.startWeight;
  const achieved = isLosing 
    ? goal.startWeight - currentWeight  // For weight loss: how much we've lost
    : currentWeight - goal.startWeight;  // For weight gain: how much we've gained

  const percent = Math.min(Math.round((achieved / delta) * 100), 100);
  return percent > 0 ? percent : 0;
};

