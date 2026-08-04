import SectionHeader from './SectionHeader'
import { DOCUMENT_GROUPS, STEP_CARDS } from '../data'
import { useReveal } from '../hooks/useReveal'

const teamPhoto = '/assets/figma/522303cab6b008daf26c3f0e8e3f2ec214a0c0cf.png'
const advisorPhoto = '/assets/figma/2a36441d02ccfe195207a9ad27345494771cc3b6.png'
const documentsPhoto = '/assets/figma/09f5ceefe923ad7cfc2733544959a0be9389fc6d.png'

/**
 * Each card's illustration is a fixed-size plate with its photos pinned in px.
 * Keeping the plate's aspect ratio and pinning in percentages means the arrangement
 * scales as one instead of the photos sliding out of the card.
 */
function pinner(cw: number, ch: number) {
  return (x: number, y: number, w: number, h: number) => ({
    left: `${(x / cw) * 100}%`,
    top: `${(y / ch) * 100}%`,
    width: `${(w / cw) * 100}%`,
    height: `${(h / ch) * 100}%`,
  })
}

/**
 * There are now TWO plates per card, and they are different compositions rather than one
 * composition at two sizes: the 1440 plate is 540x200 with a 224-wide centre photo, the
 * phone plate (1190:632 / 1190:640 / 1190:646) is 322x160 — 306 on the documents card,
 * which insets 24 rather than 16 — with a 140-wide one. Both sets are published on the
 * `<img>` as custom properties so a single element can carry both and let `lg:` choose;
 * pinning one of them inline would have made it unbeatable by the other.
 */
const pinDesk = pinner(540, 200)
const pinDeskTall = pinner(540, 290)
const pinPhone = pinner(322, 160)
const pinPhoneWide = pinner(306, 160)

type Pin = ReturnType<typeof pinDesk>

/** `--p*` is the phone box, `--d*` the 1440 one; `PIN` below reads them. */
function pins(phone: Pin, desk: Pin, rotate = 0) {
  return {
    '--pl': phone.left,
    '--pt': phone.top,
    '--pw': phone.width,
    '--ph': phone.height,
    '--dl': desk.left,
    '--dt': desk.top,
    '--dw': desk.width,
    '--dh': desk.height,
    transform: `rotate(${rotate}deg)`,
  } as React.CSSProperties
}

const PIN =
  'absolute object-cover left-[var(--pl)] top-[var(--pt)] w-[var(--pw)] h-[var(--ph)] ' +
  'lg:left-[var(--dl)] lg:top-[var(--dt)] lg:w-[var(--dw)] lg:h-[var(--dh)]'

/** The plate itself: 322x160 on the phone, 540x200 (540x290 for documents) at 1440. */
const PLATE = 'relative mx-auto aspect-[322/160] w-full max-w-[540px] lg:aspect-[540/200]'
const PLATE_TALL = 'relative mx-auto aspect-[306/160] w-full max-w-[540px] lg:aspect-[540/290]'

/**
 * Three student photos fanned out. Figma paints the upright centre one first, so the two
 * tilted ones overlap it rather than the other way round.
 *
 * Figma reports rotated bounding boxes; the phone boxes below are their centres taken back
 * to the unrotated box, which is what CSS positions before it transforms —
 * 1190:634 bbox (28, 29.8) 125.67x120.46 @ -27.38deg -> box (42.141, 47.42) 97.388x85.215.
 */
const TEAM_PHOTOS = [
  { style: pins(pinPhone(90.89, 10, 140, 123), pinDesk(158, 0, 224, 196)) },
  { style: pins(pinPhone(42.141, 47.42, 97.388, 85.215), pinDesk(80, 60, 156, 136), -27.38) },
  { style: pins(pinPhone(182.33, 47.48, 97.388, 85.215), pinDesk(304, 60, 156, 136), 26.89) },
]

/** 1190:641 / 1190:647 centre a single 140 square in the plate. */
const ADVISOR_PHOTO = pins(pinPhone(91, 10, 140, 140), pinDesk(172, 4, 196, 196))
const DOCUMENTS_PHOTO = pins(pinPhoneWide(83, 10, 140, 140), pinDeskTall(140, 31, 259, 259))

/** One illustration plate per step card, in the order Figma stacks them. */
const ILLUSTRATIONS = [
  <div className={PLATE}>
    {TEAM_PHOTOS.map((photo, i) => (
      <img key={i} src={teamPhoto} alt="" aria-hidden className={PIN} style={photo.style} />
    ))}
  </div>,
  <div className={PLATE}>
    <img src={advisorPhoto} alt="" aria-hidden className={PIN} style={ADVISOR_PHOTO} />
  </div>,
]

/**
 * Figma gives these cards a 20px shadow — softer than the 40px `shadow-soft` elsewhere.
 *
 * 1190:631/639 inset the two step cards by 16 on the phone (24 at 1440), while 1190:645
 * insets the documents card by 24 at both ends — so the padding is no longer shared.
 */
const CARD = 'rounded-3xl bg-white shadow-soft'
const STEP_PAD = 'p-[calc(16px_+_8*var(--fl))]'

