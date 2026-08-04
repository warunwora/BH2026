import { HeroMobileDecor } from './HomeBackground'
import LiquidButton from './LiquidButton'
import { HERO_LINES } from '../data'
import { useReveal } from '../hooks/useReveal'

/** Two sprite sheets carry the painted numerals; the crop is the window onto one glyph. */
const numeralSheetA = '/assets/figma/1a10c1c22ef3d1ad003f314d85371c4e760a81c0.png'
const numeralSheetB = '/assets/figma/b80b22794b5b6c70a2680115baf73c7fb562b5a7.png'
const tomatoBack = '/assets/figma/c7b7aa1d816dda642ee7de69ea23e875ee541092.svg'
const tomatoFront = '/assets/figma/81a21a35c9efb8c6f5073ba1753e4d8cf1cf97c7.svg'
const bangmodWordmark = '/assets/figma/90da592b9af22f24d0b18b96a32980229697e1d4.svg'
const hackathonWordmark = '/assets/figma/6c759fcf4fc64ea0cc744ae5ae9561fb696786b3.svg'
const arrowUpRight = '/assets/figma/36e6beb58fc37672896d6a8fe3655bddf9e50622.svg'

/* Figma's hero group is one box with every piece pinned in px inside it. Re-expressing
 * those px as percentages of the box is what lets the whole masthead — wordmark, numerals
 * and tomatoes together — scale as a single unit at any width.
 *
 * There are now TWO such boxes, because the two frames arrange the masthead differently:
 *
 *   1440  `935:451` — 810.508 x 421. One wide row: the BangMod and Hackathon wordmarks sit
 *         side by side across the top, and "2026" runs underneath them.
 *    402  `1190:672` — 311 x 232.566. Two stacked rows: "2026" on top, then BangMod over
 *         Hackathon beneath it. The lockup is 1.34:1 instead of 1.93:1, which is what lets
 *         a masthead this large exist on a phone at all.
 *
 * That is a composition change, not a scale, so it cannot be a ramp — it is the one place
 * on this page with a hard breakpoint, at `md`. The five artworks and both sprite crops are
 * shared between the two; only the pin boxes differ. */
function pinner(groupW: number, groupH: number) {
  return (x: number, y: number, w: number, h: number) => ({
    left: `${(x / groupW) * 100}%`,
    top: `${(y / groupH) * 100}%`,
    width: `${(w / groupW) * 100}%`,
    height: `${(h / groupH) * 100}%`,
  })
}

const pin = pinner(810.508, 421)
const pinPhone = pinner(311, 232.56591796875)

/** The sprite windows onto the painted glyphs. Percentages of the pin box, so the same
 *  two strings serve both frames even though the boxes are ~2.5x apart in size. */
const CROP_2 = '323.4% 150.87% 0% -27.75%'
const CROP_6 = '297.12% 150.51% -197.12% -30.11%'

/** "2 0 2 6" — the 2s share one sprite window, the 6 comes off the second sheet. */
const NUMERALS = [
  { box: pin(7, 125, 234, 283), src: numeralSheetA, crop: CROP_2 },
  { box: pin(369, 126, 244, 295), src: numeralSheetA, crop: CROP_2 },
  { box: pin(530, 125, 266, 296), src: numeralSheetB, crop: CROP_6 },
]

/* 1190:691 / 1190:692 / 1190:693 — the same three glyphs, now a row across the TOP of the
 * lockup rather than the bottom. The window aspects differ from the 1440 ones by ~1%, so
 * the shared crop percentages hold without a visible stretch. */
const NUMERALS_PHONE = [
  {
    box: pinPhone(0.20742225646972656, 12.0003547668457, 91, 109),
    src: numeralSheetA,
    crop: CROP_2,
  },
  {
    box: pinPhone(139.20742797851562, 12.0003547668457, 96, 115),
    src: numeralSheetA,
    crop: CROP_2,
  },
  {
    box: pinPhone(198.25430297851562, 16.3753547668457, 112.03180753845663, 122.53726853965713),
    src: numeralSheetB,
    crop: CROP_6,
  },
]

