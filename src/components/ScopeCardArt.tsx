/**
 * The doodle band that sits above each scope card's folder (Figma nodes 708:491 /
 * 708:531 / 708:631). Figma draws it as loose vectors that sprawl far outside the
 * 373x451 card and get clipped by it; only the 201 above the folder ever shows,
 * since the folder itself is opaque. Everything that Figma clips away entirely is
 * left out here rather than shipped as an invisible request.
 *
 * `x/y/w/h` is the box Figma reports (already rotated). `uw/uh` is the box *before*
 * rotation — the pair only differ on transformed vectors. `bleed` is the half stroke
 * width Figma lets spill past the box; filled shapes (ellipses, booleans) have none.
 */
export type Art = {
  src: string
  x: number
  y: number
  w: number
  h: number
  uw?: number
  uh?: number
  rot?: number
  flip?: boolean
  bleed?: number
}

const A = '/assets/figma/'

/** คณิตศาสตร์ — a single maze stroke, redrawn at several scales. */
export const MATH_ART: Art[] = [
  { src: `${A}f95e2ff0700b890eceebbef490b5094ea806596e.svg`, x: -108, y: -86.5, w: 110, h: 170 },
  { src: `${A}cb766298a3cec2de3656cc30250643f4bafd052a.svg`, x: -77, y: -86.5, w: 126, h: 170 },
  { src: `${A}cf9331e5cf3917bb8fb44330dd1043aefa8569d6.svg`, x: 54, y: -52.5, w: 200, h: 157 },
  {
    src: `${A}09818cf6afba7408e0fdb218bacf4686578b5858.svg`,
    x: 276.06,
    y: -75.95,
    w: 88.865,
    h: 66.132,
    uw: 86.175,
    uh: 62.358,
    rot: 2.55,
  },
  { src: `${A}66c52c2060bcfe870fb5a9ce4c4b2c359db0e40a.svg`, x: 258, y: 18.5, w: 126, h: 219 },
  { src: `${A}6071d36985fb2c37716305650e0d52da8848d29e.svg`, x: 1, y: 138.5, w: 115, h: 113 },
  { src: `${A}7b37afaa25276aac713ddecebb2962d14711ae27.svg`, x: 49, y: 181.5, w: 38, h: 25 },
  { src: `${A}0a87b4f6f938a1bc3bc75db9f2405bdc8c7e7f35.svg`, x: -34, y: 191.5, w: 63, h: 60 },
  { src: `${A}f5fd331454cdaa66ae66dbcf882f43dfd479a32e.svg`, x: -36, y: 7.5, w: 294, h: 211 },
  { src: `${A}8d273a614e59e76a367afde41ff36ca6d384ca1a.svg`, x: -105, y: 85.5, w: 144, h: 321 },
  {
    src: `${A}f274f4b08d2b8141989b5737a1a6c7070c53a3db.svg`,
    x: -49.63,
    y: -6.35,
    w: 71.555,
    h: 61.003,
    uw: 70.098,
    uh: 59.272,
    rot: 1.43,
  },
  { src: `${A}4d205faff5140be73e0be445496b857a0c03ea5f.svg`, x: 346, y: -13.5, w: 29, h: 73 },
]