/**
 * 1190:631 butts the text container straight onto the 160-tall plate — the phone card has no
 * gap there at all, where 1440 has 60. `max(0px, …)` is what lets the ramp reach 0 at 402 and
 * hold it below: a straight interpolation through (402, 0) and (1440, 60) is negative at 375.
 */
const PLATE_GAP = 'gap-[max(0px,calc(-1.56px_+_61.56*var(--fl)))]'
/** 1190:637 — 24 on the phone, the ladder's 26 at 1440. */
const CARD_TITLE = 'text-[calc(23.948px_+_2.052*var(--fl))]'
/** 1190:638 — 16 on the phone, 19 at 1440. The 15.1 the ladder gave at 402 cost the
 *  descriptions a line each, which is where 30 of the phone card's 362 went missing. */
const CARD_BODY = 'text-[calc(15.922px_+_3.078*var(--fl))]'
/** 1190:652 — 18 on the phone, the ladder's 23 at 1440. */
const DOC_HEADING = 'text-[calc(17.87px_+_5.13*var(--fl))]'
/** 12 between the three cards on the phone (1190:630), 24 at 1440. */
const STACK_GAP = 'gap-[calc(12px_+_12*var(--fl))]'

const [ENTRANT_DOCS, ADVISOR_DOCS] = DOCUMENT_GROUPS

function DocGroup({ heading, items }: (typeof DOCUMENT_GROUPS)[number]) {
  return (
    <div className="flex flex-col gap-4">
      <h4 className={`${DOC_HEADING} text-center leading-[1.5] font-medium`}>{heading}</h4>
      {/* 1190:653 hangs the bullets 24 in on the phone, 30 at 1440 */}
      <ul
        className={`${CARD_BODY} ms-[calc(24px_+_6*var(--fl))] flex list-disc flex-col leading-[1.5] font-light`}
      >
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  )
}

/**
 * One step card, revealing itself.
 *
 * D13 — the row used to be a `reveal-group`, and a group staggers its DIRECT children. The
 * grid's two children are the left column (which holds two cards) and the right article, so
 * the ladder read as two arrivals for three cards and the two left-hand cards came in as one
 * block. D5 applies on top of that: at 390 the second child measured 1.70 of the viewport at
 * the frame it was told to animate, a screen below the fold.
 *
 * Three reveals, one per card, with the ladder carried inline as `--reveal-delay` — spent
 * only on the reveal's opacity and transform, never as a `transition-delay` longhand that
 * would also postpone anything else the card animates (index.css).
 */
function StepCard({ card, i }: { card: (typeof STEP_CARDS)[number]; i: number }) {
  const reveal = useReveal<HTMLElement>()

  return (
    <article
      ref={reveal.ref}
      style={{ '--reveal-delay': `${i * 70}ms` } as React.CSSProperties}
      className={`flex flex-col ${PLATE_GAP} ${CARD} ${STEP_PAD} ${reveal.cls}`}
    >
      {ILLUSTRATIONS[i]}
      <div className="flex flex-col items-center gap-4 text-center">
        <h3 className={`${CARD_TITLE} leading-[1.4] font-semibold`}>{card.title}</h3>
        <p className={`${CARD_BODY} leading-[1.5] font-light`}>{card.body}</p>
      </div>
    </article>
  )
}

export default function Steps() {
  const head = useReveal()
  const docs = useReveal<HTMLElement>()

  return (
    // Figma: the header sits flush at the section top — the run-up above it belongs to
    // the calendar's tail. 109 of tail here carries the row into the red prize band.
    <section id="steps" className="shell sec-steps relative">
      {/* 1190:626 opens 24 between the header and the first card, 40 at 1440 */}
      <div className="relative z-10 mx-auto flex max-w-[1200px] flex-col gap-[calc(24px_+_16*var(--fl))]">
        <div ref={head.ref} className={head.cls}>
          <SectionHeader number="02" title="ขั้นตอนสมัครเข้าแข่งขัน" />
        </div>

        {/* Figma splits the row 588 / 588 inside the 1200 column, 936 tall; below `md`
            1190:630 stacks the same three cards on a 12 gap in the same order. */}
        <div className={`grid items-stretch md:grid-cols-2 lg:min-h-[936px] ${STACK_GAP}`}>
          <div className={`flex min-w-0 flex-col justify-center ${STACK_GAP}`}>
            {STEP_CARDS.map((card, i) => (
              <StepCard key={card.title} card={card} i={i} />
            ))}
          </div>

          <article
            ref={docs.ref}
            style={{ '--reveal-delay': '140ms' } as React.CSSProperties}
            className={`flex min-w-0 flex-col justify-between p-6 ${PLATE_GAP} ${CARD} ${docs.cls}`}
          >
            <div className={PLATE_TALL}>
              <img
                src={documentsPhoto}
                alt=""
                aria-hidden
                className={PIN}
                style={DOCUMENTS_PHOTO}
              />
            </div>
            {/* the entrant list belongs to the heading — only the advisor block is 24 away */}
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-4">
                <h3 className={`${CARD_TITLE} text-center leading-[1.4] font-semibold`}>
                  การเตรียมเอกสาร
                </h3>
                <DocGroup {...ENTRANT_DOCS} />
              </div>
              <DocGroup {...ADVISOR_DOCS} />
            </div>
          </article>
        </div>
      </div>
    </section>
  )
}
