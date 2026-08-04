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
   * Figma draws the badge at 28px instead of 32px on a couple of steps — the pending
   * document review and every failed outcome — so the diameter is part of the data.
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

/** Every step list in the designed status cards. */
export const STATUS_STEPS: Record<TeamStatus, StatusStep[]> = {
  reviewing: [
    REGISTERED,
    {
      title: 'ตรวจสอบเอกสาร',
      tone: 'pending',
      compact: true,
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
    { title: 'การเข้าแข่งขันรอบคัดเลือก', label: 'ไม่ผ่านการคัดเลือก', tone: 'failed' },
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
    { title: 'การเข้าแข่งขันรอบรองชนะเลิศ', label: 'ไม่ผ่านการคัดเลือก', tone: 'failed' },
  ],
}

/** Figma 708:3147 — the second card the qualified dashboard stacks under the status card. */
export const DISCORD_CARD = {
  title: 'การเข้าแข่งขันรอบคัดเลือก',
  subtitle: 'กรุณาเข้าร่วม Discord เพื่อใช้ในการแข่งขัน',
  label: 'เข้าร่วม Discord ',
  action: 'รับรหัสเข้าร่วม',
}

export const QUALIFIED_MODAL = {
  image: '/assets/figma/8e7000b311d9ed819a112098ef1a6399fc8d8743.png',
  title: 'ทีมของคุณมีสิทธิ์เข้าแข่งขันรอบคัดเลือก',
  lines: ['ขอแสดงความยินดีกับทีมของคุณ', 'กรุณาเข้าร่วม Discord สำหรับใช้ในการแข่งขันรอบคัดเลือก'],
}

export const REJECTED_MODAL = {
  image: '/assets/figma/88a60428462d844f1f3ed64f3d0783097c2d33ac.png',
  title: 'ทีมของคุณไม่มีสิทธิ์เข้าแข่งขันรอบคัดเลือก',
  lines: [
    'ขออภัยทีม เอกสารของทีมของคุณไม่ผ่านเกณฑ์การพิจารณา',
    'แล้วพบกันใหม่ในการแข่งขันครั้งหน้า',
  ],
}
