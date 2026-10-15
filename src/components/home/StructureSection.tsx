import { useLayoutEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowDown, ChevronRight, Mail, Phone, UserRound } from "lucide-react";
import { DEPARTMENT_NAME, lcp, members, reportsOf } from "../../data/mock";
import type { Department, Member } from "../../data/types";
import { cx } from "../../lib/format";
import CountUp from "../CountUp";
import Dialog from "../Dialog";
import { SectionHeading } from "../ui";
import { useOrgLinks, type LinkGroup } from "./useOrgLinks";

const vps = reportsOf(lcp.id);

type Stage = { view: "lcp" } | { view: "eb" } | { view: "dept"; vpId: string };

const EASE = [0.33, 1, 0.68, 1] as const;

/**
 * A stand-in for a face. The tree is about posts rather than people, so a portrait
 * would be claiming something the card isn't saying — and the photographs were
 * placeholder strangers anyway.
 */
const Avatar = ({ box, icon }: { box: string; icon: number }) => (
  <span
    aria-hidden="true"
    className={cx(
      "grid shrink-0 place-items-center border border-line bg-raised text-fg-dim transition-colors group-hover:text-fg-muted",
      box,
    )}
  >
    <UserRound size={icon} strokeWidth={1.4} />
  </span>
);

/* ---------------------------------------------------------------- nodes --- */

/** The head of whichever view is showing: the LCP, or a department's VP. */
const HeadCard = ({
  member,
  caption,
  onOpen,
}: {
  member: Member;
  caption?: string;
  onOpen: () => void;
}) => (
  <button
    type="button"
    onClick={onOpen}
    className="group flex w-72 items-center gap-4 border border-line bg-base px-5 py-4 text-left transition-colors hover:border-fg-muted hover:bg-white/4"
  >
    <Avatar box="size-14" icon={24} />
    <span className="min-w-0">
      <span className="block truncate font-semibold text-fg">{roleTitle(member)}</span>
      {caption && (
        <span className="mt-1 block truncate text-xs text-fg-dim">{caption}</span>
      )}
    </span>
  </button>
);

/** How a department is made up, in the words the LC actually uses for those roles. */
const breakdown = (vpId: string) => {
  const leads = reportsOf(vpId);
  const members = leads.reduce((n, lead) => n + reportsOf(lead.id).length, 0);
  const word = leads[0]?.level === "tl" ? "team leader" : "manager";

  const parts = [`${leads.length} ${word}${leads.length === 1 ? "" : "s"}`];
  if (members > 0) parts.push(`${members} member${members === 1 ? "" : "s"}`);

  return parts.join(" & ");
};

/**
 * A VP in the board row. The make-up of the department is spelled out underneath
 * rather than drawn as a bar — "4 team leaders, 20 members" answers the question a
 * bar only gestures at.
 */
const BoardCard = ({
  member,
  active,
  onOpen,
  onHover,
}: {
  member: Member;
  active: boolean;
  onOpen: () => void;
  onHover: (hovering: boolean) => void;
}) => (
  <button
    type="button"
    onClick={onOpen}
    onMouseEnter={() => onHover(true)}
    onMouseLeave={() => onHover(false)}
    onFocus={() => onHover(true)}
    onBlur={() => onHover(false)}
    className={cx(
      // h-full with a stretched row keeps every card the same height whatever its
      // breakdown says; mt-auto then pins the footers to a common line.
      "group flex h-full w-52 flex-col border bg-base pt-4 text-left transition-colors",
      active ? "border-fg-muted bg-white/4" : "border-line hover:border-fg-muted hover:bg-white/4",
    )}
  >
    {/* A little room above the rule even on the shortest card, where mt-auto would
        otherwise leave almost none. */}
    <span className="flex items-center gap-3 px-4 pb-4">
      <Avatar box="size-10" icon={18} />
      <span className="min-w-0 text-sm leading-tight font-semibold text-fg">
        VP {member.department}
      </span>
    </span>

    {/*
      The rule is its own element rather than a border on the padded block beneath
      it: a border there is drawn inside that block's box, so it stopped short of the
      card's edges instead of dividing it.
    */}
    <span aria-hidden="true" className="mt-auto block h-px w-full bg-line" />
    <span className="block px-4 pt-3 pb-3.5 text-[11px] leading-relaxed text-fg-muted">
      {breakdown(member.id)}
    </span>
  </button>
);

