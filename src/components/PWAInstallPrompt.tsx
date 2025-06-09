"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { X, Download } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowInstallPrompt(true);
    };

    window.addEventListener("beforeinstallprompt", handler);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      setDeferredPrompt(null);
      setShowInstallPrompt(false);
    }
  };

  const handleDismiss = () => {
    setShowInstallPrompt(false);
  };

  if (!showInstallPrompt || !deferredPrompt) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 bg-white border border-gray-200 rounded-lg shadow-lg p-4 flex items-center justify-between max-w-md mx-auto">
      <div className="flex items-center space-x-3">
        <div className="bg-blue-100 p-2 rounded-full">
          <Download className="h-5 w-5 text-blue-600" />
        </div>
        <div>
          <h3 className="font-semibold text-sm">Install Sales App</h3>
          <p className="text-xs text-gray-600">
            Add to home screen for quick access
          </p>
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <Button
          onClick={handleInstallClick}
          size="sm"
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          Install
        </Button>
        <Button
          onClick={handleDismiss}
          size="sm"
          variant="ghost"
          className="p-1"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
