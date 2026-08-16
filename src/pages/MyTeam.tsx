import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { AuthTopBar } from '../components/AccountMenu'
import ScrollEdgeEffect from '../components/ScrollEdgeEffect'
import PersonDetails from '../components/team/PersonDetails'
import ResultModal from '../components/team/ResultModal'
import StatusPanel, { DiscordGlyph } from '../components/team/StatusPanel'
import TeamDecor from '../components/team/TeamDecor'
import {
  MEMBERS,
  QUALIFIED_MODAL,
  REJECTED_MODAL,
  STATUS_VARIANTS,
  TEAM,
  type TeamStatus,
} from '../teamData'

const COPY = '/assets/figma/85282b0baf589ceb0eb17e9e2d027684e76a4e8b.svg'
const DISCORD_32 = '/assets/figma/8353328712043444b22094d1885d9862cc9e8a45.svg'

function isStatus(value: string | null): value is TeamStatus {
  return STATUS_VARIANTS.includes(value as TeamStatus)
}

/** The indicator is drawn at this width and scaled to each tab, so only transform animates. */
const BAR_W = 100

/** How long the copy button holds its tick before returning to the copy glyph. */
const COPIED_MS = 1600

/**
 * The copy affordance's box, on both anchors: `1297:1140` is 16 on the 402 dashboard,
 * `708:2326` 20 at 1440. `size-[20px]` was the 1440 figure held flat — a 20px control between a
 * 14px "รหัสทีม" label and its value on a phone. Lands on 20.000 at `--fl` = 1.
 *
 * One constant for the button, the glyph and the tick, so the swap's two layers can never
 * disagree about the box they share.
 */
const COPY_BOX = 'size-[calc(15.896px_+_4.104*var(--fl))]'

/**
 * The team lockup's own ranks, both anchors measured, and all three were the 1440 value held
 * flat — the same class of defect PersonDetails' header block already records.
 *
 *   รหัสทีม / สถานศึกษา type   14/400 @402 (`1297:1138`, `1297:1143`, lh 19.6)
 *                              18/400 @1440 (`708:2324`, `708:2329`, lh 25.2)   was `fl-18` (16@402)
 *   those rows' inline gap      8 @402 (`1297:1137`, `1297:1142`)
 *                              12 @1440 (`708:2323`, `708:2328`)                was flat 12
 *   title → code → school gap   8 @402 (`1297:1135`)
 *                              16 @1440 (`708:2321`)                            was flat 16
 *
 * The title itself is NOT in this list: `1297:1136` is 20/500 and `708:2322` 24/500, which is
 * exactly `fl-24`'s own 20 → 24 ramp, so it already lands on both anchors.
 *
 * Weight is 400 at both anchors on every line here, i.e. the inherited body weight, so nothing
 * below carries a weight class and nothing becomes a breakpoint.
 */
const LOCKUP_14_18 = 'text-[calc(13.896px_+_4.104*var(--fl))]'
const LOCKUP_ROW_GAP_8_12 = 'gap-[calc(7.896px_+_4.104*var(--fl))]'
const LOCKUP_STACK_GAP_8_16 = 'gap-[calc(7.792px_+_8.208*var(--fl))]'

