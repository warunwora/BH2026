/**
 * ============================================================================================
 * THE REGISTRATION DRAFT — what survives leaving the flow, and what deliberately does not
 * ============================================================================================
 *
 * Figma `2074:3241` asks the returning user "คุณต้องการกรอกฟอร์มต่อจากที่ค้างไว้หรือไม่" — do you
 * want to carry on from where you left off. That question is only answerable if something was
 * kept, and before this module NOTHING was: every value in the wizard is per-component
 * `useState`, so `/register/team → /register/advisor` unmounts `TeamDetails` and the team name,
 * the school, the size radio and the photo are gone. Coming back re-mounts against `EMPTY`.
 * The modal would have been a dialogue offering to restore an empty draft.
 *
 * So this is the store the flow never had. It is deliberately NOT a context: a context lives
 * inside the React tree, and `GateProvider` — the only provider the wizard has — is mounted
 * *inside* `WizardShell` and is therefore rebuilt on every hop (see wizardNav.ts, which says of
 * itself that it is "a REGISTRY rather than a validation library"). A module talking to
 * `localStorage` outlives not just the hop but the tab.
 *
 * ------------------------------------------------------------------ what is NOT written here
 *
 * FILE CONTENTS, ever. `useFileSlot` (form/Field.tsx:260) holds a live `File` — a filesystem
 * handle — and a blob object URL made by `URL.createObjectURL`. Neither survives a page load:
 * the handle is not serialisable and the object URL is revoked on unmount, so a "restored" one
 * would be a dead string pointing at nothing. Reading the bytes to base64 them into
 * `localStorage` is the tempting fix and it is the wrong one twice over — these are ID card
 * scans and ปพ.7 transcripts, the most sensitive documents the site touches, and the quota is
 * ~5MB against a 10MB-per-file allowance.
 *
 * What IS kept per slot is a `FileNote` — `{ name, size }`, nothing else. That exists so a
 * restored step can SAY the file is missing ("แนบไว้ก่อนหน้านี้: บัตรประชาชน.pdf") instead of
 * pretending it is still attached. The slot itself comes back genuinely empty and still fails
 * its own required-gate, which is the honest state: the user must re-pick the file.
 *
 * A filename is user-chosen and therefore "deliberately entered", which is the line the brief
 * draws. Nothing is harvested that the user did not type or pick — there is no capture of
 * focus history, keystrokes, timings, or half-typed values from fields the user backed out of.
 *
 * ------------------------------------------------------------------ versioning
 *
 * `VERSION` is stamped into the payload and checked on every read. The register steps are being
 * actively reshaped by another track, and a field rename would otherwise let a draft written
 * against the old shape rehydrate into the new one — `bind('school')` reading a key that no
 * longer means what it did. A mismatch DISCARDS rather than migrates: a half-finished form is
 * cheap to redo and a silently wrong one is not. Bump `VERSION` on any change to a persisted
 * record's keys.
 */

/** Bump on ANY change to the shape of a persisted record. Old drafts are then discarded. */
const VERSION = 1

/** One key for the whole draft — it is read and written as a unit, so splitting it buys nothing. */
const KEY = 'bh2026.register.draft.v1'

/** What is remembered about a file the user had picked. Never the bytes. */
export type FileNote = { name: string; size: number }

/**
 * `steps` holds one JSON record per `useFieldGroup`-shaped call site, keyed by the caller.
 * `files` holds one note per upload slot. `furthest` is the highest `step` prop reached, which
 * is the number the modal's "กรอกฟอร์มต่อ" navigates back to.
 */
type Draft = {
  v: number
  savedAt: number
  furthest: number
  steps: Record<string, unknown>
  files: Record<string, FileNote>
}

const blank = (): Draft => ({ v: VERSION, savedAt: 0, furthest: 0, steps: {}, files: {} })

/**
 * The in-memory mirror. Every read goes through here rather than to `localStorage`, because the
 * hooks below call `readStep` during render for their `useState` initialiser and a JSON parse
 * per field group per hop is a real cost on a phone.
 *
 * `undefined` means "not loaded yet" and is distinct from a loaded-but-empty draft.
 */
let cache: Draft | undefined

/**
 * Whether storage can be touched at all. Safari in Lockdown Mode and any browser in a hardened
 * privacy configuration throw from the `localStorage` GETTER, not merely from `setItem` — so
 * this is a try/catch around the access itself and not around a write. Once it has thrown the
 * whole module degrades to a no-op store: the wizard then behaves exactly as it did before this
 * file existed, which is a working form with no draft, rather than a white screen.
 */
function store(): Storage | null {
  try {
    return window.localStorage
  } catch {
    return null
  }
}

function load(): Draft {
  if (cache) return cache

  const raw = store()?.getItem(KEY)
  if (!raw) return (cache = blank())

  try {
    const parsed = JSON.parse(raw) as Draft
    /* A draft from an incompatible build is discarded, not migrated — see the header. The
       shape checks are not paranoia: `localStorage` is writable by anything on the origin and
       by the user's own devtools, and a `steps` that is a string would crash every hook. */
    if (parsed?.v !== VERSION || typeof parsed.steps !== 'object' || parsed.steps === null) {
      return (cache = blank())
    }
    cache = {
      v: VERSION,
      savedAt: typeof parsed.savedAt === 'number' ? parsed.savedAt : 0,
      furthest: typeof parsed.furthest === 'number' ? parsed.furthest : 0,
      steps: parsed.steps,
      files: typeof parsed.files === 'object' && parsed.files !== null ? parsed.files : {},
    }
    return cache
  } catch {
    return (cache = blank())
  }
}

