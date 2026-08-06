/**
 * Figma exports the Google mark as two overlaid pieces — the four-colour G plus the
 * blue crossbar — each pinned at its own inset inside a 24px box. Both are the real
 * Figma exports, so the glyph is pixel-identical to the design.
 *
 * ------------------------------------------------------------------ the box, two anchors
 *
 * `size-6` used to be the default, i.e. Figma's 1440 box held flat all the way down to a 375
 * phone. Every 402 frame draws this mark at 20: `1214:107` (sign-in's button), `1239:950`
 * (the gate's account chip), `1214:180` / `1297:1456` (the wizard's), `1297:1115` /
 * `1297:1283` (the dashboard's) — all 20x20 against 24x24 at 1440 (`708:1218`, `1239:960`,
 * `708:1272`, `708:2311`). So the default is now the ramp through both anchors and every
 * call site that took the default steps down with the phone.
 *
 * The two pieces inside are already expressed as FRACTIONS of this box — `w-[97.92%]` and a
 * four-sided percentage inset — which is the whole reason the box can ramp at all: a glyph
 * pinned in absolute px would keep its 1440 size inside a 20px box and spill over the label
 * beside it, which is exactly the failure the `w-[97.92%]` note below records.
 */
export default function GoogleLogo({
  /* 20 @402 → 24 @1440. Lands on 24.000 at `--fl` = 1, so no 1440 render moves. */
  className = 'size-[calc(19.896px_+_4.104*var(--fl))]',
}: {
  className?: string
}) {
  return (
    <span aria-hidden className={`relative block shrink-0 ${className}`}>
      <img
        src="/assets/figma/1f3d8526a6539e313f6597ff6b470305b04cd69c.png"
        alt=""
        /*
         * `w-[97.92%]` rather than a `right` inset: an <img> is a replaced element, so with
         * `width: auto` the browser uses the file's intrinsic 47px and drops the `right`
         * constraint as over-constrained — the mark rendered at 47px inside a 24px box and
         * spilled over the button's label.
         */
        className="absolute top-0 left-0 aspect-[47/48] w-[97.92%] max-w-none"
      />
      {/*
       * The inset goes on a SPAN, for the same reason the sibling above carries an explicit
       * `w-[97.92%]`: this is over-constrained on BOTH axes (all four insets on a replaced
       * element), so with `width: auto` the browser used the file's intrinsic size and dropped
       * `right` and `bottom` — the layer never tracked the box. A span is non-replaced, so the
       * four insets ARE its box and `size-full` hands that box to the image.
       */}
      <span className="absolute top-[40.92%] right-[37.5%] bottom-[39.73%] left-1/2 block">
        <img
          src="/assets/figma/d800774dad196dfe605892e52a44141bb8866ed6.svg"
          alt=""
          className="block size-full max-w-none"
        />
      </span>
    </span>
  )
}
