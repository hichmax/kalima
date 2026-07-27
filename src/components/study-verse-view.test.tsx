import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { StudyVerseView } from "@/components/study-verse-view";
import { featuredAyah } from "@/data/quran-fixtures";
import { Providers } from "@/components/providers";

describe("StudyVerseView", () => {
  it("makes individual words interactive only in study mode", () => {
    render(
      <Providers>
        <StudyVerseView ayah={featuredAyah} />
      </Providers>,
    );
    const words = screen.getAllByTestId("study-word");
    expect(words).toHaveLength(featuredAyah.words.length);
    fireEvent.click(words[1]);
    expect(screen.getByRole("complementary", { name: /Fiche du mot/ })).toBeInTheDocument();
  });
});
