import { Link } from 'react-router-dom'
import { FOOTER_ABOUT, FOOTER_GROUPS, SOCIAL_LINKS } from '../data'
import { useReveal } from '../hooks/useReveal'
import { VERSION_LABEL } from '../version'

/*
 * ------------------------------------------------------------------ font weights, audited
 *
 * Every text node in both footer frames was read back off Figma on 2026-08-06 and the whole
 * footer resolves to just two weights:
 *
 *   Regular / 400   title `708:375` + `1190:912`/`1190:1454`, body `708:376` + `1190:1455`,
 *                   the four column headings `708:381` `708:386` `708:390` `708:395`, all
 *                   nine link labels (`708:382`–`708:384`, `708:387`, `708:391`–`708:393`),
 *                   and both social labels at either end (`708:399`/`708:405`,
 *                   `1190:1460`/`1190:1466`).
 *   Light / 300     the build stamp `708:377` and the copyright `1261:85` / `1190:1467`.
 *
 * Nothing in this file needed changing for that. `index.css` sets no `font-weight` at all, so
 * `body` inherits the UA's `normal` = 400, which IS Figma's Regular — every 400 node above is
 * already right by inheritance, and the only weight class in this file is the `font-light` on
 * `BottomRow`, which is the only pair Figma sets to Light. No ancestor of `<Footer/>` reweights
 * it either (`SiteLayout` in App.tsx carries no type classes). 300 and 400 are both in the
 * `index.html` Noto Sans Thai request (`wght@300;400;500;600;700`), so neither is synthesised.
 *
 * Weight is not on the `fl-*` ladder — it is matched per node, so do not "ramp" it: if a node
 * here ever disagrees with Figma, restate that node's weight rather than moving a token.
 * ------------------------------------------------------------------------------------------
 */

/**
 * Two anchors, as everywhere else this round. `1190:831` "Section / Footer" is 402x472 with
 * its content `1190:832` inset 24 on all four sides (it read 454 when this was solved; the
 * frame grew because its own copyright box `1190:925` is 54 tall where `1190:1373`'s
 * `1190:1467` is 36 — the inset is 24 in both, which is all this ramp reads); `935:451` has
 * the same card at 60 /
 * 60 / 100. `shell-wide` and the two old `calc()`s only knew the 1440 end, so the phone card
 * was padded 17.1 / 40.5 / 64.9. Each line lands on its Figma value to 0.001px at 402 and at
 * 1440, so the desktop footer is unchanged to the pixel.
 */
const FOOTER_PAD: React.CSSProperties = {
  paddingInline: 'clamp(24px, 3.4682081vw + 10.0578035px, 60px)',
  paddingTop: 'clamp(24px, 3.4682081vw + 10.0578035px, 60px)',
  paddingBottom: 'clamp(24px, 7.3217726vw - 5.433526px, 100px)',
}

/**
 * The footer's bottom line: the build stamp, then the copyright. Both frames have one, so it
 * is one component — the phone centres it, the 1440 column left-aligns it.
 *
 * The stamp borrows the copyright's own type entirely (`text-xs` / 1.5 / Light / `gray-1`, the
 * one place in this file that is a fixed size rather than an `fl-*` token) so it reads as part
 * of the same line and not as a second, louder thing. `tabular-nums` keeps the digits from
 * shifting the copyright sideways build to build, and `whitespace-nowrap` keeps the version
 * itself from ever breaking mid-string.
 *
 * `flex-wrap` with a 12/4 gap rather than one long line: the copyright alone already runs to
 * two lines at 402, so on a phone the stamp takes its own line above it instead of pushing the
 * row past the card's padding. From `md` up the pair fits on one line as the design shows.
 */
/*
 * The version stamp and the copyright, which Figma sets as ONE 18-tall line:
 * `1261:86` is the row, `708:377` the 113-wide stamp, `1261:85` the 479-wide copyright at
 * x125 — so a flat 12 gap, 12px/1.5 type, and a row that is **604 wide inside a 600 column**.
 * Figma lets it overhang by 4px rather than break it, and that is the whole reason for the
 * `min-[1440px]` pair below: 113 + 12 + 479 does not fit the column at any narrower width, so
 * everywhere else the row has to be allowed to wrap (at 402 the copyright alone takes two
 * lines and the stamp takes its own). `w-max` is what reproduces the overhang; without it the
 * 600 column forces a break at 1440 and the pair renders as two lines, which is not the
 * design.
 *
 * `tabular-nums` keeps the digits from nudging the copyright sideways between builds, since
 * the date half changes on every merge.
 */
