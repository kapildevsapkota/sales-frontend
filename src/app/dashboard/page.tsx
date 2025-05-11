"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Role, useAuth } from "@/contexts/AuthContext";
import { motion } from "framer-motion";
import { Loader2, Briefcase, UserCircle2 } from "lucide-react";

export default function DashboardPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user) {
      const timer = setTimeout(() => {
        if (user.role === Role.SalesPerson) {
          router.push("/sales/dashboard");
        } else if (user.role === Role.SuperAdmin) {
          router.push("/admin");
        } else {
          router.push("/admin");
        }
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [isLoading, user, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-4 -left-4 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob" />
        <div className="absolute -bottom-8 right-4 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000" />
        <div className="absolute -top-1/4 left-1/3 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-8 w-full max-w-md mx-4"
      >
        <div className="flex flex-col items-center space-y-6">
          {/* Icon Animation */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{
              type: "spring",
              stiffness: 260,
              damping: 20,
              delay: 0.2,
            }}
            className="relative"
          >
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              {user?.role === Role.SalesPerson ? (
                <UserCircle2 className="w-12 h-12 text-white" />
              ) : (
                <Briefcase className="w-12 h-12 text-white" />
              )}
            </div>
            <motion.div
              animate={{
                rotate: 360,
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "linear",
              }}
              className="absolute -top-2 -right-2"
            >
              <div className="w-6 h-6 rounded-full bg-green-400 flex items-center justify-center">
                <Loader2 className="w-4 h-4 text-white" />
              </div>
            </motion.div>
          </motion.div>

          {/* Welcome Text */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-center space-y-2"
          >
            <h1 className="text-2xl font-bold text-gray-800">
              Welcome, {user?.first_name} {user?.last_name}!
            </h1>
            <p className="text-gray-600">
              Redirecting you to your {user?.role} dashboard
            </p>
          </motion.div>

          {/* Progress Bar */}
          <motion.div
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: 2, ease: "easeInOut" }}
            className="w-full h-1 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"
          />

          {/* Loading Text */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-sm text-gray-500"
          >
            Setting up your personalized dashboard...
          </motion.p>
        </div>
      </motion.div>
    </div>
  );
}
