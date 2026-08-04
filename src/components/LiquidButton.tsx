import { useEffect, useRef } from 'react'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

/**
 * LiquidButton — a pressable that deforms like a body of liquid in a container.
 *
 * Figma specifies no motion for this control; everything below is invented, and every
 * number is stated in terms of what it is meant to make the shape do. The design brief
 * was "Apple liquid glass, without the glass": the *material* is unchanged (flat brand
 * red, per Figma), only the *behaviour* is liquid.
 *
 * The model is three bodies, not one:
 *
 *   shell  the container/outline: the <a>/<button> itself. Static — it owns the layout
 *          box, the hit area, the focus ring and the accessible name, and it is the
 *          reference the other two are read against. Nothing is ever written to its
 *          transform, which also keeps it clear of the reveal group's 600ms transform
 *          transition in index.css (writing a transform there would be interpolated over
 *          600ms and the drag would never appear).
 *   shift  the pointer-tracked position and the press scale, on a layer of its own.
 *   fill   the liquid. Chases `shift` with a slower spring, so it arrives late — that lag
 *          is the whole illusion. Also carries the shape change (per-corner radii,
 *          stretch, skew, squash). Decorative, aria-hidden.
 *   label  carried on the liquid, so it lags the fill in turn. Translation and the press
 *          scale only: skewing or stretching text reads as a rendering bug, not motion.
 *
 * Six independent springs (x and y kept separate — a single spring on a 2D distance
 * desyncs when the axes have different velocities) plus two scalars for the press.
 * Everything is transform / border-radius / opacity; the only layout reads happen on
 * pointerdown and on resize, never on pointermove.
 */

/** px the shape may travel. Also the rubber band's asymptote: it can never exceed this. */
const MAX_PULL = 28

/**
 * Spring responses, in seconds, in Apple's sense (time to reach the target, not a
 * duration — a spring has no duration). The chain has to be strictly increasing or
 * there is no lag to see; 0.18 / 0.30 / 0.34 is the smallest spread that still reads as
 * three separate bodies at 1440 without the label looking detached.
 */
const RESPONSE_ROOT = 0.18
const RESPONSE_FILL = 0.3
const RESPONSE_LABEL = 0.34
const RESPONSE_PRESS = 0.16
const RESPONSE_SQUASH = 0.32

/** How far a full-strength pull flattens the corners it is pulling *away* from. */
const CORNER_FLATTEN = 0.55

type Spring = {
  /** current on-screen value — animations always start from this, never from a target */
  p: number
  v: number
  to: number
  /** angular frequency; Apple's `response` is 2π/ω */
  w: number
  /** damping ratio. 1 = critically damped, no overshoot. */
  z: number
}

function spring(response: number, z = 1): Spring {
  return { p: 0, v: 0, to: 0, w: (2 * Math.PI) / response, z }
}

/** Semi-implicit Euler. Sub-stepped at 120Hz so a dropped frame cannot destabilise it. */
function advance(s: Spring, dt: number) {
  let left = dt
  while (left > 0) {
    const h = Math.min(left, 1 / 120)
    s.v += (-s.w * s.w * (s.p - s.to) - 2 * s.z * s.w * s.v) * h
    s.p += s.v * h
    left -= h
  }
}

function settled(s: Spring) {
  return Math.abs(s.p - s.to) < 0.01 && Math.abs(s.v) < 0.05
}

/**
 * Progressive resistance instead of a hard stop, with the asymptote at MAX_PULL. The
 * constant is 1 rather than iOS's 0.55 so that small movements stay close to 1:1 (a 6px
 * drag yields 4.9px) — under 0.55 the first few pixels feel dead.
 */
function rubberband(raw: number) {
  const o = Math.abs(raw)
  return (Math.sign(raw) * (o * MAX_PULL)) / (MAX_PULL + o)
}

function clamp(n: number, lo: number, hi: number) {
  return n < lo ? lo : n > hi ? hi : n
}

