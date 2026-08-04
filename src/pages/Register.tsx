import { Link } from 'react-router-dom'
import AuthPageShell from '../components/AuthPageShell'
import { authLink, useOwnArrival } from '../components/form/wizardNav'
import { DOCUMENT_GROUPS } from '../data'

/**
 * Figma crops the student illustration inside its 196 box rather than fitting it, so
 * the two mascots carry different image treatments.
 */
const SECTIONS = [
  {
    image: '/assets/figma/522303cab6b008daf26c3f0e8e3f2ec214a0c0cf.png',
    imageStyle: { height: '100%', width: '114.29%', left: '-11.85%', top: '0.16%' },
    title: 'นักเรียนผู้เข้าแข่งขัน',
    items: 0,
  },
  {
    image: '/assets/figma/2a36441d02ccfe195207a9ad27345494771cc3b6.png',
    title: 'อาจารย์',
    items: 1,
  },
]

/** The requirement copy differs slightly from the guide page's wording. */
const REQUIREMENTS = [
  [
    'สำเนาบัตรประจำตัวประชาชน หรือบัตรประจำตัวสำหรับบุคคลที่ไม่ใช่สัญชาติไทย (เฉพาะด้านหน้า) พร้อมเซ็นสำเนาถูกต้อง',
    'สำเนา ปพ.7 (ใบรับรองผลการศึกษา) ฉบับจริงของผู้เข้าแข่งขันแต่ละคน พร้อมเซ็นสำเนาถูกต้อง',
    'รูปถ่ายของนักเรียนผู้เข้าแข่งขัน',
  ],
  DOCUMENT_GROUPS[1].items,
]

/** Figma 708:1174 — the gate that lists what to bring before the wizard opens. */
export default function Register() {
  /*
   * The sheet has to spring up every time the user arrives here, and it arrives two very
   * different ways. Through the sign-in morph, the spring belongs to the transition —
   * `::view-transition-new(auth-sheet)` is the snapshot that travels. On a direct load or a
   * reload there is no transition at all, and the plate used to simply be there, which is
   * what "มันยังไม่เด้งมา" reports. `auth-sheet-spring` gives the element the same spring of
   * its own, and this test is what keeps the two from ever running at once.
   */
  const spring = useOwnArrival()

  return (
    <AuthPageShell>
      {/*
       * `auth-sheet` is the view-transition name that makes this card spring up over the
       * colour blocks as they morph out of the sign-in layout, and then carries the same
       * white plate on into the wizard's form card (styles/auth-motion.css).
       */}
      <div
        className={`auth-sheet ${spring ? 'auth-sheet-spring' : ''} mt-8 flex min-h-[850px] flex-1 flex-col items-start gap-8 rounded-t-[32px] bg-white p-6 shadow-soft lg:mt-[66px] lg:p-10`}
      >
        <h1 className="text-3xl leading-[1.4] font-semibold lg:text-[40px]">
          ลงทะเบียนเข้าแข่งขัน
        </h1>

        <div className="flex w-full flex-col items-start justify-center gap-4">
          {SECTIONS.map((section) => (
            <section
              key={section.title}
              className="flex w-full flex-col items-center gap-6 rounded-[24px] p-0 md:flex-row md:items-start md:justify-end md:gap-15 md:p-6"
            >
              <div className="relative size-[140px] shrink-0 overflow-hidden lg:size-[196px]">
                <img
                  src={section.image}
                  alt=""
                  aria-hidden
                  className="absolute max-w-none object-cover"
                  style={section.imageStyle ?? { inset: 0, height: '100%', width: '100%' }}
                />
              </div>
              <div className="flex flex-1 flex-col items-start gap-4">
                <h2 className="text-xl leading-[1.4] font-medium lg:text-2xl">{section.title}</h2>
                <ul className="w-full list-disc text-lg leading-[1.5] font-light lg:text-xl">
                  {REQUIREMENTS[section.items].map((item) => (
                    <li key={item} className="ms-[30px]">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          ))}
        </div>

        {/* Figma sets this label in Sukhumvit Set, not Noto */}
        {/* `enter`, not `forward`: this hop sinks the colour blocks away and spills the
            wizard's pasta in, which no step-to-step move should do. */}
        <Link
          {...authLink('/register/team', 'enter')}
          className="mm-press flex h-15 w-full items-center justify-center rounded-[20px] bg-brand-red px-6 py-4 font-display text-lg leading-[normal] font-semibold text-white transition-opacity hover:opacity-90 lg:text-xl"
        >
          ลงทะเบียน
        </Link>
      </div>
    </AuthPageShell>
  )
}
