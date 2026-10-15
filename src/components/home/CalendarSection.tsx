import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { activities, DEPARTMENTS, WORKING_HOURS } from "../../data/mock";
import type { Activity, ActivityType, Department } from "../../data/types";
import {
  ACTIVITY_TYPE_LABEL,
  cx,
  datesIn,
  daysFromToday,
  formatMonth,
  formatShortDate,
  monthGrid,
  toISO,
  today,
} from "../../lib/format";
import { SectionHeading } from "../ui";
import Select from "../Select";
import ActivityDetail from "./ActivityDetail";

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const ACTIVITY_TYPES = Object.keys(ACTIVITY_TYPE_LABEL) as ActivityType[];

/**
 * Days are coloured by what kind of thing is on them, grouped into three families.
 *
 * Three and not five: on a surface this dark the colours have to sit in a narrow
 * lightness band to stay legible, and that band only holds three hues that are
 * reliably distinguishable from one another — including for the colourblind, and
 * including the pairs that end up side by side in a grid. A fourth could be told
 * apart by some readers and not by others, which is worse than not using it.
 */
const FAMILY: Record<ActivityType, "gathering" | "session" | "deadline"> = {
  event: "gathering",
  conference: "gathering",
  meeting: "session",
  training: "session",
  deadline: "deadline",
};

const FAMILY_STYLE = {
  gathering: {
    label: "Events & conferences",
    cell: "bg-corner-power/14 hover:bg-corner-power/26",
    active: "bg-corner-power/42",
    dot: "bg-corner-power",
  },
  session: {
    label: "Meetings & trainings",
    cell: "bg-corner-exchange/14 hover:bg-corner-exchange/26",
    active: "bg-corner-exchange/42",
    dot: "bg-corner-exchange",
  },
  deadline: {
    label: "Deadlines",
    cell: "bg-corner-brand/14 hover:bg-corner-brand/26",
    active: "bg-corner-brand/42",
    dot: "bg-corner-brand",
  },
} as const;

type DeptFilter = Department | "LC-wide" | "all";
type TypeFilter = ActivityType | "all";

/**
 * Floating preview shown while hovering a day that has something on it.
 *
 * The grid clips horizontally so the month can slide in and out, which means a
 * centred popup on an edge column gets its outer half cut off. Columns near either
 * end anchor to their own edge instead of centring, so the panel always opens
 * inward and stays whole.
 */
const DayPreview = ({ items, column }: { items: Activity[]; column: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 6 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.16, ease: "easeOut" }}
    className={cx(
      "pointer-events-none absolute bottom-full z-30 mb-2 w-80 border border-line-strong bg-surface shadow-[0_18px_50px_-12px_rgba(0,0,0,0.9)]",
      column <= 1
        ? "left-0"
        : column >= 5
          ? "right-0"
          : "left-1/2 -translate-x-1/2",
    )}
  >
    {items.slice(0, 2).map((a) => (
      <div key={a.id} className="border-b border-line last:border-b-0">
        <img src={a.image} alt="" className="h-28 w-full object-contain p-4" />
        <div className="px-3.5 py-3">
          <p className="truncate text-sm leading-tight font-semibold text-fg">{a.name}</p>
          <p className="mt-1.5 truncate text-xs text-fg-dim">
            {a.startTime} · {a.department} · {a.venue}
          </p>
        </div>
      </div>
    ))}
    {items.length > 2 && (
      <p className="border-t border-line px-3.5 py-2 text-xs text-fg-dim">
        and {items.length - 2} more
      </p>
    )}
  </motion.div>
);

/**
 * The month on the left, one activity in full on the right. Hovering a day previews
 * what's on it; clicking swaps the "next up" panel for that day's activity — the same
 * hover-then-click model the announcements section uses.
 */
