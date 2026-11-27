"use client";

import { CardsThree } from "@phosphor-icons/react";
import Link from "next/link";
import { useState } from "react";
import { activeDecks } from "@/lib/decks";
import { ReviewSession } from "@/components/review-session";
import { dueCardIds, isDeckCard, knownCount } from "@/lib/srs";
import { parseDeckCard } from "@/lib/study-types";
import { useHydrated, useKalima } from "@/lib/storage";

const KINDS = [
  ["letter", "lettres"],
  ["sign", "signes"],
  ["rule", "règles"],
  ["lemma", "mots"],
  ["verse", "versets"],
  ["concept", "notions"],
] as const;

export function ReviewPage() {
  const state = useKalima();
  const hydrated = useHydrated();
  const [session, setSession] = useState(0);
  const [running, setRunning] = useState(false);
  if (!hydrated) return null;
  const dueIds = dueCardIds(state);
  const due = dueIds.length;
  const decks = activeDecks(state);
  const deckDue = dueIds.filter((id) => parseDeckCard(id) !== null).length;
  const deckKnown = Object.values(state.cards).filter((card) => isDeckCard(card.kind)).length;

  return (
    <div className="stack" style={{ "--gap": "18px" } as React.CSSProperties}>
      <section className="stats stats-6">
        {KINDS.map(([kind, label]) => (
          <div key={kind} className="glass thin stat">
            <span className="stat-value num">{knownCount(state, kind)}</span>
            <span className="stat-label">{label}</span>
          </div>
        ))}
      </section>
      {running ? (
        <ReviewSession key={session} mode={{ kind: "due", limit: 30, decks: true }} onDone={() => setRunning(false)} />
      ) : (
        <div className="glass card stack" style={{ "--gap": "12px" } as React.CSSProperties}>
          <h2 className="h3">{due ? `${due} cartes à réviser` : "Tout est à jour"}</h2>
          <p className="muted">
            {due
              ? "Une séance compte au plus 30 cartes. Les plus en retard passent en premier."
              : "Reviens plus tard, ou lance le défi express pour te tester."}
          </p>
          {due ? (
            <div className="row">
              <button
                type="button"
                className="btn primary"
                onClick={() => {
                  setSession((s) => s + 1);
                  setRunning(true);
                }}
              >
                Commencer la révision
              </button>
            </div>
          ) : null}
        </div>
      )}
      {!running ? (
        <Link href="/cartes" className="glass card deck-link">
          <CardsThree aria-hidden="true" weight="duotone" />
          <span className="stack" style={{ "--gap": "2px" } as React.CSSProperties}>
            <strong>Mes cartes</strong>
            <span className="faint">
              {decks.length
                ? `${decks.length} paquet${decks.length > 1 ? "s" : ""} · ${deckKnown} carte${deckKnown > 1 ? "s" : ""} vue${deckKnown > 1 ? "s" : ""}${deckDue ? ` · ${deckDue} dans cette révision` : ""}`
                : "Crée des flashcards et des quiz à partir des versets de ton choix."}
            </span>
          </span>
        </Link>
      ) : null}
      {!running ? (
        <section className="stack" style={{ "--gap": "12px" } as React.CSSProperties}>
          <h2 className="h3">Défi express</h2>
          <ReviewSession key={`defi-${session}`} mode={{ kind: "challenge", size: 5 }} />
        </section>
      ) : null}
    </div>
  );
}
