"use server";

export interface YDMLogisticsRecord {
  id: number;
  franchise: number;
  api_key: string;
}

interface YDMActionResponse {
  data?: YDMLogisticsRecord;
  error?: string;
}

function getHeaders(token?: string | null): Record<string, string> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
}

export async function fetchYdmConfig(
  token?: string | null
): Promise<YDMActionResponse> {
  try {
    const url = `${process.env.NEXT_PUBLIC_API_URL}/api/ydm-logistics/`;
    const response = await fetch(url, {
      method: "GET",
      headers: getHeaders(token),
    });

    if (response.status === 404) {
      return { data: undefined };
    }

    const contentType = response.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) {
      return { error: "Server returned unexpected response format." };
    }

    const responseText = await response.text();
    let parsed: unknown;
    try {
      parsed = JSON.parse(responseText);
    } catch {
      return { error: "Invalid JSON response from server." };
    }

    if (!response.ok) {
      const errData = parsed as { detail?: string; error?: string };
      return { error: errData?.detail || errData?.error || `Request failed (${response.status})` };
    }

    // The API returns an array — grab the first record
    if (Array.isArray(parsed)) {
      return { data: parsed[0] as YDMLogisticsRecord | undefined };
    }

    return { data: parsed as YDMLogisticsRecord };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "An unexpected error occurred",
    };
  }
}

export async function saveYdmConfig(params: {
  apiKey: string;
  recordId?: number;
  token?: string | null;
}): Promise<YDMActionResponse> {
  try {
    const { apiKey, recordId, token } = params;
    const baseUrl = process.env.NEXT_PUBLIC_API_URL;

    // Use detail endpoint for updates, list endpoint for creates
    const url = recordId
      ? `${baseUrl}/api/ydm-logistics/${recordId}/`
      : `${baseUrl}/api/ydm-logistics/`;

    const method = recordId ? "PATCH" : "POST";

    const response = await fetch(url, {
      method,
      headers: getHeaders(token),
      body: JSON.stringify({ api_key: apiKey }),
    });

    const contentType = response.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) {
      return { error: `Server returned ${contentType} instead of JSON.` };
    }

    const responseText = await response.text();
    let data: unknown;
    try {
      data = JSON.parse(responseText);
    } catch {
      return { error: "Invalid JSON response from server." };
    }

    if (!response.ok) {
      const errData = data as { detail?: string; error?: string; api_key?: string[] };
      return {
        error:
          errData?.api_key?.[0] ||
          errData?.detail ||
          errData?.error ||
          `Save failed (${response.status})`,
      };
    }

    return { data: data as YDMLogisticsRecord };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "An unexpected error occurred",
    };
  }
}
