

"use client";

import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { motion } from "framer-motion";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface TrendPoint {
  date: string;
  users: number;
  revenue: number;
}

export function TrendsChart() {
  const [data, setData] = useState<TrendPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const usersSnap = await getDocs(collection(db, "users"));
        const paymentsSnap = await getDocs(collection(db, "payments"));

        const users = usersSnap.docs.map((doc) => doc.data());
        const payments = paymentsSnap.docs.map((doc) => doc.data());

        // If nothing in Firestore, show empty state
        if (!users.length && !payments.length) {
          setData([]);
          setLoading(false);
          return;
        }

        const grouped: Record<string, { users: number; revenue: number }> = {};

        // Group users by createdAt day
        users.forEach((u: any) => {
          const date =
            u.createdAt?.toDate?.()?.toLocaleDateString?.("en-US") ||
            "Unknown";
          if (!grouped[date]) grouped[date] = { users: 0, revenue: 0 };
          grouped[date].users += 1;
        });

        // Group payments by createdAt day
        payments.forEach((p: any) => {
          const date =
            p.createdAt?.toDate?.()?.toLocaleDateString?.("en-US") ||
            "Unknown";
          if (!grouped[date]) grouped[date] = { users: 0, revenue: 0 };
          const amount = Number(p.amount) || 0;
          grouped[date].revenue += amount;
        });

        // Transform grouped object into chart array
        const sortedData = Object.entries(grouped)
          .map(([date, { users, revenue }]) => ({
            date,
            users,
            revenue: parseFloat(revenue.toFixed(2)),
          }))
          .sort(
            (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
          );

        setData(sortedData);
      } catch (error) {
        console.error("Error fetching growth data:", error);
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <Card className="bg-[#0b0b0b] border border-[#1f1f1f] rounded-2xl overflow-hidden">
      <CardHeader className="border-b border-[#1f1f1f]">
        <CardTitle className="text-lg font-semibold text-white">
          Growth Trends
          <span className="text-gray-400 block text-sm font-normal">
            User and revenue growth over time
          </span>
        </CardTitle>
      </CardHeader>

      <CardContent className="p-6">
        {loading ? (
          <motion.div
            className="flex justify-center items-center h-[250px] text-gray-500 text-sm"
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
          >
            Loading chart...
          </motion.div>
        ) : data.length === 0 ? (
          <motion.div
            className="flex flex-col justify-center items-center h-[250px] text-gray-500 text-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <motion.div
              className="w-10 h-10 mb-3 rounded-full border-2 border-[#FF2E2E]/40 flex items-center justify-center text-[#FF2E2E]"
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              📊
            </motion.div>
            <p>No trend data available yet.</p>
            <p className="text-gray-600 text-xs mt-1">
              Data will appear as users and payments accumulate.
            </p>
          </motion.div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data}>
              <CartesianGrid stroke="#1f1f1f" strokeDasharray="3 3" />
              <XAxis dataKey="date" stroke="#666" />
              <YAxis stroke="#666" />
              <Tooltip
                contentStyle={{
                  background: "#111",
                  border: "1px solid #333",
                  borderRadius: "8px",
                  color: "#fff",
                }}
              />
              <Line
                type="monotone"
                dataKey="users"
                stroke="#FF2E2E"
                strokeWidth={2}
                dot={false}
                name="Users"
              />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#FFD700"
                strokeWidth={2}
                dot={false}
                name="Revenue ($)"
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
