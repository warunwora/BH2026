import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import AuthBackdrop from '../components/AuthBackdrop'
import GoogleLogo from '../components/GoogleLogo'
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
 */
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
      className="relative min-h-dvh overflow-hidden bg-white"
    >
      <div className="flex min-h-dvh flex-col items-center gap-10 p-5 lg:flex-row lg:gap-20">
        <div className="flex w-full flex-1 flex-col items-start gap-10 lg:gap-15 lg:pl-20">
          <Link
            to="/"
            data-rise={0}
            className="auth-rise auth-rise-sm mm-press flex w-full items-center gap-2.5 text-xl leading-[1.4] transition-opacity hover:opacity-70"
          >
            <img
              src="/assets/figma/ea51a69c788a5d0d5d7479c1fff987eee5a19fe5.svg"
              alt=""
              aria-hidden
              className="size-6"
            />
            หน้าหลัก
          </Link>

          <div className="flex w-full flex-col gap-8">
            <img
              src="/assets/figma/95f39e217dc710a779c3c0b6cf30b3a377d857f5.png"
              alt="BangMod Hackathon 2026"
              data-rise={1}
              className="auth-rise auth-rise-sm h-16 w-auto max-w-full object-contain lg:h-20 lg:w-[356px] lg:object-cover"
            />

            <div data-rise={2} className="auth-rise auth-rise-sm flex w-full flex-col gap-3">
              <h1 className="w-full text-[28px] leading-[normal] font-bold tracking-[0.374px] lg:text-[32px]">
                ลงทะเบียนเข้าแข่งขัน
              </h1>
              <p className="w-full text-lg leading-[normal] text-gray-2 lg:text-xl">
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
              className="auth-rise auth-rise-sm mm-press flex h-15 w-full items-center justify-center gap-5 rounded-[20px] bg-[#f6f6f6] px-6 py-4 font-display text-lg leading-[normal] font-semibold transition-colors hover:bg-[#ececec] lg:text-xl"
            >
              <GoogleLogo />
              เข้าสู่ระบบด้วย Google
            </button>

            <Link
              to="/guide"
              data-rise={4}
              className="auth-rise auth-rise-sm mm-press inline-block w-full text-base leading-[normal] font-light text-gray-2 underline-offset-4 hover:underline"
            >
              ข้อกำหนด
            </Link>
          </div>
        </div>

        {/* purely decorative, and its tall-narrow composition doesn't survive stacking */}
        <div className="relative hidden h-[984px] w-[694px] shrink-0 lg:block">
          <AuthBackdrop />
        </div>
      </div>
    </div>
  )
}
