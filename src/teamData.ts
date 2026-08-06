export const TEAM = {
  name: 'ทีม A',
  code: 'BH001/26',
  school: 'บางมดวิทยาคม',
  updatedAt: '26 ก.ค. 69 15:47 น.',
}

/** Figma exports each tab glyph twice — #282828 when the tab is selected, #8C8C8C when not. */
const USER_ICON = {
  on: '/assets/figma/46435d09968aa3cd78e1661332b577f07549b180.svg',
  off: '/assets/figma/051a604d8e88c2ee21caed756bbbf72bdd1d3917.svg',
}

const MORTARBOARD_ICON = {
  on: '/assets/figma/273c4fd108326af21c9881e87baf774bd9e8da90.svg',
  off: '/assets/figma/2b32f248e805ae67208753776a4847b870f372b3.svg',
}

export type Person = {
  /** Tab label. */
  tab: string
  icon: { on: string; off: string }
  /** Heading of the first detail section. */
  heading: string
  thaiPrefix: string
  thaiName: string
  enPrefix: string
  enName: string
  /** Entrants carry a birth date; the advisor row in the design does not. */
  birthDate?: string
  email: string
  phone: string
  lineId: string
  documents: { label: string; file: string; size: string }[]
}

const ENTRANT_DOCUMENTS = [
  {
    label: 'รูปถ่ายนักเรียนหน้าตรง ขนาด 1.5 นิ้ว',
    file: 'Photo.pdf',
    size: '7.4 MB',
  },
  {
    label:
      'สำเนาบัตรประจำตัวประชาชน หรือบัตรประจำตัวสำหรับ บุคคลที่ไม่ใช่สัญชาติไทย พร้อมเซ็นสำเนาถูกต้อง (เฉพาะด้านหน้า)',
    file: 'IDcard.pdf',
    size: '9.3 MB',
  },
  {
    label: 'สำเนา ปพ.7 (ระเบียนแสดงผลการเรียน) ของผู้เข้าแข่งขัน พร้อมเซ็นสำเนาถูกต้อง',
    file: 'Transcript.pdf',
    size: '9.3 MB',
  },
]

const ADVISOR_DOCUMENTS = [
  {
    label:
      'สำเนาบัตรประจำตัวประชาชน หรือบัตรประจำตัวสำหรับ บุคคลที่ไม่ใช่สัญชาติไทย พร้อมเซ็นสำเนาถูกต้อง (เฉพาะด้านหน้า)',
    file: 'IDcard.pdf',
    size: '7.4 MB',
  },
  {
    label:
      'เอกสารแสดงสถานภาพการเป็นอาจารย์ประจำในสถานศึกษา เช่น บัตรประจำตัวอาจารย์ บัตรข้าราชการครู หรือหนังสือรับรองจากสถานศึกษา',
    file: 'ID.pdf',
    size: '9.3 MB',
  },
]

const SHARED = {
  thaiPrefix: 'นางสาว',
  thaiName: 'ณัฐชา  เดชดำรง',
  enPrefix: 'Mrs.',
  enName: 'Natasha Dejdumrong',
  email: 'abcd.cpe@kmutt.ac.th',
  phone: '0912345678',
  lineId: 'abcd',
}

export const MEMBERS: Person[] = [
  {
    tab: 'ผู้เข้าแข่งขันคนที่ 1',
    icon: USER_ICON,
    heading: '1. ข้อมูลผู้เข้าแข่งขันคนที่ 1',
    ...SHARED,
    birthDate: '26 กรกฎาคม 2551',
    documents: ENTRANT_DOCUMENTS,
  },
  {
    tab: 'ผู้เข้าแข่งขันคนที่ 2',
    icon: USER_ICON,
    heading: '1. ข้อมูลผู้เข้าแข่งขันคนที่ 2',
    ...SHARED,
    birthDate: '26 กรกฎาคม 2551',
    documents: ENTRANT_DOCUMENTS,
  },
  {
    tab: 'ผู้เข้าแข่งขันคนที่ 3',
    icon: USER_ICON,
    heading: '1. ข้อมูลผู้เข้าแข่งขันคนที่ 3',
    ...SHARED,
    birthDate: '26 กรกฎาคม 2551',
    documents: ENTRANT_DOCUMENTS,
  },
  {
    tab: 'อาจารย์',
    icon: MORTARBOARD_ICON,
    heading: '1. ข้อมูลอาจารย์',
    ...SHARED,
    documents: ADVISOR_DOCUMENTS,
  },
]

