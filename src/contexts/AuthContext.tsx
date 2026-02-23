import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
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
  register: (
    userData: RegisterRequest,
  ) => Promise<{ ok: true } | { ok: false; message: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const queryClient = useQueryClient();
  const [user, setUser] = useState<User | null>(() => getStoredUser<User>());
  const [token, setToken] = useState<string | null>(() => getStoredToken());

  const mapApiUserToAppUser = useMemo(
    () =>
      (apiUser: ApiUser): User => {
        const firstName =
          typeof apiUser.first_name === "string" ? apiUser.first_name : "";
        const lastName =
          typeof apiUser.last_name === "string" ? apiUser.last_name : "";
        const fullName = [firstName, lastName].filter(Boolean).join(" ");
        const email = typeof apiUser.email === "string" ? apiUser.email : "";
        const phone = typeof apiUser.phone === "string" ? apiUser.phone : "";
        const address =
          typeof apiUser.address === "string" ? apiUser.address : "";
        const district =
          typeof apiUser.district === "string" ? apiUser.district : "";
        const division =
          typeof apiUser.division === "string" ? apiUser.division : "Dhaka";
        const genderRaw =
          typeof apiUser.gender === "string" ? apiUser.gender : "";
        const gender =
          genderRaw === "M"
            ? ("male" as const)
            : genderRaw === "F"
              ? ("female" as const)
              : (genderRaw?.toLowerCase?.() as any) || "other";
        const hidePersonalInfo =
          typeof apiUser.hide_personal_info === "boolean"
            ? apiUser.hide_personal_info
            : false;
        const apiBloodGroup =
          typeof (apiUser as any).blood_group === "string"
            ? ((apiUser as any).blood_group as string)
            : undefined;

        const roleRaw = typeof apiUser.role === "string" ? apiUser.role : "";
        const roleName =
          (roleRaw && roleRaw) ||
          (typeof apiUser.id_role === "number" && apiUser.id_role === 1
            ? "ADMIN"
            : "USERROLE");

        const id =
          typeof apiUser.id === "number"
            ? String(apiUser.id)
            : typeof apiUser.id === "string"
              ? apiUser.id
              : email || `user_${Date.now()}`;

        const backendRole = roleName.toUpperCase();
        const normalizedRole = backendRole === "ADMIN" ? "admin" : "user";

        return {
          id,
          name: fullName || email || "User",
          email,
          phone,
          gender,
          address,
          district,
          division: division as any,
          bloodGroup: (apiBloodGroup as any) || "O+",
          age: typeof apiUser.age === "number" ? apiUser.age : 0,
          occupation:
            typeof apiUser.profession === "string" ? apiUser.profession : "",
          lastDonationDate:
            typeof apiUser.donated_at === "string"
              ? apiUser.donated_at
              : undefined,
          hidePersonalInfo,
          createdAt:
            typeof apiUser.created_at === "string" ? apiUser.created_at : "",
          role: normalizedRole as any,
          ...(apiUser as any),
        };
      },
    [],
  );

  const logout = () => {
    setUser(null);
    setToken(null);
    clearStoredUser();
    clearStoredToken();
    queryClient.clear();
  };

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

    const data = tokenValidationQuery.data as any;
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
      (data as any).data?.user
        ? ((data as any).data.user as ApiUser)
        : null);

    if (maybeUser) {
      const nextUser = mapApiUserToAppUser(maybeUser);
      setUser(nextUser);
      setStoredUser(nextUser);
    }
  }, [
    mapApiUserToAppUser,
    token,
    tokenValidationQuery.data,
    tokenValidationQuery.isError,
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

      const nextUser = mapApiUserToAppUser(apiUser);
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
        isAuthLoading: tokenValidationQuery.isFetching,
        loginIsLoading: loginMutation.isPending,
        registerIsLoading: registerMutation.isPending,
        login,
        logout,
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
