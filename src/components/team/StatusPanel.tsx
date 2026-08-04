import {
  DISCORD_CARD,
  STATUS_STEPS,
  TEAM,
  type StatusStep,
  type StepTone,
  type TeamStatus,
} from '../../teamData'

const ICON = {
  check: '/assets/figma/dbe84d89c90a467bc28f8077de53cd3518786684.svg',
  dot16: '/assets/figma/f498dfdf3c14fe0850c950e35fdc12de525457bf.svg',
  dot20: '/assets/figma/f8d4363b76896ccf0aac59b3c9c49ccf09ea3174.svg',
  alert: '/assets/figma/e2ca3f8c81dc8ab3ede0613c50c57734946678d7.svg',
  close: '/assets/figma/36f13a184206ab27dedb4992d9d5b63a3a3f8cb6.svg',
  facebook: '/assets/figma/5c123061e989ef51ad620866b56d6b0d63f2dc8c.svg',
  instagram: '/assets/figma/ec7b502700ce8ac7dfcae9fe51fa39883e998853.svg',
  discord: '/assets/figma/9769d281893b12798e8f55f41d05010cbd556d76.svg',
}

/**
 * Badge skin per tone. Figma tints the pill with the tone colour at 10% and rings it at 20%,
 * and the glyph inside is always the tone-coloured export rather than a recoloured icon.
 */
const BADGE: Record<StepTone, { skin: string; icon: string; glyph: number }> = {
  ok: {
    skin: 'bg-[rgba(148,180,94,0.1)] border-[rgba(148,180,94,0.2)]',
    icon: ICON.check,
    glyph: 20,
  },
  pending: {
    skin: 'bg-[rgba(215,154,78,0.1)] border-[rgba(215,154,78,0.2)]',
    icon: ICON.dot20,
    glyph: 20,
  },
  alert: {
    skin: 'bg-[rgba(192,86,62,0.1)] border-[rgba(192,86,62,0.2)]',
    icon: ICON.alert,
    glyph: 20,
  },
  failed: {
    skin: 'bg-[rgba(192,86,62,0.1)] border-[rgba(192,86,62,0.2)]',
    icon: ICON.close,
    glyph: 16,
  },
}

const LABEL_COLOR: Record<StepTone, string> = {
  ok: 'text-brand-green',
  pending: 'text-brand-yellow',
  alert: 'text-brand-red',
  failed: 'text-brand-red',
}

const SOCIALS = [
  { icon: ICON.facebook, label: 'Facebook' },
  { icon: ICON.instagram, label: 'Instagram' },
]

/**
 * The 28px badge drops to the 16px glyph, keeping Figma's 6px ring padding. The wrapper is
 * a fixed 32px box at full size and an auto-width 32-tall box when compact, exactly as the
 * design's "Layout Container" is authored.
 *
 * A badge is the one thing on this screen that changes meaning while the user is looking at
 * it — a step goes from pending to done — and it used to teleport: the pill's tint class and
 * the glyph asset both swapped in a single frame, so a review completing read as a glitch
 * rather than as progress. Two fixes, both cheap:
 *
 * - `transition-colors` on the pill, so the 10% fill and 20% ring interpolate to the new
 *   tone instead of cutting. This covers every tone pair.
 * - `mm-swap` on the pill, with the tone's own glyph and the check both permanently mounted
 *   in one grid cell. Nothing mounts or unmounts, so the completing transition — pending,
 *   alert or failed → ok, the direction a status actually travels — cross-fades on
 *   micro-motion's shared curve, the same way the copy button's tick does. Both layers are
 *   given the same box, so the pill's size is byte-for-byte what it was before.
 */
function Badge({ tone, compact = false }: { tone: StepTone; compact?: boolean }) {
  const { skin, icon } = BADGE[tone]
  const small = compact || tone === 'failed'
  const glyph = small ? 16 : BADGE[tone].glyph
  const src = small && tone === 'pending' ? ICON.dot16 : icon
  const done = tone === 'ok'
  const box = { width: glyph, height: glyph }

  return (
    <span
      className={`flex shrink-0 items-center p-[4px] ${small ? 'h-[32px]' : 'size-[32px] justify-center'}`}
    >
      <span
        data-on={done}
        className={`mm-swap shrink-0 rounded-full border p-[6px] transition-colors ${skin}`}
      >
        <img src={src} alt="" aria-hidden className="mm-swap-off" style={box} />
        <img src={ICON.check} alt="" aria-hidden className="mm-swap-on" style={box} />
      </span>
    </span>
  )
}

function Row({ title, label, tone }: { title: string; label: string; tone: StepTone }) {
  return (
    <div className="flex w-full items-center gap-[8px]">
      <div className="flex min-w-0 flex-1 flex-col justify-center">
        <p className="fl-14 leading-normal">{title}</p>
        <p className="fl-12 leading-normal text-gray-2">ชื่อ-สกุล</p>
      </div>
      <p className={`shrink-0 fl-14 leading-normal ${LABEL_COLOR[tone]}`}>{label}</p>
    </div>
  )
}

/**
 * Figma's hairline is an inside stroke, so it must not grow the card past its 59px content
 * height the way a CSS border would — an inset ring draws it in place instead.
 *
 * `rise` continues the page's entrance ladder into the panel so the timeline builds
 * downward, one step after another, rather than the two-to-four steps landing as one slab.
 * It is the shared auth cascade — see pages/MyTeam.tsx — at the short 14px distance, since
 * a step is a line of copy and not a card.
 */
