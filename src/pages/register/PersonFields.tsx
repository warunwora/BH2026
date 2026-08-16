import {
  DateField,
  SelectField,
  SectionTitle,
  TextArea,
  TextField,
} from '../../components/form/Field'
import { PREFIX_OPTIONS } from '../../registrationData'
import { useDraftRecord } from '../../hooks/useRegisterDraft'

/**
 * Figma's field rows: a 24 gap, with the prefix select fixed at 140 wide.
 *
 * THREE shapes, not two. The row is Figma's own three- or four-across from `lg` up, and one
 * field per line on a phone, which is what `1297:1480` draws — but between those two there
 * used to be nothing, so an iPad spent the whole 768 … 1023 band rendering the phone layout:
 * twenty-odd full-width controls stacked down a 992-wide card, each one three times wider
 * than its content needs, with the page four screens long. A 2-up grid at `md` is the same
 * row Figma draws, folded once, and it costs no new decision — the cells are already
 * `w-full`, so each one simply fills its track.
 *
 * PREFIX was `lg:w-[100px]` and Figma draws 140: `2053:395` / `2053:416` (advisor) and
 * `2053:583` / `2053:604` (entrant) are each 140 wide. That number is what makes the rest of
 * the row exact — the content column is 992, so 140 + 24 + 402 + 24 + 402 = 992 to the pixel,
 * and the two `flex-1` cells beside it land on Figma's 402 with nothing to state.
 *
 * The equal-cell rows fall out of the same arithmetic: three `flex-1` cells in 992 on a 24
 * gap are 314.67 each (`2053:437` / `2053:443` / `2053:449`, and the three contact fields),
 * four are 230 each (`2053:625` … `2053:645`, the entrant's date + health row). Both are
 * Figma's own widths, reached without a single hard-coded number.
 */
const ROW = 'grid w-full grid-cols-1 gap-6 md:grid-cols-2 lg:flex lg:flex-row lg:items-start'
const PREFIX = 'w-full lg:w-[140px] lg:shrink-0'
const CELL = 'w-full lg:flex-1 lg:min-w-0'

/*
 * One record per section, listed in the order the fields appear, so a reader can check the
 * two against each other. The keys exist for `useFieldGroup`'s benefit only — nothing is
 * submitted anywhere — so they are named after the labels rather than after any API.
 *
 * The birth date is in here whether or not it is rendered: an advisor block never shows it,
 * and clearing a key that no control is bound to is harmless, whereas making the record
 * conditional would make `empty` a new object on every render.
 */
/**
 * NO MIDDLE NAME, in either script. `2053:394` (advisor Thai), `2053:415` (advisor English),
 * `2053:582` (entrant Thai) and `2053:603` (entrant English) each hold exactly THREE cells —
 * 140 + 402 + 402 — and none of the four has a "ชื่อกลาง" / "Middle Name" between them. The
 * two extra controls were also what broke the row's widths: four `flex-1` cells beside a
 * prefix divide the 992 column into 262.67 each, where Figma draws 402.
 *
 * Flagged rather than assumed: this DROPS two inputs a registrant could previously fill in.
 * Every 2053 step frame agrees, so it is the design, but if the middle name has to come back
 * it is two `TextField`s and two keys here — and the row widths then stop matching the frame.
 */
const EMPTY_PERSON = {
  prefixTh: '',
  firstTh: '',
  lastTh: '',
  prefixEn: '',
  firstEn: '',
  lastEn: '',
  birthDate: '',
  foodAllergy: '',
  specialDiet: '',
  drugAllergy: '',
  conditions: '',
}

const EMPTY_CONTACT = { email: '', phone: '', line: '' }

