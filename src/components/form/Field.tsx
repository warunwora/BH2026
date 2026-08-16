import {
  useEffect,
  useId,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
  type ReactNode,
} from 'react'
import { useToast } from '../toast/store'
import { useGateField } from './wizardNav'

/**
 * Figma's field primitives (708:1311 and its siblings). Every control is a rounded-12
 * box with a 0.8px #dcdcdc hairline and 12 of padding around an 18px line, and every
 * label pairs a 20px medium name with an 18px red asterisk on a 6 gap.
 *
 * The type in this file comes from the flow's own scale in `registerType.tsx` (`--t-14-20` and
 * friends), NOT from index.css's flat-px ranks. Those ranks have floors (`fl-18` bottoms out at
 * 16, `fl-20` at 17) and Figma's phone frame goes under them nearly everywhere here — labels are
 * 14 (`1214:221`), upload captions 12 (`1239:1312`), document rows 14 (`1239:1303`) — so the
 * floors were rendering the phone form 2–5px over frame on ~40 nodes per step.
 *
 * Every desktop end is Figma's value times `--rt`, a DELIBERATE 10% trim the user asked for; see
 * the header of registerType.tsx before "fixing" any of these back to the frames. The one place
 * a floor STAYS is `BOX`, the control's own text — see its note.
 *
 * Focus used to snap: the border went red in one frame, on around twenty fields per entrant
 * step, and `focus:outline-none` had removed the platform's own ring without putting anything
 * in its place. 160ms is `--mm-fast` and the curve is `--mm-ease` — the same pair every other
 * hover and colour change in the app takes — and the 3px ring at 12% is opacity-only paint on
 * a `box-shadow`, so it costs no layout and restores the affordance the outline reset took.
 */
/*
 * The padding and the radius are two-anchor ramps rather than the 1440 values held flat.
 * `1214:223` / `1214:229` draw the control with 8 of padding on an 8 radius on the 402 frame
 * (a 34-tall box) against `708:1315` / `708:1321`'s 12 on 12 at 1440 (51 tall). Held at 12
 * the phone control was 8px taller than the frame's, twenty-odd times per entrant step, which
 * is most of why /register/entrant/1 reads as too big on a phone. Both land on 12.000 at
 * `--fl` = 1, so no 1440 control moves.
 *
 * The TYPE is `max(16px, var(--t-16-18))` — the one place in the flow with a hard floor under
 * it. Figma's phone value is 12 (`1214:224`) against 18 at 1440 (`708:1316`), and the rank runs
 * 16 → 18 x `--rt` instead.
 *
 * Not a judgement call about legibility: iOS Safari ZOOMS THE PAGE when a focused input's
 * font-size is under 16px, and it does not zoom back out. Every field on /register would punch
 * the layout to ~1.2x on tap and leave the page pannable sideways — the one thing the phone
 * work is under standing instruction never to do. 16px is the documented threshold, so this is
 * the floor doing exactly the job it exists for. The ramp above still shrinks the BOX itself to
 * the frame's 34-tall control, so the field's geometry is Figma's; only the glyphs inside it
 * are 4px larger than drawn.
 */
/*
 * PADDING is 7.2 → 11.2 and not 8 → 12, and the 0.8 it is short by is the border.
 *
 * Figma's control is 51 tall at 1440 (`2053:283`, `2053:407`, `2053:475` and every other
 * `calendar_time_add_fill` on the five step frames: `padding: 12`, an 18/1.511 line, and a
 * 0.8 stroke). 12 + 27.2 + 12 = 51.2 — the stroke contributes NOTHING, because a Figma stroke
 * is painted inside the frame rather than added to it. CSS does add it: `box-sizing:
 * border-box` only matters when a size is stated, and these controls are auto-height, so the
 * live box measured 12 + 27.2 + 12 + 2x0.8 = 52.8 → **53px against Figma's 51, on every field
 * of every step**. Taking the border's 0.8 out of the padding puts the outer box back on
 * 51.2 AND leaves the text where Figma draws it: 11.2 of padding plus 0.8 of border is
 * exactly the 12 inset `2053:284` sits on from the control's outer edge.
 *
 * Both ends move by the same 0.8 so the ramp is otherwise untouched, and the arithmetic still
 * lands on the anchors: 7.096 + 4.104 x 0.02535211 = 7.200 @402, and 11.200 @1440.
 *
 * The RADIUS does not move — `2053:283` is `cornerRadius: 12` and a radius is not inset by a
 * stroke — so the two expressions are deliberately no longer the same number.
 */
const FIELD_SHAPE = 'rounded-[calc(7.896px_+_4.104*var(--fl))] p-[calc(7.096px_+_4.104*var(--fl))]'

const BOX = `w-full ${FIELD_SHAPE} border-[0.8px] border-[#dcdcdc] text-[max(16px,var(--t-16-18))] leading-[normal] text-ink placeholder:text-gray-1 focus:border-brand-red focus:outline-none transition-[border-color,box-shadow] duration-[160ms] ease-[cubic-bezier(0.4,0,0.2,1)] focus:shadow-[0_0_0_3px_rgb(192_86_62_/_0.12)]`

