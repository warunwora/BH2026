/*
 * The homepage's decorations at phone width, transcribed from Figma's own 402-wide mobile
 * frame — "Homepage" (1190:558), 402 x 5198.
 *
 * Until this file existed there was no spec under 1440, so the phone got an invented policy:
 * two hand-composed bands hung off the hero, with the 1440 groups shrunk to 100vw/1440. That
 * policy is now obsolete for the homepage. This is a transcription of the real frame in
 * exactly the way HomeBackground.tsx is a transcription of 935:451: one row per node behind
 * `prettier-ignore`, numbers as found, node ids in the comments, DOM order = paint order.
 *
 * The phone frame is NOT the 1440 frame shrunk. Every group is re-laid-out, and the props are
 * proportionally much larger: the rigatoni are 0.48 of their desktop size on a canvas 0.279
 * as wide, so a phone tube covers 1.7x the fraction of the screen a desktop tube does. Where
 * a group IS the desktop group at a uniform scale, the scale is noted on the group — it is
 * how the art below could be reused rather than re-exported.
 *
 * ---------------------------------------------------------------- why 402 is not scaled
 *
 * The frame is 402 wide and phones are 320-430, so the canvas has to answer for the other
 * widths. Three readings were possible; this file anchors at 402 at 1:1 and lets a narrower
 * phone crop symmetrically. The reasoning, because it is not obvious:
 *
 * Scaling the whole canvas by `100vw / 402` is the tempting one — it fills any width with no
 * gutter and no crop — and it is wrong for the same reason the 1440 canvas is not rescaled
 * (see the long note in HomeBackground.tsx). A uniform scale scales the canvas's HEIGHT too,
 * and the page's height does not follow it. Measured, before this file existed:
 *
 *     viewport   page height   402 canvas x 100vw/402   drift at the page foot
 *        320        5186              4067                    1119 px
 *        375        5099              4766                     333 px
 *        402        5202              5109                      93 px
 *
 * (Those are the readings of the day; the frame has since grown to 5198 and the 402 row's
 * drift with it. The argument is about the SHAPE of the three rows, which is unchanged.)
 *
 * A narrow page is not a short page — text reflows *taller* as the column narrows, so the
 * canvas shrinks while the content it belongs to grows. At 320 a scaled canvas would end
 * 1119px above the footer. Anchoring at 402 costs 41px of crop per side at 320 instead, and
 * every group in this frame already bleeds off an edge (the rigatoni run to x -225 and 560,
 * the garlic to -126, the closing waves to -122, the red blob to -549), so what a narrow
 * phone crops is bleed the design never promised to show.
 *
 * THE RISK ACCEPTED, in two parts.
 *
 * Going narrow: at 320 the two props Figma tucks just inside the right edge — Pasta 38 at
 * x 400 and the cheese pile ending at x 559 — lose 41px more of themselves than the frame
 * shows, and the reflow the crop cannot answer for is vertical: because each group is pinned
 * to a measured section edge (below) rather than to a page y, the drift is bounded by one
 * section's reflow rather than accumulating down the page.
 *
 * Going wide: a viewport wider than 402 has to be filled by the groups' own bleed, which is
 * why the canvas does not clip at 402 (see the note on the returned element). That works for
 * every group except the masthead crowd, which Figma itself clips to the frame — it has no
 * bleed to give, so it leaves a gutter, 14px a side at 430 and behind the nav pill. That
 * gutter is what sets the ceiling at 430, the top of the phone range this frame is drawn for;
 * it was a plainly wrong-looking 118px a side when the ceiling was first tried at `sm` (640).
 * From 431 to 1024 the fluid-band policy in HomeBackground.tsx still runs — that range is not
 * what this frame specifies, and it was already built and verified against the 1440 one.
 *
 * ------------------------------------------------------------- why the y's are anchored
 *
 * Every group's y is Figma's, but stated as an offset from a *section edge* rather than as a
 * page y. The frame specifies its own section heights, so if the layout tracks land them the
 * two readings are identical — but they have not all landed, and a page y is only meaningful
 * while every section above it is exactly Figma's height. An offset from a measured edge is
 * the same number and cannot drift. The offsets are transcribed, not chosen: `1190:751` is at
 * y -69 inside the prizes frame in Figma, so it is `prizesTop - 69` here.
 */

import type { CSSProperties } from 'react'
import {
  Node,
  RIGATONI,
  TUBE,
  cheeseChunk,
  flowVars,
  fork,
  garlic,
  pasta1,
  pasta24,
  redBlob,
  redWave,
  spoon,
  useFlowPhase,
  useSectionAnchor,
  yellowWave,
  type DecorNode,
} from './decorKit'

/** The canvas Figma authors the phone against. Never scaled — see the note above. */
const PHONE = 402

/**
 * Figma's own section boxes on this frame, the anchors every group below is stated against.
 *
 * Re-read off the frame (2026-08-06) after the footnotes Figma added under the calendar grid
 * and the prize cards (`1297:2057`, `1297:2061`) grew three of the four sections and moved
 * everything under them, then re-verified against `get_metadata` on 1190:558 a second time in
 * the same round: 1190:589 y 932 h 909, 1190:626 y 2253 h 1581, 1190:750 y 3924 h 649,
 * 1190:831 y 4637 all still hold, as do GARLIC_LEFT 1852, FORK_RIGHT 1912, CHEESE 4529 and
 * the prize blob's -549 / 1499x787 / -69. The old numbers are kept in the margin as the
 * history of the pads in index.css, which are now solved through the new ones.
 */
