export const PAST_INTRO = {
  title: 'โครงการแข่งขันแก้ไขปัญหาด้วยการเขียนโปรแกรมคอมพิวเตอร์ (BangMod Hackathon)',
  /*
   * The run of three spaces before "โดยนักเรียน" is in the Figma copy, so the paragraphs
   * render with `whitespace-pre-wrap` rather than letting the browser collapse it.
   */
  paragraphs: [
    'โครงการนี้เปิดโอกาสให้นักเรียนมัธยมปลาย และนักศึกษาอาชีวศึกษา ระดับ ปวช. หรือเทียบเท่า ได้เข้าร่วมการแข่งขัน เขียนโปรแกรมด้วย ภาษา C/C++ ในรูปแบบทีม เพื่อเสริมสร้างทักษะการเขียนโปรแกรม พร้อมทั้งฝึก การทำงานร่วมกันและเก็บเกี่ยวประสบการณ์ จากการลงสนามจริง ชิงเงินรางวัลกว่า 60,000 บาท',
    'ภาควิชาวิศวกรรมคอมพิวเตอร์ คณะวิศวกรรมศาสตร์ มหาวิทยาลัยเทคโนโลยีพระจอมเกล้าธนบุรี ได้เล็งเห็นว่าการที่นักเรียนระดับ มัธยมศึกษาตอนปลายจะมีศักยภาพได้นั้นต้องได้รับการพัฒนาทักษะในด้านต่าง ๆ เพื่อให้นักเรียนเกิดประสบการณ์และได้รับการ พัฒนาศักยภาพ รวมทั้งเป็นแนวทางในการตัดสินใจเลือกศึกษาต่อในระดับอุดมศึกษา   โดยนักเรียนที่ได้รับรางวัลที่ 1-3 ในการแข่งขันจะมีสิทธิได้รับการพิจารณาสอบสัมภาษณ์ในภาควิชาที่กำหนดของคณะวิศวกรรมศาสตร์',
  ],
}

/** Percentages of the frame the artwork sits in — Figma crops fills by over-sizing them. */
type Crop = { left: number; top: number; width: number; height: number }

export type PastEvent = {
  title: string
  subtitle: string
  photo: string
  /** Absent = a plain cover fill; present = Figma's own over-sized crop of the shot. */
  photoCrop?: Crop
  /** Flat black wash Figma lays over the photo before the scroll-edge blur, 0-1. */
  photoWash?: number
  /** `null` = a multi-part vector with no single export, recomposed by <Mark2024>. */
  logo: { src: string; crop?: Crop } | null
  /** Figma boxes the 2024 wordmark at 300x242; the other two marks are 1:1. */
  logoHeight: number
  /** Background-blur radius on this card's "Scroll Edge Effect - Soft" instance. */
  edgeBlur: number
  awards: { label: string; winners: string[] }[]
}

export const PAST_EVENTS: PastEvent[] = [
  {
    title: 'BangMod Hackathon 2025',
    subtitle: 'โครงการแข่งขันแก้ไขปัญหาด้วยการเขียนโปรแกรมคอมพิวเตอร์ประจำปี 2568',
    photo: '/assets/figma/7f7ec64cfe9729b2619daf4a4f3de4491da3fecb.jpg',
    photoCrop: { left: -3.73, top: -0.04, width: 118.52, height: 100 },
    logo: {
      src: '/assets/figma/72fe1e1a5c377a144b1956ea6e6202893273ad34-900.png',
      crop: { left: -7.5, top: -17.54, width: 115.26, height: 115.26 },
    },
    logoHeight: 300,
    edgeBlur: 50,
    awards: [
      { label: 'รางวัลชนะเลิศ', winners: ['โรงเรียนระยองวิทยาคม'] },
      { label: 'รางวัลรองชนะเลิศอันดับ 1', winners: ['โรงเรียนปรินส์รอยแยลส์วิทยาลัย'] },
      { label: 'รางวัลรองชนะเลิศอันดับ 2', winners: ['โรงเรียนสุรนารีวิทยา'] },
      {
        label: 'รางวัลชมเชย',
        winners: ['โรงเรียนประชาคมนานาชาติ', 'โรงเรียนราชสีมาวิทยาลัย'],
      },
    ],
  },
  {
    title: 'BangMod Hackathon 2024',
    subtitle: 'โครงการแข่งขันแก้ไขปัญหา ด้วยการเขียนโปรแกรมคอมพิวเตอร์ประจำปี 2567',
    photo: '/assets/figma/a5f11602db16c55a1851a282a3cd8cb0b9cbd48b.jpg',
    logo: null,
    logoHeight: 242,
    edgeBlur: 50,
    awards: [
      { label: 'รางวัลชนะเลิศ', winners: ['โรงเรียนสวนกุหลาบวิทยาลัย'] },
      { label: 'รางวัลรองชนะเลิศอันดับ 1', winners: ['โรงเรียนปทุมเทพวิทยาคาร'] },
      { label: 'รางวัลรองชนะเลิศอันดับ 2', winners: ['โรงเรียนปทุมเทพวิทยาคาร'] },
      {
        label: 'รางวัลชมเชย',
        winners: ['โรงเรียนพัฒนาวิทยา', 'โรงเรียนมหิดลวิทยานุสรณ์'],
      },
    ],
  },
  {
    title: 'BangMod Hackathon 2023',
    subtitle: 'โครงการแข่งขันแก้ไขปัญหา ด้วยการเขียนโปรแกรมคอมพิวเตอร์ประจำปี 2566',
    photo: '/assets/figma/6f2d13382d475539bdc47c33b75854bf59ffc124.jpg',
    photoWash: 0.35,
    logo: { src: '/assets/figma/c7e06ba99e591f3701746b5c4cf082fb4e0c0ec0.png' },
    logoHeight: 300,
    edgeBlur: 10,
    awards: [
      { label: 'รางวัลชนะเลิศ', winners: ['โรงเรียนปทุมเทพวิทยาคาร'] },
      { label: 'รางวัลรองชนะเลิศอันดับ 1', winners: ['โรงเรียนเตรียมอุดมศึกษา'] },
      { label: 'รางวัลรองชนะเลิศอันดับ 2', winners: ['โรงเรียนประชาคมนานาชาติ'] },
      {
        label: 'รางวัลชมเชย',
        winners: ['โรงเรียนสวนกุหลาบวิทยาลัย', 'โรงเรียนกำเนิดวิทย์'],
      },
    ],
  },
]
