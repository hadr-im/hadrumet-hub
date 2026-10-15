import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { announcements } from "../../data/mock";
import { cx, formatDate, formatDayName, relativeDay } from "../../lib/format";
import { SectionHeading } from "../ui";

/** Urgent first, then pinned, then newest — the order the brief asks for. */
const ordered = [...announcements].sort(
  (a, b) =>
    Number(b.urgent) - Number(a.urgent) ||
    Number(b.pinned) - Number(a.pinned) ||
    b.postedOn.localeCompare(a.postedOn),
);

const ROTATE_MS = 5500;

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * An index on the left, the full update on the right. Hovering a title previews it,
 * clicking holds it — the same model the calendar uses, so the page behaves one way.
 *
 * Left to itself the section steps through the announcements. The rule down the left
 * of the open row fills as its turn runs out, so the movement is announced before it
 * happens rather than surprising the reader.
 *
 * Built from hairlines on the page's own background, not a filled card, so the dark
 * field runs unbroken out of the hero.
 */
const Announcements = () => {
  const [pinnedId, setPinnedId] = useState(ordered[0].id);
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [rotating, setRotating] = useState(true);

  const activeId = previewId ?? pinnedId;
  const active = ordered.find((a) => a.id === activeId)!;

  /*
    Hovering holds the current one in place; a click stops the cycle for good, since
    once someone has chosen, the page shouldn't keep changing under them. Reduced
    motion opts out of the rotation entirely.
  */
  useEffect(() => {
    if (!rotating || previewId !== null || prefersReducedMotion()) return;

    const timer = setTimeout(() => {
      const i = ordered.findIndex((a) => a.id === pinnedId);
      setPinnedId(ordered[(i + 1) % ordered.length].id);
    }, ROTATE_MS);

    return () => clearTimeout(timer);
  }, [rotating, previewId, pinnedId]);

  const choose = (id: string) => {
    setPinnedId(id);
    setRotating(false);
  };

  return (
    <section id="announcements" className="shell py-28">
      <SectionHeading
        title="Announcements"
        subtitle="Official updates from the EB. Anything urgent stays at the top until it's dealt with."
      />

      {/* The block settles in once as it reaches the viewport, as the other sections do. */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.15 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="grid grid-cols-[23rem_1fr] border-t border-line"
      >
        {/* Index */}
        <ul className="border-r border-line" onMouseLeave={() => setPreviewId(null)}>
          {ordered.map((item) => {
            const isPinned = item.id === pinnedId;
            const isShowing = item.id === activeId;
            const tone = item.urgent ? "bg-urgent" : "bg-fg";

            return (
              <li key={item.id} className="border-b border-line last:border-b-0">
                <button
                  type="button"
                  onMouseEnter={() => setPreviewId(item.id)}
                  onFocus={() => setPreviewId(item.id)}
                  onBlur={() => setPreviewId(null)}
                  onClick={() => choose(item.id)}
                  aria-current={isPinned ? "true" : undefined}
                  className={cx(
                    "relative flex w-full items-center gap-3 py-5 pr-6 pl-7 text-left transition-colors",
                    isPinned ? "bg-white/6" : isShowing ? "bg-white/3" : "hover:bg-white/2",
                  )}
                >
                  {/* Every row carries a rule. Gray at rest, red if the item is urgent. */}
                  <span
                    className={cx(
                      "absolute inset-y-0 left-0 w-0.5",
                      item.urgent ? "bg-urgent/40" : "bg-line-strong",
                    )}
                  />

                  {/* The open row's rule fills downward as its turn runs out. Keyed on
                      the id so the fill restarts with each announcement. */}
                  {isPinned &&
                    (rotating ? (
                      <span
                        key={pinnedId}
                        className={cx(
                          "absolute top-0 left-0 w-0.5 animate-[fill-down_5500ms_linear_forwards]",
                          tone,
                        )}
                      />
                    ) : (
                      <span className={cx("absolute inset-y-0 left-0 w-0.5", tone)} />
                    ))}

                  {/* Previewing another row marks it without claiming it. */}
                  {!isPinned && isShowing && (
                    <span
                      className={cx("absolute inset-y-0 left-0 w-0.5 opacity-55", tone)}
                    />
                  )}

                  <span className="min-w-0 flex-1">
                    <span
                      className={cx(
                        "block text-[15px] leading-snug transition-colors",
                        isPinned
                          ? "font-semibold text-fg"
                          : isShowing
                            ? "font-medium text-fg"
                            : "font-medium text-fg-muted",
                      )}
                    >
                      {item.title}
                    </span>
                    {/* When it happens, not when it was written — that is what the
                        reader is scanning this list for. */}
                    <span className="mt-1.5 block text-xs text-fg-dim">
                      {item.dueOn ? relativeDay(item.dueOn) : relativeDay(item.postedOn)}
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>

        {/* Detail */}
        <div className="relative min-h-88 px-14 py-12">
          {/*
            A wash across the panel rather than a box around it — red when the update
            is urgent, a plain gray lift otherwise. Two layers cross-fading on opacity,
            because a background-image swap can't transition on its own.
          */}
          <div
            aria-hidden="true"
            className={cx(
              "pointer-events-none absolute inset-0 bg-[radial-gradient(110%_80%_at_0%_0%,rgba(224,82,82,0.14),transparent_72%)] transition-opacity duration-500",
              active.urgent ? "opacity-100" : "opacity-0",
            )}
          />
          <div
            aria-hidden="true"
            className={cx(
              "pointer-events-none absolute inset-0 bg-[radial-gradient(110%_80%_at_0%_0%,rgba(255,255,255,0.06),transparent_72%)] transition-opacity duration-500",
              active.urgent ? "opacity-0" : "opacity-100",
            )}
          />

          <AnimatePresence mode="wait">
            <motion.article
              key={active.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              className="relative"
            >
              <h3 className="max-w-[20ch] text-[clamp(1.5rem,2.3vw,2.25rem)] leading-[1.1] font-bold tracking-tight">
                {active.title}
              </h3>

              <p className="mt-5 max-w-[62ch] text-[17px] leading-relaxed text-fg-muted">
                {active.body}
              </p>

              {/*
                The rule is pulled out to the column's edges so it reads as a division
                of the whole panel, not an underline inside the text block.

                Urgency is named here in words as well as colour — the red wash and
                rule alone would leave colourblind readers nothing to go on.
              */}
              <dl className="-mx-14 mt-10 flex gap-12 border-t border-line px-14 pt-5 text-sm">
                <div>
                  <dt className="text-xs text-fg-dim">Posted by</dt>
                  <dd className="mt-1 text-fg">{active.author}</dd>
                </div>
                {active.dueOn && (
                  <div>
                    <dt className="text-xs text-fg-dim">When</dt>
                    <dd className="mt-1 text-fg">
                      {formatDayName(active.dueOn)}, {formatDate(active.dueOn)}
                    </dd>
                  </div>
                )}
                <div>
                  <dt className="text-xs text-fg-dim">Posted</dt>
                  <dd className="mt-1 text-fg">
                    {formatDayName(active.postedOn)}, {formatDate(active.postedOn)}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-fg-dim">Destined for</dt>
                  <dd className="mt-1 text-fg">{active.audience}</dd>
                </div>
                {active.urgent && (
                  <div>
                    <dt className="text-xs text-fg-dim">Status</dt>
                    <dd className="mt-1 font-medium text-urgent">Urgent</dd>
                  </div>
                )}
              </dl>
            </motion.article>
          </AnimatePresence>
        </div>
      </motion.div>
    </section>
  );
};

export default Announcements;