/**
 * The zero is the tomato mascot, drawn twice in Figma — a slightly larger copy behind a
 * slightly smaller one. Both are flipped (rotate 180 then mirrored) and inset inside
 * their clip box, so the leaves crop against the wordmark above.
 */
const TOMATOES = [
  { box: pin(152, 93, 295, 313), src: tomatoBack },
  { box: pin(149, 90, 301, 320), src: tomatoFront },
]

/** 1190:694 / 1190:722 — the same pair, and still the back copy the larger of the two. */
const TOMATOES_PHONE = [
  { box: pinPhone(58.207420349121094, 1.0003547668457031, 111, 120), src: tomatoBack },
  { box: pinPhone(57.207420349121094, 0.000354766845703125, 113, 122), src: tomatoFront },
]

/* 1190:673 / 1190:681. On the phone the two wordmarks are stacked and each is pinned in
 * its own box, so they cannot be one flex row as they are at 1440. Both boxes match their
 * artwork's intrinsic aspect to four decimals (357.717/98.8439 = 3.6191 vs 262.637/72.570;
 * 429.791/87.8322 = 4.8933 vs 253.405/51.785), so nothing is being squashed to fit. */
const WORDMARKS_PHONE = [
  {
    box: pinPhone(22.38613510131836, 121.76841735839844, 262.6373596191406, 72.57030487060547),
    src: bangmodWordmark,
    alt: 'BangMod',
  },
  {
    box: pinPhone(25.917177200317383, 180.78172302246094, 253.4048309326172, 51.785274505615234),
    src: hackathonWordmark,
    alt: 'Hackathon',
  },
]

function Numeral({ box, src, crop }: (typeof NUMERALS)[number]) {
  const [width, height, left, top] = crop.split(' ')

  return (
    <div className="absolute overflow-hidden" style={box}>
      <img
        src={src}
        alt=""
        aria-hidden
        className="absolute max-w-none"
        style={{ width, height, left, top }}
      />
    </div>
  )
}

/** Flipped (rotate 180 then mirrored) and inset inside its clip box, on both frames. */
function Tomato({ box, src }: { box: React.CSSProperties; src: string }) {
  return (
    <div className="absolute overflow-hidden" style={box}>
      <div className="absolute inset-[3.85%_2.61%_3.86%_2.6%] -scale-y-100">
        <img src={src} alt="" aria-hidden className="size-full" />
      </div>
    </div>
  )
}

