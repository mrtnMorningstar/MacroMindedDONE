"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, Shield, UserPlus, Mail } from "lucide-react";
import { collection, onSnapshot, doc, updateDoc, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/auth-context";
import { Modal } from "@/components/admin/shared/modal";

interface User {
  id: string;
  name?: string;
  email?: string;
  role?: string;
}

type Role = "user" | "admin" | "manager" | "support";

export function RoleManagement() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [newRole, setNewRole] = useState<Role>("user");
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<Role>("admin");
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [loading, setLoading] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "users"), (snapshot) => {
      setUsers(snapshot.docs.map((d) => ({ id: d.id, ...(d.data() as User) })));
    });
    return () => unsubscribe();
  }, []);

  const handleRoleChange = (user: User, newRole: Role) => {
    setSelectedUser(user);
    setNewRole(newRole);
    
    // If downgrading an admin, show confirmation
    if (user.role === "admin" && newRole !== "admin") {
      setConfirmModalOpen(true);
    } else {
      updateRole(user, newRole);
    }
  };

  const updateRole = async (user: User, role: Role) => {
    setLoading(user.id);
    try {
      await updateDoc(doc(db, "users", user.id), {
        role,
        updatedAt: new Date().toISOString(),
      });

      // Log admin action
      const { logAdminAction } = await import("@/lib/utils/admin-logger");
      await logAdminAction({
        action: `Role changed: ${user.email} → ${role}`,
        user: currentUser?.email || "Unknown",
        userId: currentUser?.uid,
        type: "role_change",
        details: `Changed ${user.name || user.email} from ${user.role || "user"} to ${role}`,
      });

      toast({
        title: "Role Updated",
        description: `${user.name || user.email}'s role changed to ${role}.`,
      });

      setConfirmModalOpen(false);
      setSelectedUser(null);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update role.",
        variant: "destructive",
      });
    } finally {
      setLoading(null);
    }
  };

  const handleInvite = async () => {
    if (!inviteEmail.trim()) {
      toast({
        title: "Error",
        description: "Please enter an email address.",
        variant: "destructive",
      });
      return;
    }

    setLoading("invite");
    try {
      // In a real app, you'd send an invite email via Resend
      // For now, we'll just show a success message
      toast({
        title: "Invite Sent",
        description: `Admin invite sent to ${inviteEmail}`,
      });

      setInviteEmail("");
      setInviteModalOpen(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to send invite.",
        variant: "destructive",
      });
    } finally {
      setLoading(null);
    }
  };

  const roles: { value: Role; label: string; color: string }[] = [
    { value: "user", label: "User", color: "text-gray-400" },
    { value: "support", label: "Support", color: "text-blue-400" },
    { value: "manager", label: "Manager", color: "text-yellow-400" },
    { value: "admin", label: "Admin", color: "text-[#FF2E2E]" },
  ];

  const filteredUsers = users.filter((u) => u.email); // Only show users with emails

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[#151515] border border-[#222] rounded-2xl p-6 shadow-lg backdrop-blur-sm"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-[#FF2E2E]/10 border border-[#FF2E2E]/20">
            <Shield className="h-5 w-5 text-[#FF2E2E]" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-white">Role Management</h2>
            <p className="text-xs text-gray-400">Manage user access levels</p>
          </div>
        </div>
        <button
          onClick={() => setInviteModalOpen(true)}
          className="px-4 py-2 rounded-lg bg-[#FF2E2E] hover:bg-[#FF2E2E]/90 text-white transition-colors flex items-center gap-2"
        >
          <UserPlus className="h-4 w-4" />
          Invite Admin
        </button>
      </div>

      <div className="space-y-3 max-h-[500px] overflow-y-auto">
        {filteredUsers.map((user, index) => {
          const currentRole = (user.role || "user") as Role;
          const isCurrentUser = user.id === currentUser?.uid;

          return (
            <motion.div
              key={user.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="p-4 rounded-lg bg-[#1a1a1a] border border-[#222] hover:border-[#FF2E2E]/50 transition-all"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-white font-medium">{user.name || "No Name"}</p>
                  <p className="text-sm text-gray-400">{user.email}</p>
                  {isCurrentUser && (
                    <span className="text-xs text-[#FF2E2E] mt-1">(You)</span>
                  )}
                </div>
                <select
                  value={currentRole}
                  onChange={(e) => handleRoleChange(user, e.target.value as Role)}
                  disabled={loading === user.id || isCurrentUser}
                  className="px-3 py-2 rounded-lg bg-[#0a0a0a] border border-[#222] text-white focus:outline-none focus:border-[#FF2E2E] focus:ring-1 focus:ring-[#FF2E2E] transition-colors disabled:opacity-50"
                >
                  {roles.map((role) => (
                    <option key={role.value} value={role.value}>
                      {role.label}
                    </option>
                  ))}
                </select>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Confirmation Modal */}
      <Modal
        open={confirmModalOpen}
        onClose={() => {
          setConfirmModalOpen(false);
          setSelectedUser(null);
        }}
        title="Confirm Role Change"
      >
        <div className="space-y-4">
          <p className="text-gray-300">
            Are you sure you want to downgrade <span className="text-white font-semibold">{selectedUser?.name || selectedUser?.email}</span> from Admin?
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => {
                setConfirmModalOpen(false);
                setSelectedUser(null);
              }}
              className="flex-1 px-4 py-2 rounded-lg bg-[#222] hover:bg-[#333] text-white transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => selectedUser && updateRole(selectedUser, newRole)}
              className="flex-1 px-4 py-2 rounded-lg bg-[#FF2E2E] hover:bg-[#FF2E2E]/90 text-white transition-colors"
            >
              Confirm
            </button>
          </div>
        </div>
      </Modal>

      {/* Invite Modal */}
      <Modal
        open={inviteModalOpen}
        onClose={() => {
          setInviteModalOpen(false);
          setInviteEmail("");
        }}
        title="Invite Admin"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Email Address</label>
            <input
              type="email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="admin@example.com"
              className="w-full px-4 py-2 bg-[#0a0a0a] border border-[#222] rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:border-[#FF2E2E] focus:ring-1 focus:ring-[#FF2E2E]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Role</label>
            <select
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value as Role)}
              className="w-full px-4 py-2 bg-[#0a0a0a] border border-[#222] rounded-lg text-white focus:outline-none focus:border-[#FF2E2E] focus:ring-1 focus:ring-[#FF2E2E]"
            >
              {roles.filter((r) => r.value !== "user").map((role) => (
                <option key={role.value} value={role.value}>
                  {role.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex gap-3 pt-4">
            <button
              onClick={() => {
                setInviteModalOpen(false);
                setInviteEmail("");
              }}
              className="flex-1 px-4 py-2 rounded-lg bg-[#222] hover:bg-[#333] text-white transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleInvite}
              disabled={loading === "invite"}
              className="flex-1 px-4 py-2 rounded-lg bg-[#FF2E2E] hover:bg-[#FF2E2E]/90 text-white transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading === "invite" ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                  Sending...
                </>
              ) : (
                <>
                  <Mail className="h-4 w-4" />
                  Send Invite
                </>
              )}
            </button>
          </div>
        </div>
      </Modal>
    </motion.div>
  );
}

