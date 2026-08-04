/*
 * The 2024 wordmark is five separate layers in Figma with no single export, so the four
 * visible pieces are recomposed at their original insets inside the 300x242 box Figma
 * gives them. Every inset is a percentage, so the mark scales with the box.
 */
const CRYSTAL = '/assets/figma/7fe73f053542b24d662e0203c618bda9405be29c.png'
const LETTERING = '/assets/figma/6e1c76a3ea11aa20fb517842f57c146469d5f3c7.svg'
const PILL = '/assets/figma/6ee2faa5ea064531d4e11bff4e295c5b7ea3e65a.svg'
const SPARKLE = '/assets/figma/702cfe8d347f9be2095b3a1ae6ee66eaee1334da.svg'

export default function Mark2024() {
  return (
    <div aria-hidden className="relative size-full">
      {/* the crystal is turned 10.06deg, so it is centred in its box and then rotated */}
      <div className="absolute inset-[0.89%_17.2%_0_14.43%] flex items-center justify-center">
        <div className="h-[88.888%] w-[83.342%] flex-none rotate-[10.06deg] skew-x-[0.11deg]">
          <img src={CRYSTAL} alt="" className="block size-full max-w-none" />
        </div>
      </div>
      {/*
       * No `size-full` on these: an absolutely positioned box is over-constrained if it has
       * both insets and an explicit size, and the size wins — which stretched every layer to
       * the full 300x242 instead of the slice Figma gives it. The insets alone are the box.
       */}
      <img src={LETTERING} alt="" className="absolute inset-[35.1%_0_22.32%_0] block max-w-none" />
      <div className="absolute inset-[69.03%_34.7%_20.12%_39.3%]">
        {/* the pill's stroke bleeds past the layer bounds */}
        <div className="absolute inset-[-0.89%_-0.3%]">
          <img src={PILL} alt="" className="block size-full max-w-none" />
        </div>
      </div>
      <img
        src={SPARKLE}
        alt=""
        className="absolute inset-[19.99%_67.14%_66.13%_20.35%] block max-w-none"
      />
      {/*
       * Figma's fifth layer is a 0.2847 x 48.375 white sliver — 0.09% of the mark's width.
       * Its export is degenerate enough that the browser reports no intrinsic width and
       * cannot resolve a height for it, so it loads as a broken image. It cannot render a
       * visible pixel either way, so it is left out rather than shipped broken.
       */}
    </div>
  )
}
