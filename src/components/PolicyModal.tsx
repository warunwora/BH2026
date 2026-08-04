import { useEffect, useRef, useState } from 'react'
import type { PolicyBlock, PolicyDocument } from '../privacyPolicy'

const ARROW_DOWN = '/assets/figma/b5fa6d1d1c4352d0d01420816b8777fe81ff5920.svg'

/**
 * Matches the closing `.auth-modal-sheet` transition in styles/auth-motion.css. The exit
 * is deliberately shorter than the 300ms entrance: arriving is an event, leaving should
 * get out of the way.
 */
const EXIT_MS = 200

function Block({ block }: { block: PolicyBlock }) {
  if (typeof block === 'string') {
    return <p className="w-full text-[16px] leading-[1.6] font-light">{block}</p>
  }

  // list of bullets that each carry their own sub-bullets
  if (typeof block[0] === 'object') {
    return (
      <ul className="w-full list-disc ps-[24px] text-[16px] leading-[1.6] font-light">
        {(block as { bullet: string; sub: string[] }[]).map((item) => (
          <li key={item.bullet}>
            {item.bullet}
            <ul className="list-disc ps-[24px]">
              {item.sub.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    )
  }

  return (
    <ul className="w-full list-disc ps-[24px] text-[16px] leading-[1.6] font-light">
      {(block as string[]).map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  )
}

export default function PolicyModal({
  document: doc,
  origin,
  onAccept,
  onDecline,
}: {
  /** `null` closes the modal. */
  document: PolicyDocument | null
  /**
   * Viewport point of the control that opened the sheet, so it can grow out of that row
   * and shrink back into it. Optional: without it the sheet scales from its own centre,
   * which is the right default for a dialogue with no trigger to be anchored to.
   */
  origin?: { x: number; y: number } | null
  onAccept: () => void
  onDecline: () => void
}) {
  const bodyRef = useRef<HTMLDivElement>(null)
  const sheetRef = useRef<HTMLDivElement>(null)

  /*
   * The sheet has to outlive `document` by one exit animation, so the modal keeps its own
   * mount flag and renders the last document it was given while it is leaving. `state`
   * flips a frame after mount (and back before unmount) — the transition needs a painted
   * start value, which is what the extra frame buys.
   */
  const shownRef = useRef<PolicyDocument | null>(null)
  if (doc) shownRef.current = doc
  const shown = shownRef.current

  const [mounted, setMounted] = useState(false)
  const [state, setState] = useState<'open' | 'closed'>('closed')

  useEffect(() => {
    if (doc) {
      setMounted(true)
      const frame = requestAnimationFrame(() => {
        bodyRef.current?.scrollTo({ top: 0 })
        /*
         * `transform-origin` has to be in place before the opening transition starts, and
         * it can only be worked out here: it is the trigger's point expressed in the
         * sheet's own box, which does not exist until the sheet has been laid out. Two
         * writes of a custom property on one element, once per open — not per frame.
         */
        const sheet = sheetRef.current
        if (sheet && origin) {
          const box = sheet.getBoundingClientRect()
          sheet.style.setProperty('--auth-origin-x', `${origin.x - box.left}px`)
          sheet.style.setProperty('--auth-origin-y', `${origin.y - box.top}px`)
        }
        setState('open')
      })
      return () => cancelAnimationFrame(frame)
    }
    setState('closed')
    const timer = window.setTimeout(() => setMounted(false), EXIT_MS)
    return () => window.clearTimeout(timer)
  }, [doc, origin])

  // close on Escape and lock background scroll while open
  useEffect(() => {
    if (!doc) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onDecline()
    }
    window.document.addEventListener('keydown', onKey)
    const prev = window.document.body.style.overflow
    window.document.body.style.overflow = 'hidden'
    return () => {
      window.document.removeEventListener('keydown', onKey)
      window.document.body.style.overflow = prev
    }
  }, [doc, onDecline])

  if (!mounted || !shown) return null

  return (
    /* Figma overlays every dialog on a light grey scrim that blurs the page behind it */
    <div
      data-state={state}
      className="auth-modal-scrim fixed inset-0 z-50 flex items-center justify-center bg-[rgba(194,194,194,0.3)] p-4 backdrop-blur-[5px] lg:p-25"
      onClick={onDecline}
    >
      {/* Figma 708:2239 — a 1000x823 sheet, 24 of padding, 32 between header, body and footer */}
      <div
        ref={sheetRef}
        role="dialog"
        aria-modal="true"
        aria-label={shown.title}
        data-state={state}
        onClick={(e) => e.stopPropagation()}
        className="auth-modal-sheet flex max-h-full w-full max-w-[1000px] flex-col gap-8 rounded-[32px] border border-[#dcdcdc] bg-white p-6 lg:h-[823px]"
      >
        {/* the three regions settle in sequence behind the sheet — see `.auth-modal-part` */}
        <header className="auth-modal-part flex w-full shrink-0 items-center gap-4">
          <img src={shown.icon} alt="" aria-hidden className="size-[40px] shrink-0" />
          <div className="flex min-w-0 flex-1 flex-col items-start justify-center">
            <p className="text-[28px] leading-[1.4] font-medium">{shown.title}</p>
            <p className="text-[18px] leading-normal text-gray-1">{shown.subtitle}</p>
          </div>
        </header>

        <div
          ref={bodyRef}
          className="auth-modal-part flex min-h-0 w-full flex-1 flex-col items-start gap-6 overflow-y-auto pr-2"
        >
          {shown.effective && <p className="w-full text-[20px] leading-[1.4]">{shown.effective}</p>}
          {shown.sections.map((section) => (
            <section key={section.title} className="flex w-full flex-col items-start gap-4">
              <h3 className="w-full text-[24px] leading-[1.4]">{section.title}</h3>
              {section.body.map((block, i) => (
                <Block key={i} block={block} />
              ))}
            </section>
          ))}
        </div>

        <footer className="auth-modal-part flex w-full shrink-0 flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          {shown.downloadable ? (
            <button
              type="button"
              className="mm-press flex shrink-0 items-center justify-center gap-[12px] rounded-[12px] bg-[#efefef] py-3 pr-6 pl-4 text-[20px] leading-[1.4] transition-colors hover:bg-[#e2e2e2]"
            >
              <span className="mm-icon-pop relative block size-[24px] shrink-0 overflow-clip">
                <img
                  src={ARROW_DOWN}
                  alt=""
                  aria-hidden
                  className="absolute inset-[12.54%_22.35%_14.08%_22.33%] block"
                />
              </span>
              ดาวน์โหลด
            </button>
          ) : (
            /* the privacy sheet right-aligns its two buttons with nothing beside them */
            <span className="hidden sm:block" />
          )}

          <div className="flex shrink-0 items-center gap-4">
            <button
              type="button"
              onClick={onDecline}
              className="mm-press rounded-[12px] bg-[#efefef] px-6 py-3 text-[20px] leading-[1.4] transition-colors hover:bg-[#e2e2e2]"
            >
              ไม่ยอมรับ
            </button>
            <button
              type="button"
              onClick={onAccept}
              className="mm-press rounded-[12px] bg-brand-red px-6 py-3 text-[20px] leading-[1.4] text-white transition-opacity hover:opacity-90"
            >
              ยอมรับ
            </button>
          </div>
        </footer>
      </div>
    </div>
  )
}
