/*
 * The หอเกียรติยศ page's own decoration layers, straight from Figma's absolute geometry.
 * Shared <Decor> scatters props by percentage, which cannot express these: the pan ring,
 * the blurred warm circle and the wave stack are all placed to the pixel on the 1440
 * canvas and several of them are rotated or mirrored.
 */
const CIRCLE = '/assets/figma/a915d7877097844540d11c4defd51424f31744fd.svg'
const PASTA = '/assets/figma/9411a40dfd006a723a0a9654923706988c019803.png'
const PAN = '/assets/figma/1412de4d4308bb72d72073a9cde1788640b8b864.png'
const WAVE_1 = '/assets/figma/1e1b2a356264e6e238701742ff74561ad0b1ce3c.svg'
const WAVE_2 = '/assets/figma/39106670217bf64f551fa0fae2bca7cc5cb60a49.svg'
const WAVE_3 = '/assets/figma/6ceba0578f56f8d6b17eaac1742f04b06752364a.svg'
const MASCOT = '/assets/figma/f4ba34d113a772dd4d3035bea9dffe43993bc085-1400.png'
const ARCS = [
  '/assets/figma/5e5d8be871695c7950a72623b3b8770911b1a0d8.svg',
  '/assets/figma/5bbfda8a2035204211760df48ab1c6cb9becceae.svg',
  '/assets/figma/4ba90c59231d84618403c2caf02a9efad283cb99.svg',
  '/assets/figma/5864b7cc079440b6e5027956a02dec92acdaf348.svg',
  '/assets/figma/ea5249bf3bfa09730066876b6652d9706fafc407.svg',
  '/assets/figma/1f2c6bad2f6154d9213f8b4f56e551a60a992793.svg',
  '/assets/figma/c19e13940ff89a56c58278f760c0b9bd9bd5336f.svg',
  '/assets/figma/4b1ed3849ac6a8a78d0fe1f5eb27a9749b70e0d5.svg',
]

type Piece = {
  src: string
  /** Figma's bounding box for the piece, i.e. the box *after* it is turned. */
  left: number
  top: number
  w: number
  h: number
  /** The artwork's own untransformed size — a turned piece is wider than it draws. */
  cw: number
  ch: number
  rotate?: number
  skewX?: number
  flipY?: boolean
}

/**
 * A rotated Figma layer is its unrotated artwork centred in the bounding box and then
 * turned about that centre, which is why the box and the artwork carry separate sizes.
 */
function Layer({ p }: { p: Piece }) {
  const turns = [
    p.rotate ? `rotate(${p.rotate}deg)` : '',
    p.skewX ? `skewX(${p.skewX}deg)` : '',
    p.flipY ? 'scaleY(-1)' : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div
      className="absolute flex items-center justify-center"
      style={{ left: p.left, top: p.top, width: p.w, height: p.h }}
    >
      <div
        className="flex-none"
        style={{ width: p.cw, height: p.ch, transform: turns || undefined }}
      >
        <img src={p.src} alt="" className="block size-full max-w-none" />
      </div>
    </div>
  )
}

/*
 * Nine copies of one pan on a ~177 radius ring, each turned a further 39.75deg. The ring
 * is centred 1331 across a 1440 canvas, so it half-leaves the page on the right.
 */