/** วิทยาการคอมพิวเตอร์ — scattered primitives and operator glyphs. */
export const CS_ART: Art[] = [
  { src: `${A}5c34f9fdfaae71abf6fae5b7f2b98fc131b7c144.svg`, x: 201.95, y: -3.44, w: 3, h: 54 },
  { src: `${A}858e50f4e1c8eb9d8eb6a3f49105e31578bf9249.svg`, x: 174.95, y: 56.56, w: 45, h: 16 },
  { src: `${A}01a9760e1f4dc8bdefaf2528ad175c5bc3d081d9.svg`, x: 235.95, y: 61.56, w: 85, h: 33 },
  { src: `${A}1aa9af61432b577cec22e8bc363ba8e58c1a0579.svg`, x: 235.95, y: 104.56, w: 43, h: 55 },
  { src: `${A}e5afc0731641ec92be4fe9d7cde66ac47efef5ed.svg`, x: 174.95, y: 162.56, w: 43, h: 69 },
  {
    src: `${A}1f8b33bfb7b3f4fbbc8d3d5370cab5ff9d85568c.svg`,
    x: 353.72,
    y: 209.69,
    w: 95.17,
    h: 63.436,
    uw: 87.563,
    uh: 46.861,
    rot: -11.54,
  },
  {
    src: `${A}59f112ba2fb5df8210c279818b63b54d6ba5da43.svg`,
    x: 290.61,
    y: 89.69,
    w: 24.78,
    h: 31.308,
    uw: 27.433,
    uh: 17.909,
    rot: 73.99,
  },
  { src: `${A}5931bc09e54b9f5df211b44ea495e224c3d0591a.svg`, x: 67.95, y: 151.56, w: 98, h: 82 },
  {
    src: `${A}5977049edf080ffd7f0044e02bf8c8737df7831f.svg`,
    x: -47.53,
    y: 49.31,
    w: 88.534,
    h: 27.275,
    uw: 87.638,
    uh: 12.745,
    rot: 9.66,
  },
  {
    src: `${A}5977049edf080ffd7f0044e02bf8c8737df7831f.svg`,
    x: 358.47,
    y: 49.31,
    w: 88.534,
    h: 27.275,
    uw: 87.638,
    uh: 12.745,
    rot: 9.66,
  },
  { src: `${A}b1654bae0283a3dea7bf3974d3dc26e4350b26c5.svg`, x: 322.95, y: 45.56, w: 43, h: 38 },
  {
    src: `${A}71479660002b15d7a5fbf0a24a3928885e78a00d.svg`,
    x: 295.58,
    y: -14.47,
    w: 42.679,
    h: 43.144,
    uw: 41.22,
    uh: 19.473,
    rot: -45.87,
  },
  {
    src: `${A}04535c53a21fe0006d4359aad630058ee974d2d4.svg`,
    x: 284.38,
    y: 136.76,
    w: 63.496,
    h: 57.391,
    bleed: 0,
  },
  {
    src: `${A}206fbf59fcf6e14f06e1ca4bbf0e1ba99a45c23d.svg`,
    x: -34.3,
    y: -42.54,
    w: 63.496,
    h: 57.392,
    bleed: 0,
  },
  {
    src: `${A}29dc0cf5be9ef0b681e48d1c5a9096305d066112.svg`,
    x: 21.22,
    y: 154.3,
    w: 35.6,
    h: 40.221,
    bleed: 0,
  },
  {
    src: `${A}6352d928c378828c4e98102f9615646c0be76f94.svg`,
    x: 13.28,
    y: 0.25,
    w: 62.553,
    h: 41.68,
    bleed: 0,
  },
  {
    src: `${A}a9e786dc41a5146e8b1dcf703b43aa142b571fe4.svg`,
    x: 122.38,
    y: 108.01,
    w: 31.91,
    h: 50.226,
    bleed: 0,
  },
  {
    src: `${A}d028dfc55958cd5eeccf07ac5d1950745224767c.svg`,
    x: 77.39,
    y: 10.13,
    w: 75.319,
    h: 84.241,
    bleed: 0,
  },
  {
    src: `${A}679169528f09b6c1f791508b3e14847fa2cbfa39.svg`,
    x: 235.95,
    y: 173.56,
    w: 47,
    h: 47,
    bleed: 0,
  },
  {
    src: `${A}c6309fc6f9a5e141a579a1c338665ab80bcabdd6.svg`,
    x: 55.95,
    y: 77.56,
    w: 54,
    h: 56,
    bleed: 0,
  },
  {
    src: `${A}8daa5d02a2b29990986f06740bd960300eb64609.svg`,
    x: 139.95,
    y: -19.44,
    w: 51,
    h: 50,
    bleed: 0,
  },
  {
    src: `${A}c67bbf77ffc3f1e2b8b13820d250cf62b7b956ee.svg`,
    x: 345.95,
    y: 99.56,
    w: 35,
    h: 36,
    bleed: 0,
  },
  {
    src: `${A}675c86c30b7001556ea9399f17992ea764f49420.svg`,
    x: 354.95,
    y: 141.56,
    w: 65,
    h: 65,
    bleed: 0,
  },
  {
    src: `${A}d1665db16d236a0c819e15276a6497bde5045524.svg`,
    x: -49.05,
    y: 141.56,
    w: 63,
    h: 65,
    bleed: 0,
  },
  {
    src: `${A}fa33b73c8ba49c5236fa49b4a63ecac4550b111b.svg`,
    x: 208.98,
    y: -81.91,
    w: 96.318,
    h: 96.318,
    uw: 73.627,
    uh: 73.627,
    rot: 22.67,
    bleed: 0,
  },
  /* the two triangles are drawn at half their frame, centred — Figma insets the glyph
     25% top/bottom and 24.96% left/right inside the rotated box */
  {
    src: `${A}8beb38bb0df74946940c65ccd9f01174d6c3f80c.svg`,
    x: 319.01,
    y: -28.72,
    w: 83.735,
    h: 83.735,
    uw: 31.463,
    uh: 31.413,
    rot: -154.53,
    bleed: 0,
  },
  {
    src: `${A}9a1c1ad72df0ec8c130ba00dc2723f712e083a55.svg`,
    x: -20.21,
    y: 76.9,
    w: 83.82,
    h: 83.82,
    uw: 29.72,
    uh: 29.682,
    rot: 41.77,
    bleed: 0,
  },
  {
    src: `${A}ef23a554280a7afe10e2934ed9454d7e738f480f.svg`,
    x: 141.95,
    y: 48.56,
    w: 11,
    h: 13,
    bleed: 0,
  },
  {
    src: `${A}2f9c71462c067443aea6509c1215d8a2659a0b87.svg`,
    x: 233.95,
    y: 137.56,
    w: 13,
    h: 13,
    bleed: 0,
  },
  {
    src: `${A}bc15d97465291b9694a5dc4b5cdfdf7cdb0212c7.svg`,
    x: 2.95,
    y: 83.56,
    w: 11,
    h: 11,
    bleed: 0,
  },
  {
    src: `${A}0df88871f71ea6e52268b604a1fbfe8be576f7f9.svg`,
    x: 177.95,
    y: 193.56,
    w: 13,
    h: 13,
    bleed: 0,
  },
  {
    src: `${A}2be3a7007478a087c7216e34197f09ac64616c5d.svg`,
    x: 338.95,
    y: 206.56,
    w: 11,
    h: 12,
    bleed: 0,
  },
]

