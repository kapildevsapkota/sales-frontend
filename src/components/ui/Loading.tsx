import React from "react";
import { Loader2 } from "lucide-react";

export const Loading: React.FC = () => {
  return (
    <div className="flex items-center justify-center h-screen">
      <Loader2 className="mr-2 h-8 w-8 animate-spin" />
      <span className="text-xl font-semibold">Loading...</span>
    </div>
  );
};
