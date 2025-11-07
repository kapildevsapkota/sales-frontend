"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { dashLogin } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, Lock } from "lucide-react";
import { AxiosError } from "axios";

interface DashStatusResponse {
  message?: string;
  email?: string;
  error?: string;
}

interface DashLoginFormData {
  email: string;
  password: string;
}

export default function DashConfigPage() {
  const [data, setData] = useState<DashStatusResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [formData, setFormData] = useState<DashLoginFormData>({
    email: "",
    password: "",
  });

  const fetchDashStatus = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await api.get<DashStatusResponse>(
        "/api/dash/dash-status/"
      );
      setData(response.data);
    } catch (err) {
      // Check if error response contains "Dash credentials not found"
      if (err instanceof AxiosError && err.response?.data) {
        const errorData = err.response.data as DashStatusResponse;
        if (errorData.error === "Dash credentials not found.") {
          // Set data with error - form will still display
          setData({ error: errorData.error });
          return;
        }
      }
      // Only set error for non-credentials-not-found errors
      setError(
        err instanceof Error ? err.message : "Failed to fetch dash status"
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashStatus();
  }, []);

  // Update form email when data is loaded
  useEffect(() => {
    if (data?.email && !data.error) {
      setFormData((prev) => ({ ...prev, email: data.email || "" }));
    }
  }, [data]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setLoginError(null);
    const token = localStorage.getItem("accessToken");

    try {
      const result = await dashLogin({
        email: formData.email,
        password: formData.password,
        token: token || null,
      });
      if (result.error) {
        setLoginError(result.error);
      } else {
        // Refresh the status after successful login
        await fetchDashStatus();
        // Clear only password, email will be populated from fetchDashStatus response
        setFormData((prev) => ({ ...prev, password: "" }));
      }
    } catch (err) {
      setLoginError(
        err instanceof Error ? err.message : "An unexpected error occurred"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-gray-100 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  // Show error only if it's not the "credentials not found" error
  if (error && data?.error !== "Dash credentials not found.") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400">Error: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Dash Configuration</h1>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4">Dash Account Login</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  type="email"
                  className="pl-10"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  type="password"
                  className="pl-10"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  required
                />
              </div>
            </div>
            {loginError && (
              <div className="text-red-600 dark:text-red-400 text-sm">
                {loginError}
              </div>
            )}
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-t-2 border-b-2 border-white rounded-full animate-spin" />
                  <span>Logining...</span>
                </div>
              ) : (
                "Login"
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
