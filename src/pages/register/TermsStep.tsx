import { useState } from 'react'
import WizardShell, { NextButton } from '../../components/form/WizardShell'
import { CHECK_MARK, CheckMark } from '../../components/form/Field'
import PolicyModal from '../../components/PolicyModal'
import { AGREEMENT_LINKS, CONSENTS } from '../../registrationData'

/**
 * Figma `2053:108` at 1440 — a full redesign of this step, and now the FIRST one: the wizard
 * used to close on เงื่อนไข (step 5), Figma now opens on it (step 1, `WizardShell`'s crumb order
 * follows). The old three-card "เอกสารบังคับ" section (each opening its own document in a
 * modal) is gone, replaced by one illustration plate and a single agreement checkbox whose
 * sentence links all four documents inline. The "ความยินยอม" section below it keeps the same
 * bordered-row / ยอมรับ-ไม่ยอมรับ shape this step already had.
 *
 * No Figma mobile frame was given for this redesign (the six links are all 1440 desktop
 * frames), so every length below is either a flat value straight from the frame or, where the
 * file already carries a verified two-anchor ramp for that exact rank (the 20px title, the
 * checkbox itself), the existing ramp — nothing here is a new guessed anchor.
 */

/**
 * The fanned document stack above the checkbox (Figma `Frame 2043683181`, 928x100, clipped).
 * All three cards are the SAME size, rotated a negligible −0.039° (i.e. visually flat), and
 * staggered by a flat (79, 12) each step — the "fan" is entirely the offset, not the rotation.
 * The colour goes darkest-at-back to lightest-at-front, which is Figma's own front-to-back
 * order (the rectangle drawn LAST, most offset, is the lightest).
 *
 * Expressed as percentages of the clip window rather than a px ramp: the plate is `w-full`
 * inside the bordered box, so sizing every card as a fraction of that same box scales it
 * correctly at any width without needing a second Figma anchor.
 */
const CLIP = { width: 928, height: 100 }
const CARD = { width: 769.2947, height: 129.553 }
const AGREEMENT_CARDS = [
  { color: '#cd7865', x: 0, y: 1.00013 },
  { color: '#d99a8b', x: 79, y: 13 },
  { color: '#e6bbb2', x: 158, y: 24.997 },
]

function AgreementStack() {
  return (
    <div
      aria-hidden
      className="relative w-full overflow-hidden"
      style={{ aspectRatio: `${CLIP.width} / ${CLIP.height}` }}
    >
      {AGREEMENT_CARDS.map((card, i) => (
        <span
          key={i}
          className="absolute rounded-xl"
          style={{
            left: `${(card.x / CLIP.width) * 100}%`,
            top: `${(card.y / CLIP.height) * 100}%`,
            width: `${(CARD.width / CLIP.width) * 100}%`,
            height: `${(CARD.height / CLIP.height) * 100}%`,
            backgroundColor: card.color,
          }}
        />
      ))}
    </div>
  )
}

/**
 * The sentence's four document names, each a span `AGREEMENT_LINKS` can look up. Split by hand
 * off the Figma text node's `characters` — its own `characterStyleOverrides` array is a few
 * entries short of the string's length (Thai combining marks throw the raw index off), so the
 * boundaries here are read off the actual document names rather than trusted blindly from the
 * array's tail, where the drift lands.
 */
const AGREEMENT_SEGMENTS = [
  'ข้าพเจ้าได้อ่านและยอมรับ ',
  { link: 'กฎกติกาการแข่งขัน' },
  ' ',
  { link: 'ข้อกำหนดการใช้งานเว็บไซต์' },
  ' และ ',
  { link: 'ข้อกำหนดการใช้งาน Codern' },
  ' รวมทั้งได้อ่าน',
  { link: 'นโยบายความเป็นส่วนตัว' },
  'แล้ว',
] as const

/** The one checkbox's own box: same 16→24 ramp `ConsentChoice` uses below, so both controls on
 *  this step read as the one checkbox design. */
const AGREEMENT_BOX =
  'flex size-[calc(15.792px_+_8.208*var(--fl))] shrink-0 items-center justify-center rounded-[calc(3.948px_+_2.052*var(--fl))] p-[calc(1.948px_+_2.052*var(--fl))] transition-colors'

/** The row's leading mark — 40 flat at every width (`2053:157`/`2053:181` on the 1440 frame;
 *  no phone anchor to split it against). */
const ROW_GLYPH = 'size-10'

function Row({
  icon,
  title,
  required,
  description,
  children,
}: {
  icon: string
  title: string
  required?: boolean
  description: string
  children: React.ReactNode
}) {
  return (
    <div className="flex w-full flex-col gap-3 rounded-[16px] border border-[#dcdcdc] py-3 pr-6 pl-3 sm:flex-row sm:items-center sm:gap-4">
      <div className="flex items-start gap-2 sm:contents">
        <img src={icon} alt="" aria-hidden className={`shrink-0 ${ROW_GLYPH}`} />
        <div className="flex min-w-0 flex-1 flex-col items-start justify-center">
          <p className="text-[calc(15.896px_+_4.104*var(--fl))] leading-[1.4] font-medium">
            {title}
            {required && <span className="ml-1 text-[#ea4335]">*</span>}
          </p>
          <p className="text-[calc(11.844px_+_6.156*var(--fl))] leading-[normal] text-gray-1">
            {description}
          </p>
        </div>
      </div>
      {children}
    </div>
  )
}

