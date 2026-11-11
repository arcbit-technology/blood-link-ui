import { http } from "@/api/http";
import { BloodGroup, Division, DonationPost } from "@/types";

export type ApiPost = {
  id: number;
  author_id: number;
  author_name?: string;
  blood_group: string;
  title: string;
  description?: string;
  hospital_name?: string;
  address?: string;
  district?: string;
  division?: string;
  units_needed?: number;
  contact_phone?: string;
  required_date?: string;
  status: string;
  interested_users?: number[];
  created_at?: string;
};

export type PostsQuery = {
  status?: "open" | "fulfilled" | "closed";
  blood_group?: string;
  division?: string;
  district?: string;
  search?: string;
  page?: number;
  size?: number;
};

type Envelope<T> = { result?: T; error?: string };

export type PostsListResult = {
  data?: ApiPost[];
  total_count?: number;
  page?: number;
  size?: number;
};

export type CreatePostPayload = {
  title: string;
  blood_group: string;
  description: string;
  hospital_name: string;
  address?: string;
  division: string;
  district: string;
  required_date: string; // YYYY-MM-DD
  units_needed?: number;
  contact_phone?: string;
};

function buildQueryString(query: PostsQuery): string {
  const params = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== "") params.set(key, String(value));
  });
  const s = params.toString();
  return s ? `?${s}` : "";
}

export async function getPosts(query: PostsQuery = {}) {
  const res = await http<Envelope<PostsListResult>>({
    method: "GET",
    path: `/posts${buildQueryString(query)}`,
  });
  const data = res.result?.data ?? [];
  return {
    data: data.map(mapApiPostToPost),
    totalCount: res.result?.total_count ?? data.length,
  };
}

export async function createPost(payload: CreatePostPayload, token: string) {
  const res = await http<Envelope<ApiPost>>({
    method: "POST",
    path: "/post",
    body: payload,
    token,
  });
  if (!res.result) throw new Error(res.error || "Failed to create post");
  return mapApiPostToPost(res.result);
}

export async function togglePostInterest(postId: string, token: string) {
  const res = await http<Envelope<ApiPost>>({
    method: "PUT",
    path: `/post/${encodeURIComponent(postId)}/interest`,
    token,
  });
  if (!res.result) throw new Error(res.error || "Failed to update interest");
  return mapApiPostToPost(res.result);
}

export function mapApiPostToPost(p: ApiPost): DonationPost {
  const status: DonationPost["status"] =
    p.status === "fulfilled" || p.status === "closed" ? p.status : "open";
  return {
    id: String(p.id),
    authorId: String(p.author_id),
    authorName: p.author_name ?? "",
    bloodGroup: p.blood_group as BloodGroup,
    title: p.title,
    description: p.description ?? "",
    hospitalName: p.hospital_name ?? "",
    address: p.address ?? "",
    district: p.district ?? "",
    division: (p.division ?? "") as Division,
    requiredDate: p.required_date ?? "",
    interestedUsers: (p.interested_users ?? []).map(String),
    status,
    createdAt: p.created_at ? p.created_at.slice(0, 10) : "",
  };
}
