import {
  createContext,
  createElement,
  useContext,
  useId,
  useRef,
  useLayoutEffect,
  useMemo,
  useState,
  type MouseEvent,
  type ReactNode,
} from 'react'
import { useNavigate, type createBrowserRouter, type Location, type To } from 'react-router-dom'

/**
 * ------------------------------------------------------------------ the step gate
 *
 * Every `*` on `2053:217` / `2053:318` / `2053:498` / `2053:694` and both consent rows on
 * `2053:108` were decoration: ถัดไป is a `<Link>`, so a user could walk the entire wizard
 * without accepting the agreement, answering a required consent, or typing a single
 * character. This is the plumbing that makes those asterisks mean something.
 *
 * The pill STAYS PRESSABLE and the press is what runs the check. A disabled control that has
 * gone grey for reasons the reader has to guess at is the worst of both worlds — it refuses
 * the task and declines to say why — and a message parked in the action bar is no better,
 * because it names a problem at the opposite end of a form the user then has to go hunting
 * through. So: press ถัดไป, and if something is missing the wizard takes you TO it. The field
 * itself goes red, says what it wants, and takes focus.
 *
 * It is a REGISTRY rather than a validation library, because the wizard has no submit and no
 * schema — each control already owns its own value (`useFieldGroup`, `useFileSlot`, the terms
 * step's checkbox), and lifting all of that into a form library to gate one button would be a
 * rewrite. Each control declares, in one line, what it still needs and hands over a way to
 * find its DOM node.
 *
 * The registry lives in a REF, not in state. `set` runs on every keystroke of every field on
 * the step, and holding that in state would re-render all ~14 controls on each one. The only
 * piece that has to be reactive is which single field is currently flagged, so that is the
 * only piece that is state.
 */
type GateEntry = { reason: string | null; el: () => HTMLElement | null }

type GateApi = {
  set: (id: string, entry: GateEntry) => void
  drop: (id: string) => void
  /** Runs the pass. Returns true when the step may advance. */
  validate: () => boolean
}

const GateApiCtx = createContext<GateApi | null>(null)
/** the id of the one field currently showing an error, or null */
const GateFlagCtx = createContext<string | null>(null)

export function GateProvider({ children }: { children: ReactNode }) {
  const fields = useRef(new Map<string, GateEntry>())
  const [flagged, setFlagged] = useState<string | null>(null)

  const api = useMemo<GateApi>(
    () => ({
      set: (id, entry) => {
        fields.current.set(id, entry)
        /* "the error state must clear when the field becomes valid" — cleared centrally as
           well as at the call site, so a flag can never outlive the problem that raised it */
        if (entry.reason === null) setFlagged((f) => (f === id ? null : f))
      },
      drop: (id) => {
        fields.current.delete(id)
        setFlagged((f) => (f === id ? null : f))
      },

      validate: () => {
        /*
         * DOCUMENT ORDER, resolved from the live DOM rather than from registration order.
         * Effects fire in tree order on the first mount, so the Map usually happens to be in
         * page order — but a field that re-registers (its reason changed) moves to the end of
         * a Map, and a conditional control like the entrant's date of birth mounts later than
         * the fields below it. `compareDocumentPosition` is the only reading of "first" that
         * survives both, and it is what the brief asks for: the FIRST incomplete field, not
         * the last and not all of them.
         */
        const bad: { id: string; el: HTMLElement }[] = []
        for (const [id, entry] of fields.current) {
          const el = entry.el()
          if (entry.reason !== null && el) bad.push({ id, el })
        }
        if (bad.length === 0) {
          setFlagged(null)
          return true
        }
        bad.sort((a, b) =>
          a.el.compareDocumentPosition(b.el) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1,
        )

        const first = bad[0]
        setFlagged(first.id)

        /*
         * Deferred by a task so the jump happens AFTER React has painted the error. The
         * field's message element does not exist until `flagged` re-renders it, and focusing
         * before that would point `aria-describedby` at an id that is not in the document yet
         * — the screen reader would announce the field and none of the reason. By the time a
         * zero-delay task runs, the state flush from this event handler has committed.
         */
        window.setTimeout(() => {
          const el = fields.current.get(first.id)?.el()
          if (!el) return
          const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
          /* `block: 'center'` rather than `nearest`: the wizard body is now a scrollport with
             an opaque action bar pinned over its bottom edge, and `nearest` is happy to park a
             field underneath that bar. `behavior` respects reduced motion, as asked. */
          el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' })
          /* the scroll above is the one that positions it — a focus that scrolls too would
             fight it, and in Chrome would win, landing on `nearest` */
          el.focus({ preventScroll: true })
        }, 0)

        return false
      },
    }),
    [],
  )

  return createElement(
    GateApiCtx.Provider,
    { value: api },
    createElement(GateFlagCtx.Provider, { value: flagged }, children),
  )
}

