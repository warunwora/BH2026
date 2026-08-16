import { useState } from 'react'
import WizardShell, { BackButton, NextButton } from '../../components/form/WizardShell'
import {
  CHECK_MARK,
  CheckMark,
  GLYPH_20_24,
  Label,
  SectionTitle,
  SelectField,
  TextField,
  useFileSlot,
} from '../../components/form/Field'
import { useGateField } from '../../components/form/wizardNav'
import {
  useDraftRecord,
  useDraftValue,
  useDraftFileNote,
  useReachedStep,
} from '../../hooks/useRegisterDraft'

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

/**
 * 48 on the 402 frame (`1214:240`), 60 at 1440 (`708:1332`) — `size-15` was the 1440 figure
 * held flat, so two 60 avatars plus their −20 overlap needed 100 of a 149-wide option box that
 * Figma draws holding 76.
 *
 * The −20 overlap itself is FLAT and correct at both ends, which is the check the brief asks
 * for: Figma pitches the phone avatars 28 apart (x28.5 → x56.5 at 48 wide) and the 1440 ones
 * 40 apart (x116 → x156 at 60 wide), and 48 − 28 = 60 − 40 = 20. So the overlap is the one
 * length here that must not ramp.
 */
const AVATAR = 'size-[calc(47.688px_+_12.312*var(--fl))]'