const F = {
  hero: { top: 0, bottom: 932 }, // the calendar frame starts at 932
  calendar: { top: 932, bottom: 1841 }, // 1190:589, y 932, h 909 (was h 849)
  steps: { top: 2253, bottom: 3834 }, // 1190:626, y 2253, h 1581 (was h 1557)
  prizes: { top: 3924, bottom: 4573 }, // 1190:750, y 3924, h 649 (was h 565)
  /*
   * Re-read 2026-08-07 off the live frame: `1190:831` is at y **4726**, not the 4637 this
   * line carried, and the frame is 5198 tall rather than 5109. 4637 was the pre-footnote
   * reading; the two footnotes Figma added (`1297:2057` under the calendar grid, `1297:2061`
   * under the prize cards) grew the sections above it and pushed the footer down 89, and this
   * one entry was not re-solved with the other four. It is the anchor for BOTH hung groups
   * below, so the error was paid twice: the cheese pile sat 89 too deep under the footer and
   * the strand fan 45 too deep (the fan carried its own stale y as well — see CLOSING_WAVES).
   */
  footer: { top: 4726 }, // 1190:831, y 4726 (was read 4637, and 4655 before that)
}

/*
 * Four SVGs that only this frame uses, exported from it and committed here.
 *
 * The closing fan is four separate strand vectors on the phone where the 1440 frame merges
 * them into one `waveCluster` export, so there was nothing to reuse. The two washes are the
 * same blob as `wash15`/`wash10` but the 800px layer blur is baked into the export, and the
 * baked bleed is a FRACTION of the node — 800/1149 on the desktop node, 800/849 here — so
 * re-using the desktop file at the phone's node size would have scaled the blur with it and
 * under-blurred by a quarter. Everything else on this frame reuses the existing art.
 */
const wave4 = '/assets/figma/405119ad6dda6a6a0a1ca8e5aa5d4a9220c6769e.svg'
const wave5 = '/assets/figma/f4400f9025cbc69de1da94c6418c6058013a321b.svg'
const wave6 = '/assets/figma/8ce840b71886a1f026e98c27a8f8468367394af5.svg'
const wave7 = '/assets/figma/e86ea9bc7e7dbd008683dc21642378420eae6e27.svg'
const wash15Phone = '/assets/figma/4cc5660bb26b88803385964e1bba866c535f6f35.svg'
const wash10Phone = '/assets/figma/6ade7be2398fbc0a85f7aca3bb158091b2e5d16d.svg'

/*
 * ------------------------------------------------------------------ "Top pasta"
 *
 * 1190:565, the masthead crowd: 23 tubes in a 402x140 frame at the frame's own origin, all
 * cut from the one `pasta1` sprite sheet through the same `TUBE` window the 1440 frame uses —
 * the crop percentages come back byte-identical from Figma, which is how the sheet is known
 * to be the same one. Rotations only; nothing here is mirrored.
 *
 * The tubes' own boxes span y -204 to 173, but the Figma frame CLIPS: the render has no pasta
 * between y 140 and the wordmark, so "Clip content" is on and the crowd is cut at the frame's
 * 140. That is the one behavioural difference from the 1440 group, which does not clip.
 */
// prettier-ignore
const TOP_PASTA: DecorNode[] = [
  { x: -29.02,  y: -54.92,  w: 197.406, h: 159.823, aw: 177.961, ah: 132.149, rotate: 9.54,   crop: TUBE, src: pasta1 },  // 1190:566
  { x: 273.12,  y: -70.66,  w: 236.514, h: 260.381, aw: 212.021, ah: 157.442, rotate: 63.01,  crop: TUBE, src: pasta1 },  // 1190:567
  { x: -177.36, y: -53.9,   w: 270.001, h: 218.597, aw: 243.405, ah: 180.747, rotate: 9.54,   crop: TUBE, src: pasta1 },  // 1190:568
  { x: 121.03,  y: -204.27, w: 323.491, h: 356.135, aw: 289.991, ah: 215.34,  rotate: 63.01,  crop: TUBE, src: pasta1 },  // 1190:569
  { x: -48.84,  y: -48.73,  w: 148.666, h: 164.923, aw: 134.857, ah: 100.142, rotate: 64.34,  crop: TUBE, src: pasta1 },  // 1190:570
  { x: 261.39,  y: -75.49,  w: 180.481, h: 197.771, aw: 160.668, ah: 119.308, rotate: 117.81, crop: TUBE, src: pasta1 },  // 1190:571
  { x: -204.5,  y: -45.41,  w: 203.336, h: 225.572, aw: 184.45,  ah: 136.968, rotate: 64.34,  crop: TUBE, src: pasta1 },  // 1190:572
  { x: -12.1,   y: -3.42,   w: 116.803, h: 92.817,  aw: 107.592, ah: 79.895,  rotate: 7.24,   crop: TUBE, src: pasta1 },  // 1190:573
  { x: 284.66,  y: -29.31,  w: 145.73,  h: 158.365, aw: 128.184, ah: 95.186,  rotate: 60.71,  crop: TUBE, src: pasta1 },  // 1190:574
  { x: -154.26, y: 16.56,   w: 159.755, h: 126.949, aw: 147.157, ah: 109.275, rotate: 7.24,   crop: TUBE, src: pasta1 },  // 1190:575
  { x: 136.82,  y: -147.68, w: 199.32,  h: 216.601, aw: 175.322, ah: 130.19,  rotate: 60.71,  crop: TUBE, src: pasta1 },  // 1190:576
  { x: 39.27,   y: -51.94,  w: 152.165, h: 145.291, aw: 122.17,  ah: 90.72,   rotate: -36.11, crop: TUBE, src: pasta1 },  // 1190:577
  { x: 342.23,  y: 26.86,   w: 171.171, h: 146.588, aw: 145.552, ah: 108.084, rotate: 17.36,  crop: TUBE, src: pasta1 },  // 1190:578
  { x: -84.03,  y: -49.8,   w: 208.121, h: 198.72,  aw: 167.097, ah: 124.082, rotate: -36.11, crop: TUBE, src: pasta1 },  // 1190:579
  { x: 215.56,  y: -70.86,  w: 234.117, h: 200.493, aw: 199.078, ah: 147.83,  rotate: 17.36,  crop: TUBE, src: pasta1 },  // 1190:580
  { x: 41.36,   y: -63.05,  w: 110.718, h: 120.661, aw: 97.781,  ah: 72.61,   rotate: -61.22, crop: TUBE, src: pasta1 },  // 1190:581
  { x: 373.49,  y: 15.01,   w: 127.097, h: 101.426, aw: 116.496, ah: 86.507,  rotate: -7.75,  crop: TUBE, src: pasta1 },  // 1190:582
  { x: -81.13,  y: -65,     w: 151.434, h: 165.033, aw: 133.739, ah: 99.311,  rotate: -61.22, crop: TUBE, src: pasta1 },  // 1190:583
  { x: 258.32,  y: -87.06,  w: 173.835, h: 138.724, aw: 159.336, ah: 118.319, rotate: -7.75,  crop: TUBE, src: pasta1 },  // 1190:584
  { x: 75.59,   y: 7.68,    w: 73.268,  h: 89.535,  aw: 79.755,  ah: 59.224,  rotate: -79.07, crop: TUBE, src: pasta1 },  // 1190:585
  { x: 337.14,  y: 67.35,   w: 116.182, h: 104.694, aw: 95.02,   ah: 70.559,  rotate: -25.6,  crop: TUBE, src: pasta1 },  // 1190:586
  { x: -34.31,  y: 31.74,   w: 100.212, h: 122.461, aw: 109.085, ah: 81.003,  rotate: -79.07, crop: TUBE, src: pasta1 },  // 1190:587
  { x: 208.6,   y: -15.48,  w: 158.906, h: 143.194, aw: 129.962, ah: 96.507,  rotate: -25.6,  crop: TUBE, src: pasta1 },  // 1190:588
]

