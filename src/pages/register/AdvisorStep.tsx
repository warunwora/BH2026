import WizardShell, { BackButton, NextButton } from '../../components/form/WizardShell'
import { DocumentRow, Separator } from '../../components/form/Field'
import PersonFields, { ContactFields } from './PersonFields'
import { ADVISOR_DOCUMENTS } from '../../registrationData'

/** Figma 708:1350. */
export default function AdvisorStep() {
  return (
    <WizardShell
      step={2}
      actions={
        <>
          <BackButton to="/register/team" />
          <NextButton to="/register/entrant/1" />
        </>
      }
    >
      <div className="flex w-full flex-col items-start gap-10">
        <section className="flex w-full flex-col items-center justify-center gap-4">
          <h2 className="w-full text-2xl leading-[1.4] font-medium lg:text-[28px]">
            เอกสารสำหรับอาจารย์
          </h2>
          <div className="flex w-full flex-col items-start gap-6">
            {ADVISOR_DOCUMENTS.map((doc, i) => (
              <DocumentRow key={doc} index={i + 1} text={doc} />
            ))}
          </div>
        </section>

        <Separator />
        <PersonFields title="ข้อมูลอาจารย์" headingGap="gap-5" />
        <Separator />
        <ContactFields />
      </div>
    </WizardShell>
  )
}