/**
 * One control's claim on the step, and everything it needs to render a refusal.
 *
 * `reason` is the sentence to show when this control is the one holding the step up, and
 * `null` once it is satisfied. Spread the returned `ref` onto the focusable element, put
 * `invalid` into its styling and `aria-invalid`, and render `message` in an element carrying
 * `messageId` — which the control then names in `aria-describedby`. A red border on its own
 * is invisible to a screen reader; the pair is what makes the state announceable.
 *
 * Outside a `GateProvider` — the same controls are used off the wizard — every field of the
 * result is inert, so nothing has to know whether it is being gated.
 */
export function useGateField<T extends HTMLElement>(reason: string | null) {
  const id = useId()
  const ref = useRef<T | null>(null)
  const api = useContext(GateApiCtx)
  const flagged = useContext(GateFlagCtx) === id

  /*
   * `useLayoutEffect`, because `validate()` reads this registry synchronously from a click.
   * With a passive effect, a field whose value changed in the same tick as the press would
   * still be advertising its previous reason. There is no SSR here for the usual warning.
   */
  useLayoutEffect(() => {
    api?.set(id, { reason, el: () => ref.current })
  }, [api, id, reason])

  useLayoutEffect(() => () => api?.drop(id), [api, id])

  /* a flag only survives while the problem does — belt and braces with `set` above, and the
     half that acts immediately on re-render rather than one state flush later */
  const invalid = flagged && reason !== null

  return {
    ref,
    invalid,
    messageId: `${id}-gate`,
    message: invalid ? reason : null,
  }
}

/** What the two forward pills call on press. Returns true when the step may advance. */
export function useGateValidate(): () => boolean {
  const api = useContext(GateApiCtx)
  return api ? api.validate : ALWAYS_VALID
}

const ALWAYS_VALID = () => true

/**
 * Direction and capability plumbing for the auth-flow view transitions.
 *
 * The View Transitions API has no notion of where the user came from — one navigation
 * looks like any other — so the shape of each hop has to be published to CSS out of
 * band. `markAuthNav` stamps `data-auth-nav` on the root element, which the
 * `:root[data-auth-nav='…']` rules in styles/auth-motion.css read to pick that hop's
 * choreography.
 *
 * There is exactly one writer: `trackAuthNav`, which is subscribed to the router itself
 * (see App.tsx). Subscribers are called synchronously from the router's `updateState`,
 * which is two React effect passes before `<RouterProvider>` reaches
 * `document.startViewTransition` — so the flag is always in place before the transition
 * that reads it starts, whether the navigation came from a link, a button, or the
 * browser's own back button. Nothing has to clean it up, since the attribute only ever
 * selects pseudo-elements that exist mid-transition.
 */

/**
 * The hops the flow can make, and their reverses. Each one changes what should visibly
 * carry over:
 *
 *  - `gate`    sign-in → the registration gate: the colour blocks morph, the plate arrives
 *  - `enter`   the gate → the first wizard step: colour sinks away, the pasta spills in
 *  - `forward` step → step
 *  - `submit`  the last step → the success or error screen: pasta leaves, colour returns
 *  - `leave`   out of the flow, with nothing left to carry — a plain crossfade
 *
 * …and `back`, `gate-back`, `enter-back`, `submit-back`, which are those four run the
 * other way. Every forward hop has a reverse, because every one of them is reachable by
 * the browser's back button.
 */
export type AuthNav =
  | 'gate'
  | 'gate-back'
  | 'enter'
  | 'enter-back'
  | 'forward'
  | 'back'
  | 'submit'
  | 'submit-back'
  | 'leave'

/**
 * Popping a history entry undoes the hop that created it, so the direction of a back
 * press is not a property of where the user is going — it is the inverse of how they got
 * where they are. That is why each entry records its own hop (in `location.state`) and
 * why this table exists.
 */
const REVERSE: Record<AuthNav, AuthNav> = {
  gate: 'gate-back',
  'gate-back': 'gate',
  enter: 'enter-back',
  'enter-back': 'enter',
  forward: 'back',
  back: 'forward',
  submit: 'submit-back',
  'submit-back': 'submit',
  leave: 'leave',
}

function markAuthNav(kind: AuthNav) {
  document.documentElement.dataset.authNav = kind
}

/* --------------------------------------------------------- the history log ---- */

type DataRouter = ReturnType<typeof createBrowserRouter>

/** What each history entry is: where it points, and which hop put the user there. */
type Entry = { path: string; kind: AuthNav | undefined }

const entries = new Map<number, Entry>()

/**
 * React Router stamps a monotonic `idx` on every history entry it creates. Comparing it
 * across a navigation is the only reliable way to tell a back press from a forward one —
 * `popstate` itself carries no direction.
 */
const historyIdx = () => (window.history.state as { idx?: number } | null)?.idx ?? 0

const kindOf = (location: Location) => (location.state as { authNav?: AuthNav } | null)?.authNav

/**
 * Keep `data-auth-nav` honest for every navigation the app can make, and keep a log of
 * what each history entry is so a back *button* can pop rather than push.
 *
 * Called once, at module scope, on the router returned by `createBrowserRouter`. Being a
 * router subscriber rather than a `popstate` listener is what makes this work: a popstate
 * listener runs before React Router has even decided what the navigation is, and — more
 * to the point — the previous implementation deliberately refused to animate pops at all,
 * because under `<BrowserRouter>` there was no way to wrap one in a transition. The data
 * router does that itself, remembering which pathname pairs were crossed with
 * `viewTransition` and re-using the transition on the way back.
 */
