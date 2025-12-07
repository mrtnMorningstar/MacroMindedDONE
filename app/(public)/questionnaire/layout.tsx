import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Questionnaire - MacroMinded",
  description: "Complete your questionnaire to get your personalized meal plan.",
};

export default function QuestionnaireLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

