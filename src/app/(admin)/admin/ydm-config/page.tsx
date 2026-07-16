"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Key, CheckCircle, AlertCircle } from "lucide-react";
import { fetchYdmConfig, saveYdmConfig, type YDMLogisticsRecord } from "./actions";


export default function YdmConfigPage() {
  const [record, setRecord] = useState<YDMLogisticsRecord | undefined>(
    undefined
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState("");

  const loadConfig = async () => {
    setIsLoading(true);
    setError(null);
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("accessToken")
        : null;

    const result = await fetchYdmConfig(token);
    if (result.error) {
      setError(result.error);
    } else {
      setRecord(result.data);
      if (result.data?.api_key) {
        setApiKey(result.data.api_key);
      }
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadConfig();
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(null);

    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("accessToken")
        : null;

    const result = await saveYdmConfig({
      apiKey,
      recordId: record?.id,
      token,
    });

    if (result.error) {
      setSubmitError(result.error);
    } else {
      setSubmitSuccess("YDM Logistics API key saved successfully.");
      await loadConfig();
    }

    setIsSubmitting(false);
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

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400">Error: {error}</p>
        </div>
      </div>
    );
  }

  const isConfigured = !!record?.api_key;

  return (
    <div className="container mx-auto p-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">YDM Logistics Configuration</h1>

        {/* Status Badge */}
        <div className="mb-6 flex items-center gap-2">
          {isConfigured ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">
              <CheckCircle className="h-4 w-4" />
              Connected
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-yellow-100 px-3 py-1 text-sm font-medium text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">
              <AlertCircle className="h-4 w-4" />
              Not Configured
            </span>
          )}
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4">API Key Settings</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                YDM Logistics API Key
              </label>
              <div className="relative">
                <Key className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  className="pl-10 font-mono text-sm"
                  placeholder="Enter your YDM Logistics API key"
                  value={apiKey}
                  onChange={(e) => {
                    setApiKey(e.target.value);
                    setSubmitSuccess(null);
                  }}
                  required
                />
              </div>
              <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
                Your API key is used to authenticate requests to YDM Logistics.
              </p>
            </div>

            {submitError && (
              <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/30 dark:text-red-200">
                {submitError}
              </div>
            )}

            {submitSuccess && (
              <div className="rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-700 dark:border-green-800 dark:bg-green-900/30 dark:text-green-400">
                {submitSuccess}
              </div>
            )}

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-t-2 border-b-2 border-white rounded-full animate-spin" />
                  <span>Saving...</span>
                </div>
              ) : isConfigured ? (
                "Update API Key"
              ) : (
                "Save API Key"
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}

