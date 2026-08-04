import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ColourBlockBackdrop } from './AuthBackdrop'
import { useOwnArrival } from './form/wizardNav'
import GoogleLogo from './GoogleLogo'

/**
 * Figma 708:1174 / 708:2022 / 708:2260 — the colour-block page shared by the
 * registration gate and the success/error results. Unlike sign-in these frames carry
 * no food decoration at all, just the three page-filling blocks.
 *
 * The 900 column is Figma's `left-[270px] right-[270px]` inset of the 1440 frame, and
 * its top row sits at 60. Cards are bottom-open (`rounded-t-[32px]`) and run to the
 * fold, so they stretch rather than carrying a fixed 850 height.
 */
export default function AuthPageShell({
  muted = false,
  children,
}: {
  /** The error screen swaps the brand blocks for grey ones. */
  muted?: boolean
  children: ReactNode
}) {
  return (
    <div className="relative flex min-h-dvh flex-col overflow-hidden bg-white">
      <ColourBlockBackdrop muted={muted} />

      <div className="relative mx-auto flex w-full max-w-[900px] flex-1 flex-col px-4 pt-8 lg:px-0 lg:pt-15">
        {/*
         * `auth-topbar` is shared with every wizard step: the "หน้าหลัก" link and the
         * account chip are the same two controls in the same corner all the way through
         * the flow, so they are one object the browser carries rather than two that
         * crossfade (styles/auth-motion.css).
         */}
        <div className="auth-topbar flex items-center justify-between gap-4">
          <Link
            to="/"
            className="mm-press flex flex-1 items-center gap-3 text-xl leading-[1.4] text-white transition-opacity hover:opacity-80"
          >
            <img
              src="/assets/figma/41418d29fd1f773c0f14bc317b19bd65b6f49ee8.svg"
              alt=""
              aria-hidden
              className="size-6"
            />
            หน้าหลัก
          </Link>

          <button
            type="button"
            className="mm-press flex shrink-0 items-center justify-center gap-4 rounded-[12px] bg-white py-3 pr-4 pl-5 text-xl leading-[1.4] transition-opacity hover:opacity-90"
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
        </div>

        {children}
      </div>
    </div>
  )
}

/**
 * Shared geometry of the red pill that closes both result cards.
 *
 * `mm-press` because this is the last control in the whole flow and it was the only
 * pressable thing in it with no press feedback at all — the wizard's step buttons and the
 * gate's CTA both scale, so a pill that did not read as unresponsive next to them.
 */
export const RESULT_ACTION =
  'mm-press flex h-15 w-full items-center justify-center gap-5 rounded-[20px] bg-brand-red px-6 py-4 font-display text-lg leading-[normal] font-semibold text-white transition-opacity hover:opacity-90 lg:text-xl'

/**
 * The success/error card: a 302 illustration, a centred message and one full-width
 * action, all centred in the 850-tall card.
 *
 * `auth-sheet` is the same white plate the gate and the wizard use, so arriving here is
 * the plate changing contents rather than a new screen. Inside it the three regions rise
 * in sequence — a result is the one screen in this flow the user reaches once, which is
 * exactly where the animation notes allow a moment of delight.
 *
 * `data-auth-entrance` is gated on `useOwnArrival()`, which is the same guard the gate's sheet
 * spring takes and the one place it had been skipped. This element carries the `auth-sheet`
 * view-transition name *and* the entrance, so arriving through the submit morph three
 * timelines ran over one subtree: the group resized the snapshot over 520ms, the new snapshot
 * faded over 380ms, and the children below tried to travel 48px and 14px over 560ms while the
 * group was still scaling them — which distorts the rise distance by whatever the group's
 * current scale happens to be. Through the morph the plate's own choreography carries the
 * arrival; on a direct load or a reload the cascade still plays. No timing changed.
 */
export function ResultCard({
  image,
  title,
  titleClassName = '',
  lines,
  action,
}: {
  image: string
  title: string
  titleClassName?: string
  lines: string[]
  action: ReactNode
}) {
  const own = useOwnArrival()

  return (
    <div
      {...(own ? { 'data-auth-entrance': '' } : {})}
      className="auth-sheet mt-8 flex min-h-[850px] flex-1 flex-col items-center justify-center gap-10 rounded-t-[32px] bg-white p-6 shadow-soft lg:mt-[70px] lg:p-10"
    >
      {/*
       * `auth-pop`, not `auth-rise`: the mascot is the illustration the whole screen is
       * built around and it was sliding in on exactly the animation a nav link gets. It
       * settles instead — up 32px from 90%, through a 2% overshoot — which is the same
       * restraint as the sheet spring's 0.77%. `data-rise` stays because it still records
       * the mascot's place at the head of the cascade.
       */}
      <img
        src={image}
        alt=""
        aria-hidden
        data-rise={0}
        className="auth-pop w-[220px] shrink-0 object-cover lg:size-[302px]"
      />

      <div data-rise={2} className="auth-rise auth-rise-sm flex w-full flex-col items-center gap-6">
        <h1
          className={`text-center text-3xl leading-[1.4] font-semibold lg:text-[40px] ${titleClassName}`}
        >
          {title}
        </h1>
        <p className="text-center text-lg leading-[1.6] lg:text-xl">
          {lines.map((line) => (
            <span key={line} className="block">
              {line}
            </span>
          ))}
        </p>
      </div>

      <div data-rise={4} className="auth-rise auth-rise-sm w-full">
        {action}
      </div>
    </div>
  )
}
