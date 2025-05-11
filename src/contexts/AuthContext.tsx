"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { LoginCredentials } from "@/types/auth";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";

export enum Role {
  SalesPerson = "SalesPerson",
  Distributor = "Distributor",
  SuperAdmin = "SuperAdmin",
  Other = "Other",
  Franchise = "Franchise",
  Factory = "Factory",
}

interface User {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  address: string;
  role: Role;
  is_active: boolean;
  distributor: string;
}

interface AuthResponse {
  access: string;
  refresh: string;
}

interface AuthContextType {
  user: User | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: (returnTo?: string) => void;
  updateProfile: (data: Partial<User>) => Promise<void>;
  isLoading: boolean;
  requireAuth: (returnTo: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      if (token) {
        const response = await api.get<User>("/api/account/profile/");
        setUser(response.data);
      }
    } catch (error) {
      console.error("Auth check failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const requireAuth = (returnTo: string) => {
    if (!user && !isLoading) {
      const encodedReturnTo = encodeURIComponent(returnTo);
      router.push(`/login?returnTo=${encodedReturnTo}`);
    }
  };

  const login = async (credentials: LoginCredentials) => {
    try {
      const authResponse = await api.post<AuthResponse>(
        "/api/account/login/",
        credentials
      );
      const { access, refresh } = authResponse.data;

      localStorage.setItem("accessToken", access);
      localStorage.setItem("refreshToken", refresh);

      const profileResponse = await api.get<User>("/api/account/profile/");
      setUser(profileResponse.data);
    } catch (error) {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      throw error;
    }
  };

  const logout = (returnTo?: string) => {
    setUser(null);
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    const redirectUrl = returnTo
      ? `/login?returnTo=${encodeURIComponent(returnTo)}`
      : "/login";
    router.push(redirectUrl);
  };

  const updateProfile = async (data: Partial<User>) => {
    try {
      const response = await api.patch<User>("/api/account/profile/", data);
      setUser(response.data);
    } catch (error) {
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        updateProfile,
        isLoading,
        requireAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