/**
 * Every 24px glyph in this file, as one ramp. Figma draws each of them at 16 on the 402 frames
 * and 24 at 1440:
 *
 *   the select / date chevron   `1214:231`  16  →  `708:1323`  24
 *   the "ล้าง" cross            `1239:1063` 16  →  `708:1300`  24
 *
 * The trailing chevron is why this matters beyond taste: it sits inside the control, so a 24
 * mark in a 34-tall box left 5px of clearance top and bottom where the frame draws 9.
 */
const GLYPH_16_24 = 'size-[calc(15.792px_+_8.208*var(--fl))]'

/**
 * ...and the ones Figma draws at 20 on the phone: the upload arrow (`1243:1376`) and the team
 * photo's picture mark (`1214:214`, used from TeamStep), both 24 at 1440 (`708:1306`).
 */
export const GLYPH_20_24 = 'size-[calc(19.896px_+_4.104*var(--fl))]'

/**
 * Figma ships the tick as a flat SVG export, but a tick is the one glyph in this flow that
 * marks a decision, so it is inlined here and drawn on instead — the stroke travels the path
 * in 260ms (`.auth-check-path` in styles/auth-motion.css). Geometry matches the export: a
 * 16-unit box, a 2-unit round stroke, the corner at the lower third.
 *
 * `drawn` is what decides whether it travels, and it must be false on mount. A consent row
 * arrives with a default already chosen, and a stroke that draws itself on page entry claims
 * the user decided something they have not touched — identically for ยอมรับ and ไม่ยอมรับ, all
 * rows at once, over the incoming step transition. Call sites pass `drawn` from a per-control
 * `touched` flag set in the change handler: static on arrival, drawn on a choice.
 */
/**
 * The tick's own two anchors, and they are a BOX-AND-GLYPH pair rather than one size. Figma
 * nests it: `1297:1522` is a 16 box holding a 12 tick on the 402 frame, `722:374` a 24 box
 * holding a 16 tick at 1440 — so the mark is 12 → 16 while the box it sits in is 16 → 24, and
 * ramping only one of the two is what makes a glyph overflow its own container. The box lives
 * at the call sites (TermsStep's consent square, TeamStep's caption slot); this is the mark.
 */
export const CHECK_MARK = 'size-[calc(11.896px_+_4.104*var(--fl))]'

export function CheckMark({
  className = CHECK_MARK,
  drawn = false,
}: {
  className?: string
  drawn?: boolean
}) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        className={drawn ? 'auth-check-path' : undefined}
        d="M3.5 8.5L6.5 11.5L12.5 4.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

/**
 * Drag state for a dashed drop target. `data-over` is what `.auth-drop` in auth-motion.css
 * reads; `dragenter`/`dragleave` fire per descendant, so the counter is what stops the state
 * flickering as the pointer crosses the icon and the caption inside the box.
 */
export function useDropTarget(onFile?: (file: File) => void) {
  const [depth, setDepth] = useState(0)

  return {
    'data-over': depth > 0,
    onDragEnter: (e: DragEvent) => {
      e.preventDefault()
      setDepth((d) => d + 1)
    },
    onDragOver: (e: DragEvent) => e.preventDefault(),
    onDragLeave: () => setDepth((d) => Math.max(0, d - 1)),
    /*
     * `preventDefault` because the browser's own default for a file dropped anywhere on the
     * page is to *navigate to it*, which would throw away a half-filled registration. The
     * highlight is cleared unconditionally — a drop that is refused for size or type still
     * has to stop looking like it is mid-drag — and only then is the first file handed on.
     * One file: every box in the design is a single slot, and `files[1..]` would vanish
     * silently, which is worse than never taking it.
     */
    onDrop: (e: DragEvent) => {
      e.preventDefault()
      setDepth(0)
      const file = e.dataTransfer?.files?.[0]
      if (file) onFile?.(file)
    },
  }
}

/**
 * What a drop target and its `<input type="file">` share: the one file the slot holds, the
 * reason a file was refused, and a preview URL for the images.
 *
 * There is no backend in this project, so this is deliberately local state and nothing else —
 * no request, no progress, no id. The `<input>` is reset to '' after every pick so that
 * choosing the same file again after a refusal still fires `change`, and so the DOM never
 * disagrees with `file` about what the slot holds.
 *
 * `URL.createObjectURL` pins the whole blob in memory until it is revoked, and a registration
 * has seven of these slots across four steps: the previous URL is revoked on replace and on
 * clear, and the last one on unmount, via a ref because the cleanup runs once with the mount
 * closure and would otherwise revoke whatever `preview` was at mount (nothing).
 */