/** Badge styles, matching the four icon treatments in the design. */
export type StepTone = 'ok' | 'pending' | 'alert' | 'failed'

export type StatusStep = {
  title: string
  /** Right-hand status label; omitted when the step lists per-person rows instead. */
  label?: string
  tone: StepTone
  /**
   * The 28px badge (a 16 glyph in a 6px ring) instead of the 32 (a 20 glyph). Exactly ONE
   * step in the eight designed cards is drawn this way: Not Qualified's rounds-of-selection
   * row, `708:2883`. Every other badge in every other card — including the OTHER failed
   * outcome, Semi-Final Failed `708:2971`, which is a 20 close glyph in a 32 pill — is 32.
   *
   * It was previously set on `reviewing`'s document review, which Figma draws at 32
   * (`708:2662`), and StatusPanel additionally forced it onto any `failed` tone, which broke
   * Semi-Final Failed. Both read off the frames now rather than being inferred from tone.
   */
  compact?: boolean
  /** Per-person review rows shown inside the document-review step. */
  rows?: { title: string; label: string; tone: StepTone }[]
  /** Renders the ติดต่อทีมงาน social row under the step. */
  contact?: boolean
}

export const STATUS_VARIANTS = [
  'reviewing',
  'issue',
  'qualified',
  'selection-pending',
  'selection-failed',
  'semifinal-qualified',
  'semifinal-pending',
  'semifinal-failed',
] as const

export type TeamStatus = (typeof STATUS_VARIANTS)[number]

const REGISTERED: StatusStep = {
  title: 'ลงทะเบียนเข้าร่วม',
  label: 'ลงทะเบียนสำเร็จ',
  tone: 'ok',
}

const DOCS_OK: StatusStep = { title: 'ตรวจสอบเอกสาร', label: 'ตรวจสอบสำเร็จ', tone: 'ok' }

const person = (title: string, label: string, tone: StepTone) => ({ title, label, tone })

/**
 * Every step list in the designed status cards. One entry per `Status Card / …` frame, in the
 * order Figma lays them out:
 *   reviewing            `708:2646`  Pending Review
 *   issue                `708:2689`  Document Issues        (the only card with a contact row)
 *   qualified            `708:2745`  Qualified for Selection
 *   selection-pending    `708:2823`  Selection In Progress
 *   selection-failed     `708:2857`  Not Qualified          (the only compact badge)
 *   semifinal-qualified  `708:2779`  Passed Selection & Semi-Final
 *   semifinal-pending    `708:2891`  Semi-Final Complete
 *   semifinal-failed     `708:2935`  Semi-Final Failed
 */
