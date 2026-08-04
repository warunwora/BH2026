import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
  type ReactNode,
} from 'react'

/**
 * Figma's field primitives (708:1311 and its siblings). Every control is a rounded-12
 * box with a 0.8px #dcdcdc hairline and 12 of padding around an 18px line, and every
 * label pairs a 20px medium name with an 18px red asterisk on a 6 gap.
 *
 * Focus used to snap: the border went red in one frame, on around twenty fields per entrant
 * step, and `focus:outline-none` had removed the platform's own ring without putting anything
 * in its place. 160ms is `--mm-fast` and the curve is `--mm-ease` — the same pair every other
 * hover and colour change in the app takes — and the 3px ring at 12% is opacity-only paint on
 * a `box-shadow`, so it costs no layout and restores the affordance the outline reset took.
 */
const BOX =
  'w-full rounded-[12px] border-[0.8px] border-[#dcdcdc] p-3 text-base leading-[normal] lg:text-lg text-ink placeholder:text-gray-1 focus:border-brand-red focus:outline-none transition-[border-color,box-shadow] duration-[160ms] ease-[cubic-bezier(0.4,0,0.2,1)] focus:shadow-[0_0_0_3px_rgb(192_86_62_/_0.12)]'

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
export function CheckMark({
  className = 'size-4',
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
}

export function useFileSlot({ kind, maxMB }: { kind: keyof typeof FILE_KINDS; maxMB: number }) {
  const [file, setFile] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const previewRef = useRef<string | null>(null)

  useEffect(
    () => () => {
      if (previewRef.current) URL.revokeObjectURL(previewRef.current)
    },
    [],
  )

  const put = (next: string | null) => {
    if (previewRef.current) URL.revokeObjectURL(previewRef.current)
    previewRef.current = next
    setPreview(next)
  }

  /* a refused file leaves the slot as it was: losing an accepted file to a mis-drop is worse */
  const take = (next: File | null | undefined) => {
    if (!next) return
    if (!FILE_KINDS[kind].ok(next)) return setError(FILE_KINDS[kind].refuse)
    if (next.size > maxMB * 1024 * 1024) return setError(`ไฟล์นี้มีขนาดเกิน ${maxMB} MB`)
    put(next.type.startsWith('image/') ? URL.createObjectURL(next) : null)
    setFile(next)
    setError(null)
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
    clear: () => {
      put(null)
      setFile(null)
      setError(null)
    },
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
      <span className="text-lg leading-[normal] font-medium lg:text-xl">{children}</span>
      {required && <span className="text-base leading-[normal] text-[#ea4335] lg:text-lg">*</span>}
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

/** Figma's field group: label over control on an 8 gap. */
function FieldShell({
  label,
  required,
  className,
  children,
}: Omit<BaseProps, 'value' | 'onChange'> & { children: ReactNode }) {
  return (
    <label className={`flex flex-col items-start gap-2 ${className ?? ''}`}>
      <Label required={required}>{label}</Label>
      {children}
    </label>
  )
}

export function TextField({ label, required, placeholder, className, value, onChange }: BaseProps) {
  return (
    <FieldShell label={label} required={required} className={className}>
      <input
        type="text"
        placeholder={placeholder}
        className={BOX}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </FieldShell>
  )
}

/** Figma trails the date control with a calendar glyph. */
export function DateField({ label, required, placeholder, className, value, onChange }: BaseProps) {
  return (
    <FieldShell label={label} required={required} className={className}>
      <span className="relative w-full">
        <input
          type="date"
          placeholder={placeholder}
          className={`${BOX} pr-11`}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
        <img
          src={`${ICON}e2f35dcd983d5c03887288d750b8cab9ac1c240b.svg`}
          alt=""
          aria-hidden
          className="pointer-events-none absolute top-1/2 right-3 size-6 -translate-y-1/2"
        />
      </span>
    </FieldShell>
  )
}

/** The only multi-line control in the design is 100 tall and top-aligned. */
export function TextArea({ label, required, placeholder, className, value, onChange }: BaseProps) {
  return (
    <FieldShell label={label} required={required} className={`w-full ${className ?? ''}`}>
      <textarea
        placeholder={placeholder}
        className={`${BOX} h-[100px] resize-y`}
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
  return (
    <FieldShell label={label} required={required} className={className}>
      <span className="relative w-full">
        <select
          className={`${BOX} appearance-none bg-white pr-11`}
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
          className="pointer-events-none absolute top-1/2 right-3 size-6 -translate-y-1/2"
        />
      </span>
    </FieldShell>
  )
}

/** Section heading with the "ล้าง" reset affordance from the design. */
export function SectionTitle({ title, onClear }: { title: string; onClear?: () => void }) {
  return (
    <div className="flex w-full items-start justify-between gap-4">
      <h2 className="text-2xl leading-[1.4] font-medium lg:text-[28px]">{title}</h2>
      {onClear && (
        <button
          type="button"
          onClick={onClear}
          className="mm-press flex shrink-0 items-start gap-2 text-base leading-[normal] text-gray-2 transition-colors hover:text-ink"
        >
          <img
            src={`${ICON}1b94090585ff7a3b45d6697db4f2aae8ed04747e.svg`}
            alt=""
            aria-hidden
            className="size-6"
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
}: {
  hint?: string
  kind?: 'image' | 'pdf'
  maxMB?: number
}) {
  /* six of these per entrant step, and none of them used to answer a drag at all */
  const slot = useFileSlot({ kind, maxMB })

  return (
    <div className="flex w-full shrink-0 flex-col items-start gap-3 lg:w-[500px]">
      <label
        {...slot.drop}
        className="auth-drop mm-press flex h-[100px] w-full cursor-pointer flex-col items-center justify-center gap-2.5 rounded-[20px] border border-dashed border-[#dcdcdc] hover:border-brand-red"
      >
        {slot.preview ? (
          <img
            src={slot.preview}
            alt=""
            aria-hidden
            className="size-10 rounded-[8px] object-cover"
          />
        ) : (
          <img
            src={`${ICON}1c78acc4a5b86e58e5a95e29c657511e410afedf.svg`}
            alt=""
            aria-hidden
            className="size-6"
          />
        )}
        <span className="w-full truncate px-3 text-center text-base leading-[normal] font-medium">
          {slot.file ? slot.file.name : 'อัปโหลดไฟล์'}
        </span>
        <input {...slot.inputProps} className="hidden" />
      </label>
      <p
        aria-live="polite"
        className={`w-full truncate text-base leading-[normal] ${slot.error ? 'text-[#ea4335]' : 'text-gray-1'}`}
      >
        {slot.error ?? hint}
      </p>
    </div>
  )
}

/**
 * Numbered document requirement plus its upload target, on Figma's 32 gap. The number
 * is a real `<ol>` marker so the 30 indent and the counter match the design exactly.
 */
export function DocumentRow({ index, text }: { index: number; text: string }) {
  return (
    <div className="flex w-full flex-col gap-4 lg:flex-row lg:items-center lg:gap-8">
      <ol start={index} className="min-w-0 flex-1 list-decimal">
        <li className="ms-[30px] text-lg leading-[normal] font-medium lg:text-xl">{text}</li>
      </ol>
      <UploadBox />
    </div>
  )
}

/** Figma's 0.5px section rule. */
export function Separator() {
  return <div aria-hidden className="h-[0.5px] w-full shrink-0 bg-[#dcdcdc]" />
}
