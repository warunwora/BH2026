import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'

/*
 * No `<BrowserRouter>` here any more — App builds a `createBrowserRouter` and mounts it
 * through `<RouterProvider>`, which is what gives the app view-transitioned back
 * navigation and scroll restoration. See App.tsx.
 */
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
