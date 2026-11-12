"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { getMyBloodBank } from "@/api/bloodBanks";

export const MY_BLOOD_BANK_KEY = ["myBloodBank"] as const;

/** The signed-in user's blood bank membership and pending creation request. */
export function useMyBloodBank() {
  const { token, isAuthenticated } = useAuth();
  return useQuery({
    queryKey: MY_BLOOD_BANK_KEY,
    enabled: isAuthenticated && !!token,
    queryFn: () => getMyBloodBank(token as string),
    staleTime: 30_000,
  });
}