const FILE_KINDS = {
  image: {
    accept: 'image/*',
    ok: (f: File) => f.type.startsWith('image/'),
    refuse: 'รองรับเฉพาะไฟล์รูปภาพ',
  },
  pdf: {
    accept: 'application/pdf',
    ok: (f: File) => f.type === 'application/pdf',
    refuse: 'รองรับเฉพาะไฟล์ PDF',
  },
  /**
   * The entrant's photo row, and the one slot in the flow whose caption promises more than PDF:
   * `2053:572` reads "จำกัดขนาดเอกสารไม่เกิน 10 MB (JPG, PNG, PDF)" where `2053:556` / `2053:564`
   * beside it say "(PDF เท่านั้น)". The box used to take `pdf` like its neighbours and refuse the
   * JPG its own caption invited — a control that rejects what it advertises. JPG and PNG are
   * named rather than a blanket `image/*`, because the caption names them.
   */
  photo: {
    accept: 'image/jpeg,image/png,application/pdf',
    ok: (f: File) => ['image/jpeg', 'image/png', 'application/pdf'].includes(f.type),
    refuse: 'รองรับเฉพาะไฟล์ JPG, PNG หรือ PDF',
  },
}

/**
 * ------------------------------------------------------------------- the transfer, and why
 *
 * Figma's toast set (1359:1024, 1359:1142, 1359:1117, 1359:1161, 1359:1185) draws a transfer
 * with a progress bar, a pause and a retry — five states that need something to be actually
 * happening, and the note above is right that this project has no backend to make it happen.
 *
 * So the transfer is a real READ, not a fake request. The file is walked in chunks with
 * `Blob.slice().arrayBuffer()`, and `loaded` is bytes that genuinely came off the disk. That
 * buys three things a `setInterval` counting to 100 would not:
 *
 *  - the progress bar is honest. It is the same number the caption prints.
 *  - `failed` (1359:1161) is REACHABLE, and for a real reason. A `File` handle is a pointer
 *    into the filesystem: move, rename, delete or unmount the thing between the picker
 *    closing and the read finishing and the slice throws `NotReadableError`. That is exactly
 *    the "upload failed part-way" the frame draws, including a partial byte count to print in
 *    it, and it is the one failure a browser-only app can genuinely have. Nothing here ever
 *    fails at random — a registration form that sometimes rejects a good file on purpose
 *    would be hostile.
 *  - pause and resume are real. The loop parks between chunks, so the bar stops where the
 *    bytes stopped.
 *
 * `READ_PACE_MS` is the one deliberate lie, and it is pacing rather than data: 24 slices of a
 * 5 MB file resolve in well under 100ms total, which would make the in-flight state a single
 * flashed frame. Holding each tick to ~58ms puts a transfer at roughly 1.4s — long enough to
 * see, short enough that nobody is waiting on it — while every byte reported is still a byte
 * that was read. 24 slices is also what gives the bar its granularity: 4% a step, which at
 * 348 wide is 14px, comfortably more than the 1px that would make the transition pointless.
 */
const READ_CHUNKS = 24
const READ_PACE_MS = 58

const wait = (ms: number) => new Promise<void>((resolve) => window.setTimeout(resolve, ms))

/**
 * The live transfer's switches. `cancelled` and `paused` are flipped by the toast's own
 * controls; `superseded` is flipped by the slot when it is the one ending the transfer.
 *
 * The third exists because withdrawing an in-flight card runs the card's `onCancel`, and that
 * callback's whole job is to EMPTY the slot — right for the user pressing the cross, wrong when
 * the slot is tidying up after itself. Picking a second file supersedes the first, and if the
 * first card's cancel were allowed to run it would delete the file that had just been accepted.
 */
type Transfer = { cancelled: boolean; paused: boolean; superseded: boolean }

