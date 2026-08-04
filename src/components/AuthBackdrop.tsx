/**
 * Every decorative layer behind the auth screens, transcribed from Figma's 1440x1024
 * desktop frames. Three separate families, because the screens do not share one:
 *
 *  - `AuthBackdrop` — the 694x984 collage beside the sign-in form (colour blocks,
 *    cracked eggs, pan, shakers)
 *  - `ColourBlockBackdrop` — the page-filling colour blocks behind the registration
 *    gate and the success/error results, which carry no food at all
 *  - `WizardBackdrop` — the pasta cluster and tomatoes behind the wizard steps
 *
 * Figma's layer names are misleading — "Background / Green" is filled yellow,
 * "Background / Red" green and "Background / Orange" red — so the exports are
 * referenced by their content hash rather than a colour word.
 *
 * Geometry is verbatim Figma px. Rotated pieces keep Figma's own two-box structure
 * (an unrotated bounding box that centres a rotated child) because the bounding box
 * is what positions the piece; rotating in place would shift every one of them.
 */
import { useEffect, useRef, type ReactNode } from 'react'

const F = '/assets/figma/'

const EGG = `${F}c6846fdac4a084629e25f2100a77c420948f8b4d.png`
const PAN = `${F}1412de4d4308bb72d72073a9cde1788640b8b864.png`
const SALT = `${F}7a93d04621140d4ef1f5409c4417daf0c58fbad8.png`
const PEPPER = `${F}2085fae8134ceed89332f4af2d2d35a227c5ea9c.png`
const POWDER = `${F}353423da94c71328b68e670875249cde6279bf14.png`
const PASTA = `${F}9411a40dfd006a723a0a9654923706988c019803.png`
const TOMATO = `${F}a3ce089ae8fc11332c3cca7006e6af2737b4b96a.png`

type Box = { left: number; top: number; width: number; height: number }

/**
 * A colour block: Figma nests the artwork at an inset, already folded into these values.
 *
 * `className` carries the `auth-block-*` view-transition names from auth-motion.css. The
 * same three fills appear on sign-in and on the registration gate at wildly different
 * geometry, and naming them is what lets the browser morph one layout into the other.
 */
function Block({
  src,
  className = '',
  rise,
  ...box
}: Box & { src: string; className?: string; rise?: number }) {
  return (
    <img
      src={src}
      alt=""
      className={`absolute max-w-none ${rise === undefined ? '' : 'auth-rise'} ${className}`}
      data-rise={rise}
      style={box}
    />
  )
}

type PieceProps = Box & {
  src: string
  /** Unrotated artwork size — smaller than the box, which is the rotated bounding box. */
  w: number
  h: number
  rotate: number
  /** Figma mirrors the tomatoes vertically as well as rotating them. */
  flipY?: boolean
  /** Position in the sign-in entrance stagger; omitted where there is no entrance. */
  rise?: number
  /**
   * An `auth-food-*` class, which carries a view-transition name from auth-motion.css. The
   * gate has no food to pair these with, so the name is not there to morph anything — it
   * lifts the piece out of the page-level cross-fade so the collage can come apart on its
   * own timing instead of blinking out with the sign-in copy.
   */
  className?: string
}

function Piece({ src, w, h, rotate, flipY, rise, className = '', ...box }: PieceProps) {
  return (
    /*
     * The entrance rides the outer box, which carries no transform of its own — the
     * rotation lives on the child. Two transforms on one element would fight.
     */
    <div
      className={`absolute flex items-center justify-center ${rise === undefined ? '' : 'auth-rise'} ${className}`}
      data-rise={rise}
      style={box}
    >
      <div
        className="flex-none"
        style={{ transform: `rotate(${rotate}deg)${flipY ? ' scaleY(-1)' : ''}` }}
      >
        <img src={src} alt="" className="max-w-none object-cover" style={{ width: w, height: h }} />
      </div>
    </div>
  )
}

/**
 * One plane of the sign-in collage. `depth` is how many pixels the plane travels when
 * the pointer crosses half the viewport, and it is the only thing that separates the
 * planes: the pan sits nearest the viewer and moves most, the colour blocks furthest and
 * barely move. Every plane is a full-bleed box so its child keeps its Figma coordinates.
 *
 * A wrapper per piece rather than one wrapper per depth band, because the red block is
 * painted *between* the eggs and grouping by depth would reorder the stack.
 */
