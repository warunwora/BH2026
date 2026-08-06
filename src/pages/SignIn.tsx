import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import AuthBackdrop, { PhoneAuthBackdrop } from '../components/AuthBackdrop'
import GoogleLogo from '../components/GoogleLogo'
import { STACKED_ASPECT, StackedLockup } from '../components/Lockup'
import { useAuthNavigate, useOwnArrival } from '../components/form/wizardNav'

/**
 * Set once the collage has assembled, and deliberately module scope rather than state: it
 * has to outlive this component, because the whole question is whether a *later* mount
 * should animate.
 */
let entrancePlayed = false

/**
 * Whether this mount should play the arrival entrance.
 *
 * Sign-in is reachable more than one way and only the first wants it. A visitor who lands
 * on /signin sees the collage assemble; a visitor who comes back to it — browser back out
 * of the registration gate, or back from the homepage — is returning to a screen they have
 * already watched arrive, and replaying it would undo the morph that just carried those
 * exact colour blocks home.
 *
 * A module flag rather than `:active-view-transition`, which is what this used to read.
 * That test only answers "am I inside a transition right now", so it could not see a
 * plain back navigation, and it silently answered "play" for the entire time no transition
 * was being started at all. Once per document load is the honest rule, and a genuine
 * reload gets the entrance back.
 */
function useArrivalEntrance() {
  const [play] = useState(() => !entrancePlayed)
  useEffect(() => {
    entrancePlayed = true
  }, [])
  return play
}

/**
 * Figma 708:1205. A 1440x1024 row: 20 of padding, an 80 gap, and a 694x984 decorative
 * panel on the right, which leaves the form column 626 wide with an 80 left indent.
 * Figma's `leading-[normal]` is CSS `line-height: normal`, not Tailwind's 1.5, so the
 * headings and the button label spell it out.
 *
 * ------------------------------------------------------------------ the two-column band
 *
 * The row used to turn on at `lg` with the panel at a HARD 694 and `shrink-0`. At exactly
 * 1024 that is 20 + 80(indent) + 80(gap) + 694 + 20 = 894px of fixed chrome inside a 1024
 * viewport, so the form column — the only flexible thing in the row — was handed the 130px
 * that were left: the heading wrapped after every word and the Google button's label broke
 * into four lines while the collage sat at full size beside it. Nothing was overflowing, so
 * `overflow-x: clip` hid no symptom; the column was simply given no width.
 *
 * Both of those are now fluid and the row starts at `md`, so 768 … 1439 is the 1440
 * composition at the width it has rather than a phone stack (768) or a crushed column (1024):
 *
 *   panel   300 @768 → 694 @1440   (`1214:94` has no panel at all, so the low anchor is
 *                                   chosen: 300 is what leaves the 28px heading one line)
 *   gap      24 @402 → 80 @1440
 *   indent    0 @375 → 80 @1440    (a plain `80 * --fl`, since the phone frame has no indent)
 *
 * The collage inside the panel is a fixed 694x984 canvas of absolutely-placed art, so it is
 * SCALED rather than reflowed — `scale: panel/694`, expressed with the `tan(atan2(a, b))`
 * length-ratio trick index.css already uses for `.team-decor-stage`, since calc() will not
 * divide a length by a length. The panel's own height carries the same ratio (984 * panel/694)
 * as a plain ramp, so the box and the art can never disagree.
 *
 * At 1440 every one of those lands on its Figma number to the pixel: 694 wide, 984 tall,
 * scale 1, an 80 gap and an 80 indent, which leaves the form column 626.
 */
const PANEL_W = 'calc(69.6px + 624.4 * var(--fl))'

/**
 * Inline styles rather than arbitrary Tailwind values, for the same reason `NAV_SHELL` in
 * Navbar.tsx is: the panel width appears twice — as a length and inside the stage's ratio —
 * and Tailwind's scanner only sees class strings it can read literally, so an interpolated
 * `w-[${PANEL_W}]` would never be generated. One source of truth, no `!important`.
 */
const PANEL: React.CSSProperties = {
  width: PANEL_W,
  height: 'calc(98.6px + 885.4 * var(--fl))', // 984 * panel/694, so the box tracks the art
}

