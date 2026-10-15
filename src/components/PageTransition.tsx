import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";

/*
  Timings. They add up to about 1.7 seconds:

    cover   the panel sweeps in from the right        400ms
    hold    the title inks itself in, three beats     900ms
    reveal  the panel sweeps off to the left          400ms

  Most of the extra length goes to the hold rather than the sweeps: a slow sweep
  feels sluggish, while the title needs the room for its beats to be legible.

  The route changes at the end of the hold, so the new page is mounting behind the
  panel and its own entrance plays as the panel clears — one continuous movement
  leftward rather than two separate animations.
*/
const COVER_MS = 400;
const HOLD_MS = 900;
const REVEAL_MS = 400;

const EASE = [0.65, 0, 0.35, 1] as const;

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** 1 travels rightward through the dock, -1 leftward. */
export type Direction = 1 | -1;

type Go = (to: string, label: string, direction?: Direction) => void;

const TransitionContext = createContext<{ go: Go; direction: Direction }>({
  go: () => {},
  direction: 1,
});

export const usePageTransition = () => useContext(TransitionContext).go;

/**
 * The direction the last move travelled, so a page's own entrance can come from the
 * same side the panel left from rather than always from the left.
 */
export const useTransitionDirection = () => useContext(TransitionContext).direction;

/** A link that routes through the transition instead of swapping pages instantly. */
export const TransitionLink = ({
  to,
  label,
  direction = 1,
  className,
  children,
  ...rest
}: {
  to: string;
  label: string;
  direction?: Direction;
  className?: string;
  children: ReactNode;
} & Omit<React.ComponentProps<typeof Link>, "to" | "className" | "children">) => {
  const go = usePageTransition();

  return (
    <Link
      to={to}
      className={className}
      {...rest}
      onClick={(e) => {
        // Leave the modified clicks alone: they belong to the browser, not to us.
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
        e.preventDefault();
        go(to, label, direction);
      }}
    >
      {children}
    </Link>
  );
};

export const PageTransitionProvider = ({ children }: { children: ReactNode }) => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [cover, setCover] = useState<{
    label: string;
    phase: "in" | "out";
    direction: Direction;
  } | null>(null);
  const [direction, setDirection] = useState<Direction>(1);
  const timers = useRef<number[]>([]);

  // Any timer still pending when this unmounts would fire into a dead component.
  useEffect(
    () => () => {
      timers.current.forEach(clearTimeout);
    },
    [],
  );

  const go = useCallback<Go>(
    (to, label, dir = 1) => {
      if (to === pathname) return;

      if (prefersReducedMotion()) {
        navigate(to);
        window.scrollTo(0, 0);
        return;
      }

      timers.current.forEach(clearTimeout);
      timers.current = [];

      setDirection(dir);
      setCover({ label, phase: "in", direction: dir });

      const at = (ms: number, fn: () => void) => {
        timers.current.push(window.setTimeout(fn, ms));
      };

      // Fully covered: swap the route, then immediately start clearing.
      at(COVER_MS + HOLD_MS, () => {
        navigate(to);
        window.scrollTo(0, 0);
        setCover({ label, phase: "out", direction: dir });
      });

      at(COVER_MS + HOLD_MS + REVEAL_MS, () => setCover(null));
    },
    [navigate, pathname],
  );

  return (
    <TransitionContext.Provider value={{ go, direction }}>
      {children}

      <AnimatePresence>
        {cover && (
          // The panel comes in from the side the destination sits on in the dock, and
          // carries on out the far side — so the move reads as travelling toward it
          // rather than always sweeping one way.
          <motion.div
            key="page-cover"
            initial={{ x: cover.direction === 1 ? "100%" : "-100%" }}
            animate={{
              x: cover.phase === "in" ? "0%" : cover.direction === 1 ? "-100%" : "100%",
            }}
            exit={{ x: cover.direction === 1 ? "-100%" : "100%" }}
            transition={{
              duration: (cover.phase === "in" ? COVER_MS : REVEAL_MS) / 1000,
              ease: EASE,
            }}
            className="fixed inset-0 z-200 grid place-items-center bg-base"
            aria-hidden="true"
          >
            <span
              className="stroke-title px-12 text-center text-[clamp(2.5rem,7vw,6rem)] leading-none font-extrabold tracking-tight"
              style={{
                fontFamily: "var(--font-display)",
                fontStretch: "125%",
                animation: `ink ${HOLD_MS}ms ease-in-out ${COVER_MS}ms forwards`,
                color: "transparent",
              }}
            >
              {cover.label}
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </TransitionContext.Provider>
  );
};

export { COVER_MS, HOLD_MS, REVEAL_MS };
