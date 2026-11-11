import { act, cleanup, render, screen, waitFor } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Providers } from "@/app/providers";
import { useAuth } from "@/contexts/AuthContext";
import { createI18n } from "@/i18n";
import Profile from "@/views/Profile";

const { validateToken, replace } = vi.hoisted(() => {
  process.env.NEXT_PUBLIC_API_BASE_URL = "http://localhost:8765";
  return { validateToken: vi.fn(), replace: vi.fn() };
});

vi.mock("@/api/auth", async (importOriginal) => ({
  ...await importOriginal<typeof import("@/api/auth")>(),
  isTokenValid: validateToken,
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace }),
  usePathname: () => "/profile",
}));

const storedUser = {
  id: "42",
  name: "Saved Donor",
  email: "donor@example.com",
  role: "USERROLE",
  bloodGroup: "A+",
};

function AuthStatus() {
  const { user, isAuthLoading, isAuthenticated, logout } = useAuth();
  return (
    <>
      <p>{isAuthLoading ? "restoring" : isAuthenticated ? user.name : "anonymous"}</p>
      <button onClick={logout}>Log out</button>
    </>
  );
}

beforeEach(() => {
  localStorage.clear();
  vi.clearAllMocks();
});

afterEach(cleanup);

describe("Next.js session restoration", () => {
  it("renders safely on the server without reading the browser session", () => {
    localStorage.setItem("bloodlink_user", JSON.stringify(storedUser));
    localStorage.setItem("bloodlink_token", "saved-token");

    const html = renderToString(<Providers><AuthStatus /></Providers>);

    expect(html).toContain("restoring");
    expect(html).not.toContain("Saved Donor");
    expect(validateToken).not.toHaveBeenCalled();
  });

  it("waits for a saved session to validate before redirecting a protected route", async () => {
    let finishValidation: (value: unknown) => void;
    validateToken.mockReturnValue(new Promise((resolve) => { finishValidation = resolve; }));
    localStorage.setItem("bloodlink_user", JSON.stringify(storedUser));
    localStorage.setItem("bloodlink_token", "saved-token");

    render(<Providers><Profile /></Providers>);

    await waitFor(() => expect(validateToken).toHaveBeenCalledWith("saved-token"));
    expect(replace).not.toHaveBeenCalled();

    await act(async () => { finishValidation({ valid: true }); });

    expect(await screen.findByRole("heading", { name: "Saved Donor" })).toBeInTheDocument();
    expect(replace).not.toHaveBeenCalled();
  });

  it("clears an invalid session and redirects to login", async () => {
    validateToken.mockResolvedValue({ valid: false });
    localStorage.setItem("bloodlink_user", JSON.stringify(storedUser));
    localStorage.setItem("bloodlink_token", "expired-token");

    render(<Providers><Profile /></Providers>);

    await waitFor(() => expect(replace).toHaveBeenCalledWith("/login"));
    expect(localStorage.getItem("bloodlink_token")).toBeNull();
    expect(localStorage.getItem("bloodlink_user")).toBeNull();
  });

  it("redirects an anonymous visitor to login", async () => {
    render(<Providers><Profile /></Providers>);

    await waitFor(() => expect(replace).toHaveBeenCalledWith("/login"));
    expect(validateToken).not.toHaveBeenCalled();
  });
});

describe("server-rendered translations", () => {
  it("keeps language state isolated between provider instances", async () => {
    const first = createI18n();
    const second = createI18n();

    await first.changeLanguage("en");

    expect(first.language).toBe("en");
    expect(second.language).toBe("bn");
  });

  it("restores the saved language after mounting", async () => {
    localStorage.setItem("i18nextLng", "en");

    render(<Providers><AuthStatus /></Providers>);

    await waitFor(() => expect(document.documentElement.lang).toBe("en"));
    expect(localStorage.getItem("i18nextLng")).toBe("en");
  });
});