/**
 * ------------------------------------------------------- what the asterisks now mean
 *
 * Every label in the person and contact blocks carries a `Required Indicator` on the desktop
 * frames — `2053:398`, `2053:406`, `2053:412`, `2053:419`, `2053:427`, `2053:433`, `2053:440`,
 * `2053:446`, `2053:452`, `2053:458`, `2053:474`, `2053:480`, `2053:486` on the advisor step,
 * and the matching run `2053:586` … `2053:670` on the entrant one. All of them. The code drew
 * `*` on six of those and nothing anywhere enforced any of them.
 *
 * There is no list of required keys in this file any more, and that is the point: `required`
 * IS the check. Each control in components/form/Field.tsx registers itself with the step gate
 * when it carries the prop, so the mark and the rule are one declaration and cannot drift into
 * disagreeing — which is exactly how an asterisk ends up decorative.
 *
 * WHICH FIELDS ARE REQUIRED — settled 2026-08-16, and the first reading of it was WRONG.
 *
 * An earlier pass reported that Figma marks nearly every label required, including the four
 * health fields and LINE ID, and the code was changed to match. It does not. Every label in
 * these steps carries a `Required Indicator` child, but five of them are **`visible: false`** —
 * the component ships the asterisk and the designer switches it off per instance. Counting the
 * node's existence rather than reading its `visible` flag is what produced the false reading.
 *
 * Read from `2053:498` (entrant), and `2053:318` (advisor) agrees:
 *
 *   required        คำนำหน้า, ชื่อจริง/นามสกุล (ไทย), Title, First/Last Name,
 *                   วัน/เดือน/ปีเกิด, อีเมล, เบอร์โทรศัพท์
 *   NOT required    อาหารที่แพ้ (2053:636), ประเภทอาหารพิเศษ (642), ยาที่แพ้ (648),
 *                   โรคประจำตัว (654), LINE ID (682)
 *
 * This was not cosmetic. `required` drives BOTH the asterisk and the gate, so the validation
 * pass was refusing to advance anyone who had no food allergy, no special diet, no drug allergy
 * and no medical condition to declare — i.e. most entrants — and sending them back to a field
 * they had nothing to write in. Leaving these optional is also the only defensible reading:
 * health information is volunteered, and demanding it is a different decision from collecting it.
 */

/**
 * The person block shared by the advisor and entrant steps. The entrant version adds a
 * date of birth; otherwise the field set is identical. Figma gives the advisor block a
 * 20 gap under its heading and the entrant block 24, hence `headingGap`.
 *
 * Each instance owns its own values, which is what makes "ล้าง" mean *this* person: the
 * entrant step renders a documents section, a person block and a contact block, and the
 * three clear buttons must not reach into each other.
 */
/**
 * The two steps DISAGREE on the four name placeholders, and the block used to render the
 * advisor's on both. Figma:
 *
 *   advisor  `2053:408` นพนภา   `2053:414` ณ บางมด   `2053:429` Nopnapa  `2053:435` Na bangmod
 *   entrant  `2053:596` มดแฮก   `2053:602` ณ บางมด   `2053:617` Modhack  `2053:623` Na bangmod
 *
 * i.e. the surnames match and the given names do not — the entrant is "มดแฮก" / "Modhack" on
 * both `2053:498` and `2053:694`. Everything else in the block (the prefix "เลือก"/"Choose", the
 * three health placeholders, the ปฐมพยาบาล textarea) is identical on the two frames and stays
 * shared, so only the pair that actually differs is passed in.
 */
export const ADVISOR_NAMES = { firstTh: 'นพนภา', firstEn: 'Nopnapa' }
export const ENTRANT_NAMES = { firstTh: 'มดแฮก', firstEn: 'Modhack' }