/** No Figma asset for the copied state — the tick is drawn in the tone the labels use. */
function Tick({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden className={className}>
      <path
        d="M4 10.5 8 14.5 16 6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

/** Modal call to action — Figma sets these labels in Sukhumvit Set Semi Bold, not Noto. */
function ModalButton({
  href,
  className,
  icon,
  children,
}: {
  href: string
  className: string
  icon: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <a
      href={href}
      className={`mm-press flex w-full items-center justify-center gap-4 rounded-[16px] px-4 py-3 font-display fl-20 leading-normal font-semibold transition-opacity hover:opacity-90 ${className}`}
    >
      {icon}
      {children}
    </a>
  )
}

/**
 * THE PHONE'S TWO-UP SWITCHER — `1297:1290`, and it only exists below `lg`.
 *
 * The 402 dashboard (`1297:1259`, 402x874, `clipsContent: true`) does NOT stack the two
 * columns: `1297:1289` is a single 354x722 card whose first child is a segmented control and
 * whose second is whichever pane it selects. The frame is drawn with สถานะ active, which is why
 * `1297:1386` is the one carrying the selected skin.
 *
 * Every length is flat — this surface exists on one frame only, so 402 is the sole anchor and
 * there is nothing to ramp to:
 *
 *   track   `1297:1290`  322x48, radius 16, 4 of padding, a 6 gap, white, 0.5 #dcdcdc INSIDE
 *   pill    both are 154x40 (`layoutGrow: 1`, so half the track each) on 12 / 4 of padding
 *   active  `1297:1386`  radius 12, #f3f3f3, label `1297:1387` 16 / weight 500 / #282828
 *   idle    `1297:1293`  radius 24, no fill,  label `1297:1294` 16 / weight 400 / #8c8c8c
 *
 * 24.176/16 is 1.511, which is where `leading-[1.511]` comes from; the pill's 40 is a fixed
 * height rather than the label plus its padding (32.18), hence `h-10`.
 *
 * The inside stroke is `shadow-[inset_…]` and not a `border`, for the reason StatusPanel's
 * `Step` records: Figma draws it INSIDE, so it must not add to the 48 the track measures.
 *
 * No radius transition, for the cascade reason set out at `CHIP` in components/AccountMenu.tsx:
 * `.mm-press` writes an unlayered `transition` shorthand that would replace one written here.
 * Colour and weight cross-fade; the 24 → 12 radius snaps under them.
 *
 * ------------------------------------------------------------------- the selected pill travels
 *
 * `#f3f3f3` is no longer on the pill. It is one absolutely-positioned rule below that SLIDES
 * between the two, which is the same correction the member tab bar's own note argues for a few
 * lines down: a fill that switches off one pill and on at the other is two marks appearing, and
 * with exactly two pills 6px apart the eye reads the jump rather than the choice. One object
 * moving is a selection changing.
 *
 * `relative` on the pill is load-bearing: the indicator is positioned and the labels are not, so
 * without it the fill would paint OVER both labels.
 *
 * The geometry is exact rather than approximate. The track is `p-1` (4) with a `gap-1.5` (6) and
 * two `flex-1` pills, so each pill is (W − 8 − 6)/2 = W/2 − 7, which is `calc(50% - 7px)` against
 * the track's padding box; `top-1 bottom-1` is the pill's own 40 inside the 48 track. The second
 * position is one pill plus the gap to the right, and a percentage in `translate` is a share of
 * the element's OWN width — so `100% + 6px` lands on Figma's second pill at every track width
 * without measuring anything.
 */
const SWITCH_PILL =
  'mm-press relative flex h-10 flex-1 items-center justify-center px-3 py-1 text-[16px] leading-[1.511] transition-colors'

const SWITCH_PILL_ON = 'rounded-[12px] font-medium text-ink'

const SWITCH_PILL_OFF = 'rounded-[24px] font-normal text-gray-2 hover:bg-black/[0.03]'

/** The two panes the phone switcher chooses between, in the order Figma lays them out. */
const PANES = [
  { key: 'team', label: 'ข้อมูลทีม' },
  { key: 'status', label: 'สถานะ' },
] as const

type Pane = (typeof PANES)[number]['key']

export default function MyTeam() {
  const [params] = useSearchParams()
  const statusParam = params.get('status')
  const status: TeamStatus = isStatus(statusParam) ? statusParam : 'reviewing'

  /*
   * Which pane the phone switcher is showing. Only reachable below `lg` — from `lg` up the
   * switcher is `display: none` and BOTH panes are shown, so this state is simply not consulted
   * there and the 1440 layout cannot be affected by it.
   */
  const [pane, setPane] = useState<Pane>('team')
  const paneTabs = useRef<HTMLDivElement>(null)

  // the advisor tab is the one shown in the document-issue design
  const [active, setActive] = useState(status === 'issue' ? MEMBERS.length - 1 : 0)
  const [modal, setModal] = useState(params.get('modal'))
  /*
   * Whether a dialogue actually OWNS the screen, which is not the same question as "is there a
   * modal param". `?modal=anything-else` opens neither sheet, and the page must not drop back
   * behind a scrim that is not there.
   */
  const modalOpen = modal === 'qualified' || modal === 'rejected'
  /*
   * The tick's clock is the *moment of the last press*, not a boolean. Keyed on `copied`
   * the effect could not re-run for a second click inside the window — `copied` was already
   * true, so nothing changed, the timer kept running on the first click's schedule and the
   * tick vanished part-way through the second confirmation. Storing the timestamp makes
   * every press a new value, so the effect re-runs, clears the old timer and starts a fresh
   * 1600ms. Zero means "not copied", which is also the initial state.
   */
  const [copiedAt, setCopiedAt] = useState(0)
  const copied = copiedAt !== 0

  const person = MEMBERS[active]

  /*
   * The selected tab's rule is one element that slides, rather than a border redrawn under
   * whichever tab is active — a jump between two tabs reads as two separate marks. It is
   * measured off the live tab (the labels are Thai and every tab is a different width) and
   * placed with a transform, so nothing but a compositor property changes. The tab list
   * wraps on narrow screens, hence the y offset as well as the x.
   */
  const tabsRef = useRef<HTMLDivElement>(null)
  const [bar, setBar] = useState<{ x: number; y: number; w: number } | null>(null)

  useLayoutEffect(() => {
    const list = tabsRef.current
    if (!list) return

    const measure = () => {
      const tab = list.children[active] as HTMLElement | undefined
      if (!tab) return
      setBar({
        x: tab.offsetLeft,
        y: tab.offsetTop + tab.offsetHeight - 2,
        w: tab.offsetWidth,
      })
    }

    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(list)
    return () => observer.disconnect()
  }, [active])

  // the tick is a confirmation, not a mode — it hands the copy glyph back on its own
  useEffect(() => {
    if (!copiedAt) return
    const timer = window.setTimeout(() => setCopiedAt(0), COPIED_MS)
    return () => window.clearTimeout(timer)
  }, [copiedAt])

  return (
    /*
     * This is the screen a team arrives at from the end of registration, and it used to
     * appear in a single frame: header, card, tabs, details and the whole status column at
     * once, straight off SuccessStep's crossfade. It now assembles in the same cascade
     * sign-in uses — the shared `[data-auth-entrance] .auth-rise` ladder in
     * styles/auth-motion.css — rather than a second entrance invented for one page: five
     * regions at 0/60/110/160/210ms, 560ms each, so the reward reads as being presented.
     * The two text regions take the 14px distance; the header, the tab bar and the status
     * column take the full 48.
     */
    <div className="relative min-h-dvh overflow-clip bg-[#fefdfc]" data-auth-entrance>
      <TeamDecor />

      {/* Figma 708:2306 — the progressive blur band that fades the pasta out under the nav */}
      {/*
       * The band matches the chrome it softens — 106px at 375 up to Figma's 160 at 1440 —
       * rather than staying 160 everywhere. A flat 160 over a 106px header put 54px of ramp
       * tail on the content below it, ending on a line, which is the grey slab over the cards.
       */}
      <ScrollEdgeEffect className="absolute inset-x-0 top-0 z-10 h-[calc(106px_+_54*var(--fl))]" />

      {/* Figma 708:2307: a 1440 frame padded 100 either side, 60 down, 40 between the rows */}
      {/*
       * `auth-recede` while a result dialogue owns the screen — Apple's rule for a modal task,
       * and the wizard already answers its policy sheet exactly this way (`receded` in
       * form/WizardShell.tsx). The เข้ารอบ / ไม่ผ่าน sheets are the highest-stakes moment on the
       * site and the page behind them was doing nothing at all, so the two read as one flat plane
       * with a grey wash between them. 0.6% of scale is felt rather than seen, and both the scale
       * and its transition live inside the reduced-motion guard in styles/auth-motion.css.
       *
       * It rides THIS wrapper and not the page root, for the reason WizardShell records: a
       * transform on the root would become the containing block for the sheets' own
       * `fixed inset-0` scrim and shrink it to the column. Both `ResultModal`s are siblings of
       * this element, so nothing they render is inside the transform. `ScrollEdgeEffect` is a
       * sibling too, and a transformed sibling is still part of the same backdrop root — the
       * band's `backdrop-filter` keeps sampling the page rather than an empty group.
       */}
      <div
        data-recede={modalOpen}
        className="auth-recede shell-dash relative z-20 mx-auto flex w-full max-w-[1440px] flex-col items-center gap-[calc(24px_+_16*var(--fl))] pt-[calc(24px_+_36*var(--fl))] pb-16"
      >
        {/*
         * The third copy of this plate, now the shared `AuthTopBar` (components/AccountMenu.tsx)
         * along with the wizard's and the gate's. `1297:1280` is 354x80 with its 40-tall logo at
         * (20, 20) and `708:2308` is 1240x92 with a 50-tall one at (20, 21), so the flat `p-5`
         * this header recorded is the plate's everywhere and moved into the component unchanged.
         * What DID change is the radius: `rounded-3xl` was 24 held flat where `1297:1280` draws
         * 20, and it is now a 20 → 24 ramp that lands on 24.000 at 1440.
         *
         * `data-rise` passes straight through to the `<header>`, so this stays the first region
         * of the page's entrance cascade.
         */}
        <AuthTopBar className="auth-rise w-full" data-rise="0" />

        {/* Figma 708:2317 splits the row 816 / 400 with a 24 gutter */}
        <div className="flex w-full flex-col items-start gap-6 lg:flex-row">
          <div className="flex w-full min-w-0 flex-1 flex-col items-start gap-8 rounded-[20px] bg-white p-4 shadow-soft">
            {/*
             * THE SWITCHER. `lg:hidden`, because from `lg` up Figma is back to the two-column row
             * and both panes are on screen at once — so nothing below this point can move 1440.
             *
             * Real tab semantics rather than two buttons that look like tabs: `role="tablist"`
             * with `aria-selected` and `aria-controls` on each pill, `role="tabpanel"` on each
             * pane, and ArrowLeft / ArrowRight walking the pair. Two panels is exactly the case
             * where automatic activation is right — moving the selection IS the whole gesture and
             * there is nothing expensive behind either pill.
             *
             * The inactive pane is `display: none` (Tailwind's `hidden`), not visually hidden, so
             * its contents leave the tab order with it — otherwise Tab from the switcher would
             * walk into a member tab list nobody can see.
             */}
            <div
              ref={paneTabs}
              role="tablist"
              aria-label="มุมมองข้อมูลทีม"
              data-rise="1"
              className="auth-rise relative flex w-full gap-1.5 rounded-[16px] bg-white p-1 shadow-[inset_0_0_0_0.5px_#dcdcdc] lg:hidden"
            >
              {/*
               * The selected pill's fill, as one element that travels — see `SWITCH_PILL`. First
               * in the DOM so the two labels paint over it, and `mm-indicator` is the app's one
               * definition of this move (220ms on the shared ease-in-out, the same class and the
               * same duration as the member tab rule below, so the two bars on this screen are
               * one gesture). Under `prefers-reduced-motion` the class carries no transition and
               * the fill is simply at the selected pill: the mark is the affordance, the travel
               * is the decoration.
               *
               * `transform` inline rather than a `translate-x-*` utility, because Tailwind 4
               * compiles those to the individual `translate` property while `.mm-indicator`
               * transitions `transform` — the two would never meet.
               */}
              <span
                aria-hidden
                className="mm-indicator pointer-events-none absolute top-1 bottom-1 left-1 w-[calc(50%_-_7px)] rounded-[12px] bg-[#f3f3f3]"
                style={{
                  transform:
                    pane === PANES[0].key ? 'translateX(0)' : 'translateX(calc(100% + 6px))',
                }}
              />

              {PANES.map(({ key, label }) => (
                <button
                  key={key}
                  type="button"
                  role="tab"
                  id={`pane-tab-${key}`}
                  aria-selected={pane === key}
                  aria-controls={`pane-${key}`}
                  /* Roving tabindex: the tablist is ONE tab stop and the arrows move within it,
                     which is what stops Tab from landing on a control that only re-labels the
                     pane the user is already looking at. */
                  tabIndex={pane === key ? 0 : -1}
                  onClick={() => setPane(key)}
                  onKeyDown={(event) => {
                    /* Two tabs, so "next" and "previous" are the same element and both arrows
                       can share one branch. */
                    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return
                    event.preventDefault()
                    const next = PANES[(PANES.findIndex((p) => p.key === key) + 1) % PANES.length]
                    setPane(next.key)
                    paneTabs.current
                      ?.querySelector<HTMLButtonElement>(`#pane-tab-${next.key}`)
                      ?.focus()
                  }}
                  className={`${SWITCH_PILL} ${pane === key ? SWITCH_PILL_ON : SWITCH_PILL_OFF}`}
                >
                  {label}
                </button>
              ))}
            </div>

            {/*
             * The team pane. It is a real flex column carrying the `gap-8` that used to sit on the
             * card, which is what keeps 1440 byte-identical: the card's own gap now only ever
             * separates the switcher from the pane (Figma's 32 between `1297:1290` and
             * `1297:1388`), and from `lg` up the switcher is `display: none` — not a flex item at
             * all — so the card has exactly one child and its gap never applies. `display: contents`
             * would have avoided the extra level, but a `role` on a contents box has a history of
             * falling out of the accessibility tree, and this element is a `tabpanel`.
             */}
            <div
              role="tabpanel"
              id="pane-team"
              aria-labelledby="pane-tab-team"
              className={`w-full min-w-0 flex-col items-start gap-8 ${
                pane === 'team' ? 'flex' : 'hidden lg:flex'
              }`}
            >
              {/*
               * `1297:1133` stacks this lockup on the phone and centres it: a 116 square over the
               * team name, the code and the school. That is also the only shape that works, because
               * the desktop row sizes the tile with `aspect-square self-stretch` — its width is
               * whatever the text block's HEIGHT turns out to be, and on a 375 phone that text wraps
               * to five lines, so the tile grew to ~180 square, which took width away from the text,
               * which wrapped further. A fixed 116 below `sm` breaks that loop; from `sm` up the
               * self-sizing row is exactly what it was.
               */}
              <div
                className="auth-rise auth-rise-sm flex w-full flex-col items-center gap-4 text-center sm:flex-row sm:items-start sm:text-start"
                data-rise="1"
              >
                {/*
                 * The team photo plate. FLAT 116 at every width, and the `sm:` trio that used to
                 * follow it — `size-auto aspect-square self-stretch` — is deleted because it
                 * rendered the box **0px wide** from `sm` up.
                 *
                 * Why it collapsed: `size-auto` clears both width and height, `self-stretch`
                 * then makes the height definite only after the row has been laid out, and
                 * `aspect-square` cannot derive a width from a height that is not definite at
                 * the time it resolves — so Chrome settles on 0. Measured at 1440: plate 0 wide,
                 * and the row's own 16px `gap` still applied, which is what pushed `ทีม A`,
                 * `รหัสทีม` and `สถานศึกษา` to 32 from the card's edge while the tabs and the
                 * numbered headings below sat at 16. That 16px step is the "padding ไม่เท่ากัน"
                 * the user reported — nothing in the card was actually mis-padded.
                 *
                 * 116 is Figma's own phone value (`1297:812`'s photo plate). The DESKTOP frame
                 * for this card could not be located in the file, so rather than invent a
                 * number the square keeps the one value Figma does state. If the desktop plate
                 * turns out to be larger, this is a one-token change — but a stated 116 is
                 * strictly better than a computed 0.
                 */}
                <div className="size-[116px] shrink-0 rounded-2xl bg-[#ebebeb]" />
                <div
                  className={`flex min-w-0 flex-1 flex-col items-center ${LOCKUP_STACK_GAP_8_16} sm:items-start`}
                >
                  <h1 className="fl-24 leading-[1.4] font-medium">{TEAM.name}</h1>
                  <p
                    className={`flex items-center ${LOCKUP_ROW_GAP_8_12} ${LOCKUP_14_18} leading-[1.4]`}
                  >
                    <span className="text-gray-2">รหัสทีม</span>
                    <span>{TEAM.code}</span>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard?.writeText(TEAM.code)
                        setCopiedAt(Date.now())
                      }}
                      aria-label={copied ? 'คัดลอกรหัสทีมแล้ว' : 'คัดลอกรหัสทีม'}
                      data-on={copied}
                      className={`mm-swap mm-press-icon transition-opacity hover:opacity-60 ${COPY_BOX}`}
                    >
                      <img src={COPY} alt="" aria-hidden className={`mm-swap-off ${COPY_BOX}`} />
                      <Tick className={`mm-swap-on text-brand-green ${COPY_BOX}`} />
                    </button>
                  </p>
                  <p
                    className={`flex flex-wrap items-start ${LOCKUP_ROW_GAP_8_12} ${LOCKUP_14_18} leading-[1.4]`}
                  >
                    <span className="text-gray-2">สถานศึกษา</span>
                    <span>{TEAM.school}</span>
                  </p>
                </div>
              </div>

              {/*
               * A SCROLLER, not a wrap. `1297:1145` is a 444-wide row inside a 354 card — Figma lets
               * the four pills run off the edge rather than folding them onto a second line, which is
               * what `flex-wrap` was doing (and what the note below used to record as deliberate).
               *
               * The axes are named separately and neither is `hidden`: `overflow-x-auto` alone would
               * compute `overflow-y` to `auto` as well and let the row be nudged vertically, and
               * `hidden` on either axis would make this a scrollport a touch drag could pan even with
               * nothing to reveal. `overscroll-behavior-x: contain` stops a swipe that reaches the end
               * of the row from chaining outward into the page.
               *
               * It cannot widen the document: the overflow lives inside this box, which is inside a
               * `min-w-0` card, so the 444 never reaches the shell — the same containment the Prizes
               * and PastEvents carousels rely on. At 1440 the four pills fit and no scrollport is
               * exercised at all, so nothing there moves.
               *
               * The indicator below stays correct through a scroll for free: it is absolutely
               * positioned against this same box, so it lives in the scrolled coordinate space its
               * `offsetLeft` measurements are taken in and travels with the pills.
               */}
              <div
                ref={tabsRef}
                role="tablist"
                aria-label="สมาชิกในทีม"
                className="auth-rise relative flex w-full flex-nowrap items-center gap-2 overflow-x-auto overflow-y-clip [overscroll-behavior-x:contain]"
                data-rise="2"
              >
                {MEMBERS.map((member, i) => {
                  const on = i === active
                  return (
                    <button
                      key={member.tab}
                      type="button"
                      role="tab"
                      aria-selected={on}
                      onClick={() => setActive(i)}
                      /* 8 of inline pad on the 402 frame (`1297:1146` is 123x37 with its label at
                       x8) against Figma's 12 at 1440 (`708:2332`, 194x43 with its glyph at x12).
                       `py-2` is 8 on both. Exact at `--fl` = 1.

                       The LABEL rides the same 14 → 18 ramp as the lockup above it: `1297:1149`
                       is 14/600 on a 21.154 line and `708:2335` is 18/600 on 27.198, where
                       `fl-18` floors at 16 — so the phone drew a 16px tab label beside a 14px
                       lockup, and the 37-tall pill Figma measures came out 40. The measured 402
                       row is 621 wide against Figma's 444; the difference is the 24 glyph this
                       code keeps deliberately (see below) plus its 8 gap, four times over, and
                       the row is a scroller precisely so that stays contained. */
                      className={`mm-press flex shrink-0 items-start gap-2 px-[calc(7.896px_+_4.104*var(--fl))] py-2 ${LOCKUP_14_18} leading-normal transition-colors ${
                        on ? 'font-semibold' : 'rounded-2xl bg-white text-gray-2'
                      }`}
                    >
                      {/*
                       * LEFT FLAT AT 24, deliberately, and it is the one glyph in this pass with
                       * no phone anchor to ramp to: the 402 dashboard drops these marks entirely.
                       * `1297:1146` … `1297:1158` are label-only pills 123/119/119/59 wide summing
                       * to 444 in a 354 card, so Figma dropped the icon to fit four tabs on a
                       * phone rather than shrinking it. Hiding it here is a composition change, not
                       * a size one, so the 24 that `708:2333` / `708:2345` draw stays — and the 444
                       * is now honoured as the scroller Figma actually drew rather than as a wrap.
                       */}
                      <img
                        src={on ? member.icon.on : member.icon.off}
                        alt=""
                        aria-hidden
                        className="size-[24px] shrink-0"
                      />
                      {member.tab}
                    </button>
                  )
                })}

                {/*
                 * Figma draws the selected tab's 2px rule as an inside stroke, so it must not
                 * add to the 43px tab height — the bar is placed over the tab, not under it.
                 */}
                {bar && (
                  <span
                    aria-hidden
                    className="mm-indicator pointer-events-none absolute top-0 left-0 h-0.5 origin-left bg-brand-red"
                    style={{
                      width: BAR_W,
                      transform: `translate(${bar.x}px, ${bar.y}px) scaleX(${bar.w / BAR_W})`,
                    }}
                  />
                )}
              </div>

              {/*
               * Two wrappers, and they cannot be one. The outer is the page entrance's fourth
               * region and must animate exactly once, at mount. The inner is keyed on the
               * active tab so React remounts it and the cross-fade keyframe replays on every
               * switch — the indicator above slides for 220ms while the panel under it used to
               * change in a single frame, which made the smoothest interaction on the site
               * point at the hardest cut. Both classes set `animation`, so sharing one element
               * would let the entrance's higher-specificity rule win and the cross-fade would
               * never run at all — and a keyed `auth-rise` would re-play the 160ms entrance on
               * every tab click.
               *
               * `.mm-panel` is 220ms, the indicator's own duration, so the two are one gesture.
               * The height is deliberately not animated: the advisor drops the birth-date
               * column and the document lists differ, so the panel's height varies by over
               * 100px, and transitioning that would relayout the whole dashboard column for
               * the length of the fade. The height snaps under the fade instead.
               */}
              <div className="auth-rise auth-rise-sm w-full" data-rise="3">
                <div key={active} className="mm-panel w-full">
                  <PersonDetails person={person} />
                </div>
              </div>
            </div>

            {/*
             * The status pane, phone only. `1297:1388` is a 322-wide column INSIDE the same card,
             * opening straight on `อัปเดตล่าสุดเมื่อ` — the `สถานะ` pill above names it, so the
             * panel's own heading is suppressed with the `heading` prop StatusPanel exposes for
             * exactly this.
             *
             * `StatusPanel` is mounted only while this pane is selected, so the default render has
             * ONE of it in the document rather than a hidden duplicate of the right-hand column's.
             * The panel element itself stays put either way, so `aria-controls` always resolves.
             *
             * `card={false}` for the divergence this note used to only record: StatusPanel's root
             * drew its own `rounded-[20px] bg-white p-4 shadow-soft` plate, so inside this card it
             * nested one white card in another and the content landed 290 wide where `1297:1388`
             * says 322. That frame carries no `cornerRadius`, no fill and no padding at all — the
             * phone's status view is a pane of THIS card, not a card of its own — so the plate is
             * suppressed at the call site rather than cancelled from out here with a negative
             * margin. The prop is StatusPanel's, beside `heading`; 1440 passes neither and keeps
             * `708:2416`'s standalone plate untouched.
             */}
            <div
              role="tabpanel"
              id="pane-status"
              aria-labelledby="pane-tab-status"
              className={`w-full min-w-0 ${pane === 'status' ? 'block lg:hidden' : 'hidden'}`}
            >
              {pane === 'status' && (
                <StatusPanel
                  status={status}
                  showDiscord={status === 'qualified'}
                  heading={false}
                  card={false}
                />
              )}
            </div>
          </div>

          {/*
           * 400 at 1440 is Figma's, and it is now the top of a ramp rather than a constant. The
           * left column is whatever this card leaves behind — 816 at 1440, but a hard 400 made it
           * only 465 at 1024, which is where PersonDetails' 450-wide document label stopped
           * fitting inside it. 300 at 768 keeps the same share of the viewport, so the split reads
           * as the 1440 one at every width in the band rather than pinching one side.
           */}
          {/*
           * `hidden lg:block`, where this used to stack under the team card at every width. Below
           * `lg` the status column IS the switcher's second pane inside the card above
           * (`1297:1289` is one card, not two), so this is the desktop half of that split and
           * nothing here changed at 1440 — `w-full` simply had nothing left to do once the column
           * only exists from `lg`, where `lg:w-[…]` already governed it.
           */}
          <div
            className="auth-rise hidden shrink-0 lg:block lg:w-[calc(241.5px_+_158.5*var(--fl))]"
            data-rise="4"
          >
            <StatusPanel status={status} showDiscord={status === 'qualified'} />
          </div>
        </div>
      </div>

      <ResultModal
        open={modal === 'qualified'}
        {...QUALIFIED_MODAL}
        onClose={() => setModal(null)}
        /*
         * ONE action, not two. This modal used to carry a "แชร์ไปยัง Instagram" button beside
         * the Discord one; that share action has since been removed from the design, so it is
         * removed here. `ResultModal`'s `actions` is a plain `ReactNode` and its wrapper is a
         * full-width column, so a single `ModalButton` — which is `w-full` — fills the row at
         * every width with no fragment and no layout change.
         *
         * Nothing else Instagram goes: the ติดต่อเรา / ติดต่อทีมงาน entries in the footer, the
         * guide and StatusPanel are LINKS to those accounts rather than sharing, and stay.
         */
        actions={
          <ModalButton
            href="#"
            className="bg-[#5865f2] text-white"
            icon={<DiscordGlyph size={32} src={DISCORD_32} />}
          >
            รับรหัสเข้าร่วม Discord{' '}
          </ModalButton>
        }
      />

      <ResultModal
        open={modal === 'rejected'}
        {...REJECTED_MODAL}
        titleClassName="text-brand-red"
        onClose={() => setModal(null)}
      />
    </div>
  )
}
