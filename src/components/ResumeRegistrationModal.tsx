import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useLocation, useNavigate } from 'react-router-dom'
import useDialogFocus, { useScrollLock } from './useDialogFocus'
import { ramp } from './ScopeCardArt'
import { clearDraft, hasDraft, resumeRoute } from '../registerDraft'
import '../styles/consent-motion.css'

/**
 * ============================================================================================
 * RESUME OR RESTART — Figma `2074:3241`
 * ============================================================================================
 *
 * The dialogue the returning user meets: "คุณต้องการกรอกฟอร์มต่อจากที่ค้างไว้หรือไม่", a subtitle
 * naming the competition, a paragraph, and the pair เริ่มกรอกฟอร์มใหม่ / กรอกฟอร์มต่อ under a
 * close X.
 *
 * `2074:3241` is a whole 1440x1024 page frame — the register screen with the sheet laid over it
 * — so the numbers below come from the overlay subtree specifically: `2074:3350` is the scrim
 * (#C2C2C2 at 30%, 10px backdrop blur, the treatment every dialogue on this site shares) and
 * `2074:3351` is the sheet (1040 wide, radius 32, 24px padding, 32px gaps, 1px `#dcdcdc`).
 *
 * ------------------------------------------------------------------ the body copy is OURS
 *
 * `2074:3445` in the frame is PLACEHOLDER: it still holds the health-consent sentence from
 * `CONSENTS[0].description` ("อาหารที่แพ้ ประเภทอาหารพิเศษ …"), copied in when this frame was
 * built from the terms step. The user said so directly — "ยังไม่ได้เปลี่ยนข้อความ เปลี่ยนให้เหมาะสม"
 * — so the string below is written for this dialogue rather than transcribed, and it is the one
 * piece of text on this surface that Figma is NOT the authority for.
 *
 * What it has to say, and why each clause is there:
 *
 *  - "ในเบราว์เซอร์ของอุปกรณ์นี้" — the draft is `localStorage`, so it is on THIS device and this
 *    browser only. A user who left off on a phone and came back on a laptop must not read this
 *    as a promise that their answers are on a server waiting for them.
 *  - "ยกเว้นไฟล์เอกสารที่แนบ ซึ่งจะต้องแนบใหม่อีกครั้ง" — the exception, stated up front rather
 *    than discovered three steps later. No browser can rehydrate a file input, so the uploads
 *    genuinely are gone; saying it here is what stops "กรอกฟอร์มต่อ" reading as a promise the
 *    restored step then breaks. See registerDraft.ts for why the bytes are not stored.
 *  - the two named buttons, each with its consequence — restore and go to the furthest step, or
 *    delete everything and begin again. "เริ่มกรอกฟอร์มใหม่" is destructive and irreversible, and
 *    a destructive choice should never rely on the user inferring what it destroys.
 *
 * Two sentences, plain register, and it matches the flow's own voice — the wizard addresses the
 * user with plain verbs and no ราชาศัพท์, which is what the terms step and the gate already do.
 */
const BODY =
  'เราบันทึกคำตอบที่คุณกรอกค้างไว้ในเบราว์เซอร์ของอุปกรณ์นี้ ยกเว้นไฟล์เอกสารที่แนบ ซึ่งจะต้องแนบใหม่อีกครั้ง ' +
  'เลือก “กรอกฟอร์มต่อ” เพื่อกรอกต่อจากขั้นตอนล่าสุดที่ค้างไว้ หรือ “เริ่มกรอกฟอร์มใหม่” เพื่อลบข้อมูลที่บันทึกไว้ทั้งหมดแล้วเริ่มต้นใหม่'

/** `2074:3358`, transcribed from its `characters`. */
const SUBTITLE =
  'โครงการแข่งขันแก้ไขปัญหาด้วยการเขียนโปรแกรมคอมพิวเตอร์ ประจำปี 2569 (BangMod Hackathon 2026)'

/** matches the `.resume-sheet` exit in styles/consent-motion.css */
const EXIT_MS = 190

/**
 * `2074:3438` — the corner-down-right glyph beside the heading, 40x40, `#10161F`.
 *
 * Inlined for the same reason the cookie glyph is: one path, and `currentColor` lets the ramped
 * box own its size without a second exported asset at a second scale.
 */
