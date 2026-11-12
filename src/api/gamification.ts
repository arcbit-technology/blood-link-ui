import { http } from "@/api/http";
import { camelize, queryString } from "@/api/camelize";
import type {
  Badge,
  DonationConfirmation,
  GamificationProfile,
  InterestedDonor,
  LeaderboardEntry,
} from "@/types";

type Envelope<T> = { result?: T; error?: string };

async function call<T>(method: "GET" | "POST", path: string, token?: string | null, body?: unknown): Promise<T> {
  const res = await http<Envelope<unknown>>({ method, path, token, body });
  return camelize(res.result) as T;
}

export type LeaderboardScope = "global" | "division" | "district" | "upazila" | "bank";
export type LeaderboardPeriod = "all" | "month";

export type LeaderboardQuery = {
  scope?: LeaderboardScope;
  value?: string;
  bank_id?: number;
  period?: LeaderboardPeriod;
  size?: number;
};

export const getGamificationProfile = (userId: number | string) =>
  call<GamificationProfile>("GET", `/user/${userId}/gamification`);

export const getBadges = () => call<Badge[]>("GET", "/badges");

export async function getLeaderboard(query: LeaderboardQuery = {}) {
  return (await call<LeaderboardEntry[]>("GET", `/leaderboard${queryString(query)}`)) ?? [];
}

export async function getBankLeaderboard(bankId: number, period: LeaderboardPeriod = "all") {
  return (await call<LeaderboardEntry[]>("GET", `/blood-bank/${bankId}/leaderboard?period=${period}`)) ?? [];
}

export async function getPostInterests(postId: number | string, token: string) {
  return (await call<InterestedDonor[]>("GET", `/post/${postId}/interests`, token)) ?? [];
}

export const confirmDonation = (
  postId: number | string,
  payload: { donor_id: number; units?: number; donation_date?: string },
  token: string,
) => call<DonationConfirmation>("POST", `/post/${postId}/confirm-donation`, token, payload);
