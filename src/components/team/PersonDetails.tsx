import type { Person } from '../../teamData'

const ATTACHMENT = '/assets/figma/c412e2fd006cf22ede211b3761a3aa2ac82caa30.svg'

/**
 * ── Both anchors, measured ─────────────────────────────────────────────────────────────────
 * This panel is the one part of the dashboard where the 402 frame disagrees with 1440 on
 * nearly every number. `1297:1162` … `1297:1229` against `708:2348` … `708:2396`:
 *
 *   element                              402                 1440              was
 *   numbered section h2         `1297:1164` 16/500 lh22.4  `708:2350` 20/500  fl-20 → 17@402
 *   field label                 `1297:1167` 12/400 lh19.2  `708:2353` 14/400  fl-14 → 14@402
 *   field label, contact + docs  …`1198`/`1210`  12–14/300  `708:2384` /300   (weight matches)
 *   field value                 `1297:1169` 14/400 lh22.4  `708:2355` 16/400  fl-16 → 15@402
 *   document label              `1297:1210` 14/300 lh22.4  `708:2396` 16/300  fl-16 → 15@402
 *   label → value gap           `1297:1166` 0             `708:2352` 4        flat 4
 *   field column gap            `1297:1179` 12            `708:2351` 16       flat 16
 *   title → fields gap          `1297:1163` 12            `708:2349` 16       flat 16
 *   section → section gap       `1297:1162` 16            `708:2348` 24       flat 24
 *   doc label → link gap        `1297:1209` 12 (column)   `708:2395` 50 (row) flat 8
 *
 * Per the size rule the phone frame wins, overridden here at the call sites rather than in
 * index.css's shared ranks. Every ramp is `calc(MIN + DELTA * --fl)` solved so that
 * `--fl` = (402 − 375)/1065 = 0.0253521 lands the phone number and `--fl` = 1 lands Figma's
 * 1440 number, which is the value the code already had — so no ramp moves 1440.
 *
 * WEIGHTS are not ramped and did not need changing: Figma sets the same weight at both
 * anchors everywhere here — 500 section titles, 400 first-section labels, 300 (Light) contact
 * and document labels, 400 values, 400 file names, 300 file sizes.
 */
const TITLE_16_20 = 'text-[calc(15.896px_+_4.104*var(--fl))]'
const LABEL_12_14 = 'text-[calc(11.948px_+_2.052*var(--fl))]'
const VALUE_14_16 = 'text-[calc(13.948px_+_2.052*var(--fl))]'
const GAP_12_16 = 'gap-[calc(11.896px_+_4.104*var(--fl))]'
const GAP_16_24 = 'gap-[calc(15.792px_+_8.208*var(--fl))]'
/** 0 → 4. `max` keeps it a legal length at 375, where the raw ramp is −0.104px. */
const GAP_0_4 = 'gap-[max(0px,calc(-0.104px_+_4.104*var(--fl)))]'

/**
 * Figma's "Name" block: the label over the value, which is what makes the row exactly 52 tall
 * at 1440 (`708:2352`) and 41 on a phone (`1297:1166`). The label weight is Regular in the
 * first section and Light in the rest, so it is passed in rather than assumed.
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
    <div className={`flex min-w-0 flex-1 flex-col items-start ${GAP_0_4}`}>
      {/*
       * `break-words` is a safety net, not a layout choice. Thai has no word spaces, and the
       * longest label — โรคประจำตัวและวิธีปฐมพยาบาลเบื้องต้น — is ~250px at 12px inside the
       * 155px half-column that `1297:1191` puts it in. Figma lets it overflow (it records the
       * text at 189 wide in a 155 frame); browsers break Thai with ICU's dictionary and wrap it
       * instead. `overflow-wrap: break-word` only engages if that dictionary breaking is
       * unavailable, so nothing changes where it works and the label cannot bleed where it
       * does not — the row is `min-w-0`, so either way it never widens the page.
       */}
      <p
        className={`${LABEL_12_14} leading-[1.6] break-words text-gray-2 ${light ? 'font-light' : ''}`}
      >
        {label}
      </p>
      <div className={`${VALUE_14_16} leading-[1.6]`}>{children}</div>
    </div>
  )
}

/**
 * A group of `Field`s on one line.
 *
 * Two-up groups are a row on the phone too — `1297:1179` and `1297:1186` are horizontal, two
 * 155-wide columns and a 12 gap inside the 322 card. Three-up groups are the ones Figma
 * stacks: `1297:1165` is vertical, because three columns in 322 would leave ~99 each. So the
 * breakpoint is a property of how many fields are in the row, not of the panel.
 */
function FieldRow({ cols, children }: { cols: 2 | 3; children: React.ReactNode }) {
  return (
    <div
      className={`flex w-full items-start ${GAP_12_16} ${cols === 3 ? 'flex-col md:flex-row' : 'flex-row'}`}
    >
      {children}
    </div>
  )
}