function Plane({ depth, children }: { depth: number; children: ReactNode }) {
  return (
    <div className="auth-depth absolute inset-0" data-depth={depth}>
      {children}
    </div>
  )
}

/**
 * Pointer parallax for the collage. Decorative, so it is allowed to be playful — and
 * decorative is exactly why it must not snap: the layers chase the pointer with a spring
 * -like ease rather than being pinned to it, which is what makes it read as depth rather
 * than as a value being assigned (Emil's note on spring-interpolated mouse tracking).
 *
 * Every frame writes `transform` directly on each plane. The tempting alternative — one
 * custom property on the collage root — would invalidate the style of all fifteen
 * descendants per frame; eight transform writes touch nothing but their own layers.
 *
 * Gated on a fine pointer (a touch tap would jump the whole collage) and on
 * `prefers-reduced-motion`, where the listener is simply never attached, so the planes
 * keep the identity transform they render with.
 */
function usePointerParallax(rootRef: React.RefObject<HTMLDivElement | null>) {
  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const planes = [...root.querySelectorAll<HTMLElement>('[data-depth]')].map((el) => ({
      el,
      depth: Number(el.dataset.depth) || 0,
      x: 0,
      y: 0,
    }))

    let tx = 0
    let ty = 0
    let frame = 0

    const step = () => {
      let moving = false
      for (const plane of planes) {
        const dx = tx * plane.depth - plane.x
        const dy = ty * plane.depth - plane.y
        // 0.09 per frame ≈ a 250ms settle at 60fps: it follows without lagging behind
        plane.x += dx * 0.09
        plane.y += dy * 0.09
        if (Math.abs(dx) > 0.05 || Math.abs(dy) > 0.05) moving = true
        plane.el.style.transform = `translate3d(${plane.x.toFixed(2)}px, ${plane.y.toFixed(2)}px, 0)`
      }
      // stop the loop once it has settled — an idle rAF for a decoration is not free
      frame = moving ? requestAnimationFrame(step) : 0
    }

    const onMove = (e: PointerEvent) => {
      tx = (e.clientX / window.innerWidth) * 2 - 1
      ty = (e.clientY / window.innerHeight) * 2 - 1
      if (!frame) frame = requestAnimationFrame(step)
    }

    window.addEventListener('pointermove', onMove, { passive: true })
    return () => {
      window.removeEventListener('pointermove', onMove)
      if (frame) cancelAnimationFrame(frame)
      for (const plane of planes) plane.el.style.transform = ''
    }
  }, [rootRef])
}

/**
 * The pasta is one crop out of a larger sheet, so the artwork box clips an oversized
 * image rather than scaling the whole sheet down. Every instance shares the same crop.
 */
