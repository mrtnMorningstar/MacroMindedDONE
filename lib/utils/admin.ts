/**
 * Check if a user has admin access
 * Checks both Firebase role and email from environment variables
 */
export function isAdminUser(user: any, userData: any): boolean {
  if (!user || !user.email) return false;

  // Check Firebase role
  if (userData?.role === "admin") {
    return true;
  }

  // Check environment variable admin emails (comma-separated)
  const adminEmailsEnv = process.env.NEXT_PUBLIC_ADMIN_EMAILS || process.env.ADMIN_EMAILS || "";
  const adminEmails = adminEmailsEnv.split(",").map((e) => e.trim()).filter(Boolean);
  
  if (user.email && adminEmails.length > 0 && adminEmails.includes(user.email)) {
    return true;
  }

  // Fallback: Check single admin email
  const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL || process.env.ADMIN_EMAIL;
  if (adminEmail && user.email === adminEmail.trim()) {
    return true;
  }

  return false;
}

/**
 * Get list of admin emails from environment
 */
export function getAdminEmails(): string[] {
  const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL || process.env.ADMIN_EMAIL;
  const emails = ["admin@macrominded.com"];
  
  if (adminEmail) {
    emails.push(adminEmail);
  }
  
  return emails;
}