const PANS: Piece[] = [
  {
    src: PAN,
    left: 947,
    top: 170.39,
    w: 408.471,
    h: 395.128,
    cw: 333.685,
    ch: 237.287,
    rotate: 39.38,
  },
  {
    src: PAN,
    left: 1046.9,
    top: 71.1,
    w: 297.749,
    h: 373.52,
    cw: 333.685,
    ch: 237.287,
    rotate: 78.77,
  },
  {
    src: PAN,
    left: 1118.21,
    top: 0,
    w: 366.642,
    h: 406.162,
    cw: 333.685,
    ch: 237.287,
    rotate: 118.15,
  },
  {
    src: PAN,
    left: 1221.23,
    top: 52.79,
    w: 398.44,
    h: 345.39,
    cw: 333.685,
    ch: 237.287,
    rotate: 157.9,
  },
  {
    src: PAN,
    left: 1302.42,
    top: 155.2,
    w: 389.93,
    h: 327.305,
    cw: 333.685,
    ch: 237.287,
    rotate: -162.35,
  },
  {
    src: PAN,
    left: 1307.14,
    top: 235.41,
    w: 379.668,
    h: 408.955,
    cw: 333.685,
    ch: 237.287,
    rotate: -122.59,
  },
  {
    src: PAN,
    left: 1280.69,
    top: 352.3,
    w: 277.015,
    h: 360.651,
    cw: 333.685,
    ch: 237.287,
    rotate: -82.84,
  },
  {
    src: PAN,
    left: 1097.21,
    top: 353.36,
    w: 405.786,
    h: 401.242,
    cw: 333.685,
    ch: 237.287,
    rotate: -43.09,
  },
  {
    src: PAN,
    left: 1021.28,
    top: 366.44,
    w: 346.934,
    h: 256.312,
    cw: 333.685,
    ch: 237.287,
    rotate: -3.34,
  },
]

/** The #BCBCBC plate the pan ring sits on, mirrored vertically in Figma. */
const PAN_PLATE: Piece = {
  src: WAVE_1,
  left: 1005,
  top: 156,
  w: 749,
  h: 474,
  cw: 749,
  ch: 474,
  flipY: true,
}

/**
 * Hero backdrop: the pan ring plus the two soft shapes that give the top of the page its
 * warmth — Figma's "Decoration / Circle" (a #D79A4E blob at 10% under a 400 blur) and the
 * pasta bowl that all but leaves the canvas on the left.
 */
/*
 * Both props below used to be `hidden lg:*`, which left a phone's hall-of-fame hero with
 * nothing but the warm circle — the pan ring and the pasta bowl, the two things that make
 * this masthead this masthead, were simply absent. They are drawn at every width now, as
 * `.decor-stage`s: the art keeps its Figma geometry and the whole group is scaled by
 * `--decor-fit` (100vw/1440, capped at 1, see styles/pasta-motion.css) from the corner it
 * is pinned by. The *anchor* is scaled by the same factor in a `calc()` — a stage's own
 * `top`/`left`/`right` sit outside its own transform, so scaling the box alone would leave
 * it hanging off the wrong place; `right: calc(-314px * fit)` is what keeps the ring's centre
 * at 92% of the viewport at 390 exactly as it is at 1440.
 */
export function HallOfFameHeroDecor() {
  return (
    <div aria-hidden className="decor-fit pointer-events-none absolute inset-0 z-0">
      {/*
       * The blur reaches ~800 past the shape on every side, so this layer is deliberately
       * left unclipped: cutting it at the section edge would show the fade as a hard line.
       */}
      <div className="absolute top-[200px] left-[-331px] flex h-[1155px] w-[1125px] items-center justify-center">
        <div className="h-[1125px] w-[1155px] flex-none rotate-90">
          <div className="relative size-full">
            <div className="absolute inset-[-71.11%_-69.26%]">
              <img src={CIRCLE} alt="" className="block size-full max-w-none" />
            </div>
          </div>
        </div>
      </div>

      <div
        className="decor-stage absolute flex h-[425.721px] w-[535.735px] origin-top-left items-center justify-center"
        style={{
          top: 'calc(770.02px * var(--decor-fit))',
          left: 'calc(-521.93px * var(--decor-fit))',
        }}
      >
        <div className="h-[366.451px] w-[493.487px] flex-none rotate-[7.24deg]">
          <div className="relative size-full overflow-hidden">
            <img
              src={PASTA}
              alt=""
              className="absolute top-[-469.05%] left-[-143.34%] h-[600.87%] w-[641.92%] max-w-none"
            />
          </div>
        </div>
      </div>

      {/*
       * Figma's "Pan" frame is 1754 wide against a 1440 canvas, i.e. 314 of it hangs off
       * the right edge — anchoring by that overhang keeps the ring in place at any width.
       */}
      <div
        className="decor-stage absolute h-[1115px] w-[1754px] origin-top-right"
        style={{
          top: 'calc(48px * var(--decor-fit))',
          right: 'calc(-314px * var(--decor-fit))',
        }}
      >
        {/*
         * The plate stays put. It is a single soft #BCBCBC blob, not a ring, and its own
         * centre (1379.5, 393) is 50px off the ring's — turning it would swing the plate
         * around a point outside itself and read as the table moving, not the pans.
         */}
        <Layer p={PAN_PLATE} />
        {/*
         * The nine pans turn as one group, like sign-in's shaker ring: same 96s, same
         * linear curve. The origin is the ring's own centre, not the frame's — see
         * styles/pasta-motion.css.
         */}
        <div className="hof-pan-ring absolute inset-0">
          {PANS.map((p, i) => (
            <Layer key={i} p={p} />
          ))}
        </div>
      </div>
    </div>
  )
}

