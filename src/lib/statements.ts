import type { PaginatedStatementResponse } from "@/types/statements";

export const getStatements = async (
  id: string,
  page: number,
  pageSize: number
): Promise<PaginatedStatementResponse> => {
  const url = new URL(
    `${process.env.NEXT_PUBLIC_API_URL}/api/logistics/franchise/${id}/statement/`
  );
  url.searchParams.set("page", String(page));
  url.searchParams.set("page_size", String(pageSize));

  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error("Failed to fetch statements");
  }
  return response.json();
};
