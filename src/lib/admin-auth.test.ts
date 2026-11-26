import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/auth", () => ({ pool: { query: vi.fn() } }));

describe("jeton administrateur", () => {
  beforeEach(() => {
    process.env.MDP_KALIMA = "un-mot-de-passe-de-test";
    process.env.BETTER_AUTH_SECRET = "secret-de-test";
  });
  afterEach(() => {
    delete process.env.MDP_KALIMA;
  });

  it("vérifie le mot de passe", async () => {
    const { passwordMatches } = await import("./admin-auth");
    expect(passwordMatches("un-mot-de-passe-de-test")).toBe(true);
    expect(passwordMatches("autre")).toBe(false);
  });

  it("accepte un jeton frais et refuse un jeton modifié ou expiré", async () => {
    const { createAdminToken, isValidAdminToken } = await import("./admin-auth");
    const now = Date.UTC(2026, 10, 26);
    const { value } = createAdminToken(now);
    expect(isValidAdminToken(value, now + 1000)).toBe(true);
    expect(isValidAdminToken(value.replace(/.$/, (c) => (c === "A" ? "B" : "A")), now)).toBe(false);
    expect(isValidAdminToken(value, now + 13 * 3600 * 1000)).toBe(false);
  });

  it("invalide les jetons quand le mot de passe change", async () => {
    const { createAdminToken, isValidAdminToken } = await import("./admin-auth");
    const now = Date.now();
    const { value } = createAdminToken(now);
    process.env.MDP_KALIMA = "nouveau";
    expect(isValidAdminToken(value, now)).toBe(false);
  });
});
