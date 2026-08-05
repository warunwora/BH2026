# BangMod Hackathon 2026

Marketing site and registration flow for BH-2026. React 19, Vite, Tailwind v4, React Router 7
data router. No animation library, no state library, no backend. Thai only, one typeface
(Noto Sans Thai).

```bash
npm install
npm run dev      # vite, port 5173
npm run build    # tsc -b && vite build
npm run preview
```

Node version is pinned in `.nvmrc` (26). CI (`.github/workflows/ci.yml`) runs `npm ci` and
`npm run build` — the typecheck and the bundle — on every pull request and every push to `main`.

## Routes

`RootLayout` wraps everything. `SiteLayout` adds the nav/footer chrome to the three marketing
pages; every auth screen stands alone.

| path                        | screen                          |
| --------------------------- | ------------------------------- |
| `/`                         | `Home`                          |
| `/guide`                    | `About`                         |
| `/hall-of-fame`             | `PastEvents`                    |
| `/signin`                   | `SignIn` — the gate             |
| `/register`                 | `Register` — the account screen  |
| `/register/team`            | wizard step 1                   |
| `/register/advisor`         | wizard step 2                   |
| `/register/entrant/:index`  | wizard step 3, one per entrant  |
| `/register/terms`           | wizard step 4                   |
| `/register/success` `/error`| result screens                  |
| `/my-team`                  | dashboard                       |
| `*`                         | `NotFound` (Figma 708:1240)     |

**The router must stay a data router.** `viewTransition` on `<Link>` / `navigate` is implemented
inside `<RouterProvider>` only — under `<BrowserRouter>` the option is accepted and silently
discarded, `document.startViewTransition` is never called, every `::view-transition-*` rule
becomes dead code, `<ScrollRestoration>` cannot mount, and a back press can never animate. See
the header of `src/App.tsx`.

## Where the layout numbers come from

The design lives in a Figma file drawn on a **1440 canvas with a 1200 content column**
(x120–1320). Auth and wizard screens use a 1040 column at x200; the dashboard a 1240 at x100.
Marketing sections are 1024 tall.

**Responsive status.** There are no Figma frames below 1440 yet. Mobile frames are being drawn,
and the tablet / sub-desktop range is still being revised. So every phone and tablet layout in
this repo is a decision made here rather than a transcription — the reasoning for each is in a
comment beside it, and any of them may be replaced once the frames land. Treat those comments as
the spec until then.

### Four traps in the Figma file

All four have each cost more than one working session, and all four are still true.

**`get_metadata` lies about rotated and flipped nodes.** It reports the _transformed_ corner, not
the bounding box. The cream field behind the FAQ (`935:1125`) reports `y = 3495`; its real top is
`2332`, exactly one height higher, because the node is flipped. Ask `get_design_context` for the
**parent frame** — that states real bounding boxes.

**An image crop is stated against the node's inner, unrotated box.** Read against the outer box
with the rotation dropped and Figma's numbers look wrong when they are not. A round was spent
"re-solving" the guide page's napkins by eye on that misreading, which turned a napkin laid
diagonally across the masthead into a 213px sliver of cloth.

**Layer names lie.** `Background / Green` is filled yellow. Pair decorations by fill, never by
name.

**Some marks are clipped, not scaled.** The footer's CPE logo is a 57×28 window over a 65×44.9
drawing; fitting such a node by height comes out too narrow. Look for `overflow-clip` plus
negative insets before you size an image. Related: a percentage `inset` cannot size a _replaced_
element, so a cropped `<img>` needs explicit percentage `width` / `height`, or the crop only
agrees with the artwork at one exact box size.

## The fluid scale

Every size was once a hard px with a second hard px behind `lg:`, which gave the site exactly two
sizes and a jump at 1024. It is now driven by two ramps in `src/index.css`, both **lengths**
running `0px → 1px`:

```css
--fl: clamp(0px, calc((100vw - 375px) / 1065), 1px); /* 375 → 1440 */
--flv: clamp(0px, calc((100vw - 375px) / 649), 1px); /* 375 → 1024 */
```

A unitless number times a length is a length, so every token reads
`calc(MIN + DELTA * var(--fl))` — "starts here, moves by this much" — and no token needs its own
`clamp()`.