/** The frame's own box, which is also its clip: 1190:565 is 402x140 at the frame origin. */
const TOP_PASTA_CLIP = { x: 0, y: 0, w: PHONE, h: 140 }

/*
 * -------------------------------------------------------- "Pasta 24-43", the rigatoni
 *
 * 1190:804-1190:823, the loose scatter falling past the hero CTA. Pinned directly to the
 * frame, so these are page coordinates; the band's own extent is x -225..560, y 625..924, and
 * it bleeds off both edges.
 *
 * This group IS the 1440 group at a uniform 0.48 — all twenty bounding boxes match the desktop
 * rows to four decimals, in the same order — so the rotations, mirrors, the 0.14deg skew on
 * Pasta 25 and the `RIGATONI` sprite window all carry over unchanged and the art needed no
 * re-export. Only the arrangement is new: the pile packs against the right edge from about
 * x 240 with a thinner trail of loose tubes reaching left off the canvas.
 *
 * The x/y here are the RENDERED boxes, and getting them was the one real trap on this frame.
 * `get_metadata` does not report a rotated node's box — it reports where the node's
 * pre-rotation top-left CORNER ended up after the rotation, which for a 55deg tube is 120px
 * from the box the tube actually occupies. Transcribing the reported numbers puts five of
 * these twenty tubes off the left edge and leaves a hole through the middle of the band.
 *
 * Rather than guess each rotation's sign back out of a bounding box (a bbox is the same for
 * +55 and -55, so it cannot be done), each row is recovered from the desktop table, which
 * holds the same twenty pieces with their boxes already verified. For piece i the offset
 * between Figma's reported corner and the true top-left is a vector in the group's own space,
 * so under a uniform 0.48 it scales with the group:
 *
 *     true_phone = reported_phone + 0.48 * (true_desktop - reported_desktop)
 *
 * which needs no rotation, no sign and no mirror. Checked against Pasta 1 of the masthead
 * group, where the true box is independently known from `get_design_context`: predicted
 * (-29.010, -54.918) against an actual (-29.02, -54.92).
 *
 * Order is the frame's paint order, which is also enough like left-to-right for the arrival
 * stagger to read as a flow.
 */
