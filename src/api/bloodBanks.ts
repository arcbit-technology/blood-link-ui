import { http } from "@/api/http";
import { camelize, queryString } from "@/api/camelize";
import type { BankMember, BankRole, BloodBank, Conversation, MyBloodBank } from "@/types";

type Envelope<T> = { result?: T; error?: string };

async function call<T>(
  method: "GET" | "POST" | "PUT" | "DELETE",
  path: string,
  token?: string | null,
  body?: unknown,
): Promise<T> {
  const res = await http<Envelope<unknown>>({ method, path, token, body });
  return camelize(res.result) as T;
}

export type BloodBanksQuery = {
  division?: string;
  district?: string;
  upazila?: string;
  search?: string;
  /** platform admins only: pending | approved | rejected | suspended | all */
  status?: string;
  page?: number;
  size?: number;
};

export type BloodBankPayload = {
  name: string;
  description?: string;
  division?: string;
  district?: string;
  upazila?: string;
  address?: string;
  contact_phone?: string;
  logo?: string;
};

export async function getBloodBanks(query: BloodBanksQuery = {}, token?: string | null) {
  const r = await call<{ data: BloodBank[]; totalCount: number }>(
    "GET",
    `/blood-banks${queryString(query)}`,
    token,
  );
  return { data: r?.data ?? [], totalCount: r?.totalCount ?? 0 };
}

export const getBloodBank = (id: number | string, token?: string | null) =>
  call<BloodBank>("GET", `/blood-bank/${id}`, token);

export const getMyBloodBank = (token: string) => call<MyBloodBank>("GET", "/blood-bank/mine", token);

export const createBloodBank = (payload: BloodBankPayload, token: string) =>
  call<BloodBank>("POST", "/blood-bank", token, payload);

export const updateBloodBank = (id: number, payload: BloodBankPayload, token: string) =>
  call<BloodBank>("PUT", `/blood-bank/${id}`, token, payload);

export const reviewBloodBank = (
  id: number,
  action: "approve" | "reject" | "suspend",
  token: string,
  reason?: string,
) => call<BloodBank>("PUT", `/blood-bank/${id}/${action}`, token, reason ? { reason } : undefined);

export const joinBloodBank = (id: number, token: string) =>
  call<MyBloodBank>("POST", `/blood-bank/${id}/join`, token);

export const leaveBloodBank = (id: number, token: string) =>
  call<string>("DELETE", `/blood-bank/${id}/membership`, token);

export async function getBankMembers(id: number, status: "active" | "pending" = "active", token?: string | null) {
  return (await call<BankMember[]>("GET", `/blood-bank/${id}/members?status=${status}`, token)) ?? [];
}

export const reviewMember = (bankId: number, userId: number, action: "approve" | "reject", token: string) =>
  call<string>("PUT", `/blood-bank/${bankId}/member/${userId}/${action}`, token);

export const removeMember = (bankId: number, userId: number, token: string) =>
  call<string>("DELETE", `/blood-bank/${bankId}/member/${userId}`, token);

export const setMemberRole = (
  bankId: number,
  userId: number,
  payload: { role: BankRole; position: string },
  token: string,
) => call<BankMember[]>("PUT", `/blood-bank/${bankId}/member/${userId}/role`, token, payload);

export const transferBankAdmin = (bankId: number, userId: number, token: string) =>
  call<BloodBank>("PUT", `/blood-bank/${bankId}/transfer-admin`, token, { user_id: userId });

export const getBankConversation = (bankId: number, token: string) =>
  call<Conversation>("GET", `/blood-bank/${bankId}/conversation`, token);
