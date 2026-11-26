"use client";

import {
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  CloudArrowUp,
  DeviceMobile,
  Eye,
  EyeSlash,
  GoogleLogo,
  LockKey,
  Sparkle,
  WarningCircle,
} from "@phosphor-icons/react";
import { AnimatePresence, motion, useAnimate, useMotionValue, useReducedMotion, useSpring, useTransform } from "motion/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { LogoMark } from "@/components/logo";
import { Segmented } from "@/components/segmented";
import { signIn, signUp, useSession } from "@/lib/auth-client";

type Mode = "connexion" | "inscription";

/** Messages d'erreur de Better Auth, en clair. */
function explain(error: { code?: string; status?: number; message?: string } | null | undefined): string {
  if (!error) return "Une erreur est survenue. Réessaie.";
  if (error.status === 429) return "Trop d'essais d'un coup. Attends une minute avant de réessayer.";
  switch (error.code) {
    case "INVALID_EMAIL_OR_PASSWORD":
      return "E-mail ou mot de passe incorrect.";
    case "USER_ALREADY_EXISTS":
    case "USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL":
      return "Un compte existe déjà avec cet e-mail. Connecte-toi plutôt.";
    case "PASSWORD_TOO_SHORT":
      return "Le mot de passe doit faire au moins 8 caractères.";
    case "PASSWORD_TOO_LONG":
      return "Le mot de passe est trop long (128 caractères au plus).";
    case "INVALID_EMAIL":
      return "Cette adresse e-mail n'a pas l'air valide.";
    default:
      return error.status && error.status >= 500
        ? "Le serveur ne répond pas pour l'instant. Ta progression reste sur cet appareil ; réessaie plus tard."
        : "Impossible de continuer. Vérifie tes informations.";
  }
}

/** Indice de robustesse simple (longueur + variété), sans prétention cryptographique. */
function strength(password: string): 0 | 1 | 2 | 3 | 4 {
  if (!password) return 0;
  let score = password.length >= 8 ? 1 : 0;
  if (password.length >= 12) score += 1;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score += 1;
  if (/\d/.test(password) && /[^A-Za-z0-9]/.test(password)) score += 1;
  return Math.min(4, Math.max(password.length > 0 ? 1 : 0, score)) as 0 | 1 | 2 | 3 | 4;
}
const STRENGTH = ["", "Faible", "Correct", "Bon", "Excellent"];

const PERKS = [
  { icon: CloudArrowUp, text: "Ta progression sauvegardée en ligne" },
  { icon: DeviceMobile, text: "Reprends sur ton téléphone ou ton ordinateur" },
  { icon: LockKey, text: "Aucune publicité, aucune revente de données" },
];

