import type { Person } from '../../teamData'

const ATTACHMENT = '/assets/figma/c412e2fd006cf22ede211b3761a3aa2ac82caa30.svg'

/**
 * Figma's "Name" block: a 14/1.6 label over a 16/1.6 value, which is what makes the row
 * exactly 52 tall. The label weight is Regular in the first section and Light in the rest,
 * so it is passed in rather than assumed.
 */
function Field({
  label,
  light = false,
  children,
}: {
  label: string
  light?: boolean
  children: React.ReactNode
}) {
  return (
    <div className="flex min-w-0 flex-1 flex-col items-start gap-[4px]">
      <p className={`fl-14 leading-[1.6] text-gray-2 ${light ? 'font-light' : ''}`}>{label}</p>
      <div className="fl-16 leading-[1.6]">{children}</div>
    </div>
  )
}

function Separator() {
  return <div className="h-0 w-full border-t-[0.5px] border-[#dcdcdc]" />
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="w-full fl-20 leading-[1.4] font-medium">{children}</h2>
}

export default function PersonDetails({ person }: { person: Person }) {
  return (
    <div className="flex w-full flex-col items-start gap-6">
      <section className="flex w-full flex-col items-start gap-4">
        <SectionTitle>{person.heading}</SectionTitle>

        <div className="flex w-full flex-col items-start gap-4 md:flex-row">
          <Field label="ชื่อ-สกุล">
            <span className="flex items-center gap-[12px]">
              <span>{person.thaiPrefix}</span>
              <span className="whitespace-pre">{person.thaiName}</span>
            </span>
          </Field>
          <Field label="Name">
            <span className="flex items-center gap-[12px]">
              <span>{person.enPrefix}</span>
              <span>{person.enName}</span>
            </span>
          </Field>
          {/* the advisor row in the design carries no birth date, so the column drops out */}
          {person.birthDate && <Field label="วัน/เดือน/ปีเกิด">{person.birthDate}</Field>}
        </div>

        <div className="flex w-full flex-col items-start gap-4 md:flex-row">
          <Field label="อาหารที่แพ้">-</Field>
          <Field label="ประเภทอาหาร">-</Field>
        </div>

        <div className="flex w-full flex-col items-start gap-4 md:flex-row">
          <Field label="ยาที่แพ้">-</Field>
          <Field label="โรคประจำตัวและวิธีปฐมพยาบาลเบื้องต้น">-</Field>
        </div>
      </section>

      <Separator />

      <section className="flex w-full flex-col items-start gap-4">
        <SectionTitle>2. ข้อมูลติดต่อ</SectionTitle>
        <div className="flex w-full flex-col items-start gap-4 md:flex-row">
          <Field label="Email" light>
            {person.email}
          </Field>
          <Field label="เบอร์โทรศัพท์" light>
            {person.phone}
          </Field>
          <Field label="ID LINE" light>
            {person.lineId}
          </Field>
        </div>
      </section>

      <Separator />

      <section className="flex w-full flex-col items-start gap-4">
        <SectionTitle>3. เอกสาร</SectionTitle>
        {person.documents.map((doc) => (
          /* Figma: a 450-wide description then a 50 gutter before the attachment */
          <div
            key={doc.label}
            className="flex w-full flex-col items-start gap-2 lg:flex-row lg:gap-[50px]"
          >
            <p className="fl-16 leading-[1.6] font-light text-gray-2 lg:w-[450px] lg:shrink-0">
              {doc.label}
            </p>
            <a
              href="#"
              className="mm-press flex min-w-0 flex-1 items-center gap-[8px] transition-opacity hover:opacity-70"
            >
              <img
                src={ATTACHMENT}
                alt=""
                aria-hidden
                className="mm-icon-pop size-[24px] shrink-0"
              />
              <span className="fl-16 leading-[1.6]">{doc.file}</span>
              <span className="fl-16 leading-[1.6] font-light text-gray-2">{doc.size}</span>
            </a>
          </div>
        ))}
      </section>
    </div>
  )
}
