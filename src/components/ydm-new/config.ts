/** Internal sales API (authenticated via Bearer token). */
export const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

/** YDM logistics external API (authenticated via X-API-KEY). */
export const BASE_URL =
  "https://mentor-run-controlled-rarely.trycloudflare.com";

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

export async function downloadFile(
  endpoint: string,
  filename: string,
): Promise<void> {
  const headers: Record<string, string> = {};
  const token = getToken();
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${endpoint}`, { headers });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw errorData;
  }

  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
