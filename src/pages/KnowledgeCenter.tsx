import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  ExternalLink,
  FileText,
  Monitor,
  type LucideIcon,
  PlayCircle,
} from "lucide-react";
import { CORNERS, resources } from "../data/mock";
import type { Corner, Resource, ResourceKind } from "../data/types";
import { cx, formatDate, CORNER_STYLE } from "../lib/format";
import Select from "../components/Select";
import { IndexRow, PageHeader, SearchInput } from "../components/ui";

const KIND: Record<ResourceKind, { label: string; icon: LucideIcon }> = {
  document: { label: "Document", icon: FileText },
  presentation: { label: "Presentation", icon: Monitor },
  video: { label: "Video", icon: PlayCircle },
  link: { label: "Link", icon: ExternalLink },
};

type KindFilter = ResourceKind | "all";


/**
 * The library, grouped by the four corners the brief divides it into. The corner
 * list on the left is the index; the resources are on the right — the same split
 * the home page uses, so the two read as one site.
 */
const KnowledgeCenter = () => {
  const [corner, setCorner] = useState<Corner | "all">("all");
  const [category, setCategory] = useState<string | null>(null);
  const [kind, setKind] = useState<KindFilter>("all");
  const [query, setQuery] = useState("");

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();

    return resources
      .filter(
        (r) =>
          (corner === "all" || r.corner === corner) &&
          (category === null || r.category === category) &&
          (kind === "all" || r.kind === kind) &&
          (q === "" ||
            r.title.toLowerCase().includes(q) ||
            r.description.toLowerCase().includes(q) ||
            r.category.toLowerCase().includes(q)),
      )
      .sort((a, b) => b.updatedOn.localeCompare(a.updatedOn));
  }, [corner, category, kind, query]);

  const countFor = (id: Corner) => resources.filter((r) => r.corner === id).length;

  const pickCorner = (next: Corner | "all") => {
    setCorner(next);
    setCategory(null);
  };

  return (
    <>
      <PageHeader
        title="Knowledge Center"
        description="Everything the LC has learned, kept where the next term can find it. Documents, decks, recordings and links, grouped by corner."
        wash="bg-[radial-gradient(90%_100%_at_0%_0%,rgba(43,134,216,0.16),transparent_72%)]"
      />

      <div className="shell py-14">
        {/* Search and type filter sit together above the library. */}
        <div className="flex items-center gap-5 border-b border-line pb-6">
          <SearchInput
            value={query}
            onChange={setQuery}
            placeholder="Search by title, topic or department"
            label="Search resources"
          />

          <Select
            label="Type"
            value={kind}
            onChange={setKind}
            width="11rem"
            options={[
              { value: "all" as KindFilter, label: "All types" },
              ...(Object.keys(KIND) as ResourceKind[]).map((k) => ({
                value: k as KindFilter,
                label: KIND[k].label,
              })),
            ]}
          />
        </div>

        <div className="grid grid-cols-[17rem_1fr]">
          {/* Corners — the same index pattern the announcements list uses: a full-height
              edge rule carrying the colour, the count held to the right. */}
          <nav aria-label="Corners" className="border-r border-line">
            <IndexRow
              label="Everything"
              count={resources.length}
              active={corner === "all"}
              onClick={() => pickCorner("all")}
            />

            {CORNERS.map((c) => {
              const isOpen = corner === c.id;

              return (
                <div key={c.id}>
                  <IndexRow
                    label={c.label}
                    count={countFor(c.id)}
                    active={isOpen}
                    tone={CORNER_STYLE[c.id].bar}
                    activeWash={CORNER_STYLE[c.id].wash}
                    onClick={() => pickCorner(c.id)}
                  />

                  {/*
                    The corner's departments, nested beneath it on a spine. Picking one
                    takes the corner's own colour, so the tint says which family you're
                    filtered into without reading the label.

                    General Knowledge is skipped: its contents are subjects rather than
                    departments, so nesting them here would present them as the same
                    kind of thing as BD or oGV when they aren't.
                  */}
                  <AnimatePresence initial={false}>
                    {isOpen && c.id !== "general" && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2, ease: [0.33, 1, 0.68, 1] }}
                        className="overflow-hidden border-b border-line"
                      >
                        <ul className="my-2 ml-6 border-l border-line">
                          {c.departments.map((dept) => {
                            const picked = category === dept;

                            return (
                              <li key={dept} className="relative">
                                {/* Tick out of the spine into the row. */}
                                <span
                                  aria-hidden="true"
                                  className={cx(
                                    "absolute top-1/2 left-0 h-px w-3 transition-colors",
                                    picked ? CORNER_STYLE[c.id].bar : "bg-line",
                                  )}
                                />
                                <button
                                  type="button"
                                  onClick={() => setCategory(picked ? null : dept)}
                                  aria-pressed={picked}
                                  className={cx(
                                    "w-full py-2 pl-6 text-left text-xs transition-colors",
                                    picked
                                      ? cx("font-semibold", CORNER_STYLE[c.id].text)
                                      : "text-fg-dim hover:text-fg-muted",
                                  )}
                                >
                                  {dept}
                                </button>
                              </li>
                            );
                          })}
                        </ul>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </nav>

          {/* Results */}
          <div>
            <p className="px-8 py-5 text-xs text-fg-dim">
              {results.length} {results.length === 1 ? "resource" : "resources"}
              {category && ` in ${category}`}
            </p>

            {results.length === 0 ? (
              <p className="px-8 py-20 text-center text-sm text-fg-dim">
                Nothing matches that yet. Try a broader search, or clear the filters.
              </p>
            ) : (
              <ul className="border-t border-line">
                {results.map((resource, i) => (
                  <ResourceRow key={resource.id} resource={resource} index={i} />
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

const ResourceRow = ({ resource, index }: { resource: Resource; index: number }) => {
  const { icon: Icon, label } = KIND[resource.kind];
  const tone = CORNER_STYLE[resource.corner];

  return (
    <motion.li
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2, delay: Math.min(index * 0.02, 0.2) }}
      className="border-b border-line"
    >
      <a
        href={resource.url}
        className="group relative grid grid-cols-[1fr_8rem_9rem] items-center gap-8 px-8 py-5 transition-colors hover:bg-white/3"
      >
        <span
          aria-hidden="true"
          className={cx(
            "absolute inset-y-0 left-0 w-0.5 opacity-0 transition-opacity group-hover:opacity-100",
            tone.bar,
          )}
        />

        <span className="min-w-0">
          <span className="flex items-center gap-3">
            <Icon size={15} strokeWidth={1.7} className="shrink-0 text-fg-dim" />
            <span className="truncate text-[15px] font-medium text-fg">
              {resource.title}
            </span>
          </span>
          <span className="mt-1.5 block truncate pl-7 text-sm text-fg-muted">
            {resource.description}
          </span>
        </span>

        <span className="text-sm text-fg-muted">{resource.category}</span>

        <span className="text-right">
          <span className="block text-xs text-fg-dim">{label}</span>
          <span className="mt-1 block text-xs text-fg-dim">
            Updated {formatDate(resource.updatedOn, { day: "numeric", month: "short", year: "numeric" })}
          </span>
        </span>
      </a>
    </motion.li>
  );
};

export default KnowledgeCenter;