/**
 * What a node is called. The tree shows the post rather than the person: the post is
 * what someone is looking for when they read a structure, and it outlives whoever
 * happens to hold it this term. Names live in the dialog, where you've asked for a
 * particular person.
 */
const roleTitle = (member: Member) => {
  switch (member.level) {
    case "lcp":
      return "Local Committee President";
    case "vp":
      return `VP ${member.department}`;
    case "manager":
      return `${member.department} Manager`;
    case "tl":
      return `${member.department} Team Leader`;
    default:
      return `${member.department} Member`;
  }
};

/**
 * Anyone inside a department: a manager, a team leader or a member. They share one
 * card so a team reads as one kind of thing — only the width changes, since members
 * come in fives and leads come in twos.
 *
 * Small departments get the larger size; a handful of nodes on a full-width canvas
 * looks lost at the scale a crowded one needs.
 */
const PersonCard = ({
  member,
  roomy,
  onOpen,
}: {
  member: Member;
  roomy: boolean;
  onOpen: () => void;
}) => {
  const isLead = member.level !== "member";

  return (
    <button
      type="button"
      onClick={onOpen}
      className={cx(
        "group flex items-center border border-line bg-base text-left transition-colors hover:border-fg-muted hover:bg-white/4",
        isLead
          ? roomy
            ? "w-68 gap-4 px-5 py-4"
            : "w-56 gap-3.5 px-4 py-3.5"
          : roomy
            ? "w-56 gap-3.5 px-4 py-3.5"
            : "w-48 gap-3 px-3.5 py-3",
      )}
    >
      <Avatar
        box={isLead ? (roomy ? "size-13" : "size-11") : roomy ? "size-11" : "size-10"}
        icon={isLead ? (roomy ? 22 : 20) : roomy ? 20 : 18}
      />
      <span
        className={cx(
          "min-w-0 truncate leading-tight font-semibold text-fg",
          isLead && roomy ? "text-base" : "text-sm",
        )}
      >
        {roleTitle(member)}
      </span>
    </button>
  );
};

/* -------------------------------------------------------------- section --- */

/**
 * The structure, walked one step at a time, drilling by department rather than by
 * level — opening a VP shows that whole department at once.
 *
 * Deliberately monochrome: the tree is about who sits where, and the corner colours
 * that carry meaning in the calendar would only be decoration here.
 */
