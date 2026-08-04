/**
 * Figma's "Scroll Edge Effect" — progressive blur that fades content out at an edge.
 *
 * Figma renders a *radius ramp*: sharp at the open edge, `plateBlur` at the solid edge.
 * CSS has no variable-radius backdrop filter, so it has to be faked, and the two obvious
 * fakes both fail:
 *
 * 1. One masked `backdrop-filter` only ramps the *opacity* of a single radius, so it reads
 *    as a fog bank with a line where the plate ends.
 * 2. N sibling layers each carrying a `backdrop-filter`, all fully opaque, give N discrete
 *    bands, because a backdrop filter samples the page behind the layer rather than the
 *    layer below it. That is the banding this file used to show.
 *
 * What actually works is a crossfade. Each layer gets its own radius and a mask that is
 * opaque from the solid edge out to its own station, then ramps to transparent across the
 * next-weaker layer's station. Layers are painted weakest-first, so at any point down the
 * band exactly two layers are visible: the weaker one fully opaque underneath, the stronger
 * one fading out on top. That is a true alpha crossfade between two radii, and because no
 * partially-transparent mask ever has raw page showing through it, there is no haze.
 *
 * Two more constraints keep it smooth:
 * - Adjacent radii differ by RATIO (1.6, i.e. under 2x). Bigger jumps make the crossfade
 *   itself visible as a soft band.
 * - Each layer's station sits at `1 - radius/peak`, so radius falls *linearly* down the
 *   ramp even though the radii themselves are a geometric series. That is the ramp shape
 *   Figma draws.
 *
 * The second artifact was smearing at the edges: `backdrop-filter` clamps its sample at the
 * element's own box, so the boundary row of pixels gets stretched along the whole ramp. The
 * fix is to grow every layer OVERSIZE x its own radius past the box on all four sides and
 * clip the lot with `overflow-hidden` on the root. The clamped boundary then lands outside
 * the visible area. The masks are built from CSS gradients, not from an asset: the old
 * `scroll-edge-mask.svg` was swept up with the other unreferenced Figma exports.
 *
 * Props (unchanged API):
 * - `tone`  — white for light pages; ink for the "- Soft" variant over dark photography.
 * - `plateBlur` — the radius at the solid edge, i.e. the strength of the whole effect.
 * - `flip`  — solid edge at the bottom instead of the top.
 * - `maskAlpha` — the "- Soft" variant's tint tops out at 0.9 rather than 1.
 * - `tintReach` / `blurReach` — how far down the band each ramp is still doing anything.
 *
 * ---------------------------------------------------------------------------------------
 * THREE SIZES, ALL OF THEM CSS, BECAUSE ALL THREE HAVE TO TRACK THE BAND
 *
 * `plateBlur` and the caller's band height are both numbers read off a 1440 canvas, and used
 * literally they break in three ways that all bite on a phone. All three fixes are written
 * as CSS rather than resolved in JS, off `containerType: 'size'` on the root, so `100cqh` IS
 * the band's own height and nothing has to be measured.
 *
 * - `--r`, the radius, is capped at `MAX_OF_BAND` of the band. A band shorter than a few
 *   radii cannot ramp at all: on a 46px band a 30px Gaussian is still most of what you see
 *   at its own station, and the whole thing paints as one flat slab stopping on a hard line.
 * - `--r` also rides the same 375 → 1440 `--fl` track the type and gutters do, down to
 *   `NARROW` of the Figma figure. 30px is 2% of a 1440 canvas and 8% of a 390 one, so used
 *   literally it swamps the artwork it is only meant to be fading.
 * - `--reach`, the ramp's DEPTH, is capped at `MAX_RADII` x the peak radius. This is the
 *   mirror image of `MAX_OF_BAND` and it is the one that produced the grey slab the review
 *   reported. The stations are fractions of the ramp, so a caller that keeps a 1440 pixel
 *   height on a phone gets the whole ramp stretched over it — and because `NARROW` has
 *   meanwhile shrunk the radius, the band/radius ratio blows out (160-over-16.7 = 9.6 radii
 *   at 390 where Figma drew 160-over-30 = 5.3) and the tail of a ramp that should have
 *   finished lands on the content below the chrome as a flat wash ending on a line.
 *   Capping the depth in radii keeps the ratio Figma drew whatever the caller passes.
 *
 * Because the reach is a length, every mask stop is a length too — `p + f * reach` from the
 * layer's own edge, where `p` is that layer's own oversize pad. The percentage form this
 * used to carry (`f * 100% + (1 - 2f) * p`, f of the unpadded band measured inside a box
 * `2p` taller) was correct but is no longer needed, and it misled two reviews into thinking
 * the padding was the bug.
 *
 * The tint ramp is EASED, not linear. A linear alpha ramp puts half the plate's opacity at
 * the middle of the band, which over a photograph reads as a fog covering the whole thing —
 * the artwork disappears long before the ramp does. Figma's plate is a masked fill whose
 * perceptual falloff is much closer to the solid edge, so the stops below follow
 * `a0 * (1 - t/reach)^2`: at the halfway point that is a tenth of the peak rather than a
 * half, which leaves the picture visible while still backing the copy at the solid edge.
 *
 * ---------------------------------------------------------------------------------------
 * TWO MEASUREMENT TRAPS, both of which have already cost a round of work
 *
 * - **Do not measure this in headless Chromium.** Headless rasterises through SwiftShader
 *   and gets `backdrop-filter` wrong above `deviceScaleFactor: 1`: at DSF 3 a masked stack
 *   reads as a flat ~225px edge spread across the whole top third of the band (a textbook
 *   slab) and a lone unmasked `backdrop-filter` is dropped entirely. Headed Chromium, which
 *   is what the reviewer's DevTools device mode uses, gives an identical ramp at DSF 1, 2,
 *   2.75 and 3. Every conclusion here was taken headed.
 * - **This is not a Safari problem and not a device-pixel problem.** Both were guessed in
 *   earlier rounds and both are wrong. The resolved radii, mask stops and layer boxes are
 *   byte-identical across DSF 1/2/3, `isMobile`, and playwright's iPhone 13 / Pixel 5
 *   descriptors; `container-type: size` resolves under all of them (the 46px band on /guide
 *   measurably takes the `MAX_OF_BAND` cap, which only a working container query can do).
 */
