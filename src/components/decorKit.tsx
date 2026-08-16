/*
 * The decoration kit: the art paths, the node table's shape, the one renderer that draws a
 * node, and the two hooks a canvas needs. Extracted from HomeBackground.tsx when the homepage
 * gained a SECOND canvas — Figma's 402-wide mobile frame, in MobileHomeBackground.tsx — and
 * the two had to share this without importing each other. (They would have formed a cycle:
 * HomeBackground renders the phone canvas, the phone canvas needs the renderer. A cycle here
 * is not merely untidy — every table in both files is a module-level `const`, so the half-
 * initialised module wins and the tables read `undefined`.)
 *
 * Nothing here is a decision about the design. The decisions live in the two canvases, next
 * to the Figma numbers they belong to. AboutDecor, HallOfFameDecor and NotFound draw their
 * own frames but share `useSectionAnchor` from here.
 */

import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from 'react'

export const pasta1 = '/assets/figma/9411a40dfd006a723a0a9654923706988c019803.png'
export const pasta24 = '/assets/figma/dc1a2b1e496026d2ffb6efe6645f8155f8dd73f1.png'
export const garlic = '/assets/figma/789932a40b3a11554f67e156b251aa5348ebcef4.png'
export const cheeseChunk = '/assets/figma/1dd3f1f43fd0ed1c5a00ba203e5893bdc7acd558.png'
export const spoon = '/assets/figma/e3f126eae3b64304ddef1da90bc0d5f13f1a4161.png'
export const fork = '/assets/figma/669d80cf5814c6779007ac79ca0395b2134e2acf.png'
export const redBlob = '/assets/figma/698744474ca70b049053608ab4751a69839434a7.svg'
export const yellowWave = '/assets/figma/73268ad299185fd28c6c6d5d19f64f2f35afe370.svg'
export const redWave = '/assets/figma/ea2b8a309e7e0fc3158050a5351b69d87e094972.svg'

/** The canvas Figma authors against. Every fluid percentage below is a ratio to this. */
export const CANVAS = 1440

export type Crop = [w: number, h: number, x: number, y: number]

/** Every tube is one sprite sheet; the crop is the window onto its single piece. */
export const TUBE: Crop = [641.92, 600.87, -143.34, -469.05]
export const RIGATONI: Crop = [1135.56, 683.33, -709.14, -505.81]

export type DecorNode = {
  /** the *bounding* box of the (possibly rotated) shape, in the parent's space */
  x: number
  y: number
  w: number
  h: number
  /** the unrotated art box, centred inside the bounding box; defaults to w/h */
  aw?: number
  ah?: number
  rotate?: number
  flipX?: boolean
  flipY?: boolean
  skewX?: number
  src?: string
  /** sprite-sheet window: width, height, x, y as % of the art box */
  crop?: Crop
  /** px the exported SVG bleeds past the node on all sides — a Figma layer blur */
  spread?: number
  /** a nested Figma frame; children are positioned in this node's space */
  kids?: DecorNode[]
}

/*
 * ---------------------------------------------------------------- the two spaces
 *
 * `null` is the px space: a node's numbers are used as they are, against the centred 1440
 * canvas. A `Space` is a fluid band: numbers become percentages of `box`, which is the
 * band's own canvas-unit size, and `dy` is the top of the band's window so a band can start
 * part-way down (or above) the group it draws.
 *
 * The invariant that makes this safe is that a fluid box's *rendered* aspect ratio always
 * equals `box.w / box.h` — the band sets `aspect-ratio` from its window, and every child box
 * is a percentage of a parent that already holds. So a percentage width and a percentage
 * height are the same scale factor, and no shape is ever stretched.
 */
export type Box = { w: number; h: number }
export type Space = { box: Box; dy: number } | null

/**
 * A length as a percentage of its container.
 *
 * The `of <= 0` guard is not theoretical. Every caller's divisor comes from a MEASUREMENT
 * (`useSectionAnchor` reads `offsetTop` / `offsetHeight`), and a measured element that is
 * detached — or in a subtree being torn down — reports 0 for both. `0 / 0` is `NaN`, and React
 * then writes `top: NaN%` and logs `NaN is an invalid value for the top css style property`.
 * `v / 0` where `v` is non-zero is `Infinity`, which serialises just as badly.
 *
 * Observed exactly once, in a harness that removed an iframe mid-measure; 27 route x width
 * loads with `console.error` intercepted before app startup produce none. So this guards a
 * teardown race rather than a layout the user can reach — but a decoration is never worth a
 * console error, and `0%` is the correct answer for "a fraction of nothing".
 */
