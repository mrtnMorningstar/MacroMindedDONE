import { doc, setDoc, getDoc, updateDoc, collection, addDoc, query, where, getDocs, orderBy } from "firebase/firestore";
import { db } from "./firebaseConfig";

// User Profile Functions
export async function createUserProfile(uid: string, data: {
  name: string;
  email: string;
  planType?: string;
  goal?: string;
  questionnaireResponses?: any;
  planStatus?: "Pending" | "In Progress" | "Delivered";
}) {
  try {
    await setDoc(doc(db, "users", uid), {
      uid,
      ...data,
      createdAt: new Date().toISOString(),
      role: "client",
    });
    return { success: true };
  } catch (error) {
    console.error("Error creating user profile:", error);
    throw error;
  }
}

export async function getUserData(uid: string) {
  try {
    const userDoc = await getDoc(doc(db, "users", uid));
    if (userDoc.exists()) {
      return userDoc.data();
    }
    return null;
  } catch (error) {
    console.error("Error getting user data:", error);
    throw error;
  }
}

export async function updateUserData(uid: string, data: Partial<{
  name: string;
  email: string;
  planType: string;
  goal: string;
  questionnaireResponses: any;
  planStatus: "Pending" | "In Progress" | "Delivered";
}>) {
  try {
    await updateDoc(doc(db, "users", uid), {
      ...data,
      updatedAt: new Date().toISOString(),
    });
    return { success: true };
  } catch (error) {
    console.error("Error updating user data:", error);
    throw error;
  }
}

// Plans Functions
export async function createPlan(data: {
  userId: string;
  fileUrl?: string;
  uploadedBy: string;
}) {
  try {
    const planRef = await addDoc(collection(db, "plans"), {
      ...data,
      createdAt: new Date().toISOString(),
    });
    return { success: true, id: planRef.id };
  } catch (error) {
    console.error("Error creating plan:", error);
    throw error;
  }
}

export async function getUserPlans(userId: string) {
  try {
    const q = query(
      collection(db, "plans"),
      where("userId", "==", userId),
      orderBy("createdAt", "desc")
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error("Error getting user plans:", error);
    throw error;
  }
}

// Messages Functions
export async function createMessage(data: {
  userId: string;
  sender: "admin" | "user";
  text: string;
}) {
  try {
    const messageRef = await addDoc(collection(db, "messages"), {
      ...data,
      timestamp: new Date().toISOString(),
      read: false,
    });
    return { success: true, id: messageRef.id };
  } catch (error) {
    console.error("Error creating message:", error);
    throw error;
  }
}

export async function getUserMessages(userId: string) {
  try {
    const q = query(
      collection(db, "messages"),
      where("userId", "==", userId),
      orderBy("timestamp", "desc")
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error: any) {
    console.error("Error getting user messages:", error);
    // If index error, provide helpful message
    if (error.code === "failed-precondition") {
      console.warn(
        "Firestore index required. Please create the index at the URL provided in the error message."
      );
    }
    throw error;
  }
}

export async function markMessageAsRead(messageId: string) {
  try {
    await updateDoc(doc(db, "messages", messageId), {
      read: true,
    });
    return { success: true };
  } catch (error) {
    console.error("Error marking message as read:", error);
    throw error;
  }
}

// Payments Functions
export async function createPayment(data: {
  userId: string;
  planType: string;
  amount: number;
  stripeSessionId: string;
}) {
  try {
    const paymentRef = await addDoc(collection(db, "payments"), {
      ...data,
      timestamp: new Date().toISOString(),
      status: "completed",
    });
    return { success: true, id: paymentRef.id };
  } catch (error) {
    console.error("Error creating payment:", error);
    throw error;
  }
}

export async function getUserPayments(userId: string) {
  try {
    const q = query(
      collection(db, "payments"),
      where("userId", "==", userId),
      orderBy("timestamp", "desc")
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error: any) {
    console.error("Error getting user payments:", error);
    // If index error, provide helpful message
    if (error.code === "failed-precondition") {
      console.warn(
        "Firestore index required. Please create the index at the URL provided in the error message."
      );
    }
    throw error;
  }
}

