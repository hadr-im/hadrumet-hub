import { useEffect, useId, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import { cx } from "../lib/format";

export type Option<T extends string> = { value: T; label: string };

/**
 * A dropdown built from the project's own parts, because a native <select> renders
 * its list with the operating system's styling and can't be made to match the rest
 * of the page.
 *
 * Closes on outside click and on Escape, and returns focus to the trigger so the
 * keyboard path isn't lost.
 */
const Select = <T extends string>({
  label,
  value,
  onChange,
  options,
  width = "9rem",
}: {
  label: string;
  value: T;
  onChange: (v: T) => void;
  options: Option<T>[];
  width?: string;
}) => {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listId = useId();

  const current = options.find((o) => o.value === value);

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative flex items-center gap-2.5 text-sm">
      <span className="font-light text-fg-dim">{label}</span>

      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        style={{ width }}
        className={cx(
          "flex items-center justify-between gap-2 border px-3 py-2 text-left transition-colors",
          open
            ? "border-fg-muted bg-white/5 text-fg"
            : "border-line text-fg hover:border-line-strong",
        )}
      >
        <span className="truncate">{current?.label ?? "—"}</span>
        <ChevronDown
          size={14}
          strokeWidth={1.8}
          className={cx(
            "shrink-0 text-fg-dim transition-transform",
            open && "rotate-180",
          )}
        />
      </button>

      {open && (
        <ul
          id={listId}
          role="listbox"
          aria-label={label}
          style={{ width }}
          className="no-scrollbar absolute top-full right-0 z-40 mt-1 max-h-72 divide-y divide-line overflow-y-auto border border-line-strong bg-surface shadow-[0_18px_50px_-12px_rgba(0,0,0,0.9)]"
        >
          {options.map((option) => {
            const isSelected = option.value === value;

            return (
              <li key={option.value} role="none">
                <button
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => {
                    onChange(option.value);
                    setOpen(false);
                    triggerRef.current?.focus();
                  }}
                  className={cx(
                    "flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-sm transition-colors",
                    isSelected ? "bg-white/6 text-fg" : "text-fg-muted hover:bg-white/4 hover:text-fg",
                  )}
                >
                  <span className="truncate">{option.label}</span>
                  {isSelected && <Check size={13} strokeWidth={2.2} className="shrink-0" />}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default Select;
