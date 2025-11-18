"use client";

import { useEffect, useState } from "react";
import { AxiosError } from "axios";
import { Key, Shield } from "lucide-react";

import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface PicknDropCredential {
  id: number;
  email: string | null;
  password: string | null;
  client_key: string | null;
  client_secret: string | null;
  created_at: string;
  updated_at: string;
  franchise: number | null;
}

interface PicknDropFormData {
  client_key: string;
  client_secret: string;
}

type PicknDropFetchResponse = PicknDropCredential[];

type PicknDropSaveResponse = {
  message?: string;
  error?: string;
} & Partial<PicknDropCredential>;

export default function PicknDropConfigPage() {
  const [data, setData] = useState<PicknDropCredential | null>(null);
  const [formData, setFormData] = useState<PicknDropFormData>({
    client_key: "",
    client_secret: "",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [statusError, setStatusError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fetchPicknDropStatus = async () => {
    try {
      setIsLoading(true);
      setStatusError(null);
      const response = await api.get<PicknDropFetchResponse>("/api/pickndrop/");
      setData(response.data[0] ?? null);
    } catch (err) {
      setStatusError(
        err instanceof Error
          ? err.message
          : "Failed to fetch Pick & Drop credentials"
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPicknDropStatus();
  }, []);

  useEffect(() => {
    if (data) {
      setFormData({
        client_key: data.client_key ?? "",
        client_secret: data.client_secret ?? "",
      });
    }
  }, [data]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);
    setSuccessMessage(null);

    try {
      const payload: PicknDropFormData = {
        client_key: formData.client_key.trim(),
        client_secret: formData.client_secret.trim(),
      };

      const response = await api.post<PicknDropSaveResponse>(
        "/api/pickndrop/",
        payload
      );
      const message =
        response.data.message || "Credentials saved successfully.";
      setSuccessMessage(message);
      await fetchPicknDropStatus();
    } catch (err) {
      if (err instanceof AxiosError && err.response?.data) {
        const errorData = err.response.data as PicknDropSaveResponse;
        setSubmitError(
          errorData.error ||
            errorData.message ||
            "Failed to update Pick & Drop credentials"
        );
      } else {
        setSubmitError(
          err instanceof Error
            ? err.message
            : "Failed to update Pick & Drop credentials"
        );
      }
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

  if (statusError) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400">Error: {statusError}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Pick & Drop Configuration</h1>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4">
            Client Credentials Setup
          </h2>

          {successMessage && (
            <div className="mb-4 rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-700 dark:border-green-800 dark:bg-green-900/30 dark:text-green-200">
              {successMessage}
            </div>
          )}

          {submitError && (
            <div className="mb-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/30 dark:text-red-200">
              {submitError}
            </div>
          )}

          {!data?.client_key || !data?.client_secret ? (
            <div className="mb-6 rounded-md border border-yellow-200 bg-yellow-50 p-3 text-sm text-yellow-700 dark:border-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200">
              Provide the client key and secret to enable Pick & Drop
              integrations.
            </div>
          ) : (
            <div className="mb-6 rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800 dark:border-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-200">
              Pick & Drop credentials are currently configured.
            </div>
          )}

          {data?.client_key || data?.client_secret ? (
            <div className="mb-6 grid gap-4 sm:grid-cols-2">
              {data?.client_key && (
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm dark:border-gray-700 dark:bg-gray-900">
                  <p className="mb-1 font-medium text-gray-700 dark:text-gray-200">
                    Current Client Key
                  </p>
                  <code className="break-all text-gray-900 dark:text-gray-100">
                    {data.client_key}
                  </code>
                </div>
              )}
              {data?.client_secret && (
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm dark:border-gray-700 dark:bg-gray-900">
                  <p className="mb-1 font-medium text-gray-700 dark:text-gray-200">
                    Current Client Secret
                  </p>
                  <code className="break-all text-gray-900 dark:text-gray-100">
                    {data.client_secret}
                  </code>
                </div>
              )}
            </div>
          ) : null}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Client Key
              </label>
              <div className="relative">
                <Key className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  className="pl-10"
                  placeholder="Enter client key"
                  value={formData.client_key}
                  onChange={(event) =>
                    setFormData({
                      ...formData,
                      client_key: event.target.value,
                    })
                  }
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Client Secret
              </label>
              <div className="relative">
                <Shield className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  type="password"
                  className="pl-10"
                  placeholder="Enter client secret"
                  value={formData.client_secret}
                  onChange={(event) =>
                    setFormData({
                      ...formData,
                      client_secret: event.target.value,
                    })
                  }
                  required
                />
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-t-2 border-b-2 border-white rounded-full animate-spin" />
                  <span>Saving...</span>
                </div>
              ) : (
                "Save Credentials"
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