const CalendarSection = () => {
  const [month, setMonth] = useState(
    () => new Date(today.getFullYear(), today.getMonth(), 1),
  );
  const [dept, setDept] = useState<DeptFilter>("all");
  const [type, setType] = useState<TypeFilter>("all");
  const [selected, setSelected] = useState<string | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  /** Which way the last month change went, so the grid slides the matching way. */
  const [direction, setDirection] = useState(0);

  const filtered = useMemo(
    () =>
      activities.filter(
        (a) =>
          (dept === "all" || a.department === dept) && (type === "all" || a.type === type),
      ),
    [dept, type],
  );

  /**
   * Activities keyed by date, so each day cell is a single lookup. A multi-day event
   * is filed under every date it runs, which is what makes it read as a block across
   * the grid rather than a mark on its first morning.
   */
  const byDate = useMemo(() => {
    const map = new Map<string, Activity[]>();

    for (const a of filtered) {
      for (const iso of datesIn(a.date, a.endDate)) {
        const list = map.get(iso) ?? [];
        list.push(a);
        map.set(iso, list);
      }
    }

    return map;
  }, [filtered]);

  /**
   * The soonest activity still ahead — the brief's stated priority. Something already
   * running counts, so a conference on its second day doesn't drop out of view.
   */
  const nextUp = useMemo(
    () =>
      filtered
        .filter((a) => daysFromToday(a.endDate ?? a.date) >= 0)
        .sort(
          (a, b) =>
            a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime),
        )[0],
    [filtered],
  );

  const days = useMemo(() => monthGrid(month), [month]);
  const selectedItems = selected ? (byDate.get(selected) ?? []) : [];

  // Which of the day's activities is showing. Wraps, and resets whenever the day
  // changes so opening a new day always starts at its first item.
  const [dayIndex, setDayIndex] = useState(0);
  useEffect(() => setDayIndex(0), [selected]);

  const safeIndex = selectedItems.length ? dayIndex % selectedItems.length : 0;
  const shown = selectedItems[safeIndex] ?? nextUp;
  const todayISO = toISO(today);

  const step = (by: number) =>
    setDayIndex((i) => (i + by + selectedItems.length) % selectedItems.length);

  const shiftMonth = (delta: number) => {
    setDirection(delta);
    setMonth((m) => new Date(m.getFullYear(), m.getMonth() + delta, 1));
    setSelected(null);
  };

  const resetFilters = <T,>(set: (v: T) => void) => (v: T) => {
    set(v);
    setSelected(null);
  };

  return (
    <section id="next-up" className="shell py-28">
      <SectionHeading
        title="LC Calendar"
        subtitle="Everything the LC has committed to this month. Hover a day to see what's on it, click to open it."
        action={
          <div className="flex shrink-0 items-center gap-5">
            <Select
              label="Department"
              value={dept}
              onChange={resetFilters(setDept)}
              width="10rem"
              options={[
                { value: "all" as DeptFilter, label: "All" },
                { value: "LC-wide" as DeptFilter, label: "LC-wide" },
                ...DEPARTMENTS.map((d) => ({ value: d as DeptFilter, label: d })),
              ]}
            />
            <Select
              label="Type"
              value={type}
              onChange={resetFilters(setType)}
              width="9rem"
              options={[
                { value: "all" as TypeFilter, label: "All" },
                ...ACTIVITY_TYPES.map((t) => ({
                  value: t as TypeFilter,
                  label: ACTIVITY_TYPE_LABEL[t],
                })),
              ]}
            />
          </div>
        }
      />

      {/* The block settles in once as it reaches the viewport, and only once. */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.15 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="grid grid-cols-[1.3fr_1fr] border-t border-line"
      >
        {/* Month */}
        <div className="border-r border-line px-8 py-7">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="overflow-hidden text-xl font-bold tracking-tight">
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={formatMonth(month)}
                  initial={{ opacity: 0, y: direction >= 0 ? 10 : -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: direction >= 0 ? -10 : 10 }}
                  transition={{ duration: 0.13, ease: [0.33, 1, 0.68, 1] }}
                  className="block"
                >
                  {formatMonth(month)}
                </motion.span>
              </AnimatePresence>
            </h3>

            <div className="flex items-center gap-5">
              <p className="text-xs font-light text-fg-dim">
                {WORKING_HOURS.days}, {WORKING_HOURS.hours}
              </p>
              <div className="flex">
                <button
                  type="button"
                  onClick={() => shiftMonth(-1)}
                  aria-label="Previous month"
                  className="grid size-8 place-items-center border border-line text-fg-muted transition-colors hover:border-line-strong hover:text-fg"
                >
                  <ChevronLeft size={16} strokeWidth={1.8} />
                </button>
                <button
                  type="button"
                  onClick={() => shiftMonth(1)}
                  aria-label="Next month"
                  className="-ml-px grid size-8 place-items-center border border-line text-fg-muted transition-colors hover:border-line-strong hover:text-fg"
                >
                  <ChevronRight size={16} strokeWidth={1.8} />
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-7">
            {WEEKDAYS.map((d) => (
              <div key={d} className="pb-3 text-center text-xs font-light text-fg-dim">
                {d}
              </div>
            ))}
          </div>

          {/*
            A hairline grid: cells share borders, so the month reads as one field.

            `overflow-x-clip` rather than `overflow-hidden`, because the grid must
            clip the month sliding in sideways while still letting the day previews
            escape upward out of the top row.
          */}
          <div className="overflow-x-clip">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={toISO(month)}
                initial={{ opacity: 0, x: direction >= 0 ? 22 : -22 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: direction >= 0 ? -22 : 22 }}
                transition={{ duration: 0.14, ease: [0.33, 1, 0.68, 1] }}
                className="grid grid-cols-7 border-t border-l border-line"
              >
                {days.map((date, cell) => {
              const iso = toISO(date);
              const column = cell % 7;
              const items = byDate.get(iso) ?? [];
              const inMonth = date.getMonth() === month.getMonth();
              const isToday = iso === todayISO;
              const isSelected = iso === selected;
              const hasItems = items.length > 0;
              // The day takes its colour from whatever is on it; the first wins when
              // there are several.
              const tone = hasItems ? FAMILY_STYLE[FAMILY[items[0].type]] : null;

              return (
                <div key={iso} className="relative border-r border-b border-line">
                  <button
                    type="button"
                    disabled={!hasItems}
                    onMouseEnter={() => setHovered(iso)}
                    onMouseLeave={() => setHovered(null)}
                    onFocus={() => setHovered(iso)}
                    onBlur={() => setHovered(null)}
                    onClick={() => setSelected(isSelected ? null : iso)}
                    aria-current={isToday ? "date" : undefined}
                    className={cx(
                      "relative flex h-20 w-full items-center justify-center transition-colors",
                      hasItems ? "cursor-pointer" : "cursor-default",
                      isSelected && tone
                        ? tone.active
                        : tone
                          ? tone.cell
                          : isToday
                            ? "bg-fg/8"
                            : "",
                      !inMonth && "opacity-30",
                    )}
                  >
                    {/* Today keeps an inset outline so it stays findable even when
                        the cell is carrying a department's colour. */}
                    {isToday && (
                      <span
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-0 ring-1 ring-fg/45 ring-inset"
                      />
                    )}

                    <span
                      className={cx(
                        "text-sm tabular-nums transition-colors",
                        isToday || isSelected
                          ? "font-semibold text-fg"
                          : hasItems
                            ? "text-fg"
                            : "text-fg-dim",
                      )}
                    >
                      {date.getDate()}
                    </span>
                  </button>

                  {hovered === iso && hasItems && (
                    <DayPreview items={items} column={column} />
                  )}
                </div>
              );
                })}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Colour alone says nothing without this. */}
          <ul className="mt-5 flex flex-wrap items-center gap-6 border-t border-line pt-4">
            {(Object.keys(FAMILY_STYLE) as (keyof typeof FAMILY_STYLE)[]).map((key) => (
              <li key={key} className="flex items-center gap-2.5 text-xs text-fg-muted">
                <span aria-hidden="true" className={cx("size-2.5", FAMILY_STYLE[key].dot)} />
                {FAMILY_STYLE[key].label}
              </li>
            ))}
          </ul>
        </div>

        {/* Detail */}
        <div className="relative">
          <AnimatePresence mode="wait">
            {shown ? (
              <motion.div
                key={shown.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.22, ease: "easeOut" }}
              >
                <ActivityDetail
                  activity={shown}
                  label={selected ? formatShortDate(selected) : "Next up"}
                  nav={
                    selectedItems.length > 1
                      ? {
                          index: safeIndex,
                          total: selectedItems.length,
                          onPrev: () => step(-1),
                          onNext: () => step(1),
                        }
                      : undefined
                  }
                />
              </motion.div>
            ) : (
              <motion.p
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="px-8 py-16 text-center text-sm text-fg-dim"
              >
                Nothing upcoming matches these filters.
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </section>
  );
};

export default CalendarSection;
