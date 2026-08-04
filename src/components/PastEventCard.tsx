import Mark2024 from './Mark2024'
import ScrollEdgeEffect from './ScrollEdgeEffect'
import { useReveal } from '../hooks/useReveal'
import type { PastEvent } from '../pastEventsData'

export default function PastEventCard({ event }: { event: PastEvent }) {
  const { photoCrop, logo } = event

  /*
   * Each card observes itself. The three of them used to share one `reveal-group` on the
   * column in pages/PastEvents.tsx, and at 800 tall apiece that meant cards two and three
   * were told to animate while they were a screen and a half below the fold — measured at
   * 1.39 and 2.33 of the viewport at 1440. There is no stagger to keep: nothing this tall
   * is ever on screen with its neighbour.
   */
  const reveal = useReveal<HTMLElement>()

  return (
    // Figma: every card is a fixed 1200x800 tile, 40 of padding, 73 between the two columns
    <article
      ref={reveal.ref}
      className={`relative flex flex-col gap-8 overflow-hidden rounded-[40px] p-6 md:flex-row md:items-start lg:h-[800px] lg:gap-[73px] lg:p-10 ${reveal.cls}`}
    >
      {photoCrop ? (
        // Figma frames the 2025 shot wider than the card and slides it left
        <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
          <img
            src={event.photo}
            alt=""
            className="absolute max-w-none"
            style={{
              left: `${photoCrop.left}%`,
              top: `${photoCrop.top}%`,
              width: `${photoCrop.width}%`,
              height: `${photoCrop.height}%`,
            }}
          />
        </div>
      ) : (
        <img
          src={event.photo}
          alt=""
          aria-hidden
          className="pointer-events-none absolute inset-0 size-full object-cover"
        />
      )}

      {event.photoWash !== undefined && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{ background: `rgba(0,0,0,${event.photoWash})` }}
        />
      )}

      {/* "Scroll Edge Effect - Soft" over the bottom 400: an ink plate, since it sits on
          dark photography, at the per-card outer radius Figma gives each one */}
      <ScrollEdgeEffect
        tone="dark"
        flip
        plateBlur={event.edgeBlur}
        className="absolute inset-x-0 bottom-0 h-1/2 lg:h-[400px]"
      />

      <div
        className="relative w-[180px] shrink-0 overflow-hidden lg:w-[300px]"
        style={{ aspectRatio: `300 / ${event.logoHeight}` }}
      >
        {logo === null ? (
          <Mark2024 />
        ) : logo.crop ? (
          <img
            src={logo.src}
            alt=""
            aria-hidden
            className="absolute max-w-none"
            style={{
              left: `${logo.crop.left}%`,
              top: `${logo.crop.top}%`,
              width: `${logo.crop.width}%`,
              height: `${logo.crop.height}%`,
            }}
          />
        ) : (
          <img
            src={logo.src}
            alt=""
            aria-hidden
            className="absolute inset-0 size-full object-cover"
          />
        )}
      </div>

      <div className="relative flex min-w-0 flex-1 flex-col gap-8 text-white lg:gap-[73px]">
        {/* These four were the last hard `text-a lg:text-b` pairs on the marketing pages —
            24/18 below lg and 30/24 above it, i.e. two sizes and a jump at 1024. They are
            the card-heading and lead ranks of the shared ladder. */}
        <header className="flex flex-col gap-4 lg:gap-6">
          <h3 className="fl-title leading-[1.4] font-medium">{event.title}</h3>
          <p className="fl-lead leading-[1.5] font-light">{event.subtitle}</p>
        </header>

        <dl className="flex flex-col gap-6 lg:gap-8">
          {event.awards.map((award) => (
            <div key={award.label} className="flex flex-col gap-2 lg:gap-4">
              <dt className="fl-title leading-[1.4] font-medium lg:whitespace-nowrap">
                {award.label}
              </dt>
              {award.winners.map((winner) => (
                <dd key={winner} className="fl-lead leading-[1.5] font-light">
                  {winner}
                </dd>
              ))}
            </div>
          ))}
        </dl>
      </div>
    </article>
  )
}