function Avatar({ crop, src }: { crop: boolean; src: string }) {
  return (
    <span className={`relative block shrink-0 overflow-hidden ${AVATAR}`}>
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

/**
 * The step's one section, as a COMPONENT so its gate is inside the registry.
 *
 * `useGateField` reads a context that `WizardShell` provides around the card — a hook called in
 * `TeamStep`, which renders `WizardShell`, sits above that provider and would register with
 * nothing, leaving จำนวนนักเรียนในทีม silently ungated. Everything this section owns moves down
 * with it; `TeamStep` is now only the shell and its two pills.
 */
function TeamDetails() {
  /* the caption says จำกัดขนาดไม่เกิน 5 MB, so 5 MB is what the box enforces */
  const photo = useFileSlot({ kind: 'image', maxMB: 5 })
  /*
   * A saved draft remembers the photo's NAME, never its bytes — a file input cannot be
   * rehydrated by any browser, so the slot comes back genuinely empty and still fails its own
   * gate. The note exists only so the caption can say which file is missing instead of
   * silently pretending nothing was ever attached.
   */
  const photoNote = useDraftFileNote('team.photo', photo.file)
  const { bind, clear } = useDraftRecord('team.details', EMPTY)

  /*
   * Team size is tracked here only so the choice can be *confirmed*: the box used to swap its
   * border and background with no transition and no acknowledgement, in the one step of the
   * flow where a tick already draws itself. `touched` keeps the tick static if a value is ever
   * pre-selected and draws it only for a choice the user made — the same rule the consent rows
   * follow (see `.auth-check-path` in styles/auth-motion.css).
   */
  const [size, setSize] = useDraftValue<number | null>('team.size', null)
  const [touched, setTouched] = useState(false)

  /*
   * The three `*` on this step, in page order: `2053:282` (ชื่อทีม), `2053:288` (สถานศึกษา)
   * and `2053:296` (จำนวนนักเรียนในทีม). The team PHOTO deliberately is not one of them —
   * `2053:276` carries no Required Indicator and its caption is a size rule, not a demand —
   * so a team can advance without a picture, exactly as the frame allows.
   *
   * The first two are `TextField` / `SelectField` and gate themselves off their own `required`
   * prop. This is the third — a radio group, which owns no control the field primitives know
   * about, so it registers by hand. The focus target is the FIELDSET, because neither radio is
   * focusable until one is checked and the pair is a single choice: sending the reader to the
   * group names the question rather than one of its answers.
   */
  const sizeGate = useGateField<HTMLFieldSetElement>(
    size === null ? 'เลือกจำนวนนักเรียนในทีม' : null,
  )

  return (
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

      {/*
       * `items-center` on the phone and `md:items-start` in the row, and the change is not
       * cosmetic. `align-items: flex-start` in a COLUMN flex container sizes each child to its
       * own content, so the field column below — which had no `w-full` — was resolving to
       * roughly 200px on a 375 phone: `width: 100%` on the controls inside it was measured
       * against a box that was itself sized by those controls' intrinsic widths, and the team
       * name input came out as wide as its placeholder instead of as wide as the card. The
       * `w-full` on that column is the real fix; centring the photo is what `1297:1480` draws.
       */}
      {/* 24 @402 → 32 @1440, where `gap-8` was the 1440 figure held flat: `1214:211` stacks the
            photo over the field column on a 24 gap, `708:1303` sets them side by side on 32. */}
      <div className="flex w-full flex-col items-center gap-[calc(23.792px_+_8.208*var(--fl))] md:flex-row md:items-start">
        {/*
         * Box, radius and glyph, all three from both frames. `1214:213` is a 140 square on a
         * 16 radius holding a 20 picture mark (`1214:214`); `708:1305` is 200 on 20 holding
         * 24 (`708:1306`). `size-50` / `rounded-[20px]` / `size-6` were the 1440 figures held
         * flat — a 200 square is over half the width of a 354 card, which is the single
         * largest thing on this step at 402. Each ramp lands on its 1440 value exactly.
         */}
        {/* 8 @402 (`1214:212`) → 12 @1440 (`708:1304`) between the drop box and its caption —
              `gap-3` was the 1440 value held flat. */}
        <div className="flex flex-col items-center justify-center gap-[calc(7.896px_+_4.104*var(--fl))]">
          <label
            {...photo.drop}
            className="auth-drop mm-press relative flex size-[calc(138.439px_+_61.561*var(--fl))] cursor-pointer flex-col items-center justify-center gap-2.5 overflow-hidden rounded-[calc(15.896px_+_4.104*var(--fl))] border border-dashed border-[#dcdcdc] hover:border-brand-red"
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
              className={GLYPH_20_24}
            />
            {/* 14 @402 (`1214:216`) → 18 @1440 (`708:1308`), Regular at both. This was `fl-18`,
                  whose 16 floor carried the phone 2px over Figma — the rank's floor no longer
                  wins over a measured phone value. `leading-[normal]` is right: 21.15 / 14 and
                  27.2 / 18 are both Noto Sans Thai's own 1.511. */}
            {/* `t-14-18`, not `t-14-20`. The old ramp's own note said "14 @402 → 18 @1440" and
                its arithmetic said otherwise — `13.844 + 6.156` is 20, so this label rendered
                2px over `2053:276` (18/400/27.2) at every desktop width. The comment was right
                and the numbers were the 14 → 20 pair copied from the field labels. */}
            <span className="text-[length:var(--t-14-18)] leading-[normal]">รูปโปรไฟล์ทีม</span>
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
          {/* the cap tracks the box above it — same ramp, so the caption can never be wider
                than the photo target it belongs to — and the TYPE is now 12 @402 (`1214:217`)
                → 16 @1440 (`708:1309`), Regular at both, written out because `fl-16`'s 15 floor
                was 3px over Figma's 12 on the phone. #808080 = `text-gray-1`, both anchors. */}
          <p
            aria-live="polite"
            className={`w-[calc(138.439px_+_61.561*var(--fl))] truncate text-center text-[length:var(--t-12-16)] leading-[normal] ${photo.error ? 'text-[#ea4335]' : 'text-gray-1'}`}
          >
            {photo.error ??
              photo.file?.name ??
              (photoNote ? `เคยแนบ ${photoNote} — กรุณาแนบอีกครั้ง` : 'จำกัดขนาดไม่เกิน 5 MB')}
          </p>
        </div>

        {/* 20 @402 (`1214:218`) → 32 @1440 (`708:1310`) between the three field groups —
              `gap-8` was the 1440 value held flat, which on a phone pushed this column 24px
              taller than the frame across the two gaps. */}
        <div className="flex w-full min-w-0 flex-1 flex-col items-start gap-[calc(19.688px_+_12.312*var(--fl))]">
          {/* `2053:284` — Figma's own placeholder. "มะลิ" was the stand-in PersonFields.tsx
              already swapped out of its own controls; this was the last one still carrying it. */}
          <TextField
            label="ชื่อทีม"
            required
            placeholder="ตี๋มากอดเค้าเลย"
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

          <fieldset
            ref={sizeGate.ref}
            tabIndex={-1}
            aria-invalid={sizeGate.invalid || undefined}
            aria-describedby={sizeGate.message ? sizeGate.messageId : undefined}
            className="flex w-full flex-col items-start gap-2 focus:outline-none"
          >
            <legend>
              <Label required>จำนวนนักเรียนในทีม</Label>
            </legend>
            {/*
             * A ROW at every width, which is both what Figma draws and what makes the two
             * options the same size. `1214:237` is a 314-wide row on the 402 frame holding
             * two 133x48 option boxes, i.e. side by side exactly as at 1440.
             *
             * It used to be `flex-col items-start sm:flex-row`, and the two failures were the
             * same failure: on a column axis `flex-1` distributes HEIGHT, so it equalised
             * nothing horizontally, and `items-start` then sized each box to its own content
             * — the 2-avatar box measured 116 and the 3-avatar box 138, so the pair rendered
             * visibly ragged and left-hugging. As a row, `flex-1` is the width and both boxes
             * are `(column - gap) / 2` at every width. 1440 is unchanged: it was already a row
             * from `sm` up.
             */}
            <div className="flex w-full items-stretch gap-4">
              {TEAM_SIZES.map((option) => (
                <label
                  key={option.count}
                  /* `min-w-0` so a flex item's automatic minimum size — its content's, i.e.
                       the un-shrinkable avatar row — cannot push the box past its half of the
                       column on a 375 phone. */
                  /* the same padding-and-radius ramp the field controls take: `1214:238` is
                       8 on 8 at 402, `708:1330` 12 on 12 at 1440. Both exact at `--fl` = 1. */
                  className={`mm-press flex min-w-0 flex-1 cursor-pointer flex-col items-center justify-center gap-2.5 overflow-hidden rounded-[calc(7.896px_+_4.104*var(--fl))] border-[0.8px] p-[calc(7.896px_+_4.104*var(--fl))] transition-colors hover:border-brand-red has-checked:border-brand-red has-checked:bg-brand-red/5 ${
                    sizeGate.invalid ? 'border-[#ea4335]' : 'border-[#dcdcdc]'
                  }`}
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
                  {/* 12 @402 (`1214:242` / `1214:248`) → 18 @1440 (`708:1334` / `708:1340`),
                        Regular at both, written out for the same reason as the photo label: the
                        `fl-18` rank's 16 floor was 4px over Figma's 12 down here, which is the
                        single largest type overshoot on this step. #808080 = `text-gray-1`. */}
                  <span className="flex items-center gap-2 text-[length:var(--t-12-18)] leading-[normal] text-gray-1">
                    {/*
                     * The tick is the confirmation the box's colour swap never gave. Its slot
                     * is always in the layout, hidden rather than unmounted, so choosing a
                     * size cannot shift the caption sideways under the reader's eye.
                     *
                     * `CHECK_MARK` is the shared 12 → 16 ramp rather than a flat `size-4`,
                     * which is Field.tsx's own tick pair (`1297:1523` → `722:371`).
                     */}
                    <CheckMark
                      className={`${CHECK_MARK} text-brand-red ${size === option.count ? '' : 'invisible'}`}
                      drawn={touched && size === option.count}
                    />
                    {option.count} คน
                  </span>
                </label>
              ))}
            </div>
            {sizeGate.message && (
              <p
                id={sizeGate.messageId}
                className="text-[length:var(--t-12-16)] leading-[normal] text-[#ea4335]"
              >
                {sizeGate.message}
              </p>
            )}
          </fieldset>
        </div>
      </div>
    </section>
  )
}

/**
 * Figma 708:1255 / `2053:217` — the shortest step. Team is now step 2: เงื่อนไข moved ahead of
 * it, so this step gained a back button.
 */
export default function TeamStep() {
  /* the resume modal returns the user to the furthest step they reached */
  useReachedStep(2)

  return (
    <WizardShell
      step={2}
      actions={
        <>
          <BackButton to="/register/terms" />
          <NextButton to="/register/advisor" />
        </>
      }
    >
      <TeamDetails />
    </WizardShell>
  )
}