function Step({ step, rise }: { step: StatusStep; rise: number }) {
  return (
    <div
      className="auth-rise auth-rise-sm flex w-full flex-col gap-[12px] rounded-[12px] p-[10px] shadow-[inset_0_0_0_0.5px_#dcdcdc]"
      data-rise={rise}
    >
      <div className={`flex gap-[12px] ${step.rows ? 'items-start' : 'items-center'}`}>
        <Badge tone={step.tone} compact={step.compact} />

        <div className="flex min-w-0 flex-1 flex-col justify-center gap-[12px]">
          <div className="flex w-full items-center gap-[8px]">
            <div className="flex min-w-0 flex-1 flex-col justify-center">
              <p className="fl-14 leading-normal font-medium">{step.title}</p>
              <p className="fl-12 leading-normal text-gray-2">{TEAM.updatedAt}</p>
            </div>
            {step.label && (
              <p className={`shrink-0 fl-14 leading-normal ${LABEL_COLOR[step.tone]}`}>
                {step.label}
              </p>
            )}
          </div>

          {step.rows?.map((row) => (
            <Row key={row.title} {...row} />
          ))}
        </div>
      </div>

      {step.contact && (
        <>
          <div className="h-0 w-full border-t-[0.5px] border-[#dcdcdc]" />
          <div className="flex w-full flex-col items-start gap-[8px]">
            <p className="fl-12 leading-[1.6] text-gray-2">ติดต่อทีมงาน</p>
            <div className="flex w-full items-center gap-[8px]">
              {SOCIALS.map((social) => (
                <a
                  key={social.label}
                  href="#"
                  aria-label={social.label}
                  className="mm-press flex min-w-0 flex-1 items-center justify-center rounded-[10px] bg-[#f6f6f6] px-[16px] py-[6px] transition-colors hover:bg-[#ececec]"
                >
                  <img src={social.icon} alt="" aria-hidden className="mm-icon-pop size-[24px]" />
                </a>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

/**
 * Figma nests the Discord mark inside a 64:48 box pinned by percentage, so the glyph keeps
 * its own aspect while the outer square stays on the 20/32px grid.
 */
export function DiscordGlyph({ size, src }: { size: number; src: string }) {
  return (
    <span className="relative block shrink-0 overflow-clip" style={{ width: size, height: size }}>
      <span className="absolute top-[21.88%] bottom-[13.13%] left-1/2 block aspect-[64/48] -translate-x-1/2 overflow-clip">
        <img src={src} alt="" aria-hidden className="absolute inset-y-0 right-[1.06%] left-0" />
      </span>
    </span>
  )
}

export default function StatusPanel({
  status,
  showDiscord = false,
}: {
  status: TeamStatus
  /** The qualified dashboard also carries the Discord join card. */
  showDiscord?: boolean
}) {
  return (
    <div className="flex flex-col gap-6">
      {/* Figma: a 400-wide card, 16 of padding, 16 between the header and each step */}
      <div className="flex w-full flex-col items-start rounded-[20px] bg-white p-4 shadow-soft">
        <div className="flex w-full flex-col items-start gap-4">
          <div className="flex w-full flex-col items-start">
            <p className="w-full fl-20 leading-[1.4] font-medium">สถานะ</p>
            <p className="fl-14 leading-normal text-gray-2">อัปเดตล่าสุดเมื่อ {TEAM.updatedAt}</p>
          </div>

          {/* the ladder tops out at 7, which is the last delay auth-motion.css defines */}
          {STATUS_STEPS[status].map((step, i) => (
            <Step key={step.title} step={step} rise={Math.min(i + 3, 7)} />
          ))}
        </div>
      </div>

      {/*
       * The Discord card only exists for a qualified team, and it used to appear and vanish
       * with no transition at all — a 20px-radius card materialising under the status panel
       * in one frame, which reads as a layout bug rather than as a reward being handed over.
       * `mm-card-in` lifts and settles it (280ms, 8px, 0.98 → 1). Only the entrance is
       * animated: the unmount is a route change away, where the page transition owns the
       * exit, so there is nothing here to hold open.
       */}
      {showDiscord && (
        <div className="mm-card-in flex w-full flex-col items-start rounded-[20px] bg-white p-4 shadow-soft">
          <div className="flex w-full flex-col items-start gap-4">
            <div className="flex w-full flex-col items-start">
              <p className="w-full fl-20 leading-[1.4] font-medium">{DISCORD_CARD.title}</p>
              <p className="fl-14 leading-normal text-gray-2">{DISCORD_CARD.subtitle}</p>
            </div>

            <div className="flex w-full items-center gap-[12px] rounded-[12px] p-[10px] shadow-[inset_0_0_0_0.5px_#dcdcdc]">
              <span className="flex size-[32px] shrink-0 items-center justify-center p-[4px]">
                <span className="flex shrink-0 items-center justify-center rounded-full border border-[rgba(88,101,242,0.2)] bg-[rgba(88,101,242,0.1)] p-[6px]">
                  <DiscordGlyph size={20} src={ICON.discord} />
                </span>
              </span>
              <p className="min-w-0 flex-1 fl-14 leading-normal font-medium">
                {DISCORD_CARD.label}
              </p>
              <button
                type="button"
                className="mm-press shrink-0 rounded-[10px] bg-[#f6f6f6] px-[20px] py-[8px] fl-14 leading-normal transition-colors hover:bg-[#ececec]"
              >
                {DISCORD_CARD.action}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