type LiquidButtonProps = {
  children: ReactNode
  /** router target. Omit to get a real <button> instead of a <Link>. */
  to?: string
  type?: 'button' | 'submit'
  onClick?: (event: React.MouseEvent) => void
  /** goes on the root: padding, type, text colour — i.e. the Figma spec for the control */
  className?: string
  /**
   * Also the root, for the same job as `className` — a caller whose Figma numbers collide
   * with a stylesheet it does not own (the hero's `.hero-cta` lives in styles/liquid.css)
   * can state them here instead of reaching for `!important`. Layout only: the component
   * writes `transform` and `border-radius` on its own layers every frame and reads the
   * resting radius off the rendered box, so sizing through this is safe and motion is not
   * expressible here at all.
   */
  style?: React.CSSProperties
  /** goes on the decorative fill: the background paint */
  fillClassName?: string
  /**
   * Wrap the navigation in a view transition. `<Link>`'s own option, passed straight
   * through — only meaningful alongside `to`, and off by default so a caller has to say
   * that the screen it leads to is worth animating between.
   */
  viewTransition?: boolean
}

export default function LiquidButton({
  children,
  to,
  type = 'button',
  onClick,
  className = '',
  style,
  fillClassName = '',
  viewTransition = false,
}: LiquidButtonProps) {
  const rootRef = useRef<HTMLElement | null>(null)
  const shiftRef = useRef<HTMLSpanElement | null>(null)
  const fillRef = useRef<HTMLSpanElement | null>(null)
  const labelRef = useRef<HTMLSpanElement | null>(null)

  const m = useRef({
    raf: 0,
    last: 0,
    reduce: false,
    dragging: false,
    pointerId: -1,
    fromX: 0,
    fromY: 0,
    /** the resting pill radius, measured once per press — never during a move */
    baseR: 0,
    /** true when the pointer was released off the control: the click must not navigate */
    voidClick: false,
    rootX: spring(RESPONSE_ROOT),
    rootY: spring(RESPONSE_ROOT),
    fillX: spring(RESPONSE_FILL),
    fillY: spring(RESPONSE_FILL),
    labelX: spring(RESPONSE_LABEL),
    labelY: spring(RESPONSE_LABEL),
    press: spring(RESPONSE_PRESS),
    /**
     * The release squash. Target is always 0; it is driven purely by a velocity impulse
     * at release, so the shape flattens once and recovers instead of oscillating. z just
     * under 1 leaves a single ~1% counter-overshoot — a recover, not a bounce.
     */
    squash: spring(RESPONSE_SQUASH, 0.85),
  })

  /* One media-query subscription for the whole component: with reduced motion asked for,
     no pointer handler does anything and no inline transform is ever written, so the
     control degrades to a plain, instant button rather than to a frozen mid-state. */
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const sync = () => {
      m.current.reduce = mq.matches
      if (mq.matches) rest()
    }
    sync()
    mq.addEventListener('change', sync)
    return () => {
      mq.removeEventListener('change', sync)
      cancelAnimationFrame(m.current.raf)
      m.current.raf = 0
    }
    // Runs once: `rest` only ever reads refs, so the closure captured here stays correct.
  }, [])

  /** Clear every inline style so CSS owns the resting appearance again. */
  function rest() {
    for (const el of [shiftRef.current, fillRef.current, labelRef.current]) {
      if (!el) continue
      el.style.transform = ''
      el.style.willChange = ''
    }
    if (fillRef.current) fillRef.current.style.borderRadius = ''
  }

  function paint() {
    const s = m.current
    const shift = shiftRef.current
    const fill = fillRef.current
    const label = labelRef.current
    if (!shift || !fill || !label) return

    const px = s.rootX.p
    const py = s.rootY.p
    const press = s.press.p
    const sq = s.squash.p
    const pressScale = (1 - 0.022 * press).toFixed(4)

    // The container: position plus the press scale. Nothing else — its offset from the
    // static shell is the pull, and it is what the two lagging bodies are measured from.
    shift.style.transform = `translate3d(${px.toFixed(2)}px, ${py.toFixed(2)}px, 0) scale(${pressScale})`

    // The liquid, expressed relative to its parent: how far behind the container it is.
    const lagX = s.fillX.p - px
    const lagY = s.fillY.p - py

    // Stretch along the pull with a cross-axis pinch, the way a pulled drop narrows.
    const ax = Math.min(Math.abs(px) / MAX_PULL, 1)
    const ay = Math.min(Math.abs(py) / MAX_PULL, 1)
    const sx = 1 + 0.05 * ax - 0.026 * ay + 0.035 * sq
    const sy = 1 + 0.05 * ay - 0.026 * ax - 0.05 * sq

    // Lean: the surface tips in the direction of travel, driven by the lag itself, so it
    // only appears while the liquid is actually behind the container. Capped at 3deg —
    // past that the pill stops looking like the same object.
    const skew = clamp(-lagX * 0.28, -3, 3)

    fill.style.transform =
      `translate3d(${lagX.toFixed(2)}px, ${lagY.toFixed(2)}px, 0) ` +
      `scaleX(${sx.toFixed(4)}) scaleY(${sy.toFixed(4)}) skewX(${skew.toFixed(2)}deg)`

    // Per-corner radii are the shape-shifting channel: a corner flattens in proportion to
    // how much the liquid is being dragged *away* from it, so a pull to the right squares
    // off the left end and leaves the right end a full pill. A uniform radius reads as a
    // resize; corner-by-corner reads as a surface under tension.
    const corner = (cx: number, cy: number) => {
      const away = clamp(-(cx * px + cy * py) / MAX_PULL, 0, 1)
      return `${(s.baseR * (1 - CORNER_FLATTEN * away)).toFixed(2)}px`
    }
    fill.style.borderRadius = `${corner(-1, -1)} ${corner(1, -1)} ${corner(1, 1)} ${corner(-1, 1)}`

    // The label rides the liquid but is a sibling of the shift layer, so it carries the
    // absolute spring value plus the press scale itself.
    label.style.transform = `translate3d(${s.labelX.p.toFixed(2)}px, ${s.labelY.p.toFixed(2)}px, 0) scale(${pressScale})`
  }

  function frame(now: number) {
    const s = m.current
    const dt = s.last ? Math.min((now - s.last) / 1000, 1 / 30) : 1 / 60
    s.last = now

    // Follower chain: the fill chases where the container actually is, the label chases
    // the fill. Re-targeting every frame is what makes the lag compound instead of the
    // three bodies all racing the same fixed point.
    s.fillX.to = s.rootX.p
    s.fillY.to = s.rootY.p
    s.labelX.to = s.fillX.p
    s.labelY.to = s.fillY.p

    const all = [s.rootX, s.rootY, s.fillX, s.fillY, s.labelX, s.labelY, s.press, s.squash]
    for (const sp of all) advance(sp, dt)

    paint()

    if (s.dragging || !all.every(settled)) {
      s.raf = requestAnimationFrame(frame)
      return
    }
    // Fully at rest: snap the residue away, hand the appearance back to CSS, stop the loop.
    for (const sp of all) {
      sp.p = sp.to
      sp.v = 0
    }
    s.raf = 0
    s.last = 0
    rest()
  }

  /** Idempotent: a second press mid-return must not restart the clock or the springs. */
  function run() {
    const s = m.current
    if (s.raf) return
    s.last = 0
    s.raf = requestAnimationFrame(frame)
  }

  function onPointerDown(event: React.PointerEvent) {
    const s = m.current
    // Primary button / first contact only. Ignoring later contacts stops the shape
    // jumping when a second finger lands mid-drag.
    if (s.reduce || s.dragging || event.button !== 0) return

    const el = rootRef.current
    const fill = fillRef.current
    if (!el || !fill) return

    // The resting pill radius: the caller's specified radius, clamped the way the browser
    // clamps it, so a 100px radius on a 66px-high control resolves to the 33px the user
    // actually sees and the first animated frame does not jump. Measured here, before
    // anything has moved, and never again during the drag.
    const rect = el.getBoundingClientRect()
    const specified = parseFloat(getComputedStyle(fill).borderTopLeftRadius) || 0
    s.baseR = Math.min(specified, rect.height / 2, rect.width / 2)

    s.dragging = true
    s.pointerId = event.pointerId
    s.fromX = event.clientX
    s.fromY = event.clientY
    s.voidClick = false
    s.press.to = 1
    // Feedback lands on pointer-down, not on the click.
    el.setPointerCapture(event.pointerId)
    for (const layer of [shiftRef.current, fill, labelRef.current]) {
      if (layer) layer.style.willChange = 'transform'
    }
    run()
  }

  function onPointerMove(event: React.PointerEvent) {
    const s = m.current
    if (!s.dragging || event.pointerId !== s.pointerId) return
    // Only the spring targets change here — no measuring, no class toggling, no layout.
    s.rootX.to = rubberband(event.clientX - s.fromX)
    s.rootY.to = rubberband(event.clientY - s.fromY)
  }

  function endDrag(event: React.PointerEvent, cancelled: boolean) {
    const s = m.current
    if (!s.dragging || event.pointerId !== s.pointerId) return
    s.dragging = false
    s.pointerId = -1

    // A drag that ends on the control still activates it; one that ends off it does not,
    // which is the same forgiveness a native button gives you. The box is re-measured
    // here rather than reused from pointerdown so a page scroll mid-drag cannot stale it —
    // a layout read on release is free, one per pointermove would not be.
    const r = cancelled ? null : (rootRef.current?.getBoundingClientRect() ?? null)
    const inside =
      !cancelled &&
      !!r &&
      event.clientX >= r.left &&
      event.clientX <= r.right &&
      event.clientY >= r.top &&
      event.clientY <= r.bottom
    s.voidClick = !inside

    // Release: the pull springs keep the velocity they already have and re-target to 0,
    // so there is no seam between dragging and animating. The squash is a one-shot
    // impulse scaled by how deep the press was; w·e is the velocity that makes a
    // critically damped spring peak at exactly 1, so a full press squashes fully.
    s.rootX.to = 0
    s.rootY.to = 0
    s.press.to = 0
    s.squash.v += s.squash.w * Math.E * s.press.p

    if (rootRef.current?.hasPointerCapture(event.pointerId)) {
      rootRef.current.releasePointerCapture(event.pointerId)
    }
    run()
  }

  /* Runs in the capture phase, before <Link>'s own handler, which checks
     defaultPrevented before navigating. Keyboard activation never goes through the
     pointer path, so voidClick is false and Enter/Space always navigate. */
  function onClickCapture(event: React.MouseEvent) {
    if (m.current.voidClick) {
      m.current.voidClick = false
      event.preventDefault()
      event.stopPropagation()
      return
    }
    onClick?.(event)
  }

  const handlers = {
    onPointerDown,
    onPointerMove,
    onPointerUp: (e: React.PointerEvent) => endDrag(e, false),
    onPointerCancel: (e: React.PointerEvent) => endDrag(e, true),
    onClickCapture,
  }

  /**
   * A <button> already activates on both keys; an anchor natively takes Enter only, and
   * Space scrolls the page. The brief asks for both keys on this control, so the link
   * branch opts in — additive, and the only cost is that Space stops scrolling while the
   * CTA holds focus. Deliberately no motion here: a keyboard action should commit
   * instantly, not wait out a squash.
   */
  function onKeyDown(event: React.KeyboardEvent) {
    if (event.key !== ' ' || event.defaultPrevented) return
    event.preventDefault()
    ;(event.currentTarget as HTMLElement).click()
  }

  const body = (
    <>
      <span ref={shiftRef} aria-hidden className="lq-shift">
        <span ref={fillRef} className={`lq-fill ${fillClassName}`} />
      </span>
      <span ref={labelRef} className="lq-label">
        {children}
      </span>
    </>
  )

  if (to) {
    return (
      <Link
        ref={(node) => {
          rootRef.current = node
        }}
        to={to}
        viewTransition={viewTransition}
        className={`lq-btn ${className}`}
        style={style}
        onKeyDown={onKeyDown}
        {...handlers}
      >
        {body}
      </Link>
    )
  }

  return (
    <button
      ref={(node) => {
        rootRef.current = node
      }}
      type={type}
      className={`lq-btn ${className}`}
      style={style}
      {...handlers}
    >
      {body}
    </button>
  )
}
