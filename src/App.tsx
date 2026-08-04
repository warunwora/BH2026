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
import NotFound from './pages/NotFound'
import { trackAuthNav } from './components/form/wizardNav'

/**
 * The three routes that share `SiteLayout`, and so share the nav and footer DOM.
 *
 * Kept beside the route table on purpose — it is the same fact stated twice, and the
 * `<Route>` elements below are the copy that must not drift.
 */
const MARKETING = new Set(['/', '/guide', '/hall-of-fame'])

/**
 * Publishes two facts about the navigation in flight, on `<html>`, for CSS to read.
 *
 * `data-site-nav="marketing"` — this hop starts and ends on a marketing route, i.e. the nav
 * and the footer are the same elements on both sides. Only then does micro-motion.css name
 * them and re-time `::view-transition-*(root)`; every rule there is gated on this attribute
 * so it cannot collide with auth-motion.css, which owns the same pseudo-elements for the
 * sign-in morph and the wizard hops. The two rule sets are mutually exclusive by
 * construction rather than by specificity.
 *
 * `data-fragment-nav` — this hop carries a URL fragment, so the scroll it is about to do is
 * a jump to a section and should be smooth. Without it, `scroll-behavior` stays instant and
 * `<ScrollRestoration>`'s reset-to-top is instant, which is what stops a route change from
 * flying the whole page up and burning every scroll reveal on the way (see index.css).
 * `:target` cannot answer this: React Router navigates with `history.pushState`, which does
 * not re-run the scroll-to-fragment steps and so never sets a target element.
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

  r.subscribe((state) => {
    const next = state.location.pathname
    // `prev !== next`: a same-page fragment link is not a page transition, and snapshotting
    // one would cross-fade a page against itself while it scrolls.
    if (MARKETING.has(prev) && MARKETING.has(next) && prev !== next) {
      root.dataset.siteNav = 'marketing'
    } else {
      delete root.dataset.siteNav
    }

    if (state.location.hash) root.dataset.fragmentNav = ''
    else delete root.dataset.fragmentNav

    prev = next
  })
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
 */
function RootLayout() {
  return (
    <>
      <Outlet />
      <ScrollRestoration />
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

export default function App() {
  return <RouterProvider router={router} />
}
