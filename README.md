# BangMod Hackathon 2026

Marketing site and registration flow for BH-2026. React 19 + Vite + Tailwind v4, no animation
library, no state library, no backend.

```bash
npm install
npm run dev      # vite
npm run build    # tsc -b && vite build
npm run preview
```

Thai only, one typeface (Noto Sans Thai). Routes: `/`, `/guide`, `/hall-of-fame` share the
nav/footer chrome; `/signin`, `/register`, `/register/*`, `/my-team` and the 404 stand alone.

---

## Read this before you change a size or a position

The design lives in a Figma file drawn on a **1440 canvas with a 1200 content column**
(x120–1320). The auth and wizard screens use a 1040 column at x200; the dashboard a 1240 at x100.
Marketing sections are 1024 tall. **There are no Figma frames below 1440** — every phone and
tablet layout in this repo is a decision made here, not a transcription, and the reasoning for
each one is in a comment next to it.

Four traps in that file have each cost more than one working session. They are all still true.

**`get_metadata` lies about rotated and flipped nodes.** It reports the _transformed_ corner, not
the bounding box. The cream field behind the FAQ (`935:1125`) reports `y = 3495`; its real top is
`2332`, exactly one height higher, because the node is flipped. Ask `get_design_context` for the
**parent frame** — that states real bounding boxes.

**Figma states an image crop against the node's inner, unrotated box.** Read against the outer
box with the rotation dropped, Figma's own numbers look wrong and are not. A round was spent
"re-solving" the guide page's napkins by eye on that misreading, which turned a napkin laid
diagonally across the masthead into a 213px sliver of cloth.

**Layer names lie.** `Background / Green` is filled yellow. Pair decorations by fill, never by
name.

**Some marks are clipped, not scaled.** The footer's CPE logo is a 57×28 window over a 65×44.9
drawing. Fitting such a node by height comes out too narrow — look for `overflow-clip` plus
negative insets before you size an image. Related: percentage `inset` cannot size a _replaced_
element, so a cropped `<img>` needs explicit percentage `width`/`height`, or the crop only agrees
with the artwork at one exact box size.

---

## The fluid scale

Every size was originally transcribed as a hard px with a second hard px behind `lg:`, which gave
the site exactly two sizes and a jump at 1024. It is now driven by two ramps in `src/index.css`,
both **lengths** running `0px → 1px`:

```css
--fl: clamp(0px, calc((100vw - 375px) / 1065), 1px); /* 375 → 1440 */
--flv: clamp(0px, calc((100vw - 375px) / 649), 1px); /* 375 → 1024 */
```

A unitless number times a length is a length, so every token reads as
`calc(MIN + DELTA * var(--fl))` — "starts here, moves by this much" — and no token needs its own
`clamp()`.

`--fl` tops out at 1440 and freezes, because the decorations are painted on 1440-wide canvases.
`--flv` (vertical section padding only) reaches its Figma value at **1024** and holds, because
those canvases pin props at absolute _y_ and shortening a section's tail slides content off its
artwork.

**Type is one eight-rank ladder** (`fl-display` → `fl-caption`) in which MIN _and_ DELTA both
decrease strictly. The gap between neighbouring ranks is therefore `a + b·--fl` with `a > 0` and
`b > 0` — positive at every viewport width. The hierarchy is ordered **by construction**, not by
spot-checking two breakpoints, which is how an earlier ten-utility set with overlapping ranges
managed to invert at widths nobody had opened. If you add a rank, preserve that property.

The ladder is calibrated against the **registration screens'** measured sizes, not against
Figma's 1440 marketing numbers — those are drawn for a 1440 display and reading them literally
left the marketing pages a full step louder than the wizard beside them.

`--flvd` and `--decor-fit` must stay **lengths and ratios respectively**. As a unitless `0`/`1`,
`--flvd` makes `calc(96px + 355.5 * var(--flvd))` invalid and silently zeroes every decoration
field at every width.

Decoration groups that scale as a whole (`.decor-stage`, `.hof-band`, `.team-decor-stage`) need a
plain number from `100vw / 1440px`. They currently get it via `tan(atan2(100vw, 1440px))`, and
several comments in `index.css` and `pasta-motion.css` say that `calc()` cannot divide a length
by a length. **That is out of date** — measured in Chrome 151, `scale: calc(100vw / 1440px)`
resolves correctly, as does the same expression through a custom property. CSS Values 4 allows
length ÷ length. The `tan(atan2(…))` form is simply the older idiom with the longer support tail;
both work, so prefer the plain division in new code and treat those comments as historical.

---

## Horizontal overflow: `clip`, never `hidden`

`overflow-x: hidden` makes a box a scroll container that is **still pannable by touch**.
`overflow-x: clip` does not. And under Chrome's mobile emulation the layout viewport _grows to
cover_ horizontal overflow, so a decoration hanging 80px past the right edge makes the initial
containing block 80px wider than the screen — which lets the page be dragged onto blank white and
pushes any `fixed inset-x-0` element out of the screen's centre.

