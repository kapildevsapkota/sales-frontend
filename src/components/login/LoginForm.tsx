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
import { User, Lock } from "lucide-react";
import Link from "next/link";
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
            <Link
              href="/forgot-password"
              className="text-blue-800 hover:text-purple-600 hover:underline font-medium transition-colors"
            >
              Forgot password?
            </Link>
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
