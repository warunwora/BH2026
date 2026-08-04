import { useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import GoogleLogo from '../GoogleLogo'
import { WizardBackdrop } from '../AuthBackdrop'
import ScrollEdgeEffect from '../ScrollEdgeEffect'
import { authLink, useAuthBackLink, useAuthNavigate } from './wizardNav'

export const TOTAL_STEPS = 5

const CRUMBS = ['ข้อมูลทีม', 'อาจารย์', 'ผู้เข้าแข่งขัน', 'เงื่อนไข']

/** Which breadcrumb is active for each 1-based step. Steps 3 and 4 share a crumb. */
const CRUMB_FOR_STEP = [0, 1, 2, 2, 3]

/**
 * Figma 708:1255 and friends. The wizard sits on #fefdfc inside a 1440 frame with 200
 * of side padding, which gives the 1040 column; the top bar and the form card are two
 * rounded-24 white plates 40 apart.
 *
 * `withTomatoes` is false only on the terms step, which drops the tomato cluster.
 */
export default function WizardShell({
  step,
  children,
  actions,
  overlay,
  withTomatoes = true,
  receded = false,
}: {
  step: number
  children: ReactNode
  actions: ReactNode
  /**
   * Viewport-fixed layers — currently just the terms step's policy modal. They cannot
   * live inside `children`, because the `view-transition-name` on the body wrapper makes
   * that wrapper a containing block for fixed descendants, which would shrink a
   * `fixed inset-0` scrim down to the form column.
   */
  overlay?: ReactNode
  /** The terms step drops the tomato cluster. */
  withTomatoes?: boolean
  /**
   * True while an overlay owns the screen. Apple's rule for a modal task: dim to focus,
   * and push the parent layer back so the two read as separate planes. It rides the
   * content wrapper rather than the root, because a transform on the root would make it
   * the containing block for the overlay's own `fixed` scrim.
   */
  receded?: boolean
}) {
  const activeCrumb = CRUMB_FOR_STEP[step - 1]

  return (
    <div className="relative flex min-h-dvh flex-col bg-[#fefdfc]">
      <WizardBackdrop withTomatoes={withTomatoes} />

      <div
        data-recede={receded}
        className="auth-recede relative z-10 mx-auto flex w-full max-w-[1040px] flex-1 flex-col gap-4 px-4 py-8 lg:gap-10 lg:px-0 lg:pt-15 lg:pb-0"
      >
        {/*
         * `auth-topbar` / `wizard-progress` / `wizard-body` are view-transition names
         * (styles/auth-motion.css). Naming the chrome lifts it out of the page-level
         * crossfade so it holds perfectly still between steps and only the form travels.
         * `auth-topbar` is shared with the gate and the result screens, where the same
         * two controls sit in the same corner — so the account chip is one object for the
         * whole flow rather than one per screen.
         */}
        <header className="auth-topbar flex items-center justify-between gap-4 rounded-[24px] bg-white p-4 shadow-soft lg:p-5">
          <Link to="/" className="mm-press">
            <img
              src="/assets/figma/95f39e217dc710a779c3c0b6cf30b3a377d857f5.png"
              alt="BangMod Hackathon 2026"
              className="h-10 w-auto object-cover lg:h-[50px] lg:w-[222px]"
            />
          </Link>
          <button
            type="button"
            className="mm-press flex items-center justify-center gap-4 rounded-[12px] border border-[#dcdcdc] bg-white py-3 pr-4 pl-5 text-lg leading-[1.4] transition-colors hover:border-brand-red lg:text-xl"
          >
            <GoogleLogo />
            <span className="hidden sm:inline">ชื่อบัญชีผู้ใช้</span>
            <img
              src="/assets/figma/da1c84a7a51ab6256b69963fbe9c03c1607713d3.svg"
              alt=""
              aria-hidden
              className="size-6"
            />
          </button>
        </header>

        {/*
         * The card's bottom padding is 0 because the action bar supplies it: Figma pins
         * that bar to the card's bottom edge on its own 20 inset, so it cancels the
         * card's 40 side padding and stays 20 below the content.
         */}
        {/*
         * `auth-sheet` is the one white plate that runs the whole flow: it is the gate's
         * requirements card before this and the success/error card after it, so the plate
         * persists across every hop and only its contents change. Between steps its box
         * is pinned (`animation-duration: 0s` on the group) so the form inside can snap
         * to the new step's height without hanging out of a plate still resizing.
         */}
        <div className="auth-sheet flex flex-1 flex-col rounded-[24px] bg-white p-6 pb-0 shadow-soft lg:min-h-[832px] lg:p-10 lg:pb-0">
          <div className="flex flex-1 flex-col gap-6 lg:gap-10">
            {/* title and crumbs sit flush in Figma — no gap between them */}
            <div className="flex flex-col items-start">
              <h1 className="text-2xl leading-[1.4] font-semibold lg:text-[32px]">
                ลงทะเบียนเข้าแข่งขัน
              </h1>
              <nav
                aria-label="ขั้นตอน"
                className="flex flex-wrap items-start gap-2 text-base leading-[normal] lg:text-lg"
              >
                {CRUMBS.map((crumb, i) => (
                  <span key={crumb} className="flex gap-2">
                    <span className={i <= activeCrumb ? 'text-ink' : 'text-gray-2'}>{crumb}</span>
                    {i < CRUMBS.length - 1 && <span className="text-gray-2">&gt;</span>}
                  </span>
                ))}
              </nav>
            </div>

            <div
              className="wizard-progress flex h-2 gap-1 overflow-hidden rounded-[100px]"
              role="progressbar"
              aria-valuenow={step}
              aria-valuemin={1}
              aria-valuemax={TOTAL_STEPS}
              aria-label={`ขั้นตอนที่ ${step} จาก ${TOTAL_STEPS}`}
            >
              {Array.from({ length: TOTAL_STEPS }, (_, i) => (
                /*
                 * The segment this step just reached sweeps in from its left edge instead of
                 * already being filled — the beat that tells the user the step counted.
                 *
                 * `key={i}`, deliberately, where it used to churn the active segment's key to
                 * force a keyframe to replay. That replay was the bug: ถัดไป and ย้อนกลับ are
                 * adjacent, and a double-tap restarted the sweep from zero while the segment
                 * that was mid-sweep snapped to full. `data-filled` drives a *transition*
                 * instead (see `.wizard-progress-fill` in auth-motion.css), which retargets
                 * from wherever the fill currently is; `data-sweep` marks the one segment that
                 * should still draw itself on from empty when the whole bar is freshly mounted,
                 * which is every hop that crosses a route boundary.
                 */
                <span
                  key={i}
                  data-filled={i < step}
                  data-sweep={i === step - 1}
                  className="wizard-progress-fill h-full flex-1 rounded-full bg-[#e6e6e6]"
                />
              ))}
            </div>

            <div className="wizard-body flex flex-1 flex-col">{children}</div>
          </div>

          <div className="mt-5 -mx-6 flex items-center justify-between gap-4 rounded-b-[24px] bg-white p-4 lg:-mx-10 lg:p-5">
            {actions}
          </div>
        </div>
      </div>

      {/*
       * z-0, i.e. under the z-10 content wrapper, on every step. It used to sit at z-30 on
       * the first four, on the reading that Figma softens the top bar too — but 708:1255
       * renders that bar crisp, and over the live page the band washed the logo and the
       * account chip out at scroll 0, before anything had even scrolled under them. What
       * the effect is for is the decorative backdrop passing beneath the chrome.
       */}
      {/*
       * Height tracks the top bar it softens — 114px at 375 up to Figma's 160 at 1440. Held at
       * a flat 160 it overhung the bar by 46px on a phone and the ramp's tail ended on a hard
       * line across the form below.
       */}
      <ScrollEdgeEffect className="fixed inset-x-0 top-0 z-0 h-[calc(114px_+_46*var(--fl))]" />

      {overlay}
    </div>
  )
}

/**
 * Figma's step buttons: rounded-12, a 12 gap and asymmetric padding around the icon.
 *
 * The press is not from Figma — a pressable control has to confirm it heard the press. It
 * used to be typed out here as `transition-[opacity,transform] duration-[160ms] ease-out
 * active:scale-[0.97]`, which is `mm-press` written by hand at a different duration to the
 * same gesture everywhere else in the app; the class is the one definition, at 110ms, and it
 * carries its own reduced-motion guard.
 */
const STEP_BUTTON =
  'mm-press flex items-center justify-center gap-3 rounded-[12px] bg-brand-red py-4 text-lg leading-[1.4] font-medium text-white transition-opacity hover:opacity-90 lg:text-xl'

export function BackButton({ to }: { to: string }) {
  const authBack = useAuthBackLink()

  return (
    <Link {...authBack(to, 'back')} className={`${STEP_BUTTON} pr-6 pl-4`}>
      <img
        src="/assets/figma/41418d29fd1f773c0f14bc317b19bd65b6f49ee8.svg"
        alt=""
        aria-hidden
        className="size-6"
      />
      ย้อนกลับ
    </Link>
  )
}

export function NextButton({ to, label = 'ถัดไป' }: { to: string; label?: string }) {
  return (
    <Link {...authLink(to, 'forward')} className={`${STEP_BUTTON} ml-auto pr-4 pl-6`}>
      {label}
      <img
        src="/assets/figma/a275512325b630305418a611fed5319ba90acfc8.svg"
        alt=""
        aria-hidden
        className="size-6"
      />
    </Link>
  )
}

/**
 * The terms step's submit: same pill, no icon, so the padding is symmetric. It flags
 * `submit` rather than `forward` because it leaves the wizard — the pasta has to spill
 * back out and the colour blocks have to return (styles/auth-motion.css).
 *
 * A `<button>` rather than a `<Link>`, because pressing the control that submits a
 * registration should not be indistinguishable from following a link. It still only
 * navigates — there is no network call in this flow yet, and inventing one is not this
 * track's job — but it now flips `data-busy`/`aria-busy` on the press, which swaps the label
 * for a spinner in place and takes pointer events off the pill so the submit cannot be fired
 * twice. The moment a real handler exists, the pending state it needs is already here.
 *
 * The spinner is two arcs of one 20px circle rather than a full ring: the gap is what makes
 * rotation legible at all. `relative` plus an absolutely-positioned spinner so the swap
 * cannot change the pill's width — a button that resizes as it commits reads as a layout bug.
 */
export function SubmitButton({ to, label }: { to: string; label: string }) {
  const go = useAuthNavigate()
  const [busy, setBusy] = useState(false)

  return (
    <button
      type="button"
      data-busy={busy}
      aria-busy={busy}
      onClick={() => {
        setBusy(true)
        go(to, 'submit')
      }}
      className={`auth-submit relative ${STEP_BUTTON} ml-auto px-6`}
    >
      <span className="auth-submit-label">{label}</span>
      <span
        aria-hidden
        className="auth-submit-spin pointer-events-none absolute inset-0 flex items-center justify-center"
      >
        <svg viewBox="0 0 20 20" fill="none" className="auth-submit-spinner size-5">
          <path
            d="M10 2a8 8 0 0 1 8 8"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="M10 18a8 8 0 0 1-8-8"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </span>
    </button>
  )
}