function BottomRow({ className = '' }: { className?: string }) {
  return (
    <div
      className={`flex flex-wrap items-baseline gap-x-3 gap-y-1 text-xs leading-[1.5] font-light text-gray-1 min-[1440px]:w-max min-[1440px]:flex-nowrap ${className}`}
    >
      <span className="tabular-nums whitespace-nowrap">{VERSION_LABEL}</span>
      <p className="min-[1440px]:whitespace-nowrap">{FOOTER_ABOUT.copyright}</p>
    </div>
  )
}

/**
 * The sponsor lockup — `1419:1089` at 1440 and `1419:1393` at 402.
 *
 * Figma redrew this: it is now ONE row of four marks separated by three hairlines —
 * KMUTT, คณะวิศวกรรมศาสตร์ / Faculty of Engineering, CPE, BangMod Hackathon 2026 — where the
 * old lockup stacked the BH logo above a shorter strip of university marks, and the desktop
 * row carried only three items.
 *
 * Every size is a two-anchor ramp through the two frames, so the row interpolates rather than
 * stepping at a breakpoint:
 *
 *   gap        7  -> 12     KMUTT     28 -> 43     faculty  22 -> 33
 *   CPE       22  -> 34     BH        26 -> 40     rule     34 -> 52
 *
 * Only HEIGHT is set. Each mark is its own SVG at its Figma aspect ratio, so `w-auto` lands on
 * Figma's widths without a second number to keep in sync — 38/146/70/183 at 1440. The one
 * exception is BH, which stays the existing `logo-nav.png`: Figma's SVG export of that frame
 * embeds the raster and weighs 1.99 MB, against 150 KB for the PNG already in the bundle.
 *
 * The rules are `#b9b9b9` — read off `1419:1111`'s stroke, not the ink the previous lockup used.
 *
 * `shrink-0` throughout and the row is allowed to wrap on the phone: at 320 the lockup's own
 * 329 would otherwise force the page to pan, which is the one thing this site may never do.
 */
const MARK_GAP = 'gap-[calc(6.87px_+_5.13*var(--fl))]'
const RULE = 'w-px shrink-0 bg-[#b9b9b9] h-[calc(33.532px_+_18.468*var(--fl))]'

function SponsorLockup({ className = '' }: { className?: string }) {
  return (
    <div className={`flex flex-wrap items-center justify-center ${MARK_GAP} ${className}`}>
      <img
        src="/assets/footer-kmutt.svg"
        alt="มหาวิทยาลัยเทคโนโลยีพระจอมเกล้าธนบุรี"
        className="h-[calc(27.61px_+_15.39*var(--fl))] w-auto shrink-0"
      />
      <span aria-hidden className={RULE} />
      <img
        src="/assets/footer-faculty.svg"
        alt="คณะวิศวกรรมศาสตร์ Faculty of Engineering"
        className="h-[calc(21.714px_+_11.286*var(--fl))] w-auto shrink-0"
      />
      <span aria-hidden className={RULE} />
      <img
        src="/assets/footer-cpe.svg"
        alt="ภาควิชาวิศวกรรมคอมพิวเตอร์"
        className="h-[calc(21.688px_+_12.312*var(--fl))] w-auto shrink-0"
      />
      <span aria-hidden className={RULE} />
      <Link to="/" viewTransition className="mm-press shrink-0">
        <img
          src="/assets/logo-nav.png"
          alt="BangMod Hackathon 2026"
          className="h-[calc(25.636px_+_14.364*var(--fl))] w-auto"
        />
      </Link>
    </div>
  )
}

