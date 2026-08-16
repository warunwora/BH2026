import { useEffect, useState } from 'react'
import WizardShell, { NextButton } from '../../components/form/WizardShell'
import { CHECK_MARK, CheckMark } from '../../components/form/Field'
import { useGateField } from '../../components/form/wizardNav'
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
 * ------------------------------------------------------- the fanned document stack
 *
 * Figma `2053:159` (`Frame 2043683181`), a 928x100 clip holding three rounded sheets. The
 * previous pass read this as three FLAT rectangles and it was wrong twice over, both times
 * for the same reason: **Figma's REST `rotation` is in RADIANS, not degrees.**
 *
 *   "rotation": -0.038688236  →  −2.2166°, not −0.039°
 *
 * Read as degrees the tilt looks negligible, so it was dropped — which is why the live plate
 * drew three straight bars where the frame draws a spread deck. And because the sheets were
 * left un-rotated, the numbers taken from the file were the ROTATED BOUNDING BOXES
 * (769.29 x 129.55) rather than the sheets themselves: a 129.55-tall card in a 100-tall clip
 * overflowed by a third of its own height, and its clipped bottom edge cut a hard horizontal
 * rule clean across the plate.
 *
 * Solving the bbox back through the rotation recovers the real geometry exactly. For a
 * W x H box turned by θ, the axis-aligned bbox is
 *
 *   bw = W·cosθ + H·sinθ      769.2946786880493
 *   bh = W·sinθ + H·cosθ      129.55296957492828
 *
 * and at θ = 0.038688236 rad that pair inverts to W = 766.000, H = 100.000 — dead integers,
 * which is the confirmation that the radian reading is the right one. The sheet is exactly as
 * tall as the window it sits in; it is the TILT that makes it overhang, which is what a stack
 * of paper does.
 *
 * Centres (bbox centre = the unrotated centre, since Figma rotates about the middle) step by
 * a flat (79, 12) each sheet, so card i's unrotated top-left in clip units is
 * (1.6473 + 79i, 15.7765 + 12i). Colour runs darkest-at-back to lightest-at-front, which is
 * Figma's own paint order.
 *
 * Everything below is a PERCENTAGE of the 928x100 clip rather than a px ramp: the plate is
 * `w-full` in the bordered box and `aspect-ratio` keeps the window proportional, so the whole
 * composition — including a single fixed rotation angle — scales correctly at every width
 * without needing a second Figma anchor.
 */
const CLIP = { width: 928, height: 100 }
const SHEET = { width: 766, height: 100 }
/** `2053:160` / `2053:161` / `2053:162`, all three `rotation: -0.038688236` rad. */
const TILT = -2.2166
const STEP = { x: 79, y: 12 }
const AGREEMENT_SHEETS = [
  { color: '#cd7865', x: 1.6473, y: 15.7765 },
  { color: '#d99a8b', x: 80.6473, y: 27.7765 },
  { color: '#e6bbb2', x: 159.6473, y: 39.7765 },
]

/**
 * ------------------------------------------------------------------ and its motion
 *
 * GATE. Rare tier — a registrant sees this step once. PURPOSE: explanation. The plate is the
 * illustration for "the documents you are agreeing to", and a deck that spreads open says
 * "several documents" in a way three static bars do not. It is decorative art, not data, so
 * it is allowed to move.
 *
 * TOOL: CSS transitions on a data attribute, not keyframes — `data-fan` is driven by whether
 * the policy modal is up, and that can be toggled as fast as a user can click a link and
 * close it. Transitions retarget from wherever the sheets currently are; keyframes would
 * restart the fan from closed every time.
 *
 * PROPERTIES: `translate` / `rotate` / `opacity` — individual properties, never the
 * `transform` shorthand, as everything animated in this repo does. No layout property moves.
 *
 * CURVE AND DURATION, deliberately asymmetric. Opening is the deliberate beat: 420ms on
 * `cubic-bezier(0.23, 1, 0.32, 1)` with a 70ms stagger, so the three sheets arrive in order
 * instead of as one block. Closing is the system answering a press the user just made, so it
 * is 200ms flat with no stagger. Both directions exist, which is the whole point — the deck
 * gathers itself up as a document comes forward and spreads again when it goes back.
 *
 * The closed pose is the deck STACKED, not gone: every sheet slides back onto the bottom
 * one's slot and flattens to 0°. Expressed as a percentage of the SHEET's own box, because
 * percentage translations resolve against the element rather than its parent and therefore
 * survive the plate being any width. Only the first paint adds `opacity: 0` on top of it —
 * after that the deck is always visible, just open or closed.
 *
 * Every from-state lives inside `@media (prefers-reduced-motion: no-preference)`, so with
 * reduced motion the deck is simply drawn open and never moves at all.
 *
 * This block belongs in `styles/auth-motion.css` with the rest of the flow's choreography;
 * it is inline because that file is owned elsewhere this pass. Lifting it is a copy-paste.
 */
