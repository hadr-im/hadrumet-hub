import type { ReactNode } from "react";
import { Search, X } from "lucide-react";
import { cx, styleFor } from "../lib/format";
import type { Department } from "../data/types";

/**
 * Section heading. A hairline runs from the title out to the right edge, so the
 * heading reads as the top rule of the block beneath it rather than floating text.
 */
export const SectionHeading = ({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) => (
  <div className="mb-8">
    <div className="flex items-center gap-6">
      <h2 className="text-[clamp(1.75rem,2.4vw,2.5rem)] leading-none font-bold tracking-tight">
        {title}
      </h2>
      <span className="h-px flex-1 bg-line" />
      {action}
    </div>
    {subtitle && <p className="mt-3 max-w-[64ch] text-[15px] text-fg-muted">{subtitle}</p>}
  </div>
);

/** Coloured department tag. The hue is the department's knowledge corner. */
export const DeptChip = ({
  department,
  className,
}: {
  department: Department | "LC-wide" | "EB";
  className?: string;
}) => (
  <span
    className={cx(
      "inline-flex items-center border px-2 py-0.5 text-xs font-medium",
      styleFor(department).chip,
      className,
    )}
  >
    {department}
  </span>
);

export const Chip = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) => (
  <span
    className={cx(
      "inline-flex items-center border border-line-strong bg-raised px-2 py-0.5 text-xs font-medium text-fg-muted",
      className,
    )}
  >
    {children}
  </span>
);

/** Thin progress meter. `tone` carries a `bg-*` class for the filled portion. */
export const Meter = ({
  value,
  max,
  tone = "bg-fg-muted",
}: {
  value: number;
  max: number;
  tone?: string;
}) => (
  <div className="h-1 w-full overflow-hidden bg-line">
    <div
      className={cx("h-full transition-[width] duration-500", tone)}
      style={{ width: `${Math.min(100, (value / max) * 100)}%` }}
    />
  </div>
);

/**
 * The opening of an inner page. Carries the same wash the home page's blocks use,
 * so arriving on a page feels like the same site rather than a different one.
 */
export const PageHeader = ({
  title,
  description,
  /** A `bg-[radial-gradient(...)]` class, so each page can carry its own tint. */
  wash = "bg-[radial-gradient(90%_100%_at_0%_0%,rgba(255,255,255,0.055),transparent_72%)]",
  children,
}: {
  title: string;
  description: string;
  wash?: string;
  children?: ReactNode;
}) => (
  <header className={cx("relative border-b border-line", wash)}>
    <div className="shell py-20">
      <h1 className="text-[clamp(2.5rem,4vw,3.75rem)] leading-none font-extrabold tracking-tight">
        {title}
      </h1>
      <p className="mt-5 max-w-[62ch] text-[17px] leading-relaxed text-fg-muted">
        {description}
      </p>
      {children}
    </div>
  </header>
);

/**
 * One line of a left-hand index: a full-height edge rule carrying the colour, the
 * label, and a count held to the right. Shared so every library page indexes the
 * same way.
 */
export const IndexRow = ({
  label,
  count,
  active,
  tone = "bg-fg",
  activeWash = "bg-white/6",
  onClick,
}: {
  label: string;
  count: number;
  active: boolean;
  tone?: string;
  /** An open group can wash in its own colour rather than a neutral grey. */
  activeWash?: string;
  onClick: () => void;
}) => (
  <button
    type="button"
    onClick={onClick}
    aria-current={active ? "true" : undefined}
    className={cx(
      "relative flex w-full items-center justify-between gap-4 border-b border-line py-4 pr-5 pl-6 text-left transition-colors",
      active ? activeWash : "hover:bg-white/2",
    )}
  >
    <span
      aria-hidden="true"
      className={cx(
        "absolute inset-y-0 left-0 w-0.5 transition-opacity",
        tone,
        active ? "opacity-100" : "opacity-30",
      )}
    />
    <span
      className={cx(
        "truncate text-sm transition-colors",
        active ? "font-semibold text-fg" : "text-fg-muted",
      )}
    >
      {label}
    </span>
    <span className="shrink-0 text-xs text-fg-dim tabular-nums">{count}</span>
  </button>
);

/** The search field at the top of a library page. */
export const SearchInput = ({
  value,
  onChange,
  placeholder,
  label,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  label: string;
}) => (
  <div className="relative flex-1">
    <Search
      size={16}
      strokeWidth={1.7}
      className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-fg-dim"
    />
    <input
      type="search"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      aria-label={label}
      className="w-full border border-line bg-base py-3 pr-10 pl-11 text-sm text-fg placeholder:text-fg-dim focus:border-fg-muted focus:outline-none"
    />
    {value && (
      <button
        type="button"
        onClick={() => onChange("")}
        aria-label="Clear search"
        className="absolute top-1/2 right-3 -translate-y-1/2 text-fg-dim transition-colors hover:text-fg"
      >
        <X size={15} strokeWidth={1.8} />
      </button>
    )}
  </div>
);

/** Quiet text link used for "see all" affordances beside a section heading. */
export const MoreLink = ({ children }: { children: ReactNode }) => (
  <span className="shrink-0 text-sm font-light text-fg-muted transition-colors group-hover:text-fg">
    {children}
  </span>
);