export const pc = (v: number, of: number) => (of > 0 ? `${((v / of) * 100).toFixed(4)}%` : '0%')

function nodeStyle(n: DecorNode, space: Space): CSSProperties {
  if (!space) return { left: n.x, top: n.y, width: n.w, height: n.h }
  return {
    left: pc(n.x, space.box.w),
    top: pc(n.y - space.dy, space.box.h),
    width: pc(n.w, space.box.w),
    height: pc(n.h, space.box.h),
  }
}

export function Node({ n, space = null, flow }: { n: DecorNode; space?: Space; flow?: FlowProps }) {
  const frame = nodeStyle(n, space)

  if (n.kids) {
    /* the children's space is this node's own box, with no window offset */
    const kidSpace: Space = space ? { box: { w: n.w, h: n.h }, dy: 0 } : null
    return (
      <div className="absolute" style={frame}>
        {n.kids.map((kid, i) => (
          <Node key={i} n={kid} space={kidSpace} />
        ))}
      </div>
    )
  }

  const aw = n.aw ?? n.w
  const ah = n.ah ?? n.h
  // Figma's own order: rotate, then skew, then the mirror flips
  const transform =
    [
      n.rotate ? `rotate(${n.rotate}deg)` : '',
      n.skewX ? `skewX(${n.skewX}deg)` : '',
      n.flipX ? 'scaleX(-1)' : '',
      n.flipY ? 'scaleY(-1)' : '',
    ]
      .filter(Boolean)
      .join(' ') || undefined

  const art: CSSProperties = space
    ? { width: pc(aw, n.w), height: pc(ah, n.h), transform }
    : { width: aw, height: ah, transform }

  const bleed: CSSProperties | undefined = n.spread
    ? space
      ? {
          left: pc(-n.spread, aw),
          top: pc(-n.spread, ah),
          width: pc(aw + n.spread * 2, aw),
          height: pc(ah + n.spread * 2, ah),
        }
      : {
          left: -n.spread,
          top: -n.spread,
          width: aw + n.spread * 2,
          height: ah + n.spread * 2,
        }
    : undefined

  return (
    <div
      className={`absolute flex items-center justify-center ${flow?.className ?? ''}`}
      style={flow ? { ...frame, ...flow.vars } : frame}
    >
      {/* `relative` so a blurred export's bleed is measured from the art box, not the bbox */}
      <div className="relative shrink-0" style={art}>
        {/* The crop box is `overflow-clip`, not `hidden`: the sprite window is 641-1136% of it,
            so under `hidden` every single tube is its own touch-pannable scrollport. Legacy
            engines fall back to `hidden` through index.css's `@supports not (overflow: clip)`
            block, so nothing is left uncropped anywhere. */}
        {n.crop ? (
          <div className="relative size-full overflow-clip">
            <img
              src={n.src}
              alt=""
              className="absolute max-w-none"
              style={{
                width: `${n.crop[0]}%`,
                height: `${n.crop[1]}%`,
                left: `${n.crop[2]}%`,
                top: `${n.crop[3]}%`,
              }}
            />
          </div>
        ) : bleed ? (
          <img src={n.src} alt="" className="absolute max-w-none" style={bleed} />
        ) : (
          <img src={n.src} alt="" className="size-full object-cover" />
        )}
      </div>
    </div>
  )
}

export type FlowProps = { className: string; vars: CSSProperties }

/** The one thing not derived from the index: which way a piece is pushed as the pile packs. */
export const PILE_X = 1150

/**
 * `scale` and `pileX` exist for the 402 phone frame, which draws the same twenty tubes at
 * 0.48 of their desktop size in their own arrangement (see MobileHomeBackground.tsx). The
 * flight is a journey proportional to the tube's own artwork, so its distances scale with the
 * art; `pileX` is the same threshold restated in the phone canvas's units. Neither changes
 * anything for the two desktop readings, which leave both at their defaults.
 */
