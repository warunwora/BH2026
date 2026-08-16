import {
  createBrowserRouter,
  createRoutesFromElements,
  Outlet,
  Route,
  RouterProvider,
  ScrollRestoration,
} from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './pages/Home'
import About from './pages/About'
import PastEvents from './pages/PastEvents'
import SignIn from './pages/SignIn'
import Register from './pages/Register'
import TeamStep from './pages/register/TeamStep'
import AdvisorStep from './pages/register/AdvisorStep'
import EntrantStep from './pages/register/EntrantStep'
import TermsStep from './pages/register/TermsStep'
import SuccessStep from './pages/register/SuccessStep'
import ErrorStep from './pages/register/ErrorStep'
import MyTeam from './pages/MyTeam'
import ComingSoon from './pages/ComingSoon'
import NotFound from './pages/NotFound'
import { trackAuthNav } from './components/form/wizardNav'
import { ToastProvider } from './components/toast/ToastProvider'
import CookieConsent from './components/CookieConsent'
import ResumeRegistrationModal from './components/ResumeRegistrationModal'

/**
 * The three routes that share `SiteLayout`, and so share the nav and footer DOM.
 *
 * Kept beside the route table on purpose — it is the same fact stated twice, and the
 * `<Route>` elements below are the copy that must not drift.
 */
const MARKETING = new Set(['/', '/guide', '/hall-of-fame'])

/**
 * Which way a `POP` went. React Router reports `historyAction === 'POP'` for the forward
 * button as well as the back button, so the action alone cannot tell a retrace from an
 * advance — the only thing that can is React Router's own monotonic `idx`, which it stamps on
 * every history entry. Reading it here rather than importing form/wizardNav's copy keeps the
 * marketing hop independent of the auth flow's log: that module tracks the *kind* of each auth
 * hop as well, and this one needs nothing but the direction.
 */
const historyIdx = () => (window.history.state as { idx?: number } | null)?.idx ?? 0

/**
 * Publishes two facts about the navigation in flight, on `<html>`, for CSS to read.
 *
 * `data-site-nav="marketing"` / `"marketing-back"` — this hop starts and ends on a marketing
 * route, i.e. the nav and the footer are the same elements on both sides, and the suffix says
 * whether the user is advancing into the history stack or retracing it. Only then does
 * micro-motion.css name them and re-time `::view-transition-*(root)`; every rule there is
 * gated on this attribute (`^='marketing'` for the direction-agnostic half, the exact value
 * for the four `old`/`new` rules) so it cannot collide with auth-motion.css, which owns the
 * same pseudo-elements for the sign-in morph and the wizard hops. The two rule sets are
 * mutually exclusive by construction rather than by specificity.
 *
 * The direction exists because without it a back press replayed the FORWARD choreography —
 * the outgoing page rising out of the top, the incoming one arriving from below — so the one
 * navigation on the site that means "return" was animated as another departure. The wizard has
 * had a reverse for every hop since it was built (form/wizardNav.ts); the three marketing
 * pages were the hole in that. Same rule as there: going back plays the hop it undoes, in
 * reverse.
 *
 * `data-fragment-nav` — this hop is an in-page jump to a section, so the scroll it is about
 * to do should be smooth. Without it, `scroll-behavior` stays instant and
 * `<ScrollRestoration>`'s reset-to-top is instant, which is what stops a route change from
 * flying the whole page up and burning every scroll reveal on the way (see index.css).
 * `:target` cannot answer this: React Router navigates with `history.pushState`, which does
 * not re-run the scroll-to-fragment steps and so never sets a target element. Measured, a
 * fragment on the URL is NOT enough on its own — see `SMOOTH_HOP` below.
 *
 * A router subscriber, not an effect: subscribers are called synchronously from the
 * router's `updateState`, two React passes before `<RouterProvider>` reaches
 * `document.startViewTransition` and before `<ScrollRestoration>`'s effect scrolls. Both
 * attributes are therefore in place before anything that reads them runs. This is the same
 * seam `trackAuthNav` uses, and for the same reason.
 */
function trackSiteNav(r: typeof router) {
  const root = document.documentElement
  let prev = r.state.location.pathname
  let prevIdx = historyIdx()
  let cancelFragmentReset: (() => void) | undefined

  r.subscribe((state) => {
    const next = state.location.pathname
    const idx = historyIdx()
    // `prev !== next`: a same-page fragment link is not a page transition, and snapshotting
    // one would cross-fade a page against itself while it scrolls.
    if (MARKETING.has(prev) && MARKETING.has(next) && prev !== next) {
      // A pop is only a *retrace* when the index went down. Forward-button pops carry the
      // same `historyAction`, and they are advancing, so they get the forward choreography.
      const back = state.historyAction === 'POP' && idx < prevIdx
      root.dataset.siteNav = back ? 'marketing-back' : 'marketing'
    } else {
      delete root.dataset.siteNav
    }

    // a pending reset belongs to the hop before this one; this hop decides the flag itself
    cancelFragmentReset?.()
    cancelFragmentReset = undefined

    if (SMOOTH_HOP(state, prev)) {
      root.dataset.fragmentNav = ''
      cancelFragmentReset = resetFragmentNavWhenSettled()
    } else {
      delete root.dataset.fragmentNav
    }

    prev = next
    prevIdx = idx
  })
}

