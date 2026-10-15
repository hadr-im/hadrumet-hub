import { CalendarDays, ChevronLeft, ChevronRight, Clock, MapPin } from "lucide-react";
import type { Activity } from "../../data/types";
import {
  cx,
  formatDate,
  formatDayName,
  formatSpan,
  relativeDay,
  styleFor,
} from "../../lib/format";

const Row = ({
  icon: Icon,
  children,
}: {
  icon: typeof MapPin;
  children: React.ReactNode;
}) => (
  <div className="flex items-start gap-3 text-sm">
    <Icon size={15} strokeWidth={1.7} className="mt-0.5 shrink-0 text-fg-dim" />
    <span className="text-fg">{children}</span>
  </div>
);

/**
 * One activity in full. Used for both the "next up" panel and the panel that
 * replaces it when a day is selected, so the two are the same object in two states.
 * The wash behind it is tinted by the department's corner, matching the treatment
 * the announcements panel uses.
 */
const ActivityDetail = ({
  activity,
  label,
  nav,
}: {
  activity: Activity;
  label: string;
  /** Shown only when the chosen day holds more than one activity. */
  nav?: { index: number; total: number; onPrev: () => void; onNext: () => void };
}) => (
  <div className="relative">
    <div
      aria-hidden="true"
      className={cx("pointer-events-none absolute inset-0", styleFor(activity.department).wash)}
    />

    <div className="relative">
      <div className="relative h-72 overflow-hidden border-b border-line">
        {/* contain, not cover: the mark is a square logo and cropping it to fill a
            wide frame would cut the calligraphy in half. */}
        <img src={activity.image} alt="" className="h-full w-full object-contain p-10" />
        <div className="absolute inset-0 bg-linear-to-t from-base via-base/35 to-transparent" />

        <span className="absolute bottom-4 left-8 text-sm font-semibold tracking-[0.08em] text-fg">
          {label}
        </span>

        {nav && (
          <div className="absolute top-4 right-4 flex items-center gap-1.5">
            <span className="mr-1 text-xs text-fg-muted tabular-nums">
              {nav.index + 1} / {nav.total}
            </span>
            <button
              type="button"
              onClick={nav.onPrev}
              aria-label="Previous activity on this day"
              className="grid size-7 place-items-center border border-line-strong bg-base/70 text-fg-muted backdrop-blur-sm transition-colors hover:border-fg-muted hover:text-fg"
            >
              <ChevronLeft size={14} strokeWidth={1.8} />
            </button>
            <button
              type="button"
              onClick={nav.onNext}
              aria-label="Next activity on this day"
              className="grid size-7 place-items-center border border-line-strong bg-base/70 text-fg-muted backdrop-blur-sm transition-colors hover:border-fg-muted hover:text-fg"
            >
              <ChevronRight size={14} strokeWidth={1.8} />
            </button>
          </div>
        )}
      </div>

      <div className="px-8 py-7">
        <h3 className="max-w-[22ch] text-[clamp(1.25rem,1.7vw,1.6rem)] leading-tight font-bold tracking-tight">
          {activity.name}
        </h3>

        <p className="mt-4 text-[15px] leading-relaxed text-fg-muted">
          {activity.description}
        </p>

        <div className="mt-7 space-y-3 border-t border-line pt-6">
          <Row icon={CalendarDays}>
            {activity.endDate ? (
              formatSpan(activity.date, activity.endDate)
            ) : (
              <>
                {formatDayName(activity.date)}, {formatDate(activity.date)}
              </>
            )}
            <span className="ml-2 text-fg-dim">{relativeDay(activity.date)}</span>
          </Row>
          <Row icon={Clock}>
            {activity.type === "deadline"
              ? `Due ${activity.endTime}`
              : `${activity.startTime} – ${activity.endTime}`}
          </Row>
          <Row icon={MapPin}>{activity.venue}</Row>
        </div>
      </div>
    </div>
  </div>
);

export default ActivityDetail;
