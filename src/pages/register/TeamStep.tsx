import { useState } from 'react'
import WizardShell, { NextButton } from '../../components/form/WizardShell'
import {
  CheckMark,
  Label,
  SectionTitle,
  SelectField,
  TextField,
  useFieldGroup,
  useFileSlot,
} from '../../components/form/Field'

const F = '/assets/figma/'

/**
 * Figma crops the "นร6" mascot inside its square rather than fitting it, so the two
 * avatars need different treatments even at the same 60 size.
 */
const NR6 = { src: `${F}522303cab6b008daf26c3f0e8e3f2ec214a0c0cf.png`, crop: true }
const NR5 = { src: `${F}b616da517775c0a0c018c7a71c10c07a82eeec55.png`, crop: false }

const TEAM_SIZES = [
  { count: 2, avatars: [NR6, NR5] },
  { count: 3, avatars: [NR5, NR6, NR5] },
]

function Avatar({ crop, src }: { crop: boolean; src: string }) {
  return (
    <span className="relative block size-15 shrink-0 overflow-hidden">
      <img
        src={src}
        alt=""
        aria-hidden
        className="absolute max-w-none object-cover"
        style={
          crop
            ? { height: '100%', width: '114.29%', left: '-11.51%', top: 0 }
            : { inset: 0, height: '100%', width: '100%' }
        }
      />
    </span>
  )
}

/* the two text controls of this section, so "ล้าง" has something to put back */
const EMPTY = { name: '', school: '' }

/** Figma 708:1255 — the shortest step, which is why the shell's card floor is 832. */
export default function TeamStep() {
  /* the caption says จำกัดขนาดไม่เกิน 5 MB, so 5 MB is what the box enforces */
  const photo = useFileSlot({ kind: 'image', maxMB: 5 })
  const { bind, clear } = useFieldGroup(EMPTY)

  /*
   * Team size is tracked here only so the choice can be *confirmed*: the box used to swap its
   * border and background with no transition and no acknowledgement, in the one step of the
   * flow where a tick already draws itself. `touched` keeps the tick static if a value is ever
   * pre-selected and draws it only for a choice the user made — the same rule the consent rows
   * follow (see `.auth-check-path` in styles/auth-motion.css).
   */
  const [size, setSize] = useState<number | null>(null)
  const [touched, setTouched] = useState(false)

  return (
    <WizardShell step={1} actions={<NextButton to="/register/advisor" />}>
      <section className="flex w-full flex-col items-center justify-center gap-4">
        {/*
         * Clearing is scoped to this section, which is the whole section: the two text
         * controls, the size choice *and* its `touched` flag — so the tick is static again if
         * the same size is re-picked, exactly as on arrival — and the photo, whose object URL
         * `slot.clear()` revokes.
         */}
        <SectionTitle
          title="ข้อมูลทีม"
          onClear={() => {
            clear()
            setSize(null)
            setTouched(false)
            photo.clear()
          }}
        />

        <div className="flex w-full flex-col items-start gap-8 md:flex-row">
          <div className="flex flex-col items-center justify-center gap-3">
            <label
              {...photo.drop}
              className="auth-drop mm-press relative flex size-50 cursor-pointer flex-col items-center justify-center gap-2.5 overflow-hidden rounded-[20px] border border-dashed border-[#dcdcdc] hover:border-brand-red"
            >
              {/*
               * A chosen profile photo fills its own frame — a name alone would make the one
               * box on the page that *is* a picture the only one that never shows it. The
               * thumbnail is absolute so it cannot stretch the 200 square, and the placeholder
               * stays mounted underneath it rather than being swapped out, so nothing about
               * the box's size or the dashed border depends on whether a file is held.
               */}
              <img
                src={`${F}18691121244d1cc30f2fff4bf73c50850cbef49f.svg`}
                alt=""
                aria-hidden
                className="size-6"
              />
              <span className="text-lg leading-[normal]">รูปโปรไฟล์ทีม</span>
              {photo.preview && (
                <img
                  src={photo.preview}
                  alt=""
                  aria-hidden
                  className="absolute inset-0 size-full object-cover"
                />
              )}
              <input {...photo.inputProps} className="hidden" />
            </label>
            {/*
             * One line under the box, three states: the size rule, then the name of the file
             * held, then the reason one was refused. It is width-capped at the box and
             * truncates, because a 60-character file name here would widen the column and
             * make the page pannable sideways on a phone.
             */}
            <p
              aria-live="polite"
              className={`w-50 truncate text-center text-base leading-[normal] ${photo.error ? 'text-[#ea4335]' : 'text-gray-1'}`}
            >
              {photo.error ?? photo.file?.name ?? 'จำกัดขนาดไม่เกิน 5 MB'}
            </p>
          </div>

          <div className="flex flex-1 flex-col items-start gap-8">
            <TextField
              label="ชื่อทีม"
              required
              placeholder="มะลิ"
              className="w-full"
              {...bind('name')}
            />
            <SelectField
              label="สถานศึกษา"
              required
              placeholder="เลือกสถานศึกษา"
              className="w-full"
              {...bind('school')}
            />

            <fieldset className="flex w-full flex-col items-start gap-2">
              <legend>
                <Label required>จำนวนนักเรียนในทีม</Label>
              </legend>
              <div className="flex w-full flex-col items-start gap-4 sm:flex-row">
                {TEAM_SIZES.map((option) => (
                  <label
                    key={option.count}
                    className="mm-press flex flex-1 cursor-pointer flex-col items-center justify-center gap-2.5 overflow-hidden rounded-[12px] border-[0.8px] border-[#dcdcdc] p-3 transition-colors hover:border-brand-red has-checked:border-brand-red has-checked:bg-brand-red/5"
                  >
                    <input
                      type="radio"
                      name="teamSize"
                      value={option.count}
                      checked={size === option.count}
                      onChange={() => {
                        setSize(option.count)
                        setTouched(true)
                      }}
                      className="sr-only"
                    />
                    <span className="flex w-full items-center justify-center">
                      {option.avatars.map((avatar, i) => (
                        <span
                          key={i}
                          style={{ marginRight: i < option.avatars.length - 1 ? -20 : 0 }}
                        >
                          <Avatar {...avatar} />
                        </span>
                      ))}
                    </span>
                    <span className="flex items-center gap-2 text-lg leading-[normal] text-gray-1">
                      {/*
                       * The tick is the confirmation the box's colour swap never gave. Its slot
                       * is always in the layout, hidden rather than unmounted, so choosing a
                       * size cannot shift the caption sideways under the reader's eye.
                       */}
                      <CheckMark
                        className={`size-4 text-brand-red ${size === option.count ? '' : 'invisible'}`}
                        drawn={touched && size === option.count}
                      />
                      {option.count} คน
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>
          </div>
        </div>
      </section>
    </WizardShell>
  )
}
