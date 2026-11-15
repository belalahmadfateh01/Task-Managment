import { clearSession } from "@/lib/clientStore";

const configuredApiUrl = (process.env.NEXT_PUBLIC_API_URL ?? "").replace(/\/+$/, "");
const API_BASE = configuredApiUrl.endsWith("/api/v1")
  ? configuredApiUrl
  : `${configuredApiUrl}/api/v1`;

export function apiAssetUrl(value?: string | null): string {
  if (!value) return "/imges/Photo.png";
  if (/^(?:https?:|data:|blob:)/i.test(value)) return value;

  const assetPath = value.startsWith("/") ? value : `/${value}`;
  if (!configuredApiUrl) return assetPath;

  const apiOrigin = configuredApiUrl.replace(/\/api\/v1$/i, "");
  return `${apiOrigin}${assetPath}`;
}

export async function downloadApiFile(endpoint: string, fileName: string): Promise<void> {
  const path = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  const headers = new Headers();
  const response = await fetch(`${API_BASE}${path}`, { headers, credentials: "include" });
  if (!response.ok) {
    if (response.status === 401 && typeof window !== "undefined") {
      clearSession();
      if (window.location.pathname !== "/login") window.location.assign("/login");
    }
    let message = "بارگیری فایل ناموفق بود.";
    try {
      const data = await response.json();
      if (typeof data.message === "string") message = data.message;
    } catch {
      // Keep the default message for non-JSON download errors.
    }
    throw new Error(message);
  }

  const objectUrl = URL.createObjectURL(await response.blob());
  const anchor = document.createElement("a");
  anchor.href = objectUrl;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
}

export async function api<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const isFormData = typeof FormData !== "undefined" && options.body instanceof FormData;
  const headers = new Headers(options.headers);
  if (!isFormData && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const path = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
    credentials: "include",
  });

  let data: unknown = null;
  if (response.status !== 204) {
    const contentType = response.headers.get("content-type") ?? "";
    if (contentType.includes("application/json")) {
      data = await response.json().catch(() => null);
    } else {
      await response.text().catch(() => "");
      data = { message: response.ok ? "پاسخ سرور قابل خواندن نیست." : `درخواست ناموفق بود (${response.status}).` };
    }
  }

  if (!response.ok) {
    if (response.status === 401 && typeof window !== "undefined") {
      clearSession();
      if (window.location.pathname !== "/login") window.location.assign("/login");
    }
    const message = data && typeof data === "object" && "message" in data
      ? String(data.message)
      : "Request failed";
    throw new Error(message);
  }

  if (data && typeof data === "object" && !Array.isArray(data)) {
    if ("data" in data) return data.data as T;
    if ("message" in data && typeof data.message !== "string") {
      return data.message as T;
    }
  }

  // Keep top-level fields such as employee details when `message` is text.
  return data as T;
}
