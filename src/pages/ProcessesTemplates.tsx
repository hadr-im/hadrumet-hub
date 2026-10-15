import { useMemo, useState } from "react";
import { motion } from "motion/react";
import {
  ClipboardList,
  File,
  FileText,
  type LucideIcon,
  Presentation,
  Table2,
} from "lucide-react";
import { DEPARTMENTS, templates } from "../data/mock";
import type { Department, Template, TemplateCategory } from "../data/types";
import { formatDate } from "../lib/format";
import Select from "../components/Select";
import { IndexRow, PageHeader, SearchInput } from "../components/ui";

/**
 * The full set the LC expects to keep. Categories with nothing in them are left out
 * of the index rather than shown empty — they appear on their own as soon as a
 * template is filed under them.
 */
const CATEGORY: { id: TemplateCategory; label: string; blurb: string }[] = [
  { id: "exchange", label: "Exchange", blurb: "Letters and booklets for EPs." },
  { id: "partnership", label: "Partnerships", blurb: "What goes to a partner." },
  { id: "financial", label: "Financial", blurb: "Budgets, expenses and forms." },
  { id: "meeting", label: "Meetings", blurb: "Agendas and minutes." },
  { id: "reporting", label: "Reporting", blurb: "What gets sent up, and when." },
  { id: "guidelines", label: "Guidelines", blurb: "How each department works." },
  { id: "checklists", label: "Checklists", blurb: "Events and projects, step by step." },
];

const FORMAT: Record<Template["format"], { label: string; icon: LucideIcon }> = {
  doc: { label: "Document", icon: FileText },
  sheet: { label: "Spreadsheet", icon: Table2 },
  slides: { label: "Slides", icon: Presentation },
  pdf: { label: "PDF", icon: File },
  form: { label: "Form", icon: ClipboardList },
};

type OwnerFilter = Department | "LC-wide" | "all";

/**
 * The working tools, indexed by what they're for rather than who owns them — people
 * arrive here needing to file a report or run an event, not thinking about which
 * department keeps the file.
 */
const ProcessesTemplates = () => {
  const [category, setCategory] = useState<TemplateCategory | "all">("all");
  const [owner, setOwner] = useState<OwnerFilter>("all");
  const [query, setQuery] = useState("");

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();

    return templates
      .filter(
        (t) =>
          (category === "all" || t.category === category) &&
          (owner === "all" || t.owner === owner) &&
          (q === "" ||
            t.title.toLowerCase().includes(q) ||
            t.description.toLowerCase().includes(q)),
      )
      .sort((a, b) => b.updatedOn.localeCompare(a.updatedOn));
  }, [category, owner, query]);

  const countFor = (id: TemplateCategory) =>
    templates.filter((t) => t.category === id).length;

  const shown = useMemo(() => CATEGORY.filter((c) => countFor(c.id) > 0), []);
  const active = CATEGORY.find((c) => c.id === category);

  return (
    <>
      <PageHeader
        title="Processes & Templates"
        description="The official documents the LC runs on. Start from these rather than from a blank page, and the people reading your work will know where to look."
        wash="bg-[radial-gradient(90%_100%_at_0%_0%,rgba(46,158,132,0.16),transparent_72%)]"
      />

      <div className="shell py-14">
        <div className="flex items-center gap-5 border-b border-line pb-6">
          <SearchInput
            value={query}
            onChange={setQuery}
            placeholder="Search templates and procedures"
            label="Search templates"
          />

          <Select
            label="Used by"
            value={owner}
            onChange={setOwner}
            width="10rem"
            options={[
              { value: "all" as OwnerFilter, label: "Anyone" },
              { value: "LC-wide" as OwnerFilter, label: "LC-wide" },
              ...DEPARTMENTS.map((d) => ({ value: d as OwnerFilter, label: d })),
            ]}
          />
        </div>

        <div className="grid grid-cols-[17rem_1fr]">
          <nav aria-label="Categories" className="border-r border-line">
            <IndexRow
              label="Everything"
              count={templates.length}
              active={category === "all"}
              onClick={() => setCategory("all")}
            />
            {shown.map((c) => (
              <IndexRow
                key={c.id}
                label={c.label}
                count={countFor(c.id)}
                active={category === c.id}
                tone="bg-corner-power"
                activeWash="bg-[radial-gradient(110%_80%_at_0%_0%,rgba(46,158,132,0.16),transparent_72%)]"
                onClick={() => setCategory(c.id)}
              />
            ))}
          </nav>

          <div>
            <div className="flex items-baseline justify-between gap-6 px-8 py-5">
              <p className="text-xs text-fg-dim">
                {results.length} {results.length === 1 ? "template" : "templates"}
              </p>
              {active && <p className="text-xs text-fg-dim">{active.blurb}</p>}
            </div>

            {results.length === 0 ? (
              <p className="px-8 py-20 text-center text-sm text-fg-dim">
                Nothing matches that yet. Try a broader search, or clear the filters.
              </p>
            ) : (
              <ul className="border-t border-line">
                {results.map((template, i) => (
                  <TemplateRow key={template.id} template={template} index={i} />
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

const TemplateRow = ({ template, index }: { template: Template; index: number }) => {
  const { icon: Icon, label } = FORMAT[template.format];

  return (
    <motion.li
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2, delay: Math.min(index * 0.02, 0.2) }}
      className="border-b border-line"
    >
      <a
        href={template.url}
        className="group relative grid grid-cols-[1fr_8rem_9rem] items-center gap-8 px-8 py-5 transition-colors hover:bg-white/3"
      >
        <span
          aria-hidden="true"
          className="absolute inset-y-0 left-0 w-0.5 bg-corner-power opacity-0 transition-opacity group-hover:opacity-100"
        />

        <span className="min-w-0">
          <span className="flex items-center gap-3">
            <Icon size={15} strokeWidth={1.7} className="shrink-0 text-fg-dim" />
            <span className="truncate text-[15px] font-medium text-fg">
              {template.title}
            </span>
          </span>
          <span className="mt-1.5 block truncate pl-7 text-sm text-fg-muted">
            {template.description}
          </span>
        </span>

        <span className="text-sm text-fg-muted">{template.owner}</span>

        <span className="text-right">
          <span className="block text-xs text-fg-dim">{label}</span>
          <span className="mt-1 block text-xs text-fg-dim">
            {formatDate(template.updatedOn, {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </span>
        </span>
      </a>
    </motion.li>
  );
};

export default ProcessesTemplates;
