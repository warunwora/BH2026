import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import ScrollEdgeEffect from './ScrollEdgeEffect'
import { NAV_LINKS } from '../data'

/** Past this many px the nav is over content rather than over the top of the page. */
const SCROLLED_AT = 24

/**
 * Two anchors, not one.
 *
 * Every length in this file used to be `MIN + DELTA * var(--fl)` — a line through the
 * 1440 Figma value and an *invented* 375 floor, because until now no frame under 1440
 * existed. There is one now: `1190:558` is a real 402-wide Homepage, and `1190:779`
 * "Navigation Bar" on it is 402x92 with "Nav Content" `1190:780` inset 20 on all sides.
 * So both ends of the ramp are design, and the line is solved through both anchors:
 *
 *   slope = (v1440 - v402) / 1038, expressed in vw; intercept = v402 - slope*402
 *
 * Each one lands on the Figma value to 0.001px at 402 AND at 1440, so the desktop nav is
 * unchanged to the pixel while the phone stops being a guess. Written as inline styles
 * rather than classes because `shell-wide` (index.css) and the `.site-nav*` rules
 * (micro-motion.css) are other tracks' files — an inline style overrides both without
 * `!important` and without a second source of truth for the same number.
 */
const NAV_SHELL: React.CSSProperties = {
  /* 20 at 402 (1190:779 gutter) → 60 at 1440 (935:451, and `shell-wide`'s own value) */
  paddingInline: 'clamp(20px, 3.8535645vw + 4.5086705px, 60px)',
  /* 20 at 402 → 40 at 1440 */
  paddingTop: 'clamp(20px, 1.9267823vw + 12.2543353px, 40px)',
}

/**
 * Figma's `menu_regular` (`1190:782`): three fully rounded bars on a 24 grid, spanning
 * x 3–21 with their centres at y 6 / 12 / 18 and a 2px weight. Drawn as strokes rather
 * than shipped as an asset so it takes `currentColor` — the swap below fades and rotates
 * it, and a red-on-white asset could not follow that.
 */
function MenuGlyph() {
  return (
    <svg viewBox="0 0 24 24" className="size-6" fill="none" aria-hidden>
      <path
        d="M3 6h18M3 12h18M3 18h18"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  )
}

/** The close state has no Figma node — it is the same 2px rounded stroke on the same grid,
 *  so the two glyphs read as one mark rotating rather than two different icons. */
function CloseGlyph() {
  return (
    <svg viewBox="0 0 24 24" className="size-6" fill="none" aria-hidden>
      <path
        d="M5.5 5.5l13 13M18.5 5.5l-13 13"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  )
}