export default function Footer() {
  /*
   * G7 — the footer closes all three marketing pages and was the only band on any of them
   * that simply appeared. Both columns arrive, 70ms apart, which is the ladder every other
   * row on these pages uses.
   *
   * A reveal each rather than one `reveal-group` on the row. From `lg` up the two columns are
   * side by side and share a trigger, so the ladder reads exactly as a group's would; below
   * `lg` they stack into a band taller than the phone viewport, and one trigger put the link
   * columns at 1.08–1.15 of the viewport at the frame they were told to animate — the same
   * defect the prize and scope grids had. The delay is inline as `--reveal-delay`, which is
   * spent only on the reveal's own opacity and transform (index.css).
   *
   * Opacity and transform only, which is all the reveal animates: the desktop footer's
   * geometry is frozen (see the notes below on the 500 block and `lg:w-full`) and nothing
   * here may touch a length.
   */
  const about = useReveal()
  const links = useReveal()

  /*
   * The phone footer is its own composition rather than a narrower desktop one — see the
   * block below — so it needs a trigger of its own. `group` because it is a single centred
   * column of four rows, which is exactly the ladder `reveal-group` staggers; the desktop
   * branch stays two independent reveals because its two halves sit side by side.
   */
  const phone = useReveal({ group: true })

  return (
    /* `relative` so the footer joins the positioned paint step: the page's decoration canvas
       is `-z-10` but a static footer still paints before any positioned box, so any future
       overshoot would land on top of this text instead of behind it.
       `site-footer` names it for the marketing page transition — it is the same element on
       all three pages, so it holds still while the body above it changes. */
    <footer style={FOOTER_PAD} className="site-footer relative rounded-3xl bg-white">
      {/*
       * ===================================================== the phone footer, `1190:831`
       *
       * Not a narrower desktop footer — a different one. The 402 frame centres everything
       * and drops both link columns and the "ติดต่อเรา" heading, leaving four rows: the
       * identity lockup, the project paragraph, the two social links, the copyright.
       *
       * WHAT THIS DROPS, deliberately: the four link groups (หน้าหลัก / คู่มือการแข่งขัน /
       * หอเกียรติยศ / ติดต่อเรา, nine links). Three of the four headings are the three pages
       * the hamburger menu already lists, so no *page* becomes unreachable on a phone. Six
       * of the nine links are in-page fragments (`/#calendar`, `/guide#faq`, …) that a phone
       * reader gets to by scrolling the page they are already on, and the remaining links are
       * one tap from a page the menu offers. That is the trade the design makes, and it buys
       * a 454-tall footer instead of the ~970 the stacked columns cost at 390.
       *
       * The identity lockup also re-flows: at 1440 the logo, both university marks and two
       * hairline rules are one row; at 402 the logo is its own 267x60 row with the two
       * university marks and a single rule beneath it (`1190:835` → `1190:837`).
       *
       * The `md` boundary is the same one the nav and the hero use. Between `md` and `lg` the
       * desktop branch below still renders its own narrow variant, unchanged.
       */}
      <div
        ref={phone.ref}
        className={`flex flex-col items-center gap-6 text-center md:hidden ${phone.cls}`}
      >
        {/* 1190:834 "Sponsor Logos" — the marks and the paragraph are one row of the outer
            column, 32 apart from each other where the outer gaps are 24. Nesting them is
            what puts the paragraph at Figma's y140 rather than 8px high. */}
        <div className="flex w-full flex-col items-center gap-8">
          <SponsorLockup />

          {/* 1190:911 — 16/1.4 ink over 14/1.5 grey, 8 apart. `fl-18` and `fl-14` already
            resolve to exactly 16 and 14 at 402 (both are `max()`-floored), so the phone
            values are the tokens' own narrow ends and nothing has to be restated. */}
          <div className="flex w-full flex-col gap-2">
            {/* `1190:912` is TWO authored runs, so the title is broken here rather than left
                to wrap — see the note on `FOOTER_ABOUT.titleLines`. One `<p>` with a `block`
                span per line, the same shape `Hero` uses for `HERO_LINES`: the paragraph box
                and its 1.4 leading are unchanged, the spans just force the break. Centring
                still applies — `text-center` is on the column above and the spans inherit it. */}
            <p className="fl-18 leading-[1.4]">
              {FOOTER_ABOUT.titleLines.map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
            </p>
            <p className="fl-14 leading-[1.5] text-gray-1">{FOOTER_ABOUT.body}</p>
          </div>
        </div>

        {/* 1190:914 — the two links side by side and centred, 16 apart, with no heading
            above them. `min-h-11` is not in the design: the rows are 24 tall there, and a
            24px target on a phone is half of what a finger needs. It grows the row's box
            only, so the glyph and label still land on Figma's baseline. */}
        <div className="flex items-center justify-center gap-4">
          {SOCIAL_LINKS.map((social) => (
            <a
              key={social.label}
              href={social.href}
              /* A plain external anchor, and deliberately nothing more: `target="_blank"` on a
                 facebook.com / instagram.com URL is exactly what lets iOS and Android hand the
                 tap to the installed app. Anything that intercepts the click — a router Link, a
                 preventDefault, a window.open wrapper — costs that hand-off. `rel` because a
                 `_blank` target otherwise leaks `window.opener` to the new page. */
              target="_blank"
              rel="noopener noreferrer"
              aria-label={social.label}
              className="mm-link mm-press flex min-h-11 items-center gap-1 fl-18 leading-[1.4] hover:text-brand-red"
            >
              {/* a mask, not an <img>, so the glyph goes red with its label — see `.mask-icon` */}
              <span
                aria-hidden
                style={{ '--icon': `url(${social.icon})` } as React.CSSProperties}
                className="mask-icon mm-icon-pop size-6 shrink-0"
              />
              {social.label}
            </a>
          ))}
        </div>

        {/* 1190:925 — 12/1.5 Light grey, centred, now with the build stamp ahead of it */}
        <BottomRow className="justify-center" />
      </div>

      {/* ============================================ `md` and up: the 1440 footer, unchanged */}
      <div className="mx-auto hidden max-w-[1320px] flex-col gap-8 md:flex lg:flex-row lg:justify-between">
        <div
          ref={about.ref}
          className={`flex max-w-[600px] flex-col justify-between gap-8 ${about.cls}`}
        >
          {/*
           * Below `lg` every mark in this identity row steps down. Nothing here is a `lg:`
           * override for its own sake: at the ramp's own narrow end the row needed 358 of a
           * 328 content column on a 360 phone, so it wrapped — and it wrapped after the FIRST
           * rule, which left a lone vertical bar hanging off the end of line one and the two
           * university marks stranded on line two. Three marks separated by rules only read
           * as one lockup while they are on one line. At 32 / 21 / 20 the row measures 309
           * and stays intact at 360, and from `lg` up every value is the one that was here
           * before, so the desktop footer is untouched.
           */}
          <div className="flex flex-col gap-5">
            <SponsorLockup className="justify-start" />

            <div className="flex flex-col gap-2">
              {/* `708:375` is 600x50 — 2 lines at 18/1.4 — and its own wrap falls before
                  `(BangMod`, the same place the phone frames break it by hand. Broken here for
                  the same reason as the phone branch: a hard break is the only thing that
                  survives a different font metric. Line one is ~558 of the 600 column so it
                  still sets on one line at 1440 and the box stays 2 lines tall; below `lg`
                  this column narrows and line one wraps, exactly as it did before. */}
              <p className="fl-18 leading-[1.4]">
                {FOOTER_ABOUT.titleLines.map((line) => (
                  <span key={line} className="block">
                    {line}
                  </span>
                ))}
              </p>
              <p className="fl-16 leading-[1.5] text-gray-1">{FOOTER_ABOUT.body}</p>
            </div>
          </div>

          <BottomRow />
        </div>

        {/*
         * Figma: a 500 block of two flush 250 columns, not a gapped pair.
         *
         * Below `lg` it is the same two columns rather than a wrap. `flex-wrap` with a 200
         * floor could only ever produce one column on a phone, which stacked all four link
         * groups into a 700px ladder — the footer was 970 tall at 390, a fifth of the whole
         * page, and the last thing on it was two social links a long way from anything. Two
         * real columns halve that and keep the desktop's own pairing.
         */}
        <div
          ref={links.ref}
          style={{ '--reveal-delay': '70ms' } as React.CSSProperties}
          className={`grid grid-cols-2 gap-x-6 gap-y-10 lg:w-[500px] lg:gap-0 ${links.cls}`}
        >
          {FOOTER_GROUPS.map((column, i) => (
            /*
             * `lg:w-full` and not `lg:w-[250px]`. The grid is 500 with two columns and no
             * gap, so at 1440 `w-full` IS 250 — but between 1024 and 1159 the 500 does not
             * hold: this block sits in a `justify-between` row beside a 600 one, so it
             * shrinks to as little as 306, and a hard 250 then made each column 97px wider
             * than its own track. Both columns overflowed, the right one past the viewport,
             * and that was the entire horizontal overflow the page had at 1024 — present on
             * every route, and there before this round. Sizing from the track cannot do it.
             */
            <div key={i} className="flex min-w-0 flex-col gap-10 lg:w-full">
              {column.map((group) => (
                <div key={group.heading} className="flex flex-col gap-3">
                  <p className="fl-18 leading-[1.4] text-gray-2">{group.heading}</p>
                  {group.links.map((link) => (
                    <Link
                      key={link.label}
                      to={link.to}
                      /* A page transition for the page links, and none for the fragment
                         links. `/#calendar` and `/guide#faq` do not change what is on
                         screen so much as where you are in it, and their whole point is the
                         smooth scroll `data-fragment-nav` gives them (index.css) — wrapping
                         a scroll in a snapshot cross-fade hides the very motion that says
                         you moved down the page. */
                      viewTransition={!link.to.includes('#')}
                      className="mm-link mm-press inline-block fl-16 leading-[1.4] hover:text-brand-red"
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              ))}

              {/* contact sits under the second column in the design */}
              {i === 1 && (
                <div className="flex flex-col gap-3">
                  <p className="fl-18 leading-[1.4] text-gray-2">ติดต่อเรา</p>
                  {SOCIAL_LINKS.map((social) => (
                    <a
                      key={social.label}
                      href={social.href}
                      /* external, same as the phone row above — see the note there */
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={social.label}
                      className="mm-link mm-press flex items-center gap-2.5 fl-16 leading-[1.4] hover:text-brand-red"
                    >
                      {/* the glyph swells slightly with the row so the whole line, not just
                          the label, acknowledges the hover — and it is a mask rather than an
                          <img>, so it takes the label's colour too (`.mask-icon` in index.css) */}
                      <span
                        aria-hidden
                        style={{ '--icon': `url(${social.icon})` } as React.CSSProperties}
                        className="mask-icon mm-icon-pop size-6 shrink-0"
                      />
                      {social.label}
                    </a>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </footer>
  )
}