/** Left cluster then right cluster; both are the same four cream arcs at two angles. */
const ARC_PIECES: Piece[] = [
  {
    src: ARCS[0],
    left: -75.409,
    top: 691.571,
    w: 470.177,
    h: 546.518,
    cw: 459.211,
    ch: 316.676,
    rotate: 67.12,
    skewX: 0.06,
  },
  {
    src: ARCS[1],
    left: -138.77,
    top: 489.774,
    w: 655.599,
    h: 748.312,
    cw: 622.159,
    ch: 449.226,
    rotate: 67.12,
    skewX: 0.06,
  },
  {
    src: ARCS[2],
    left: -121.38,
    top: 547.747,
    w: 598.639,
    h: 690.347,
    cw: 577.42,
    ch: 406.262,
    rotate: 67.12,
    skewX: 0.06,
  },
  {
    src: ARCS[3],
    left: -99.271,
    top: 618.268,
    w: 533.681,
    h: 619.825,
    cw: 520.563,
    ch: 359.731,
    rotate: 67.12,
    skewX: 0.06,
  },
  {
    src: ARCS[4],
    left: 1002.954,
    top: 769.558,
    w: 465.132,
    h: 324.824,
    cw: 459.211,
    ch: 316.676,
    rotate: -1.02,
    skewX: 0.06,
  },
  {
    src: ARCS[5],
    left: 837.518,
    top: 636.03,
    w: 630.564,
    h: 460.261,
    cw: 622.159,
    ch: 449.226,
    rotate: -1.02,
    skewX: 0.06,
  },
  {
    src: ARCS[6],
    left: 883.061,
    top: 678.987,
    w: 585.019,
    h: 416.506,
    cw: 577.42,
    ch: 406.262,
    rotate: -1.02,
    skewX: 0.06,
  },
  {
    src: ARCS[7],
    left: 940.795,
    top: 725.507,
    w: 527.29,
    h: 368.967,
    cw: 520.563,
    ch: 359.731,
    rotate: -1.02,
    skewX: 0.06,
  },
]

/** The red mass, the yellow mass inside it, then the mascot with the arcs over the top. */
const RED_WAVE: Piece = {
  src: WAVE_2,
  left: -889.258,
  top: -399.183,
  w: 3342.995,
  h: 3241.705,
  cw: 2283.589,
  ch: 2550.193,
  rotate: -60.58,
}
const YELLOW_WAVE: Piece = {
  src: WAVE_3,
  left: -97,
  top: 412,
  w: 1827,
  h: 1636,
  cw: 1636,
  ch: 1827,
  rotate: 90,
}

/**
 * The band that closes the page: 906 tall on the 1440 canvas, from the last card down to
 * the footer. Everything inside is placed against that canvas and the whole stage scales
 * below lg, so the mascot keeps its footing on the waves instead of drifting.
 */
export function HallOfFameWaveBand() {
  return (
    <div aria-hidden className="hof-band pointer-events-none relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2">
        <div className="hof-stage h-[906px] w-[1440px] origin-top">
          <div className="relative size-full">
            <Layer p={RED_WAVE} />
            <Layer p={YELLOW_WAVE} />
            <img
              src={MASCOT}
              alt=""
              className="absolute top-[140px] left-[353px] size-[700px] max-w-none object-cover"
            />
            {ARC_PIECES.map((p, i) => (
              <Layer key={i} p={p} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