// prettier-ignore
const RIGATONI_SCATTER: DecorNode[] = [
  { x: 312,      y: 653,     w: 184,     h: 213,     aw: 184.385, ah: 213.12,  crop: RIGATONI, src: pasta24 },  // 1190:804
  { x: 241.632,  y: 625.496, w: 252.639, h: 267.45,  aw: 184.379, ah: 213.229, rotate: 22.59,  skewX: -0.14, crop: RIGATONI, src: pasta24 },  // 1190:805
  { x: 318.484,  y: 624.993, w: 205.569, h: 200.986, aw: 134.968, ah: 156.002, rotate: -53.86, crop: RIGATONI, src: pasta24 },  // 1190:806
  { x: 94.293,   y: 721.476, w: 139.118, h: 149.171, aw: 104.992, ah: 121.354, rotate: 19.25,  flipY: true, crop: RIGATONI, src: pasta24 },  // 1190:807
  { x: 39.581,   y: 759.877, w: 103.581, h: 113.557, aw: 84.392,  ah: 97.545,  rotate: -12.56, flipY: true, crop: RIGATONI, src: pasta24 },  // 1190:808
  { x: 298.433,  y: 654.428, w: 196.246, h: 203.342, aw: 134.968, ah: 156.002, rotate: -31.2,  crop: RIGATONI, src: pasta24 },  // 1190:809
  { x: -154.16,  y: 718.609, w: 134.686, h: 148.501, aw: 112.064, ah: 129.529, rotate: -10.99, crop: RIGATONI, src: pasta24 },  // 1190:810
  { x: 287.235,  y: 696.172, w: 162.213, h: 178.852, aw: 134.968, ah: 156.002, rotate: -10.99, crop: RIGATONI, src: pasta24 },  // 1190:811
  { x: 146.982,  y: 699.658, w: 205.282, h: 200.247, aw: 134.968, ah: 156.002, rotate: 54.75,  flipY: true, crop: RIGATONI, src: pasta24 },  // 1190:812
  { x: 94.441,   y: 720.715, w: 181.746, h: 165.826, aw: 134.968, ah: 156.002, rotate: 102.64, flipY: true, crop: RIGATONI, src: pasta24 },  // 1190:813
  { x: 354.784,  y: 639.048, w: 205.282, h: 200.247, aw: 134.968, ah: 156.002, rotate: -54.75, crop: RIGATONI, src: pasta24 },  // 1190:814
  { x: 233.009,  y: 688.046, w: 231.913, h: 226.161, aw: 152.506, ah: 176.273, rotate: 54.85,  crop: RIGATONI, src: pasta24 },  // 1190:815
  { x: 342.716,  y: 648.948, w: 205.251, h: 226.215, aw: 170.527, ah: 197.103, rotate: 11.09,  crop: RIGATONI, src: pasta24 },  // 1190:816
  { x: 307.648,  y: 670.383, w: 225.36,  h: 241.843, aw: 170.527, ah: 197.103, rotate: -18.99, crop: RIGATONI, src: pasta24 },  // 1190:817
  { x: 399.982,  y: 678.632, w: 160.088, h: 176.132, aw: 132.147, ah: 152.741, rotate: -11.57, crop: RIGATONI, src: pasta24 },  // 1190:818
  { x: -224.726, y: 719.086, w: 200.953, h: 195.97,  aw: 132.147, ah: 152.741, rotate: 54.85,  crop: RIGATONI, src: pasta24 },  // 1190:819  (Figma's left copy of 820; falls entirely off the canvas)
  { x: 202.721,  y: 728.066, w: 200.953, h: 195.97,  aw: 132.147, ah: 152.741, rotate: 54.85,  crop: RIGATONI, src: pasta24 },  // 1190:820
  { x: -69.689,  y: 742.125, w: 128.173, h: 141.264, aw: 106.489, ah: 123.085, rotate: 11.09,  crop: RIGATONI, src: pasta24 },  // 1190:821
  { x: -78.836,  y: 745.392, w: 146.46,  h: 134.731, aw: 106.489, ah: 123.085, rotate: 74.99,  crop: RIGATONI, src: pasta24 },  // 1190:822
  { x: 355.368,  y: 729.107, w: 159.055, h: 175.301, aw: 132.147, ah: 152.741, rotate: 11.09,  crop: RIGATONI, src: pasta24 },  // 1190:823
]

/** The band's box on the page, y 625 to 924 — the flow's sentinel and the group's window. */
const RIGATONI_WINDOW = { y0: 625, y1: 924 }

/**
 * The x above which a tube belongs to the pile and is nudged outward as it settles, rather
 * than inward. The pile packs against the right edge from about x 240, so 200 splits it; the
 * 1440 canvas's equivalent is 1150. This is the one number in the flow not derived from the
 * piece's index, exactly as on the desktop band.
 */
const PHONE_PILE_X = 200

/*
 * ------------------------------------------------------------------ "Garlic Left"
 *
 * 1190:657: ten bulbs on a yellow wave, hanging 126px off the left edge, at y 1852 (it was at
 * 1802 before the calendar footnote pushed everything below the grid down). The 1440 group at a
 * uniform 0.4948 — every bulb's box and all ten rotations match the desktop rows in order —
 * so `garlic` and `yellowWave` are reused as they are. Wave 10 (1190:658) is the same vector
 * as the desktop's `yellowWave`: the two exports normalise to identical path coordinates, and
 * the file is authored `preserveAspectRatio="none"`, so drawing the 569x360 export into this
 * group's 282x178 box reproduces the phone node exactly.
 */
// prettier-ignore
const GARLIC_LEFT: DecorNode = { x: -126, y: 1852, w: 329, h: 181, kids: [
  { x: 0.22,   y: 2.03,  w: 282,     h: 178,     src: yellowWave },  // 1190:658  Wave 10
  { x: 34.61,  y: 0.03,  w: 172.996, h: 180.01,  aw: 146.884, ah: 104.451, rotate: 51.71,  src: garlic },  // 1190:659
  { x: 118.78, y: 2.07,  w: 195.3,   h: 161.122, aw: 169.389, ah: 120.454, rotate: 15.4,   src: garlic },  // 1190:660
  { x: 118.78, y: 2.07,  w: 195.3,   h: 161.122, aw: 169.389, ah: 120.454, rotate: 15.4,   src: garlic },  // 1190:661  (Figma duplicates 660)
  { x: 81.32,  y: 24.49, w: 128.897, h: 106.339, aw: 111.795, ah: 79.499,  rotate: 15.4,   src: garlic },  // 1190:662
  { x: 154.76, y: 34.82, w: 94.502,  h: 114.53,  aw: 99.322,  ah: 70.629,  rotate: 74.58,  src: garlic },  // 1190:663
  { x: 154.76, y: 34.82, w: 94.502,  h: 114.53,  aw: 99.322,  ah: 70.629,  rotate: 74.58,  src: garlic },  // 1190:664  (Figma duplicates 663)
  { x: 98.97,  y: 51,    w: 132.443, h: 109.62,  aw: 114.573, ah: 81.474,  rotate: -15.82, src: garlic },  // 1190:665
  { x: 188.19, y: 24.73, w: 140.462, h: 130.716, aw: 114.573, ah: 81.474,  rotate: 32.98,  src: garlic },  // 1190:666
  { x: 239.16, y: 50.46, w: 85.985,  h: 100.616, aw: 85.023,  ah: 60.46,   rotate: 69.91,  src: garlic },  // 1190:667
  { x: 130.4,  y: 28.83, w: 92.704,  h: 86.272,  aw: 75.617,  ah: 53.772,  rotate: 32.98,  src: garlic },  // 1190:668
] }

