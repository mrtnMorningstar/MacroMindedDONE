// Global TypeScript types for MacroMinded

export interface User {
  uid: string;
  email: string | null;
  name?: string;
  role?: "client" | "admin";
  hasActivePlan?: boolean;
  planStatus?: "pending" | "in-progress" | "delivered";
  createdAt?: string;
  questionnaireData?: QuestionnaireData;
  planUrl?: string;
  planText?: string;
  planDeliveredAt?: string;
  isOnline?: boolean;
  lastSeen?: any;
}

export interface Plan {
  id: string;
  name: string;
  price: number;
  description: string;
  features: string[];
  popular?: boolean;
  stripePriceId: string;
}

export interface QuestionnaireData {
  goal?: "Lose Weight" | "Gain Weight" | "Maintain Weight";
  age?: number;
  gender?: "Male" | "Female" | "Other";
  height?: number;
  weight?: number;
  activityLevel?: string;
  dietaryPreferences?: string[];
  allergies?: string;
  userId?: string;
  completedAt?: string;
  status?: "pending" | "completed";
}

export interface Message {
  id: string;
  userId: string;
  text: string;
  senderId: string;
  senderName: string;
  timestamp: any;
  read: boolean;
}

export interface Payment {
  id: string;
  userId: string;
  amount: number;
  currency: string;
  status: string;
  planId: string;
  createdAt: string;
}

