"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import gsap from "gsap";
import Lenis from "lenis";
import { featured, projectBySlug, projects } from "@/content/projects";
import { hero, outro, site, statements } from "@/content/site";
import { Ambience } from "@/lib/audio";
import {
  FEATURED_COUNT,
  STATEMENT_WINDOWS,
  T,
  activeProjectIndex,
  invLerp,
  progressForProject,
  smooth,
  windowOpacity,
} from "@/lib/timeline";
import type { Zoetrope } from "@/three/Zoetrope";
import {
  ContactDialog,
  IndexDialog,
  ServicesDialog,
  type ContactIntent,
  type DialogKind,
} from "./Dialogs";
import { SplitTitle } from "./SplitTitle";

const pad = (n: number) => String(n).padStart(2, "0");

export default function Experience() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const statementRefs = useRef<(HTMLDivElement | null)[]>([]);
  const nowRef = useRef<HTMLDivElement>(null);
  const hudRef = useRef<HTMLDivElement>(null);
  const indexRef = useRef<HTMLElement>(null);
  const outroRef = useRef<HTMLDivElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);
  const hintRef = useRef<HTMLDivElement>(null);

  const sceneRef = useRef<Zoetrope | null>(null);
  const lenisRef = useRef<Lenis | null>(null);
  const audioRef = useRef<Ambience | null>(null);
  const progressRef = useRef(0);

  const [featureSlug, setFeatureSlug] = useState<string | null>(null);
  const [picked, setPicked] = useState(false);
  const [frontSlug, setFrontSlug] = useState<string>(featured[0]!.slug);
  const [hoverSlug, setHoverSlug] = useState<string | null>(null);
  const [active, setActive] = useState(0);
  const [sound, setSound] = useState(false);
  const [dialog, setDialog] = useState<DialogKind>(null);
  const [intent, setIntent] = useState<ContactIntent>({ mode: "projet" });
  const [webgl, setWebgl] = useState<"pending" | "ok" | "failed">("pending");

  const featureProject = featureSlug ? projectBySlug.get(featureSlug) : undefined;
  const featureIndex = featureSlug ? featured.findIndex((p) => p.slug === featureSlug) : -1;

  /* ---------------------------------------------------------------- */
  /* Défilement                                                        */
  /* ---------------------------------------------------------------- */

  const scrollToProgress = useCallback((p: number, duration = 2.4) => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const y = Math.max(0, Math.min(max, p * max));
    const lenis = lenisRef.current;
    if (lenis) lenis.scrollTo(y, { duration, easing: (t) => 1 - Math.pow(1 - t, 3) });
    else window.scrollTo({ top: y, behavior: "auto" });
  }, []);

  const goToProject = useCallback(
    (i: number) => {
      setDialog(null);
      scrollToProgress(progressForProject(i), 1.6);
    },
    [scrollToProgress],
  );

  /* ---------------------------------------------------------------- */
  /* Initialisation scène + boucle                                     */
  /* ---------------------------------------------------------------- */

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    const lowPower = coarse || window.innerWidth < 820 || (navigator.hardwareConcurrency ?? 8) <= 4;

    const audio = new Ambience();
    audioRef.current = audio;

    let lenis: Lenis | null = null;
    if (!reduced) {
      lenis = new Lenis({ lerp: coarse ? 0.12 : 0.085, wheelMultiplier: 0.9, touchMultiplier: 1.3 });
      lenisRef.current = lenis;
    }

    let scene: Zoetrope | null = null;
    let cancelled = false;
    const bootstrap = async () => {
      try {
        const { Zoetrope } = await import("@/three/Zoetrope");
        if (cancelled) return;
        scene = new Zoetrope(canvas, {
          projects,
          featured,
          lowPower,
          reducedMotion: reduced,
          onFeature: (slug, wasPicked) => {
            setFeatureSlug(slug);
            setPicked(wasPicked);
          },
          onFront: (slug) => setFrontSlug(slug),
          onHover: (slug) => setHoverSlug(slug),
          onWhoosh: () => audio.whoosh(),
        });
        sceneRef.current = scene;
        setWebgl("ok");
      } catch {
        setWebgl("failed");
      }
    };
    void bootstrap();

    // Hauteur de référence figée (évite les sauts de la barre d'adresse iOS).
    let lastW = window.innerWidth;
    let lastH = window.innerHeight;
    const onResize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      if (w === lastW && Math.abs(h - lastH) < 160) return;
      lastW = w;
      lastH = h;
      sceneRef.current?.resize();
    };
    window.addEventListener("resize", onResize);

    let lastScroll = window.scrollY;
    let speed = 0;
    let lastActive = -1;
    const setStyle = (el: HTMLElement | null, o: number, y = 0, blur = 0) => {
      if (!el) return;
      el.style.opacity = o.toFixed(3);
      el.style.transform = y ? `translate3d(0, ${y.toFixed(1)}px, 0)` : "";
      el.style.filter = blur > 0.05 && !lowPower ? `blur(${blur.toFixed(2)}px)` : "";
      el.style.visibility = o < 0.01 ? "hidden" : "visible";
      el.style.pointerEvents = o > 0.6 ? "auto" : "none";
    };

    const tick = (time: number, deltaTime: number) => {
      lenis?.raf(time * 1000);
      const dt = Math.min(0.05, deltaTime / 1000);
      const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      const y = lenis ? lenis.scroll : window.scrollY;
      const p = Math.min(1, Math.max(0, y / max));
      progressRef.current = p;
      const v = (y - lastScroll) / Math.max(dt, 1 / 120) / window.innerHeight;
      lastScroll = y;
      speed += (v - speed) * Math.min(1, dt * 6);
      audio.setSpeed(speed);

      sceneRef.current?.update(dt, p, speed);

      // Calques HTML synchronisés sur la même progression.
      const h = 1 - smooth(invLerp(0.004, 0.032, p));
      setStyle(heroRef.current, h, (1 - h) * -40, (1 - h) * 8);
      setStyle(hintRef.current, 1 - smooth(invLerp(0.0, 0.012, p)));
      STATEMENT_WINDOWS.forEach(([a, b], i) => {
        const o = windowOpacity(p, a, b);
        setStyle(statementRefs.current[i] ?? null, o, (1 - o) * 26, (1 - o) * 10);
      });
      setStyle(nowRef.current, windowOpacity(p, 0.06, 0.33, 0.02));
      setStyle(indexRef.current, windowOpacity(p, T.projectsStart, T.projectsEnd - 0.01, 0.015));
      const o = smooth(invLerp(T.outroTextStart - 0.02, 0.985, p));
      setStyle(outroRef.current, o, (1 - o) * 30, (1 - o) * 12);
      if (bgRef.current) bgRef.current.style.setProperty("--outro", smooth(invLerp(T.projectsEnd, 1, p)).toFixed(3));

      const a = activeProjectIndex(p);
      if (a !== lastActive) {
        lastActive = a;
        setActive(a);
      }
    };
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    return () => {
      cancelled = true;
      gsap.ticker.remove(tick);
      window.removeEventListener("resize", onResize);
      lenis?.destroy();
      lenisRef.current = null;
      scene?.dispose();
      sceneRef.current = null;
      audio.dispose();
    };
  }, []);

  /* Le défilement s'arrête quand une fenêtre est ouverte. */
  useEffect(() => {
    if (dialog) lenisRef.current?.stop();
    else lenisRef.current?.start();
  }, [dialog]);

  /* Navigation clavier entre projets (flèches gauche/droite). */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (dialog) return;
      const p = progressRef.current;
      if (p < T.projectsStart - 0.01 || p > T.projectsEnd) return;
      const i = activeProjectIndex(p);
      if (e.key === "ArrowRight" && i < FEATURED_COUNT - 1) goToProject(i + 1);
      if (e.key === "ArrowLeft" && i > 0) goToProject(i - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [dialog, goToProject]);

  /* ---------------------------------------------------------------- */
  /* Actions                                                           */
  /* ---------------------------------------------------------------- */

  const toggleSound = useCallback(async (on?: boolean) => {
    const next = on ?? !audioRef.current?.enabled;
    await audioRef.current?.setEnabled(next);
    setSound(next);
  }, []);

  const enter = useCallback(
    (withSound: boolean) => {
      void toggleSound(withSound);
      scrollToProgress(0.118, 4.2);
    },
    [scrollToProgress, toggleSound],
  );

  const openContact = useCallback((i: ContactIntent) => {
    setIntent(i);
    setDialog("contact");
  }, []);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    sceneRef.current?.setPointer(e.clientX, e.clientY, e.pointerType === "mouse");
  }, []);

  const onCanvasClick = useCallback((e: React.MouseEvent) => {
    const s = sceneRef.current;
    if (!s) return;
    // Au toucher, on vise l'écran tapé puis on remet la parallaxe à zéro.
    s.setPointer(e.clientX, e.clientY, true);
    s.pick();
    if (window.matchMedia("(pointer: coarse)").matches) s.setPointer(0, 0, false);
  }, []);

  const frontProject = useMemo(() => projectBySlug.get(frontSlug), [frontSlug]);

  /* ---------------------------------------------------------------- */
  /* Rendu                                                             */
  /* ---------------------------------------------------------------- */

  return (
    <>
      <a href="#contenu" className="skip-link">
        Aller au contenu
      </a>

      {/* Fond : noir chaud, puis bordeaux pour le final. */}
      <div ref={bgRef} className="stage-bg" aria-hidden />

      <canvas
        ref={canvasRef}
        className="stage-canvas"
        style={{ cursor: hoverSlug ? "pointer" : "default" }}
        onPointerMove={onPointerMove}
        onPointerLeave={() => sceneRef.current?.setPointer(-9999, -9999, false)}
        onClick={onCanvasClick}
        aria-label="Mur de sites internet réalisés par Lullin Web, en 3D"
        role="img"
      />

      <div className="stage-vignette" aria-hidden />

      {webgl === "failed" ? (
        <div className="fixed inset-0 -z-0 grid grid-cols-3 gap-2 p-2 opacity-25 sm:grid-cols-6" aria-hidden>
          {projects.slice(0, 18).map((p) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={p.slug} src={`/screens/wall-sm/${p.slug}.webp`} alt="" className="aspect-[16/10] w-full rounded object-cover object-top" />
          ))}
        </div>
      ) : null}

      {/* En-tête */}
      <header className="hud-header">
        <a
          href="#"
          className="whitespace-nowrap text-[13px] font-semibold tracking-[-0.01em]"
          onClick={(e) => {
            e.preventDefault();
            scrollToProgress(0, 2.6);
          }}
        >
          {site.name}
        </a>
        <nav aria-label="Navigation principale" className="flex items-center gap-5 text-[12px] sm:gap-7">
          <button type="button" className="link-ui" onClick={() => setDialog("index")}>
            Réalisations
          </button>
          <button type="button" className="link-ui" onClick={() => setDialog("services")}>
            Services
          </button>
          <button type="button" className="link-ui hidden sm:inline" onClick={() => openContact({ mode: "projet" })}>
            Contact
          </button>
          <button
            type="button"
            className="link-ui flex items-center gap-2"
            aria-pressed={sound}
            aria-label={sound ? "Couper le son" : "Activer le son"}
            onClick={() => void toggleSound()}
          >
            <span className={`sound-bars ${sound ? "is-on" : ""}`} aria-hidden>
              <i />
              <i />
              <i />
            </span>
            <span className="sm:hidden">Son</span>
            <span className="hidden sm:inline">{sound ? "Son activé" : "Son coupé"}</span>
          </button>
        </nav>
      </header>

      <main id="contenu" className="relative z-10">
        {/* Ouverture */}
        <div ref={heroRef} className="hud-hero">
          <p className="text-[12px] text-ivory/80">{hero.presents}</p>
          <h1 className="display hero-title">
            <span className="sr-only">Lullin Web, agence de création de sites internet — </span>
            {hero.title}
          </h1>
          <p className="text-[13px] text-ivory/85">{hero.subtitle}</p>
          <span className="my-5 block h-px w-56 bg-ivory/60" aria-hidden />
          <div className="flex items-center gap-8 text-[12px]">
            <button type="button" className="link-ui" onClick={() => enter(true)}>
              {hero.enterSound}
            </button>
            <button type="button" className="link-ui" onClick={() => enter(false)}>
              {hero.enterSilent}
            </button>
          </div>
        </div>

        <div ref={hintRef} className="hud-hint" aria-hidden>
          Faites défiler
          <span className="hint-line" />
        </div>

        {/* Trois phrases pendant la descente */}
        {statements.map((s, i) => (
          <div
            key={s.title}
            ref={(el) => {
              statementRefs.current[i] = el;
            }}
            className={`hud-statement ${s.side === "right" ? "is-right" : ""}`}
            style={{ opacity: 0, visibility: "hidden" }}
          >
            <h2 className="display statement-title">{s.title}</h2>
            <p className="mt-4 max-w-[300px] text-[12.5px] leading-relaxed text-ivory/75">{s.body}</p>
          </div>
        ))}

        {/* « À l'écran » pendant la descente */}
        <div ref={nowRef} className="hud-now" style={{ opacity: 0, visibility: "hidden" }} aria-live="off">
          <span className="block text-[10.5px] text-ivory/55">À l’écran</span>
          <span className="display text-[20px] leading-tight">{frontProject?.name}</span>
        </div>

        {/* Projet décroché */}
        <div
          ref={hudRef}
          className={`hud-project ${featureProject ? "is-visible" : ""}`}
          aria-live="polite"
        >
          {featureProject ? (
            <>
              <p className="flex items-center gap-3 text-[11px] tabular-nums text-ivory/80">
                {featureIndex >= 0 && !picked ? (
                  <>
                    <span>{pad(featureIndex + 1)}</span>
                    <span className="h-px w-10 bg-ivory/60" aria-hidden />
                    <span className="text-ivory/50">{pad(FEATURED_COUNT)}</span>
                  </>
                ) : (
                  <span>Décroché du mur</span>
                )}
              </p>
              <SplitTitle key={featureProject.slug} text={featureProject.name} className="display project-title" />
              <p className="mt-3 text-[13px] font-medium">
                {featureProject.kind} <span className="text-ivory/45">·</span> {featureProject.sector}
              </p>
              {featureProject.headline ? (
                <p className="display mt-1 text-[16px] italic text-ivory/80">
                  « {featureProject.headline} »
                </p>
              ) : null}
              <p className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-[12px]">
                <a className="link-ui" href={featureProject.url} target="_blank" rel="noopener noreferrer">
                  Voir le site en ligne <span aria-hidden>↗</span>
                  <span className="sr-only"> (nouvel onglet)</span>
                </a>
                <button
                  type="button"
                  className="link-ui"
                  onClick={() => openContact({ mode: "projet", reference: featureProject.name })}
                >
                  Un projet similaire <span aria-hidden>→</span>
                </button>
              </p>
            </>
          ) : null}
        </div>

        {/* Index des projets (à droite) */}
        <nav
          ref={indexRef}
          aria-label="Projets à la une"
          className="hud-index"
          style={{ opacity: 0, visibility: "hidden" }}
        >
          <ol>
            {featured.map((p, i) => {
              const on = !picked && i === active;
              return (
                <li key={p.slug}>
                  <button
                    type="button"
                    onClick={() => goToProject(i)}
                    aria-current={on ? "true" : undefined}
                    className={on ? "is-active" : ""}
                  >
                    {p.name}
                    <span className="index-line" aria-hidden />
                  </button>
                </li>
              );
            })}
          </ol>
        </nav>

        {/* Final */}
        <div ref={outroRef} className="hud-outro" style={{ opacity: 0, visibility: "hidden" }}>
          <h2 className="display outro-title">{outro.title}</h2>
          <div className="outro-body">
          <p className="text-[13px] text-ivory/80">{outro.body}</p>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-[12.5px]">
            <button type="button" className="link-ui font-medium" onClick={() => openContact({ mode: "projet" })}>
              {outro.cta} <span aria-hidden>→</span>
            </button>
            <button type="button" className="link-ui" onClick={() => openContact({ mode: "devis" })}>
              {outro.secondary}
            </button>
          </div>
          </div>
          <p className="outro-note">
            {outro.disclaimer}
            <br />
            {site.name} · {site.area} · <a className="underline" href={`mailto:${site.email}`}>{site.email}</a>
          </p>
        </div>
      </main>

      {/* Hauteur de défilement de l'expérience */}
      <div className="scroll-track" aria-hidden />

      <IndexDialog
        open={dialog === "index"}
        onClose={() => setDialog(null)}
        onGoTo={goToProject}
        onContact={(p) => openContact({ mode: "projet", reference: p.name })}
      />
      <ServicesDialog open={dialog === "services"} onClose={() => setDialog(null)} onContact={openContact} />
      <ContactDialog open={dialog === "contact"} onClose={() => setDialog(null)} intent={intent} />
    </>
  );
}
