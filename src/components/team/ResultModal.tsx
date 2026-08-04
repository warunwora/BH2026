import { useEffect, useState } from 'react'

const CLOSE = '/assets/figma/4bd7505c0eec086659f8bce6f796799c7aa38350.svg'

/**
 * Matches the closing `.auth-modal-sheet` transition in styles/auth-motion.css — shorter
 * than the entrance, because leaving should get out of the way.
 */
const EXIT_MS = 200

/**
 * Outcome dialog shown over the dashboard once selection results are out.
 *
 * Figma 708:3166 — an 800x823 sheet at y=100, 40 of padding, 32 between the mascot, the
 * message block and the button stack, over a light grey scrim that blurs the page behind it.
 */
export default function ResultModal({
  open,
  image,
  title,
  titleClassName = '',
  lines,
  actions,
  onClose,
}: {
  open: boolean
  image: string
  title: string
  titleClassName?: string
  lines: string[]
  actions?: React.ReactNode
  onClose: () => void
}) {
  /*
   * Kept mounted for one exit animation after `open` goes false, so dismissing the sheet
   * animates too. `state` flips a frame after mount — the transition needs a painted
   * start value to move away from.
   */
  const [mounted, setMounted] = useState(false)
  const [state, setState] = useState<'open' | 'closed'>('closed')

  useEffect(() => {
    if (open) {
      setMounted(true)
      const frame = requestAnimationFrame(() => setState('open'))
      return () => cancelAnimationFrame(frame)
    }
    setState('closed')
    const timer = window.setTimeout(() => setMounted(false), EXIT_MS)
    return () => window.clearTimeout(timer)
  }, [open])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [open, onClose])

  if (!mounted) return null

  return (
    <div
      data-state={state}
      className="auth-modal-scrim fixed inset-0 z-50 overflow-y-auto bg-[rgba(194,194,194,0.3)] backdrop-blur-[5px]"
      onClick={onClose}
    >
      <div className="flex min-h-full flex-col items-center justify-center px-4 py-6 lg:block lg:p-0">
        <div
          role="dialog"
          aria-modal="true"
          aria-label={title}
          data-state={state}
          onClick={(e) => e.stopPropagation()}
          className="auth-modal-sheet relative flex w-full max-w-[800px] flex-col items-center justify-center gap-6 rounded-[32px] border border-[#dcdcdc] bg-white p-6 lg:mx-auto lg:mt-[100px] lg:mb-[101px] lg:h-[823px] lg:w-[800px] lg:gap-8 lg:p-10"
        >
          <button
            type="button"
            onClick={onClose}
            aria-label="ปิด"
            className="mm-press-icon absolute top-[16px] right-[16px] size-[32px] overflow-clip transition-opacity hover:opacity-70 lg:top-[31px] lg:right-[31px]"
          >
            <img src={CLOSE} alt="" aria-hidden className="absolute inset-0 block size-full" />
          </button>

          {/*
           * The mascot, the message and the buttons settle one after another behind the
           * sheet rather than with it: this dialogue is a result, and a stack that arrives
           * in sequence reads as an announcement where a single plate reads as a panel
           * being swapped in. See `.auth-modal-part` in styles/auth-motion.css.
           *
           * The close button is deliberately not a part — it must be pressable the instant
           * the sheet is there.
           */}
          <img
            src={image}
            alt=""
            aria-hidden
            className="auth-modal-part size-[200px] shrink-0 object-cover sm:size-[302px]"
          />

          <div className="auth-modal-part flex w-full flex-col items-center gap-4 lg:gap-6">
            <h2
              className={`text-center text-[24px] leading-[1.4] font-semibold lg:text-[40px] ${titleClassName}`}
            >
              {title}
            </h2>
            <p className="w-full text-center text-[16px] leading-[1.6] text-gray-2 lg:text-[24px]">
              {lines.map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
            </p>
          </div>

          {actions && (
            <div className="auth-modal-part flex w-full flex-col items-start justify-center gap-4 lg:gap-6">
              {actions}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