export function flowVars(
  i: number,
  x: number,
  {
    fluid = false,
    scale = 1,
    pileX = PILE_X,
  }: { fluid?: boolean; scale?: number; pileX?: number } = {},
): CSSProperties {
  const out = x >= pileX ? 1 : -1
  // neighbours orbit opposite ways, so the band breathes rather than drifting as one body
  const spin = i % 2 ? 1 : -1
  /*
   * 48ms, not 95. The band sits above the fold on `/`, so it starts at load alongside the
   * hero's own cascade — and the hero is settled by ~740ms. At 95ms the twentieth tube had
   * not even started travelling until 1805ms and the band kept arriving until 4145ms, so
   * the copy finished, waited, and the wallpaper carried on assembling behind it. Halving
   * the step puts the last start at 912ms and the last landing at ~3.25s, which lands the
   * band's centre of mass in the same second as the hero. Every other ladder in this
   * codebase is 20-70ms; 95 was the outlier.
   *
   * `duration` is untouched on purpose: that is the per-tube travel time, and it is what
   * reads as weight — a tube crossing 500px in less than 1.8s is thrown, not drifting.
   * Only the gap between neighbours got tighter.
   */
  const delay = i * 48
  const duration = 1800 + ((i * 137) % 5) * 180
  /** canvas units → the band's own unit, at the size the art is actually drawn */
  const u = (v: number) =>
    fluid ? `${(((v * scale) / CANVAS) * 100).toFixed(4)}vw` : `${+(v * scale).toFixed(2)}px`

  /*
   * The idle amplitudes are the one thing here that does NOT go through `u`, and the reason
   * is that the two motions are different kinds of quantity.
   *
   * The arrival is a journey: a tube crosses a distance proportional to its own artwork, so
   * a phone tube — a quarter the size — should fly a quarter as far, and `u` emitting `vw`
   * inside the fluid band is exactly right.
   *
   * The idle is not a journey, it is a perceptual nudge: the smallest movement that reads as
   * "alive" is a property of the eye, not of the artwork, and it does not shrink with the
   * viewport. Sent through `u` these figures became 0.347vw..0.847vw, which at 390 is a
   * 1.4-3.3px peak spread over 17-32 seconds — at or under the threshold of noticing. The
   * phone was paying for twenty permanent composited animations and getting nothing visible
   * back, which is the precise complaint this round exists to answer. In px they read on a
   * phone the way they read on a desktop.
   *
   * Rotation needs no equivalent: an angle is already scale-free.
   */
  const nudge = (v: number) => `${+v.toFixed(2)}px`

  return {
    '--pasta-dx': u(-(440 + ((i * 89) % 7) * 55)),
    '--pasta-dy': u((((i * 53) % 9) - 4) * 16),
    '--pasta-spin': `${(((i * 71) % 11) - 5) * 4}deg`,
    '--pasta-scale': `${(0.86 + ((i * 31) % 6) * 0.03).toFixed(3)}`,
    '--pasta-px': u(out * (7 + ((i * 17) % 3) * 6)),
    '--pasta-py': u((((i * 41) % 5) - 2) * 6),
    '--pasta-delay': `${delay}ms`,
    '--pasta-duration': `${duration}ms`,
    '--pasta-idle-delay': `${delay + duration}ms`,
    '--pasta-idle-duration': `${17000 + ((i * 61) % 9) * 1900}ms`,
    /*
     * The round trip's period. 16s, of which the first 30% is a dead-still hold — about the
     * five seconds asked for — and the rest is the two travels. Per-piece variation is kept for
     * the same reason it always was: twenty tubes on one clock read as a slab rather than as a
     * drift. `linear` on the animation itself, because every segment names its own easing.
     */
    '--pasta-cycle-duration': `${16000 + ((i * 61) % 9) * 900}ms`,
    '--pasta-idle-x': nudge(spin * (5 + ((i * 43) % 5) * 1.8)),
    '--pasta-idle-y': nudge(3 + ((i * 29) % 4) * 1.6),
    '--pasta-idle-r': `${spin * (1.1 + ((i * 23) % 4) * 0.5)}deg`,
  } as CSSProperties
}

export function useFlowPhase() {
  const [phase, setPhase] = useState<'rest' | 'armed' | 'run'>('rest')
  const band = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const el = band.current
    if (!el || !('IntersectionObserver' in window)) return
    setPhase('armed')
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return
        setPhase('run')
        io.disconnect()
      },
      // the band should be properly on screen, not one pixel of it
      { rootMargin: '0px 0px -12% 0px' },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  const flowClass = phase === 'run' ? 'pasta-flow' : phase === 'armed' ? 'pasta-flow-armed' : ''
  return { band, flowClass }
}

export function useSectionAnchor(id: string) {
  const [box, setBox] = useState<{ top: number; height: number } | null>(null)

  useEffect(() => {
    const el = document.getElementById(id)
    if (!el) return
    const read = () => {
      const parent = el.offsetParent as HTMLElement | null
      setBox((prev) =>
        prev?.top === el.offsetTop && prev?.height === el.offsetHeight
          ? prev
          : { top: el.offsetTop, height: el.offsetHeight },
      )
      return parent
    }
    const parent = read()
    const ro = new ResizeObserver(read)
    ro.observe(el)
    if (parent) ro.observe(parent)
    return () => ro.disconnect()
  }, [id])

  return box
}