/** อัลกอริทึม — one flow-chart drawing, tiled at -17.84°. */
export const ALGO_ART: Art[] = [
  {
    src: `${A}4dc9758bb2491ba7cb39ed8cfd111c6bf61d86eb.svg`,
    x: 151.54,
    y: -108.98,
    w: 158.918,
    h: 126.734,
    uw: 138.438,
    uh: 88.587,
    rot: -17.84,
  },
  {
    src: `${A}9a7783f1a34989fbe90ad083c2a83b8f26f376b3.svg`,
    x: 42.31,
    y: -134.78,
    w: 152.138,
    h: 145.975,
    uw: 123.237,
    uh: 113.691,
    rot: -17.84,
  },
  {
    src: `${A}ce46cdb10fefac43000c6aae5943cc4a59d4d692.svg`,
    x: -50.39,
    y: -24.82,
    w: 244.425,
    h: 273.982,
    uw: 183.114,
    uh: 228.895,
    rot: -17.84,
  },
  {
    src: `${A}203fc30fe7417443bdd26ca313b792fc36aa51ff.svg`,
    x: 1.72,
    y: 151.72,
    w: 35.833,
    h: 34.952,
    uw: 28.811,
    uh: 27.446,
    rot: -17.84,
  },
  {
    src: `${A}3b8abe7cbda758d70b93bbf7bd144f2a27037277.svg`,
    x: -9.01,
    y: -126.55,
    w: 332.931,
    h: 270.207,
    uw: 288.252,
    uh: 191.098,
    rot: -17.84,
  },
  {
    src: `${A}fad030e2fa72425c007afaba130b5bd917560697.svg`,
    x: 144.69,
    y: -2.19,
    w: 201.368,
    h: 90.642,
    uw: 201.79,
    uh: 30.287,
    rot: -17.84,
  },
  {
    src: `${A}018d3dce8e3eafc07a03098498ba6178d15116f9.svg`,
    x: 179.81,
    y: 147.44,
    w: 163.072,
    h: 108.136,
    uw: 150.318,
    uh: 65.227,
    rot: -17.84,
  },
  {
    src: `${A}f56de65d5a6f6d22b0934937d071a1da8b40cd59.svg`,
    x: 297.12,
    y: -5.57,
    w: 218.559,
    h: 124.119,
    uw: 209.312,
    uh: 63.035,
    rot: -17.84,
  },
  {
    src: `${A}f56de65d5a6f6d22b0934937d071a1da8b40cd59.svg`,
    x: -160.66,
    y: -5.57,
    w: 218.559,
    h: 124.119,
    uw: 209.312,
    uh: 63.035,
    rot: -17.84,
  },
  {
    src: `${A}df02ef775b265133724f5b14163da7aae3d0846d.svg`,
    x: 318.54,
    y: 22.08,
    w: 195.344,
    h: 153.103,
    uw: 171.18,
    uh: 105.752,
    rot: -17.84,
  },
  {
    src: `${A}83f6fa38c4297773cb2b2f0c1b0a95f7fdd28076.svg`,
    x: -138.35,
    y: 24.92,
    w: 194.196,
    h: 150.259,
    uw: 170.906,
    uh: 102.853,
    rot: -17.84,
  },
  {
    src: `${A}553377118f80261aca4b3704fe56b40fa81caae6.svg`,
    x: 313.03,
    y: 44.5,
    w: 259.214,
    h: 186.94,
    uw: 233.266,
    uh: 121.32,
    rot: -17.84,
  },
  {
    src: `${A}553377118f80261aca4b3704fe56b40fa81caae6.svg`,
    x: -144.74,
    y: 44.5,
    w: 259.214,
    h: 186.94,
    uw: 233.266,
    uh: 121.32,
    rot: -17.84,
  },
  {
    src: `${A}9e7f55c94816ec9d3c1a430ce65b2f018400a11c.svg`,
    x: -33.78,
    y: 53.17,
    w: 49.858,
    h: 44.163,
    uw: 41.772,
    uh: 32.952,
    rot: -17.84,
  },
  {
    src: `${A}64548253b422862edd3db4fae61ad89a74d30068.svg`,
    x: 78.56,
    y: 167.37,
    w: 131.59,
    h: 81.297,
    uw: 123.546,
    uh: 45.648,
    rot: -17.84,
  },
  {
    src: `${A}0549d8bdce5fc5af88ab1bf5dff3ef428577b89e.svg`,
    x: 66,
    y: 160.92,
    w: 234.807,
    h: 123.635,
    uw: 228.535,
    uh: 56.34,
    rot: -17.84,
  },
  {
    src: `${A}7c5c71cda350dbff34a974b3a3dd69702883853e.svg`,
    x: 16.72,
    y: 91.81,
    w: 266.433,
    h: 153.476,
    uw: 254.342,
    uh: 79.384,
    rot: -17.84,
  },
  {
    src: `${A}b3598e6c39463dba90e7945c85d52865b5be23fb.svg`,
    x: 150.23,
    y: 147.72,
    w: 26.248,
    h: 14.209,
    uw: 25.401,
    uh: 6.753,
    rot: -17.84,
  },
  {
    src: `${A}a455a547c2bf3e5e7280716a2a4296d2f67096d5.svg`,
    x: 92.36,
    y: 175.66,
    w: 53.955,
    h: 37.408,
    uw: 49.121,
    uh: 23.49,
    rot: -17.84,
  },
  {
    src: `${A}e0e80da72e2def8f61d7e0ba119d7cfbe77de7de.svg`,
    x: 130.36,
    y: 59.57,
    w: 176.673,
    h: 122.773,
    uw: 160.736,
    uh: 77.251,
    rot: -17.84,
  },
  {
    src: `${A}f04b77345187fd5004b5f2c0c99d903380e2a112.svg`,
    x: 208.15,
    y: 15.37,
    w: 166.027,
    h: 103.601,
    uw: 155.49,
    uh: 58.8,
    rot: -17.84,
  },
  {
    src: `${A}ff302c7908088858ebd71891db3fe09a1a7833d2.svg`,
    x: 28.33,
    y: 164.17,
    w: 140.336,
    h: 171.618,
    uw: 99.738,
    uh: 148.19,
    rot: -17.84,
  },
  {
    src: `${A}0f05f5d46d161c012803a85f81acccdc47d090bd.svg`,
    x: -40.02,
    y: -219.9,
    w: 111.896,
    h: 228.203,
    uw: 93.257,
    uh: 221.009,
    rot: 4.93,
    flip: true,
  },
  {
    src: `${A}76c6edbd88042717b80bab8f733ad9eb903e1c81.svg`,
    x: -168.41,
    y: 181.87,
    w: 226.687,
    h: 266.987,
    uw: 164.966,
    uh: 227.386,
    rot: -17.84,
  },
  {
    src: `${A}0aea5d764af90aa4aae98d8c5036dbcd4459234f.svg`,
    x: 289.45,
    y: 181.94,
    w: 230.183,
    h: 276.253,
    uw: 165.568,
    uh: 236.927,
    rot: -17.84,
  },
  {
    src: `${A}c0ea77e32eb67d7a160e7db2bf2bdccf7e55eae4.svg`,
    x: -106.54,
    y: -77.62,
    w: 124.721,
    h: 126.92,
    uw: 113.537,
    uh: 64.489,
    rot: -46.82,
    flip: true,
  },
  {
    src: `${A}cb862731601d6e8583767e47f8d800bc32b30980.svg`,
    x: 351.24,
    y: -77.62,
    w: 126.455,
    h: 128.548,
    uw: 113.537,
    uh: 66.868,
    rot: -46.82,
    flip: true,
  },
]

