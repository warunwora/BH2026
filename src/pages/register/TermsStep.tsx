import { useState } from 'react'
import WizardShell, { BackButton, SubmitButton } from '../../components/form/WizardShell'
import { CheckMark } from '../../components/form/Field'
import PolicyModal from '../../components/PolicyModal'
import { CONSENTS, REQUIRED_DOCUMENTS } from '../../registrationData'

/**
 * Figma 708:1952. Two groups of rounded-16 rows: mandatory documents that open a modal,
 * then per-topic consents answered with a check pair. The consent rows carry 24 of right
 * padding where the document rows carry 12, so the row padding is passed in.
 */
function Row({
  icon,
  title,
  description,
  rounded,
  padding,
  children,
}: {
  icon: string
  title: string
  description: string
  rounded?: boolean
  padding: string
  children: React.ReactNode
}) {
  return (
    <div
      className={`flex w-full flex-col gap-3 rounded-[16px] border border-[#dcdcdc] sm:flex-row sm:items-center sm:gap-4 ${padding}`}
    >
      <img
        src={icon}
        alt=""
        aria-hidden
        className={`size-10 shrink-0 ${rounded ? 'rounded-[8px] shadow-[0_0_30px_rgba(255,255,255,0.2)]' : ''}`}
      />
      <div className="flex flex-1 flex-col items-start justify-center">
        <p className="text-lg leading-[1.4] font-medium lg:text-xl">{title}</p>
        <p className="text-base leading-[normal] text-gray-1 lg:text-lg">{description}</p>
      </div>
      {children}
    </div>
  )
}

/**
 * Radio pair styled as the design's 24 check boxes — unchecked is an empty outline.
 *
 * `touched` is what stops the tick drawing itself for a default nobody chose. The row arrives
 * with ยอมรับ pre-selected, so on entry every consent row used to draw its tick at once,
 * unstaggered, over the incoming step transition — the one animation in the flow whose stated
 * job is to say "you decided", firing on page load. It is now set from the change handler, so
 * the tick is simply *there* on arrival and travels only for a real choice. No timing changed.
 */
function ConsentChoice({ name }: { name: string }) {
  const [value, setValue] = useState<'yes' | 'no'>('yes')
  const [touched, setTouched] = useState(false)

  return (
    <div className="flex shrink-0 items-center gap-6 lg:gap-10">
      {(
        [
          ['yes', 'ยอมรับ'],
          ['no', 'ไม่ยอมรับ'],
        ] as const
      ).map(([key, label]) => (
        <label key={key} className="mm-press flex cursor-pointer items-center gap-3">
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
          {/* the box used to swap fill for outline in one frame, under a tick taking 260ms */}
          <span
            className={`flex size-6 items-center justify-center rounded-[6px] p-1 transition-colors ${
              value === key ? 'bg-brand-red' : 'border border-[#dcdcdc]'
            }`}
          >
            {value === key && <CheckMark className="size-4 text-white" drawn={touched} />}
          </span>
          <span className="text-lg leading-[1.4] lg:text-xl">{label}</span>
        </label>
      ))}
    </div>
  )
}

/** The row that opened the sheet, so the sheet can grow out of it and shrink back into it. */
type OpenDoc = { title: string; x: number; y: number }

export default function TermsStep() {
  const [openDoc, setOpenDoc] = useState<OpenDoc | null>(null)
  const [accepted, setAccepted] = useState<string[]>([])

  return (
    <WizardShell
      step={5}
      withTomatoes={false}
      /* the page behind the sheet drops back a hair while it is open */
      receded={openDoc !== null}
      actions={
        <>
          <BackButton to="/register/entrant/2" />
          <SubmitButton to="/register/success" label="ลงทะเบียนเข้าแข่งขัน" />
        </>
      }
      /* the scrim is `fixed inset-0`, so it has to sit outside the view-transition body */
      overlay={
        <PolicyModal
          document={REQUIRED_DOCUMENTS.find((d) => d.title === openDoc?.title)?.document ?? null}
          origin={openDoc}
          onDecline={() => setOpenDoc(null)}
          onAccept={() => {
            if (openDoc) setAccepted((prev) => [...new Set([...prev, openDoc.title])])
            setOpenDoc(null)
          }}
        />
      }
    >
      <div className="flex w-full flex-col items-center justify-center gap-6">
        <section className="flex w-full flex-col items-start justify-center gap-3">
          <h2 className="text-lg leading-[normal] text-gray-1 lg:text-xl">เอกสารบังคับ</h2>
          <div className="flex w-full flex-col items-start gap-5">
            {REQUIRED_DOCUMENTS.map(({ document, ...doc }) => {
              const isAccepted = accepted.includes(doc.title)
              return (
                <Row key={doc.title} {...doc} padding="p-3">
                  <button
                    type="button"
                    /* the button's own centre, so the sheet grows from the control the
                       user actually pressed rather than from the middle of the screen */
                    onClick={(e) => {
                      const box = e.currentTarget.getBoundingClientRect()
                      setOpenDoc({
                        title: doc.title,
                        x: box.left + box.width / 2,
                        y: box.top + box.height / 2,
                      })
                    }}
                    /* `mm-press` matters here more than anywhere: this is the element the
                       policy sheet measures `--auth-origin-x/y` from, so the sheet grows out
                       of exactly the control the press has to be felt in. */
                    className={`mm-press flex shrink-0 items-center justify-center gap-2 rounded-[12px] px-6 py-3 text-lg leading-[1.4] transition-colors lg:text-xl ${
                      isAccepted
                        ? 'bg-brand-red text-white'
                        : 'bg-brand-red/10 text-brand-red hover:bg-brand-red/20'
                    }`}
                  >
                    {/* accepting a policy in the sheet is a decision, so this one does draw */}
                    {isAccepted && <CheckMark drawn />}
                    {isAccepted ? 'ยอมรับแล้ว' : 'อ่านและยอมรับ'}
                  </button>
                </Row>
              )
            })}
          </div>
        </section>

        <section className="flex w-full flex-col items-start justify-center gap-3">
          <h2 className="text-lg leading-[normal] text-gray-1 lg:text-xl">ความยินยอมเฉพาะเรื่อง</h2>
          <div className="flex w-full flex-col items-start gap-5">
            {CONSENTS.map((consent, i) => (
              <Row key={consent.title} {...consent} padding="py-3 pl-3 pr-3 sm:pr-6">
                <ConsentChoice name={`consent-${i}`} />
              </Row>
            ))}
          </div>
        </section>
      </div>
    </WizardShell>
  )
}
