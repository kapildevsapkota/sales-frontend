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
import { BASE_URL, getYdmApiKey, buildHeaders } from "../config";

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
