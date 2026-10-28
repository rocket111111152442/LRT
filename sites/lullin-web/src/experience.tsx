import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { Dialog } from "@base-ui/react/dialog";
import {
  motion,
  MotionConfig,
  useInView,
  useReducedMotion,
} from "motion/react";
import { ArrowUpRight, Pause, Play } from "lucide-react";

const MotionContext = createContext(true);
export const useMotionEnabled = () => useContext(MotionContext);
const sessionKey = "lullin.maquette.intro.v1";

function Intro({ finish }: { finish: () => void }) {
  const popup = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  const introVideo = useRef<HTMLVideoElement>(null);
  const [mobile] = useState(() => matchMedia("(max-width: 800px)").matches);
  useEffect(() => {
    let raf = 0,
      previous = 0,
      elapsed = 0;
    const tick = (time: number) => {
      if (!document.hidden) {
        if (previous) elapsed += time - previous;
        previous = time;
        if (elapsed >= 7400) {
          finish();
          return;
        }
      }
      raf = requestAnimationFrame(tick);
    };
    const visibility = () => {
      previous = 0;
      if (popup.current) popup.current.dataset.hidden = String(document.hidden);
      if (document.hidden) introVideo.current?.pause();
      else
        void introVideo.current?.play().catch(() => {
          /* Keep the video frame if autoplay is unavailable. */
        });
    };
    const preference = matchMedia("(prefers-reduced-motion: reduce)");
    const reduced = () => {
      if (preference.matches) finish();
    };
    visibility();
    raf = requestAnimationFrame(tick);
    document.addEventListener("visibilitychange", visibility);
    preference.addEventListener("change", reduced);
    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener("visibilitychange", visibility);
      preference.removeEventListener("change", reduced);
    };
  }, [finish]);
  return (
    <Dialog.Root
      open
      onOpenChange={(open) => {
        if (!open) finish();
      }}
    >
      <Dialog.Portal>
        <Dialog.Popup
          ref={popup}
          className="entry-film"
          initialFocus={button}
          finalFocus={false}
        >
          <Dialog.Title className="sr-only">
            Bienvenue chez Lullin Web
          </Dialog.Title>
          <Dialog.Description className="sr-only">
            Notre univers en sept secondes. Utilisez le bouton Passer ou la
            touche Échap pour accéder directement au site.
          </Dialog.Description>
          <div className="entry-panel entry-panel-left" aria-hidden="true" />
          <div className="entry-panel entry-panel-right" aria-hidden="true" />
          <div className="entry-top" aria-hidden="true">
            <span>LULLIN WEB</span>
            <span>DESIGN. CODE. IMPACT.</span>
          </div>
          <div className="entry-brand" aria-hidden="true">
            <div>
              {Array.from("LULLIN").map((letter, i) => (
                <span key={i} style={{ "--i": i } as CSSProperties}>
                  {letter}
                </span>
              ))}
            </div>
            <strong>WEB</strong>
            <small>VOTRE PRÉSENCE. NOTRE SIGNATURE.</small>
          </div>
          <div className="entry-orbit" aria-hidden="true">
            {mobile ? (
              <video
                ref={introVideo}
                className="entry-video"
                src="/media/gargantua-mobile.mp4"
                poster="/media/gargantua-poster.jpg"
                muted
                autoPlay
                loop
                playsInline
                preload="auto"
                tabIndex={-1}
              />
            ) : (
              <img
                className="brand-mark"
                src="/images/lullin-mark.svg"
                alt=""
                width="660"
                height="660"
              />
            )}
          </div>
          <div className="entry-message" aria-hidden="true">
            <span>Laissez</span>
            <em>une trace.</em>
          </div>
          <div className="entry-bottom" aria-hidden="true">
            <span>DE L’IDÉE À L’IMPACT</span>
            <div className="entry-progress">
              <i />
            </div>
            <span>01 — 03</span>
          </div>
          <button ref={button} className="entry-skip" onClick={finish}>
            Passer l’introduction <ArrowUpRight size={16} />
          </button>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export function Experience({ children }: { children: ReactNode }) {
  const reduced = useReducedMotion();
  const [paused, setPaused] = useState(() => {
    try {
      return sessionStorage.getItem("lullin.motion.paused") === "true";
    } catch {
      return false;
    }
  });
  const [intro, setIntro] = useState(() => {
    if (
      window.location.pathname !== "/" ||
      matchMedia("(prefers-reduced-motion: reduce)").matches
    )
      return false;
    try {
      return (
        sessionStorage.getItem("lullin.motion.paused") !== "true" &&
        (new URLSearchParams(location.search).get("intro") === "1" ||
          sessionStorage.getItem(sessionKey) !== "true")
      );
    } catch {
      return true;
    }
  });
  const finish = useCallback(() => {
    setIntro(false);
    try {
      sessionStorage.setItem(sessionKey, "true");
    } catch {
      /* Keep navigation usable if storage is unavailable. */
    }
  }, []);
  const enabled = !paused && !reduced;
  useEffect(() => {
    document.documentElement.dataset.motion = enabled ? "on" : "off";
    const update = () => {
      document.documentElement.style.setProperty(
        "--page-progress",
        String(
          scrollY /
            Math.max(1, document.documentElement.scrollHeight - innerHeight),
        ),
      );
    };
    addEventListener("scroll", update, { passive: true });
    update();
    return () => removeEventListener("scroll", update);
  }, [enabled]);
  return (
    <MotionContext.Provider value={enabled && !intro}>
      <MotionConfig reducedMotion={enabled ? "user" : "always"}>
        <div className={intro ? "site-surface is-waiting" : "site-surface"}>
          {children}
        </div>
        {intro && <Intro finish={finish} />}
        {!intro && (
          <button
            className="motion-toggle"
            onClick={() => {
              const next = !paused;
              setPaused(next);
              try {
                sessionStorage.setItem("lullin.motion.paused", String(next));
              } catch {
                /* Local preference remains active. */
              }
            }}
            disabled={Boolean(reduced)}
            aria-label={
              reduced
                ? "Mouvement réduit selon votre appareil"
                : paused
                  ? "Activer les animations"
                  : "Mettre les animations en pause"
            }
            title={
              reduced
                ? "Mouvement réduit"
                : paused
                  ? "Activer les animations"
                  : "Mettre les animations en pause"
            }
          >
            {enabled ? <Pause size={13} /> : <Play size={13} />}
            <span>
              {reduced ? "Mouvement réduit" : paused ? "En pause" : "Motion on"}
            </span>
          </button>
        )}
        <div className="page-progress" aria-hidden="true" />
      </MotionConfig>
    </MotionContext.Provider>
  );
}
export function Reveal({
  children,
  className = "",
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const enabled = useMotionEnabled();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.12 });
  return (
    <motion.div
      ref={ref}
      className={className}
      initial={false}
      animate={
        enabled && !inView ? { opacity: 0, y: 30 } : { opacity: 1, y: 0 }
      }
      transition={{
        duration: enabled ? 0.85 : 0,
        delay: enabled && inView ? delay : 0,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      {children}
    </motion.div>
  );
}
export function Action({
  href,
  children,
  className = "",
  light = false,
}: {
  href: string;
  children: ReactNode;
  className?: string;
  light?: boolean;
}) {
  const enabled = useMotionEnabled();
  return (
    <a
      href={href}
      className={`action ${light ? "action-light" : ""} ${className}`}
      onPointerMove={(e) => {
        if (
          !enabled ||
          e.pointerType === "touch" ||
          !matchMedia("(pointer: fine)").matches
        )
          return;
        const r = e.currentTarget.getBoundingClientRect();
        e.currentTarget.style.setProperty(
          "--mx",
          `${(e.clientX - r.left - r.width / 2) * 0.09}px`,
        );
        e.currentTarget.style.setProperty(
          "--my",
          `${(e.clientY - r.top - r.height / 2) * 0.13}px`,
        );
      }}
      onPointerLeave={(e) => {
        e.currentTarget.style.setProperty("--mx", "0px");
        e.currentTarget.style.setProperty("--my", "0px");
      }}
    >
      <span>{children}</span>
      <i>
        <ArrowUpRight size={19} />
      </i>
    </a>
  );
}

export function HeroVideo() {
  const enabled = useMotionEnabled();
  const [source] = useState(() =>
    matchMedia("(max-width: 800px)").matches
      ? "/media/gargantua-mobile.mp4"
      : "/media/gargantua.mp4",
  );
  const video = useRef<HTMLVideoElement>(null);
  const inView = useInView(video, { amount: 0.1 });
  useEffect(() => {
    const element = video.current;
    if (!element) return;
    const update = () => {
      if (enabled && inView && !document.hidden)
        void element.play().catch(() => {
          /* The poster remains available when autoplay is blocked. */
        });
      else element.pause();
    };
    update();
    document.addEventListener("visibilitychange", update);
    return () => {
      element.pause();
      document.removeEventListener("visibilitychange", update);
    };
  }, [enabled, inView]);
  // Load behind the intro; the fallback is the video's own first frame.
  return (
    <video
      ref={video}
      className="hero-video"
      src={source}
      poster="/media/gargantua-poster.jpg"
      muted
      loop
      playsInline
      preload="auto"
      tabIndex={-1}
      aria-hidden="true"
    />
  );
}
