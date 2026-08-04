import { Link } from 'react-router-dom'
import AuthPageShell, { RESULT_ACTION, ResultCard } from '../../components/AuthPageShell'
import { authLink } from '../../components/form/wizardNav'

/** Figma 708:2022. */
export default function SuccessStep() {
  return (
    <AuthPageShell>
      <ResultCard
        image="/assets/figma/8e7000b311d9ed819a112098ef1a6399fc8d8743.png"
        title="ลงทะเบียนเข้าแข่งขันสำเร็จ"
        lines={[
          'กรุณารอทีมงานตรวจสอบข้อมูลและเอกสาร',
          'คุณสามารถตรวจสอบสิทธิ์การเข้าแข่งขันได้ที่ทีมของฉัน',
        ]}
        action={
          /* the dashboard shares none of this flow's named elements, so `leave` asks for
             the plain crossfade rather than pretending something carries over. */
          <Link {...authLink('/my-team', 'leave')} className={RESULT_ACTION}>
            <img
              src="/assets/figma/c17718ad4d456345bef1d48d85cea6708137ea6e.svg"
              alt=""
              aria-hidden
              className="size-7"
            />
            ไปยังทีมของฉัน
          </Link>
        }
      />
    </AuthPageShell>
  )
}
