"use server";

interface DashLoginResponse {
  message?: string;
  email?: string;
  error?: string;
}

interface DashLoginParams {
  email: string;
  password: string;
  token?: string | null;
}

export async function dashLogin(
  params: DashLoginParams
): Promise<DashLoginResponse> {
  try {
    const { email, password, token } = params;

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const url = `https://sales.baliyoventures.com/api/dash/login/`;
    const body = JSON.stringify({ email, password });

    console.log("[dashLogin] Request URL:", url);
    console.log("[dashLogin] Request headers:", headers);
    console.log("[dashLogin] Request body:", body);

    const response = await fetch(url, {
      method: "POST",
      headers,
      body,
    });

    console.log("[dashLogin] Response status:", response.status);
    console.log("[dashLogin] Response statusText:", response.statusText);
    console.log(
      "[dashLogin] Response headers:",
      Object.fromEntries(response.headers.entries())
    );
    console.log(
      "[dashLogin] Response Content-Type:",
      response.headers.get("content-type")
    );

    // Get response text first to see what we're actually receiving
    const responseText = await response.text();
    console.log(
      "[dashLogin] Response text (first 500 chars):",
      responseText.substring(0, 500)
    );

    // Try to parse as JSON only if it's actually JSON
    let data: DashLoginResponse;
    const contentType = response.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      try {
        data = JSON.parse(responseText);
        console.log("[dashLogin] Parsed JSON data:", data);
      } catch (parseError) {
        console.error("[dashLogin] JSON parse error:", parseError);
        return {
          error: `Invalid JSON response: ${responseText.substring(0, 200)}`,
        };
      }
    } else {
      // If it's HTML or other non-JSON, return error
      console.error("[dashLogin] Non-JSON response received");
      return {
        error: `Server returned ${contentType} instead of JSON. Response: ${responseText.substring(
          0,
          200
        )}`,
      };
    }

    if (!response.ok) {
      console.error("[dashLogin] Response not OK:", data);
      return {
        error:
          data.error || data.message || `Login failed (${response.status})`,
      };
    }

    console.log("[dashLogin] Success:", data);
    return data;
  } catch (error) {
    console.error("[dashLogin] Exception:", error);
    return {
      error:
        error instanceof Error ? error.message : "An unexpected error occurred",
    };
  }
}
