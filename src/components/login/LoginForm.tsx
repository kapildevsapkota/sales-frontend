"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { CardContent, CardFooter } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { User, Lock } from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import { LoginFormData } from "./types";

interface LoginFormProps {
  isLoading: boolean;
  errorMessage: string | null;
  onSubmit: (data: LoginFormData) => void;
  form: UseFormReturn<LoginFormData>;
}

export function LoginForm({
  isLoading,
  errorMessage,
  onSubmit,
  form,
}: LoginFormProps) {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [resetPayload, setResetPayload] = useState({
    phone_number: "",
    new_password: "",
    confirm_password: "",
  });
  const [resetErrors, setResetErrors] = useState({
    phone_number: "",
    new_password: "",
    confirm_password: "",
    general: "",
  });
  const [resetSuccess, setResetSuccess] = useState<string | null>(null);
  const [isResetting, setIsResetting] = useState(false);

  const handleDialogClose = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      setResetPayload({
        phone_number: "",
        new_password: "",
        confirm_password: "",
      });
      setResetErrors({
        phone_number: "",
        new_password: "",
        confirm_password: "",
        general: "",
      });
      setResetSuccess(null);
      setIsResetting(false);
    }
  };

  const handlePasswordReset = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    setResetErrors({
      phone_number: "",
      new_password: "",
      confirm_password: "",
      general: "",
    });
    setResetSuccess(null);

    const fieldErrors = {
      phone_number: "",
      new_password: "",
      confirm_password: "",
    };
    let hasError = false;

    if (!resetPayload.phone_number.trim()) {
      fieldErrors.phone_number = "Phone number is required.";
      hasError = true;
    }

    if (!resetPayload.new_password.trim()) {
      fieldErrors.new_password = "New password is required.";
      hasError = true;
    }

    if (!resetPayload.confirm_password.trim()) {
      fieldErrors.confirm_password = "Confirm password is required.";
      hasError = true;
    } else if (
      resetPayload.new_password.trim() &&
      resetPayload.new_password !== resetPayload.confirm_password
    ) {
      fieldErrors.confirm_password = "Passwords do not match.";
      hasError = true;
    }

    if (hasError) {
      setResetErrors((prev) => ({
        ...prev,
        ...fieldErrors,
      }));
      return;
    }

    try {
      setIsResetting(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/account/forget-password/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            phone_number: resetPayload.phone_number,
            new_password: resetPayload.new_password,
          }),
        }
      );

      if (!response.ok) {
        const errorBody = await response.json().catch(() => null);
        throw new Error(errorBody?.message || "Failed to reset password.");
      }

      setResetSuccess("Password reset successfully. Please log in again.");
      form.setValue("phone_number", resetPayload.phone_number);
      form.setValue("password", resetPayload.new_password);
      handleDialogClose(false);
      toast({
        title: "Password reset successful",
        description: "Sign in with your new password.",
      });
    } catch (error) {
      setResetErrors((prev) => ({
        ...prev,
        general:
          error instanceof Error
            ? error.message
            : "Something went wrong. Please try again.",
      }));
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <CardContent className="space-y-6">
          <FormField
            control={form.control}
            name="phone_number"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-700 font-medium">
                  Phone Number
                </FormLabel>
                <FormControl>
                  <div className="relative group">
                    <User className="absolute left-3 top-3 h-4 w-4 text-gray-400 group-hover:text-purple-500 transition-colors" />
                    <Input
                      className="pl-10 h-12 border-gray-200 focus:border-purple-400 focus:ring-purple-400 transition-all"
                      placeholder="Enter your phone number"
                      {...field}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-700 font-medium">
                  Password
                </FormLabel>
                <FormControl>
                  <div className="relative group">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400 group-hover:text-purple-500 transition-colors" />
                    <Input
                      type="password"
                      className="pl-10 h-12 border-gray-200 focus:border-purple-400 focus:ring-purple-400 transition-all"
                      placeholder="Enter your password"
                      {...field}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex items-center justify-between text-sm">
            <Dialog open={isDialogOpen} onOpenChange={handleDialogClose}>
              <DialogTrigger asChild>
                <button
                  type="button"
                  className="text-blue-800 hover:text-purple-600 hover:underline font-medium transition-colors"
                >
                  Forgot password?
                </button>
              </DialogTrigger>
              <DialogContent className="space-y-4">
                <DialogHeader>
                  <DialogTitle>Reset password</DialogTitle>
                  <DialogDescription>
                    Enter your phone number and a new password to reset your
                    account.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handlePasswordReset} className="space-y-4">
                  <div className="space-y-2">
                    <FormLabel className="text-gray-700 font-medium">
                      Phone Number
                    </FormLabel>
                    <div className="relative group">
                      <User className="absolute left-3 top-3 h-4 w-4 text-gray-400 group-hover:text-purple-500 transition-colors" />
                      <Input
                        value={resetPayload.phone_number}
                        onChange={(event) =>
                          setResetPayload((prev) => ({
                            ...prev,
                            phone_number: event.target.value,
                          }))
                        }
                        placeholder="Enter your phone number"
                        disabled={isResetting}
                        className={cn(
                          "pl-10 h-12 border-gray-200 focus:border-purple-400 focus:ring-purple-400 transition-all",
                          resetErrors.phone_number &&
                            "border-red-500 focus:border-red-500 focus:ring-red-500"
                        )}
                      />
                    </div>
                    {resetErrors.phone_number && (
                      <p className="text-red-600 text-sm">
                        {resetErrors.phone_number}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <FormLabel className="text-gray-700 font-medium">
                      New Password
                    </FormLabel>
                    <div className="relative group">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400 group-hover:text-purple-500 transition-colors" />
                      <Input
                        type="password"
                        value={resetPayload.new_password}
                        onChange={(event) =>
                          setResetPayload((prev) => ({
                            ...prev,
                            new_password: event.target.value,
                          }))
                        }
                        placeholder="Enter new password"
                        disabled={isResetting}
                        className={cn(
                          "pl-10 h-12 border-gray-200 focus:border-purple-400 focus:ring-purple-400 transition-all",
                          resetErrors.new_password &&
                            "border-red-500 focus:border-red-500 focus:ring-red-500"
                        )}
                      />
                    </div>
                    {resetErrors.new_password && (
                      <p className="text-red-600 text-sm">
                        {resetErrors.new_password}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <FormLabel className="text-gray-700 font-medium">
                      Confirm Password
                    </FormLabel>
                    <div className="relative group">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400 group-hover:text-purple-500 transition-colors" />
                      <Input
                        type="password"
                        value={resetPayload.confirm_password}
                        onChange={(event) =>
                          setResetPayload((prev) => ({
                            ...prev,
                            confirm_password: event.target.value,
                          }))
                        }
                        placeholder="Confirm new password"
                        disabled={isResetting}
                        className={cn(
                          "pl-10 h-12 border-gray-200 focus:border-purple-400 focus:ring-purple-400 transition-all",
                          resetErrors.confirm_password &&
                            "border-red-500 focus:border-red-500 focus:ring-red-500"
                        )}
                      />
                    </div>
                    {resetErrors.confirm_password && (
                      <p className="text-red-600 text-sm">
                        {resetErrors.confirm_password}
                      </p>
                    )}
                  </div>
                  {resetErrors.general && (
                    <div className="text-red-600 text-sm">
                      {resetErrors.general}
                    </div>
                  )}
                  {resetSuccess && (
                    <div className="text-green-600 text-sm">{resetSuccess}</div>
                  )}
                  <DialogFooter>
                    <Button
                      type="submit"
                      disabled={isResetting}
                      className="w-full sm:w-auto"
                    >
                      {isResetting ? "Submitting..." : "Submit"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col space-y-4">
          <Button
            type="submit"
            className="w-full h-12 bg-gradient-to-r from-blue-800 to-purple-600 hover:from-blue-800 hover:to-purple-700 text-white text-lg font-medium transition-all duration-300 transform hover:scale-[1.02]"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <div className="w-5 h-5 border-t-2 border-b-2 border-white rounded-full animate-spin" />
                <span>Signing in...</span>
              </div>
            ) : (
              "Sign in"
            )}
          </Button>
          {errorMessage && (
            <div className="text-red-600 text-sm text-center mt-2">
              {errorMessage}
            </div>
          )}
        </CardFooter>
      </form>
    </Form>
  );
}