export function useFileSlot({ kind, maxMB }: { kind: keyof typeof FILE_KINDS; maxMB: number }) {
  const [file, setFile] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const previewRef = useRef<string | null>(null)

  const toast = useToast()
  /*
   * The slot's identity, and half of the toast's de-duplication key. A registration has seven
   * of these — six document boxes on an entrant step plus TeamStep's photo — and two of them
   * refusing the same file must be two messages, while ONE of them refusing it eight times
   * must be one. `useId` is stable across renders and unique per mounted slot, which is
   * exactly that distinction.
   */
  const slotId = useId()
  const transfer = useRef<Transfer | null>(null)
  /* the in-flight toast's key, so an unmounted slot can withdraw it; null once it has settled */
  const openKey = useRef<string | null>(null)
  /* the api is memoised in the provider, but the unmount cleanup must not close over a render */
  const dismissRef = useRef(toast.dismiss)
  dismissRef.current = toast.dismiss

  useEffect(
    () => () => {
      if (previewRef.current) URL.revokeObjectURL(previewRef.current)
      /*
       * A transfer whose slot has gone is a claim about nothing: the wizard's steps unmount on
       * every hop and a 1.4s read easily outlives one. The read is stopped and its card
       * withdrawn — but only if it never settled, because a `success` the user has not read yet
       * is still worth saying and costs nothing to leave up.
       */
      if (transfer.current) {
        /* `superseded` so the withdrawal below does not try to setState on a gone component */
        transfer.current.superseded = true
        transfer.current.cancelled = true
      }
      transfer.current = null
      if (openKey.current) dismissRef.current(openKey.current)
      openKey.current = null
    },
    [],
  )

  const put = (next: string | null) => {
    if (previewRef.current) URL.revokeObjectURL(previewRef.current)
    previewRef.current = next
    setPreview(next)
  }

  /**
   * One transfer per slot, and one card per transfer.
   *
   * Stops whatever is running and withdraws its card. Both halves are needed and each was a
   * separate defect: a second pick that only stopped the loop left the first file's in-flight
   * toast on screen for good — it is sticky by design, and nothing was ever going to update it
   * again — while "ล้าง" pressed mid-transfer did the same. `superseded` is set first so the
   * withdrawal cannot re-enter through the card's own cancel.
   */
  const stopTransfer = () => {
    const ctl = transfer.current
    const key = openKey.current
    transfer.current = null
    openKey.current = null
    if (ctl) {
      ctl.superseded = true
      ctl.cancelled = true
    }
    if (key) toast.dismiss(key)
  }

  const empty = () => {
    stopTransfer()
    put(null)
    setFile(null)
    setError(null)
  }

  /** the paced read. Every `return` past a `cancelled` check is a transfer that no longer owns
   *  its card, so it must not write to it — the card may already belong to the next file. */
  const run = async (f: File, ctl: Transfer, key: string) => {
    const step = Math.max(1, Math.ceil(f.size / READ_CHUNKS))
    let loaded = 0

    try {
      while (loaded < f.size) {
        if (ctl.cancelled) return
        /* parked, not busy-waiting: 90ms is imperceptible against a paused progress bar */
        while (ctl.paused) {
          await wait(90)
          if (ctl.cancelled) return
        }

        const started = performance.now()
        const end = Math.min(loaded + step, f.size)
        await f.slice(loaded, end).arrayBuffer() // the real read, and the only thing that throws
        if (ctl.cancelled) return

        loaded = end
        toast.update(key, { loaded })

        const spent = performance.now() - started
        if (spent < READ_PACE_MS) await wait(READ_PACE_MS - spent)
      }

      if (ctl.cancelled) return
      transfer.current = null
      openKey.current = null
      /*
       * 1359:1117. The three controls are cleared explicitly and not left to fall through the
       * merge: a settled card that still carried `onCancel` would throw the accepted file away
       * the moment the user closed the success message.
       */
      toast.update(key, {
        kind: 'success',
        loaded: f.size,
        onPause: undefined,
        onResume: undefined,
        onCancel: undefined,
      })
    } catch {
      if (ctl.cancelled) return
      transfer.current = null
      openKey.current = null
      /* 1359:1161, with the partial count the frame prints and the curved arrow it draws */
      toast.update(key, {
        kind: 'failed',
        loaded,
        onPause: undefined,
        onResume: undefined,
        onCancel: undefined,
        onRetry: () => start(f),
      })
    }
  }

  /** 1359:1024 — raise the in-flight card and walk the file. */
  const start = (f: File) => {
    /* whatever was in flight is now the previous file's business, and its card goes with it.
       On the RETRY path there is nothing to stop: the failed transfer already released both
       refs, so this is a no-op and the push below lands on the same key — which is what makes
       a retry re-time and redraw the card that is already there rather than raising a second. */
    stopTransfer()

    const ctl: Transfer = {
      cancelled: false,
      paused: false,
      superseded: false,
    }
    transfer.current = ctl

    const key = `up:${slotId}:${f.name}:${f.size}`
    openKey.current = key
    toast.push({
      key,
      kind: 'uploading',
      name: f.name,
      loaded: 0,
      total: f.size,
      /* 1359:1113's pause and 1359:1159's square are the same switch read twice */
      onPause: () => {
        ctl.paused = true
        toast.update(key, { kind: 'paused' })
      },
      onResume: () => {
        ctl.paused = false
        toast.update(key, { kind: 'uploading' })
      },
      /* The cross on an in-flight card is the only thing that can end the transfer, so it also
         empties the slot — cancelling an upload and being left holding the file would be a
         cross that did half its job. `superseded` is the one case it must not: there the slot
         is already holding the NEXT file and emptying would delete it. */
      onCancel: () => {
        ctl.cancelled = true
        if (ctl.superseded) return
        openKey.current = null
        empty()
      },
    })

    void run(f, ctl, key)
  }

  /**
   * a refused file leaves the slot as it was: losing an accepted file to a mis-drop is worse.
   *
   * Both refusals raise 1359:1185 as well as writing the caption line, and the two surfaces
   * say different things on purpose: the caption is the slot's standing state and survives, the
   * toast is the event and goes. The keys are prefixed per reason so a file that is both the
   * wrong type AND over-size cannot silently reuse the other's card — only the first test that
   * fails ever reports, but the keys must still not collide across slots or reasons.
   */
  const take = (next: File | null | undefined) => {
    if (!next) return

    if (!FILE_KINDS[kind].ok(next)) {
      setError(FILE_KINDS[kind].refuse)
      /* Figma's own copy for this state (1359:1193); the caption keeps the more specific
         "รองรับเฉพาะไฟล์ PDF", which names what the box DOES take. */
      toast.push({
        key: `type:${slotId}:${next.name}:${next.size}`,
        kind: 'rejected',
        name: next.name,
      })
      return
    }

    if (next.size > maxMB * 1024 * 1024) {
      const refuse = `ไฟล์นี้มีขนาดเกิน ${maxMB} MB`
      setError(refuse)
      /* no frame draws the over-size case, so it borrows 1359:1185's drawing and states its own
         limit — the same string the caption uses, so the two surfaces cannot disagree */
      toast.push({
        key: `size:${slotId}:${next.name}:${next.size}`,
        kind: 'rejected',
        name: next.name,
        reason: refuse,
      })
      return
    }

    /*
     * The slot fills immediately and the transfer runs behind it, which is why nothing about
     * UploadBox or TeamStep's rendering changes: the preview, the name and the caption all
     * behave exactly as they did. A read that fails leaves the file in place — the choice was
     * good, the read was not — and only an explicit cancel empties the slot.
     */
    put(next.type.startsWith('image/') ? URL.createObjectURL(next) : null)
    setFile(next)
    setError(null)
    start(next)
  }

  /* the drag highlight and the picker are the two ways into the same slot */
  const drop = useDropTarget(take)

  return {
    file,
    error,
    preview,
    drop,
    inputProps: {
      type: 'file' as const,
      accept: FILE_KINDS[kind].accept,
      onChange: (e: ChangeEvent<HTMLInputElement>) => {
        take(e.target.files?.[0])
        e.target.value = ''
      },
    },
    clear: empty,
  }
}

