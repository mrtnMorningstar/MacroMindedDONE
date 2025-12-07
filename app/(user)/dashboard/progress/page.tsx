"use client";

import { useAuth } from "@/context/auth-context";
import { db } from "@/lib/firebase/config";
import { collection, query, where, orderBy, getDocs } from "firebase/firestore";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
} from "recharts";
import { AnimatedCard } from "@/components/ui/animated-card";

export default function ProgressPage() {
  const { user } = useAuth();
  const [progress, setProgress] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.uid) return;

    (async () => {
      try {
        const q = query(
          collection(db, "progress"),
          where("userId", "==", user.uid),
          orderBy("date", "asc")
        );
        const snap = await getDocs(q);
        const progressData = snap.docs.map((d) => {
          const data = d.data();
          // Format date for chart display
          const date = data.date?.toDate?.() || new Date(data.date || 0);
          return {
            ...data,
            date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
            dateValue: date, // Keep original for sorting if needed
          };
        });
        setProgress(progressData);
      } catch (error: any) {
        // Fallback if index doesn't exist yet
        if (error?.code === "failed-precondition") {
          console.warn("Firestore index not created yet. Fetching progress without ordering.");
          const q = query(
            collection(db, "progress"),
            where("userId", "==", user.uid)
          );
          const snap = await getDocs(q);
          const progressData = snap.docs.map((d) => {
            const data = d.data();
            const date = data.date?.toDate?.() || new Date(data.date || 0);
            return {
              ...data,
              date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
              dateValue: date,
            };
          });
          // Sort client-side as fallback
          progressData.sort((a, b) => {
            const dateA = a.dateValue?.getTime?.() || 0;
            const dateB = b.dateValue?.getTime?.() || 0;
            return dateA - dateB;
          });
          setProgress(progressData);
        } else {
          console.error("Error fetching progress:", error);
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [user?.uid]);

  if (loading)
    return <p className="text-gray-400 text-center py-10">Loading progress...</p>;

  if (!progress.length)
    return <p className="text-gray-400 text-center py-10">No progress data yet.</p>;

  return (
    <div className="space-y-10">
      <motion.h1
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-2xl font-black text-white"
      >
        Progress
      </motion.h1>

      <AnimatedCard>
        <h2 className="text-lg font-semibold mb-4 text-white">Weight Trend</h2>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={progress}>
              <XAxis dataKey="date" stroke="#888" />
              <YAxis stroke="#888" />
              <Tooltip
                contentStyle={{
                  background: "#0f0f0f",
                  border: "1px solid #1f1f1f",
                  borderRadius: "8px",
                  color: "#fff",
                }}
              />
              <Line type="monotone" dataKey="weight" stroke="#FF2E2E" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
      </AnimatedCard>

      <AnimatedCard>
        <h2 className="text-lg font-semibold mb-4 text-white">Macro Adherence</h2>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={progress}>
              <XAxis dataKey="date" stroke="#888" />
              <YAxis stroke="#888" />
              <Tooltip
                contentStyle={{
                  background: "#0f0f0f",
                  border: "1px solid #1f1f1f",
                  borderRadius: "8px",
                  color: "#fff",
                }}
              />
              <Legend
                wrapperStyle={{
                  color: "#888",
                }}
              />
              <Bar dataKey="protein" fill="#FF2E2E" />
              <Bar dataKey="carbs" fill="#777" />
              <Bar dataKey="fat" fill="#444" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </AnimatedCard>
    </div>
  );
}
