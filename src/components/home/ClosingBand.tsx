import dreams from "../../assets/hadrumet-dreams-white.png";
import LightRays from "../LightRays";

/*
  Fades the beams out at the top and bottom of the band by masking their own alpha.
  A gradient overlay in the page colour would do the opposite of what's wanted: it
  paints over the rays, and that paint is itself a change of shade, which is exactly
  the seam between sections we're trying to get rid of. Masking removes the light
  instead of covering it, so there is nothing to see a boundary in.
*/
const FADE =
  "linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.25) 14%, rgba(0,0,0,0.7) 26%, black 38%, black 70%, rgba(0,0,0,0.6) 84%, transparent 100%)";
const fadeStyle = { maskImage: FADE, WebkitMaskImage: FADE };

/**
 * Closes the page the way it opened: light falling on the LC's mark. Here it comes
 * from both sides rather than above, so the two beams meet on the logo in the middle.
 *
 * Two canvases, one per side. The shader takes a single origin, so a pair of
 * opposing beams has to be two instances; both stop rendering when the band scrolls
 * out of view.
 */
const ClosingBand = () => (
  // No overflow clipping and no fades at the edges: a mask at the boundary is what
  // makes one section look like a different shade from the next. The beams simply
  // run a little past the band into the padding above and below it.
  <section className="relative mt-10 flex min-h-[78svh] items-center">
    <div
      className="pointer-events-none absolute inset-x-0 -top-24 -bottom-24 opacity-60"
      style={fadeStyle}
      aria-hidden="true"
    >
      <LightRays
        raysOrigin="left"
        raysColor="#b9cfe4"
        raysSpeed={0.4}
        lightSpread={0.7}
        rayLength={1.25}
        fadeDistance={0.85}
        saturation={0.45}
        followMouse={false}
        mouseInfluence={0}
        noiseAmount={0.05}
      />
    </div>

    <div
      className="pointer-events-none absolute inset-x-0 -top-24 -bottom-24 opacity-60"
      style={fadeStyle}
      aria-hidden="true"
    >
      <LightRays
        raysOrigin="right"
        raysColor="#b9cfe4"
        raysSpeed={0.4}
        lightSpread={0.7}
        rayLength={1.25}
        fadeDistance={0.85}
        saturation={0.45}
        followMouse={false}
        mouseInfluence={0}
        noiseAmount={0.05}
      />
    </div>

    <div className="relative z-10 flex w-full flex-col items-center px-12">
      <img src={dreams} alt="Hadrumet Dreams" className="w-[30rem] max-w-full" />
    </div>
  </section>
);

export default ClosingBand;
