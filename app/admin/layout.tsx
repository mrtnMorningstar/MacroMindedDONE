import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Panel - MacroMinded",
  description: "MacroMinded admin panel",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

