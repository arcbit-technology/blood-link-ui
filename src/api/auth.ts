import { http } from "@/api/http";

export type ApiUser = {
  id?: number | string;
  first_name?: string;
  last_name?: string;
  password?: string;
  gender?: string;
  age?: number;
  blood_group?: string;
  hide_personal_info?: boolean;
  donated_at?: string;
  is_available?: boolean;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  district?: string;
  division?: string;
  upazila?: string;
  country?: string;
  is_verified?: boolean;
  last_login?: string;
  created_at?: string;
  updated_at?: string;
  created_by?: number;
  updated_by?: number;
  profession?: string;
  is_password_temporary?: boolean;
  role?: string;
  id_role?: number;
  verification_code?: string;
  confirm_password?: string;
  [key: string]: unknown;
};

export type LoginRequest = {
  email: string;
  password: string;
};

export type RegisterRequest = Partial<ApiUser> & {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  confirm_password: string;
};

export type LoginResponse = {
  result?: {
    user?: ApiUser;
    role?: {
      id?: number;
      name?: string;
      description?: string;
      [key: string]: unknown;
    };
    token?: string;
    [key: string]: unknown;
  };
  error?: string;
  token?: string;
  access_token?: string;
  user?: ApiUser;
  data?: {
    token?: string;
    access_token?: string;
    user?: ApiUser;
  };
  [key: string]: unknown;
};

export async function login(payload: LoginRequest): Promise<LoginResponse> {
  return http<LoginResponse>({
    method: "POST",
    path: "/login",
    body: payload,
  });
}

export async function register(payload: RegisterRequest): Promise<unknown> {
  return http<unknown>({
    method: "POST",
    path: "/register",
    body: payload,
  });
}

export async function isTokenValid(token: string): Promise<unknown> {
  return http<unknown>({
    method: "GET",
    path: "/iftokenvalid",
    token,
  });
}

export function extractToken(response: LoginResponse): string | null {
  return (
    response.result?.token ??
    response.token ??
    response.access_token ??
    response.data?.token ??
    response.data?.access_token ??
    null
  );
}

export function extractUser(response: LoginResponse): ApiUser | null {
  const roleName = response.result?.role?.name;
  const baseUser =
    response.result?.user ?? response.user ?? response.data?.user ?? null;
  if (!baseUser) return null;
  if (roleName && typeof roleName === "string") {
    return { ...baseUser, role: roleName };
  }
  return baseUser;
}
