"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import { OfflineSalesAccessRecord } from "@/types/offline-sales";
import { isAxiosError } from "axios";

export function useOfflineSalesAccess() {
  const { user, isLoading: authLoading } = useAuth();
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  const [accessList, setAccessList] = useState<OfflineSalesAccessRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const checkAccess = useCallback(async () => {
    if (authLoading) return;
    if (!user) {
      setHasAccess(false);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      let response;
      try {
        response = await api.get<OfflineSalesAccessRecord[]>(
          "/api/offline-sales/access"
        );
      } catch (err: unknown) {
        if (
          isAxiosError(err) &&
          (err.response?.status === 404 || err.response?.status === 301)
        ) {
          response = await api.get<OfflineSalesAccessRecord[]>(
            "/api/offline-sales/access/"
          );
        } else {
          throw err;
        }
      }

      const raw = response.data;
      const data: OfflineSalesAccessRecord[] = Array.isArray(raw)
        ? raw
        : (raw as { results?: OfflineSalesAccessRecord[] })?.results || [];

      setAccessList(data);

      const matches = data.some((item) => {
        const idMatch =
          (typeof item.user === "number" && item.user === user.id) ||
          (typeof item.user_id === "number" && item.user_id === user.id);

        const phoneMatch = Boolean(
          user.phone_number &&
            (item.user_phone === user.phone_number ||
              item.user_username === user.phone_number)
        );

        const usernameMatch = Boolean(
          user.username &&
            (item.user_username === user.username ||
              item.user_phone === user.username)
        );

        const emailMatch = Boolean(
          user.email &&
            item.user_email &&
            item.user_email.trim().toLowerCase() ===
              user.email.trim().toLowerCase()
        );

        return idMatch || phoneMatch || usernameMatch || emailMatch;
      });

      setHasAccess(matches);
    } catch (err) {
      console.error("Error fetching offline sales access:", err);
      setHasAccess(false);
    } finally {
      setIsLoading(false);
    }
  }, [user, authLoading]);

  useEffect(() => {
    checkAccess();
  }, [checkAccess]);

  return {
    hasAccess: Boolean(hasAccess),
    isLoading: isLoading || authLoading,
    accessList,
    user,
    refetch: checkAccess,
  };
}

