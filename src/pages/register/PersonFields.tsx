import {
  DateField,
  SelectField,
  SectionTitle,
  TextArea,
  TextField,
  useFieldGroup,
} from '../../components/form/Field'
import { PREFIX_OPTIONS } from '../../registrationData'

/** Figma's field rows: a 24 gap, with the prefix select fixed at 100 wide. */
const ROW = 'flex w-full flex-col items-start gap-6 lg:flex-row'
const PREFIX = 'w-full lg:w-[100px] lg:shrink-0'
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
const EMPTY_PERSON = {
  prefixTh: '',
  firstTh: '',
  middleTh: '',
  lastTh: '',
  prefixEn: '',
  firstEn: '',
  middleEn: '',
  lastEn: '',
  birthDate: '',
  foodAllergy: '',
  specialDiet: '',
  drugAllergy: '',
  conditions: '',
}

const EMPTY_CONTACT = { email: '', phone: '', line: '' }

/**
 * The person block shared by the advisor and entrant steps. The entrant version adds a
 * date of birth; otherwise the field set is identical. Figma gives the advisor block a
 * 20 gap under its heading and the entrant block 24, hence `headingGap`.
 *
 * Each instance owns its own values, which is what makes "ล้าง" mean *this* person: the
 * entrant step renders a documents section, a person block and a contact block, and the
 * three clear buttons must not reach into each other.
 */
export default function PersonFields({
  title,
  withBirthDate = false,
  headingGap = 'gap-6',
}: {
  title: string
  withBirthDate?: boolean
  headingGap?: string
}) {
  const { bind, clear } = useFieldGroup(EMPTY_PERSON)

  return (
    <section className={`flex w-full flex-col items-center justify-center ${headingGap}`}>
      <SectionTitle title={title} onClear={clear} />

      <div className="flex w-full flex-col items-start gap-8">
        <div className={ROW}>
          <SelectField
            label="คำนำหน้า"
            required
            placeholder="มะลิ"
            options={PREFIX_OPTIONS}
            className={PREFIX}
            {...bind('prefixTh')}
          />
          <TextField
            label="ชื่อจริง (ภาษาไทย)"
            required
            placeholder="มะลิ"
            className={CELL}
            {...bind('firstTh')}
          />
          <TextField
            label="ชื่อกลาง (ภาษาไทย)"
            placeholder="มะลิ"
            className={CELL}
            {...bind('middleTh')}
          />
          <TextField
            label="นามสกุล (ภาษาไทย)"
            required
            placeholder="มะลิ"
            className={CELL}
            {...bind('lastTh')}
          />
        </div>

        <div className={ROW}>
          <SelectField
            label="คำนำหน้า"
            required
            placeholder="มะลิ"
            options={['Mr.', 'Mrs.', 'Miss']}
            className={PREFIX}
            {...bind('prefixEn')}
          />
          <TextField
            label="First Name"
            required
            placeholder="มะลิ"
            className={CELL}
            {...bind('firstEn')}
          />
          <TextField
            label="Middle Name"
            placeholder="มะลิ"
            className={CELL}
            {...bind('middleEn')}
          />
          <TextField
            label="Last Name"
            required
            placeholder="มะลิ"
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
            placeholder="มะลิ"
            className={CELL}
            {...bind('foodAllergy')}
          />
          <TextField
            label="ประเภทอาหารพิเศษ"
            placeholder="มะลิ"
            className={CELL}
            {...bind('specialDiet')}
          />
          <TextField
            label="ยาที่แพ้"
            placeholder="มะลิ"
            className={CELL}
            {...bind('drugAllergy')}
          />
        </div>

        <TextArea
          label="โรคประจำตัว และวิธีปฐมพยาบาลเบื้องต้น"
          placeholder="รายละเอียด"
          {...bind('conditions')}
        />
      </div>
    </section>
  )
}

export function ContactFields() {
  const { bind, clear } = useFieldGroup(EMPTY_CONTACT)

  return (
    <section className="flex w-full flex-col items-center justify-center gap-6">
      <SectionTitle title="ช่องทางติดต่อ" onClear={clear} />
      <div className={ROW}>
        <TextField
          label="อีเมล"
          required
          placeholder="example@email.com"
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
        <TextField label="LINE ID" placeholder="มะลิ" className={CELL} {...bind('line')} />
      </div>
    </section>
  )
}