function save(next: Draft) {
  cache = next
  /* A write can throw on quota even though nothing here is large — a different origin-mate
     script can fill the quota, and Safari's private mode used to throw unconditionally. Losing
     the draft is the correct failure; taking the form down with it is not. */
  try {
    store()?.setItem(KEY, JSON.stringify(next))
  } catch {
    /* keep going against the in-memory mirror; the draft simply will not outlive the tab */
  }
}

/**
 * Bumped whenever the draft is cleared, so hooks already mounted can notice and reset
 * themselves to their `empty` record.
 *
 * This exists because "เริ่มกรอกฟอร์มใหม่" can be pressed while the step it is clearing is on
 * screen behind the scrim. Wiping `localStorage` alone would leave the mounted inputs holding
 * the old values and re-persist them on the next keystroke — the restart would appear to have
 * done nothing. The epoch is the signal that turns a storage wipe into a state reset.
 */
let epoch = 0
const listeners = new Set<() => void>()

export function subscribeDraft(fn: () => void) {
  listeners.add(fn)
  /* The braces matter: `Set.delete` returns a boolean, and an expression-bodied arrow would
     make this an `() => boolean`, which React rejects as an effect destructor. */
  return () => {
    listeners.delete(fn)
  }
}

export const draftEpoch = () => epoch

function bumpEpoch() {
  epoch += 1
  listeners.forEach((fn) => fn())
}

/* -------------------------------------------------------------------------- reading & writing */

/** The saved record for a field group, or `null` when there is none. */
export function readStep<T>(key: string): T | null {
  const value = load().steps[key]
  return value === undefined ? null : (value as T)
}

/**
 * Persists one field group's record.
 *
 * Values are coerced to strings and anything non-primitive is dropped. Every persisted record
 * in this flow is a `Record<string, string>` (`useFieldGroup`'s own constraint), so this is
 * belt-and-braces — but it is the guard that makes it impossible for a future call site to hand
 * a `File`, a `FileList` or a DOM node to `JSON.stringify` and either throw or write something
 * that must never be written. The rule from the header is enforced here rather than trusted.
 */
export function writeStep(key: string, record: Record<string, unknown>) {
  const clean: Record<string, string> = {}
  for (const [k, v] of Object.entries(record)) {
    if (typeof v === 'string') clean[k] = v
    else if (typeof v === 'number' || typeof v === 'boolean') clean[k] = String(v)
  }

  const draft = load()
  save({ ...draft, savedAt: Date.now(), steps: { ...draft.steps, [key]: clean } })
}

/** Persists a scalar answer — the team-size radio, a consent's ยอมรับ/ไม่ยอมรับ, the agreement tick. */
export function writeValue(key: string, value: string | number | boolean | null) {
  const draft = load()
  save({ ...draft, savedAt: Date.now(), steps: { ...draft.steps, [key]: value } })
}

/** What was attached at this slot last time, or `null`. The file itself is NOT restored. */
export function readFileNote(key: string): FileNote | null {
  return load().files[key] ?? null
}

/**
 * Records that a file was picked at this slot — its NAME and SIZE only.
 *
 * Passing `null` (the slot's ล้าง, or a rejected file) forgets the note, so a cleared slot does
 * not come back claiming a document that the user deliberately removed.
 */
export function noteFile(key: string, file: File | null) {
  const draft = load()
  const files = { ...draft.files }
  if (file) files[key] = { name: file.name, size: file.size }
  else delete files[key]
  save({ ...draft, savedAt: Date.now(), files })
}

/**
 * Records how far the user got. Monotonic on purpose — walking BACK to fix the team name must
 * not throw away the fact that entrant 2 had been reached, or "กรอกฟอร์มต่อ" would return the
 * user to the step they happened to leave from rather than the furthest one they had opened.
 */
export function markReached(step: number) {
  const draft = load()
  if (step <= draft.furthest) return
  save({ ...draft, savedAt: Date.now(), furthest: step })
}

/* ------------------------------------------------------------------------------- the decision */

/** `WizardShell`'s step numbers, in route order. Index 0 is unused; `furthest` is 1-based. */
const STEP_ROUTES = [
  '/register/terms',
  '/register/terms',
  '/register/team',
  '/register/advisor',
  '/register/entrant/1',
  '/register/entrant/2',
]

/** Where "กรอกฟอร์มต่อ" sends the user — the furthest step reached, clamped to the real routes. */
export function resumeRoute(): string {
  const furthest = load().furthest
  return STEP_ROUTES[Math.min(Math.max(furthest, 1), STEP_ROUTES.length - 1)]
}

/**
 * Is there anything worth offering to restore?
 *
 * A draft counts only if it holds a value the user actually entered — `savedAt` alone is not
 * enough, because `markReached` stamps it the moment a step mounts. Without this test, merely
 * opening `/register/terms` and leaving would make the modal offer to restore a form with
 * nothing in it, which reads as a bug.
 */
export function hasDraft(): boolean {
  const draft = load()
  if (Object.keys(draft.files).length > 0) return true

  return Object.values(draft.steps).some((value) => {
    if (value === null || value === undefined || value === '') return false
    if (typeof value === 'object') return Object.values(value).some((v) => v !== '' && v != null)
    return true
  })
}

/**
 * Forgets everything. Called by "เริ่มกรอกฟอร์มใหม่" and — the half that is easy to forget — on
 * a successful submission, so the next visitor to this browser is not offered the previous
 * team's answers.
 */
export function clearDraft() {
  cache = blank()
  try {
    store()?.removeItem(KEY)
  } catch {
    /* the in-memory mirror is already blank, which is what the mounted hooks read */
  }
  bumpEpoch()
}
