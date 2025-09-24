"use client";

import { useEffect, useState } from "react";
import type { PaginatedStatementResponse } from "@/types/statements";
import { getStatements } from "@/lib/statements";

export function useStatements(id: string, page: number, pageSize: number) {
  const [data, setData] = useState<PaginatedStatementResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<unknown>(null);

  useEffect(() => {
    let isActive = true;
    setIsLoading(true);
    setError(null);

    getStatements(id, page, pageSize)
      .then((res) => {
        if (!isActive) return;
        setData(res);
      })
      .catch((err) => {
        if (!isActive) return;
        setError(err);
      })
      .finally(() => {
        if (!isActive) return;
        setIsLoading(false);
      });

    return () => {
      isActive = false;
    };
  }, [id, page, pageSize]);

  return { data, isLoading, error } as const;
}
