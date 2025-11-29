import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard - MacroMinded",
  description: "Your MacroMinded dashboard - view your meal plan and track your progress.",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