export default function Navbar() {
  const [open, setOpen] = useState(false)

  /*
   * G16 — the chrome had one appearance for the whole of every page. `ScrollEdgeEffect`
   * was mounted unconditionally, so at scroll 0 a seven-layer `backdrop-filter` stack was
   * blurring nothing (there is no content under the nav yet) and the pill sat flat on the
   * page looking exactly as it does 4000px down.
   *
   * rAF-throttled and `passive`, because this fires on every wheel tick: the listener only
   * records that a frame is pending, and the single read happens inside the frame. The
   * state is a boolean, so React re-renders twice per visit to the top of a page, not per
   * scroll event. The band's fade and the pill's shadow are both CSS off `data-scrolled`
   * (micro-motion.css) — nothing here writes a style.
   */
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    let ticking = false
    const onScroll = () => {
      if (ticking) return
      ticking = true
      requestAnimationFrame(() => {
        ticking = false
        setScrolled(window.scrollY > SCROLLED_AT)
      })
    }

    onScroll() // a deep link or a restored position can start the page already scrolled
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  /*
   * G9 — the active item was a `font-semibold` snap and nothing else, which also reflowed
   * the label's own width as it landed. The weight stays (it is what Figma draws); the
   * underline is what makes the change a movement between two places instead of a swap.
   *
   * One element positioned by a transform, exactly as the dashboard's tab rule is measured
   * (pages/MyTeam.tsx): a border redrawn under whichever link is active reads as two
   * separate marks appearing, not as one travelling. Measured off the live anchor rather
   * than off its grid cell — the cells are 177.33 centres and every Thai label overhangs
   * its own cell, so the cell's width is not the label's.
   *
   * `useLayoutEffect` and a `ResizeObserver`: the row appears at `md` and every figure in it
   * rides `--fl`, so the bar has to be re-measured on any width change, and it has to be
   * measured before paint or the first frame shows it at the wrong width.
   */
  const { pathname } = useLocation()
  const listRef = useRef<HTMLUListElement>(null)
  const [bar, setBar] = useState<{ x: number; y: number; w: number } | null>(null)
  const active = NAV_LINKS.findIndex((link) => link.to === pathname)

  useLayoutEffect(() => {
    const list = listRef.current
    if (!list || active < 0) {
      setBar(null)
      return
    }

    const measure = () => {
      const item = list.children[active]?.firstElementChild as HTMLElement | undefined
      if (!item) return
      setBar({ x: item.offsetLeft, y: item.offsetTop + item.offsetHeight + 2, w: item.offsetWidth })
    }

    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(list)
    return () => observer.disconnect()
  }, [active])

  return (
    /*
     * `pointer-events-none` on the shell, `auto` on the two things in it that are controls.
     *
     * This box is `fixed inset-x-0 top-0` and its height is the whole chrome stack — the top
     * inset, the pill, and the collapsed menu's residue below it. Only the pill is actually a
     * control: the rest is the scroll-edge band (decoration) and empty gutter, and all of it
     * was intercepting taps. On a 402 phone that was a 402x152 sheet over the top of every
     * page, and the phone hero's lockup starts at y151 (`1190:672`), so the masthead sat
     * underneath it. Pointer routing is not layout, so this cannot and does not move 1440;
     * what it does there is hand back the 1px where the shell overlapped the hero's y183.
     */
    <div
      data-scrolled={scrolled}
      style={NAV_SHELL}
      className="pointer-events-none fixed inset-x-0 top-0 z-50"
    >
      {/*
       * Figma's band is 160 tall against a 183-tall nav row on a 1440 frame — a fifth of the
       * viewport height there. Held at 160 on a 390x844 phone the same band is a *third* of
       * the screen and the pill only fills its top half, so the remainder sat as a grey wash
       * over whatever the page put below the nav: at 390 it was mushing the calendar's own
       * section heading. The band now tracks the nav row it belongs to — and the phone frame
       * confirms the guess: `1190:778` "Scroll Edge Effect - Soft" is 402x92, exactly the
       * height of the nav row beside it. Two-anchor ramp, 92 at 402 → 160 at 1440.
       */}
      <ScrollEdgeEffect className="site-nav-band absolute inset-x-0 top-0 h-[clamp(92px,6.5510597vw_+_65.6647399px,160px)]" />

      {/* `site-nav` is both the scrolled-state hook and the view-transition name: this pill
          is the same element on all three marketing pages, so it should not move when one
          becomes another. See micro-motion.css. */}
      {/* The pill's block and right padding are 16 on BOTH frames (1190:780 is a flat p-16;
          935:451 is py-4 pr-4), so only the left inset interpolates: 16 at 402 → 40 at 1440.
          The asymmetry at 1440 is what centres the link row against the register button. */}
      <nav className="site-nav pointer-events-auto relative mx-auto flex max-w-[1320px] items-center justify-between gap-6 rounded-[100px] bg-white py-4 pr-4 pl-[clamp(16px,2.3121387vw_+_6.7052023px,40px)] shadow-soft">
        <NavLink to="/" viewTransition className="mm-press shrink-0">
          {/* Flat 40, not a ramp: `1190:781` is 178x40 and the 1440 logo is 40 too — the
              phone frame draws the wordmark at full desktop size and simply drops the links
              and the register button to make room for it. The old `32 + 8*--fl` was a
              375-floor guess that made the phone logo 32.2 and the pill 8px too short. */}
          <img src="/assets/logo-nav.png" alt="BangMod Hackathon 2026" className="h-10 w-auto" />
        </NavLink>

        {/*
         * Figma spaces the three labels on 177.33 centres — three 97.33 cells 80 apart.
         * The labels are wider than their cells and overhang symmetrically, so each one
         * gets a centred, non-wrapping cell rather than being packed by its own width.
         * Both the cell and the gap ride the ramp, which is what lets the row appear from
         * `md` up: at 1024 the old layout jumped straight from a hamburger to full 80-apart
         * desktop spacing, and the tablet band had room for the links all along.
         */}
        <ul
          ref={listRef}
          className="relative hidden items-center md:grid md:grid-cols-3 md:gap-[calc(12px_+_68*var(--fl))]"
        >
          {NAV_LINKS.map((link) => (
            <li key={link.to} className="flex justify-center md:w-[calc(64px_+_33.33*var(--fl))]">
              <NavLink
                to={link.to}
                viewTransition
                className={({ isActive }) =>
                  `mm-link mm-press fl-nav leading-[1.4] whitespace-nowrap hover:text-brand-red ${
                    isActive ? 'font-semibold' : 'font-normal'
                  }`
                }
              >
                {link.label}
              </NavLink>
            </li>
          ))}

          {/* Absolutely positioned, so it is out of flow and never becomes a fourth track
              in the three-column grid.
             `site-nav-indicator` is a view-transition name of its own, because the pill it
              lives in is PINNED across a marketing hop: inside a pinned snapshot the bar
              would jump to the new label instead of travelling to it. Named separately, the
              browser interpolates its box between the two snapshots and the travel happens
              during the page transition rather than after it. */}
          {bar && (
            <span
              aria-hidden
              className="mm-indicator site-nav-indicator absolute top-0 left-0 h-[2px] rounded-full bg-brand-red"
              style={{ width: bar.w, transform: `translate(${bar.x}px, ${bar.y}px)` }}
            />
          )}
        </ul>

        <div className="flex items-center gap-2">
          <Link
            to="/signin"
            className="mm-press fl-nav hidden rounded-[100px] bg-brand-red px-[calc(14px_+_26*var(--fl))] py-[calc(8px_+_4*var(--fl))] leading-[1.4] font-bold whitespace-nowrap text-white transition-opacity hover:opacity-90 sm:block"
          >
            ลงทะเบียน
          </Link>
          {/*
           * `1190:782` is a bare 24x24 `menu_regular` glyph in ink, sitting directly on the
           * white pill — no red disc. The disc was invented when there was no phone frame.
           *
           * The 44px box stays: it is the touch target, and the glyph inside is the 24 the
           * design draws. `-my-0.5` cancels the 4px the 44 box would otherwise add to a row
           * whose height Figma sets from the 40px logo, so the pill stays 72 tall. `-mr-2.5`
           * puts the glyph's own box at 322..346 inside the 362 pill — Figma's x — with the
           * extra 10px of target hanging into the pill's padding; from `sm` up the register
           * button is beside it and the target goes back inside the padding box.
           */}
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="site-nav-menu"
            aria-label="เมนู"
            className="mm-press-icon -my-0.5 -mr-2.5 flex size-11 items-center justify-center rounded-full text-ink sm:mr-0 md:hidden"
          >
            {/* both glyphs are stacked and cross-faded, so the button never reflows
                mid-swap and the bars appear to rotate into the cross */}
            <span aria-hidden data-on={open} className="mm-swap mm-swap-rotate size-6">
              <span className="mm-swap-off">
                <MenuGlyph />
              </span>
              <span className="mm-swap-on">
                <CloseGlyph />
              </span>
            </span>
          </button>
        </div>
      </nav>

      {/*
       * The panel stays mounted so closing animates too — unmounting on close would make
       * the menu snap shut. The collapsed row is 0fr, so a closed menu is invisible and
       * `inert` keeps it out of the tab order.
       *
       * `pointer-events-none` while closed, though, and that is a fix rather than a tidy-up.
       * `min-height: 0` on a grid item collapses its CONTENT box, not its padding: with the
       * panel's own `p-6` and `mt-3` outside the 0fr track, the closed wrapper still measured
       * 60px tall. It was invisible (opacity 0) and unfocusable (`inert` covers the subtree)
       * but the wrapper itself is neither, so a 402x60 transparent strip sat across the top of
       * every phone page swallowing taps — `elementFromPoint(201, 130)` returned this div, not
       * the page. That strip lands exactly where the phone hero's lockup now begins (y151 per
       * `1190:672`), so the masthead was the first thing it stole. `inert` is left as it is:
       * it is what answers for the keyboard, and this answers for the finger.
       */}
      <div
        className={`mm-collapse relative mx-auto max-w-[1320px] md:hidden ${
          open ? 'is-open pointer-events-auto' : ''
        }`}
      >
        {/* `id` is the hamburger's `aria-controls` target: the button says what it opens and
            whether it is open, and `inert` is what makes "closed" true for the keyboard too. */}
        <ul
          id="site-nav-menu"
          inert={!open}
          className="mt-3 flex flex-col gap-4 rounded-3xl bg-white p-6 shadow-soft"
        >
          {NAV_LINKS.map((link) => (
            <li key={link.to}>
              <NavLink
                to={link.to}
                viewTransition
                onClick={() => setOpen(false)}
                /* `min-h-11` and not just a line box: at 18px/1.4 the anchor was a 25px
                   target on the one surface that is only ever used by a finger. */
                className="mm-link mm-press flex min-h-11 items-center text-lg hover:text-brand-red"
              >
                {link.label}
              </NavLink>
            </li>
          ))}
          <li>
            <Link
              to="/signin"
              onClick={() => setOpen(false)}
              className="mm-press block rounded-[100px] bg-brand-red px-8 py-3 text-center text-lg font-bold text-white"
            >
              ลงทะเบียน
            </Link>
          </li>
        </ul>
      </div>
    </div>
  )
}