/*
 * --------------------------------------------------------- "Frame 1272631416", the cutlery
 *
 * 1190:784: two cutlery stars on a red wave, hanging 252px off the right edge, at y 1912 (it
 * was at 1862 before the calendar footnote moved it). Unlike the
 * garlic this is NOT the desktop group rescaled — the two stars sit at 0.4508 and 0.6913 of
 * their desktop size inside a group at neither ratio, and several spoons and forks carry a
 * different reflection than their desktop counterparts, so all seventeen rows are transcribed
 * from the frame rather than derived.
 *
 * Wave 11 (1190:785) keeps the desktop's -127.65deg, and its vector normalises to the same
 * path as `redWave` even though the two exports have different aspect ratios — the file is
 * `preserveAspectRatio="none"`, so the box decides the shape and the desktop export is exact
 * here. `spoon` and `fork` are the same two PNGs.
 *
 * ------------------------------------------ the sign of a MIRRORED piece's rotation (2026-08-06)
 *
 * The claim above that "several spoons and forks carry a different reflection than their
 * desktop counterparts" was WRONG, and it was the cause of the "cutlery looks scattered"
 * report: seven of these seventeen rows had the sign of their `rotate` inverted, which for a
 * mirrored piece is not a small error but a ~90deg one, so every mirrored spoon pointed down a
 * different spoke than Figma points it.
 *
 * The mechanism, because it will bite the next transcription too. `Node` emits Figma's own
 * composition order — `transform: rotate(a) scaleY(-1)`, i.e. R(a)·S — and Figma's codegen
 * states a mirrored node as `-scale-x-100 rotate-[b]`, which as Tailwind 4 CLASSES are the
 * individual `rotate`/`scale` properties and compose in css-transforms-2's fixed order:
 * rotate, then scale, i.e. R(b)·Sx. The two are the same drawing when
 *
 *     R(a)·Sy = R(a)·R(180)·Sx = R(a + 180)·Sx      so     b = a + 180,
 *
 * and since S·R(a) = R(−a)·S, writing the flip FIRST silently negates the angle. Figma's own
 * b for these nodes is 180 − a, not 180 + a — one sign out. The corner-to-bbox solve that
 * produced the x/y in these rows used Figma's true transform, so only the ANGLES were wrong
 * and every position below is unchanged; each corrected row's angle is the one the desktop
 * table in HomeBackground.tsx has carried all along for the same piece, which is the check
 * that catches this: a group that is the desktop group re-laid-out must reuse its angles
 * verbatim. Figma's own `rotate-[b]` value is quoted per row.
 */
// prettier-ignore
const FORK_RIGHT: DecorNode = { x: 188, y: 1912, w: 465.823, h: 469.012, kids: [
  { x: 0, y: 0, w: 465.823, h: 469.012, aw: 342.069, ah: 324.431, rotate: -127.65, src: redWave },  // 1190:785  Wave 11
  { x: 97.96, y: 186.41, w: 208, h: 205, kids: [  // 1190:786  Fork (the large star)
    { x: 46.69, y: 0,     w: 117.864, h: 117.864, aw: 83.34, ah: 83.34, rotate:   45.32, src: spoon },  // 1190:787  Spoon 1  (rotate-[45.32])
    { x: 46.37, y: 86.82, w: 117.875, h: 117.875, aw: 83.34, ah: 83.34, rotate:  -45.32, flipY: true, src: spoon },  // 1190:788  Spoon 3  (-scale-x-100 rotate-[134.68])
    { x: 0.91,  y: 43.89, w: 117.85,  h: 117.85,  aw: 83.34, ah: 83.34, rotate:   44.68, flipY: true, src: spoon },  // 1190:789  Spoon 5  (-scale-x-100 rotate-[-135.32])
    { x: 89.31, y: 42.62, w: 117.875, h: 117.875, aw: 83.34, ah: 83.34, rotate: -135.32, flipY: true, src: spoon },  // 1190:790  Spoon 7  (-scale-x-100 rotate-[44.68])
    { x: 46,    y: 42,    w: 68,      h: 68,      src: fork },  // 1190:791  Fork 1
    { x: 95,    y: 93,    w: 68,      h: 67,      rotate: 180, src: fork },  // 1190:792  Fork 3
    { x: 95,    y: 42,    w: 68,      h: 68,      flipX: true, src: fork },  // 1190:793  Fork 5
    { x: 46,    y: 93,    w: 68,      h: 67,      rotate: 180, flipX: true, src: fork },  // 1190:794  Fork 7
  ] },
  { x: 50.96, y: 74.41, w: 136, h: 134, kids: [  // 1190:795  Fork (the small star)
    { x: 24.11, y: 0,     w: 77.223, h: 77.223, aw: 55.91, ah: 55.91, rotate:   32.57, src: spoon },  // 1190:796  Spoon 2  (rotate-[32.57])
    { x: 36.87, y: 56.96, w: 77.027, h: 77.027, aw: 55.91, ah: 55.91, rotate:  -58.08, flipY: true, src: spoon },  // 1190:797  Spoon 4  (-scale-x-100 rotate-[121.92])
    { x: 0.76,  y: 35.59, w: 77.027, h: 77.027, aw: 55.91, ah: 55.91, rotate:   31.92, flipY: true, src: spoon },  // 1190:798  Spoon 6  (-scale-x-100 rotate-[-148.08])
    { x: 58.42, y: 21.67, w: 77.027, h: 77.027, aw: 55.91, ah: 55.91, rotate: -148.08, flipY: true, src: spoon },  // 1190:799  Spoon 8  (-scale-x-100 rotate-[31.92])
    { x: 21.38, y: 26.64, w: 54.351, h: 54.351, aw: 45.44, ah: 45.44, rotate:  -12.76, src: fork },  // 1190:800  Fork 2  (rotate-[-12.76])
    { x: 60.92, y: 52.38, w: 54.351, h: 54.351, aw: 45.44, ah: 45.44, rotate:  167.24, src: fork },  // 1190:801  Fork 4  (rotate-[167.24])
    { x: 53.45, y: 19.38, w: 54.351, h: 54.351, aw: 45.44, ah: 45.44, rotate:  167.24, flipY: true, src: fork },  // 1190:802  Fork 6  (-scale-x-100 rotate-[-12.76])
    { x: 28.86, y: 59.64, w: 54.351, h: 54.351, aw: 45.44, ah: 45.44, rotate:  -12.76, flipY: true, src: fork },  // 1190:803  Fork 8  (-scale-x-100 rotate-[167.24])
  ] },
] }