const TINT = {
  light: '255 255 255',
  dark: '40 40 40', // --color-ink
} as const

/** 7 stations is enough that a 1.6x step is invisible; more layers cost another compositor pass. */
const LAYERS = 7

/** Ratio between adjacent radii. Anything above 2 shows the crossfade as a band. */
const RATIO = 1.6

/** Oversize factor: 1.8x the layer's own radius is past where a Gaussian tail still reads. */
const OVERSIZE = 1.8

/** Stops used to draw the eased tint ramp. 6 is smooth; CSS interpolates linearly between. */
const TINT_STOPS = 6

/**
 * Hard ceiling on the peak radius as a fraction of the band's own height. Five radii is the
 * least room the ramp needs before the crossfade stops being a ramp and starts being a slab.
 */
const MAX_OF_BAND = 0.2

/**
 * Ceiling on the ramp's DEPTH, in peak radii — the other end of `MAX_OF_BAND`. 8 radii is
 * about where a linear radius ramp stops reading as a ramp and starts reading as a haze with
 * nothing at the end of it; Figma's own nav and Codern bands are 5.3 (160 over 30).
 */
const MAX_RADII = 8

/**
 * ...and how much the depth cap RELAXES across the `--fl` track, in px per px of `--fl`.
 *
 * The cap exists only to compensate for `NARROW`: at 1440 the caller's band height came off
 * the same canvas as `plateBlur`, so whatever ratio it asks for is by definition the design
 * and nothing here may second-guess it. Figma does go deep — the third hall-of-fame card is
 * a 400 band with a 10 plate, 40 radii — so a flat radii cap would break the design at the
 * one width it must not. Releasing the cap on the same ramp `NARROW` rides ties the two
 * together: the cap is only ever as strong as the shrink it is there to answer for.
 *
 * 400 is the tallest band any call site asks for, so at 1440 (`--fl` = 1px) the cap clears
 * every band by construction. On a 390 phone `--fl` is 0.014px, so the release is 5.6px and
 * the cap is essentially the bare 8 radii. For a 160px band the crossover is around 430px
 * wide, and because both terms of the `min()` are continuous in width there is no step.
 */
const RELAX_PER_FL = 400

/** Peak radius at 375px wide, as a fraction of the 1440 figure. Full strength again at 1440. */
const NARROW = 0.55