- `--fl` tops out at 1440 and freezes, because the decorations are painted on 1440-wide canvases.
- `--flv` drives vertical section padding only. It reaches its Figma value at **1024** and holds,
  because those canvases pin props at absolute _y_, and shortening a section's tail slides
  content off its artwork.

Keep these **lengths**. As a unitless `0`/`1`, a ramp makes `calc(96px + 355.5 * var(--ramp))`
invalid, which silently zeroes every decoration field at every width.

**Type is one eight-rank ladder** (`fl-display` → `fl-caption`, `@utility` blocks in
`index.css`) in which MIN _and_ DELTA both decrease strictly. The gap between neighbouring ranks
is therefore `a + b·--fl` with `a > 0` and `b > 0` — positive at every viewport width, so the
hierarchy is ordered **by construction** rather than by spot-checking two breakpoints. That is
how an earlier ten-utility set with overlapping ranges managed to invert at widths nobody had
opened. If you add a rank, preserve the property.

The ladder is calibrated against the **registration screens'** measured sizes, not Figma's 1440
marketing numbers — those are drawn for a 1440 display, and reading them literally left the
marketing pages a full step louder than the wizard beside them.

Decoration groups that scale as a whole (`.decor-stage`, `.decor-fit`, `.hof-band`,
`.team-decor-stage`) need a plain **ratio** from `100vw / 1440px`. They get it via
`tan(atan2(100vw, 1440px))`, and several comments in `index.css` and `pasta-motion.css` claim
`calc()` cannot divide a length by a length. **That claim is out of date** — CSS Values 4 allows
length ÷ length, and `scale: calc(100vw / 1440px)` measures correctly in Chrome 151, including
through a custom property. Both forms work; prefer the plain division in new code and read those
comments as history.

## Horizontal overflow: `clip`, never `hidden`

`overflow-x: hidden` makes a box a scroll container that is **still pannable by touch** — the
overflow is merely not painted. `overflow-x: clip` creates no scrollport at all.

This matters more than it sounds. Under Chrome's mobile emulation the layout viewport _grows to
cover_ horizontal overflow, so a decoration hanging 80px past the right edge makes the initial
containing block 80px wider than the screen — which lets the page be dragged onto blank white and
pushes any `fixed inset-x-0` element out of the screen's centre.

So the clip lives **inside the document**, on each page root, as well as on `html`:

- marketing roots take **`overflow-x-clip`**;
- the auth gate, `WizardShell`, the dashboard and the 404 take **`overflow-clip`**, because their
  backdrops bleed on every side and the root is relied on to clip the vertical bleed too — the
  header of `AuthBackdrop.tsx` says as much, and `overflow-x-clip` alone would let the collage
  lengthen the page.

Those five roots carried `overflow-hidden` until 2026-08-05. It clipped identically and left every
one of them pannable.

What `clip` does **not** break, measured on `/register/terms` in Chrome 151: a `fixed inset-0`
descendant. `WizardShell`'s policy-modal scrim still measures the full viewport and still hit-tests
at the centre from inside the clipped root, because `overflow` alone — unlike a `transform`,
`filter` or `contain` — does not make an element the containing block for fixed descendants. That
is also why the overlay must stay out of the transformed `auth-recede` wrapper, and why the clip
can sit on the root without moving it.

Nothing under `src/` uses `position: sticky` today. If you add one, keep in mind it resolves
against the nearest scroll container — which for these roots is the document, since `clip` creates
no scrollport.

**The acceptance test is `innerWidth == clientWidth == scrollWidth`** under real mobile emulation.
Not `window.scrollX` after a programmatic scroll: a pan snaps back, so that reads 0 even while the
page is pannable, and it hid this bug for two rounds. Setting `scrollLeft` and reading it back is
a fair check; comparing every element's bounding rect with the property toggled is how you prove a
`hidden → clip` swap changed no layout.

## Motion

Four stylesheets plus `index.css`, all imported from `index.css`:

| file               | owns                                                                                       |
| ------------------ | ------------------------------------------------------------------------------------------ |
| `micro-motion.css` | `.mm-*` — press, hover, lift, swap, collapse, indicator, and the marketing page transition |
| `auth-motion.css`  | the sign-in → register → wizard → result flow, direction-aware                             |
| `pasta-motion.css` | decoration motion: the rigatoni flow and idle, the three turning rings, `.decor-stage`     |
| `liquid.css`       | the hero CTA's pointer-driven liquid button                                                |
| `index.css`        | the scroll-reveal system, driven by `hooks/useReveal.ts`                                   |

