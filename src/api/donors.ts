import { http } from "@/api/http";
import { ApiUser } from "@/api/auth";

export type DonersQuery = {
  blood_group?: string;
  division?: string;
  district?: string;
  gender?: string;
  search?: string;
  page?: number;
  size?: number;
};

export type DonersListResponse = {
  result?: {
    data?: ApiUser[];
    total_count?: number;
    page?: number;
    size?: number;
    [key: string]: unknown;
  };
  error?: string;
  [key: string]: unknown;
};

export type DonerByIdResponse = {
  result?: ApiUser;
  data?: ApiUser;
  error?: string;
  [key: string]: unknown;
};

function buildQueryString(query: DonersQuery): string {
  const params = new URLSearchParams();
  if (query.blood_group) params.set("blood_group", query.blood_group);
  if (query.division) params.set("division", query.division);
  if (query.district) params.set("district", query.district);
  if (query.gender) params.set("gender", query.gender);
  if (query.search) params.set("search", query.search);
  if (typeof query.page === "number") params.set("page", String(query.page));
  if (typeof query.size === "number") params.set("size", String(query.size));
  const s = params.toString();
  return s ? `?${s}` : "";
}

export async function getDoners(query: DonersQuery): Promise<DonersListResponse> {
  return http<DonersListResponse>({
    method: "GET",
    path: `/doners${buildQueryString(query)}`,
  });
}

export async function getDonerById(id: string | number): Promise<DonerByIdResponse> {
  return http<DonerByIdResponse>({
    method: "GET",
    path: `/doner/${encodeURIComponent(String(id))}`,
  });
}

export function extractDonersList(payload: unknown): {
  data: ApiUser[];
  totalCount: number;
  page: number | null;
  size: number | null;
} {
  const root = typeof payload === "object" && payload ? (payload as any) : {};
  const result = typeof root.result === "object" && root.result ? root.result : {};
  const data = Array.isArray(result.data) ? (result.data as ApiUser[]) : [];
  const totalCount =
    typeof result.total_count === "number" ? (result.total_count as number) : data.length;
  const page = typeof result.page === "number" ? (result.page as number) : null;
  const size = typeof result.size === "number" ? (result.size as number) : null;
  return { data, totalCount, page, size };
}

export function extractDoner(payload: unknown): ApiUser | null {
  const root = typeof payload === "object" && payload ? (payload as any) : {};
  if (root && typeof root.result === "object" && root.result) return root.result as ApiUser;
  if (root && typeof root.data === "object" && root.data) return root.data as ApiUser;
  return null;
}