function ResumeGlyph() {
  return (
    <svg viewBox="0 0 40 40" fill="none" aria-hidden className="h-full w-full">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        fill="currentColor"
        d="M9.45495 6.77198C9.22058 6.85453 9.00921 6.99163 8.83828 7.17198C8.29995 7.71032 8.32661 7.32698 8.34828 14.542L8.36828 20.9003L8.53661 21.4353C8.7854 22.2248 9.22083 22.9427 9.80601 23.5282C10.3912 24.1137 11.1089 24.5495 11.8983 24.7986L12.4333 24.967L20.0299 24.9853L27.6249 25.0037L25.1883 27.452C22.4699 30.1837 22.4933 30.152 22.5449 30.957C22.5999 31.8203 23.1983 32.407 24.0766 32.457C24.8916 32.502 24.7633 32.6103 29.1766 28.187C32.9816 24.3737 33.1249 24.2203 33.2266 23.872C33.3599 23.4186 33.3599 23.2486 33.2266 22.7953C33.1249 22.447 32.9816 22.2937 29.1766 18.4803C24.7633 14.057 24.8916 14.1653 24.0766 14.2103C23.1983 14.2603 22.5999 14.847 22.5449 15.7103C22.4933 16.5153 22.4699 16.4837 25.1899 19.217L27.6299 21.667L20.3316 21.6637C14.4083 21.662 12.9866 21.6437 12.7833 21.572C12.4048 21.4322 12.087 21.1646 11.8849 20.8153L11.6999 20.5003L11.6666 14.2003C11.6299 7.14032 11.6683 7.66032 11.1316 7.13865C10.6849 6.70698 10.0899 6.57698 9.45495 6.77198Z"
      />
    </svg>
  )
}

/** `2074:3362` — the close cross, 24x24, `#8c8c8c`. */
function CloseGlyph() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden className="h-6 w-6">
      <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

/**
 * The sheet itself. Presentational — every decision is the gate's, below.
 *
 * ------------------------------------------------------------------------------- the sizing
 *
 * Figma has NO phone frame for this modal, so every narrow anchor here is inferred. They are not
 * invented: each one is the 402 end of the rank the register flow already uses for that job
 * (form/registerType.tsx) — 28→20 is its `--t-20-28` section heading, 18→14 its `--t-14-18`
 * description, 20→16 its `--t-16-20` action pill — so this dialogue lands on the same ladder as
 * the step behind it instead of introducing a scale of its own. `ramp(lo, hi)` is the house
 * two-anchor helper: `calc(MIN + DELTA * --fl)` with MIN chosen so the curve passes through
 * `lo` at 402 and resolves to `hi` at 1440 exactly.
 *
 * Line heights are unitless ratios (Figma's px ÷ its font size: 39.2/28 = 1.4, 27.198/18 =
 * 1.5110) so they track the ramped size rather than freezing at the desktop figure.
 */
