"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { useAnimation } from "framer-motion";
import { collection, query, where, getDocs, writeBatch } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { useRealtimeCollection } from "@/hooks/use-realtime-collection";
import { useToast } from "@/hooks/use-toast";

interface Message {
  id: string;
  userId: string;
  sender: "admin" | "user";
  text: string;
  timestamp: any;
  read?: boolean;
  senderId?: string;
}

interface UseChatNotificationsOptions {
  userId: string | null;
  isOpen: boolean;
  enabled?: boolean;
}

interface UseChatNotificationsReturn {
  unreadCount: number;
  muted: boolean;
  showRipple: boolean;
  controls: ReturnType<typeof useAnimation>;
  toggleMute: () => void;
  markMessagesAsRead: () => Promise<void>;
  triggerBounce: () => void;
}

export function useChatNotifications({
  userId,
  isOpen,
  enabled = true,
}: UseChatNotificationsOptions): UseChatNotificationsReturn {
  const { toast } = useToast();
  const [muted, setMuted] = useState(false);
  const [showRipple, setShowRipple] = useState(false);
  const prevCountRef = useRef(0);
  const hasUserInteracted = useRef(false);
  const controls = useAnimation();

  // Load mute preference from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("mm_chat_muted");
    if (saved === "true") {
      setMuted(true);
    }
  }, []);

  // Track user interaction for autoplay permissions
  useEffect(() => {
    const handleInteraction = () => {
      hasUserInteracted.current = true;
    };
    
    window.addEventListener("click", handleInteraction, { once: true });
    window.addEventListener("touchstart", handleInteraction, { once: true });
    
    return () => {
      window.removeEventListener("click", handleInteraction);
      window.removeEventListener("touchstart", handleInteraction);
    };
  }, []);

  // Query for unread admin messages
  const unreadMessagesQuery = useMemo(() => {
    if (!userId || !enabled) return null;
    return query(
      collection(db, "messages"),
      where("userId", "==", userId),
      where("sender", "==", "admin"),
      where("read", "==", false)
    );
  }, [userId, enabled]);

  const { data: unreadMessages, error: unreadError } = useRealtimeCollection<Message>(
    unreadMessagesQuery,
    { enabled: !!userId && enabled }
  );

  // Handle case where index might not exist - fallback to 0
  const unreadCount = unreadError?.code === "failed-precondition" ? 0 : (unreadMessages?.length || 0);

  // Play ping sound (using Web Audio API for reliability)
  const playPingSound = () => {
    try {
      // Check if sound is muted in localStorage
      const soundMuted = localStorage.getItem("mm_chat_muted") === "true";
      if (soundMuted) return;

      // Only play if user has interacted (for autoplay permissions)
      if (!hasUserInteracted.current) return;

      // Try to play sound file first, fallback to Web Audio API
      const audio = new Audio("/sounds/new-message.mp3");
      audio.volume = 0.3;
      
      audio.play().catch(() => {
        // Fallback: Generate ping sound using Web Audio API
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = 800;
        oscillator.type = "sine";
        
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.1);
      });
    } catch (error) {
      // Silently fail if audio is not available
      console.debug("Audio notification unavailable:", error);
    }
  };

  // Watch for new messages and trigger bounce animation
  useEffect(() => {
    if (unreadCount > prevCountRef.current && prevCountRef.current >= 0) {
      // Only trigger if chat is closed
      if (!isOpen) {
        // Trigger bounce animation
        controls.start({
          scale: [1, 1.2, 0.95, 1.05, 1],
          transition: { duration: 0.5, ease: "easeInOut" },
        });

        // Show ripple effect
        setShowRipple(true);
        setTimeout(() => setShowRipple(false), 600);

        // Play ping sound
        playPingSound();

        // Show toast
        toast({
          title: "New message from your coach 🥗",
          description: "You have a new message waiting for you.",
          duration: 5000,
        });
      }
    }
    prevCountRef.current = unreadCount;
  }, [unreadCount, isOpen, controls, toast]);

  // Trigger bounce manually (for external use if needed)
  const triggerBounce = () => {
    if (unreadCount > 0 && !isOpen) {
      controls.start({
        scale: [1, 1.2, 0.95, 1.05, 1],
        transition: { duration: 0.5, ease: "easeInOut" },
      });
      setShowRipple(true);
      setTimeout(() => setShowRipple(false), 600);
      playPingSound();
    }
  };

  // Mark all messages as read when chat opens
  const markMessagesAsRead = async () => {
    if (!userId || unreadCount === 0) return;

    try {
      const messagesRef = collection(db, "messages");
      const q = query(
        messagesRef,
        where("userId", "==", userId),
        where("sender", "==", "admin"),
        where("read", "==", false)
      );
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) return;
      
      // Use batch write for atomic updates
      const batch = writeBatch(db);
      querySnapshot.forEach((docSnapshot) => {
        batch.update(docSnapshot.ref, { read: true });
      });
      
      await batch.commit();
    } catch (error) {
      console.error("Error marking messages as read:", error);
    }
  };

  // Auto-mark messages as read when chat opens
  useEffect(() => {
    if (isOpen && userId && unreadCount > 0) {
      markMessagesAsRead();
    }
  }, [isOpen, userId, unreadCount]);

  // Toggle mute notifications
  const toggleMute = () => {
    const newMutedState = !muted;
    setMuted(newMutedState);
    localStorage.setItem("mm_chat_muted", String(newMutedState));
    
    // Show toast confirmation
    toast({
      title: newMutedState ? "🔇 Notifications muted" : "🔔 Notifications enabled",
      description: newMutedState 
        ? "You won't hear sound notifications for new messages."
        : "You'll hear sound notifications for new messages.",
      duration: 3000,
    });
  };

  return {
    unreadCount,
    muted,
    showRipple,
    controls,
    toggleMute,
    markMessagesAsRead,
    triggerBounce,
  };
}