/*
 * ------------------------------------------------------------------- the two washes
 *
 * 1190:563 "Circle 1" and 1190:564 "Circle 2": the same #D79A4E blob at 15% and 10% under an
 * 800px layer blur that the export bakes in, which is why `spread` puts 800px of bleed back
 * on every side. Both are the desktop blob at a smaller size (0.739 and 0.512) but they need
 * their own exports — see the note on `wash15Phone`.
 *
 * Circle 2 needs one word of explanation, because it looks like a rotated node and is not.
 * Its box is reported 577x591 while its export is 591x577 — a transposition, not a rotation:
 * the vector is authored landscape and the node is portrait, so `rotate: 90` here is turning
 * the export to fit its own box rather than reproducing a turn Figma made. Which means the
 * reported x/y ARE the box's top-left and need no correcting, unlike every genuinely rotated
 * node on this frame. The desktop's `wash10` row is the same node read the same way, and the
 * export agrees: the tint in this band has no interior peak and leans very slightly right,
 * which is a blob centred 340px off the right edge and not one centred inside the frame.
 *
 * FLAGGED 2026-08-07, deliberately NOT changed: the REST API disagrees. `1190:564`'s
 * `absoluteBoundingBox` is (15586, 1936) against a frame origin of (15709, 635), i.e. x =
 * **-123**, and the desktop twin `708:53` reports x = -397 against the 728 that row carries —
 * both off by exactly one box width, which is the signature of a transform-corner reading
 * rather than a coincidence. Every other node in this file is transcribed from the REST box.
 * It is left alone because the evidence is not decisive: this is a 10%-alpha fill under an
 * 800px blur, the render sampled at 0.5 scale is within 2/255 of white on both edges, and the
 * two files at least agree with each other. Whoever settles it must move BOTH rows together.
 */
// prettier-ignore
const CIRCLE_1: DecorNode = { x: 87, y: 2841, w: 849, h: 828, spread: 800, src: wash15Phone } // 1190:563
// prettier-ignore
const CIRCLE_2: DecorNode = { x: 454, y: 1301, w: 577, h: 591, aw: 591, ah: 577, rotate: 90, spread: 800, src: wash10Phone } // 1190:564

/*
 * ------------------------------------------------------------- the prize band's blob
 *
 * 1190:751 "Vector Shape", the red field behind the prizes section, drawn 1499 across a 402
 * canvas — 549 off the left edge and 548 off the right, which is Figma stating that the band
 * is full-bleed. It lives inside the prizes frame at y -69, so its wavy top edge rises 69px
 * above the section. The vector normalises to the same path as the desktop's `redBlob` —
 * 1499/787 = 1.9047 against the desktop node's 2213.647/1162.509 = 1.9042 — so the art is
 * reused.
 *
 * Box and offset were both re-read on 2026-08-06: Figma had scaled the blob up 9.2% (it was
 * 1373x721 at x -486) and moved it, at the same time as the footnote grew the section.
 */
// prettier-ignore
const PRIZE_BLOB: DecorNode = { x: -549, y: 0, w: 1499, h: 787, src: redBlob } // 1190:751
/** Figma's own offset of the blob inside 1190:750. */
const PRIZE_BLOB_DY = -69

/*
 * ------------------------------------------------------------------ the closing band
 *
 * Waves 4-7 (1190:559-562) are four cream strand vectors fanned across the page's foot. All
 * four turn by the same 38.92deg and all four end on the same bottom edge, y 4905.06, which
 * is what identifies the angle's sign: solved the other way they would land 250px higher with
 * four different bottoms and would not reach the left edge, which the export does.
 *
 * They are the one group on this frame with no desktop counterpart to borrow — the 1440 frame
 * merges its strands into a single `waveCluster` export — so the four vectors are committed
 * alongside. Coordinates below are relative to the group's own box.
 *
 * The group's x/y were 4392.935 and then 4432.935, both derived from `get_metadata`, whose
 * `y` for a rotated node is the TRANSFORM corner and not the axis-aligned box. Every other
 * group in this file (GARLIC_LEFT, FORK_RIGHT, CIRCLE_1, CHEESE, PRIZE_BLOB) is transcribed
 * from the REST API's `absoluteBoundingBox`, which is the axis-aligned box `Node` actually
 * wants — `nodeStyle` sets `left: n.x, top: n.y, width: n.w, height: n.h` and centres the art
 * inside it — so this one group was the odd one out and sat 43.936 too high, which the hung
 * offset below then paid again at the page's foot.
 *
 * Re-read 2026-08-07 straight off `/v1/files/.../nodes?ids=1190:559..562`, frame origin
 * (15709, 635): Wave 5's box is (15587.2055, 5111.8711) 488.602x472.126, i.e. (-121.794,
 * 4476.871) in the frame. The stated w/h check out against the rotation — for aw 396.851,
 * ah 286.544 at 38.92deg, H = aw*sin+ah*cos = 472.27 and W = aw*cos+ah*sin = 488.76, both
 * within the two-decimal residual of the angle — so the box really is the rotated one and
 * needs no correction of any kind. The three sibling offsets are the same subtraction and
 * shift by at most 0.2.
 */