function PastaPiece({ w, h, rotate, ...box }: Omit<PieceProps, 'src' | 'flipY'>) {
  return (
    <div className="absolute flex items-center justify-center" style={box}>
      <div className="flex-none" style={{ transform: `rotate(${rotate}deg)` }}>
        <div className="relative overflow-hidden" style={{ width: w, height: h }}>
          <img
            src={PASTA}
            alt=""
            className="absolute max-w-none"
            style={{ width: '641.92%', height: '600.87%', left: '-143.34%', top: '-469.05%' }}
          />
        </div>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------- sign in ---- */

const SIGN_IN_EGGS: Omit<PieceProps, 'src'>[] = [
  {
    left: 325.34,
    top: 36.79,
    width: 545.551,
    height: 426.747,
    w: 495.986,
    h: 352.701,
    rotate: -9.11,
  },
  {
    left: 315.43,
    top: 173.34,
    width: 386.924,
    height: 342.915,
    w: 320.262,
    h: 227.742,
    rotate: -25.35,
  },
  {
    left: 462.26,
    top: 67.74,
    width: 491.692,
    height: 471.954,
    w: 401.141,
    h: 285.256,
    rotate: 38.08,
  },
]

/**
 * Figma 939:42, the frame named "Pepper": the designer grouped these eight shakers so
 * the ring could be turned as one body, and its box is 694.626 x 706.065 at
 * (6.208, 423.513) in the panel. `SIGN_IN_SHAKERS` below is therefore stated relative
 * to that box rather than to the panel, and `SHAKER_RING` re-anchors it.
 *
 * Two consequences of taking the frame at face value:
 *  - an earlier transcription carried a ninth shaker, a second pepper 16.8 left of the
 *    one at (319.032, 72.597); the regrouped frame has only eight, and its width is
 *    exactly 694.626 rather than the 711.43 that duplicate implied, so it is gone.
 *  - the eight sit at 45deg intervals, and the mean of their centres lands within ~1px
 *    of the box centre, so the ring turns about `50% 50%` without a nudge.
 */
const SHAKER_RING: Box = { left: 6.208, top: 423.513, width: 694.626, height: 706.065 }

const SIGN_IN_SHAKERS: PieceProps[] = [
  {
    src: SALT,
    left: 187.432,
    top: 30.877,
    width: 375.692,
    height: 303.096,
    w: 332,
    h: 236,
    rotate: 12.67,
  },
  {
    src: PEPPER,
    left: 319.032,
    top: 72.597,
    width: 375.596,
    height: 405.245,
    w: 330.738,
    h: 235.191,
    rotate: 57.67,
  },
  {
    src: POWDER,
    left: 362.242,
    top: 207.207,
    width: 304.291,
    height: 376.887,
    w: 333,
    h: 237,
    rotate: 102.67,
  },
  {
    src: SALT,
    left: 249.502,
    top: 330.467,
    width: 405.245,
    height: 375.596,
    w: 330.738,
    h: 235.191,
    rotate: 147.67,
  },
  {
    src: PEPPER,
    left: 111.832,
    top: 372.567,
    width: 374.497,
    height: 301.901,
    w: 331,
    h: 235,
    rotate: -167.33,
  },
  {
    src: POWDER,
    left: 0,
    top: 233.767,
    width: 378.434,
    height: 408.307,
    w: 333.237,
    h: 236.968,
    rotate: -122.33,
  },
  {
    src: SALT,
    left: 40.212,
    top: 123.407,
    width: 301.901,
    height: 374.497,
    w: 331,
    h: 235,
    rotate: -77.33,
  },
  {
    src: PEPPER,
    left: 41.182,
    top: 0,
    width: 405.245,
    height: 375.596,
    w: 330.738,
    h: 235.191,
    rotate: -32.33,
  },
]

/**
 * Sign-in's decorative panel. Render inside a `relative h-[984px] w-[694px]` box —
 * the collage deliberately overflows it on every side and is clipped by the page.
 */
export default function AuthBackdrop() {
  const root = useRef<HTMLDivElement>(null)
  usePointerParallax(root)

  /*
   * `rise` indices order the entrance back-to-front, which is also Figma's paint order:
   * the three colour blocks lift first, the pan follows, then the eggs land on it one at
   * a time, and the shaker ring is last in. See `[data-auth-entrance] .auth-rise` in
   * styles/auth-motion.css — the whole entrance is suppressed when the visitor arrived
   * through the morph, which has already animated these same boxes.
   */
  return (
    <div aria-hidden ref={root} className="pointer-events-none absolute inset-0">
      <Plane depth={5}>
        <Block
          src={`${F}fa0b9f2f4fa7dcf077181151e86e3aecdf7a85a3.svg`}
          className="auth-block-amber"
          rise={0}
          left={0}
          top={447.355}
          width={944}
          height={519.633}
        />
      </Plane>
      <Plane depth={7}>
        <Block
          src={`${F}81ab6df7b9ffc666c9e4e34fea15824767b81f3d.svg`}
          className="auth-block-green"
          rise={1}
          left={438}
          top={14}
          width={390}
          height={595.71}
        />
      </Plane>

      {SIGN_IN_EGGS.map((egg, i) => (
        <Plane key={i} depth={12 + i * 2}>
          <Piece src={EGG} rise={4 + i} className={`auth-food-egg-${i + 1}`} {...egg} />
        </Plane>
      ))}

      {/* painted after the eggs so it crops them, exactly as the design stacks it */}
      <Plane depth={6}>
        <Block
          src={`${F}239721762cc0b1a7e9b0ba787ef6c2010c4bc928.svg`}
          className="auth-block-red"
          rise={2}
          left={0}
          top={14}
          width={416}
          height={495}
        />
      </Plane>

      {/* the pan is the nearest object in the collage, so it takes the most parallax */}
      <Plane depth={20}>
        {/* the entrance and the 96s turn need one element each, as the shaker ring does */}
        <div
          className="auth-food-pan auth-rise absolute"
          data-rise={3}
          style={{ left: -125, top: -59, width: 654, height: 465 }}
        >
          <img src={PAN} alt="" className="auth-pan-turn size-full max-w-none object-cover" />
        </div>
      </Plane>

      <Plane depth={10}>
        {/* the entrance and the 96s turn need one element each — see auth-motion.css */}
        <div className="auth-food-ring auth-rise absolute" data-rise={7} style={SHAKER_RING}>
          <div className="auth-pepper-ring absolute inset-0">
            {SIGN_IN_SHAKERS.map((item, i) => (
              <Piece key={i} {...item} />
            ))}
          </div>
        </div>
      </Plane>
    </div>
  )
}

/* ------------------------------------------------------ colour blocks ---- */

/**
 * `className` pairs each shape with its sign-in counterpart by fill — #d79a4e, #94b45e,
 * #c0563e — so pressing Google on sign-in morphs one layout into the other. The muted
 * set below reuses the same two names at the same geometry, which makes success → error
 * a recolour of the same shapes rather than a cut.
 */
const BRAND_BLOCKS: (Box & { src: string; className: string })[] = [
  {
    src: `${F}13950dcba78b5cdd3af1d3b143472aa8451a23b9.svg`,
    className: 'auth-block-amber',
    left: -134,
    top: 461.355,
    width: 1890,
    height: 1044.645,
  },
  {
    src: `${F}218e9e4111038850e7314b82f297b1398ae7c09d.svg`,
    className: 'auth-block-green',
    left: 743,
    top: -413,
    width: 781,
    height: 1209.654,
  },
  {
    src: `${F}d1d61faf1bf4dc9ef558000710a149ea1015f6a8.svg`,
    className: 'auth-block-red',
    left: -134,
    top: -401,
    width: 833,
    height: 995,
  },
]

/** The error screen desaturates the same shapes and drops the green block entirely. */
const MUTED_BLOCKS: (Box & { src: string; className: string })[] = [
  {
    src: `${F}5fc0b14e16e9ac67a144b0e553190de7e576055d.svg`,
    className: 'auth-block-amber',
    left: -134,
    top: 461.355,
    width: 1890,
    height: 1044.645,
  },
  {
    src: `${F}a920a391e664479edabe4c7b2b4545abc7f8c022.svg`,
    className: 'auth-block-red',
    left: -134,
    top: -401,
    width: 833,
    height: 995,
  },
]

/**
 * The colour blocks behind the registration gate and the result screens. Their
 * geometry is anchored to the top of Figma's 1024-tall frame; the bottom band runs
 * off it, so a matching fill continues past the fold on taller viewports.
 */
export function ColourBlockBackdrop({ muted = false }: { muted?: boolean }) {
  const blocks = muted ? MUTED_BLOCKS : BRAND_BLOCKS

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <div
        className="absolute inset-x-0 top-[1024px] bottom-0"
        style={{ background: muted ? '#f0f0f0' : '#d79a4e' }}
      />
      {/*
       * These blocks used to carry a scroll-linked parallax, and it was wrong here. On a
       * marketing page a backdrop drifting against the scroll reads as depth; on a form the
       * user is reading and filling in, the same drift reads as the background coming
       * loose — "register ตอนนี้ถ้าเลื่อนขึ้นลง มันจะขยับพื้นหลัง". The blocks are the page's
       * ground, so they are now pinned to it and only the content moves.
       */}
      <div className="absolute top-0 left-1/2 h-[1024px] w-[1440px] -translate-x-1/2">
        {blocks.map((block) => (
          <Block key={block.src} {...block} />
        ))}
      </div>
    </div>
  )
}

/* ------------------------------------------------------------- wizard ---- */

const WIZARD_PASTA: Omit<PieceProps, 'src' | 'flipY'>[] = [
  {
    left: 473.48,
    top: 399.96,
    width: 291.956,
    height: 233.35,
    w: 267.118,
    h: 198.355,
    rotate: 7.94,
  },
  {
    left: 500.26,
    top: 344.14,
    width: 251.131,
    height: 214.794,
    w: 213.793,
    h: 158.757,
    rotate: -17.17,
  },
  {
    left: 457.78,
    top: 458.74,
    width: 217.12,
    height: 206.123,
    w: 174.381,
    h: 129.491,
    rotate: -35.02,
  },
  {
    left: 309.57,
    top: 211.69,
    width: 463.485,
    height: 484.647,
    w: 389.102,
    h: 288.937,
    rotate: 53.59,
  },
  { left: 1.95, top: 0, width: 633.93, height: 662.874, w: 532.193, h: 395.193, rotate: 53.59 },
  {
    left: 308.1,
    top: 226.12,
    width: 300.785,
    height: 348.871,
    w: 294.859,
    h: 218.954,
    rotate: 108.39,
  },
  { left: 0, top: 19.75, width: 411.395, height: 477.164, w: 403.289, h: 299.472, rotate: 108.39 },
  {
    left: 335.39,
    top: 300.32,
    width: 283.429,
    height: 292.81,
    w: 235.244,
    h: 174.686,
    rotate: 51.29,
  },
  {
    left: 37.33,
    top: 121.24,
    width: 387.656,
    height: 400.488,
    w: 321.752,
    h: 238.925,
    rotate: 51.29,
  },
  {
    left: 226.19,
    top: 257.53,
    width: 399.319,
    height: 319.162,
    w: 365.348,
    h: 271.298,
    rotate: 7.94,
  },
  {
    left: 262.83,
    top: 181.19,
    width: 343.481,
    height: 293.782,
    w: 292.413,
    h: 217.139,
    rotate: -17.17,
  },
  {
    left: 204.72,
    top: 337.93,
    width: 296.963,
    height: 281.922,
    w: 238.507,
    h: 177.109,
    rotate: -35.02,
  },
]

const WIZARD_TOMATOES: Omit<PieceProps, 'src'>[] = [
  {
    left: 205.44,
    top: 99.52,
    width: 265.285,
    height: 265.285,
    w: 220.579,
    h: 220.579,
    rotate: -166.74,
    flipY: true,
  },
  {
    left: 0,
    top: 0,
    width: 402.236,
    height: 402.236,
    w: 299.744,
    h: 299.744,
    rotate: -153.4,
    flipY: true,
  },
  {
    left: 213.21,
    top: 170.55,
    width: 198.567,
    height: 198.567,
    w: 165.105,
    h: 165.105,
    rotate: -166.74,
    flipY: true,
  },
]

/**
 * Wizard-step decoration: pasta spilling in from the top right, tomatoes from the
 * bottom left. Figma anchors the pasta group to the frame's top edge and the tomato
 * group to its bottom, so on a step that grows past 1024 the tomatoes follow the
 * end of the document rather than floating mid-page.
 *
 * The terms step keeps the pasta but drops the tomatoes.
 */
export function WizardBackdrop({ withTomatoes = true }: { withTomatoes?: boolean }) {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute inset-y-0 left-1/2 w-[1440px] -translate-x-1/2">
        {/*
         * Named so the decoration is lifted out of the step-to-step crossfade and holds
         * still. It used to hold still only between steps: both clusters also took opposite
         * halves of a scroll parallax, which on these very long form pages was the most
         * visible motion on screen and read as the backdrop sliding about under the card.
         * The wizard is a place to concentrate, so the decoration stays where Figma put it.
         */}
        <div
          className="wizard-pasta absolute"
          style={{ left: 904.91, top: -305.14, width: 773.059, height: 696.332 }}
        >
          {WIZARD_PASTA.map((piece, i) => (
            <PastaPiece key={i} {...piece} />
          ))}
        </div>

        {withTomatoes && (
          <div
            className="wizard-tomatoes absolute"
            style={{ left: -129.22, bottom: -70.24, width: 470.728, height: 402.236 }}
          >
            {WIZARD_TOMATOES.map((piece, i) => (
              <Piece key={i} src={TOMATO} {...piece} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
