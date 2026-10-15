import { useState } from "react";
import { motion } from "motion/react";
import {
  DEPARTMENT_NAME,
  departmentProgress,
  monthlyTarget,
  rankings,
} from "../../data/mock";
import type { DepartmentProgress, RankingEntry } from "../../data/types";
import { cx } from "../../lib/format";
import CountUp from "../CountUp";
import { SectionHeading } from "../ui";

const pct = (d: { achieved: number; target: number }) =>
  Math.round((d.achieved / d.target) * 100);

/**
 * Pacing, not identity — and always printed as a word next to the colour, because
 * colour alone leaves colourblind readers with nothing to read.
 */
const status = (p: number) =>
  p >= 75
    ? {
        label: "On track",
        text: "text-accent-bright",
        bar: "bg-accent-bright",
        wash: "bg-[radial-gradient(110%_90%_at_0%_0%,rgba(78,163,239,0.13),transparent_72%)]",
      }
    : p >= 50
      ? {
          label: "Close",
          text: "text-behind",
          bar: "bg-behind",
          wash: "bg-[radial-gradient(110%_90%_at_0%_0%,rgba(201,138,46,0.13),transparent_72%)]",
        }
      : {
          label: "Behind",
          text: "text-urgent",
          bar: "bg-urgent",
          wash: "bg-[radial-gradient(110%_90%_at_0%_0%,rgba(224,82,82,0.13),transparent_72%)]",
        };

const RankTile = ({ entry }: { entry: RankingEntry }) => {
  return (
    <div className="border-r border-b border-line px-6 py-6">
      <p className="text-xs text-fg-dim">
        {entry.scope} · {entry.measure}
      </p>

      <p className="mt-3 flex items-baseline gap-2">
        <span className="text-4xl leading-none font-bold tracking-tight text-fg tabular-nums">
          <CountUp to={entry.position} />
        </span>
        <span className="text-sm text-fg-muted">
          of {entry.outOf.toLocaleString("en-GB")}
        </span>
      </p>

    </div>
  );
};

const ProgressRow = ({
  item,
  hovered,
  onHover,
}: {
  item: DepartmentProgress;
  hovered: boolean;
  onHover: (on: boolean) => void;
}) => {
  const p = pct(item);
  const s = status(p);

  return (
    <li
      onMouseEnter={() => onHover(true)}
      onMouseLeave={() => onHover(false)}
      className={cx(
        "relative grid grid-cols-[6rem_1fr_5rem_4rem] items-center gap-6 border-b border-line px-3 py-4 transition-colors",
        hovered && "bg-white/3",
      )}
    >
      <span className="truncate text-sm font-semibold text-fg">{item.department}</span>

      {/* The track is the month's target; the fill is what's been approved. */}
      <span
        role="meter"
        aria-valuenow={p}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${item.department}: ${item.achieved} of ${item.target}, ${s.label}`}
        className="relative block h-2 bg-line"
      >
        <motion.span
          className={cx("absolute inset-y-0 left-0 overflow-hidden", s.bar)}
          initial={{ width: 0 }}
          whileInView={{ width: `${Math.min(100, p)}%` }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        >
          <span aria-hidden="true" className="bar-flow absolute inset-y-0 left-0 w-[200%]" />
        </motion.span>
      </span>

      <span className="text-right text-sm text-fg-muted tabular-nums">
        {item.achieved}
        <span className="text-fg-dim"> / </span>
        {item.target}
      </span>

      <span className={cx("text-right text-sm tabular-nums", s.text)}>{p}%</span>

      {hovered && (
        <span className="pointer-events-none absolute -top-8 left-32 z-20 border border-line-strong bg-surface px-2.5 py-1.5 text-xs whitespace-nowrap text-fg">
          {DEPARTMENT_NAME[item.department]} · {item.metric} this month
        </span>
      )}
    </li>
  );
};

/**
 * Where the LC stands against the other LCs, and how the exchange departments are
 * pacing toward this month's approval targets.
 *
 * The LC's own figure leads as a plain number rather than a chart — one value has
 * nothing to compare against, so a chart would only decorate it.
 */
const PerformanceSection = () => {
  const [hovered, setHovered] = useState<string | null>(null);

  const sorted = [...departmentProgress].sort((a, b) => pct(b) - pct(a));
  const behind = sorted.filter((d) => pct(d) < 70).length;
  const lcPct = pct(monthlyTarget);
  const lcStatus = status(lcPct);

  return (
    <section id="performance" className="shell py-28">
      <SectionHeading
        title="Performance & Ranking"
        subtitle="Where Hadrumet sits against the other LCs, and how the exchange departments are pacing this month."
      />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.12 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="border-t border-line"
      >
        {/* The month's headline figure, given the room it deserves. The wash behind it
            carries the same status colour as the bar, so the block reads at a glance. */}
        <div
          className={cx(
            "relative grid grid-cols-[1fr_auto] items-end gap-16 px-3 py-10",
            lcStatus.wash,
          )}
        >
          <div>
            <p className="text-sm text-fg-muted">
              {monthlyTarget.metric} in {monthlyTarget.month}
            </p>

            <p className="mt-4 flex items-baseline gap-3">
              <span className="text-7xl leading-none font-bold tracking-tight text-fg tabular-nums">
                <CountUp to={monthlyTarget.achieved} />
              </span>
              <span className="text-xl text-fg-muted">
                of {monthlyTarget.target}
              </span>
            </p>

            <span
              role="meter"
              aria-valuenow={lcPct}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`${monthlyTarget.achieved} of ${monthlyTarget.target} approvals, ${lcStatus.label}`}
              className="relative mt-7 block h-2.5 w-full bg-line"
            >
              <motion.span
                className={cx("absolute inset-y-0 left-0 overflow-hidden", lcStatus.bar)}
                initial={{ width: 0 }}
                whileInView={{ width: `${Math.min(100, lcPct)}%` }}
                viewport={{ once: true, amount: 0.6 }}
                transition={{ duration: 0.9, ease: "easeOut" }}
              >
                <span
                  aria-hidden="true"
                  className="bar-flow absolute inset-y-0 left-0 w-[200%]"
                />
              </motion.span>
            </span>
          </div>

          <p className={cx("text-right text-3xl font-bold tabular-nums", lcStatus.text)}>
            {lcPct}%
          </p>
        </div>

        {/* Ranking */}
        <div className="grid grid-cols-2 border-t border-l border-line">
          {rankings.map((entry) => (
            <RankTile key={`${entry.scope}-${entry.measure}`} entry={entry} />
          ))}
        </div>

        {/* Per department */}
        <div className="mt-14">
          <div className="mb-5 flex items-end justify-between gap-8">
            <div>
              <h3 className="text-lg font-bold tracking-tight">
                Progress toward {monthlyTarget.month} targets
              </h3>
              <p className="mt-1.5 text-sm text-fg-muted">
                {behind === 0
                  ? "Every exchange department is pacing."
                  : `${behind} ${behind === 1 ? "department is" : "departments are"} behind.`}
              </p>
            </div>

          </div>

          <ul className="border-t border-line">
            {sorted.map((item) => (
              <ProgressRow
                key={item.department}
                item={item}
                hovered={hovered === item.department}
                onHover={(on) => setHovered(on ? item.department : null)}
              />
            ))}
          </ul>
        </div>
      </motion.div>
    </section>
  );
};

export default PerformanceSection;