/**
 * The stage's scale goes through a CUSTOM PROPERTY and the element carries a stable class
 * name, which is the `--hof-scale` pattern index.css already uses and it is here for the same
 * reason.
 *
 * `tan()` / `atan2()` are Chrome 111+, Safari 15.4+, Firefox 108+. Because the value embeds a
 * `var()` it PARSES everywhere — a custom property is an unvalidated token stream — and only
 * fails at computed-value time, where `scale` then falls back to its initial `none`. That
 * renders the 694x984 collage at native size inside a panel that is ~300 wide at 768: about
 * 394px of overflow, contained only by the root's `overflow-clip`.
 *
 * Written as `--signin-panel-scale` + `scale: var(--signin-panel-scale)` rather than as a bare
 * `scale`, so a stylesheet `@supports not (scale: tan(atan2(1px, 1px)))` block can supply a
 * step-ladder ratio for `.signin-panel-stage` with an author `!important` — which is the one
 * thing that outranks an inline declaration. The declaration BELOW is unchanged in value, so
 * every engine with trig computes exactly what it computed before.
 *
 * The block itself belongs in index.css (this track does not own that file) — see the report.
 */
const PANEL_STAGE = {
  '--signin-panel-scale': `tan(atan2(${PANEL_W}, 694px))`,
  scale: 'var(--signin-panel-scale)',
  transformOrigin: 'top left',
} as React.CSSProperties
export default function SignIn() {
  const go = useAuthNavigate()
  const firstArrival = useArrivalEntrance()

  /*
   * And the same guard the registration sheet and the result cards take. The three colour
   * blocks in the collage carry both a `view-transition-name` and `.auth-rise`, so an arrival
   * that is already being animated by a transition would run two timelines over one element:
   * the group scaling the snapshot while the live block tries to travel 48px inside it, which
   * distorts the rise by whatever the group's scale happens to be. Latent today — the module
   * flag above means a `gate-back` arrival never plays the entrance anyway — but the pairing is
   * the same defect the result cards had, and one condition closes it for good.
   */
  const own = useOwnArrival()
  const entrance = firstArrival && own

  return (
    /*
     * `data-auth-entrance` is what arms every `.auth-rise` on this screen, the collage's
     * included (styles/auth-motion.css). Without the attribute each element renders in
     * its final state — there is no half-applied case.
     */
    <div
      data-auth-entrance={entrance || undefined}
      className="relative min-h-dvh overflow-clip bg-white"
    >
      {/*
       * The phone's own collage (`1214:94`), which this screen had none of below `lg` — the
       * panel was simply hidden, so /signin was the one page on the site with no decoration at
       * all on a phone, and the three `auth-block-*` shapes the Google press morphs into the
       * registration gate had no source to fly out of. See AuthBackdrop.tsx.
       */}
      <PhoneAuthBackdrop />

      {/*
       * `justify-center` is a no-op in row mode — the form column is `flex-1`, so the row is
       * always full — and on the phone it is what centres the form in the viewport, which is
       * where `1214:96` puts it (206.5 of clearance above AND below its 461-tall block).
       *
       * `px-6 py-5` → `md:p-5`: `1214:95` pads its content 20/24/20/24, so the phone gutter is
       * 24 but its vertical padding is the same 20 the 1440 frame (`708:1206`) uses on all four
       * sides. This was a flat `p-6`, i.e. 4px too much clearance top and bottom on a phone —
       * which only shows on a viewport short enough for the centred column to reach the edge.
       */}
      <div className="relative flex min-h-dvh flex-col items-center justify-center gap-10 px-6 py-5 md:flex-row md:gap-[calc(22.543px_+_57.457*var(--fl))] md:p-5">
        {/* The gap between the back link and the login card: `1214:96` sets 24 on the phone
            frame against 60 at 1440 (`708:1207`). It used to ramp 45.64 → 60, i.e. 46 at 402 —
            the 1440 value held nearly flat, which pushed the whole card down almost an entire
            extra line on the frame that has the least room for it. */}
        <div className="flex w-full flex-1 flex-col items-start justify-center gap-[calc(23.063px_+_36.937*var(--fl))] md:pl-[calc(80*var(--fl))]">
          {/* `1214:100` is 16 / Regular 400 on the phone frame, `708:1211` 20 / Regular at
              1440, with `lineHeightUnit: FONT_SIZE_%` at 140% on both — so `leading-[1.4]` is
              right and the size is a two-anchor ramp.
              NOT `fl-20`: that rank is `max(17px, 16 + 4·--fl)`, whose 17px floor overrides the
              ramp below 641 and renders 17 at 402 where Figma draws 16. The SIZE rule is that
              the phone frame wins over the ladder, so the pair is spelled out at the call site;
              the ladder itself is untouched, and 1440 still lands on 20.000. */}
          <Link
            to="/"
            data-rise={0}
            /* the gap rides the caret: `1214:100` sits 8 clear of a 20 glyph, `708:1211` 10
               clear of a 24 one, so `gap-2.5` is the 1440 end of one ramp rather than a
               constant */
            className="auth-rise auth-rise-sm mm-press flex w-full items-center gap-[calc(7.948px_+_2.052*var(--fl))] text-[calc(15.896px_+_4.104*var(--fl))] leading-[1.4] transition-opacity hover:opacity-70"
          >
            {/* `left_regular`: 20 on `1214:98`, 24 on `708:1209`. This was the flat 1440 box
                the earlier pass explicitly left undone — a 24 caret beside a 16px label on a
                402 screen. */}
            <img
              src="/assets/figma/ea51a69c788a5d0d5d7479c1fff987eee5a19fe5.svg"
              alt=""
              aria-hidden
              className="size-[calc(19.896px_+_4.104*var(--fl))]"
            />
            หน้าหลัก
          </Link>

          {/* 24 between the wordmark, the heading block, the button and the terms link on
              `1214:101` (280→256, 370→346 are both 24 apart), 32 at 1440.
              `items-center` / `text-center` is the phone frame, and it is a breakpoint rather
              than a ramp because alignment does not interpolate: `1214:101` and `1214:103` are
              both `counterAxisAlignItems: CENTER` and every child is centred in the 354 card
              (logo 320 at x 17, title 213 at x 70.5, subtitle 317 at x 18.5 — each exactly
              (354 − w)/2), while at 1440 `708:1212`/`708:1214` stretch and their text nodes run
              the full 546 from the left. The back link above stays left-aligned on both frames,
              which is why this lives here and not on the column. */}
          <div className="flex w-full flex-col items-center gap-[calc(23.792px_+_8.208*var(--fl))] text-center md:items-stretch md:text-left">
            {/*
             * THE LOCKUP, and it is two different drawings across the breakpoint.
             *
             * `1214:102` on the phone frame is a 320x256 RECTANGLE whose IMAGE fill is a
             * flattened raster of the STACKED masthead — "2026" with the tomato mascot over
             * BangMod over Hackathon, i.e. the same composition the phone hero draws at
             * `1190:672`. An earlier pass read "no export in this repo" and shipped the
             * horizontal wordmark here at phone size; there is no separate export because it is
             * not a separate drawing, and Lockup.tsx now composes it for both screens.
             *
             * Fitting the 311x232.566 composition into Figma's 320x256 slot: the slot is
             * PADDED — measured off the rendered node and off the raster itself, the ink sits at
             * (12.5, 9.5) and is 293.5 x 228, against (5.5, 4.49) and 292.5 x 224.6 for
             * `1190:672`'s own render. The ink widths agree to 0.34% (the 1.5% on height is the
             * raster's antialiased feather at 3.1 px/unit), so the lockup is placed at its
             * native size offset (7, 5) inside the slot rather than scaled to fill it — which
             * is exactly the percentages below.
             *
             * The 256-tall slot is kept even though the art is only ~233 of it, because 256 is
             * what `1214:101`'s auto-layout reserves: shrinking it would pull the heading up
             * 23px and lose the frame's rhythm.
             *
             * `w-[90.3955%]` is 320/354 — the slot's share of the card — so below 402 it keeps
             * Figma's 17px side margin instead of running to the card edge, and `max-w-[320px]`
             * freezes it at the frame value from 402 up to where `md` hands over.
             */}
            <div
              data-rise={1}
              className="auth-rise auth-rise-sm relative aspect-[5/4] w-[90.3955%] max-w-[320px] md:hidden"
            >
              {/* the ratio comes from the same module as the pin table, so the two cannot drift
                  apart; an interpolated `aspect-[${...}]` would never be scanned by Tailwind */}
              <div
                style={{ aspectRatio: STACKED_ASPECT }}
                className="absolute top-[1.956%] left-[2.1875%] w-[97.1875%]"
              >
                <StackedLockup />
              </div>
            </div>

            {/*
             * `708:1213` — the WIDE mark, 356x80, and `md` up only.
             *
             * Both axes ramp rather than height-plus-`w-auto`. The asset is 1400x315, i.e.
             * 4.4444:1, where Figma draws the 1440 lockup at 356x80 = 4.45 — so `w-auto` would
             * resolve 355.56 and move the desktop mark by half a pixel. Two ramps through
             * 284.44/64 and 356/80 keep both ends exact and the 0.44 of stretch is the crop
             * `object-cover` was already doing. The ramp is unchanged, so every width from 768
             * to 1440 renders exactly what it rendered before; only the phone branch is new.
             */}
            <img
              src="/assets/figma/95f39e217dc710a779c3c0b6cf30b3a377d857f5.png"
              alt="BangMod Hackathon 2026"
              data-rise={1}
              className="auth-rise auth-rise-sm hidden h-[calc(63.584px_+_16.416*var(--fl))] w-[calc(282.58px_+_73.42*var(--fl))] max-w-full object-cover md:block"
            />

            {/* `1214:103` is gap 6, `708:1214` gap 12 — this was `gap-3`, the 1440 value held
                flat, so the phone frame carried twice the space Figma gives it. */}
            <div
              data-rise={2}
              className="auth-rise auth-rise-sm flex w-full flex-col gap-[calc(5.844px_+_6.156*var(--fl))]"
            >
              {/* 24 on `1214:104` → 32 at 1440 (`708:1215`). The old low anchor read 28 out of
                  the 36-tall box on the assumption that `leading-[normal]` is ~1.29; it is 1.5
                  for this face — `708:1215` is a 48-tall box on a 32px line — so the same box
                  is 24, which is what `get_design_context` reports for the node. 1440 is
                  untouched: the ramp still lands on 32.000 at `--fl` = 1. */}
              {/* Weight is a breakpoint here for the same reason as the hero paragraph: Figma
                  disagrees across anchors — `1214:104` is SemiBold (600) and `708:1215` is Bold
                  (700) — and a weight cannot be interpolated, so each frame gets its own at its
                  own anchor. The code held Bold at every width, i.e. a step too heavy on the
                  phone. 1440 is unchanged. */}
              <h1 className="w-full text-[calc(23.792px_+_8.208*var(--fl))] leading-[normal] font-semibold tracking-[0.374px] md:font-bold">
                ลงทะเบียนเข้าแข่งขัน
              </h1>
              {/* `1214:105` is 16 / Regular, `708:1216` 20 / Regular. It was `fl-20`, whose
                  `max(17px, …)` floor rendered 17 at 402 — the ladder's floor beating the frame.
                  Under the current SIZE rule the phone frame wins, so the pair is spelled out
                  here; the shared rank is untouched and 1440 still lands on 20.000. */}
              <p className="w-full text-[calc(15.896px_+_4.104*var(--fl))] leading-[normal] text-gray-2">
                กรุณาใช้บัญชี Google ในการลงทะเบียนเข้าแข่งขัน
              </p>
            </div>

            {/*
             * Figma sets this one label in Sukhumvit Set, not Noto — hence font-display.
             *
             * This press is the trigger for the whole auth morph. `runAuthTransition` wraps
             * the navigation in `document.startViewTransition`, and the `auth-block-*` names
             * shared by AuthBackdrop and ColourBlockBackdrop are what carry the three colour
             * blocks out of this 694-wide panel and across the whole registration page — the
             * same shapes at twice the size, so the browser has a pure scale and travel to
             * interpolate. The `gate` flag picks that hop's choreography in auth-motion.css:
             * the food dissolves, the blocks fly, the requirements sheet springs up over them.
             *
             * It stays a `<button>` and not a link because signing in is not a destination,
             * so it takes the imperative `useAuthNavigate` rather than link props.
             */}
            <button
              type="button"
              onClick={() => go('/register', 'gate')}
              data-rise={3}
              /* 45 tall on `1214:106` → Figma's 60 at 1440 (`708:1217`); both `#f6f6f6` at
                 `cornerRadius: 20`, so the fill and the radius are flat.
                 The label is 16 on `1214:110` (Sukhumvit Set SemiBold 600) against 20 on
                 `708:1221` — the same 16→20 ramp as the subtitle, and for the same reason it is
                 not `fl-20`: that rank's 17px floor beats the frame at 402.
                 The icon gap is 16 in the phone row (`1214:107` ends at 105, `1214:110` starts
                 at 121) and 20 at 1440, which is `gap-5` unchanged. Padding is 24 horizontal on
                 both frames and 10 → 16 vertical (`1214:106` pads 10/24, `708:1217` 16/24);
                 with the height fixed and the row centred it changes nothing rendered, and it
                 is written out so the box is Figma's on every axis rather than half of it. */
              className="auth-rise auth-rise-sm mm-press flex h-[calc(44.61px_+_15.39*var(--fl))] w-full items-center justify-center gap-[calc(15.896px_+_4.104*var(--fl))] rounded-[20px] bg-[#f6f6f6] px-6 py-[calc(9.844px_+_6.156*var(--fl))] font-display text-[calc(15.896px_+_4.104*var(--fl))] leading-[normal] font-semibold transition-colors hover:bg-[#ececec]"
            >
              <GoogleLogo />
              เข้าสู่ระบบด้วย Google
            </button>

            {/*
             * The ข้อกำหนด link is REMOVED, on the user's instruction, and it is a DELIBERATE
             * DIVERGENCE from Figma rather than agreement with it. The earlier note here claimed
             * "neither `1214:101` nor `708:1206` draws it"; that is wrong and was checked again
             * over the REST API — the 1440 frame `708:1205` carries `708:1222` "ข้อกำหนด" at
             * 16 / Light 300 / 24.18 line, 546 wide at y=707, i.e. 32 under the Google button.
             * The 402 frame `1214:94` genuinely has no such node, so the two frames DISAGREE and
             * the instruction is what settles it. Recorded precisely so a later parity pass does
             * not "restore" it as a missing node, and does not re-derive the false claim.
             *
             * It had been kept on a reasonable-sounding
             * argument — that a link to the terms is a function of the screen rather than a piece
             * of its composition, so a phone visitor should not be left without a route to them
             * from the screen that asks them to agree. That argument loses to the design.
             *
             * The route is not lost: the wizard's own terms step (`/register/terms`) is where the
             * agreement is actually made, and it opens the policy in a modal there. Nothing here
             * was the only path to it.
             *
             * `data-rise={4}` went with it, so the card's entrance ladder now ends at 3. Check
             * `auth-motion.css`'s `[data-rise]` selectors if a fifth step is ever added back.
             */}
          </div>
        </div>

        {/*
         * Purely decorative, and its tall-narrow composition doesn't survive stacking — below
         * `md` the phone frame's own arrangement takes over (`PhoneAuthBackdrop`, above).
         *
         * The outer box is the panel's fluid slot; the inner one is the 694x984 canvas the
         * collage's absolute coordinates are written against, scaled into it from its top-left
         * so the art keeps overflowing on every side exactly as it does at 1440.
         */}
        <div style={PANEL} className="relative hidden shrink-0 md:block">
          {/* `signin-panel-stage` is the stylesheet hook for the no-trig fallback — see
              PANEL_STAGE above. It carries no rules of its own today. */}
          <div
            style={PANEL_STAGE}
            className="signin-panel-stage absolute top-0 left-0 h-[984px] w-[694px]"
          >
            <AuthBackdrop />
          </div>
        </div>
      </div>
    </div>
  )
}
