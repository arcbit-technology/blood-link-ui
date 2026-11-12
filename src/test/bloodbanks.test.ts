import { describe, expect, it, vi } from "vitest";

vi.hoisted(() => {
  process.env.NEXT_PUBLIC_API_BASE_URL = "http://localhost:8765";
});

import { camelize, queryString } from "@/api/camelize";
import { ApiError } from "@/api/http";
import { apiErrorCode, apiErrorMessage } from "@/lib/apiErrors";
import { failMessage, mergeMessage } from "@/hooks/useChat";
import { upazilasOf } from "@/components/common/LocationSelect";
import { DISTRICTS, DIVISIONS, UPAZILAS } from "@/data/locations";
import { createI18n } from "@/i18n";
import en from "@/locales/en.json";
import bn from "@/locales/bn.json";
import type { ChatMessage } from "@/types";

describe("camelize", () => {
  it("converts nested keys, including inside arrays", () => {
    const out = camelize({
      blood_bank_id: 1,
      members: [{ first_name: "Rahim", joined_at: null }],
      last_message: { sender_id: 2 },
    });
    expect(out).toEqual({
      bloodBankId: 1,
      members: [{ firstName: "Rahim", joinedAt: null }],
      lastMessage: { senderId: 2 },
    });
  });

  it("builds query strings without empty values", () => {
    expect(queryString({ a: "x y", b: "", c: undefined, d: 0 })).toBe("?a=x+y&d=0");
    expect(queryString({})).toBe("");
  });
});

describe("apiErrorMessage", () => {
  const i18n = createI18n();
  const t = i18n.getFixedT("en");

  it("translates API error keys", () => {
    const err = new ApiError("api.bloodlinkapi.err.199", 409, { error: "api.bloodlinkapi.err.199" });
    expect(apiErrorCode(err)).toBe("199");
    expect(apiErrorMessage(err, t)).toBe(en.apiErrors["199"]);
  });

  it("falls back for unknown errors and maps 403", () => {
    expect(apiErrorMessage(new Error("boom"), t, "fallback")).toBe("fallback");
    expect(apiErrorMessage(new ApiError("nope", 403, null), t)).toBe(en.apiErrors.forbidden);
  });

  it("has a translation for every new error code in both languages", () => {
    for (let code = 195; code <= 218; code++) {
      expect(en.apiErrors).toHaveProperty(String(code));
      expect(bn.apiErrors).toHaveProperty(String(code));
    }
  });
});

describe("chat message cache", () => {
  const msg = (over: Partial<ChatMessage>): ChatMessage => ({
    id: 1,
    conversationId: 7,
    senderId: 1,
    senderName: "A",
    body: "hi",
    createdAt: "2026-11-12T10:00:00Z",
    ...over,
  });
  const data = (pages: ChatMessage[][]) => ({ pages, pageParams: pages.map(() => undefined) });

  it("replaces the optimistic message with the server echo", () => {
    const optimistic = msg({ id: -1, clientId: "c1", pending: true });
    const merged = mergeMessage(data([[optimistic]]), msg({ id: 10, clientId: "c1" }));
    expect(merged?.pages[0]).toEqual([expect.objectContaining({ id: 10, pending: false, clientId: "c1" })]);
  });

  it("ignores duplicates and appends new messages to the newest page", () => {
    const start = data([[msg({ id: 10 })], [msg({ id: 3 })]]);
    expect(mergeMessage(start, msg({ id: 10 }))).toBe(start);
    const next = mergeMessage(start, msg({ id: 11 }));
    expect(next?.pages[0].map((m) => m.id)).toEqual([10, 11]);
    expect(next?.pages[1].map((m) => m.id)).toEqual([3]);
  });

  it("marks a pending message as failed", () => {
    const failed = failMessage(data([[msg({ id: -1, clientId: "c2", pending: true })]]), "c2");
    expect(failed?.pages[0][0]).toMatchObject({ failed: true, pending: false });
  });
});

describe("location data", () => {
  it("has upazilas for every district", () => {
    for (const division of DIVISIONS) {
      for (const district of DISTRICTS[division]) {
        expect(upazilasOf(district).length, district).toBeGreaterThan(0);
      }
    }
  });

  it("includes the Dhaka Metropolitan thanas", () => {
    expect(UPAZILAS.Dhaka).toEqual(expect.arrayContaining(["Savar", "Dhanmondi", "Mirpur Model", "Uttara West"]));
  });

  it("translates every upazila / thana in both languages", () => {
    const names = new Set(Object.values(UPAZILAS).flat());
    const enUpazila = en.location.upazila as Record<string, string>;
    const bnUpazila = bn.location.upazila as Record<string, string>;
    for (const name of names) {
      expect(enUpazila[name], `en ${name}`).toBeTruthy();
      expect(bnUpazila[name], `bn ${name}`).toBeTruthy();
    }
  });
});
