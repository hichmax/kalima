import { describe, expect, it } from "vitest";
import { normalizeBaseUrl } from "./base-url";

describe("normalizeBaseUrl", () => {
  it("ajoute https:// à un domaine nu", () => expect(normalizeBaseUrl("kalima-six.vercel.app")).toBe("https://kalima-six.vercel.app"));
  it("garde http pour localhost", () => expect(normalizeBaseUrl("localhost:3100")).toBe("http://localhost:3100"));
  it("retire la barre finale et le chemin", () => expect(normalizeBaseUrl(" https://kalima.fr/ ")).toBe("https://kalima.fr"));
  it("ignore une valeur vide", () => expect(normalizeBaseUrl("  ")).toBeUndefined());
});
