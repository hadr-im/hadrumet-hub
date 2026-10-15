import { Link } from "react-router-dom";
import logo from "../../assets/hadrumet-logo.png";
import LightRays from "../LightRays";
import Typewriter from "../Typewriter";

/**
 * The hero. Light rays fall from above onto the LC's mark, which is square Kufic
 * calligraphy — monolinear white strokes on an orthogonal grid. Everything else on
 * the page borrows that construction: hairlines, right angles, wide negative space.
 */
const Hero = () => (
  <section className="relative flex min-h-svh flex-col overflow-hidden">
    {/* Rays sit behind everything and ignore pointer events. They fade out by masking
        their own alpha, so nothing is ever painted over the page colour. */}
    <div
      className="pointer-events-none absolute inset-0 -top-24"
      style={{
        maskImage: "linear-gradient(to bottom, black 45%, transparent 100%)",
        WebkitMaskImage: "linear-gradient(to bottom, black 45%, transparent 100%)",
      }}
      aria-hidden="true"
    >
      <LightRays
        raysOrigin="top-center"
        raysColor="#cfe4f7"
        raysSpeed={0.5}
        lightSpread={1.1}
        rayLength={2.4}
        fadeDistance={1.3}
        saturation={0.6}
        followMouse
        mouseInfluence={0.06}
        noiseAmount={0.06}
        distortion={0.02}
      />
    </div>


    <div className="shell relative z-10 flex flex-1 items-center">
      <div className="grid w-full grid-cols-[1.55fr_1fr] items-center gap-20 py-28">
        <div>
          <h1 className="text-[clamp(3rem,4.4vw,4.75rem)] leading-[1] font-extrabold tracking-[-0.025em] text-fg">
            Welcome to the Hadrumet Hub
          </h1>

          <p className="headline mt-8 text-[clamp(1.5rem,2.1vw,2.25rem)] leading-tight font-medium text-fg-muted">
            One central place for{" "}
            <Typewriter
              words={[
                "knowledge",
                "templates",
                "opportunities",
                "announcements",
                "results",
              ]}
              className="font-semibold text-fg"
            />
          </p>

          <p className="mt-8 max-w-[62ch] text-[18px] leading-relaxed text-fg-muted">
            Find what you need without asking around. The calendar, the people, the
            documents and the openings all live here, and they stay here when the term
            changes.
          </p>

          <div className="mt-11 flex items-center gap-6">
            <a
              href="#next-up"
              className="border border-line-strong px-6 py-3 text-sm font-medium text-fg transition-colors hover:border-fg-muted hover:bg-fg-muted hover:text-base"
            >
              See what's next
            </a>
            <Link
              to="/knowledge"
              className="border border-transparent px-6 py-3 text-sm font-medium text-fg-muted transition-colors hover:border-fg-muted/40 hover:text-fg"
            >
              Browse the knowledge center
            </Link>
          </div>
        </div>

        {/* The mark, lit from above by the rays themselves. */}
        <div className="grid place-items-center">
          <img src={logo} alt="AIESEC in Hadrumet" className="w-[28rem] max-w-full" />
        </div>
      </div>
    </div>

    {/* Scroll cue: a hairline that drains downward, drawing the eye past the fold.
        Centred, and raised clear of the dock below it. */}
    <div className="relative z-10 mx-auto mb-28 flex w-fit flex-col items-center gap-3">
      <span className="text-xs tracking-[0.18em] text-fg-dim">Scroll</span>
      <span className="relative h-12 w-px overflow-hidden bg-line-strong">
        <span className="absolute inset-x-0 top-0 h-4 animate-[drain_2.4s_ease-in-out_infinite] bg-fg-muted" />
      </span>
    </div>
  </section>
);

export default Hero;