const DECK_CSS = `
/* THE REST POSE, and it is deliberately outside the media query below: a tilted sheet is what
   the frame draws, not an animation, so reduced motion must still get it. The angle arrives as
   a custom property rather than an inline \`rotate\`, because an inline declaration outranks
   every stylesheet rule — the first cut set \`rotate\` in the style attribute and the closed
   pose's \`rotate: 0deg\` was silently ignored, so the deck slid without ever flattening. */
.agreement-sheet {
  rotate: var(--tilt);
}
@media (prefers-reduced-motion: no-preference) {
  .agreement-sheet {
    transition-property: translate, rotate, opacity;
    transition-timing-function: cubic-bezier(0.23, 1, 0.32, 1);
    transition-duration: 420ms;
    transition-delay: var(--fan-delay);
  }
  /* the closed pose — also the from-state the deck enters out of */
  .agreement-deck[data-fan='closed'] .agreement-sheet {
    translate: var(--fan-x) var(--fan-y);
    rotate: 0deg;
    transition-duration: 200ms;
    transition-delay: 0ms;
  }
  /* first paint only: the deck fades up as it spreads. Never applies again. */
  .agreement-deck[data-entered='false'] .agreement-sheet {
    opacity: 0;
  }
}
`

function AgreementStack({ closed }: { closed: boolean }) {
  /*
   * The entrance flag, flipped one task after mount so the browser has painted the closed
   * pose for the transition to run out of. A `setTimeout` and not `requestAnimationFrame`:
   * `useEffect` already runs after the commit, a zero-delay task lands after the paint that
   * follows it, and rAF is the one scheduler that a CDP-driven session can have poisoned out
   * from under it — which would leave this plate invisible rather than merely un-animated.
   */
  const [entered, setEntered] = useState(false)
  useEffect(() => {
    const t = window.setTimeout(() => setEntered(true), 0)
    return () => window.clearTimeout(t)
  }, [])

  return (
    <div
      aria-hidden
      className="agreement-deck relative w-full overflow-hidden"
      data-entered={entered}
      data-fan={closed || !entered ? 'closed' : 'open'}
      style={{ aspectRatio: `${CLIP.width} / ${CLIP.height}` }}
    >
      <style>{DECK_CSS}</style>
      {AGREEMENT_SHEETS.map((sheet, i) => (
        <span
          key={i}
          className="agreement-sheet absolute rounded-[12px]"
          style={
            {
              left: `${(sheet.x / CLIP.width) * 100}%`,
              top: `${(sheet.y / CLIP.height) * 100}%`,
              width: `${(SHEET.width / CLIP.width) * 100}%`,
              height: `${(SHEET.height / CLIP.height) * 100}%`,
              backgroundColor: sheet.color,
              '--tilt': `${TILT}deg`,
              /* the fan offset this sheet has to give back to sit on the bottom one, as a
                 share of its OWN box — the vars are set here, on the animating element, and
                 never on the parent, so no child's transform is recalculated by a parent's var */
              '--fan-x': `${(-STEP.x * i * 100) / SHEET.width}%`,
              '--fan-y': `${(-STEP.y * i * 100) / SHEET.height}%`,
              '--fan-delay': `${i * 70}ms`,
            } as React.CSSProperties
          }
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
  invalid,
  message,
  children,
}: {
  icon: string
  title: string
  required?: boolean
  description: string
  /** the row's own border turns red with its choice pair, so the refusal reads at row scale */
  invalid?: boolean
  /** the gate's sentence, rendered under the description where the row's copy already is */
  message?: { id: string; text: string } | null
  children: React.ReactNode
}): React.ReactElement {
  return (
    <div
      className={`flex w-full flex-col gap-3 rounded-[16px] border py-3 pr-6 pl-3 sm:flex-row sm:items-center sm:gap-4 ${
        invalid ? 'border-[#ea4335]' : 'border-[#dcdcdc]'
      }`}
    >
      <div className="flex items-start gap-2 sm:contents">
        <img src={icon} alt="" aria-hidden className={`shrink-0 ${ROW_GLYPH}`} />
        <div className="flex min-w-0 flex-1 flex-col items-start justify-center">
          <p className="text-[length:var(--t-16-20)] leading-[1.4] font-medium">
            {title}
            {required && <span className="ml-1 text-[#ea4335]">*</span>}
          </p>
          <p className="text-[length:var(--t-12-18)] leading-[normal] text-gray-1">{description}</p>
          {message && (
            <p
              id={message.id}
              className="mt-1 text-[length:var(--t-12-16)] leading-[normal] text-[#ea4335]"
            >
              {message.text}
            </p>
          )}
        </div>
      </div>
      {children}
    </div>
  )
}

/**
 * One consent row and its own claim on the step. A component rather than a `useGateField` call
 * inside the `CONSENTS.map()` below, because a hook in a loop ties the hook COUNT to the length
 * of a list — safe while that list is a module constant and a defect the moment it is not.
 */
function ConsentRow({
  consent,
  index,
  value,
  onChange,
}: {
  consent: (typeof CONSENTS)[number]
  index: number
  value: 'yes' | 'no' | null
  onChange: (value: 'yes' | 'no') => void
}) {
  const gate = useGateField<HTMLDivElement>(
    consent.required && value !== 'yes' ? `ต้องยอมรับ${consent.title}เพื่อดำเนินการต่อ` : null,
  )

  return (
    <Row
      {...consent}
      invalid={gate.invalid}
      message={gate.message ? { id: gate.messageId, text: gate.message } : null}
    >
      <ConsentChoice name={`consent-${index}`} value={value} onChange={onChange} gate={gate} />
    </Row>
  )
}

/**
 * Radio pair styled as the design's 24 check boxes — unchecked is an empty outline. See the
 * note above `AGREEMENT_BOX`: same control, same ramp.
 *
 * CONTROLLED, and starting at NEITHER option. It used to hold its own state and default to
 * `'yes'`, which is two separate problems: the step above could not see the answer, so the
 * required row could not gate anything; and a consent that arrives already granted is not a
 * consent the user gave. Figma draws ยอมรับ ticked on `2053:182` / `2053:199`, but a frame
 * shows a filled-in example — it cannot show "unanswered" — and a pre-ticked required consent
 * makes the asterisk beside it meaningless. The user picks; until they do, ถัดไป waits.
 */
function ConsentChoice({
  name,
  value,
  onChange,
  gate,
}: {
  name: string
  value: 'yes' | 'no' | null
  onChange: (value: 'yes' | 'no') => void
  gate: ReturnType<typeof useGateField<HTMLDivElement>>
}) {
  const [touched, setTouched] = useState(false)

  return (
    /* the pair is the control, so the pair is what the gate points at — `tabIndex={-1}` gives
       it something to focus, since an unanswered radio group has no focusable member of its own */
    <div
      ref={gate.ref}
      tabIndex={-1}
      role="radiogroup"
      aria-invalid={gate.invalid || undefined}
      aria-describedby={gate.message ? gate.messageId : undefined}
      className="flex w-full items-center focus:outline-none sm:w-auto sm:shrink-0 sm:gap-6 lg:gap-10"
    >
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
              onChange(key)
              setTouched(true)
            }}
            className="sr-only"
          />
          <span
            className={`${AGREEMENT_BOX} ${value === key ? 'bg-brand-red' : 'border border-[#dcdcdc]'}`}
          >
            {value === key && <CheckMark className={`${CHECK_MARK} text-white`} drawn={touched} />}
          </span>
          <span className="text-[length:var(--t-14-20)] leading-[1.4]">{label}</span>
        </label>
      ))}
    </div>
  )
}

