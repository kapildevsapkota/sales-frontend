"use client";

import { useState } from "react";
import { Building2, ChevronDown, Loader2, Check } from "lucide-react";
import { useAuth, Role } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

interface Franchise {
  id: number;
  name: string;
  short_form: string | null;
  distributor: number;
}

// Hardcoded franchises allowed for switching (only Lagankhel and Jhamsikhel)
const HARDCODED_FRANCHISES: Franchise[] = [
  {
    id: 2,
    name: "Lagankhel Franchise",
    short_form: "LF",
    distributor: 2
  },
  {
    id: 20,
    name: "Yachu Jhamsikhel",
    short_form: null,
    distributor: 20
  }
];

interface FranchiseSwitcherProps {
  className?: string;
}

export function FranchiseSwitcher({ className }: FranchiseSwitcherProps) {
  const { user, switchFranchise } = useAuth();
  const [isSwitching, setIsSwitching] = useState<number | null>(null);

  if (!user || user.role !== Role.Franchise) {
    return null;
  }

  const currentFranchiseId = Number(user.franchise_id);

  // Find the currently active franchise
  const activeFranchise = HARDCODED_FRANCHISES.find(
    (f) => Number(f.id) === currentFranchiseId
  ) || {
    id: currentFranchiseId,
    name: user.franchise_name || "Current Franchise",
  };

  // Only display the other franchise in the dropdown options
  const switchableFranchises = HARDCODED_FRANCHISES.filter(
    (f) => Number(f.id) !== currentFranchiseId
  );

  const handleSwitch = async (franchiseId: number) => {
    if (Number(franchiseId) === currentFranchiseId) return;

    setIsSwitching(franchiseId);
    const targetFranchise = HARDCODED_FRANCHISES.find((f) => f.id === franchiseId);
    const toastId = toast.loading(
      `Switching context to ${targetFranchise?.name || "new franchise"}...`
    );

    try {
      await switchFranchise(franchiseId);
      toast.success(
        `Switched to ${targetFranchise?.name || "new franchise"} successfully!`,
        { id: toastId }
      );
      
      // Redirect to main admin dashboard to ensure state updates
      window.location.href = "/admin";
    } catch (error) {
      console.error("Failed to switch franchise:", error);
      toast.error("Failed to switch franchise. Please try again.", {
        id: toastId,
      });
      setIsSwitching(null);
    }
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className="flex h-10 items-center justify-between gap-2 px-3 border-gray-200 hover:bg-gray-50 bg-white shadow-sm transition-all duration-200 min-w-[200px] max-w-[280px]"
            disabled={isSwitching !== null}
          >
            <div className="flex items-center gap-2 text-left truncate">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 flex-shrink-0">
                <Building2 className="h-4 w-4" />
              </div>
              <div className="flex flex-col truncate">
                <span className="text-[10px] text-gray-600 leading-none mb-0.5">
                  Franchise
                </span>
                <span className="text-xs font-semibold text-gray-700 dark:text-gray-200 truncate">
                  {activeFranchise.name}
                </span>
              </div>
            </div>
            <ChevronDown className="h-4 w-4 text-gray-400 flex-shrink-0 ml-1" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-[240px] p-1.5 shadow-lg border border-gray-100 rounded-xl">
          <div className="px-2 py-1.5 mb-1 border-b border-gray-50">
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
              Switch Franchise
            </p>
          </div>
          {switchableFranchises.length === 0 ? (
            <div className="px-2 py-2 text-xs text-gray-400 text-center">
              No other franchises available
            </div>
          ) : (
            switchableFranchises.map((franchise) => {
              const isTargetSwitching = isSwitching === franchise.id;

              return (
                <DropdownMenuItem
                  key={franchise.id}
                  onClick={() => handleSwitch(franchise.id)}
                  disabled={isSwitching !== null}
                  className="flex items-center justify-between px-2.5 py-2 rounded-lg cursor-pointer transition-colors duration-150 focus:bg-gray-50 my-0.5"
                >
                  <div className="flex items-center gap-2 truncate">
                    <Building2 className="h-4 w-4 text-gray-400" />
                    <span className="text-xs text-gray-700 font-medium truncate">
                      {franchise.name}
                    </span>
                  </div>
                  {isTargetSwitching && (
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-blue-600 flex-shrink-0" />
                  )}
                </DropdownMenuItem>
              );
            })
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
