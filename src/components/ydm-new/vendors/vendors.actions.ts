import {
  GetStatementParams,
  StatementResponse,
} from "../statements/statement.actions";
import type {
  VendorDashboardStats,
  VendorDailyPlacedStat,
  VendorDailyDeliveredStat,
  VendorCompleteStat,
} from "./vendors";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

const BASE_URL = "https://lane-equally-noticed-impose.trycloudflare.com";

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("accessToken");
}

/** Fetches the YDM API key from the config endpoint using the stored auth token. */
async function getYdmApiKey(): Promise<string> {
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

function buildHeaders(apiKey: string): Record<string, string> {
  return {
    "Content-Type": "application/json",
    "X-API-KEY": apiKey,
  };
}

export async function fetchVendorDashboardStats(): Promise<VendorDashboardStats> {
  const apiKey = await getYdmApiKey();
  const res = await fetch(`${BASE_URL}/api/dashboard/`, {
    headers: buildHeaders(apiKey),
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch dashboard stats: ${res.status}`);
  }
  return res.json() as Promise<VendorDashboardStats>;
}

export async function fetchVendorDashboardPlacedStats(): Promise<
  VendorDailyPlacedStat[]
> {
  const apiKey = await getYdmApiKey();
  const res = await fetch(`${BASE_URL}/api/dashboard/daily/placed/`, {
    headers: buildHeaders(apiKey),
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch placed stats: ${res.status}`);
  }
  return res.json() as Promise<VendorDailyPlacedStat[]>;
}

export async function fetchVendorDashboardDeliveredStats(): Promise<
  VendorDailyDeliveredStat[]
> {
  const apiKey = await getYdmApiKey();
  const res = await fetch(`${BASE_URL}/api/dashboard/daily/delivered/`, {
    headers: buildHeaders(apiKey),
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch delivered stats: ${res.status}`);
  }
  return res.json() as Promise<VendorDailyDeliveredStat[]>;
}

export async function fetchVendorDashboardCompleteStats(): Promise<VendorCompleteStat> {
  const apiKey = await getYdmApiKey();
  const res = await fetch(`${BASE_URL}/api/dashboard/complete/`, {
    headers: buildHeaders(apiKey),
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch complete stats: ${res.status}`);
  }
  return res.json() as Promise<VendorCompleteStat>;
}

export async function getStatement(params?: GetStatementParams) {
  const query = new URLSearchParams();
  if (params?.start_date) query.set("start_date", params.start_date);
  if (params?.end_date) query.set("end_date", params.end_date);

  const apiKey = await getYdmApiKey();
  const res = await fetch(
    `${BASE_URL}/api/user/statement/?${query.toString()}`,
    {
      headers: buildHeaders(apiKey),
    },
  );
  if (!res.ok) {
    throw new Error(`Failed to fetch complete stats: ${res.status}`);
  }
  return res.json() as Promise<StatementResponse>;
}
