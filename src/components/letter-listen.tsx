"use client";

import { CheckCircle, DownloadSimple, Microphone, SpeakerHigh, Stop, Warning } from "@phosphor-icons/react";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { letterRecordings, letterSpeech, muqattaat } from "@/content/letter-audio";
import { QuranText } from "@/components/quran";
import { letterSource, playLetter, useArabicVoiceStatus, type LetterPart } from "@/lib/letter-voice";
import type { QuranWord } from "@/lib/quran-types";
import { player, useRecitation } from "@/lib/recitation-client";

/** Écouter le nom puis le son d'une lettre (enregistrement humain, sinon synthèse signalée). */
export function LetterListen({ char, name }: { char: string; name: string }) {
  const speech = letterSpeech[char];
  const voice = useArabicVoiceStatus();
  const [failed, setFailed] = useState(false);
  if (!speech) return null;
  const synthetic = letterSource(char, "name") === "synthesis" || letterSource(char, "sound") === "synthesis";

  const play = (part: LetterPart) => setFailed(!playLetter(char, part));

  return (
    <section className="letter-listen stack" style={{ "--gap": "8px" } as React.CSSProperties} aria-label="Écouter la lettre">
      <div className="listen-pair">
        <button type="button" className="btn listen-btn" onClick={() => play("name")}>
          <SpeakerHigh weight="fill" aria-hidden="true" />
          <span className="listen-main">Le nom</span>
          <span className="ar listen-ar" lang="ar">{speech.nameAr}</span>
          <span className="listen-ph">{name}</span>
        </button>
        <button type="button" className="btn listen-btn" onClick={() => play("sound")}>
          <SpeakerHigh weight="fill" aria-hidden="true" />
          <span className="listen-main">Le son</span>
          <span className="ar listen-ar" lang="ar">{speech.soundAr}</span>
          <span className="listen-ph">{speech.soundPh}</span>
        </button>
      </div>
      {synthetic ? (
        <p className="faint listen-note">
          <Warning aria-hidden="true" />{" "}
          {voice === "none" || voice === "unsupported"
            ? "Ton appareil n'a pas de voix arabe installée : écoute le mot du Coran ci-dessous."
            : "Voix de synthèse de ton appareil, indicative : elle peut mal prononcer certaines lettres (ع ح ق…). Un enregistrement par un récitant la remplacera."}
        </p>
      ) : (
        <p className="faint listen-note">
          <CheckCircle aria-hidden="true" /> Enregistré par {letterRecordings[char]?.recordedBy}.
        </p>
      )}
      {failed ? <p className="faint">Impossible de jouer le son sur cet appareil.</p> : null}
    </section>
  );
}

const textCache = new Map<number, Promise<{ verses: Array<{ v: number; w: QuranWord[] }> }>>();
const loadText = (n: number) => {
  if (!textCache.has(n)) textCache.set(n, fetch(`/api/sourate/${n}`).then((r) => r.json()));
  return textCache.get(n)!;
};

/** La lettre telle que Mishary al-ʿAfāsī la récite en tête de sourate (vrai audio). */
export function MuqattaaListen({ char }: { char: string }) {
  const entry = muqattaat[char];
  const [s, v, w] = entry ? entry.ref.split(":").map(Number) : [0, 0, 0];
  const recitation = useRecitation(entry ? s : null, "afasy");
  const [word, setWord] = useState<QuranWord | null>(null);

  useEffect(() => {
    if (!entry) return;
    let alive = true;
    void loadText(s).then((payload) => {
      if (alive) setWord(payload.verses[v - 1]?.w[w - 1] ?? null);
    });
    return () => {
      alive = false;
    };
  }, [entry, s, v, w]);

  if (!entry) return null;
  const audio = recitation?.verses?.find((x) => x.v === v)?.words[w - 1] ?? null;
  return (
    <section className="example muqattaa">
      <span className="faint">
        {entry.alone ? "Récitée seule en tête de sourate" : "Récitée dans les lettres qui ouvrent une sourate"} · Coran {s}:{v}
      </span>
      <div className="row between">
        {word ? <QuranText words={[word]} size="2rem" /> : <span />}
        {audio ? (
          <button type="button" className="btn small" onClick={() => void player.play(audio)}>
            <SpeakerHigh weight="fill" aria-hidden="true" /> Mishary : {entry.ph}
          </button>
        ) : (
          <span className="faint">{entry.ph}</span>
        )}
      </div>
    </section>
  );
}

/** Mode enregistrement (/alphabet?enregistrement=1) : réservé à l'enseignant qui enregistre les lettres. */
export function useRecordingMode(): boolean {
  return useSyncExternalStore(
    () => () => {},
    () => new URLSearchParams(window.location.search).has("enregistrement"),
    () => false,
  );
}

export function LetterRecorder({ char }: { char: string }) {
  const speech = letterSpeech[char];
  if (!speech) return null;
  return (
    <section className="recorder stack" style={{ "--gap": "8px" } as React.CSSProperties}>
      <span className="eyebrow plain">Mode enregistrement</span>
      <p className="faint">
        Enregistre d&apos;abord le nom (« {speech.nameAr} »), puis le son seul (« {speech.soundAr} »). Les fichiers se
        téléchargent avec le bon nom ; envoie-les ensuite pour qu&apos;ils soient intégrés.
      </p>
      <RecordButton label={`Nom : ${speech.nameAr}`} filename={`${speech.slug}-nom`} />
      <RecordButton label={`Son : ${speech.soundAr}`} filename={`${speech.slug}-son`} />
    </section>
  );
}

function RecordButton({ label, filename }: { label: string; filename: string }) {
  const [state, setState] = useState<"idle" | "recording" | "ready" | "denied">("idle");
  const [url, setUrl] = useState<string | null>(null);
  const [extension, setExtension] = useState("webm");
  const recorder = useRef<MediaRecorder | null>(null);

  useEffect(
    () => () => {
      if (url) URL.revokeObjectURL(url);
    },
    [url],
  );

  const start = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: false, noiseSuppression: true } });
      const chunks: Blob[] = [];
      const rec = new MediaRecorder(stream);
      rec.ondataavailable = (event) => chunks.push(event.data);
      rec.onstop = () => {
        stream.getTracks().forEach((track) => track.stop());
        const type = rec.mimeType || "audio/webm";
        setExtension(type.includes("mp4") ? "m4a" : type.includes("ogg") ? "ogg" : "webm");
        setUrl(URL.createObjectURL(new Blob(chunks, { type })));
        setState("ready");
      };
      recorder.current = rec;
      rec.start();
      setState("recording");
    } catch {
      setState("denied");
    }
  };

  return (
    <div className="record-row">
      <span className="ar record-label" lang="ar">{label}</span>
      {state === "recording" ? (
        <button type="button" className="btn small recording" onClick={() => recorder.current?.stop()}>
          <Stop weight="fill" aria-hidden="true" /> Arrêter
        </button>
      ) : (
        <button type="button" className="btn small" onClick={() => void start()}>
          <Microphone weight="fill" aria-hidden="true" /> {state === "ready" ? "Refaire" : "Enregistrer"}
        </button>
      )}
      {url ? (
        <>
          <audio controls src={url} className="recording-audio" />
          <a className="btn small" href={url} download={`${filename}.${extension}`}>
            <DownloadSimple aria-hidden="true" /> {filename}.{extension}
          </a>
        </>
      ) : null}
      {state === "denied" ? <span className="faint">Micro refusé ou indisponible.</span> : null}
    </div>
  );
}
