import { api } from "@/lib/api";

export function loginEmployee<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  return api<T>(endpoint, options);
}