/** The row that opened the sheet, so the sheet can grow out of it and shrink back into it. */
type OpenDoc = { title: string; x: number; y: number }

/**
 * The illustration plate, the agreement checkbox and its claim on the step.
 *
 * A COMPONENT and not part of `TermsStep`, for the same reason `ConsentRow` is one: the gate's
 * provider wraps the card INSIDE `WizardShell`, so a hook called in `TermsStep` — which renders
 * `WizardShell` and is therefore above it — registers with nothing at all and the checkbox
 * silently stops gating. Anything that claims against the step has to live in the tree the
 * shell renders, which is `children`. The checkbox's state comes down here with it; the parent
 * only ever needed `openDoc`.
 */
function AgreementCard({
  closed,
  onOpenDoc,
}: {
  closed: boolean
  onOpenDoc: (doc: OpenDoc) => void
}) {
  const [agreed, setAgreed] = useState(false)
  const [agreedTouched, setAgreedTouched] = useState(false)

  /* the focus target is the `sr-only` `<input>` itself — a real focusable control, so a press
     of ถัดไป with nothing ticked lands the caret on the checkbox that has to be ticked */
  const agreeGate = useGateField<HTMLInputElement>(
    agreed ? null : 'ต้องยอมรับข้อตกลงการเข้าร่วมเพื่อดำเนินการต่อ',
  )

  return (
    <section className="flex w-full flex-col items-start justify-center gap-3">
      <h2 className="text-[length:var(--t-14-20)] leading-[normal] text-gray-1">
        ข้อตกลงการเข้าร่วม
      </h2>
      {/* the illustration plate + checkbox sentence, one bordered card */}
      <div
        className={`flex w-full flex-col items-center gap-6 rounded-2xl border p-4 ${
          agreeGate.invalid ? 'border-[#ea4335]' : 'border-[#dcdcdc]'
        }`}
      >
        {/* the deck closes while a policy owns the screen and spreads again when it goes */}
        <AgreementStack closed={closed} />
        <label className="flex w-full cursor-pointer items-start gap-4">
          <input
            ref={agreeGate.ref}
            type="checkbox"
            checked={agreed}
            aria-invalid={agreeGate.invalid || undefined}
            aria-describedby={agreeGate.message ? agreeGate.messageId : undefined}
            onChange={() => {
              setAgreed((v) => !v)
              setAgreedTouched(true)
            }}
            className="sr-only"
          />
          <span
            className={`${AGREEMENT_BOX} ${agreed ? 'bg-brand-red' : 'border border-[#dcdcdc]'}`}
          >
            {agreed && <CheckMark className={`${CHECK_MARK} text-white`} drawn={agreedTouched} />}
          </span>
          <p className="text-[length:var(--t-14-20)] leading-[1.4]">
            {AGREEMENT_SEGMENTS.map((seg, i) =>
              typeof seg === 'string' ? (
                <span key={i}>{seg}</span>
              ) : (
                <button
                  key={i}
                  type="button"
                  onClick={(e) => {
                    const box = e.currentTarget.getBoundingClientRect()
                    onOpenDoc({
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
        {agreeGate.message && (
          <p
            id={agreeGate.messageId}
            className="w-full text-[length:var(--t-12-16)] leading-[normal] text-[#ea4335]"
          >
            {agreeGate.message}
          </p>
        )}
      </div>
    </section>
  )
}

export default function TermsStep() {
  const [openDoc, setOpenDoc] = useState<OpenDoc | null>(null)
  const [answers, setAnswers] = useState<('yes' | 'no' | null)[]>(() => CONSENTS.map(() => null))

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
        <AgreementCard closed={openDoc !== null} onOpenDoc={setOpenDoc} />

        <section className="flex w-full flex-col items-start justify-center gap-3">
          <h2 className="text-[length:var(--t-14-20)] leading-[normal] text-gray-1">ความยินยอม</h2>
          <div className="flex w-full flex-col items-start gap-5">
            {CONSENTS.map((consent, i) => (
              <ConsentRow
                key={consent.title}
                consent={consent}
                index={i}
                value={answers[i]}
                onChange={(next) => setAnswers((prev) => prev.map((v, j) => (i === j ? next : v)))}
              />
            ))}
          </div>
        </section>
      </div>
    </WizardShell>
  )
}