/**
 * The values of one titled section, so its "ล้าง" can empty exactly its own fields and
 * nothing else. `empty` has to be a module constant: it is both the initial state and what
 * clearing restores, and a fresh object per render would make `clear` unstable for no reason.
 *
 * This is a `useState` record and not a form library on purpose — the flow has no submit, no
 * validation and no server (see the field-validation note in styles/auth-motion.css), so the
 * only thing state is needed for is being able to put it back.
 */
export function useFieldGroup<T extends Record<string, string>>(empty: T) {
  const [values, setValues] = useState(empty)

  return {
    /** the whole record, so the section can tell the step gate what is still blank */
    values,
    /** spread onto a field: `<TextField label="ชื่อทีม" {...bind('name')} />` */
    bind: (key: keyof T) => ({
      value: values[key],
      onChange: (next: string) => setValues((prev) => ({ ...prev, [key]: next })),
    }),
    clear: () => setValues(empty),
  }
}

const ICON = '/assets/figma/'

export function Label({ children, required }: { children: ReactNode; required?: boolean }) {
  return (
    <span className="flex items-center gap-1.5 leading-[normal]">
      <span className="text-[length:var(--t-14-20)] leading-[normal] font-medium">{children}</span>
      {required && (
        <span className="text-[length:var(--t-14-18)] leading-[normal] text-[#ea4335]">*</span>
      )}
    </span>
  )
}

/*
 * Every control is controlled, and `value`/`onChange` are required rather than optional: the
 * section headings carry a "ล้าง" that has to be able to empty them, and an uncontrolled field
 * added later would leave that button looking like it works and doing nothing — which is the
 * bug this pair exists to make impossible. `useFieldGroup` supplies both in one spread.
 */
type BaseProps = {
  label: string
  required?: boolean
  placeholder?: string
  className?: string
  value: string
  onChange: (value: string) => void
}

/**
 * ------------------------------------------------------------- the refusal, per field
 *
 * A control that is holding the step up says so in three places at once, because any one of
 * them alone leaves somebody out: the border goes red (seen), the reason is written under it
 * (read), and `aria-invalid` + `aria-describedby` tie the two together (announced). The
 * message element exists ONLY while the field is flagged, so `aria-describedby` is never a
 * dangling id.
 *
 * Red is `#ea4335`, which is already this file's error colour — `Label`'s asterisk and
 * `UploadBox`'s refusal caption are both drawn in it, and Figma has no error state of its own
 * to copy (no 2053 frame draws one).
 */
const BOX_INVALID =
  'border-[#ea4335] focus:border-[#ea4335] focus:shadow-[0_0_0_3px_rgb(234_67_53_/_0.14)]'

function FieldError({ id, message }: { id: string; message: string | null }) {
  if (!message) return null
  return (
    /* 12 → 16, the ramp `UploadBox`'s caption already uses — a note under a control, not body
       copy. It is inside the `<label>`, so it lands under the input rather than beside it. */
    <p id={id} className="text-[length:var(--t-12-16)] leading-[normal] text-[#ea4335]">
      {message}
    </p>
  )
}

/**
 * What a required control owes the gate: the sentence it shows while empty, and nothing at all
 * when it is filled or was never required. Trimmed, so a field holding only spaces is empty.
 */
const blankReason = (required: boolean | undefined, label: string, value: string) =>
  required && !value.trim() ? `กรอก${label}` : null

/** Figma's field group: label over control on an 8 gap. */
function FieldShell({
  label,
  required,
  className,
  errorId,
  error,
  children,
}: Omit<BaseProps, 'value' | 'onChange'> & {
  children: ReactNode
  errorId: string
  error: string | null
}) {
  return (
    <label className={`flex flex-col items-start gap-2 ${className ?? ''}`}>
      <Label required={required}>{label}</Label>
      {children}
      <FieldError id={errorId} message={error} />
    </label>
  )
}