/**
 * Which hops actually want the smooth scroll — a fragment on the URL is not the question.
 *
 * Two of the three fragment cases were measured flying a page the user had never seen, from
 * an offset that belonged to the page they had just left, and burning the reveals they
 * passed over. Both are the exact regression index.css documents for the unconditional
 * `scroll-behavior: smooth`, reached through the fragment flag instead:
 *
 *  - a POP onto a fragment URL. `<ScrollRestoration>` prefers its saved offset over the
 *    fragment, so a back/forward press here is a *restore* and belongs instant, the way
 *    every browser restores. Measured: forward onto `/#calendar` (saved y 1242) flew
 *    2331 → 1242 over ~560ms. A restore that animates is not a restore.
 *  - a fragment link followed from ANOTHER route. Measured: `/#calendar` clicked from
 *    `/hall-of-fame` at y 2400 committed `/` at 2400 and flew up to 1242, and `/` landed
 *    with 11 of its 19 reveals already marked visible against the 8 a cold load of
 *    `/#calendar` shows at the same offset — three sections that can now never animate.
 *    Instant, it lands exactly as that cold load does.
 *
 * What is left is the case the smooth scroll was for: a fragment link whose pathname is the
 * one already on screen — the footer's `/#calendar` from `/`, `/guide#scope` from `/guide`.
 * There the page under the scroll is the page the user is looking at, and gliding to the
 * section is the whole point.
 */
const SMOOTH_HOP = (state: (typeof router)['state'], prev: string) =>
  !!state.location.hash && state.historyAction !== 'POP' && state.location.pathname === prev

/**
 * Takes the smooth back off once the jump has landed, and returns a canceller.
 *
 * The flag used to sit on `<html>` until the next navigation, which left the whole document
 * smooth-scrolling for as long as the user stayed on the page — and `scroll-behavior` is not
 * limited to the app's own scrolls. An `End` or `PageDown` press, a click in the scrollbar
 * gutter or any `scrollIntoView` would then animate too, so pressing `End` after following a
 * footer link flew the page and burned every reveal on the way: the documented bug again,
 * one navigation late.
 *
 * `scrollend` is the exact signal and fires for both endings — the programmatic glide
 * finishing, or the user grabbing the page mid-flight. The timer is the fallback for engines
 * without it (Safari before 18.2), and is deliberately longer than the longest jump on the
 * site (~1400ms, `/` top to `#prizes`) so it can never land mid-glide.
 */
function resetFragmentNavWhenSettled() {
  const done = () => {
    window.clearTimeout(timer)
    window.removeEventListener('scrollend', done)
    delete document.documentElement.dataset.fragmentNav
  }

  const timer = window.setTimeout(done, 3000)
  window.addEventListener('scrollend', done, { once: true })

  return () => {
    window.clearTimeout(timer)
    window.removeEventListener('scrollend', done)
  }
}

