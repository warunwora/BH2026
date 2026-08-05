import { Link } from 'react-router-dom'

const SHRIMP = '/assets/figma/01d9f57448516699ad9b6756339f9fb833c9f171.png'
const BACKGROUND = '/assets/figma/37c55e8c7ab35b0d51619d1970dcb5f835654651.svg'
const FOUR_LEFT = '/assets/figma/db133365c91e8d541642cf54a783f2ca6e7c3114.svg'
const FOUR_RIGHT = '/assets/figma/f61a22ef6a5504eb0dc06c2aa9383260e0062c70.svg'

const MESSAGE = 'ขออภัย ไม่พบหน้าที่คุณค้นหา'
const BACK = 'กลับไปยังหน้าหลัก'

/**
 * Figma 708:1242-1249 "Decoration / Shrimp" — eight copies of one shrimp ringed around the
 * centre. Coordinates are relative to the ring's own 447.75x448.09 box so the whole cluster
 * can be dropped in at 1440 scale or shrunk for narrow screens.
 * `[left, top, boxSize, rotate]`; the image inside every box is 194.776 square.
 */
const SHRIMPS: [number, number, number, number][] = [
  [193.9, 64.92, 253.848, -112.16],
  [188.29, 141.96, 254.557, -67.46],
  [129.96, 193.11, 254.976, -22.77],
  [53.3, 189.51, 253.418, 21.93],
  [0, 130.6, 256.076, 66.62],
  [5.46, 55.03, 252.25, 111.31],
  [60.02, 0, 257.146, 156.01],
  [140.59, 5.77, 251.053, -159.3],
]

const RING_W = 447.75
const RING_H = 448.09

/**
 * The ring at Figma's own scale; `scale` shrinks it for the mobile stack.
 *
 * It turns, on the site's shared 96s clock — the same `pan-turn` the sign-in shaker ring and
 * hall of fame's pan ring use, via `--turn-period` in styles/pasta-motion.css. This was the
 * one ring of the three standing still, on the one page whose whole job is to make a dead
 * end feel survivable.
 *
 * Three nested boxes, and the class can only go on the middle one. The outer box is the
 * layout footprint and must not rotate or it would push the 4 and the 0 around. The inner
 * shrimp boxes each carry Figma's own `scaleY(-1) rotate(...)` inline, and an animation on
 * `transform` would overwrite it. So the group in between takes it — but that element also
 * carries the `scale(...)` for the mobile stack in the same property, so the turn goes on
 * its own wrapper rather than fighting it. Same split documented for the two pans.
 */