export default function Hero() {
  const content = useReveal({ group: true, threshold: 0 })

  return (
    // Figma runs the pasta past every edge of the masthead, so this section must not clip;
    // the 379 tail below the CTA is the run-up to the calendar section.
    // The two-step lg: sizes are gone: `hero-*` in styles/liquid.css interpolates the
    // padding, type and CTA between a 375 floor and the exact Figma values at 1440.
    <section id="hero" className="hero-pad relative">
      {/* Narrow viewports only — the 1440 canvas is hidden there. See HomeBackground. */}
      <HeroMobileDecor />

      <div
        ref={content.ref}
        className={`relative z-10 mx-auto flex w-full max-w-[1200px] flex-col items-center text-center ${content.cls}`}
      >
        {/*
         * One box, two aspect ratios and two max-widths — see the pin tables above for why
         * the arrangement itself has to switch at `md`.
         *
         * The cap is a ramp rather than a pair of fixed widths: 311 at 402 (`1190:672`) and
         * 810.508 at 1440 (`935:451`), which keeps the masthead a continuous size through
         * the composition change instead of jumping 19% wider at 768. `w-full` still wins
         * on anything narrower than the cap, so at 320 the lockup is the content column.
         */}
        <div
          style={{ maxWidth: 'clamp(311px, 48.122158vw + 117.5489249px, 810.508px)' }}
          className="relative aspect-[311/232.566] w-full md:aspect-[810.508/421]"
        >
          <div className="absolute inset-0 md:hidden">
            {NUMERALS_PHONE.map((numeral, i) => (
              <Numeral key={i} {...numeral} />
            ))}

            {TOMATOES_PHONE.map((tomato) => (
              <Tomato key={tomato.src} {...tomato} />
            ))}

            {/* Stacked, and each in its own pin box rather than a row. They clear the
                numerals above them by ~11px, so unlike the 1440 lockup nothing here is
                relying on paint order — but the order is kept the same anyway. */}
            {WORDMARKS_PHONE.map((mark) => (
              <img
                key={mark.src}
                src={mark.src}
                alt={mark.alt}
                className="absolute"
                style={mark.box}
              />
            ))}
          </div>

          <div className="absolute inset-0 hidden md:block">
            {NUMERALS.map((numeral, i) => (
              <Numeral key={i} {...numeral} />
            ))}

            {TOMATOES.map((tomato) => (
              <Tomato key={tomato.src} {...tomato} />
            ))}

            {/* the wordmark paints over the numerals — the tomato stalk crops against it */}
            <div className="absolute top-0 left-0 flex w-full items-center gap-[2.8378%]">
              <img src={bangmodWordmark} alt="BangMod" className="w-[44.1352%]" />
              <img src={hackathonWordmark} alt="Hackathon" className="w-[53.0273%]" />
            </div>
          </div>
        </div>

        {/*
         * `1190:669` is 18px/1.5 Light, centred, 370 wide — i.e. the full content column at
         * 402. So the size is a two-anchor ramp like everything else on this section: 18 at
         * 402, and 21 at 1440, which is `fl-lead`'s own ceiling and therefore leaves the
         * desktop paragraph exactly where it was. (Figma draws 24 at 1440; the type scale
         * deliberately holds it at 21 so a hero paragraph is not a step above the
         * registration screens' 20px body. That decision is unchanged — only the narrow end
         * moves, from `fl-lead`'s invented 16 floor to the frame's 18.)
         *
         * The 17px floor is below the line at every width the site is checked at; it only
         * binds under ~320, and it is there so the paragraph cannot grow as the screen
         * shrinks.
         */}
        <p className="mt-[clamp(28px,1.1146435vw_+_25.9491329px,42px)] w-full max-w-[954px] text-[clamp(17px,0.2890173vw_+_16.8381503px,21px)] leading-[1.5] font-light">
          {HERO_LINES.map((line) => (
            <span key={line} className="block">
              {line}
            </span>
          ))}
        </p>

        {/* The one control carrying the liquid behaviour so far: it deforms under the
            pointer, can be dragged and springs home. See LiquidButton for the model.
            `mm-press` is deliberately absent — the press feedback is the spring's now. */}
        {/* The one link out of the marketing pages that should not be a cut: the sign-in
            screen assembles itself on arrival, and it should arrive rather than replace. */}
        <LiquidButton
          to="/signin"
          viewTransition
          className="hero-cta font-bold text-white"
          fillClassName="bg-brand-red"
        >
          ลงทะเบียนเข้าร่วมการแข่งขัน
          {/* the glyph sits inside a 34px cell at 1440 — Figma insets it rather than
              scaling it, so the inset stays a percentage of whatever the cell becomes. The
              lean on hover is gated on a fine pointer, since touch fires :hover on tap.
              Absent below `md`: `1190:670` is label-only, and its 305 width is exactly
              32 + 241 + 32 with nothing left for a cell. */}
          <span className="hero-cta-icon mm-arrow-shift relative hidden shrink-0 overflow-hidden md:block">
            <img
              src={arrowUpRight}
              alt=""
              aria-hidden
              className="absolute inset-[20.81%_20.8%_22.32%_22.32%] max-w-none"
            />
          </span>
        </LiquidButton>
      </div>
    </section>
  )
}