const StructureSection = () => {
  const [stage, setStage] = useState<Stage>({ view: "lcp" });
  const [openId, setOpenId] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const open = members.find((m) => m.id === openId) ?? null;

  const activeVp = stage.view === "dept" ? members.find((m) => m.id === stage.vpId)! : null;
  const activeTeam = useMemo(() => (activeVp ? reportsOf(activeVp.id) : []), [activeVp]);

  /** A small department gets bigger nodes — a few cards at the crowded size look lost. */
  const roomy = useMemo(
    () =>
      activeTeam.length +
        activeTeam.reduce((n, lead) => n + reportsOf(lead.id).length, 0) <=
      10,
    [activeTeam],
  );

  /** One group per parent: the board under the LCP, then each lead's team. */
  const groups = useMemo<LinkGroup[]>(() => {
    if (stage.view === "eb") {
      return [{ parentId: lcp.id, childIds: vps.map((v) => v.id) }];
    }

    if (!activeVp) return [];

    return [
      { parentId: activeVp.id, childIds: activeTeam.map((m) => m.id) },
      ...activeTeam
        .map((lead) => ({
          parentId: lead.id,
          childIds: reportsOf(lead.id).map((m) => m.id),
        }))
        .filter((g) => g.childIds.length > 0),
    ];
  }, [stage.view, activeVp, activeTeam]);

  const { containerRef, register, drawn, remeasure } = useOrgLinks(groups, [
    stage.view,
    activeVp?.id,
  ]);

  /*
    A tree wider than the window would otherwise open scrolled hard left, putting the
    head of it off to one side. The head sits in the middle of the content, so start
    the scroll in the middle too.
  */
  const scrollRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const centre = () => {
      const el = scrollRef.current;
      if (!el) return;
      el.scrollLeft = (el.scrollWidth - el.clientWidth) / 2;
    };

    centre();
    const frame = requestAnimationFrame(centre);
    const settle = setTimeout(centre, 260);

    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(settle);
    };
  }, [stage.view, activeVp?.id]);

  const totalPeople = members.length;
  /** The middle management body: managers and team leaders, not the EB. */
  const mmb = members.filter((m) => m.level === "manager" || m.level === "tl").length;
  const memberCount = members.filter((m) => m.level === "member").length;

  const STATS = [
    { label: "People in the LC", value: totalPeople },
    { label: "Departments", value: vps.length },
    { label: "MMB", value: mmb },
    { label: "Members", value: memberCount },
  ];

  const LINE_PROPS = {
    fill: "none",
    stroke: "var(--color-line-strong)",
    strokeWidth: 1,
    shapeRendering: "crispEdges" as const,
  };

  return (
    <section id="structure" className="shell flex min-h-svh flex-col justify-center py-28">
      <SectionHeading
        title="LC Structure"
        subtitle="Start at the top and work down. Opening a department shows all of it at once."
      />

      {/* Totals sit above the tree and stay put, so they read as the LC's headline
          numbers rather than something belonging to one step. */}
      <motion.dl
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="grid grid-cols-4 border-t border-l border-line"
      >
        {STATS.map((stat) => (
          <div
            key={stat.label}
            className="flex items-baseline gap-3 border-r border-b border-line px-6 py-5"
          >
            <dd className="text-4xl leading-none font-bold tracking-tight text-fg tabular-nums">
              <CountUp to={stat.value} />
            </dd>
            <dt className="text-sm text-fg-muted">{stat.label}</dt>
          </div>
        ))}
      </motion.dl>

      <nav
        aria-label="Structure level"
        className="flex items-center gap-2 py-4 text-sm"
      >
        <button
          type="button"
          onClick={() => setStage({ view: "lcp" })}
          className={cx(
            "transition-colors",
            stage.view === "lcp" ? "font-semibold text-fg" : "text-fg-muted hover:text-fg",
          )}
        >
          LC President
        </button>

        {stage.view !== "lcp" && (
          <>
            <ChevronRight size={14} strokeWidth={1.6} className="text-fg-dim" />
            <button
              type="button"
              onClick={() => setStage({ view: "eb" })}
              className={cx(
                "transition-colors",
                stage.view === "eb" ? "font-semibold text-fg" : "text-fg-muted hover:text-fg",
              )}
            >
              Executive Board
            </button>
          </>
        )}

        {activeVp && (
          <>
            <ChevronRight size={14} strokeWidth={1.6} className="text-fg-dim" />
            <span className="font-semibold text-fg">
              {DEPARTMENT_NAME[activeVp.department as Department]}
            </span>
          </>
        )}
      </nav>

      {/*
        A department wider than the window scrolls sideways. The links live inside the
        scrolling content, not over it, so they travel with the nodes they join — a
        connector drawn on a fixed overlay would slide off its branch on first scroll.
      */}
      {/*
        The block settles in as it reaches the viewport, like the calendar does. The
        links are re-measured once that finishes, because a transform moves the nodes
        without resizing them — the observer would never notice on its own.
      */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        onAnimationComplete={remeasure}
        className="relative flex-1 border-t border-line"
      >
        {/* Light falling from above onto the root of the tree — the same device as
            the hero, and the same faint wash the other sections carry. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(80%_65%_at_50%_0%,rgba(255,255,255,0.055),transparent_70%)]"
        />

        <div
          ref={scrollRef}
          className="no-scrollbar overflow-x-auto overflow-y-hidden pt-14 pb-10"
        >
          {/*
            Wide gutters only where the view actually scrolls, so the outermost cards
            clear the edges and the fades. The board fits on screen, so it gets the
            width back instead.
          */}
          <div
            ref={containerRef}
            className={cx(
              "relative w-max min-w-full",
              stage.view === "dept" ? "px-24" : "px-6",
            )}
          >
            {/* One trunk, one shared rail, one drop per child — nothing drawn twice. */}
            <svg
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 h-full w-full overflow-visible"
        >
          {drawn.map((group, g) => {
            // Each level starts after the one above it has finished drawing.
            const base = 0.12 + g * 0.22;

            return (
              <g key={`${stage.view}-${group.parentId}`}>
                <motion.path
                  d={group.trunk}
                  {...LINE_PROPS}
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.16, delay: base, ease: EASE }}
                />
                {group.rail && (
                  <motion.path
                    d={group.rail}
                    {...LINE_PROPS}
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.22, delay: base + 0.14, ease: EASE }}
                  />
                )}
                {group.drops.map(({ id, d }) => (
                  <motion.path
                    key={id}
                    d={d}
                    {...LINE_PROPS}
                    stroke={
                      hoveredId === id
                        ? "var(--color-fg-muted)"
                        : "var(--color-line-strong)"
                    }
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.14, delay: base + 0.34, ease: EASE }}
                  />
                ))}
              </g>
            );
          })}
        </svg>

        <AnimatePresence mode="wait">
          {/* ---------------------------------------------------- stage 1 --- */}
          {stage.view === "lcp" && (
            <motion.div
              key="lcp"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, transition: { duration: 0.2, ease: EASE } }}
              exit={{ opacity: 0, transition: { duration: 0.1, ease: "linear" } }}
              className="relative flex flex-col items-center py-10"
            >
              {/* The root of the tree, given room to carry the step on its own. */}
              <button
                type="button"
                onClick={() => setOpenId(lcp.id)}
                className="group flex w-96 items-center gap-5 border border-line bg-base px-7 py-6 text-left transition-colors hover:border-fg-muted hover:bg-white/4"
              >
                <Avatar box="size-20" icon={32} />
                <span className="min-w-0">
                  <span className="block text-xl leading-tight font-bold tracking-tight text-fg">
                    {roleTitle(lcp)}
                  </span>
                  <span className="mt-2 block text-sm text-fg-muted">
                    Accountable for the whole LC
                  </span>
                </span>
              </button>

              <span aria-hidden="true" className="h-16 w-px bg-line-strong" />

              <button
                type="button"
                onClick={() => setStage({ view: "eb" })}
                className="group flex w-96 animate-[beckon_2.4s_ease-in-out_infinite] items-center justify-between gap-4 border border-line px-7 py-5 text-left hover:animate-none hover:border-fg-muted hover:bg-white/4"
              >
                <span>
                  <span className="block font-semibold text-fg">
                    Show the Executive Board
                  </span>
                  <span className="mt-1 block text-xs text-fg-dim">
                    {vps.length} vice presidents, one for each department
                  </span>
                </span>
                <ArrowDown
                  size={18}
                  strokeWidth={1.7}
                  className="shrink-0 text-fg-dim transition-all group-hover:translate-y-0.5 group-hover:text-fg"
                />
              </button>
            </motion.div>
          )}

          {/* ---------------------------------------------------- stage 2 --- */}
          {stage.view === "eb" && (
            <motion.div
              key="eb"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, transition: { duration: 0.2, ease: EASE } }}
              exit={{ opacity: 0, transition: { duration: 0.1, ease: "linear" } }}
              className="relative"
            >
              <div className="flex justify-center">
                <div ref={register(lcp.id)}>
                  <HeadCard member={lcp} onOpen={() => setOpenId(lcp.id)} />
                </div>
              </div>

              {/* items-stretch so every card takes the height of the tallest. */}
              <div className="mt-24 flex items-stretch justify-center gap-2">
                {vps.map((vp, i) => (
                  <motion.div
                    key={vp.id}
                    ref={register(vp.id)}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.22, delay: 0.1 + i * 0.025, ease: EASE }}
                  >
                    <BoardCard
                      member={vp}
                      active={hoveredId === vp.id}
                      onHover={(h) => setHoveredId(h ? vp.id : null)}
                      onOpen={() => setStage({ view: "dept", vpId: vp.id })}
                    />
                  </motion.div>
                ))}
              </div>

              <p className="mt-10 text-center text-sm text-fg-dim">
                Pick a department to meet the people in it.
              </p>
            </motion.div>
          )}

          {/* ---------------------------------------------------- stage 3 --- */}
          {stage.view === "dept" && activeVp && (
            <motion.div
              key={`dept-${activeVp.id}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, transition: { duration: 0.2, ease: EASE } }}
              exit={{ opacity: 0, transition: { duration: 0.1, ease: "linear" } }}
              className="relative"
            >
              <div className="flex justify-center">
                <motion.div
                  ref={register(activeVp.id)}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.22, ease: EASE }}
                >
                  <HeadCard
                    member={activeVp}
                    caption={DEPARTMENT_NAME[activeVp.department as Department]}
                    onOpen={() => setOpenId(activeVp.id)}
                  />
                </motion.div>
              </div>

              {/* The department across the full width: leads on one row, each team
                  on a row of its own beneath its lead. */}
              <div
                className={cx(
                  "flex items-start justify-center",
                  roomy ? "mt-24 gap-20" : "mt-20 gap-12",
                )}
              >
                {activeTeam.map((lead, i) => {
                  const team = reportsOf(lead.id);

                  return (
                    <motion.div
                      key={lead.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.22, delay: 0.1 + i * 0.04, ease: EASE }}
                      className="flex flex-col items-center"
                    >
                      <div
                        ref={register(lead.id)}
                        onMouseEnter={() => setHoveredId(lead.id)}
                        onMouseLeave={() => setHoveredId(null)}
                      >
                        <PersonCard
                          member={lead}
                          roomy={roomy}
                          onOpen={() => setOpenId(lead.id)}
                        />
                      </div>

                      {team.length > 0 && (
                        <div className={cx("flex", roomy ? "mt-24 gap-3" : "mt-20 gap-2.5")}>
                          {team.map((person, j) => (
                            <motion.div
                              key={person.id}
                              ref={register(person.id)}
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{
                                duration: 0.22,
                                delay: 0.34 + i * 0.04 + j * 0.03,
                                ease: EASE,
                              }}
                              onMouseEnter={() => setHoveredId(person.id)}
                              onMouseLeave={() => setHoveredId(null)}
                            >
                              <PersonCard
                                member={person}
                                roomy={roomy}
                                onOpen={() => setOpenId(person.id)}
                              />
                            </motion.div>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}
            </AnimatePresence>
          </div>
        </div>

        {/* Edge fades, so content runs off the sides rather than being chopped. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-linear-to-r from-base to-transparent"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-linear-to-l from-base to-transparent"
        />
      </motion.div>

      <Dialog open={open !== null} onClose={() => setOpenId(null)} labelledBy="member-name">
        {open && (
          <>
            <div className="relative border-b border-line bg-[radial-gradient(110%_80%_at_0%_0%,rgba(255,255,255,0.07),transparent_72%)] px-8 pt-7 pb-6">
              <div className="flex items-center gap-4">
                <Avatar box="size-16" icon={28} />
                <div className="min-w-0">
                  <h3 id="member-name" className="text-xl leading-tight font-bold tracking-tight">
                    {open.name}
                  </h3>
                  <p className="mt-1 text-sm text-fg-muted">{open.role}</p>
                  <p className="mt-1.5 text-xs text-fg-dim">
                    {open.department === "EB"
                      ? "Whole LC"
                      : DEPARTMENT_NAME[open.department as Department]}
                  </p>
                </div>
              </div>
            </div>

            <div className="px-8 py-6">
              <p className="text-xs text-fg-dim">Job description</p>
              <p className="mt-2.5 text-sm leading-relaxed text-fg-muted">
                {open.jobDescription.join(" ")}
              </p>
            </div>

            {/* A second wash rising from the foot, so the panel doesn't end flat. */}
            <div className="flex gap-2.5 border-t border-line bg-[radial-gradient(100%_90%_at_100%_100%,rgba(255,255,255,0.05),transparent_70%)] px-8 py-5">
              <a
                href={`mailto:${open.email}`}
                className="flex flex-1 items-center gap-3 border border-line px-4 py-2.5 text-sm text-fg-muted transition-colors hover:border-fg-muted hover:text-fg"
              >
                <Mail size={14} strokeWidth={1.7} className="shrink-0 text-fg-dim" />
                <span className="truncate">{open.email}</span>
              </a>
              <a
                href={`tel:${open.phone.replace(/\s/g, "")}`}
                className="flex items-center gap-3 border border-line px-4 py-2.5 text-sm text-fg-muted transition-colors hover:border-fg-muted hover:text-fg"
              >
                <Phone size={14} strokeWidth={1.7} className="shrink-0 text-fg-dim" />
                {open.phone}
              </a>
            </div>
          </>
        )}
      </Dialog>
    </section>
  );
};

export default StructureSection;