**Interaction transforms go on the `translate` / `scale` longhands, never on `transform`.** The
reveal system sets `transform: none` on a visible element at a specificity that beats every hover
and press rule, so anything written as `transform` is silently dead. The same applies to combining
a Tailwind transform utility with a CSS one on a single element.

**Never set `transition` as a shorthand on a shared utility class.** It resets
`transition-property`, and these classes are unlayered while Tailwind's utilities sit in
`@layer utilities` and lose. One such shorthand on `.mm-press` silently killed the colour and
opacity transitions at twenty call sites.

**The view-transition pseudo tree hangs off the document element directly**, so
`:root[data-x] ::view-transition-group(y)` — with a space — parses fine and matches nothing.

The marketing and auth transitions are kept apart by a **positive** marker
(`:root[data-site-nav='marketing']`), because `data-auth-nav` is never cleared and so cannot be
tested for absence. Direction awareness comes from subscribing to the router, not to `popstate`:
a `popstate` listener only runs after React has committed the new screen, too late to publish a
direction. See `components/form/wizardNav.ts`.

**Reversing a transition means reversing where things go, not transcribing the easing backwards.**
The exact time-reverse of an ease-out puts a sheet 3% of the way down at the halfway point and
then throws the remaining 90% in the last 120ms, which reads as the element freezing and then
vanishing.

Every animation honours `prefers-reduced-motion: reduce` by landing in its final state. And
`scroll-behavior: smooth` is scoped to fragment navigation only — applied globally, a restoration
scroll consumes every reveal on the arriving page before that page is even visible.

**The animation inventory is additive.** Existing effects are not removed; a defect is fixed by
adjusting its values, its origin, or what it is anchored to.

## The progressive blur

`src/components/ScrollEdgeEffect.tsx` reproduces Figma's "Scroll Edge Effect": seven crossfading
`backdrop-filter` layers, radii in a geometric series, each masked opaque from the solid edge to
its own station and then ramped to the next-weaker one. One masked filter reads as a fog bank with
a line where it ends; N stacked ones do not compound, because a backdrop filter samples the page
rather than the layer below it. Read that file's header before changing it — it records which
alternatives were tried and why each failed.

Two caps matter, both because a number measured on a 1440 canvas does not transfer: the peak
radius is capped against the band's own height in `cqh`, and the ramp's depth against a length.
**A caller must state a band height that matches the chrome it softens.** A 160px band over a
107px header drops 53px of ramp tail onto the content below and ends on a hard line — the grey
slab that got reported three times.

## Measure headed, never headless

Headless Chromium misrenders masked `backdrop-filter` stacks above `deviceScaleFactor: 1`, showing
a flat opaque slab a real browser never draws, and reports `innerWidth: 477` against
`clientWidth: 390` under mobile emulation. **Two separate false diagnoses on this project came out
of headless runs.** Use `chromium.launch({ headless: false })` and emulate properly:
`isMobile: true, hasTouch: true, deviceScaleFactor: 3`.

Verify against the real thing rather than by eye: read `getComputedStyle`, log
`document.getAnimations()`, sample a pixel column down a blur band, count `startViewTransition`
calls by monkey-patching it before the click.

## Known gaps

Deliberately unwired — there is no backend, and the motion for each already exists in CSS:

- **No validation.** No `<form>`, no `onSubmit`, no `aria-invalid`. `required` reaches the `Label`
  (which draws the red asterisk) and never the `<input>`, so native constraint validation does not
  run either. `.auth-field-error`, `.auth-field[data-invalid]`, `auth-field-in` and `auth-nudge`
  are ready in `auth-motion.css`.
- **`SubmitButton` performs no submission** — it flips `data-busy` and navigates.
- **Uploads are local only.** A chosen file is held in component state; nothing is sent.

One structural limit worth knowing before you touch the wizard: **every step is its own route**,
so `WizardShell` fully remounts on nearly every hop. Anything that must animate _between_ steps
from its previous value — the progress bar's fill is the live example — cannot do so from CSS
alone. It would need the bar hoisted into a shared layout route.
