import { useParams } from 'react-router-dom'
import WizardShell, {
  BackButton,
  NextButton,
  SubmitButton,
} from '../../components/form/WizardShell'
import { DocumentRow, Separator } from '../../components/form/Field'
import PersonFields, { ContactFields, ENTRANT_NAMES } from './PersonFields'
import { STUDENT_DOCUMENTS } from '../../registrationData'

/**
 * Figma 708:1540 / `2053:498` — entrant 1 is step 4, `2053:694` — entrant 2 step 5, same form.
 *
 * `2053:694`'s own action bar still reads ถัดไป/ย้อนกลับ like every other step — the frame was
 * cloned from an earlier step and never relabelled for the flow's new last position. The submit
 * pill (busy state, `ลงทะเบียนเข้าแข่งขัน` label) stays on whichever entrant is actually last,
 * since the control has to keep doing what a last step's control does regardless of what its
 * Figma clone says.
 */
export default function EntrantStep() {
  const { index } = useParams()
  const n = index === '2' ? 2 : 1

  return (
    <WizardShell
      step={n === 1 ? 4 : 5}
      actions={
        <>
          <BackButton to={n === 1 ? '/register/advisor' : '/register/entrant/1'} />
          {n === 1 ? (
            <NextButton to="/register/entrant/2" />
          ) : (
            <SubmitButton to="/register/success" label="ลงทะเบียนเข้าแข่งขัน" />
          )}
        </>
      }
    >
      {/* 24 @402 (`1243:1369`) → 40 @1440 (`708:1581`) between the three sections — `gap-10` was
          the 1440 value held flat. Same correction as AdvisorStep. */}
      <div className="flex w-full flex-col items-start gap-[calc(23.584px_+_16.416*var(--fl))]">
        {/* 16 @402 (`1243:1370`) → 24 @1440 (`708:1582`) under the heading. Note this DIFFERS from
            AdvisorStep, where the same gap is a flat 16 at both anchors (`1239:1259` / `708:1392`)
            — the two steps genuinely disagree at 1440, so they are not shared. */}
        <section className="flex w-full flex-col items-center justify-center gap-[calc(15.792px_+_8.208*var(--fl))]">
          {/* 20 @402 → 28 @1440, Medium at both, as in AdvisorStep and `SectionTitle`:
              `1243:1371` is 20/500 on a 28-tall box at 1.4, where the wizard's page title beside
              it (`1243:1354`) is 24/600 on 34; `708:1583` is 28/500 on 39. CONFIRMED — size and
              weight were both already right. */}
          <h2 className="w-full text-[length:var(--t-20-28)] leading-[1.4] font-medium">
            เอกสารสำหรับผู้เข้าแข่งขันคนที่ {n}
          </h2>
          {/* 16 @402 → 24 @1440 between rows, the same split AdvisorStep hits: the three rows are
              siblings of the heading in one 16-gap column at 402 (`1243:1370`) and grouped into
              `1243:1732` on 24 at 1440. `gap-6` was the 1440 figure held flat. */}
          <div className="flex w-full flex-col items-start gap-[calc(15.792px_+_8.208*var(--fl))]">
            {STUDENT_DOCUMENTS.map((doc, i) => (
              <DocumentRow key={doc.text} index={i + 1} {...doc} />
            ))}
          </div>
        </section>

        <Separator />
        {/* `names` because the two steps disagree on the given-name placeholders: the entrant is
            `มดแฮก` / `Modhack` (`2053:596` / `2053:617`) where the advisor is `นพนภา` / `Nopnapa`.
            The surnames match, so only the pair that differs is passed — see PersonFields. */}
        <PersonFields
          title={`ข้อมูลผู้เข้าแข่งขันคนที่ ${n}`}
          withBirthDate
          names={ENTRANT_NAMES}
        />
        <Separator />
        <ContactFields />
      </div>
    </WizardShell>
  )
}