/**
 * วิทยาการคอมพิวเตอร์ also has two rounded outlines that Figma exports as strokes on a
 * shape rather than as vectors, so they stay CSS borders instead of images.
 */
const CS_OUTLINES = [
  { x: 170.95, y: 86.56, w: 54, h: 55 },
  { x: 240.81, y: 11.35, w: 44.11, h: 44.11, uw: 36.387, uh: 36.387, rot: -14 },
]

export default function ScopeCardArt({ items, outlines }: { items: Art[]; outlines?: boolean }) {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0">
      {items.map((a, i) => {
        const uw = a.uw ?? a.w
        const uh = a.uh ?? a.h
        const bleed = a.bleed ?? 5
        const spin = a.rot || a.flip
        return (
          <img
            key={i}
            src={a.src}
            alt=""
            className="absolute max-w-none"
            style={{
              left: a.x + a.w / 2 - uw / 2 - bleed,
              top: a.y + a.h / 2 - uh / 2 - bleed,
              width: uw + bleed * 2,
              height: uh + bleed * 2,
              transform: spin
                ? `rotate(${a.rot ?? 0}deg)${a.flip ? ' scaleY(-1)' : ''}`
                : undefined,
            }}
          />
        )
      })}
      {outlines &&
        CS_OUTLINES.map((o, i) => (
          <div
            key={i}
            className="absolute rounded-[75.5px] border-10 border-brand-red/50"
            style={{
              left: o.x + o.w / 2 - (o.uw ?? o.w) / 2,
              top: o.y + o.h / 2 - (o.uh ?? o.h) / 2,
              width: o.uw ?? o.w,
              height: o.uh ?? o.h,
              transform: o.rot ? `rotate(${o.rot}deg)` : undefined,
            }}
          />
        ))}
    </div>
  )
}
