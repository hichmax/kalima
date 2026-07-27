import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AyahCard } from "@/components/ayah-card";
import { featuredAyah } from "@/data/quran-fixtures";
import { Providers } from "@/components/providers";

describe("AyahCard reading interaction", () => {
  it("does not expose isolated words as buttons in reading mode", () => {
    render(
      <Providers>
        <AyahCard ayah={featuredAyah} />
      </Providers>,
    );
    const words = screen.getAllByTestId("reader-word");
    expect(words.length).toBeGreaterThan(1);
    words.forEach((item) => expect(item.tagName).toBe("SPAN"));
    expect(screen.getAllByRole("link", { name: /Étudier le verset/i })).toHaveLength(1);
  });

  it("links the whole ayah block to study mode", () => {
    render(
      <Providers>
        <AyahCard ayah={featuredAyah} />
      </Providers>,
    );
    expect(screen.getByTestId("ayah-reading-action")).toHaveAttribute(
      "href",
      "/coran/1/1/etude",
    );
  });
});
