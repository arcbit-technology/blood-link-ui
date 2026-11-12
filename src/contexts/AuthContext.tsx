"use client";

import React, {
  createContext,
  useContext,
  useCallback,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ApiError } from "@/api/http";
import {
  ApiUser,
  LoginRequest,
  RegisterRequest,
  extractToken,
  extractUser,
  isTokenValid,
  login as loginApi,
  register as registerApi,
} from "@/api/auth";
import {
  clearStoredToken,
  clearStoredUser,
  getStoredToken,
  getStoredUser,
  setStoredToken,
  setStoredUser,
} from "@/lib/authStorage";
import { User } from "@/types";
import { mapApiUserToUser } from "@/api/mappers";

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isAuthLoading: boolean;
  loginIsLoading: boolean;
  registerIsLoading: boolean;
  login: (
    email: string,
    password: string,
  ) => Promise<{ ok: true; user: User } | { ok: false; message: string }>;
  logout: () => void;
  /** Merges fields into the signed-in user (e.g. a new photo) and persists it. */
  updateUser: (patch: Partial<User>) => void;
  register: (
    userData: RegisterRequest,
  ) => Promise<{ ok: true } | { ok: false; message: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const queryClient = useQueryClient();
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [hasRestoredSession, setHasRestoredSession] = useState(false);

  useEffect(() => {
    setUser(getStoredUser<User>());
    setToken(getStoredToken());
    setHasRestoredSession(true);
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    clearStoredUser();
    clearStoredToken();
    queryClient.clear();
  }, [queryClient]);

  const updateUser = useCallback((patch: Partial<User>) => {
    setUser((prev) => {
      if (!prev) return prev;
      const next = { ...prev, ...patch };
      setStoredUser(next);
      return next;
    });
  }, []);

  const tokenValidationQuery = useQuery({
    queryKey: ["auth", "tokenValidation", token],
    enabled: !!token,
    queryFn: () => isTokenValid(token as string),
    retry: false,
    staleTime: 0,
  });

  useEffect(() => {
    if (!token) return;
    if (tokenValidationQuery.isError) {
      logout();
      return;
    }
    if (!tokenValidationQuery.data) return;

    const data = tokenValidationQuery.data;
    const validFlag =
      typeof data === "object" &&
      data &&
      "valid" in data &&
      typeof data.valid === "boolean"
        ? (data.valid as boolean)
        : null;

    if (validFlag === false) {
      logout();
      return;
    }

    const maybeUser: ApiUser | null =
      (typeof data === "object" && data && "user" in data
        ? (data.user as ApiUser)
        : null) ||
      (typeof data === "object" &&
      data &&
      "data" in data &&
      typeof data.data === "object" && data.data && "user" in data.data
        ? (data.data.user as ApiUser)
        : null);

    if (maybeUser) {
      const nextUser = mapApiUserToUser(maybeUser);
      setUser(nextUser);
      setStoredUser(nextUser);
    }
  }, [
    token,
    tokenValidationQuery.data,
    tokenValidationQuery.isError,
    logout,
  ]);

  const loginMutation = useMutation({
    mutationFn: (payload: LoginRequest) => loginApi(payload),
  });

  const registerMutation = useMutation({
    mutationFn: (payload: RegisterRequest) => registerApi(payload),
  });

  const login = async (email: string, password: string) => {
    try {
      const res = await loginMutation.mutateAsync({ email, password });
      const nextToken = extractToken(res);
      const apiUser = extractUser(res);

      if (!apiUser) {
        return {
          ok: false as const,
          message: "Login succeeded but user payload is missing.",
        };
      }

      const nextUser = mapApiUserToUser(apiUser);
      setUser(nextUser);
      setStoredUser(nextUser);

      if (nextToken) {
        setToken(nextToken);
        setStoredToken(nextToken);
      }

      return { ok: true as const, user: nextUser };
    } catch (e) {
      const message =
        e instanceof ApiError
          ? e.message
          : e instanceof Error
            ? e.message
            : "Login failed.";
      return { ok: false as const, message };
    }
  };

  const register = async (userData: RegisterRequest) => {
    try {
      await registerMutation.mutateAsync(userData);
      return { ok: true as const };
    } catch (e) {
      const message =
        e instanceof ApiError
          ? e.message
          : e instanceof Error
            ? e.message
            : "Registration failed.";
      return { ok: false as const, message };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user && !!token,
        isAuthLoading: !hasRestoredSession || tokenValidationQuery.isFetching,
        loginIsLoading: loginMutation.isPending,
        registerIsLoading: registerMutation.isPending,
        login,
        logout,
        updateUser,
        register,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
