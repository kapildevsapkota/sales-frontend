"use client";

import { useState } from "react";
import { LogOut, ChevronDown, Settings, Settings2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

interface UserProfileDropdownProps {
  className?: string;
  variant?: "default" | "compact";
}

export function UserProfileDropdown({
  className,
  variant = "default",
}: UserProfileDropdownProps) {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  if (!user) {
    return null;
  }

  const handleLogout = () => {
    localStorage.clear();
    logout();
    router.push("/login");
  };

  const handleChangePassword = () => {
    router.push("/change-password");
  };

  const handleFestConfig = () => {
    router.push("/admin/fest-config");
  };

  const getUserInitials = () => {
    const firstName = user.first_name || "";
    const lastName = user.last_name || "";
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const getUserDisplayName = () => {
    if (user.first_name && user.last_name) {
      return `${user.first_name} ${user.last_name}`;
    }
    return user.username || user.email;
  };

  if (variant === "compact") {
    return (
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "flex items-center gap-2 h-8 px-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800",
              className
            )}
          >
            <Avatar className="h-6 w-6">
              {/* <AvatarImage src="/image.png" alt={getUserDisplayName()} /> */}
              <AvatarFallback className="text-xs">
                {getUserInitials()}
              </AvatarFallback>
            </Avatar>
            <ChevronDown className="h-3 w-3 text-gray-500 dark:text-gray-400" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <div className="flex items-center gap-2 p-2">
            <Avatar className="h-8 w-8">
              {/* <AvatarImage src="/image.png" alt={getUserDisplayName()} /> */}
              <AvatarFallback className="text-sm">
                {getUserInitials()}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {getUserDisplayName()}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {user.email}
              </p>
            </div>
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleChangePassword}>
            <Settings className="mr-2 h-4 w-4" />
            <span>Change Password</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleFestConfig}>
            <Settings className="mr-2 h-4 w-4" />
            <span>Fest Config</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={handleLogout}
            className="text-red-600 dark:text-red-400"
          >
            <LogOut className="mr-2 h-4 w-4" />
            <span>Logout</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className={cn(
            "flex items-center gap-3 h-10 px-3 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800",
            className
          )}
        >
          <Avatar className="h-8 w-8">
            {/* <AvatarImage src="/image.png" alt={getUserDisplayName()} /> */}
            <AvatarFallback className="text-sm">
              {getUserInitials()}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col items-start">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {getUserDisplayName()}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {user.role}
            </span>
          </div>
          <ChevronDown className="h-4 w-4 text-gray-500 dark:text-gray-400" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <div className="flex items-center gap-3 p-3">
          <Avatar className="h-10 w-10">
            {/* <AvatarImage src="/image.png" alt={getUserDisplayName()} /> */}
            <AvatarFallback>{getUserInitials()}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {getUserDisplayName()}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {user.email}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {user.role}
            </p>
          </div>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleChangePassword}
          className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <Settings className="mr-2 h-4 w-4" />
          <span className="cursor-pointer">Change Password</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleFestConfig}>
          <Settings2 className="mr-2 h-4 w-4" />
          <span>Fest Config</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleLogout}
          className="text-red-600 dark:text-red-400 cursor-pointer hover:bg-red-500 hover:text-white"
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Logout</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
