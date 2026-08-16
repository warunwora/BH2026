/**
 * ============================================================================================
 * THE REGISTER FLOW'S TYPE SCALE — a DELIBERATE DEPARTURE FROM FIGMA
 * ============================================================================================
 *
 * Do not "correct" these back to the frames. On 2026-08-16 the user measured the flow against
 * Figma, agreed it matched, and asked for it to be smaller anyway:
 *
 *   "คือไม่ต้องตามใน figma 100% นะ ตอนนี้มันดูใหญ่ไป อยากให้ลดขนาดตัวอักษรโดยรวมลงนิดนึง"
 *   — don't follow Figma 100%; it looks too big right now, trim the type overall a little.
 *
 * A future Figma sweep will find every desktop size here 10% under the frame and will be
 * RIGHT about the measurement and WRONG about the fix. The instruction is the authority.
 *
 * ------------------------------------------------------------------ what is trimmed, and what is not
 *
 * The DESKTOP anchor only. Every phone value is Figma's 402 frame untouched, because the phone
 * end has never been the complaint and it is the end that was hardest to get right. So each
 * rank still passes through its 402 value exactly and only its 1440 end moves.
 *
 * ------------------------------------------------------------------ the one lever
 *
 * `--rt` is the trim, and it is the ONLY number to change. Every rank below is written so its
 * 1440 end is `D * var(--rt)` while its 402 end stays pinned at `P`, so re-tuning the whole
 * flow is a single-character edit rather than forty.
 *
 * The algebra, once. A two-anchor ramp is `calc(MIN + DELTA * --fl)`, where `--fl` is a LENGTH
 * running 0px → 1px between 375 and 1440, and 402 sits at `--fl` = 27/1065 = 0.02535211. For
 * the ramp to hit `P` at 402 and `D'` at 1440,
 *
 *   DELTA = (D' − P) / 0.97464789        MIN = D' − DELTA
 *
 * so, substituting `D' = D * --rt` and folding MIN back in, each rank is
 *
 *   D * --rt  +  (D * --rt − P) / 0.97464789 * (--fl − 1px)
 *
 * which is 0 in its second term at `--fl` = 1px (giving `D * --rt`) and −(D·rt − P) at
 * `--fl` = 0.02535211px (giving P). Both anchors hold for any `--rt`, which is the point.
 *
 * ------------------------------------------------------------------ the floor that is not negotiable
 *
 * `--t-16-18` is the one rank used for text inside an `<input>` / `<textarea>`, and its call
 * site wraps it in `max(16px, …)`. At `--rt` 0.9 the ramp runs 16 → 16.2, which dips a
 * fraction under 16 below 402 — and iOS Safari ZOOMS the page when a focused input is under
 * 16px and does not zoom back, which leaves the page pannable sideways. The `max()` is what
 * stops any future `--rt` from taking it there; see the note on `BOX` in Field.tsx.
 */
export const REGISTER_TYPE_CLASS = 'register-type'

/** P → D pairs, as measured off the 402 frames and the 2053 desktop frames. */
const RANKS: [name: string, phone: number, desktop: number][] = [
  ['12-16', 12, 16], // upload hints, field error notes, the team photo caption
  ['12-18', 12, 18], // consent row descriptions, the "2 คน" captions
  ['14-16', 14, 16], // ล้าง, the upload target's own label
  ['14-18', 14, 18], // breadcrumbs, required asterisks, the team photo label
  ['14-20', 14, 20], // field labels, document rows, the agreement sentence and its consents
  ['16-18', 16, 18], // INPUT TEXT — always behind a max(16px, …), see above
  ['16-20', 16, 20], // consent row titles, the action pills, the gate's CTA
  ['20-24', 20, 24], // the gate's requirement section headings
  ['20-28', 20, 28], // section headings inside the wizard
  ['24-32', 24, 32], // the wizard's page title
  ['24-40', 24, 40], // the gate's page title
]

const F402 = 27 / 1065

const rank = ([name, p, d]: [string, number, number]) =>
  `  --t-${name}: calc(${d}px * var(--rt) + (${d} * var(--rt) - ${p}) / ${(1 - F402).toFixed(8)} * (var(--fl) - 1px));`

export const REGISTER_TYPE_CSS = `.${REGISTER_TYPE_CLASS} {
  --rt: 0.9;
${RANKS.map(rank).join('\n')}
}
`

/**
 * Renders the scale. It is a `<style>` element rather than a rule in `index.css` because that
 * file is owned centrally; lifting this block into `styles/auth-motion.css` (or index.css) and
 * dropping this component is a copy-paste whenever that ownership allows.
 *
 * Mounted twice across the flow — once by the gate, once by the wizard shell — which is
 * harmless: the two emit byte-identical text, and the class is what scopes it either way.
 */
export function RegisterType() {
  return <style>{REGISTER_TYPE_CSS}</style>
}
