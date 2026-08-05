import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import GoogleLogo from '../components/GoogleLogo'
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

const LOGO = '/assets/figma/95f39e217dc710a779c3c0b6cf30b3a377d857f5.png'
const CHEVRON = '/assets/figma/da1c84a7a51ab6256b69963fbe9c03c1607713d3.svg'
const COPY = '/assets/figma/85282b0baf589ceb0eb17e9e2d027684e76a4e8b.svg'
const DISCORD_32 = '/assets/figma/8353328712043444b22094d1885d9862cc9e8a45.svg'
const INSTAGRAM_32 = '/assets/figma/eeb6468e0956000a4bf03f129dbb014eca33f4d8.svg'

function isStatus(value: string | null): value is TeamStatus {
  return STATUS_VARIANTS.includes(value as TeamStatus)
}

/** The indicator is drawn at this width and scaled to each tab, so only transform animates. */
const BAR_W = 100

/** How long the copy button holds its tick before returning to the copy glyph. */
const COPIED_MS = 1600

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

export default function MyTeam() {
  const [params] = useSearchParams()
  const statusParam = params.get('status')
  const status: TeamStatus = isStatus(statusParam) ? statusParam : 'reviewing'

  // the advisor tab is the one shown in the document-issue design
  const [active, setActive] = useState(status === 'issue' ? MEMBERS.length - 1 : 0)
  const [modal, setModal] = useState(params.get('modal'))
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
      setBar({ x: tab.offsetLeft, y: tab.offsetTop + tab.offsetHeight - 2, w: tab.offsetWidth })
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
      <div className="shell-dash relative z-20 mx-auto flex w-full max-w-[1440px] flex-col items-center gap-[calc(24px_+_16*var(--fl))] pt-[calc(24px_+_36*var(--fl))] pb-16">
        <header
          className="auth-rise flex w-full items-center justify-between gap-4 rounded-3xl bg-white p-[calc(16px_+_4*var(--fl))] shadow-soft"
          data-rise="0"
        >
          <Link to="/" className="mm-press shrink-0" viewTransition>
            <img
              src={LOGO}
              alt="BangMod Hackathon 2026"
              className="h-[calc(40px_+_10*var(--fl))] w-auto"
            />
          </Link>
          <button
            type="button"
            className="mm-press flex shrink-0 items-center justify-center gap-4 rounded-[12px] border border-[#dcdcdc] py-3 pr-4 pl-5 transition-colors hover:border-brand-red"
          >
            <GoogleLogo className="size-[24px]" />
            <span className="hidden fl-20 leading-[1.4] sm:inline">ชื่อบัญชีผู้ใช้</span>
            <img src={CHEVRON} alt="" aria-hidden className="size-[24px]" />
          </button>
        </header>

        {/* Figma 708:2317 splits the row 816 / 400 with a 24 gutter */}
        <div className="flex w-full flex-col items-start gap-6 lg:flex-row">
          <div className="flex w-full min-w-0 flex-1 flex-col items-start gap-8 rounded-[20px] bg-white p-4 shadow-soft">
            <div className="auth-rise auth-rise-sm flex w-full items-start gap-4" data-rise="1">
              <div className="aspect-square shrink-0 self-stretch rounded-2xl bg-[#ebebeb]" />
              <div className="flex min-w-0 flex-1 flex-col items-start gap-4">
                <h1 className="fl-24 leading-[1.4] font-medium">{TEAM.name}</h1>
                <p className="flex items-center gap-[12px] fl-18 leading-[1.4]">
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
                    className="mm-swap mm-press-icon size-[20px] transition-opacity hover:opacity-60"
                  >
                    <img src={COPY} alt="" aria-hidden className="mm-swap-off size-[20px]" />
                    <Tick className="mm-swap-on size-[20px] text-brand-green" />
                  </button>
                </p>
                <p className="flex flex-wrap items-start gap-[12px] fl-18 leading-[1.4]">
                  <span className="text-gray-2">สถานศึกษา</span>
                  <span>{TEAM.school}</span>
                </p>
              </div>
            </div>

            <div
              ref={tabsRef}
              role="tablist"
              className="auth-rise relative flex flex-wrap items-center gap-2"
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
                    className={`mm-press flex shrink-0 items-start gap-2 px-3 py-2 fl-18 leading-normal transition-colors ${
                      on ? 'font-semibold' : 'rounded-2xl bg-white text-gray-2'
                    }`}
                  >
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

          <div className="auth-rise w-full shrink-0 lg:w-[400px]" data-rise="4">
            <StatusPanel status={status} showDiscord={status === 'qualified'} />
          </div>
        </div>
      </div>

      <ResultModal
        open={modal === 'qualified'}
        {...QUALIFIED_MODAL}
        onClose={() => setModal(null)}
        actions={
          <>
            <ModalButton
              href="#"
              className="bg-[#5865f2] text-white"
              icon={<DiscordGlyph size={32} src={DISCORD_32} />}
            >
              รับรหัสเข้าร่วม Discord{' '}
            </ModalButton>
            <ModalButton
              href="#"
              className="bg-[#f6f6f6]"
              icon={<img src={INSTAGRAM_32} alt="" aria-hidden className="size-[32px] shrink-0" />}
            >
              แชร์ไปยัง Instagram
            </ModalButton>
          </>
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
