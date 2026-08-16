export const PREFIX_OPTIONS = ['นาย', 'นาง', 'นางสาว', 'เด็กชาย', 'เด็กหญิง']

export const ADVISOR_DOCUMENTS = [
  'สำเนาบัตรประจำตัวประชาชน หรือบัตรประจำตัวสำหรับ บุคคลที่ไม่ใช่สัญชาติไทย พร้อมเซ็นสำเนาถูกต้อง (เฉพาะด้านหน้า) *',
  'เอกสารแสดงสถานภาพการเป็นอาจารย์ประจำ ในสถานศึกษา เช่น บัตรประจำตัวอาจารย์ บัตรข้าราชการครู หรือหนังสือรับรองจากสถานศึกษา *',
]

/**
 * FIGMA'S ORDER, which is not the order this list used to be in. `2053:498` (entrant 1) and
 * `2053:694` (entrant 2) both stack the three rows ID copy → ปพ.7 → photo:
 *
 *   `2053:550`  y462   สำเนาบัตรประจำตัวประชาชน …
 *   `2053:558`  y637   สำเนา ปพ.7 …
 *   `2053:566`  y812   รูปถ่ายนักเรียนหน้าตรง …
 *
 * The photo was FIRST here and is THIRD in both frames. It also carries its own caption and
 * its own accepted types — `2053:572` is "(JPG, PNG, PDF)" against `2053:556` / `2053:564`'s
 * "(PDF เท่านั้น)" — so the rows are records rather than bare strings. `hint` omitted means the
 * PDF-only default in `UploadBox`, which is what the other two rows and both advisor rows say.
 *
 * The trailing `*` is inside each string because Figma puts it inside the text node. Note the
 * advisor labels end " *" (space) and these end "*" (none): that is `2053:370` vs `2053:550`
 * verbatim, not an inconsistency introduced here.
 */
export const STUDENT_DOCUMENTS: { text: string; hint?: string; kind?: 'photo' }[] = [
  {
    text: 'สำเนาบัตรประจำตัวประชาชน หรือบัตรประจำตัวสำหรับ บุคคลที่ไม่ใช่สัญชาติไทย พร้อมเซ็นสำเนาถูกต้อง (เฉพาะด้านหน้า)*',
  },
  { text: 'สำเนา ปพ.7 (ใบรับรองผลการศึกษา) ของผู้เข้าแข่งขันแต่ละคน พร้อมเซ็นสำเนาถูกต้อง*' },
  {
    text: 'รูปถ่ายนักเรียนหน้าตรง ขนาด 1.5 นิ้ว*',
    hint: 'จำกัดขนาดเอกสารไม่เกิน 10 MB (JPG, PNG, PDF)',
    kind: 'photo',
  },
]

import {
  CODERN_TERMS,
  COMPETITION_RULES,
  PRIVACY_POLICY,
  WEBSITE_TERMS,
  type PolicyDocument,
} from './privacyPolicy'

/**
 * The terms step's single checkbox sentence (Figma `2053:108`) names four documents inline —
 * `AGREEMENT_LINKS[title]` is what each underlined span opens in the shared `PolicyModal`.
 */
export const AGREEMENT_LINKS: Record<string, PolicyDocument> = {
  กฎกติกาการแข่งขัน: COMPETITION_RULES,
  ข้อกำหนดการใช้งานเว็บไซต์: WEBSITE_TERMS,
  'ข้อกำหนดการใช้งาน Codern': CODERN_TERMS,
  นโยบายความเป็นส่วนตัว: PRIVACY_POLICY,
}

/**
 * Opt-in consents, each answered ยอมรับ / ไม่ยอมรับ. Figma `2053:108`'s "ความยินยอม" section —
 * only the health row carries a required asterisk (`2053:157`); the media-release row does not.
 */
export const CONSENTS: { icon: string; title: string; description: string; required?: boolean }[] =
  [
    {
      icon: '/assets/figma/7f4dd2c6e6ebec96d5fe71c224a5e8bf0d93d3df.svg',
      title: 'ข้อมูลสุขภาพและอาหาร',
      description:
        'อาหารที่แพ้ ประเภทอาหารพิเศษ ยาที่แพ้ โรคประจำตัวของผู้เข้าแข่งขันและอาจารย์ ใช้จัดเตรียมอาหาร และเจ้าหน้าที่ประสานห้องพยาบาลในรอบ on-site',
      required: true,
    },
    {
      icon: '/assets/figma/d22d5df5522d34211a6a4ec618ee81b722ec8af8.svg',
      title: 'ใช้ภาพถ่ายและวิดีโอกิจกรรมเพื่อประชาสัมพันธ์',
      description: 'ไม่รวมภาพที่บันทึกเพื่อควบคุมการแข่งขัน',
    },
  ]
