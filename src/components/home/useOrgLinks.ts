import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";

export type LinkGroup = { parentId: string; childIds: string[] };

export type DrawnGroup = {
  parentId: string;
  /** Parent's bottom edge down to the shared rail. */
  trunk: string;
  /** The horizontal rail, spanning only as far as the outermost children. */
  rail: string | null;
  /** Rail down into each child, keyed so one branch can be highlighted. */
  drops: { id: string; d: string }[];
};

/**
 * Measures where the nodes actually are and returns the lines joining each parent to
 * its children.
 *
 * Two things matter. Connectors drawn in CSS can only guess at node positions — they
 * assume every branch is the same width and that nothing wraps, so they drift the
 * moment the layout changes. And giving each child its own full elbow makes their
 * horizontal segments overlap along the middle, stacking strokes into a smudge. So
 * each parent gets one trunk, its children share one rail, and each child gets one
 * short drop: no line is ever drawn over another.
 */
export const useOrgLinks = (groups: LinkGroup[], deps: unknown[]) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const nodes = useRef<Record<string, HTMLElement | null>>({});
  const [drawn, setDrawn] = useState<DrawnGroup[]>([]);

  const register = useCallback(
    (id: string) => (el: HTMLElement | null) => {
      nodes.current[id] = el;
    },
    [],
  );

  const measure = useCallback(() => {
    const box = containerRef.current?.getBoundingClientRect();
    if (!box) return;

    const next: DrawnGroup[] = [];

    for (const { parentId, childIds } of groups) {
      const parent = nodes.current[parentId]?.getBoundingClientRect();
      if (!parent || childIds.length === 0) continue;

      const centres = childIds
        .map((id) => ({ id, rect: nodes.current[id]?.getBoundingClientRect() }))
        .filter((c): c is { id: string; rect: DOMRect } => Boolean(c.rect))
        .map((c) => ({
          id: c.id,
          x: Math.round(c.rect.left + c.rect.width / 2 - box.left),
          y: Math.round(c.rect.top - box.top),
        }));

      if (centres.length === 0) continue;

      const parentX = Math.round(parent.left + parent.width / 2 - box.left);
      const parentY = Math.round(parent.bottom - box.top);
      const childTop = Math.min(...centres.map((c) => c.y));
      const mid = Math.round(parentY + (childTop - parentY) / 2);

      const left = Math.min(...centres.map((c) => c.x));
      const right = Math.max(...centres.map((c) => c.x));

      next.push({
        parentId,
        trunk: `M ${parentX} ${parentY} V ${mid}`,
        rail: right - left > 1 ? `M ${left} ${mid} H ${right}` : null,
        drops: centres.map((c) => ({ id: c.id, d: `M ${c.x} ${mid} V ${c.y}` })),
      });
    }

    setDrawn(next);
  }, [groups]);

  useLayoutEffect(() => {
    measure();

    // Nodes fade in without moving, so one extra pass after mount is enough to
    // catch fonts and images settling.
    const frame = requestAnimationFrame(measure);
    const settle = setTimeout(measure, 260);

    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(settle);
    };
  }, deps);

  useEffect(() => {
    const observer = new ResizeObserver(measure);
    if (containerRef.current) observer.observe(containerRef.current);
    window.addEventListener("resize", measure);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [measure]);

  // `remeasure` lets the caller re-run this once an entrance animation has finished:
  // a transform moves the nodes without resizing them, so the observer never fires.
  return { containerRef, register, drawn, remeasure: measure };
};