// prettier-ignore
const CLOSING_WAVES: DecorNode = { x: -121.794, y: 4476.871, w: 488.602, h: 472.126, kids: [
  { x: 0,      y: 0,       w: 488.602, h: 472.126, aw: 396.851, ah: 286.544, rotate: 38.92, src: wave5 },  // 1190:560
  { x: 22.243, y: 39.254,  w: 449.215, h: 432.87,  aw: 368.314, ah: 259.139, rotate: 38.92, src: wave6 },  // 1190:561
  { x: 50.522, y: 85.129,  w: 402.377, h: 386.998, aw: 332.047, ah: 229.458, rotate: 38.92, src: wave7 },  // 1190:562
  { x: 81.024, y: 131.070, w: 354.691, h: 341.06,  aw: 292.913, ah: 201.996, rotate: 38.92, src: wave4 },  // 1190:559
] }

/*
 * 1190:824 "Chesse": Wave 9 plus five chunks, the pile that closes the page beside the
 * footer's top corner. The chunks are the 1440 group at a uniform 0.5, in order, so
 * `cheeseChunk` is reused, Cheese 6 included — its "different reflection" was the same
 * negated angle the cutlery carried (see the sign note on FORK_RIGHT). Wave 9 is the same
 * vector as `yellowWave`, like Wave 10 above.
 */
// prettier-ignore
const CHEESE: DecorNode = { x: 218, y: 4529, w: 341, h: 239, kids: [
  { x: 21.03, y: 36.14,  w: 319,     h: 202,     src: yellowWave },  // 1190:825  Wave 9
  { x: 58.035, y: -19.863, w: 258,   h: 184,     src: cheeseChunk },  // 1190:826
  { x: 1.034,  y: 29.137,  w: 211,   h: 150,     src: cheeseChunk },  // 1190:827
  { x: 41.55,  y: 50.93,   w: 215.901, h: 192.99,  aw: 178.03, ah: 126.58, rotate: 26.64,   src: cheeseChunk },  // 1190:828
  { x: 0.55,   y: 62.83,   w: 175.917, h: 157.249, aw: 145.05, ah: 103.15, rotate: 26.64,   src: cheeseChunk },  // 1190:829
  { x: 17.32,  y: 92.52,   w: 158.533, h: 141.709, aw: 130.74, ah: 92.97,  rotate: 153.36, flipY: true, src: cheeseChunk },  // 1190:830  (-scale-x-100 rotate-[-26.64])
] }

/*
 * The two groups above hang BELOW the footer's top edge in Figma — the strands end 210px
 * past it and the cheese 73px — so they are anchored to the canvas's bottom rather than to a
 * page y. The canvas's parent is the page wrapper, whose bottom edge is exactly where the
 * footer starts at every width, so these two offsets put both groups on the footer the way
 * Figma puts them there. Same reading the 1440 canvas gives "Home Buttom".
 */
const CLOSING_WAVES_BOTTOM = F.footer.top - (CLOSING_WAVES.y + CLOSING_WAVES.h) // -222.997
const CHEESE_BOTTOM = F.footer.top - (CHEESE.y + CHEESE.h) // -42

/** Per-piece flight and idle for the phone band: same derivation, distances at the 0.48 the
 *  art is drawn at, and the phone's own pile threshold. Keyed by node so a flight belongs to
 *  the piece rather than to its index in the array. */
const FLOW = new Map<DecorNode, CSSProperties>(
  RIGATONI_SCATTER.map((n, i) => [n, flowVars(i, n.x, { scale: 0.48, pileX: PHONE_PILE_X })]),
)

