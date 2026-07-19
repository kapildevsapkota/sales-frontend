import { useQuery } from "@tanstack/react-query";
import { GetStatementParams } from "./statement.actions";
import { getStatement } from "../vendors/vendors.actions";

export const STATEMENT_QUERY_KEYS = {
  all: ["statement"] as const,
  detail: (params?: GetStatementParams) => ["statement", params] as const,
};

export function useVendorStatement(params?: GetStatementParams) {
  return useQuery({
    queryKey: STATEMENT_QUERY_KEYS.detail(params),
    queryFn: () => getStatement(params),
    gcTime: 1000 * 60 * 15, // 15 minutes
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