export const STATUS_STEPS: Record<TeamStatus, StatusStep[]> = {
  reviewing: [
    REGISTERED,
    {
      title: 'ตรวจสอบเอกสาร',
      tone: 'pending',
      // `708:2662` is a full 32 badge — the amber dot is 20 (`708:2663`), not 16.
      rows: MEMBERS.map((m) => person(m.tab, 'กำลังตรวจสอบ', 'pending')),
    },
  ],
  issue: [
    REGISTERED,
    {
      title: 'ตรวจสอบเอกสาร',
      tone: 'alert',
      rows: [
        ...MEMBERS.slice(0, 3).map((m) => person(m.tab, 'ตรวจสอบสำเร็จ', 'ok')),
        person('อาจารย์', 'เอกสารมีปัญหา', 'alert'),
      ],
      contact: true,
    },
  ],
  qualified: [
    REGISTERED,
    DOCS_OK,
    { title: 'การเข้าแข่งขันรอบคัดเลือก', label: 'ผ่านการคัดเลือก', tone: 'ok' },
  ],
  'selection-pending': [
    REGISTERED,
    DOCS_OK,
    { title: 'การเข้าแข่งขันรอบคัดเลือก', label: 'กำลังสรุปผล', tone: 'pending' },
  ],
  'selection-failed': [
    REGISTERED,
    DOCS_OK,
    {
      title: 'การเข้าแข่งขันรอบคัดเลือก',
      label: 'ไม่ผ่านการคัดเลือก',
      tone: 'failed',
      // `708:2883` — 28 pill, 16 close glyph, in a 36x32 wrapper (`708:2882`).
      compact: true,
    },
  ],
  'semifinal-qualified': [
    REGISTERED,
    DOCS_OK,
    { title: 'การเข้าแข่งขันรอบคัดเลือก', label: 'ผ่านการคัดเลือก', tone: 'ok' },
    { title: 'การเข้าแข่งขันรอบรองชนะเลิศ', label: 'ผ่านการคัดเลือก', tone: 'ok' },
  ],
  'semifinal-pending': [
    REGISTERED,
    DOCS_OK,
    { title: 'การเข้าแข่งขันรอบคัดเลือก', label: 'ผ่านการคัดเลือก', tone: 'ok' },
    { title: 'การเข้าแข่งขันรอบรองชนะเลิศ', label: 'กำลังสรุปผล', tone: 'pending' },
  ],
  'semifinal-failed': [
    REGISTERED,
    DOCS_OK,
    { title: 'การเข้าแข่งขันรอบคัดเลือก', label: 'ผ่านการคัดเลือก', tone: 'ok' },
    // NOT compact: `708:2971` is a 32 pill with a 20 close glyph (`708:2972`), unlike
    // Not Qualified's 28. Same tone, different diameter — hence the per-step flag.
    { title: 'การเข้าแข่งขันรอบรองชนะเลิศ', label: 'ไม่ผ่านการคัดเลือก', tone: 'failed' },
  ],
}

/**
 * Figma 708:3147 — the second card the qualified dashboard stacks under the status card.
 * All four strings re-verified against `708:3150` / `708:3151` / `708:3158` / `708:3160`,
 * trailing space on `label` included (Figma's node carries it).
 */
export const DISCORD_CARD = {
  title: 'การเข้าแข่งขันรอบคัดเลือก',
  subtitle: 'กรุณาเข้าร่วม Discord เพื่อใช้ในการแข่งขัน',
  label: 'เข้าร่วม Discord ',
  action: 'รับรหัสเข้าร่วม',
}

/*
 * The two result dialogues, both transcribed from the 1440 frames and both re-verified
 * character for character.
 *
 * NOTE for anyone opening these in Figma: the frame NAMES are swapped. `708:2979`
 * "Qualified Modal" is the sheet that carries this copy and the Discord button
 * (`708:3166`); `708:3373` "Qualified with Discord" actually holds the REJECTED sheet
 * (`708:3560`); and `708:3187` "Not Qualified Modal" has no overlay on it at all. Go by the
 * sheet ids below, not the frame names. Neither dialogue has a 402 counterpart anywhere in
 * the file's Mobile section, so 1440 is the only anchor there is.
 */
export const QUALIFIED_MODAL = {
  image: '/assets/figma/8e7000b311d9ed819a112098ef1a6399fc8d8743.png',
  /** `708:3169` — 40 / SemiBold / #282828. */
  title: 'ทีมของคุณมีสิทธิ์เข้าแข่งขันรอบคัดเลือก',
  /** `708:3170` — 24 / Regular / #8c8c8c, split on the node's own newline. */
  lines: ['ขอแสดงความยินดีกับทีมของคุณ', 'กรุณาเข้าร่วม Discord สำหรับใช้ในการแข่งขันรอบคัดเลือก'],
}

export const REJECTED_MODAL = {
  image: '/assets/figma/88a60428462d844f1f3ed64f3d0783097c2d33ac.png',
  /** `708:3563` — 40 / SemiBold / #c0563e, which is why MyTeam passes `text-brand-red`. */
  title: 'ทีมของคุณไม่มีสิทธิ์เข้าแข่งขันรอบคัดเลือก',
  /*
   * `708:3564` — 24 / Regular / #8c8c8c. One string in Figma with no newline in it, wrapping
   * to two lines in its 720 box; kept as the same two lines here, which is where it breaks.
   */
  lines: [
    'ขออภัยทีม เอกสารของทีมของคุณไม่ผ่านเกณฑ์การพิจารณา',
    'แล้วพบกันใหม่ในการแข่งขันครั้งหน้า',
  ],
}
