/**
 * Aceternity floating dock, adapted for this project:
 * - routes through react-router instead of plain anchors
 * - marks the active route
 * - restyled onto the Hub's dark token set
 */

import { cn } from "@/lib/utils";
import { IconLayoutNavbarCollapse } from "@tabler/icons-react";
import {
  AnimatePresence,
  MotionValue,
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from "motion/react";
import { useLocation } from "react-router-dom";
import { TransitionLink, type Direction } from "../PageTransition";

import { useRef, useState } from "react";

type DockItem = { title: string; icon: React.ReactNode; href: string };

const matches = (href: string, pathname: string) =>
  href === "/" ? pathname === "/" : pathname.startsWith(href);

/** The dock's own route matching: exact for "/", prefix for the rest. */
const useIsActive = () => {
  const { pathname } = useLocation();
  return (href: string) => matches(href, pathname);
};

/**
 * Which way a move travels along the dock: 1 if the destination sits to the right of
 * where we are, -1 if to the left. The panel then arrives from that side, so the
 * movement on screen matches the movement your eye just made across the icons.
 */
const useDirection = (items: DockItem[]) => {
  const { pathname } = useLocation();
  const from = items.findIndex((item) => matches(item.href, pathname));

  return (href: string): Direction => {
    const to = items.findIndex((item) => item.href === href);
    if (from === -1 || to === -1) return 1;
    return to >= from ? 1 : -1;
  };
};

export const FloatingDock = ({
  items,
  desktopClassName,
  mobileClassName,
}: {
  items: DockItem[];
  desktopClassName?: string;
  mobileClassName?: string;
}) => {
  return (
    <>
      <FloatingDockDesktop items={items} className={desktopClassName} />
      <FloatingDockMobile items={items} className={mobileClassName} />
    </>
  );
};

const FloatingDockMobile = ({
  items,
  className,
}: {
  items: DockItem[];
  className?: string;
}) => {
  const [open, setOpen] = useState(false);
  const isActive = useIsActive();
  const directionTo = useDirection(items);

  return (
    <div className={cn("relative block md:hidden", className)}>
      <AnimatePresence>
        {open && (
          <motion.div
            layoutId="nav"
            className="absolute inset-x-0 bottom-full mb-2 flex flex-col gap-2"
          >
            {items.map((item, idx) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10, transition: { delay: idx * 0.05 } }}
                transition={{ delay: (items.length - 1 - idx) * 0.05 }}
              >
                <TransitionLink
                  to={item.href}
                  label={item.title}
                  direction={directionTo(item.href)}
                  aria-label={item.title}
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 backdrop-blur-xl",
                    isActive(item.href) && "border-white/35",
                  )}
                >
                  <div className="h-4 w-4">{item.icon}</div>
                </TransitionLink>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
      <button
        onClick={() => setOpen(!open)}
        aria-label={open ? "Close navigation" : "Open navigation"}
        aria-expanded={open}
        className="flex h-10 w-10 items-center justify-center rounded-full border border-line bg-raised"
      >
        <IconLayoutNavbarCollapse className="h-5 w-5 text-fg-muted" />
      </button>
    </div>
  );
};

const FloatingDockDesktop = ({
  items,
  className,
}: {
  items: DockItem[];
  className?: string;
}) => {
  const mouseX = useMotionValue(Infinity);
  const directionTo = useDirection(items);

  return (
    <motion.nav
      aria-label="Main"
      onMouseMove={(e) => mouseX.set(e.pageX)}
      onMouseLeave={() => mouseX.set(Infinity)}
      className={cn(
        // Square corners and hairline edges, like every other surface on the site —
        // the page has no rounded cards, so the dock shouldn't be the exception.
        // Tinted with the page colour rather than white, so it reads as the same
        // material seen through glass instead of a pane laid on top.
        // No overflow-hidden: the hover labels sit above the dock and would clip.
        "relative mx-auto hidden h-16 items-center gap-1 px-2.5 md:flex",
        "border border-line-strong bg-base/75 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.95)] backdrop-blur-2xl",
        "before:pointer-events-none before:absolute before:inset-x-3 before:top-0 before:h-px before:bg-linear-to-r before:from-transparent before:via-fg/20 before:to-transparent",
        className,
      )}
    >
      {items.map((item) => (
        <IconContainer
          mouseX={mouseX}
          key={item.title}
          direction={directionTo(item.href)}
          {...item}
        />
      ))}
    </motion.nav>
  );
};

function IconContainer({
  mouseX,
  title,
  icon,
  href,
  direction,
}: DockItem & { mouseX: MotionValue; direction: Direction }) {
  const ref = useRef<HTMLDivElement>(null);
  const isActive = useIsActive()(href);

  const distance = useTransform(mouseX, (val) => {
    const bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 };
    return val - bounds.x - bounds.width / 2;
  });

  const widthTransform = useTransform(distance, [-130, 0, 130], [44, 60, 44]);
  const heightTransform = useTransform(distance, [-130, 0, 130], [40, 50, 40]);

  const widthTransformIcon = useTransform(distance, [-130, 0, 130], [19, 28, 19]);
  const heightTransformIcon = useTransform(distance, [-130, 0, 130], [19, 28, 19]);

  const spring = { mass: 0.1, stiffness: 150, damping: 12 };
  const width = useSpring(widthTransform, spring);
  const height = useSpring(heightTransform, spring);
  const widthIcon = useSpring(widthTransformIcon, spring);
  const heightIcon = useSpring(heightTransformIcon, spring);

  const [hovered, setHovered] = useState(false);

  return (
    <TransitionLink to={href} label={title} direction={direction} aria-label={title}>
      <motion.div
        ref={ref}
        style={{ width, height }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="relative flex items-center justify-center"
      >
        <AnimatePresence>
          {hovered && (
            <motion.div
              initial={{ opacity: 0, y: 6, x: "-50%" }}
              animate={{ opacity: 1, y: 0, x: "-50%" }}
              exit={{ opacity: 0, y: 2, x: "-50%" }}
              className="absolute -top-10 left-1/2 w-fit border border-line-strong bg-surface px-2.5 py-1 text-xs whitespace-pre text-fg"
            >
              {title}
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          style={{ width: widthIcon, height: heightIcon }}
          className={cn(
            "flex items-center justify-center transition-colors",
            isActive ? "text-fg" : "text-fg-muted hover:text-fg",
          )}
        >
          {icon}
        </motion.div>

        {/* The active route gets a dot beneath it rather than a filled chip. */}
        {isActive && (
          <span
            className="absolute -bottom-1 left-1/2 size-1 -translate-x-1/2 rounded-full bg-fg"
            aria-hidden="true"
          />
        )}
      </motion.div>
    </TransitionLink>
  );
}
