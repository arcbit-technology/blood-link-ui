import { API_BASE_URL } from "@/config/api";

export class ApiError extends Error {
  status: number;
  body: unknown;

  constructor(message: string, status: number, body: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }
}

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

type HttpOptions = {
  method: HttpMethod;
  path: string;
  token?: string | null;
  body?: unknown;
  headers?: Record<string, string>;
};

async function parseJsonSafely(res: Response): Promise<unknown> {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

export async function http<T>(options: HttpOptions): Promise<T> {
  const url = `${API_BASE_URL}${options.path.startsWith("/") ? "" : "/"}${options.path}`;

  const headers: Record<string, string> = {
    Accept: "application/json",
    ...(options.body !== undefined ? { "Content-Type": "application/json" } : {}),
    ...(options.headers ?? {}),
  };

  if (options.token) {
    headers.Authorization = `Bearer ${options.token}`;
  }

  const res = await fetch(url, {
    method: options.method,
    headers,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  });

  const data = await parseJsonSafely(res);

  if (!res.ok) {
    const message =
      (typeof data === "object" && data && "message" in data && typeof (data as any).message === "string"
        ? (data as any).message
        : `Request failed with status ${res.status}`);
    throw new ApiError(message, res.status, data);
  }

  return data as T;
}