export default function MobileHomeBackground() {
  /* the band's own sentinel — a separate `useFlowPhase` from the desktop canvas's, so
     neither band can be started by the other scrolling into view */
  const { band, flowClass } = useFlowPhase()
  const hero = useSectionAnchor('hero')
  const calendar = useSectionAnchor('calendar')
  const steps = useSectionAnchor('steps')
  const prizes = useSectionAnchor('prizes')

  type Box = { top: number; height: number } | null
  /** Figma's y for a group, restated against a measured section edge. `null` until measured. */
  const fromTop = (s: Box, figmaTop: number, y: number) => (s ? s.top + (y - figmaTop) : null)
  const fromBottom = (s: Box, figmaBottom: number, y: number) =>
    s ? s.top + s.height + (y - figmaBottom) : null

  const tops = {
    rigatoni: fromBottom(hero, F.hero.bottom, RIGATONI_WINDOW.y0),
    circle2: fromTop(calendar, F.calendar.top, CIRCLE_2.y),
    /*
     * Anchored off `steps.top`, not `calendar.bottom`, even though the art hangs off the
     * calendar's tail: `sec-calendar`'s bottom padding IS that gap (1841 to 2253 = 412 on the
     * phone frame, see index.css), so at any width the live calendar-bottom edge already IS
     * the live steps-top edge — the two coincide by construction, whatever the pad's value.
     * Reading the offset off `F.calendar.bottom` would double-count the gap, since Figma's
     * 1841 is the un-padded frame edge and not the padded one this DOM produces — it placed
     * both groups a further 412 below where the padding already put them, deep enough into the
     * steps section to sit under its heading and first card instead of above them.
     *
     * Re-checked 2026-08-06 against the pad as it now stands: `sec-calendar`'s
     * `padding-bottom: calc(410.28px + 41.22 * var(--flv))` is 412.00 at 402 (`--flv` is
     * 27/649 = 0.0416 there), so the live field IS Figma's 1841..2253 and these two offsets
     * put the garlic 11 and the cutlery 71 below its top edge — the frame's own numbers,
     * exactly. Nothing to correct here; the note is kept because the invariant is the pad's
     * and a future change to it moves both groups.
     */
    garlic: fromTop(steps, F.steps.top, GARLIC_LEFT.y),
    fork: fromTop(steps, F.steps.top, FORK_RIGHT.y),
    circle1: fromTop(steps, F.steps.top, CIRCLE_1.y),
    blob: prizes ? prizes.top + PRIZE_BLOB_DY : null,
  }

  /* one group, drawn at `top` in the 402 space; nothing at all until its section is measured,
     so a group can never land at a guessed position */
  const group = (n: DecorNode, top: number | null) =>
    top === null ? null : <Node n={{ ...n, y: top }} />

  /* a group whose Figma y is below the footer's top edge, hung off the canvas's bottom */
  const hung = (n: DecorNode, bottom: number) => (
    <div className="absolute inset-x-0" style={{ bottom, height: n.h }}>
      <Node n={{ ...n, y: 0 }} />
    </div>
  )

  return (
    /*
     * `inset-y-0` and not `h-[5198px]`: the coordinate space is Figma's 402 and is never
     * scaled, but the canvas has to reach the footer so the closing band has a bottom edge to
     * sit on. Stretching to the page wrapper gives it one at every width, which a fixed 5198
     * could only be at 402 exactly.
     *
     * And deliberately NO `overflow-hidden`, which is worth a sentence because the Figma frame
     * plainly has a boundary at 402. That boundary is the phone's SCREEN edge, not an edge of
     * the artwork: every group is drawn running past it (the rigatoni to -225 and 560, the red
     * blob to -486 and 887), which is Figma saying "bleed off the screen". At 402 and below the
     * viewport is the narrower of the two, so the parent's `w-screen overflow-clip` is the crop
     * either way and this changes nothing. Between 403 and 430 it is the difference between
     * that bleed filling the last few px and a white sliver down both sides. The one clip that
     * IS an art boundary — the 140 the masthead crowd is cut at — is kept, on its own group.
     */
    <div
      aria-hidden
      className="absolute inset-y-0 left-1/2 w-[402px] -translate-x-1/2 min-[431px]:hidden"
    >
      {/* the strand fan paints first, behind the red band, as it does in the frame */}
      {hung(CLOSING_WAVES, CLOSING_WAVES_BOTTOM)}

      {/*
       * The prizes section's red field. Figma's red IS the blob, but the blob is 721 tall
       * against a 565 section and the live section can reflow taller than the 643 the blob
       * reaches below its own top, so a flat fill stands behind it from the measured section
       * top to its bottom. It is painted here rather than as the section's own background
       * because as the section's background it was opaque and covered this whole canvas,
       * hiding the cheese and the strands that are supposed to sit on top of it.
       */}
      {prizes && (
        <div
          className="absolute inset-x-0 bg-brand-red"
          style={{ top: prizes.top, height: prizes.height }}
        />
      )}

      {group(CIRCLE_1, tops.circle1)}
      {group(CIRCLE_2, tops.circle2)}

      {/* "Top pasta" clips at its own 402x140 — see the note on TOP_PASTA. `overflow-clip`
          and not `hidden`: the 23 tubes run to x -204 and 501 inside a 402 box, so under
          `hidden` this crop is a scrollport a touch drag can pan 300px sideways — the same
          bug the `html` note in index.css describes, one box further in. */}
      <div
        className="absolute overflow-clip"
        style={{
          left: TOP_PASTA_CLIP.x,
          top: TOP_PASTA_CLIP.y,
          width: TOP_PASTA_CLIP.w,
          height: TOP_PASTA_CLIP.h,
        }}
      >
        {TOP_PASTA.map((n, i) => (
          <Node key={i} n={n} />
        ))}
      </div>

      {group(GARLIC_LEFT, tops.garlic)}
      {group(PRIZE_BLOB, tops.blob)}
      {group(FORK_RIGHT, tops.fork)}

      {/*
       * The rigatoni band. Its sentinel is the band's own box — the tubes are spread over
       * 300px of page and several start off-canvas, so they are the wrong thing to observe —
       * and the whole group is anchored to the hero's bottom edge, 307px above where Figma
       * starts the band.
       *
       * This is the ONE group that does not wait to be measured, and it has to be: the flow
       * arms in a layout effect on the first commit, and it arms by finding the sentinel. Held
       * back until the hero is measured, the sentinel does not exist on that pass, nothing
       * arms, and — the effect's deps being empty — nothing ever does: the band simply never
       * flies. So it renders from the start at Figma's own page y and corrects to the measured
       * one a frame later, which is invisible because the tubes are already parked off-screen
       * by then. `RIGATONI_WINDOW.y0` is a transcribed number, not a guess at one.
       */}
      <div className="absolute inset-x-0" style={{ top: tops.rigatoni ?? RIGATONI_WINDOW.y0 }}>
        <div
          ref={band}
          className="absolute inset-x-0 top-0"
          style={{ height: RIGATONI_WINDOW.y1 - RIGATONI_WINDOW.y0 }}
        />
        {RIGATONI_SCATTER.map((n, i) => {
          const vars = FLOW.get(n)
          return (
            <Node
              key={i}
              n={{ ...n, y: n.y - RIGATONI_WINDOW.y0 }}
              flow={vars && flowClass ? { className: flowClass, vars } : undefined}
            />
          )
        })}
      </div>

      {hung(CHEESE, CHEESE_BOTTOM)}
    </div>
  )
}
