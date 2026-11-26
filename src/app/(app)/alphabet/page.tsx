import type { Metadata } from "next";
import { AlphabetTrainer } from "@/components/alphabet-trainer";
import { alphabet } from "@/content/alphabet";
import { resolveRef } from "@/lib/quran-data";

export const metadata: Metadata = { title: "L'alphabet" };

export default async function AlphabetPage() {
  // Chaque lettre est illustrée par un mot réel du Coran (texte Tanzil), dans son verset.
  const examples = await Promise.all(
    alphabet.map(async (letter) => {
      const [s, v] = letter.example.split(":");
      const verse = await resolveRef(`${s}:${v}`);
      return { char: letter.char, ref: letter.example, words: verse.words };
    }),
  );
  return (
    <main className="container page stack" style={{ "--gap": "22px" } as React.CSSProperties}>
      <header className="stack" style={{ "--gap": "10px" } as React.CSSProperties}>
        <span className="eyebrow plain">Les fondations</span>
        <h1>L&apos;alphabet</h1>
        <p className="lead">
          28 lettres et la hamza. Apprends-les avec un mot récité, entraîne-toi avec des quiz, puis laisse la répétition
          espacée les ancrer pour de bon.
        </p>
      </header>
      <AlphabetTrainer examples={examples} />
    </main>
  );
}