export function trackAuthNav(router: DataRouter) {
  let prevIdx = historyIdx()
  entries.set(prevIdx, {
    path: router.state.location.pathname,
    kind: kindOf(router.state.location),
  })

  router.subscribe((state) => {
    const idx = historyIdx()
    const kind = kindOf(state.location)

    if (state.historyAction === 'POP') {
      /*
       * Going back plays the reverse of the hop being undone, which is recorded on the
       * entry being *left*, not the one being arrived at. Going forward again through the
       * same entries replays the hop each of them recorded.
       */
      const undoing = entries.get(prevIdx)?.kind
      markAuthNav(idx < prevIdx ? REVERSE[undoing ?? 'leave'] : (kind ?? 'leave'))
    } else {
      markAuthNav(kind ?? 'leave')
      // a push discards whatever was ahead of it, so the log has to discard it too
      for (const key of [...entries.keys()]) if (key > idx) entries.delete(key)
    }

    entries.set(idx, { path: state.location.pathname, kind })
    prevIdx = idx
  })
}

/**
 * Whether the entry immediately behind the current one is exactly `path` — i.e. whether
 * going there is a pop rather than a fresh visit. Unknown after a reload, when the log is
 * empty but `idx` is not, and the honest answer there is "no": pushing is always correct,
 * it just grows the stack.
 */
function previousEntryIs(path: string) {
  return entries.get(historyIdx() - 1)?.path === path
}

/* ------------------------------------------------------------------ links ---- */

/**
 * Props for a link that moves forward through the flow.
 *
 * `viewTransition` is the data router's own option, and under `<RouterProvider>` it
 * genuinely calls `document.startViewTransition` — under `<BrowserRouter>` it was
 * accepted and silently discarded, which is why this used to be a hand-rolled click
 * interceptor. Letting the router own the transition is not a tidying-up: it is what
 * registers the pathname pair so that *popping* this entry later animates too.
 *
 * `state` records the hop on the history entry, which is what `trackAuthNav` reads back
 * to reverse it.
 */
export function authLink(to: To, kind: AuthNav) {
  return { to, viewTransition: true, state: { authNav: kind } }
}

/** Imperative form, for the controls in this flow that are buttons rather than links. */
export function useAuthNavigate() {
  const navigate = useNavigate()
  return (to: To, kind: AuthNav) => navigate(to, { viewTransition: true, state: { authNav: kind } })
}

/**
 * Props for a link that undoes a hop — the wizard's "ย้อนกลับ" and the error screen's
 * "ลองอีกครั้ง".
 *
 * These used to push the previous step as a brand-new entry, which is the bug behind
 * "กดกลับแล้วยังไม่กลับไปหน้าก่อนหน้า": walking team → advisor → ย้อนกลับ left three
 * entries deep at team, so the browser's own back button went *forward* to advisor. When
 * the entry behind us already is the destination, this goes there by popping it, which
 * keeps the stack the length the user thinks it is and hands the scroll position back.
 *
 * It stays a real `<a href>` all the same — the guard clauses hand cmd/middle clicks back
 * to the browser so they keep opening tabs, and if the log cannot vouch for the previous
 * entry the click falls through to the `<Link>`, which pushes `to` flagged with the same
 * reverse hop. Either way the choreography is identical; only the stack differs.
 */
export function useAuthBackLink() {
  const navigate = useNavigate()

  return (to: string, kind: AuthNav) => ({
    ...authLink(to, kind),
    onClick(event: MouseEvent<HTMLAnchorElement>) {
      if (event.defaultPrevented) return
      if (event.button !== 0) return
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
      if (!previousEntryIs(to)) return
      event.preventDefault()
      navigate(-1)
    },
  })
}

/* -------------------------------------------------------------- entrances ---- */

/**
 * Whether this mount should play its own arrival animation, or leave the arrival to a
 * view transition that is already running.
 *
 * The registration sheet has to spring up whenever the user arrives at it. Arriving
 * *through* the sign-in morph, that spring belongs to `::view-transition-new(auth-sheet)`
 * — the snapshot is what travels. But a direct load, a reload, or any navigation the
 * router did not wrap in a transition starts no transition at all, and there the sheet
 * simply appeared, which is what "มันยังไม่เด้งมา" is about. So the element gets an
 * animation of its own, and this is the test that stops the two ever running together and
 * springing it twice.
 *
 * Read once, at mount, and deliberately during render: with `viewTransition` the router
 * commits the new route inside the transition's update callback, so `:active-view-transition`
 * is the live answer to "did something else already animate my arrival". `try` because the
 * pseudo-class is newer than the API in some engines, and an unknown selector throws in
 * `matches`; where it is missing there are no transitions to collide with either.
 */
export function useOwnArrival() {
  return !useState(() => {
    try {
      return document.documentElement.matches(':active-view-transition')
    } catch {
      return false
    }
  })[0]
}
