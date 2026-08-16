import type { FileNote } from '../registerDraft'

/**
 * "You had attached this; attach it again." — the sentence a restored upload slot needs.
 *
 * It lives here, as one element, so that the six document rows and the team photo cannot drift
 * into six slightly different phrasings of the same fact, and so the register steps import a
 * component rather than compose a string.
 *
 * ------------------------------------------------------------------ why this has to be said
 *
 * A file input cannot be rehydrated by any browser — `useFileSlot` mounts with
 * `useState<File | null>(null)` and there is no API that would let it mount otherwise. The
 * draft therefore keeps a NAME and a SIZE and nothing more (see registerDraft.ts), which leaves
 * a restored step in a state that is easy to render dishonestly: showing the remembered filename
 * where the slot normally shows `slot.file.name` would make the row look identical to an
 * attached one, and someone would submit an ID-card row that has no ID card behind it.
 *
 * So this reads as a REMINDER and never as a state. It is muted rather than styled like the
 * attached-file caption, it says กรุณาแนบอีกครั้ง in the same breath as the name, and the slot
 * behind it stays empty and stays failing its own required-gate. The user is told what they had,
 * not told they still have it.
 *
 * The caller renders nothing when `note` is null — which `useDraftFileNote` already returns the
 * moment a real file is picked, so the hint disappears on the same render the thumbnail appears.
 */
export default function DraftFileHint({ note }: { note: FileNote | null }) {
  if (!note) return null

  return (
    /*
     * `--t-12-16` is the flow's smallest rank — the same one the upload hints and field error
     * notes already use (form/registerType.tsx), so this sits at the size of the caption it
     * appears beside rather than introducing a rank of its own.
     *
     * `break-all` on the filename only: a document picked off a phone can be
     * `Screenshot_2569-08-16_at_14.03.22.png`, which is one unbreakable token wide enough to
     * push a 320px layout sideways. The surrounding Thai wraps normally.
     */
    <p className="text-[color:#c0563e]" style={{ fontSize: 'var(--t-12-16)' }}>
      <span className="break-all">แนบไว้ก่อนหน้านี้: {note.name}</span> — กรุณาแนบไฟล์อีกครั้ง
    </p>
  )
}
