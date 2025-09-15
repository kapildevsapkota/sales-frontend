"use client";
import React from "react";
import { AlertCircle, Package, RefreshCw, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface TrackingErrorDisplayProps {
  error: string;
  trackingCode: string;
  isOrderNotFound?: boolean;
  onRetry?: () => void;
  onBack?: () => void;
  isLoading?: boolean;
}

export const TrackingErrorDisplay: React.FC<TrackingErrorDisplayProps> = ({
  error,
  trackingCode,
  isOrderNotFound = false,
  onRetry,
  onBack,
  isLoading = false,
}) => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="p-6 text-center">
          {/* Error Icon */}
          <div className="flex justify-center mb-4">
            {isOrderNotFound ? (
              <Package className="h-16 w-16 text-red-500" />
            ) : (
              <AlertCircle className="h-16 w-16 text-red-500" />
            )}
          </div>

          {/* Error Title */}
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            {isOrderNotFound ? "Order Not Found" : "Tracking Failed"}
          </h2>

          {/* Tracking Code Display */}
          <div className="bg-gray-100 rounded-lg p-3 mb-4">
            <p className="text-sm text-gray-600 mb-1">Tracking Code:</p>
            <p className="font-mono text-lg text-gray-900 break-all">
              {trackingCode}
            </p>
          </div>

          {/* Error Message */}
          <Alert variant="destructive" className="mb-6">
            <AlertDescription className="text-left">{error}</AlertDescription>
          </Alert>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            {onRetry && (
              <Button
                onClick={onRetry}
                disabled={isLoading}
                className="flex-1"
                variant="default"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Retrying...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Try Again
                  </>
                )}
              </Button>
            )}

            {onBack && (
              <Button onClick={onBack} variant="outline" className="flex-1">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Search
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