export default function ScrollEdgeEffect({
  className = '',
  flip = false,
  tone = 'light',
  plateBlur = 30,
  maskAlpha = 1,
  tintReach = 1,
  blurReach = 1,
}: {
  className?: string
  flip?: boolean
  tone?: keyof typeof TINT
  plateBlur?: number
  maskAlpha?: number
  tintReach?: number
  blurReach?: number
}) {
  // Solid edge: top by default (the nav effect is strongest at the very top of the page);
  // `flip` puts it at the bottom (the effect capping the bottom of an image). Mask fractions
  // below are always measured from the solid edge, so only the gradient direction changes.
  const towardOpenEdge = flip ? 'to top' : 'to bottom'

  const peak = plateBlur
  const bReach = Math.min(Math.max(blurReach, 0.05), 1)
  const tReach = Math.min(Math.max(tintReach, 0.01), 1)

  // `--fl` is a *length*, 0px at 375 and 1px at 1440, so `n * var(--fl)` is how index.css
  // writes every fluid figure. The `1px` fallback is the degraded case: without the sheet the
  // radius comes out at the full Figma number rather than at nothing, which is what an
  // invalid `blur()` would leave behind.
  const fl = `var(--fl, 1px)`
  /** A radius as CSS: the viewport-tracked figure, capped by the band's own height. */
  const radiusOf = (strength: number) => {
    const px = peak * strength
    return (
      `min(calc(${(px * NARROW).toFixed(3)}px + ${(px * (1 - NARROW)).toFixed(3)} * ${fl}), ` +
      `${(MAX_OF_BAND * strength * 100).toFixed(3)}cqh)`
    )
  }

  // How deep the ramp runs, measured from the solid edge: the caller's share of the band, or
  // MAX_RADII peak radii (relaxed toward 1440), whichever is shorter. `100cqh` is the band's
  // own height, so both terms are lengths and the `min()` resolves per band with nothing
  // measured in JS. Every station below is a fraction of THIS, not of the band, so the ramp's
  // shape is untouched — it just stops where it has run out of radii to spend and leaves the
  // rest of the box completely alone, which is what kills the flat wash on an over-tall band.
  const depth = (share: number) =>
    `min(${(share * 100).toFixed(2)}cqh, ` +
    `calc(${MAX_RADII} * ${radiusOf(1)} + ${RELAX_PER_FL} * ${fl}))`

  // Weakest first so the strongest ends up on top, covering the region at the solid edge.
  const layers = Array.from({ length: LAYERS }, (_, n) => {
    const i = LAYERS - 1 - n // 0 = strongest, sits at the solid edge
    const strength = RATIO ** -i // 1, 0.63, 0.39, ... — the geometric radius series

    // Both terms of the radius carry `strength`, so capping the peak — by either cap —
    // rescales the whole geometric series and the crossfade keeps its 1.6 step.
    const radius = radiusOf(strength)

    // Station: the point where this radius is the whole story, at `1 - strength` so the
    // radius ramp comes out linear in space. The layer is opaque from the solid edge up to
    // its own station and then hands over to the next-weaker one across the gap to that
    // one's station. The weakest layer has nothing to hand over to, so it fades to zero
    // exactly at the end of the ramp — otherwise its (small) blur would end on a hard line.
    const from = 1 - strength
    const to = i === LAYERS - 1 ? 1 : 1 - RATIO ** -(i + 1)

    // A stop is a length now: `f` of the ramp, offset by this layer's own oversize pad, since
    // the mask is painted in the grown box and the ramp is measured from the design edge.
    const stop = (f: number) => `calc(var(--p) + ${f.toFixed(4)} * var(--reach))`
    const mask = `linear-gradient(${towardOpenEdge}, #000 ${stop(from)}, transparent ${stop(to)})`

    return { radius, mask }
  })

  const peakAlpha = 0.9 * maskAlpha
  const tintStops = Array.from({ length: TINT_STOPS + 1 }, (_, n) => {
    const f = n / TINT_STOPS // fraction of the tint's own reach, from the solid edge
    const a = peakAlpha * (1 - f) ** 2
    return `rgb(${TINT[tone]} / ${a.toFixed(4)}) calc(${f.toFixed(4)} * var(--treach))`
  })
  // Past the reach the tint is already zero; one more stop pins it transparent for whatever
  // remains of the band, since the reach is now a length that can stop short of 100%.
  tintStops.push(`rgb(${TINT[tone]} / 0) 100%`)
  const tint = `linear-gradient(${towardOpenEdge}, ${tintStops.join(', ')})`

  return (
    // overflow-hidden is load-bearing: it clips the oversized layers back to the design box
    // (and to the caller's rounded corners, which arrive on `className`).
    // `containerType: size` is what makes `cqh` mean "of this band" — it needs the caller to
    // give the band a height, which every call site does. `cqh` is only resolvable *inside*
    // the container, never on it, which is why `--r`, `--reach` and `--treach` are all
    // declared on the children rather than hoisted to the root. Size containment does not
    // create a backdrop root, so the layers below still sample the page.
    <div
      aria-hidden
      data-scroll-edge=""
      className={`pointer-events-none overflow-hidden ${className}`}
      style={{ containerType: 'size' }}
    >
      {layers.map((l, n) => (
        <div
          key={n}
          className="absolute"
          style={
            {
              '--r': l.radius,
              '--p': `calc(var(--r) * ${OVERSIZE})`,
              '--reach': depth(bReach),
              inset: 'calc(var(--p) * -1)',
              backdropFilter: 'blur(var(--r))',
              WebkitBackdropFilter: 'blur(var(--r))',
              maskImage: l.mask,
              WebkitMaskImage: l.mask,
            } as React.CSSProperties
          }
        />
      ))}
      {/* the tint plate rides over the ramp so copy stays legible against it */}
      <div
        className="absolute inset-0"
        style={{ '--treach': depth(tReach), background: tint } as React.CSSProperties}
      />
    </div>
  )
}
