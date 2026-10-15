import { useMemo, useState } from "react";
import { motion } from "motion/react";
import { ArrowUpRight } from "lucide-react";
import { opportunities } from "../data/mock";
import type { Audience, Opportunity, OpportunityKind } from "../data/types";
import { cx, daysFromToday, formatDate } from "../lib/format";
import Select from "../components/Select";
import { PageHeader, SearchInput } from "../components/ui";

const KIND: Record<OpportunityKind, string> = {
  lst: "LST",
  est: "EST",
  "event-oc": "Event OC",
  "conference-oc": "Conference OC",
  uba: "UBA",
  other: "Other",
};

const AUDIENCES: Audience[] = ["Members", "MMB", "Members & MMB", "LC-wide"];

type KindFilter = OpportunityKind | "all";
type AudienceFilter = Audience | "all";

const WASH = {
  urgent: "bg-[radial-gradient(70%_120%_at_0%_50%,rgba(224,82,82,0.1),transparent_62%)]",
  soon: "bg-[radial-gradient(70%_120%_at_0%_50%,rgba(201,138,46,0.1),transparent_62%)]",
  open: "bg-[radial-gradient(70%_120%_at_0%_50%,rgba(255,255,255,0.04),transparent_62%)]",
  closed: "",
};

/**
 * How close a deadline is, in words and in colour. The number of days left is what
 * decides whether someone acts today or forgets, so it leads each row rather than
 * being buried in the detail — and the row washes in the same colour, which is what
 * catches the eye before any of it has been read.
 */
const urgency = (iso: string) => {
  const days = daysFromToday(iso);

  if (days < 0)
    return {
      label: "Closed",
      text: "text-fg-dim",
      rule: "bg-line-strong",
      wash: WASH.closed,
      open: false,
    };
  if (days === 0)
    return {
      label: "Closes today",
      text: "text-urgent",
      rule: "bg-urgent",
      wash: WASH.urgent,
      open: true,
    };
  if (days <= 3)
    return {
      label: `${days} days left`,
      text: "text-urgent",
      rule: "bg-urgent",
      wash: WASH.urgent,
      open: true,
    };
  if (days <= 7)
    return {
      label: `${days} days left`,
      text: "text-behind",
      rule: "bg-behind",
      wash: WASH.soon,
      open: true,
    };

  return {
    label: `${days} days left`,
    text: "text-fg-muted",
    rule: "bg-fg-dim",
    wash: WASH.open,
    open: true,
  };
};

/**
 * Everything a member can put their hand up for. Sorted by deadline rather than by
 * kind or department: the question people arrive with is "what can I still apply
 * for", and anything already closed belongs at the bottom.
 */
const Opportunities = () => {
  const [kind, setKind] = useState<KindFilter>("all");
  const [audience, setAudience] = useState<AudienceFilter>("all");
  const [query, setQuery] = useState("");

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();

    return opportunities
      .filter(
        (o) =>
          (kind === "all" || o.kind === kind) &&
          // "LC-wide" is open to everyone, so it survives any audience filter.
          (audience === "all" ||
            o.audience === audience ||
            o.audience === "LC-wide" ||
            (o.audience === "Members & MMB" &&
              (audience === "Members" || audience === "MMB"))) &&
          (q === "" ||
            o.title.toLowerCase().includes(q) ||
            o.description.toLowerCase().includes(q)),
      )
      .sort((a, b) => {
        const aOpen = daysFromToday(a.deadline) >= 0;
        const bOpen = daysFromToday(b.deadline) >= 0;
        if (aOpen !== bOpen) return aOpen ? -1 : 1;
        return a.deadline.localeCompare(b.deadline);
      });
  }, [kind, audience, query]);

  const openCount = results.filter((o) => daysFromToday(o.deadline) >= 0).length;

  return (
    <>
      <PageHeader
        title="Opportunities"
        description="Ways to take on more than your role asks of you — open positions, organising committees, conferences and certifications."
        wash="bg-[radial-gradient(90%_100%_at_0%_0%,rgba(184,132,31,0.16),transparent_72%)]"
      />

      <div className="shell py-14">
        <div className="flex items-center gap-5 border-b border-line pb-6">
          <SearchInput
            value={query}
            onChange={setQuery}
            placeholder="Search openings"
            label="Search opportunities"
          />

          <Select
            label="Type"
            value={kind}
            onChange={setKind}
            width="11rem"
            options={[
              { value: "all" as KindFilter, label: "Everything" },
              ...(Object.keys(KIND) as OpportunityKind[]).map((k) => ({
                value: k as KindFilter,
                label: KIND[k],
              })),
            ]}
          />

          <Select
            label="Open to"
            value={audience}
            onChange={setAudience}
            width="11rem"
            options={[
              { value: "all" as AudienceFilter, label: "Anyone" },
              ...AUDIENCES.map((a) => ({ value: a as AudienceFilter, label: a })),
            ]}
          />
        </div>

        <p className="py-5 text-xs text-fg-dim">
          {openCount} still open
          {results.length > openCount && ` · ${results.length - openCount} closed`}
        </p>

        {results.length === 0 ? (
          <p className="border-t border-line px-8 py-20 text-center text-sm text-fg-dim">
            Nothing matches that yet. Try a broader search, or clear the filters.
          </p>
        ) : (
          <ul className="border-t border-line">
            {results.map((item, i) => (
              <OpportunityRow key={item.id} item={item} index={i} />
            ))}
          </ul>
        )}
      </div>
    </>
  );
};

const OpportunityRow = ({ item, index }: { item: Opportunity; index: number }) => {
  const when = urgency(item.deadline);

  return (
    <motion.li
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2, delay: Math.min(index * 0.03, 0.24) }}
      className={cx(
        "group relative border-b border-line transition-colors",
        when.wash,
        !when.open && "opacity-55",
      )}
    >
      <span aria-hidden="true" className={cx("absolute inset-y-0 left-0 w-0.5", when.rule)} />

      <div className="grid grid-cols-[9rem_1fr_13rem] items-start gap-10 py-7 pr-6 pl-8">
        {/* Deadline first: it is what decides whether this is worth reading. */}
        <div>
          <p className={cx("text-sm font-semibold", when.text)}>{when.label}</p>
          <p className="mt-1.5 text-xs text-fg-dim">
            {formatDate(item.deadline, { day: "numeric", month: "short", year: "numeric" })}
          </p>
        </div>

        <div className="min-w-0">
          <h2 className="text-lg font-semibold text-fg">{item.title}</h2>

          <p className="mt-3 max-w-[70ch] text-sm leading-relaxed text-fg-muted">
            {item.description}
          </p>

          <ul className="mt-4 space-y-1.5">
            {item.requirements.map((line) => (
              <li key={line} className="flex gap-3 text-sm text-fg-muted">
                <span aria-hidden="true" className="mt-2 size-1 shrink-0 bg-fg-dim" />
                {line}
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-col items-stretch">
          {when.open ? (
            <a
              href={item.applyUrl}
              className="flex items-center justify-between gap-2 border border-line-strong px-4 py-2.5 text-sm font-medium text-fg transition-colors hover:border-fg-muted hover:bg-white/6"
            >
              Opportunity link
              <ArrowUpRight size={15} strokeWidth={1.8} className="text-fg-dim" />
            </a>
          ) : (
            <p className="border border-line px-4 py-2.5 text-center text-sm text-fg-dim">
              Applications closed
            </p>
          )}
        </div>
      </div>
    </motion.li>
  );
};

export default Opportunities;
