"use client";

import { Pause, SpeakerHigh } from "@phosphor-icons/react";
import { useEffect, useRef, useState } from "react";
import { alphabetLetters } from "@/data/lessons";

export function AlphabetAudioGrid() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playingName, setPlayingName] = useState<string | null>(null);
  const [audioError, setAudioError] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const stop = () => setPlayingName(null);
    audio.addEventListener("ended", stop);
    audio.addEventListener("error", stop);

    return () => {
      audio.pause();
      audio.removeEventListener("ended", stop);
      audio.removeEventListener("error", stop);
    };
  }, []);

  const playLetter = async (
    name: string,
    audioSrc: string,
    spokenArabic: string,
  ) => {
    const audio = audioRef.current;
    if (!audio) return;

    if (playingName === name && !audio.paused) {
      audio.pause();
      setPlayingName(null);
      return;
    }

    audio.pause();
    audio.src = audioSrc;
    audio.currentTime = 0;
    setAudioError(false);

    try {
      await audio.play();
      setPlayingName(name);
    } catch {
      setPlayingName(null);
      setAudioError(true);

      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(spokenArabic);
        utterance.lang = "ar";
        utterance.rate = 0.72;
        window.speechSynthesis.speak(utterance);
      }
    }
  };

  return (
    <div className="alphabet-audio">
      <audio ref={audioRef} preload="none" />
      <div className="alphabet-grid" aria-label="Les 28 lettres arabes avec audio">
        {alphabetLetters.map((letter) => {
          const playing = playingName === letter.name;

          return (
            <article key={letter.name}>
              <span className="quran-text" lang="ar" dir="rtl">
                {letter.arabic}
              </span>
              <strong>{letter.name}</strong>
              <small>{letter.sound}</small>
              <button
                className={`alphabet-audio-button ${playing ? "playing" : ""}`}
                type="button"
                onClick={() =>
                  playLetter(
                    letter.name,
                    letter.audioSrc,
                    letter.spokenArabic,
                  )
                }
                aria-label={
                  playing
                    ? `Mettre en pause ${letter.name}`
                    : `Écouter ${letter.name}`
                }
                aria-pressed={playing}
                title={`Écouter le nom et le son de ${letter.name}`}
              >
                {playing ? (
                  <Pause size={18} weight="fill" />
                ) : (
                  <SpeakerHigh size={18} weight="fill" />
                )}
              </button>
            </article>
          );
        })}
      </div>
      <p className="alphabet-audio-note">
        Appuie sur le haut-parleur pour entendre le nom de la lettre, puis son
        son avec fatḥa.
      </p>
      {audioError ? (
        <p className="sr-only" role="status">
          Le fichier audio n’a pas pu être lu. La voix arabe de ton appareil a
          été utilisée.
        </p>
      ) : null}
    </div>
  );
}