function Separator() {
  return <div className="h-0 w-full border-t-[0.5px] border-[#dcdcdc]" />
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 className={`w-full ${TITLE_16_20} leading-[1.4] font-medium`}>{children}</h2>
}

/** `1297:1163` pairs the title with its fields at 12; `708:2349` at 16. */
function Section({ children }: { children: React.ReactNode }) {
  return <section className={`flex w-full flex-col items-start ${GAP_12_16}`}>{children}</section>
}

export default function PersonDetails({ person }: { person: Person }) {
  return (
    /* `1297:1162` separates the three sections by 16, `708:2348` by 24. */
    <div className={`flex w-full flex-col items-start ${GAP_16_24}`}>
      <Section>
        <SectionTitle>{person.heading}</SectionTitle>

        {/* three columns at 1440 (`708:2351`), stacked on the phone (`1297:1165`) */}
        <FieldRow cols={3}>
          <Field label="ชื่อ-สกุล">
            {/* `1297:1168` and `708:2354` both gap the prefix from the name by 12 — flat. */}
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
        </FieldRow>

        {/* two-up on both anchors: `1297:1179` is a row of two 155s in the 322 card */}
        <FieldRow cols={2}>
          <Field label="อาหารที่แพ้">-</Field>
          <Field label="ประเภทอาหาร">-</Field>
        </FieldRow>

        <FieldRow cols={2}>
          <Field label="ยาที่แพ้">-</Field>
          <Field label="โรคประจำตัวและวิธีปฐมพยาบาลเบื้องต้น">-</Field>
        </FieldRow>
      </Section>

      <Separator />

      <Section>
        <SectionTitle>2. ข้อมูลติดต่อ</SectionTitle>
        {/* `1297:1196` stacks these three; `708:2382` is a row. Labels are Light at both. */}
        <FieldRow cols={3}>
          <Field label="Email" light>
            {person.email}
          </Field>
          <Field label="เบอร์โทรศัพท์" light>
            {person.phone}
          </Field>
          <Field label="ID LINE" light>
            {person.lineId}
          </Field>
        </FieldRow>
      </Section>

      <Separator />

      <Section>
        <SectionTitle>3. เอกสาร</SectionTitle>
        {person.documents.map((doc) => (
          /*
           * Figma: a 450-wide description then a 50 gutter before the attachment — and `xl`,
           * not `lg`, is where that row can exist. This panel sits in the dashboard's left
           * column, which is whatever is left after the 400 status card and a 24 gutter: 784 of
           * usable width at 1440, but only 434 at 1024. A `lg:w-[450px] lg:shrink-0` label is
           * therefore 16px WIDER than the column that holds it the moment `lg` matches — it
           * overflowed the card on every /my-team at 1024, with the attachment link pushed off
           * the end, and only `html { overflow-x: clip }` kept the page from panning sideways.
           * At `xl` the column is 664 and 450 + 50 + the link fit with room to spare; below it
           * the label and the attachment stack, which is what they already did on a phone.
           *
           * The stacked gap is 12, not 8: `1297:1209` is a vertical `Name` frame at g12. The
           * two gaps are on different axes so they cannot be one ramp — the phone stacks and
           * 1440 is a row — hence a flat 12 with `xl:gap-[50px]` (`708:2395`) over it.
           */
          <div
            key={doc.label}
            className="flex w-full flex-col items-start gap-[12px] xl:flex-row xl:gap-[50px]"
          >
            {/* 14/300 lh22.4 @402 (`1297:1210`) → 16/300 lh25.6 @1440 (`708:2396`). Light at
                both anchors, so the weight is flat. */}
            <p
              className={`${VALUE_14_16} leading-[1.6] font-light text-gray-2 xl:w-[450px] xl:shrink-0`}
            >
              {doc.label}
            </p>
            <a
              href="#"
              className="mm-press flex min-w-0 flex-1 items-center gap-[8px] transition-opacity hover:opacity-70"
            >
              {/* 20 @402 (`1297:1212` / `1297:1219` / `1297:1226`) → 24 @1440 (`708:2398`).
                  `size-[24px]` was the 1440 box held flat, next to a 14px file name. The 8 gap
                  is Figma's on both frames (`1297:1212` ends at 20 with the name at 28;
                  `708:2398` ends at 24 with it at 32), so `gap-[8px]` stays flat. */}
              <img
                src={ATTACHMENT}
                alt=""
                aria-hidden
                className="mm-icon-pop size-[calc(19.896px_+_4.104*var(--fl))] shrink-0"
              />
              {/* 14/400 and 14/300 @402 (`1297:1214`, `1297:1215`) → 16 at 1440 (`708:2399`,
                  `708:2400`). `fl-16` bottomed out at 15 on a phone against Figma's 14. */}
              <span className={`${VALUE_14_16} leading-[1.6]`}>{doc.file}</span>
              <span className={`${VALUE_14_16} leading-[1.6] font-light text-gray-2`}>
                {doc.size}
              </span>
            </a>
          </div>
        ))}
      </Section>
    </div>
  )
}
