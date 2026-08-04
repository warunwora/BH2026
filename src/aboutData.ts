import { ALGO_ART, CS_ART, MATH_ART, type Art } from './components/ScopeCardArt'

export const SCOPE_INTRO =
  'เนื้อหาที่ใช้ในการแข่งขันครอบคลุม 3 กลุ่มวิชาหลัก ได้แก่ คณิตศาสตร์ วิทยาการคอมพิวเตอร์ และอัลกอริทึม'

type ScopeCard = {
  /** Figma's folder silhouette, exported with the card's colour already baked in. */
  folder: string
  /** the folder is 250 tall on the first two cards and 248 on the third */
  folderHeight: number
  title: string
  body: string
  count: number
  art: Art[]
  /** วิทยาการคอมพิวเตอร์ alone has two stroked outlines that export as CSS borders */
  outlines?: boolean
}

export const SCOPE_CARDS: ScopeCard[] = [
  {
    folder: '/assets/figma/83086dce7e6552a2a47918bd0267d19481d8c858.svg',
    folderHeight: 250,
    title: 'คณิตศาสตร์',
    body: 'ครอบคลุมเลขคณิต เรขาคณิต และโครงสร้างไม่ต่อเนื่องที่จำเป็นสำหรับการเขียนโปรแกรมแก้ปัญหา',
    count: 2,
    art: MATH_ART,
  },
  {
    folder: '/assets/figma/dbabb1e0c4507f4641886e9e5e7ef8173a7efff4.svg',
    folderHeight: 250,
    title: 'วิทยาการคอมพิวเตอร์',
    body: 'ครอบคลุมพื้นฐานการเขียนโปรแกรม ทักษะการแก้ปัญหา โครงสร้างข้อมูล และการเรียกตัวเองซ้ำ',
    count: 4,
    art: CS_ART,
    outlines: true,
  },
  {
    folder: '/assets/figma/0c0fdd515c35124ddb91f46cb9af0a4994f2b894.svg',
    folderHeight: 248,
    title: 'อัลกอริทึม',
    body: 'ครอบคลุมการวิเคราะห์ความซับซ้อนของอัลกอริทึม กลวิธีทางอัลกอริทึม และอัลกอริทึมเชิงคำนวณพื้นฐาน',
    count: 3,
    art: ALGO_ART,
  },
]

/**
 * Figma sets both paragraphs in one text node separated by a blank line, so the space
 * between them is a full 36px line rather than a paragraph gap.
 */
export const CODERN_PARAGRAPHS = [
  'Codern คือแพลตฟอร์มที่จะใช้ในการแข่งขันครั้งนี้ พัฒนาโดยนักศึกษาภาควิชาวิศวกรรมคอมพิวเตอร์ คณะวิศวกรรมศาสตร์ มหาวิทยาลัยเทคโนโลยีพระจอมเกล้าธนบุรี ใช้สำหรับส่งโค้ด ตรวจผล และแสดงคะแนนแบบอัตโนมัติ',
  'ผู้เข้าแข่งขันเขียนโค้ดส่งเข้าระบบ ระบบรันเทสต์และแจ้งผลกลับให้ทันที ไม่ต้องรอกรรมการตรวจมือ โดยจะเปิดให้ทดลองใช้งานจริงก่อนวันแข่งขัน ในวันที่ 23-25 ก.ย. 2569 เพื่อให้ผู้เข้าแข่งขันคุ้นเคยกับหน้าตาระบบ วิธีส่งโค้ด และการอ่านผลตรวจ ก่อนใช้งานจริงในวันแข่งขัน',
]

export const FAQS = [
  {
    q: 'ใครสมัครเป็นผู้เข้าแข่งขันได้บ้าง',
    a: 'นักเรียนระดับมัธยมศึกษาตอนปลาย นักศึกษาอาชีวศึกษา ระดับ ปวช. หรือเทียบเท่า เท่านั้น',
  },
  {
    q: 'ผู้เข้าแข่งขันจำเป็นต้องมาจากสถานศึกษาเดียวกันหรือไม่',
    a: 'ผู้เข้าแข่งขันทั้งทีมจำเป็นต้องมาจากสถานศึกษาเดียวกัน',
  },
  {
    q: 'แต่ละสถานศึกษามีอาจารย์ที่ปรึกษาได้กี่คน',
    a: 'แต่ละสถานศึกษาสามารถมีอาจารย์ที่ปรึกษาประจำสถานศึกษาได้แค่ 1 คนเท่านั้น',
  },
  {
    q: 'การเข้าแข่งขันเสียค่าใช้จ่ายไหม',
    a: 'เข้าร่วมการแข่งขันฟรี ไม่มีค่าใช้จ่าย',
  },
]

export const CONTACT = {
  title: 'ติดต่อทีมงาน',
  description: 'สามารถติดต่อได้ในวันจันทร์ - อาทิตย์ เวลา 09:00 - 20:00 น.',
  place: 'ภาควิชาวิศวกรรมคอมพิวเตอร์ คณะวิศวกรรมศาสตร์',
  address: 'อาคารวิศววัฒนะ ชั้น 10-11 เลขที่ 126 ถ.ประชาอุทิศ แขวงบางมด เขตทุ่งครุ กรุงเทพฯ 10140',
}