export default function PersonFields({
  title,
  withBirthDate = false,
  headingGap = 'gap-6',
  names = ADVISOR_NAMES,
  draftKey,
}: {
  title: string
  withBirthDate?: boolean
  headingGap?: string
  names?: { firstTh: string; firstEn: string }
  /**
   * Where this block's answers are saved. Passed IN rather than derived, because one component
   * serves the advisor and both entrants — anything derived from `title` or from a render
   * counter would give entrant 1 and entrant 2 the same key and let each overwrite the other.
   */
  draftKey: string
}) {
  /* the gate needs no wiring here: an unrendered control registers nothing, so an advisor
     block — which never mounts the date of birth — is never gated on one */
  /* `useDraftRecord` is `useFieldGroup` plus persistence and a whole-record setter; the
     absence of that setter is what made restoring a saved step impossible before. */
  const { bind, clear } = useDraftRecord(draftKey, EMPTY_PERSON)

  return (
    <section className={`flex w-full flex-col items-center justify-center ${headingGap}`}>
      <SectionTitle title={title} onClear={clear} />

      <div className="flex w-full flex-col items-start gap-8">
        {/* Placeholders are Figma's own, not the repeated "มะลิ" that stood in for them:
            `2053:400` / `2053:408` / `2053:414` on the advisor step and `2053:588` /
            `2053:596` / `2053:602` on the entrant one. */}
        <div className={ROW}>
          <SelectField
            label="คำนำหน้า"
            required
            placeholder="เลือก"
            options={PREFIX_OPTIONS}
            className={PREFIX}
            {...bind('prefixTh')}
          />
          <TextField
            label="ชื่อจริง (ภาษาไทย)"
            required
            placeholder={names.firstTh}
            className={CELL}
            {...bind('firstTh')}
          />
          <TextField
            label="นามสกุล (ภาษาไทย)"
            required
            placeholder="ณ บางมด"
            className={CELL}
            {...bind('lastTh')}
          />
        </div>

        <div className={ROW}>
          <SelectField
            label="Title"
            required
            placeholder="Choose"
            options={['Mr.', 'Mrs.', 'Miss']}
            className={PREFIX}
            {...bind('prefixEn')}
          />
          <TextField
            label="First Name"
            required
            placeholder={names.firstEn}
            className={CELL}
            {...bind('firstEn')}
          />
          <TextField
            label="Last Name"
            required
            placeholder="Na bangmod"
            className={CELL}
            {...bind('lastEn')}
          />
        </div>

        <div className={ROW}>
          {withBirthDate && (
            <DateField
              label="วัน/เดือน/ปีเกิด"
              required
              placeholder="เลือกวันที่"
              className={CELL}
              {...bind('birthDate')}
            />
          )}
          <TextField
            label="อาหารที่แพ้"
            placeholder="เช่น กุ้ง, ถั่วลิสง"
            className={CELL}
            {...bind('foodAllergy')}
          />
          <TextField
            label="ประเภทอาหารพิเศษ"
            placeholder="เช่น อาหารมุสลิม, มังสวิรัติ"
            className={CELL}
            {...bind('specialDiet')}
          />
          <TextField
            label="ยาที่แพ้"
            placeholder="เช่น เพนิซิลลิน"
            className={CELL}
            {...bind('drugAllergy')}
          />
        </div>

        <TextArea
          label="โรคประจำตัว และวิธีปฐมพยาบาลเบื้องต้น"
          placeholder="ระบุโรคประจำตัวและวิธีปฐมพยาบาลเบื้องต้น"
          {...bind('conditions')}
        />
      </div>
    </section>
  )
}

export function ContactFields({ draftKey }: { draftKey: string }) {
  const { bind, clear } = useDraftRecord(draftKey, EMPTY_CONTACT)

  return (
    <section className="flex w-full flex-col items-center justify-center gap-6">
      <SectionTitle title="ช่องทางติดต่อ" onClear={clear} />
      {/* `2053:476` / `2053:482` / `2053:488` — the email placeholder is Figma's own address,
          not "example@email.com". LINE ID's own `*` (`2053:486`) is `visible: false`, so it is
          optional; see the note above on why the indicator's existence is not the signal. */}
      <div className={ROW}>
        <TextField
          label="อีเมล"
          required
          placeholder="modhack@school.ac.th"
          className={CELL}
          {...bind('email')}
        />
        <TextField
          label="เบอร์โทรศัพท์"
          required
          placeholder="080-000-0000"
          className={CELL}
          {...bind('phone')}
        />
        <TextField label="LINE ID" placeholder="ไอดีไลน์" className={CELL} {...bind('line')} />
      </div>
    </section>
  )
}