function ShrimpRing({ scale = 1 }: { scale?: number }) {
  return (
    <div
      className="relative shrink-0"
      style={{ width: RING_W * scale, height: RING_H * scale }}
      aria-hidden
    >
      <div
        className="absolute top-0 left-0 origin-top-left"
        style={{ width: RING_W, height: RING_H, transform: `scale(${scale})` }}
      >
        <div className="nf-shrimp-ring absolute inset-0">
          {SHRIMPS.map(([left, top, box, rotate], i) => (
            <div
              key={i}
              className="absolute flex items-center justify-center"
              style={{ left, top, width: box, height: box }}
            >
              <div className="flex-none" style={{ transform: `scaleY(-1) rotate(${rotate}deg)` }}>
                <div className="relative size-[194.776px]">
                  <img
                    src={SHRIMP}
                    alt=""
                    className="absolute inset-0 size-full max-w-none object-cover"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function NotFound() {
  return (
    /*
     * The page arrives rather than appearing, on the shared auth cascade
     * (`[data-auth-entrance] .auth-rise` in styles/auth-motion.css): the glyph row, then the
     * apology, then the way out — 0/60/110ms at 560ms each. A 404 is the one screen a visitor
     * did not choose to be on, and something that assembles reads as a page that meant to
     * greet them; the same content dumped in one frame reads as a crash. The two lines of
     * copy take the short 14px distance, the artwork the full 48.
     *
     * The attribute is unconditional here, unlike sign-in's. Sign-in gates it because a user
     * revisits that screen inside one session and a second assembly reads as a stutter;
     * nobody visits a 404 twice on purpose.
     */
    <div className="relative min-h-dvh overflow-clip bg-white" data-auth-entrance>
      {/*
       * Figma 708:1241 "Background Shape" — a 2660x2610 organic yellow blob, rotated and
       * flipped, that the frame clips. It is the only thing behind the white copy, so the
       * page reads as yellow even though the canvas itself is white.
       */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-1/2 h-full w-[1440px] -translate-x-1/2">
          <div className="absolute top-[781.81px] left-[675.12px] flex h-[2610.714px] w-[2660.904px] -translate-x-1/2 -translate-y-1/2 items-center justify-center max-lg:top-1/2 max-lg:left-1/2">
            <div className="flex-none" style={{ transform: 'scaleY(-1) rotate(-125.21deg)' }}>
              <div className="relative h-[1995.68px] w-[1787.046px]">
                <img src={BACKGROUND} alt="" className="absolute inset-0 block size-full" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* desktop: the exact 1440x1024 frame */}
      <div className="relative z-10 hidden h-[1024px] lg:block">
        <div className="absolute top-0 left-1/2 h-[1024px] w-[1440px] -translate-x-1/2">
          {/*
           * `auth-rise` animates `transform`; every one of these three is placed with `left`
           * and `top`, and the two lines of copy are centred with Tailwind's `translate-x`,
           * which in v4 is the separate `translate` property. So the entrance cannot disturb
           * either the layout or the centring.
           */}
          <img
            src={FOUR_LEFT}
            alt=""
            aria-hidden
            className="auth-rise absolute top-[255px] left-[235px] block h-[411px] w-[314px]"
            data-rise="0"
          />
          <div className="auth-rise absolute top-[255px] left-[494.96px]" data-rise="0">
            <ShrimpRing />
          </div>
          <img
            src={FOUR_RIGHT}
            alt=""
            aria-hidden
            className="auth-rise absolute top-[255px] left-[891px] block h-[411px] w-[314px]"
            data-rise="0"
          />

          <p
            className="fl-40 auth-rise auth-rise-sm absolute top-[774px] left-1/2 -translate-x-1/2 leading-[1.4] font-medium whitespace-nowrap text-white"
            data-rise="1"
          >
            {MESSAGE}
          </p>
          <Link
            to="/"
            viewTransition
            className="fl-24 mm-press mm-link auth-rise auth-rise-sm absolute top-[855px] left-1/2 -translate-x-1/2 leading-[1.4] whitespace-nowrap text-white underline decoration-solid"
            data-rise="2"
          >
            {BACK}
          </Link>
        </div>
        <span className="sr-only">404</span>
      </div>

      {/* mobile: same pieces stacked — the 1440 frame would render the copy unreadably small */}
      <div className="relative z-10 flex min-h-dvh flex-col items-center justify-center gap-8 px-6 lg:hidden">
        <div className="auth-rise flex items-center justify-center" data-rise="0">
          <img src={FOUR_LEFT} alt="" aria-hidden className="block w-[74px] shrink-0" />
          <ShrimpRing scale={0.24} />
          <img src={FOUR_RIGHT} alt="" aria-hidden className="block w-[74px] shrink-0" />
        </div>
        <p
          className="fl-24 auth-rise auth-rise-sm text-center leading-[1.4] font-medium text-white"
          data-rise="1"
        >
          {MESSAGE}
        </p>
        <Link
          to="/"
          viewTransition
          className="fl-18 mm-press mm-link auth-rise auth-rise-sm leading-[1.4] text-white underline"
          data-rise="2"
        >
          {BACK}
        </Link>
      </div>
    </div>
  )
}
