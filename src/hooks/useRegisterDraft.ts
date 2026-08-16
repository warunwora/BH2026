import { useCallback, useEffect, useRef, useState } from 'react'
import {
  clearDraft,
  draftEpoch,
  markReached,
  noteFile,
  readFileNote,
  readStep,
  subscribeDraft,
  writeStep,
  writeValue,
  type FileNote,
} from '../registerDraft'

/**
 * ============================================================================================
 * REACT BINDINGS FOR THE REGISTRATION DRAFT
 * ============================================================================================
 *
 * `registerDraft.ts` is the store; this is the only thing the wizard steps have to import.
 *
 * Every hook here is shaped as a DROP-IN for the thing it replaces, so wiring the flow is a
 * one-line change per call site rather than a refactor. `useDraftRecord` returns exactly what
 * `useFieldGroup` (form/Field.tsx:521) returns — `{ values, bind, clear }`, with `bind(key)`
 * yielding the same `{ value, onChange }` pair the field components already take — so
 *
 *     const { bind, clear } = useFieldGroup(EMPTY_PERSON)
 *
 * becomes
 *
 *     const { bind, clear } = useDraftRecord('advisor.person', EMPTY_PERSON)
 *
 * and nothing else in the component moves. That matters because `components/form/*` and
 * `pages/register/*` belong to another track right now: the smaller the diff they have to
 * accept, the less chance of a collision.
 *
 * ------------------------------------------------------------------ why the key is explicit
 *
 * Not derived from `useId()`, and not from the component. Both entrant routes mount the SAME
 * `EntrantStep` component (App.tsx routes `/register/entrant/:index` once), so anything derived
 * from component identity would give entrant 1 and entrant 2 a single shared record and each
 * would overwrite the other. The key is passed in, and the entrant call sites interpolate their
 * index into it. `useId()` is worse still — it encodes the render tree's shape, so adding a
 * wrapper anywhere above the field group silently invalidates every saved draft.
 */

/** Re-renders the caller whenever the draft is cleared, and reports the current epoch. */
function useEpoch() {
  const [, force] = useState(0)
  useEffect(() => subscribeDraft(() => force((n) => n + 1)), [])
  return draftEpoch()
}

/**
 * A persisted `useFieldGroup`. Same return shape; the values now survive the hop.
 *
 * @param key   stable identity for this group, e.g. `'team.details'`, `'entrant.1.person'`
 * @param empty the blank record, used as the shape AND as what `clear()` resets to
 */
export function useDraftRecord<T extends Record<string, string>>(key: string, empty: T) {
  const epoch = useEpoch()

  /*
   * The saved record is merged OVER `empty` rather than used in its place, and unknown keys are
   * dropped by the merge. `VERSION` already discards drafts from an incompatible build, but this
   * is the cheaper guard for the ordinary case: a field ADDED since the draft was written is
   * absent from the saved record, and spreading the saved record alone would hand `undefined` to
   * a controlled `<input value>` — React then switches it to an uncontrolled input and warns.
   */
  const hydrate = useCallback((): T => {
    const saved = readStep<Record<string, unknown>>(key)
    if (!saved) return empty
    const next = { ...empty }
    for (const k of Object.keys(empty) as (keyof T)[]) {
      const v = saved[k as string]
      if (typeof v === 'string') next[k] = v as T[keyof T]
    }
    return next
    /* `empty` is a module-level constant at every call site in this flow, but it is spread
       rather than held by reference, so an inline literal would only cost an extra hydrate. */
  }, [key, empty])

  const [values, setValues] = useState<T>(hydrate)

  /* The reset half of "เริ่มกรอกฟอร์มใหม่". `epoch` only changes on `clearDraft()`, so this is
     not a re-hydrate on every render — it is the one moment the store goes out from under a
     mounted component. Skipped on mount, where `useState` has already hydrated. */
  const first = useRef(true)
  useEffect(() => {
    if (first.current) {
      first.current = false
      return
    }
    setValues(hydrate())
  }, [epoch, hydrate])

  const write = useCallback(
    (next: T) => {
      setValues(next)
      writeStep(key, next)
    },
    [key],
  )

  return {
    values,
    bind: (field: keyof T) => ({
      value: values[field],
      onChange: (next: string) => write({ ...values, [field]: next }),
    }),
    clear: () => write(empty),
    /** Writes the whole record at once — the setter `useFieldGroup` does not expose. */
    set: write,
  }
}

