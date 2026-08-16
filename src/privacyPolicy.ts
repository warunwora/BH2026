/**
 * Consent documents shown in the modal on the terms step.
 * A `body` entry is a paragraph, a nested array is a bullet list, and an array of
 * `{ bullet, sub }` is a bullet list whose items carry their own sub-bullets.
 */
import {
  CODERN_TERMS_SECTIONS,
  COMPETITION_RULES_SECTIONS,
  PRIVACY_POLICY_SECTIONS,
  WEBSITE_TERMS_SECTIONS,
} from './policySections'

export type PolicyBlock = string | string[] | { bullet: string; sub: string[] }[]

export type PolicyDocument = {
  icon: string
  title: string
  subtitle: string
  /** Effective-date line above the sections, when the document has one. */
  effective?: string
  /** Renders the ดาวน์โหลด button in the footer. */
  downloadable?: boolean
  sections: { title: string; body: PolicyBlock[] }[]
}

const SUBTITLE = 'โครงการแข่งขันแก้ไขปัญหาด้วยการเขียนโปรแกรมคอมพิวเตอร์ ประจำปี 2569'

/** Figma node 708:2169 — Competition Rules Modal. */

/*
 * The four documents. Every `sections` array is now the real transcription in
 * `policySections.ts`, taken from the source .docx files — the placeholders these used to hold
 * (competition rules showing one privacy paragraph; the website terms and Codern terms each
 * aliasing a different document's body outright) are gone.
 *
 * `EFFECTIVE` is shared: all four .docx files carry the same commencement date and differ only
 * in their own last-revised date, which the documents state in their own text.
 */
const EFFECTIVE = 'มีผลบังคับใช้ตั้งแต่วันที่ 19 สิงหาคม 2569'

/** Figma node 708:2169 — Competition Rules Modal. */
export const COMPETITION_RULES: PolicyDocument = {
  icon: '/assets/figma/176d32b711d514c6bbb10d973644f3085a117ce1.svg',
  title: 'กฎกติกาการแข่งขัน',
  subtitle: SUBTITLE,
  effective: EFFECTIVE,
  downloadable: true,
  sections: COMPETITION_RULES_SECTIONS,
}

/** Figma node 708:2047 shell + node 719:36 content — Privacy Policy Modal. */
export const PRIVACY_POLICY: PolicyDocument = {
  icon: '/assets/figma/8198de2c60e10732616a8a9af8fed56ad7396820.svg',
  title: 'นโยบายความเป็นส่วนตัว',
  subtitle: SUBTITLE,
  effective: EFFECTIVE,
  downloadable: true,
  sections: PRIVACY_POLICY_SECTIONS,
}

export const WEBSITE_TERMS: PolicyDocument = {
  icon: '/assets/figma/176d32b711d514c6bbb10d973644f3085a117ce1.svg',
  title: 'ข้อกำหนดการใช้งานเว็บไซต์และระบบลงทะเบียน',
  subtitle: SUBTITLE,
  effective: EFFECTIVE,
  downloadable: true,
  sections: WEBSITE_TERMS_SECTIONS,
}

export const CODERN_TERMS: PolicyDocument = {
  icon: '/assets/figma/03e489cce381543e38ddae4414d0e87ba31d38d1.png',
  title: 'ข้อกำหนดการใช้งาน Codern',
  subtitle: SUBTITLE,
  effective: EFFECTIVE,
  downloadable: true,
  sections: CODERN_TERMS_SECTIONS,
}
