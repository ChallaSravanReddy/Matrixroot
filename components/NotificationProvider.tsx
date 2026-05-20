"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

export type NotificationType = "success" | "error" | "info";

export interface Notification {
  id: string;
  message: string;
  type: NotificationType;
  duration?: number;
}

interface NotificationContextType {
  showNotification: (message: string, type?: NotificationType, duration?: number) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const showNotification = (message: string, type: NotificationType = "info", duration = 4000) => {
    const id = Math.random().toString(36).substring(2, 9);
    setNotifications((prev) => [...prev, { id, message, type, duration }]);

    setTimeout(() => {
      dismissNotification(id);
    }, duration);
  };

  const dismissNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  // Intercept standard window.alert calls client-side
  useEffect(() => {
    if (typeof window !== "undefined") {
      const originalAlert = window.alert;
      
      window.alert = (message: string) => {
        // Simple classification based on typical keywords
        const lower = message.toLowerCase();
        let type: NotificationType = "info";
        if (lower.includes("success") || lower.includes("unlocked") || lower.includes("certified") || lower.includes("approved")) {
          type = "success";
        } else if (lower.includes("fail") || lower.includes("decline") || lower.includes("error") || lower.includes("offline")) {
          type = "error";
        }
        
        showNotification(message, type);
      };

      return () => {
        window.alert = originalAlert;
      };
    }
  }, []);

  return (
    <NotificationContext.Provider value={{ showNotification }}>
      {children}
      
      {/* Top Floating Notification Container */}
      <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[99999] flex flex-col items-center gap-3 w-full max-w-[420px] px-4 pointer-events-none">
        <AnimatePresence mode="popLayout">
          {notifications.map((notification) => {
            const isSuccess = notification.type === "success";
            const isError = notification.type === "error";

            // Premium Colors & Borders based on type
            let bgStyles = "bg-white/95 border-[#8B4513]/10";
            let textStyles = "text-[#3D2B1F]";
            let iconColor = "text-[#8B4513]";
            let borderStyles = "border";

            if (isSuccess) {
              bgStyles = "bg-emerald-50/95 border-emerald-500/20";
              textStyles = "text-emerald-900";
              iconColor = "text-emerald-600";
            } else if (isError) {
              bgStyles = "bg-rose-50/95 border-rose-500/20";
              textStyles = "text-rose-900";
              iconColor = "text-rose-600";
            }

            return (
              <motion.div
                key={notification.id}
                layout
                initial={{ opacity: 0, y: -20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -15, scale: 0.95, transition: { duration: 0.15 } }}
                transition={{ type: "spring", stiffness: 450, damping: 30 }}
                className={`w-full ${bgStyles} ${borderStyles} ${textStyles} rounded-xl shadow-lg shadow-black/5 backdrop-blur-md p-4 flex items-start gap-3 pointer-events-auto`}
              >
                <div className="mt-0.5 shrink-0">
                  {isSuccess ? (
                    <CheckCircle2 className={`w-5 h-5 ${iconColor}`} />
                  ) : isError ? (
                    <AlertCircle className={`w-5 h-5 ${iconColor}`} />
                  ) : (
                    <Info className={`w-5 h-5 ${iconColor}`} />
                  )}
                </div>

                <div className="flex-1 text-xs font-semibold leading-relaxed break-words">
                  {notification.message}
                </div>

                <button
                  onClick={() => dismissNotification(notification.id)}
                  className="mt-0.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotification must be used within a NotificationProvider");
  }
  return context;
}
