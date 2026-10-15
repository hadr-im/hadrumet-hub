import { DEPARTMENT_CORNER, TODAY } from "../data/mock";
import type { Activity, Corner, Department } from "../data/types";

/** Parse an ISO `YYYY-MM-DD` as a local date, avoiding the UTC shift `new Date(str)` applies. */
export const parseISO = (iso: string): Date => {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
};

export const toISO = (date: Date): string =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
    date.getDate(),
  ).padStart(2, "0")}`;

/** The app's "now". Fixed while we're on static data so the UI is reproducible. */
export const today = parseISO(TODAY);

export const formatDate = (iso: string, opts?: Intl.DateTimeFormatOptions): string =>
  parseISO(iso).toLocaleDateString("en-GB", opts ?? { day: "numeric", month: "long", year: "numeric" });

/** "Wednesday, 14 October 2026" — the dateline in the hero. */
export const TODAY_LABEL = parseISO(TODAY).toLocaleDateString("en-GB", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
});

/** "14 Oct 2026" — compact enough to sit as a label. */
export const formatShortDate = (iso: string): string =>
  parseISO(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

/** Every day an activity occupies, so a multi-day event lands on each of its dates. */
export const datesIn = (start: string, end?: string): string[] => {
  if (!end || end <= start) return [start];

  const out: string[] = [];
  const cursor = parseISO(start);
  const last = parseISO(end);

  while (cursor <= last) {
    out.push(toISO(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }

  return out;
};

/**
 * "16 – 18 October 2026" for a span, or the plain date for a single day. The month
 * and year are only written once when both ends share them.
 */
export const formatSpan = (start: string, end?: string): string => {
  if (!end || end === start) return formatDate(start);

  const a = parseISO(start);
  const b = parseISO(end);

  if (a.getMonth() === b.getMonth() && a.getFullYear() === b.getFullYear()) {
    return `${a.getDate()} – ${formatDate(end)}`;
  }

  return `${formatDate(start)} – ${formatDate(end)}`;
};

export const formatDayName = (iso: string): string =>
  parseISO(iso).toLocaleDateString("en-GB", { weekday: "long" });

export const formatMonth = (date: Date): string =>
  date.toLocaleDateString("en-GB", { month: "long", year: "numeric" });

/** Whole days from today to `iso`. Negative means the date has passed. */
export const daysFromToday = (iso: string): number =>
  Math.round((parseISO(iso).getTime() - today.getTime()) / 86_400_000);

/** "in 3 days", "today", "tomorrow", "2 days ago" — for deadlines and announcements. */
export const relativeDay = (iso: string): string => {
  const diff = daysFromToday(iso);
  if (diff === 0) return "today";
  if (diff === 1) return "tomorrow";
  if (diff === -1) return "yesterday";
  return diff > 0 ? `in ${diff} days` : `${-diff} days ago`;
};

export const cornerOf = (department: Department | "LC-wide" | "EB"): Corner | null =>
  department === "LC-wide" || department === "EB"
    ? null
    : DEPARTMENT_CORNER[department];

/**
 * Tailwind classes per corner. Written out in full because Tailwind scans source
 * for complete class names — building them by interpolation would strip them.
 */
export const CORNER_STYLE: Record<
  Corner | "neutral",
  {
    dot: string;
    chip: string;
    bar: string;
    /** Text in the corner's own colour. */
    text: string;
    wash: string;
    /** Calendar day cell: a faint tint at rest, a strong one once the day is open. */
    cell: string;
    cellActive: string;
  }
> = {
  brand: {
    dot: "bg-corner-brand",
    chip: "border-corner-brand/35 bg-corner-brand/10 text-corner-brand",
    bar: "bg-corner-brand",
    text: "text-corner-brand",
    wash: "bg-[radial-gradient(110%_80%_at_0%_0%,rgba(184,132,31,0.14),transparent_72%)]",
    cell: "bg-corner-brand/12 hover:bg-corner-brand/22",
    cellActive: "bg-corner-brand/45",
  },
  exchange: {
    dot: "bg-corner-exchange",
    chip: "border-corner-exchange/35 bg-corner-exchange/10 text-corner-exchange",
    bar: "bg-corner-exchange",
    text: "text-corner-exchange",
    wash: "bg-[radial-gradient(110%_80%_at_0%_0%,rgba(43,134,216,0.14),transparent_72%)]",
    cell: "bg-corner-exchange/12 hover:bg-corner-exchange/22",
    cellActive: "bg-corner-exchange/45",
  },
  power: {
    dot: "bg-corner-power",
    chip: "border-corner-power/35 bg-corner-power/10 text-corner-power",
    bar: "bg-corner-power",
    text: "text-corner-power",
    wash: "bg-[radial-gradient(110%_80%_at_0%_0%,rgba(46,158,132,0.14),transparent_72%)]",
    cell: "bg-corner-power/12 hover:bg-corner-power/22",
    cellActive: "bg-corner-power/45",
  },
  general: {
    dot: "bg-corner-general",
    chip: "border-corner-general/35 bg-corner-general/10 text-corner-general",
    bar: "bg-corner-general",
    text: "text-corner-general",
    wash: "bg-[radial-gradient(110%_80%_at_0%_0%,rgba(145,105,204,0.14),transparent_72%)]",
    cell: "bg-corner-general/12 hover:bg-corner-general/22",
    cellActive: "bg-corner-general/45",
  },
  neutral: {
    dot: "bg-fg-dim",
    chip: "border-line-strong bg-raised text-fg-muted",
    bar: "bg-fg-dim",
    text: "text-fg-muted",
    wash: "bg-[radial-gradient(110%_80%_at_0%_0%,rgba(255,255,255,0.06),transparent_72%)]",
    cell: "bg-fg/10 hover:bg-fg/18",
    cellActive: "bg-fg/35",
  },
};

export const styleFor = (department: Department | "LC-wide" | "EB") =>
  CORNER_STYLE[cornerOf(department) ?? "neutral"];

export const ACTIVITY_TYPE_LABEL: Record<Activity["type"], string> = {
  meeting: "Meeting",
  training: "Training",
  conference: "Conference",
  event: "Event",
  deadline: "Deadline",
};

/** Builds the 6×7 grid for a month, padded with the surrounding days. */
export const monthGrid = (month: Date): Date[] => {
  const first = new Date(month.getFullYear(), month.getMonth(), 1);
  // Monday-first: shift Sunday (0) to the end of the week.
  const offset = (first.getDay() + 6) % 7;
  const start = new Date(first);
  start.setDate(first.getDate() - offset);

  return Array.from({ length: 42 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d;
  });
};

export const cx = (...parts: (string | false | null | undefined)[]): string =>
  parts.filter(Boolean).join(" ");

