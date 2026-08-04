import PastEventCard from '../components/PastEventCard'
import { HallOfFameHeroDecor, HallOfFameWaveBand } from '../components/HallOfFameDecor'
import { PAST_EVENTS, PAST_INTRO } from '../pastEventsData'
import { useReveal } from '../hooks/useReveal'

const BANGMOD = '/assets/figma/9813e3e647c50b42236b9552d81e1c94b33bbd46.svg'
const HACKATHON = '/assets/figma/628b94789720739e321ffa2f1ddb012f10b9f1ee.svg'

export default function PastEvents() {
  /*
   * G11 — the reveal used to start at the paragraph block, which left the two wordmarks
   * above it, the largest thing on the page, painting instantly while the copy under them
   * animated. The group is the whole hero column now, so the mark arrives first and the
   * intro 70ms behind it. `threshold: 0` because the column is taller than the viewport at
   * every width and would never reach 15% of itself.
   */
  const hero = useReveal({ group: true, threshold: 0 })
  const title = useReveal()

  return (
    /*
     * The page's own clip box. `overflow-x-clip` — see the long note on the same class in
     * Home.tsx: this page carried by far the worst overhang of the three (a rotated ring
     * reaching x = 1594 on a 390 screen), which grew Chrome's mobile layout viewport to
     * 1594 and made the whole site draggable sideways over 1200px of white.
     */
    <div className="overflow-x-clip">
      {/*
       * No `overflow-hidden` on the sections themselves, on purpose: the warm circle behind
       * the hero is a 400px blur that reaches well past the section, and clipping it there
       * shows the fade as a seam. Only the sideways bleed is clipped, and only at the page box.
       */}
      <section id="hall-of-fame" className="shell sec-hall-hero relative">
        <HallOfFameHeroDecor />

        <div
          ref={hero.ref}
          className={`relative z-10 mx-auto flex max-w-[1200px] flex-col gap-[calc(40px_+_40*var(--fl))] ${hero.cls}`}
        >
          {/*
           * Figma stacks the two wordmarks inside a 727.492x306.895 box: "Hackathon" is
           * 96.484% as wide, indented 1.836%, and rides up into "BangMod"'s descenders.
           */}
          <div className="relative aspect-[727.492/306.895] w-full max-w-[727.492px]">
            <img
              src={BANGMOD}
              alt="BangMod"
              className="absolute top-0 left-0 h-[65.499%] w-full max-w-none"
            />
            <img
              src={HACKATHON}
              alt="Hackathon"
              className="absolute top-[53.263%] left-[1.836%] h-[46.737%] w-[96.484%] max-w-none"
            />
          </div>

          <div className="flex flex-col gap-6">
            {/* the page's own h1 — it was set a rank BELOW the "หอเกียรติยศ" h2 below it,
                so the hierarchy read upside down at every width */}
            <h1 className="fl-display leading-[1.4] font-medium">{PAST_INTRO.title}</h1>
            {PAST_INTRO.paragraphs.map((p) => (
              <p key={p} className="fl-lead leading-[1.5] font-light whitespace-pre-wrap">
                {p}
              </p>
            ))}
          </div>
        </div>
      </section>

      {/* Figma: 40 between the title and each 1200x800 card, then straight into the waves */}
      <section id="timeline" className="shell sec-hall-timeline relative">
        <div className="relative z-10 mx-auto flex max-w-[1200px] flex-col gap-[calc(24px_+_16*var(--fl))]">
          <h2 ref={title.ref} className={`fl-section leading-[1.4] font-semibold ${title.cls}`}>
            หอเกียรติยศ
          </h2>
          {/*
           * D5 — not a `reveal-group`. A group reveals every child on one trigger, and these
           * cards are 800 tall: measured at the frame `is-visible` landed, their tops were at
           * 0.46 / 1.39 / 2.33 of the viewport at 1440 and 0.78 / 1.66 / 2.51 at 390, so two
           * of the three animated a screen and a half below the fold and the user only ever
           * saw the first one move. Each card observes itself instead (see PastEventCard).
           *
           * It also fixes the worst frame-time problem on the site. Every card carries a
           * seven-layer `backdrop-filter` ramp, and a backdrop filter under a TRANSFORMING
           * ancestor re-blurs every frame — so the group was re-blurring 21 layers at once
           * for 600ms. Per-card reveals make that 7.
           */}
          <div className="flex flex-col gap-[calc(24px_+_16*var(--fl))]">
            {PAST_EVENTS.map((event) => (
              <PastEventCard key={event.title} event={event} />
            ))}
          </div>
        </div>
      </section>

      <HallOfFameWaveBand />
    </div>
  )
}
