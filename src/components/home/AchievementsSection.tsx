import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { achievements } from "../../data/mock";
import { cx } from "../../lib/format";
import { SectionHeading } from "../ui";

/**
 * What the LC has already won. A chronology genuinely is a sequence, so the years
 * earn their place as markers down the left.
 *
 * Hovering a line brings up its photograph in a single fixed frame rather than one
 * beside each row: a frame that followed the cursor would jump up and down the list
 * as you read it.
 */
const AchievementsSection = () => {
  const [shown, setShown] = useState<number | null>(null);

  return (
    <section id="achievements" className="shell py-28">
      <SectionHeading
        title="What Hadrumet has won"
        subtitle="The results the LC has already put its name to."
      />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        // Two columns rather than an overlay: the frame is taller than the list, so
        // centring it on the list alone would push it past the block at both ends.
        className="grid grid-cols-[1fr_24rem] items-center gap-16 border-t border-line pt-12"
      >
        {/* No rules between these. The list is short, and the hovered line is picked
            out by its colour and its photograph, so dividers would only add noise. */}
        <ul onMouseLeave={() => setShown(null)}>
          {achievements.map((item, i) => {
            const isShown = shown === i;

            return (
              <li
                key={`${item.year}-${item.title}`}
                onMouseEnter={() => setShown(i)}
                className="relative"
              >
                {/* Grows very slightly under the cursor, from its left edge so the
                    line stays anchored where the eye already is. */}
                <div
                  className={cx(
                    "flex origin-left items-baseline gap-8 py-4 transition-transform duration-300 ease-out",
                    isShown && "scale-[1.04]",
                  )}
                >
                  {/* No `text-base` here: the colour token named `base` claims that
                      utility, so it would paint the year in the page colour. */}
                  <span
                    className={cx(
                      "w-14 shrink-0 tabular-nums transition-colors duration-300",
                      isShown ? "text-fg" : "text-fg-dim",
                    )}
                  >
                    {item.year}
                  </span>
                  <span
                    className={cx(
                      "text-xl font-medium transition-colors duration-300",
                      isShown ? "text-fg" : "text-fg-dim",
                    )}
                  >
                    {item.title}
                  </span>
                </div>
              </li>
            );
          })}
        </ul>

        <div className="relative aspect-square">
          <AnimatePresence>
            {shown !== null && (
              <motion.div
                key={shown}
                initial={{ opacity: 0, x: -14 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.3, ease: [0.33, 1, 0.68, 1] }}
                className="pointer-events-none absolute inset-0 border border-line-strong"
              >
                <img
                  src={achievements[shown].image}
                  alt=""
                  className="h-full w-full object-cover"
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </section>
  );
};

export default AchievementsSection;
