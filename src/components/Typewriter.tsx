import { useEffect, useState } from "react";

const TYPE_MS = 75;
const DELETE_MS = 40;
const HOLD_MS = 1600;

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * Types a word out, holds it, deletes it, moves to the next.
 *
 * The visible text is absolutely positioned over an invisible copy of the longest
 * word. That copy alone sets the element's width and height, so neither the line
 * box nor the words around it move as characters come and go — the cursor can't
 * resize the line, and the sentence can't jump sideways between words.
 *
 * Reduced motion gets the words cycling without the per-character animation.
 */
const Typewriter = ({
  words,
  className = "",
}: {
  words: string[];
  className?: string;
}) => {
  const [index, setIndex] = useState(0);
  const [text, setText] = useState("");
  const [deleting, setDeleting] = useState(false);

  const longest = words.reduce((a, b) => (b.length > a.length ? b : a), "");

  useEffect(() => {
    const word = words[index];

    if (prefersReducedMotion()) {
      setText(word);
      const t = setTimeout(() => setIndex((i) => (i + 1) % words.length), HOLD_MS * 2);
      return () => clearTimeout(t);
    }

    // Finished typing: hold, then start deleting.
    if (!deleting && text === word) {
      const t = setTimeout(() => setDeleting(true), HOLD_MS);
      return () => clearTimeout(t);
    }

    // Finished deleting: advance to the next word.
    if (deleting && text === "") {
      setDeleting(false);
      setIndex((i) => (i + 1) % words.length);
      return;
    }

    const t = setTimeout(
      () =>
        setText((current) =>
          deleting ? word.slice(0, current.length - 1) : word.slice(0, current.length + 1),
        ),
      deleting ? DELETE_MS : TYPE_MS,
    );
    return () => clearTimeout(t);
  }, [text, deleting, index, words]);

  const atRest = !deleting && text === words[index];

  return (
    <span className={`relative inline-block whitespace-nowrap ${className}`}>
      {/* Sizer: never seen, but it is what gives the element its dimensions. */}
      <span className="invisible" aria-hidden="true">
        {longest}
      </span>

      {/* Screen readers get the whole list once, not a stream of partial words. */}
      <span className="sr-only">{words.join(", ")}</span>

      <span className="absolute inset-0" aria-hidden="true">
        {text}
        <span
          className={`ml-[0.08em] inline-block w-[0.055em] translate-y-[0.1em] bg-current ${
            atRest ? "animate-[blink_1s_step-end_infinite]" : ""
          }`}
          style={{ height: "0.88em" }}
        />
      </span>
    </span>
  );
};

export default Typewriter;