export function AuthScreen({ initialMode, next, googleEnabled }: { initialMode: Mode; next: string; googleEnabled: boolean }) {
  const router = useRouter();
  const reduce = useReducedMotion();
  const { data: session, isPending } = useSession();
  const [mode, setMode] = useState<Mode>(initialMode);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState<"email" | "google" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [formScope, animateForm] = useAnimate<HTMLFormElement>();

  // Le paysage suit doucement le pointeur (bureau uniquement, coupé si mouvement réduit).
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const sx = useSpring(px, { stiffness: 40, damping: 18 });
  const sy = useSpring(py, { stiffness: 40, damping: 18 });
  const vx = useTransform(sx, (v) => v * -14);
  const vy = useTransform(sy, (v) => v * -10);

  useEffect(() => {
    const video = videoRef.current;
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => {
      if (!video) return;
      if (document.hidden || motionQuery.matches) video.pause();
      else void video.play().catch(() => undefined);
    };
    sync();
    document.addEventListener("visibilitychange", sync);
    motionQuery.addEventListener("change", sync);
    const fine = window.matchMedia("(pointer: fine)").matches;
    const onMove = (event: PointerEvent) => {
      if (motionQuery.matches) return;
      px.set(event.clientX / window.innerWidth - 0.5);
      py.set(event.clientY / window.innerHeight - 0.5);
    };
    if (fine) window.addEventListener("pointermove", onMove);
    return () => {
      document.removeEventListener("visibilitychange", sync);
      motionQuery.removeEventListener("change", sync);
      window.removeEventListener("pointermove", onMove);
    };
  }, [px, py]);

  useEffect(() => {
    if (!done) return;
    const timer = setTimeout(() => {
      router.push(next);
      router.refresh();
    }, 1400);
    return () => clearTimeout(timer);
  }, [done, next, router]);

  const fail = (message: string) => {
    setError(message);
    if (!reduce && formScope.current) void animateForm(formScope.current, { x: [0, -10, 9, -6, 4, 0] }, { duration: 0.42 });
    setBusy(null);
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (busy) return;
    setError(null);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return fail("Cette adresse e-mail n'a pas l'air valide.");
    if (!password) return fail("Entre ton mot de passe.");
    if (mode === "inscription" && password.length < 8) return fail("Le mot de passe doit faire au moins 8 caractères.");
    setBusy("email");
    if (mode === "inscription") {
      const { data, error: failure } = await signUp.email({ name: name.trim() || email.split("@")[0], email: email.trim(), password });
      if (failure || !data) return fail(explain(failure));
      setDone(data.user.name || "toi");
    } else {
      const { data, error: failure } = await signIn.email({ email: email.trim(), password });
      if (failure || !data) return fail(explain(failure));
      setDone(data.user.name || "toi");
    }
    setBusy(null);
  };

  const google = async () => {
    setError(null);
    setBusy("google");
    const { error: failure } = await signIn.social({ provider: "google", callbackURL: next });
    if (failure) fail(explain(failure));
  };

  const spring = reduce ? { duration: 0.2 } : { type: "spring" as const, bounce: 0.22, duration: 0.7 };
  const level = strength(password);
  const signedIn = Boolean(session) && !done;

  return (
    <div className="auth">
      <motion.div className="auth-backdrop" aria-hidden="true" style={reduce ? undefined : { x: vx, y: vy }}>
        <video ref={videoRef} className="auth-video" muted loop playsInline autoPlay preload="auto" poster="/media/desert-poster.webp" tabIndex={-1}>
          <source src="/media/desert-1440.webm" type="video/webm" media="(min-width: 800px)" />
          <source src="/media/desert-1440.mp4" type="video/mp4" media="(min-width: 800px)" />
          <source src="/media/desert-720.mp4" type="video/mp4" />
        </video>
      </motion.div>
      <div className="auth-veil" aria-hidden="true" />
      <div className="auth-stars" aria-hidden="true" />

      <header className="auth-top">
        <Link href="/" className="auth-brand" aria-label="Kalima, retour à l'accueil">
          <LogoMark size={30} />
          <span className="brand-word">Kalima</span>
        </Link>
        <Link href="/aujourdhui" className="btn small ghost auth-skip">
          <span className="auth-skip-long">Continuer sans compte</span>
          <span className="auth-skip-short">Sans compte</span> <ArrowRight aria-hidden="true" />
        </Link>
      </header>

      <main id="contenu" className="auth-main">
        <motion.section
          className="auth-pitch"
          initial={reduce ? { opacity: 0 } : { opacity: 0, y: 24, filter: "blur(10px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ ...spring, delay: reduce ? 0 : 0.1 }}
        >
          <span className="auth-eyebrow">
            <Sparkle weight="fill" aria-hidden="true" /> Ton compte Kalima
          </span>
          <h1 className="auth-title">
            Ta progression
            <br />
            <span className="auth-title-glow">te suit partout.</span>
          </h1>
          <p className="auth-lead">Lettres apprises, versets mémorisés, révisions du jour : tout reste avec toi, sur chaque appareil.</p>
          <ul className="auth-perks">
            {PERKS.map(({ icon: Icon, text }, index) => (
              <motion.li
                key={text}
                initial={reduce ? { opacity: 0 } : { opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ ...spring, delay: reduce ? 0 : 0.35 + index * 0.08 }}
              >
                <span className="auth-perk-icon">
                  <Icon weight="duotone" aria-hidden="true" />
                </span>
                {text}
              </motion.li>
            ))}
          </ul>
        </motion.section>

        <motion.section
          className="auth-card glass float"
          aria-labelledby="auth-heading"
          initial={reduce ? { opacity: 0 } : { opacity: 0, y: 40, scale: 0.94, filter: "blur(14px)" }}
          animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
          transition={{ ...spring, delay: reduce ? 0 : 0.2 }}
        >
          <div className="auth-card-sheen" aria-hidden="true" />
          <AnimatePresence mode="wait" initial={false}>
            {done ? (
              <motion.div
                key="done"
                className="auth-done"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={spring}
                role="status"
              >
                <motion.span
                  className="auth-done-icon"
                  initial={reduce ? false : { scale: 0, rotate: -30 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={reduce ? { duration: 0 } : { type: "spring", bounce: 0.55, duration: 0.8, delay: 0.1 }}
                >
                  <CheckCircle weight="fill" aria-hidden="true" />
                </motion.span>
                <h2 id="auth-heading">Bienvenue, {done} !</h2>
                <p className="muted">On rassemble ta progression… Tout ce que tu as fait sur cet appareil est conservé.</p>
              </motion.div>
            ) : signedIn ? (
              <motion.div key="signed" className="auth-done" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <span className="auth-done-icon">
                  <CheckCircle weight="fill" aria-hidden="true" />
                </span>
                <h2 id="auth-heading">Tu es déjà connecté·e</h2>
                <p className="muted">{session?.user.email}</p>
                <div className="auth-done-actions">
                  <Link href={next} className="btn primary block">
                    Continuer <ArrowRight aria-hidden="true" />
                  </Link>
                  <Link href="/compte" className="btn block">
                    Mon compte
                  </Link>
                </div>
              </motion.div>
            ) : (
              <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, scale: 0.97 }} transition={{ duration: 0.2 }}>
                <div className="auth-card-head">
                  <h2 id="auth-heading">{mode === "connexion" ? "Content de te revoir" : "Créer ton compte"}</h2>
                  <p className="muted">{mode === "connexion" ? "Connecte-toi pour retrouver ta progression." : "Gratuit, en trente secondes."}</p>
                </div>

                <Segmented<Mode>
                  label="Choisir entre connexion et création de compte"
                  value={mode}
                  onChange={(value) => {
                    setMode(value);
                    setError(null);
                  }}
                  options={[
                    { value: "connexion", label: "Se connecter" },
                    { value: "inscription", label: "Créer un compte" },
                  ]}
                />

                {googleEnabled ? (
                  <>
                    <button type="button" className="btn block auth-google" onClick={google} disabled={busy !== null}>
                      {busy === "google" ? <span className="auth-spinner" aria-hidden="true" /> : <GoogleLogo weight="bold" aria-hidden="true" />}
                      Continuer avec Google
                    </button>
                    <div className="auth-or" role="separator">
                      <span>ou avec ton e-mail</span>
                    </div>
                  </>
                ) : null}

                <form ref={formScope} className="auth-form" onSubmit={submit} noValidate>
                  <AnimatePresence initial={false}>
                    {mode === "inscription" ? (
                      <motion.div
                        key="name"
                        className="auth-collapse"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={reduce ? { duration: 0 } : { type: "spring", bounce: 0, duration: 0.4 }}
                      >
                        <label className="auth-field">
                          <span>Prénom</span>
                          <input
                            type="text"
                            name="name"
                            autoComplete="given-name"
                            placeholder="Comment t'appeler ?"
                            value={name}
                            maxLength={60}
                            onChange={(event) => setName(event.target.value)}
                          />
                        </label>
                      </motion.div>
                    ) : null}
                  </AnimatePresence>

                  <label className="auth-field">
                    <span>E-mail</span>
                    <input
                      type="email"
                      name="email"
                      autoComplete="email"
                      inputMode="email"
                      placeholder="toi@exemple.fr"
                      required
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                    />
                  </label>

                  <label className="auth-field">
                    <span>Mot de passe</span>
                    <span className="auth-password">
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        autoComplete={mode === "connexion" ? "current-password" : "new-password"}
                        placeholder={mode === "connexion" ? "Ton mot de passe" : "8 caractères minimum"}
                        required
                        minLength={mode === "inscription" ? 8 : undefined}
                        maxLength={128}
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                      />
                      <button
                        type="button"
                        className="auth-eye"
                        aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                        aria-pressed={showPassword}
                        onClick={() => setShowPassword((value) => !value)}
                      >
                        {showPassword ? <EyeSlash aria-hidden="true" /> : <Eye aria-hidden="true" />}
                      </button>
                    </span>
                  </label>

                  <AnimatePresence initial={false}>
                    {mode === "inscription" && password ? (
                      <motion.div
                        key="strength"
                        className="auth-strength"
                        data-level={level}
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                      >
                        <span className="auth-strength-bars" aria-hidden="true">
                          {[1, 2, 3, 4].map((step) => (
                            <i key={step} data-on={level >= step} />
                          ))}
                        </span>
                        <span className="auth-strength-label">{STRENGTH[level]}</span>
                      </motion.div>
                    ) : null}
                  </AnimatePresence>

                  <AnimatePresence>
                    {error ? (
                      <motion.p
                        key={error}
                        className="auth-error"
                        role="alert"
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                      >
                        <WarningCircle weight="fill" aria-hidden="true" /> {error}
                      </motion.p>
                    ) : null}
                  </AnimatePresence>

                  <button type="submit" className="btn primary block auth-submit" disabled={busy !== null || isPending}>
                    {busy === "email" ? <span className="auth-spinner dark" aria-hidden="true" /> : null}
                    {mode === "connexion" ? "Se connecter" : "Créer mon compte"}
                    {busy === "email" ? null : <ArrowRight aria-hidden="true" />}
                  </button>
                </form>

                <p className="auth-note">
                  Ce que tu as déjà fait sur cet appareil sera ajouté à ton compte : rien n&apos;est perdu.
                  {mode === "connexion" ? " Mot de passe oublié ? La récupération par e-mail arrive bientôt." : null}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.section>
      </main>

      <footer className="auth-foot">
        <Link href="/" className="auth-back">
          <ArrowLeft aria-hidden="true" /> Accueil
        </Link>
        <span>Vidéo : « Purple desert », GetLayers</span>
      </footer>
    </div>
  );
}