/** Marketing pages share the nav + footer chrome; the auth screens stand alone. */
function SiteLayout() {
  return (
    <div className="relative">
      <Navbar />
      <main>
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}

/**
 * Wraps every route so there is one place for document-wide navigation behaviour.
 *
 * `<ScrollRestoration>` is the whole reason it exists. It is a data-router-only component:
 * it calls `router.enableScrollRestoration`, which no `<BrowserRouter>` has, so before the
 * migration below there was nothing in the app restoring scroll and nothing resetting it
 * either. Both halves were visibly broken — a back press out of a long entrant step landed
 * at whatever offset the *next* step had been left at, and a forward press kept the old
 * offset instead of starting the new step at its top.
 *
 * The browser's native `scrollRestoration` cannot cover for it here. It restores after the
 * pop, against whatever the document height happens to be at that instant, and in a
 * client-rendered app that is the *outgoing* screen's height; the router restores from its
 * own per-entry record, inside the same commit that swaps the screen.
 *
 * ------------------------------------------------------------------ what it does, measured
 *
 * No `getKey`, on purpose. The default key is `location.key`, which is per *history entry* —
 * the only thing a back press can be keyed to. `getKey={l => l.pathname}` is the tempting
 * mistake: it would collapse every visit to `/` onto one saved offset, so arriving fresh
 * from a link would drop the user at wherever they happened to have left the page before.
 *
 * The restore itself needs no help settling, which is the other tempting fix. It runs in a
 * layout effect on the sibling *after* `<Outlet/>`, so it fires once the incoming page's own
 * DOM is committed and laid out, and it lands on the exact pixel:
 *
 *   / at y 4704 → /guide → back        4704, first sample after the pop, height 5604
 *   / at y 3600 → /signin → back       3600, out of a 1024-tall screen back into a 5604 one
 *   402: / at y 4244 → hof → back      4244 (no `min-h` floor applies below 1440)
 *   team step at y 126 → advisor → ย้อนกลับ    126, and the pop keeps the stack at idx 1
 *   / at y 1500 → /guide → RELOAD → back      1500, out of sessionStorage
 *
 * There is no window where the document is shorter than the restore target: every height on
 * this site is `calc()` on `--fl`, and the images are absolutely positioned or `object-cover`
 * inside a box CSS already sized, so nothing loading late can move a page's height. The
 * reveals cannot either — they animate `opacity` and `translateY`, and a transform does not
 * affect layout. The one thing that could is the Google webfont on a first cold visit, and a
 * first visit has nothing saved to restore.
 */
/**
 * Both consent surfaces are mounted HERE, beside `<ScrollRestoration>`, rather than inside a
 * page — and for the same two reasons that put `ToastProvider` above the router.
 *
 * They have to outlive a route change. `ResumeRegistrationModal` (Figma `2074:3241`) navigates
 * as part of answering it: "กรอกฟอร์มต่อ" sends the user to the furthest step they reached, and a
 * dialogue mounted inside the step it navigated away from would unmount itself mid-exit and
 * delete its own closing animation. It also needs to see EVERY hop to know when the user is
 * *entering* the flow rather than moving inside it, which only a component above the route tree
 * can do. `CookieConsent` (Figma `2074:3200`) is the simpler case of the same thing: it is a
 * site-wide notice, so it must not be torn down and rebuilt — replaying its 400ms entrance —
 * every time the user opens another page.
 *
 * Both portal to `<body>`, so sitting in the layout costs nothing: neither ever renders here.
 * That portal is also what keeps them clear of the `overflow-clip` on all four page roots and on
 * the wizard shell, any of which would otherwise crop a `position: fixed` surface raised from
 * inside it — the note `ToastProvider` already records about its own viewport.
 *
 * Inside `RootLayout` and not around `<RouterProvider>`, because the resume dialogue reads
 * `useLocation()` and calls `useNavigate()`; those hooks need a router above them.
 */
function RootLayout() {
  return (
    <>
      <Outlet />
      <ScrollRestoration />
      <CookieConsent />
      <ResumeRegistrationModal />
    </>
  )
}

/**
 * `createRoutesFromElements` takes the same JSX `<Route>` tree `<Routes>` did, so the route
 * table below is unchanged by the migration from `<BrowserRouter>` to the data router.
 *
 * The migration itself is what makes the auth flow's back button work. Three separate
 * defects had one cause — `<BrowserRouter>` has no `router` object, so
 * `navigate(to, { viewTransition: true })` was accepted and dropped, `<ScrollRestoration>`
 * could not be mounted at all, and a pop could never be wrapped in a transition because a
 * `popstate` listener only runs once React has already committed the new screen. The data
 * router owns the history entry: it records which pathname pairs were crossed with a view
 * transition and re-uses the transition when one of them is popped, which is the only way
 * a back press can animate.
 */
const router = createBrowserRouter(
  createRoutesFromElements(
    <Route element={<RootLayout />}>
      <Route element={<SiteLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/guide" element={<About />} />
        <Route path="/hall-of-fame" element={<PastEvents />} />
      </Route>
      <Route path="/signin" element={<SignIn />} />
      <Route path="/register" element={<Register />} />
      <Route path="/register/team" element={<TeamStep />} />
      <Route path="/register/advisor" element={<AdvisorStep />} />
      <Route path="/register/entrant/:index" element={<EntrantStep />} />
      <Route path="/register/terms" element={<TermsStep />} />
      <Route path="/register/success" element={<SuccessStep />} />
      <Route path="/register/error" element={<ErrorStep />} />
      <Route path="/my-team" element={<MyTeam />} />
      {/* Figma 1423:2621 — stands alone, without the nav/footer chrome, same as the 404 */}
      <Route path="/coming-soon" element={<ComingSoon />} />
      {/* Figma 708:1240 — the 404 page stands alone, without the nav/footer chrome */}
      <Route path="*" element={<NotFound />} />
    </Route>,
  ),
)

/*
 * The auth flow's transitions are direction-aware, and the browser's back button is the
 * one navigation no link can flag. Subscribing to the router — rather than to `popstate` —
 * is what lets the direction be published before the transition starts; see
 * form/wizardNav.ts.
 */
trackAuthNav(router)
trackSiteNav(router)

/**
 * `ToastProvider` wraps the router rather than sitting inside a layout, for two reasons.
 *
 * It has to OUTLIVE a route change. The upload toasts are raised from `useFileSlot`
 * (components/form/Field.tsx), and a transfer takes about 1.4s while a wizard hop unmounts the
 * step that started it — a provider mounted inside `RootLayout` would be torn down and
 * rebuilt on that hop, taking the queue and every pending clock with it. Above the router, the
 * stack survives the navigation and the slot's own unmount decides what to withdraw.
 *
 * And its viewport is portalled to `<body>`, so being outside the route tree costs nothing:
 * the cards were never going to render here anyway. That portal is also what keeps them clear
 * of the `overflow-clip` on all four page roots and on the wizard shell, any of which would
 * otherwise crop a `position: fixed` card raised from inside it.
 */
export default function App() {
  return (
    <ToastProvider>
      <RouterProvider router={router} />
    </ToastProvider>
  )
}
