"use client";

import { Suspense, useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { ErrorBoundary } from "@/components/admin/shared/error-boundary";
import { SkeletonTable } from "@/components/admin/shared/skeleton";
import { fadeUp, transition } from "@/components/admin/shared/motion";
import { UserFilters } from "@/components/admin/users/user-filters";
import { UserTable } from "@/components/admin/users/user-table";
import { UserDrawer } from "@/components/admin/users/user-drawer";
import { PlanUploadModal } from "@/components/admin/users/plan-upload-modal";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase/config";

interface User {
  id: string;
  name?: string;
  email?: string;
  planType?: string;
  planStatus?: string;
  lastActive?: any;
  isOnline?: boolean;
  role?: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [planTypeFilter, setPlanTypeFilter] = useState("all");
  const [showActiveOnly, setShowActiveOnly] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Real-time users listener
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "users"), (snapshot) => {
      const usersList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as User),
      }));
      setUsers(usersList);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Filter users
  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      // Search filter
      if (searchTerm) {
        const search = searchTerm.toLowerCase();
        const matchesSearch =
          (user.name || "").toLowerCase().includes(search) ||
          (user.email || "").toLowerCase().includes(search);
        if (!matchesSearch) return false;
      }

      // Status filter
      if (statusFilter !== "all") {
        const normalizedStatus = (user.planStatus || "pending").toLowerCase();
        const normalizedFilter = statusFilter.toLowerCase();
        if (normalizedStatus !== normalizedFilter) return false;
      }

      // Plan type filter
      if (planTypeFilter !== "all") {
        if (user.planType !== planTypeFilter) return false;
      }

      // Active only filter
      if (showActiveOnly && !user.isOnline) return false;

      return true;
    });
  }, [users, searchTerm, statusFilter, planTypeFilter, showActiveOnly]);

  return (
    <ErrorBoundary>
      <motion.div
        initial={fadeUp.hidden}
        animate={fadeUp.show}
        transition={transition}
        className="space-y-6"
      >
        {/* Header */}
        <motion.div
          initial={fadeUp.hidden}
          animate={fadeUp.show}
          transition={{ ...transition, delay: 0.1 }}
        >
          <h1 className="text-3xl font-bold text-white mb-2">
            User <span className="text-[#FF2E2E]">Management</span>
          </h1>
          <p className="text-gray-400">
            Manage users, roles, and meal plan assignments.
          </p>
        </motion.div>

        {/* Filters */}
        <Suspense fallback={<div className="h-20 bg-[#151515] rounded-2xl animate-pulse" />}>
          <UserFilters
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            planTypeFilter={planTypeFilter}
            onPlanTypeFilterChange={setPlanTypeFilter}
            showActiveOnly={showActiveOnly}
            onActiveOnlyChange={setShowActiveOnly}
          />
        </Suspense>

        {/* User Table */}
        {loading ? (
          <SkeletonTable />
        ) : (
          <Suspense fallback={<SkeletonTable />}>
            <UserTable
              users={filteredUsers}
              onOpenChat={(user) => {
                setSelectedUser(user);
                setDrawerOpen(true);
              }}
              onOpenUpload={(user) => {
                setSelectedUser(user);
                setUploadModalOpen(true);
              }}
            />
          </Suspense>
        )}

        {/* Drawer & Modal */}
        {selectedUser && (
          <>
            <UserDrawer
              user={selectedUser}
              open={drawerOpen}
              onClose={() => {
                setDrawerOpen(false);
                setSelectedUser(null);
              }}
            />
            <PlanUploadModal
              open={uploadModalOpen}
              onOpenChange={(open) => {
                setUploadModalOpen(open);
                if (!open) setSelectedUser(null);
              }}
              user={selectedUser}
              onSuccess={() => {
                setUploadModalOpen(false);
                setSelectedUser(null);
              }}
            />
          </>
        )}
      </motion.div>
    </ErrorBoundary>
  );
}