So the clip lives **inside the document**, on each page root, as well as on `html`. The
acceptance test is `innerWidth == clientWidth == scrollWidth` under real mobile emulation, not
`window.scrollX` after a programmatic scroll — that reads 0 even when the page is pannable, and
it hid this bug for two rounds.

---

## Motion

Five stylesheets, all imported from `index.css`:

| file               | owns                                                                                       |
| ------------------ | ------------------------------------------------------------------------------------------ |
| `micro-motion.css` | `.mm-*` — press, hover, lift, swap, collapse, indicator, and the marketing page transition |
| `auth-motion.css`  | the sign-in → register → wizard → result flow, direction-aware                             |
| `pasta-motion.css` | decoration motion: the rigatoni flow and idle, the three turning rings, `.decor-stage`     |
| `liquid.css`       | the hero CTA's pointer-driven liquid button                                                |
| `index.css`        | the scroll-reveal system                                                                   |

**Interaction transforms go on the `translate` / `scale` longhands, never on `transform`.** The
reveal system sets `transform: none` on a visible element at a specificity that beats every
hover and press rule, so anything written as `transform` is silently dead. The same applies to
combining a Tailwind transform utility with a CSS one on a single element.

**Never set `transition` as a shorthand on a shared utility class.** It resets
`transition-property`, and these classes are unlayered while Tailwind's utilities are in
`@layer utilities` and lose. One such shorthand on `.mm-press` silently killed the colour and
opacity transitions at twenty call sites.

**Route transitions need the data router.** `viewTransition` on `<Link>`/`navigate` is implemented
inside `<RouterProvider>`; under `<BrowserRouter>` the option is accepted and silently discarded,
so `document.startViewTransition` is never called and every `::view-transition-*` rule is dead
code. Also: the view-transition pseudo tree hangs off the document element **directly**, so
`:root[data-x] ::view-transition-group(y)` — with a space — parses fine and matches nothing.

The marketing and auth transitions are kept apart by a **positive** marker
(`:root[data-site-nav='marketing']`), because `data-auth-nav` is never cleared and so cannot be
tested for absence.

**Reversing a transition means reversing where things go, not transcribing the easing
backwards.** The exact time-reverse of an ease-out puts a sheet 3% of the way down at the halfway
point and then throws the remaining 90% in the last 120ms, which reads as the element freezing
and then vanishing.

Every animation honours `prefers-reduced-motion: reduce` by landing in its final state. And
`scroll-behavior: smooth` is scoped to fragment navigation only — applied globally it lets a
restoration scroll consume every reveal on the arriving page before that page is even visible.

**The animation inventory is additive.** Existing effects are not removed; a defect is fixed by
adjusting its values, its origin or what it is anchored to.

---

## The progressive blur

`src/components/ScrollEdgeEffect.tsx` reproduces Figma's "Scroll Edge Effect". It is seven
crossfading `backdrop-filter` layers — radii in a geometric series, each masked opaque from the
solid edge to its own station and then ramping to the next-weaker one. A single masked filter
reads as a fog bank with a line where it ends; N stacked ones do not compound, because a backdrop
filter samples the page rather than the layer below it. Read that file's header before changing
it; it records which alternatives were tried and why each failed.

Two caps matter, and both exist because a number measured on a 1440 canvas does not transfer:
the peak radius is capped against the band's own height in `cqh`, and the ramp's depth against a
length. **A caller must state a band height that matches the chrome it softens** — a 160px band
over a 107px header drops 53px of ramp tail onto the content below and ends on a hard line, which
is the grey slab that got reported three times.

---

## Measure headed, never headless

Headless Chromium misrenders masked `backdrop-filter` stacks above `deviceScaleFactor: 1` — it
shows a flat opaque slab that a real browser never draws — and reports `innerWidth: 477` against
`clientWidth: 390` under mobile emulation. **Two separate false diagnoses on this project came
out of headless runs.** Use `chromium.launch({ headless: false })`, and emulate properly:
`isMobile: true, hasTouch: true, deviceScaleFactor: 3`.

Verify against the real thing rather than by eye: read `getComputedStyle`, log
`document.getAnimations()`, sample a pixel column down a blur band, count
`startViewTransition` calls by monkey-patching it before the click.

---

## Known gaps

Deliberately unwired — there is no backend, and the motion for each already exists in CSS:

- **No validation.** No `<form>`, no `onSubmit`, no `aria-invalid`; `required` reaches the
  `Label` (which draws the red asterisk) and never the `<input>`, so native constraint validation
  does not run either. `.auth-field-error`, `.auth-field[data-invalid]`, `auth-field-in` and
  `auth-nudge` are ready in `auth-motion.css`.
- **`SubmitButton` performs no submission** — it flips `data-busy` and navigates.
- **Uploads are local only.** A chosen file is held in component state; nothing is sent.

One structural limit worth knowing before you touch the wizard: **every step is its own route**,
so `WizardShell` fully remounts on nearly every hop. Anything that needs to animate _between_
steps from its previous value — the progress bar's fill is the live example — cannot do so from
CSS alone; it would need the bar hoisted into a shared layout route.