/**
 * A persisted `useState` for one answer: the team-size radio, a consent's ยอมรับ/ไม่ยอมรับ, the
 * agreement tick.
 *
 * Only JSON primitives — string, number, boolean, null. An array or object handed here would
 * round-trip through `writeValue`'s coercion and come back as `"[object Object]"`, so the type
 * parameter is constrained rather than left open. `TermsStep`'s `answers` is an ARRAY of
 * choices; it wires one call per row (`terms.consent.0`, `terms.consent.1`) rather than
 * persisting the array, which also means adding a consent cannot shift the saved answers.
 */
export function useDraftValue<T extends string | number | boolean | null>(key: string, initial: T) {
  const epoch = useEpoch()

  const hydrate = useCallback((): T => {
    const saved = readStep<T>(key)
    return saved === null || saved === undefined ? initial : saved
  }, [key, initial])

  const [value, setValue] = useState<T>(hydrate)

  const first = useRef(true)
  useEffect(() => {
    if (first.current) {
      first.current = false
      return
    }
    setValue(hydrate())
  }, [epoch, hydrate])

  const write = useCallback(
    (next: T) => {
      setValue(next)
      writeValue(key, next)
    },
    [key],
  )

  return [value, write] as const
}

/**
 * The upload slot's memory — a NAME, and nothing else.
 *
 * This hook deliberately cannot restore a file, and the type says so: it returns a `FileNote`,
 * never a `File`. `useFileSlot` keeps its own `useState<File | null>(null)` and that state is
 * correct on a fresh mount — the slot IS empty, its required-gate SHOULD still fail, and the
 * user does have to pick the document again. Browsers give no way to rehydrate a file input,
 * and a slot that claimed otherwise would let someone submit believing a scan was attached.
 *
 * So the note exists only to be SHOWN: "แนบไว้ก่อนหน้านี้: <name> — กรุณาแนบอีกครั้ง". The caller
 * renders it when `note` is set and `slot.file` is null, and stops rendering it the moment a new
 * file is picked. See `DraftFileHint` in components/RegisterDraftHints.tsx for the ready-made
 * element, so no step has to write that sentence itself.
 *
 * @param key  stable identity, e.g. `'team.photo'`, `'entrant.1.doc.0'`
 * @param file the slot's CURRENT `File | null`, so the note tracks what is actually attached
 */
export function useDraftFileNote(key: string, file: File | null) {
  const epoch = useEpoch()
  const [note, setNote] = useState<FileNote | null>(() => readFileNote(key))

  useEffect(() => {
    setNote(readFileNote(key))
  }, [key, epoch])

  /*
   * Mirrors the live slot into the store. Runs on `file`, so picking writes the note, ล้าง
   * removes it, and a rejected oversize file (which leaves `slot.file` null) never creates one.
   *
   * It does NOT write on mount-with-null, which would be the obvious bug: every restored step
   * mounts with `file === null` and would immediately erase the note it exists to display. The
   * `first` guard skips exactly that pass, so a note only ever changes in response to the user
   * touching the slot.
   */
  const first = useRef(true)
  useEffect(() => {
    if (first.current) {
      first.current = false
      if (!file) return
    }
    noteFile(key, file)
    setNote(file ? { name: file.name, size: file.size } : null)
  }, [key, file])

  /** The note to show, or `null` — already accounts for a file being attached right now. */
  return file ? null : note
}

/**
 * Records that this step was opened, so "กรอกฟอร์มต่อ" knows where to return to.
 *
 * Takes the same `step` number `WizardShell` is already given, so the call site is
 * `useReachedStep(step)` beside the existing `step={n}` prop and there is no second source of
 * truth about ordering. Monotonic in the store — walking back does not lower it.
 */
export function useReachedStep(step: number) {
  useEffect(() => {
    markReached(step)
  }, [step])
}

/**
 * Forgets the draft on a successful submission.
 *
 * Exported as a plain function rather than a hook because its call site is inside an `onClick`
 * (WizardShell.tsx's `SubmitButton`), not a render.
 */
export const clearRegisterDraft = clearDraft
