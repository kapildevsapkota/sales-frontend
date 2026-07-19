/** Internal sales API (authenticated via Bearer token). */
export const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

/** YDM logistics external API (authenticated via X-API-KEY). */
export const BASE_URL =
  "https://lane-equally-noticed-impose.trycloudflare.com";

// ---------- Auth helpers ----------

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("accessToken");
}

/** Fetches the YDM API key from the config endpoint using the stored auth token. */
export async function getYdmApiKey(): Promise<string> {
  const token = getToken();
  const res = await fetch(`${API_URL}/api/ydm-logistics/`, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch YDM config: ${res.status}`);
  }

  const data = await res.json();
  const record = Array.isArray(data) ? data[0] : data;
  if (!record?.api_key) {
    throw new Error("YDM API key not configured");
  }
  return record.api_key as string;
}

export function buildHeaders(apiKey: string): Record<string, string> {
  return {
    "Content-Type": "application/json",
    "X-API-KEY": apiKey,
  };
}