/** Radio pair styled as the design's 24 check boxes — unchecked is an empty outline. See the
 *  note above `AGREEMENT_BOX`: same control, same ramp. */
function ConsentChoice({ name }: { name: string }) {
  const [value, setValue] = useState<'yes' | 'no'>('yes')
  const [touched, setTouched] = useState(false)

  return (
    <div className="flex w-full items-center sm:w-auto sm:shrink-0 sm:gap-6 lg:gap-10">
      {(
        [
          ['yes', 'ยอมรับ'],
          ['no', 'ไม่ยอมรับ'],
        ] as const
      ).map(([key, label]) => (
        <label
          key={key}
          className="mm-press flex flex-1 cursor-pointer items-center gap-[calc(7.896px_+_4.104*var(--fl))] sm:flex-none"
        >
          <input
            type="radio"
            name={name}
            checked={value === key}
            onChange={() => {
              setValue(key)
              setTouched(true)
            }}
            className="sr-only"
          />
          <span
            className={`${AGREEMENT_BOX} ${value === key ? 'bg-brand-red' : 'border border-[#dcdcdc]'}`}
          >
            {value === key && <CheckMark className={`${CHECK_MARK} text-white`} drawn={touched} />}
          </span>
          <span className="text-[calc(13.844px_+_6.156*var(--fl))] leading-[1.4]">{label}</span>
        </label>
      ))}
    </div>
  )
}

/** The row that opened the sheet, so the sheet can grow out of it and shrink back into it. */
type OpenDoc = { title: string; x: number; y: number }

export default function TermsStep() {
  const [openDoc, setOpenDoc] = useState<OpenDoc | null>(null)
  const [agreed, setAgreed] = useState(false)
  const [agreedTouched, setAgreedTouched] = useState(false)

  return (
    <WizardShell
      step={1}
      withTomatoes={false}
      receded={openDoc !== null}
      actions={<NextButton to="/register/team" />}
      overlay={
        <PolicyModal
          document={AGREEMENT_LINKS[openDoc?.title ?? ''] ?? null}
          origin={openDoc}
          onDecline={() => setOpenDoc(null)}
          onAccept={() => setOpenDoc(null)}
        />
      }
    >
      {/* 24 @1440 (`2053:108`'s outer stack) between the two sections, flat — no phone anchor to
          ramp it against. */}
      <div className="flex w-full flex-col items-center justify-center gap-6">
        <section className="flex w-full flex-col items-start justify-center gap-3">
          <h2 className="text-[calc(13.844px_+_6.156*var(--fl))] leading-[normal] text-gray-1">
            ข้อตกลงการเข้าร่วม
          </h2>
          {/* the illustration plate + checkbox sentence, one bordered card */}
          <div className="flex w-full flex-col items-center gap-6 rounded-2xl border border-[#dcdcdc] p-4">
            <AgreementStack />
            <label className="flex w-full cursor-pointer items-start gap-4">
              <input
                type="checkbox"
                checked={agreed}
                onChange={() => {
                  setAgreed((v) => !v)
                  setAgreedTouched(true)
                }}
                className="sr-only"
              />
              <span className={`${AGREEMENT_BOX} ${agreed ? 'bg-brand-red' : 'border border-[#dcdcdc]'}`}>
                {agreed && <CheckMark className={`${CHECK_MARK} text-white`} drawn={agreedTouched} />}
              </span>
              <p className="text-[calc(13.844px_+_6.156*var(--fl))] leading-[1.4]">
                {AGREEMENT_SEGMENTS.map((seg, i) =>
                  typeof seg === 'string' ? (
                    <span key={i}>{seg}</span>
                  ) : (
                    <button
                      key={i}
                      type="button"
                      onClick={(e) => {
                        const box = e.currentTarget.getBoundingClientRect()
                        setOpenDoc({
                          title: seg.link,
                          x: box.left + box.width / 2,
                          y: box.top + box.height / 2,
                        })
                      }}
                      className="text-brand-red underline underline-offset-2"
                    >
                      {seg.link}
                    </button>
                  ),
                )}
              </p>
            </label>
          </div>
        </section>

        <section className="flex w-full flex-col items-start justify-center gap-3">
          <h2 className="text-[calc(13.844px_+_6.156*var(--fl))] leading-[normal] text-gray-1">
            ความยินยอม
          </h2>
          <div className="flex w-full flex-col items-start gap-5">
            {CONSENTS.map((consent, i) => (
              <Row key={consent.title} {...consent}>
                <ConsentChoice name={`consent-${i}`} />
              </Row>
            ))}
          </div>
        </section>
      </div>
    </WizardShell>
  )
}
