"use client";

import { Pause, Play, SpeakerHigh } from "@phosphor-icons/react";
import { useEffect, useRef, useState } from "react";

export function QuranAudioPlayer({
  src,
  compact = false,
  label = "Écouter le verset",
}: {
  src?: string;
  compact?: boolean;
  label?: string;
}) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const update = () => {
      setProgress(audio.duration ? (audio.currentTime / audio.duration) * 100 : 0);
    };
    const stop = () => setPlaying(false);
    audio.addEventListener("timeupdate", update);
    audio.addEventListener("ended", stop);
    return () => {
      audio.removeEventListener("timeupdate", update);
      audio.removeEventListener("ended", stop);
    };
  }, []);

  const toggle = async () => {
    const audio = audioRef.current;
    if (!audio || !src) return;
    if (audio.paused) {
      await audio.play();
      setPlaying(true);
    } else {
      audio.pause();
      setPlaying(false);
    }
  };

  return (
    <div className={compact ? "audio-player compact" : "audio-player"}>
      <audio ref={audioRef} src={src} preload="metadata" />
      <button
        className="btn btn-secondary btn-icon"
        onClick={toggle}
        type="button"
        disabled={!src}
        aria-label={src ? (playing ? "Mettre en pause" : label) : "Audio disponible après configuration de la source"}
        title={src ? label : "Configure Quran Foundation pour charger les récitations"}
      >
        {playing ? <Pause size={20} weight="fill" /> : <Play size={20} weight="fill" />}
      </button>
      {!compact ? (
        <>
          <SpeakerHigh size={18} aria-hidden="true" />
          <div className="progress-track" aria-label="Progression audio">
            <div className="progress-fill" style={{ width: `${progress}%` }} />
          </div>
          <span className="muted">{src ? label : "Audio à connecter"}</span>
        </>
      ) : null}
    </div>
  );
}