export function TextField({ label, required, placeholder, className, value, onChange }: BaseProps) {
  const gate = useGateField<HTMLInputElement>(blankReason(required, label, value))

  return (
    <FieldShell
      label={label}
      required={required}
      className={className}
      errorId={gate.messageId}
      error={gate.message}
    >
      <input
        ref={gate.ref}
        type="text"
        placeholder={placeholder}
        aria-invalid={gate.invalid || undefined}
        aria-describedby={gate.message ? gate.messageId : undefined}
        className={`${BOX} ${gate.invalid ? BOX_INVALID : ''}`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </FieldShell>
  )
}

/**
 * Figma trails the date control with a calendar glyph.
 *
 * The three lengths of a trailing glyph have to move together or the control breaks: the mark
 * ramps 16 → 24 (`GLYPH_16_24`), its offset from the edge ramps 8 → 12 with the control's own
 * padding, and the reserved right padding is offset + mark + offset, i.e. 32 → 44. `pr-11` was
 * the 1440 figure and it reserved 44 of a 314-wide phone control for a mark that only needed
 * 32, so a long date string cleared the glyph by 12px more than the design allows.
 */
const TRAIL = 'pr-[calc(31.688px_+_12.312*var(--fl))]'
const TRAIL_GLYPH = `pointer-events-none absolute top-1/2 right-[calc(7.896px_+_4.104*var(--fl))] -translate-y-1/2 ${GLYPH_16_24}`

/**
 * TWO calendar icons, and why only one of them can simply be deleted.
 *
 * `<input type="date">` draws its own `::-webkit-calendar-picker-indicator` in Chrome and Safari,
 * so the control shipped with the browser's glyph AND Figma's `1214:231` mark beside it. Figma's
 * is the one to keep — but the native indicator is also the thing that OPENS the picker, and
 * Figma's is `pointer-events-none`, so hiding the native one outright would leave a date field
 * with a decorative icon and no way to pick a date except by typing.
 *
 * So the native indicator is made invisible and STRETCHED over the whole reserved trailing zone
 * instead: `opacity: 0` with the same 32 → 44 width `TRAIL` reserves. Figma's glyph sits on top
 * of it, the click still lands on the real control, and the hit area is now the whole glyph
 * region rather than the browser's own smaller box.
 *
 * Firefox draws no indicator at all, so it never had the duplicate and is unaffected.
 */
const NATIVE_PICKER = [
  '[&::-webkit-calendar-picker-indicator]:absolute',
  '[&::-webkit-calendar-picker-indicator]:inset-y-0',
  '[&::-webkit-calendar-picker-indicator]:right-0',
  '[&::-webkit-calendar-picker-indicator]:w-[calc(31.688px_+_12.312*var(--fl))]',
  '[&::-webkit-calendar-picker-indicator]:m-0',
  '[&::-webkit-calendar-picker-indicator]:cursor-pointer',
  '[&::-webkit-calendar-picker-indicator]:opacity-0',
].join(' ')

export function DateField({ label, required, placeholder, className, value, onChange }: BaseProps) {
  const gate = useGateField<HTMLInputElement>(blankReason(required, label, value))

  return (
    <FieldShell
      label={label}
      required={required}
      className={className}
      errorId={gate.messageId}
      error={gate.message}
    >
      <span className="relative w-full">
        <input
          ref={gate.ref}
          type="date"
          placeholder={placeholder}
          aria-invalid={gate.invalid || undefined}
          aria-describedby={gate.message ? gate.messageId : undefined}
          className={`${BOX} ${TRAIL} ${NATIVE_PICKER} ${gate.invalid ? BOX_INVALID : ''}`}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
        <img
          src={`${ICON}e2f35dcd983d5c03887288d750b8cab9ac1c240b.svg`}
          alt=""
          aria-hidden
          className={TRAIL_GLYPH}
        />
      </span>
    </FieldShell>
  )
}

/** The only multi-line control in the design is 100 tall and top-aligned. */
export function TextArea({ label, required, placeholder, className, value, onChange }: BaseProps) {
  const gate = useGateField<HTMLTextAreaElement>(blankReason(required, label, value))

  return (
    <FieldShell
      label={label}
      required={required}
      className={`w-full ${className ?? ''}`}
      errorId={gate.messageId}
      error={gate.message}
    >
      <textarea
        ref={gate.ref}
        placeholder={placeholder}
        aria-invalid={gate.invalid || undefined}
        aria-describedby={gate.message ? gate.messageId : undefined}
        className={`${BOX} h-[100px] resize-y ${gate.invalid ? BOX_INVALID : ''}`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </FieldShell>
  )
}

export function SelectField({
  label,
  required,
  placeholder,
  options = [],
  className,
  value,
  onChange,
}: BaseProps & { options?: string[] }) {
  /*
   * A select's empty value is the disabled placeholder option, i.e. the same `''` a text field
   * starts on, so one predicate covers both.
   *
   * `options.length > 0` is the guard that stops this being a trap. สถานศึกษา on the team step
   * (`2053:289`) is `required` and is passed NO options — there is no school list in the repo
   * yet — so it renders as a control whose only entry is the disabled placeholder. Gating a
   * question the user is given no way to answer would wall every registrant off at step 2, so
   * an optionless select declares nothing. **This needs a real list before launch**; the moment
   * one is passed, the field gates itself with no other change.
   */
  const gate = useGateField<HTMLSelectElement>(
    options.length > 0 ? blankReason(required, label, value) : null,
  )

  return (
    <FieldShell
      label={label}
      required={required}
      className={className}
      errorId={gate.messageId}
      error={gate.message}
    >
      <span className="relative w-full">
        <select
          ref={gate.ref}
          aria-invalid={gate.invalid || undefined}
          aria-describedby={gate.message ? gate.messageId : undefined}
          className={`${BOX} ${TRAIL} appearance-none bg-white ${gate.invalid ? BOX_INVALID : ''}`}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        >
          <option value="" disabled>
            {placeholder}
          </option>
          {options.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
        <img
          src={`${ICON}da1c84a7a51ab6256b69963fbe9c03c1607713d3.svg`}
          alt=""
          aria-hidden
          className={TRAIL_GLYPH}
        />
      </span>
    </FieldShell>
  )
}

/** Section heading with the "ล้าง" reset affordance from the design. */
export function SectionTitle({ title, onClear }: { title: string; onClear?: () => void }) {
  return (
    <div className="flex w-full items-start justify-between gap-4">
      {/* 20 @402 → 28 @1440. The low anchor was 24, read off the wizard's PAGE title
          (`1297:1465`, a 34-tall box) on the assumption that a section title matches it; it
          does not. `1214:206` and `1243:1371` are 28-tall boxes at 1.4, i.e. 20, against
          `708:1298`'s 39-tall box at 28 — so the phone drops a section heading two steps below
          its page heading, where this was rendering them one apart. 1440 is unchanged: the ramp
          still lands on 28.000 at `--fl` = 1. */}
      <h2 className="text-[length:var(--t-20-28)] leading-[1.4] font-medium">{title}</h2>
      {onClear && (
        <button
          type="button"
          onClick={onClear}
          /* 14 -> 16, written out rather than taken from `fl-16`, whose floor is 15 and so was
             1px over the frame. `1239:1065` is 14 (get_design_context on `1214:204`) against
             `708:1302`'s 16. The gap ramps with the glyph: 4 on `1239:1062`, 8 on `708:1299`. */
          className="mm-press flex shrink-0 items-start gap-[calc(3.896px_+_4.104*var(--fl))] text-[length:var(--t-14-16)] leading-[normal] text-gray-2 transition-colors hover:text-ink"
        >
          <img
            src={`${ICON}1b94090585ff7a3b45d6697db4f2aae8ed04747e.svg`}
            alt=""
            aria-hidden
            className={GLYPH_16_24}
          />
          ล้าง
        </button>
      )}
    </div>
  )
}

/**
 * The 500-wide dashed drop target that trails every document requirement.
 *
 * `kind` and `maxMB` default to what the hint copy says out loud — PDF, 10 MB — because a box
 * that accepts what its own caption rules out is the same broken promise as one that accepts
 * nothing. Pass all three together when a slot wants something else.
 *
 * The caption line does double duty: it is the size rule until a file is refused and the reason
 * afterwards, so a refusal cannot push the 100-tall box or its neighbours around, and a long
 * file name truncates rather than widening the row (the page must not scroll sideways).
 */
export function UploadBox({
  hint = 'จำกัดขนาดเอกสารไม่เกิน 10 MB (PDF เท่านั้น)',
  kind = 'pdf',
  maxMB = 10,
  requiredLabel,
}: {
  hint?: string
  kind?: keyof typeof FILE_KINDS
  maxMB?: number
  /** Names this slot in the action bar while it is empty. Omit for an optional target. */
  requiredLabel?: string
}) {
  /* six of these per entrant step, and none of them used to answer a drag at all */
  const slot = useFileSlot({ kind, maxMB })

  /* every document on `2053:365` / `2053:545` carries a `*` in its own label text, and until
     now not one of them stopped the step advancing with nothing attached */
  const gate = useGateField<HTMLInputElement>(
    requiredLabel && !slot.file ? `ต้องแนบ${requiredLabel}` : null,
  )

  return (
    /*
     * 500 is Figma's width at 1440, where the card's content column is 960 — so the box is 52%
     * of it and the numbered requirement beside it gets the other 48%. Held at a hard 500 from
     * `lg` up it stopped being a share and became a wall: at 1024 the same column is 908, so the
     * box took 55% of it and left 376 for a paragraph that runs to four lines. The ramp keeps
     * the 1440 number exactly and reaches 436 at 1024, which is the same 48% for the text.
     */
    <div className="flex w-full shrink-0 flex-col items-start gap-3 lg:w-[calc(336px_+_164*var(--fl))]">
      {/*
       * Box and glyph together. `1243:1375` draws this target 80 tall with a 20 upload mark
       * (`1243:1376`) on the 402 frame; at 1440 it is 100 with a 24 mark. `h-[100px]` and
       * `size-6` were both the 1440 figures held flat, which on a phone put a desktop-size
       * glyph in a desktop-size box inside a card 354 wide — six of them per entrant step.
       * Both ramps land on their 1440 value exactly.
       */}
      <label
        {...slot.drop}
        className={`auth-drop mm-press flex h-[calc(79.48px_+_20.52*var(--fl))] w-full cursor-pointer flex-col items-center justify-center gap-2.5 rounded-[20px] border border-dashed hover:border-brand-red ${
          gate.invalid ? 'border-[#ea4335]' : 'border-[#dcdcdc]'
        }`}
      >
        {slot.preview ? (
          /* the thumbnail stands in for the glyph, so it takes the glyph's own ramp scaled to
             the 40 Figma gives a held file — no node of its own, hence the shared expression */
          <img
            src={slot.preview}
            alt=""
            aria-hidden
            className="size-[calc(33.16px_+_6.84*var(--fl))] rounded-[8px] object-cover"
          />
        ) : (
          <img
            src={`${ICON}1c78acc4a5b86e58e5a95e29c657511e410afedf.svg`}
            alt=""
            aria-hidden
            className={GLYPH_20_24}
          />
        )}
        {/* 14 -> 16, written out (`fl-16` floors at 15): `1243:1378` is a 21-tall box, i.e. 14 at the 1.5
            this style is set at, against 16 at 1440. */}
        <span className="w-full truncate px-3 text-center text-[length:var(--t-14-16)] leading-[normal] font-medium">
          {slot.file ? slot.file.name : 'อัปโหลดไฟล์'}
        </span>
        {/*
         * `sr-only`, not `hidden`. A `display: none` input is not focusable and is not in the
         * accessibility tree, so this slot had nothing for the gate to send the reader TO and
         * no element to hang `aria-invalid` on — and it could not be reached by keyboard at
         * all, which was already a defect. `sr-only` is absolutely positioned at 1px, so it
         * costs no layout, the wrapping label still opens the picker on click, and there is now
         * a real control to focus.
         */}
        <input
          {...slot.inputProps}
          ref={gate.ref}
          aria-invalid={gate.invalid || undefined}
          aria-describedby={gate.messageId}
          className="sr-only"
        />
      </label>
      {/* 12 -> 16, written out: `1243:1379` is 12 on the phone frame against 16 at 1440. A hint
          under a control is the one caption that may go to 12 — it is not an input's own text,
          so the 16px iOS-zoom floor that pins `BOX` does not apply to it.

          One line, three states, in priority order: the gate's refusal, then a file the box
          REFUSED (wrong type or over size), then the standing size rule. The first two are both
          red and both about this slot, so they share the line rather than stacking two red
          notes under a 100-tall box. It keeps ONE id in every state, so the input's
          `aria-describedby` is a live reference whether it is describing the rule or the
          refusal. */}
      <p
        id={gate.messageId}
        aria-live="polite"
        className={`w-full truncate text-[length:var(--t-12-16)] leading-[normal] ${gate.message || slot.error ? 'text-[#ea4335]' : 'text-gray-1'}`}
      >
        {gate.message ?? slot.error ?? hint}
      </p>
    </div>
  )
}

/**
 * A document requirement plus its upload target, on Figma's 32 gap.
 *
 * NOT NUMBERED, and the `<ol>` that used to be here was invented. The current desktop frames
 * draw each requirement as ONE plain text node flush with the content column's left edge —
 * `2053:370` / `2053:378` (advisor) and `2053:550` / `2053:558` / `2053:566` (entrant) are all
 * `TEXT` at x224, which is the column origin, with no `listOptions`, no ordered-list style and
 * no leading digit in `characters`. The old markup drew "1." / "2." / "3." AND pushed every
 * label 30px in from a left edge Figma has it sitting on. The `*` each label ends with is part
 * of the string in the frame, which is why it stays inside the copy in registrationData.ts.
 *
 * `index` survives because the GATE still needs an ordinal: every one of these labels is a
 * two-line legal sentence, and "ต้องแนบ<paragraph>" would be unreadable, so the refusal names
 * "เอกสารข้อ N" instead. It is a string for a screen reader, not a visible marker.
 *
 * `hint` / `kind` exist because the three entrant rows do NOT share one caption: `2053:556` and
 * `2053:564` are the PDF-only rule, but the photo row's `2053:572` reads
 * "จำกัดขนาดเอกสารไม่เกิน 10 MB (JPG, PNG, PDF)" — and the box was refusing the JPG its own
 * caption was about to promise. The default stays PDF-only, which is what the other five rows
 * across the two steps say.
 */
export function DocumentRow({
  index,
  text,
  hint,
  kind,
}: {
  index: number
  text: string
  hint?: string
  kind?: keyof typeof FILE_KINDS
}) {
  return (
    <div className="flex w-full flex-col gap-4 lg:flex-row lg:items-center lg:gap-8">
      <p className="min-w-0 flex-1 text-[length:var(--t-14-20)] leading-[normal] font-medium">
        {text}
      </p>
      <UploadBox requiredLabel={`เอกสารข้อ ${index}`} hint={hint} kind={kind} />
    </div>
  )
}

/** Figma's 0.5px section rule. */
export function Separator() {
  return <div aria-hidden className="h-[0.5px] w-full shrink-0 bg-[#dcdcdc]" />
}
