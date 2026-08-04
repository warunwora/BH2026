import { Link } from 'react-router-dom'
import AuthPageShell, { RESULT_ACTION, ResultCard } from '../../components/AuthPageShell'
import { useAuthBackLink } from '../../components/form/wizardNav'

/** Figma 708:2260 — the failure state desaturates the page's colour blocks to grey. */
export default function ErrorStep() {
  const authBack = useAuthBackLink()

  return (
    <AuthPageShell muted>
      <ResultCard
        image="/assets/figma/88a60428462d844f1f3ed64f3d0783097c2d33ac.png"
        title="ลงทะเบียนเข้าแข่งขันไม่สำเร็จ"
        titleClassName="text-brand-red"
        lines={['เกิดข้อผิดพลาดขึ้นในระหว่างการลงทะเบียน กรุณาลองอีกครั้ง']}
        action={
          /* `submit-back`, not `back`: this undoes the submit, so it is the whole result
             screen coming apart — the colour blocks sink away and the wizard's pasta spills
             back in — not a step sliding sideways. And when the terms step is genuinely the
             entry behind this one, it is reached by popping it, so the user's answers and
             their scroll position come back with it. */
          <Link {...authBack('/register/terms', 'submit-back')} className={RESULT_ACTION}>
            ลองอีกครั้ง
          </Link>
        }
      />
    </AuthPageShell>
  )
}