function Sheet({
  state,
  onContinue,
  onRestart,
  onDismiss,
  sheetRef,
}: {
  state: 'open' | 'closed'
  onContinue: () => void
  onRestart: () => void
  onDismiss: () => void
  sheetRef: React.RefObject<HTMLDivElement | null>
}) {
  return (
    <div
      ref={sheetRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="resume-title"
      tabIndex={-1}
      data-state={state}
      onClick={(e) => e.stopPropagation()}
      className="resume-sheet flex max-h-full w-full flex-col overflow-y-auto border border-[color:#dcdcdc] bg-white"
      style={{
        maxWidth: 1040,
        borderRadius: ramp(20, 32),
        padding: ramp(16, 24),
        gap: ramp(20, 32),
      }}
    >
      {/* `2074:3352` — glyph + titles on the left, the close X hard right */}
      <div className="resume-part resume-part-1 flex items-start" style={{ gap: ramp(12, 16) }}>
        {/*
         * `shrink-0` because the glyph is a fixed box beside a heading that wraps to three lines
         * on a phone; without it the flex algorithm squeezes the arrow into a sliver.
         */}
        <span
          className="shrink-0 text-[color:#10161f]"
          style={{ width: ramp(32, 40), height: ramp(32, 40) }}
        >
          <ResumeGlyph />
        </span>

        <div className="flex min-w-0 flex-1 flex-col justify-center">
          <h2
            id="resume-title"
            className="font-medium text-[color:#282828]"
            style={{ fontSize: ramp(20, 28), lineHeight: 1.4 }}
          >
            คุณต้องการกรอกฟอร์มต่อจากที่ค้างไว้หรือไม่
          </h2>
          <p className="text-[color:#808080]" style={{ fontSize: ramp(14, 18), lineHeight: 1.511 }}>
            {SUBTITLE}
          </p>
        </div>

        {/*
         * `2074:3359`. A 24px glyph in a 44px hit area — the glyph is Figma's, the target is the
         * minimum a thumb can reliably hit, and `-m-*` pulls the extra back out of the layout so
         * the padding does not push the cross away from the corner Figma puts it in.
         */}
        <button
          type="button"
          onClick={onDismiss}
          aria-label="ปิด"
          className="-m-2.5 shrink-0 cursor-pointer p-2.5 text-[color:#8c8c8c] transition-colors duration-150 hover:text-[color:#282828]"
        >
          <CloseGlyph />
        </button>
      </div>

      {/* the body — `2074:3445`'s slot, with our own copy in it (see BODY above) */}
      <p
        className="resume-part resume-part-2 text-[color:#808080]"
        style={{ fontSize: ramp(14, 18), lineHeight: 1.511 }}
      >
        {BODY}
      </p>

      {/*
       * `2074:3432` — the two buttons, each `layoutSizingHorizontal: FILL`, i.e. an even split.
       *
       * `flex-col sm:flex-row` is the one departure. Figma only has the 1440 frame, where two
       * 488px buttons are luxurious; at 320 an even split gives each ~130px and
       * "เริ่มกรอกฟอร์มใหม่" at 16px does not fit — it would either overflow the sheet or wrap to
       * two lines inside a 52px-tall pill. Stacked, each is full width and neither can break.
       *
       * DOM order is Figma's (restart, then continue) and the stacked visual order is the same,
       * deliberately: `flex-col-reverse` would put the primary on top on a phone, which is the
       * usual convention, but it also decouples tab order from what the eye sees — and this is a
       * dialogue where one of the two buttons destroys the user's work. Reading order, tab order
       * and visual order agree here, and the red fill is what marks the primary instead.
       */}
      <div
        className="resume-part resume-part-2 flex flex-col sm:flex-row"
        style={{ gap: ramp(12, 16) }}
      >
        {/* `2074:3433` — the neutral half, `#efefef` with `#282828` text */}
        <button
          type="button"
          onClick={onRestart}
          className="flex-1 cursor-pointer bg-[color:#efefef] text-[color:#282828] transition-[filter] duration-150 hover:brightness-95"
          style={{
            borderRadius: ramp(10, 12),
            padding: `${ramp(10, 12)} ${ramp(16, 24)}`,
            fontSize: ramp(16, 20),
            lineHeight: 1.4,
          }}
        >
          เริ่มกรอกฟอร์มใหม่
        </button>

        {/* `2074:3435` — the primary, `#c0563e` with white text */}
        <button
          type="button"
          onClick={onContinue}
          className="flex-1 cursor-pointer bg-[color:#c0563e] text-white transition-[filter] duration-150 hover:brightness-105 active:brightness-95"
          style={{
            borderRadius: ramp(10, 12),
            padding: `${ramp(10, 12)} ${ramp(16, 24)}`,
            fontSize: ramp(16, 20),
            lineHeight: 1.4,
          }}
        >
          กรอกฟอร์มต่อ
        </button>
      </div>
    </div>
  )
}

/**
 * Whether the dialogue has already been raised in this page's lifetime.
 *
 * MODULE level, not state: it has to survive the gate's own re-renders and every route change
 * inside the flow, because the gate is mounted once above the router and the alternative — state
 * — would reset on nothing but still be re-evaluated on every hop.
 *
 * It is deliberately NOT persisted. The X is "dismiss without deciding", and the brief's reading
 * of that is "continue, but ask again next time" — so the question must not follow the user
 * around this visit (a dialogue that reappears on every step is an obstacle, not an offer) but
 * must come back on a fresh load, which is exactly the lifetime of a module variable. Answering
 * either button removes the reason to ask again anyway: continuing has taken the user to their
 * step, and restarting has deleted the draft that `hasDraft()` tests.
 */
let askedThisVisit = false

/** The wizard routes. `/register/success` and `/register/error` are terminal and never ask. */
const IN_FLOW = /^\/register(\/(?!success|error).*)?$/

/**
 * Decides when the sheet appears, and what each answer does.
 *
 * Mounted once from `App.tsx`'s `RootLayout` rather than from a step, for the reason
 * `ToastProvider` is hoisted there too: it has to OUTLIVE the route change it triggers.
 * "กรอกฟอร์มต่อ" navigates to another step, and a gate that lived inside the step it navigated
 * away from would unmount itself mid-exit and delete its own closing animation.
 */
export default function ResumeRegistrationModal() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const sheetRef = useRef<HTMLDivElement>(null)

  const [open, setOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [state, setState] = useState<'open' | 'closed'>('closed')

  /*
   * The question is asked on ENTERING the flow, not on being in it — otherwise every hop between
   * steps would re-satisfy the condition. `wasInFlow` starts false, so a cold load straight onto
   * `/register/team` counts as entering, which is the main case: the user closed the tab and
   * came back to a bookmark.
   */
  const wasInFlow = useRef(false)

  useEffect(() => {
    const inFlow = IN_FLOW.test(pathname)
    const entering = inFlow && !wasInFlow.current
    wasInFlow.current = inFlow

    if (!entering || askedThisVisit || !hasDraft()) return
    /*
     * `askedThisVisit` is deliberately NOT set here, and that is a StrictMode fix rather than a
     * style choice. In development React mounts, runs effects, unmounts and mounts again — so
     * setting a MODULE-level flag on the way to `setOpen(true)` meant the first pass raised the
     * flag, React discarded that pass's state, and the second pass bailed on the flag it had
     * just set. The sheet never appeared at all in dev, while production (no double-invoke)
     * worked — the worst shape a bug can have.
     *
     * Opening is idempotent, so the second pass simply sets the same state again. The flag is
     * raised in `close()` instead, which is the moment it actually describes: the user has been
     * asked and has answered, so do not ask again for the rest of this page load.
     */
    setOpen(true)
    setMounted(true)
  }, [pathname])

  /* the two-frame open — a transition needs a painted start value; see CookieConsent */
  useEffect(() => {
    if (!open || !mounted) return
    let inner = 0
    const outer = requestAnimationFrame(() => {
      inner = requestAnimationFrame(() => setState('open'))
    })
    return () => {
      cancelAnimationFrame(outer)
      cancelAnimationFrame(inner)
    }
  }, [open, mounted])

  /* The sheet outlives `open` by one exit, so the answer the user gave gets an animation. */
  const close = () => {
    /* asked and answered — every path out of the sheet goes through here (both buttons, the X,
       the scrim and Escape), so this is the one place the suppression belongs. */
    askedThisVisit = true
    setOpen(false)
    setState('closed')
    window.setTimeout(() => setMounted(false), EXIT_MS)
  }

  /*
   * "กรอกฟอร์มต่อ". The values restore themselves — every `useDraftRecord` hydrates from the
   * store on mount, so there is nothing to copy back; all this has to do is put the user on the
   * furthest step they reached. `resumeRoute()` reads that from the draft, so a user who got as
   * far as entrant 2 does not have to walk through four steps of their own answers again.
   */
  const onContinue = () => {
    const to = resumeRoute()
    close()
    if (to !== pathname) navigate(to, { viewTransition: true })
  }

  /*
   * "เริ่มกรอกฟอร์มใหม่". `clearDraft()` wipes storage AND bumps the epoch every draft hook
   * subscribes to, which is what resets any step currently mounted behind the scrim — without
   * that, the inputs under the dialogue would keep the old values and re-persist them on the
   * next keystroke, and the restart would look like it had done nothing.
   *
   * Then back to the start of the flow, because "start the form over" that leaves the user on
   * step 5 with five empty steps behind them is not starting over.
   */
  const onRestart = () => {
    clearDraft()
    close()
    if (pathname !== '/register') navigate('/register', { viewTransition: true })
  }

  useDialogFocus(open && mounted, sheetRef)
  useScrollLock(open)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
    /* `close` is stable enough — it only touches setState, which React guarantees identity for */
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  if (!mounted || typeof document === 'undefined') return null

  return createPortal(
    /*
     * `2074:3350` — the scrim. `z-[70]`, above `ScopeModal`'s and the toasts' `z-[60]`: this is
     * the only dialogue on the site that can be raised without the user having asked for it, so
     * it must not arrive underneath something already on screen.
     *
     * The padding is the sheet's breathing room, ramped 16 → 24. It is what makes `max-h-full`
     * on the sheet mean "as tall as the viewport minus a margin", so a phone in landscape scrolls
     * the sheet's own body instead of pushing it off screen.
     */
    <div
      data-state={state}
      onClick={close}
      className="resume-scrim fixed inset-0 z-[70] flex items-center justify-center bg-[rgba(194,194,194,0.3)] backdrop-blur-[10px]"
      style={{ padding: ramp(16, 24) }}
    >
      <Sheet
        state={state}
        sheetRef={sheetRef}
        onContinue={onContinue}
        onRestart={onRestart}
        onDismiss={close}
      />
    </div>,
    document.body,
  )
}
