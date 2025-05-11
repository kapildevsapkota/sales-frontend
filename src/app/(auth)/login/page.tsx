"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { LoginForm } from "@/components/login/LoginForm";
import { LoggedInRedirect } from "@/components/login/LoggedInRedirect";
import { LoginBackground } from "@/components/login/LoginBackground";
import { loginSchema, LoginFormData } from "@/components/login/types";
import { LoginCredentials } from "@/types/auth";
import { useAuth } from "@/contexts/AuthContext";

export default function LoginPage() {
  const { login, user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const router = useRouter();

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      phone_number: "",
      password: "",
    },
  });

  useEffect(() => {
    if (user) {
      const timeout = setTimeout(() => {
        router.push("/dashboard");
      }, 2000);
      return () => clearTimeout(timeout);
    }
  }, [user, router]);

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const loginData: LoginCredentials = {
        phone_number: data.phone_number,
        password: data.password,
      };
      await login(loginData);
      toast.success("Login successful!");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.log(error);
      const errorMessage =
        error.response?.data?.error || "An unexpected error occurred.";
      setErrorMessage(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (user) {
    return <LoggedInRedirect />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      <LoginBackground />
      <Card className="w-full max-w-md mx-4 shadow-xl bg-white/80 backdrop-blur-sm relative z-10">
        <CardHeader className="space-y-4 text-center pb-8">
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-800 to-purple-600 bg-clip-text text-transparent">
            Welcome Back
          </CardTitle>
          <CardDescription className="text-lg text-gray-600">
            Sign in to your Yachu Sales App account
          </CardDescription>
        </CardHeader>
        <LoginForm
          isLoading={isLoading}
          errorMessage={errorMessage}
          onSubmit={onSubmit}
          form={form}
        />
      </Card>
    </div>
  );
}
