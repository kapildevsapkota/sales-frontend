"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Eye, EyeOff, Loader2, ArrowLeft } from "lucide-react";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

const changePasswordSchema = z
  .object({
    old_password: z.string().min(1, "Old password is required"),
    new_password: z
      .string()
      .min(8, "New password must be at least 8 characters"),
    confirm_password: z.string().min(1, "Please confirm your new password"),
  })
  .refine((data) => data.new_password === data.confirm_password, {
    message: "Passwords don't match",
    path: ["confirm_password"],
  });

type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;

export default function ChangePasswordPage() {
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const form = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      old_password: "",
      new_password: "",
      confirm_password: "",
    },
  });

  // Watch password fields for real-time validation
  const newPassword = form.watch("new_password");
  const confirmPassword = form.watch("confirm_password");
  const passwordsMatch =
    newPassword && confirmPassword && newPassword === confirmPassword;
  const showPasswordMatch = newPassword && confirmPassword;

  const onSubmit = async (data: ChangePasswordFormData) => {
    setIsLoading(true);
    try {
      await api.post("/api/account/change-password/", {
        old_password: data.old_password,
        new_password: data.new_password,
      });

      toast.success("Password changed successfully!");

      // Reset form and redirect back
      form.reset();
      router.back();
    } catch (error: unknown) {
      console.error("Change password error:", error);

      let errorMessage = "Failed to change password. Please try again.";

      if (error && typeof error === "object" && "response" in error) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const apiError = error as { response?: { data?: any } };
        if (apiError.response?.data) {
          if (apiError.response.data.old_password) {
            errorMessage = apiError.response.data.old_password[0];
          } else if (apiError.response.data.new_password) {
            errorMessage = apiError.response.data.new_password[0];
          } else if (apiError.response.data.detail) {
            errorMessage = apiError.response.data.detail;
          }
        }
      }

      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    if (!isLoading) {
      router.back();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={handleBack}
          disabled={isLoading}
          className="mb-4 flex items-center gap-2 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>

        {/* Card Container */}
        <Card className="w-full shadow-lg border-0">
          <CardHeader className="space-y-1 pb-6">
            <CardTitle className="text-2xl font-bold text-center">
              Change Password
            </CardTitle>
            <CardDescription className="text-center text-gray-600">
              Enter your current password and choose a new password.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                <FormField
                  control={form.control}
                  name="old_password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">
                        Current Password
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            {...field}
                            type={showOldPassword ? "text" : "password"}
                            placeholder="Enter your current password"
                            disabled={isLoading}
                            className="pl-4 pr-12 h-12 border-gray-200 focus:border-purple-400 focus:ring-purple-400 transition-all"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() => setShowOldPassword(!showOldPassword)}
                            disabled={isLoading}
                          >
                            {showOldPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="new_password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">
                        New Password
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            {...field}
                            type={showNewPassword ? "text" : "password"}
                            placeholder="Enter your new password"
                            disabled={isLoading}
                            className={cn(
                              "pl-4 pr-12 h-12 border-gray-200 focus:border-purple-400 focus:ring-purple-400 transition-all",
                              showPasswordMatch
                                ? passwordsMatch
                                  ? "border-green-500"
                                  : "border-red-500"
                                : ""
                            )}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            disabled={isLoading}
                          >
                            {showNewPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="confirm_password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">
                        Confirm New Password
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            {...field}
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="Confirm your new password"
                            disabled={isLoading}
                            className={cn(
                              "pl-4 pr-12 h-12 border-gray-200 focus:border-purple-400 focus:ring-purple-400 transition-all",
                              showPasswordMatch
                                ? passwordsMatch
                                  ? "border-green-500"
                                  : "border-red-500"
                                : ""
                            )}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() =>
                              setShowConfirmPassword(!showConfirmPassword)
                            }
                            disabled={isLoading}
                          >
                            {showConfirmPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </FormControl>
                      {showPasswordMatch && (
                        <div
                          className={`text-sm ${
                            passwordsMatch ? "text-green-600" : "text-red-600"
                          }`}
                        >
                          {passwordsMatch
                            ? "✓ Passwords match"
                            : "✗ Passwords don't match"}
                        </div>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleBack}
                    disabled={isLoading}
                    className="flex-1 h-12"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isLoading || !passwordsMatch}
                    className="flex-1 h-12"
                  >
                    {isLoading && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Change Password
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
